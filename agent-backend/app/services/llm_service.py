"""
LLM Service - 统一的 LLM 调用接口
支持多个 LLM 提供商（Gemini, OpenAI）
"""
import json
from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
from loguru import logger

from ..config import settings
from ..models.intent import Intent


class LLMServiceError(Exception):
    """LLM 服务错误"""
    pass

# 抽象基类
class BaseLLMService(ABC):
    """LLM 服务基类"""
    
    @abstractmethod
    async def analyze_intent(self, query: str, context: Optional[Dict[str, Any]] = None) -> Intent:
        """分析用户意图"""
        pass
    
    @abstractmethod
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """生成文本"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """检查服务是否可用"""
        pass


# Gemini API 集成
class GeminiLLMService(BaseLLMService):
    """Google Gemini LLM 服务"""
    
    def __init__(self, api_key: str, model: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model_name = model
        self.model = None
        self._initialize()
    
    def _initialize(self):
        """初始化 Gemini 客户端"""
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            logger.info(f"Gemini LLM Service initialized with model: {self.model_name}")
        except ImportError:
            logger.error("google-generativeai package not installed. Run: pip install google-generativeai")
            raise LLMServiceError("Gemini SDK not installed")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            raise LLMServiceError(f"Gemini initialization failed: {e}")
    
    def is_available(self) -> bool:
        """检查服务是否可用"""
        return self.model is not None and bool(self.api_key)
    
    async def analyze_intent(self, query: str, context: Optional[Dict[str, Any]] = None) -> Intent:
        """
        使用 Gemini 分析用户意图
        
        Args:
            query: 用户输入的自然语言
            context: 上下文信息（可选）
        
        Returns:
            Intent: 解析后的意图对象
        """
        if not self.is_available():
            raise LLMServiceError("Gemini service not available")
        
        # 构建 prompt
        prompt = self._build_intent_prompt(query, context)
        
        try:
            # 调用 Gemini API
            response = await self._call_gemini(prompt, temperature=0.3, response_format="json")
            
            # 解析响应
            intent_data = self._parse_intent_response(response, query)
            
            return Intent(**intent_data)
        
        except Exception as e:
            logger.error(f"Intent analysis failed: {e}")
            raise LLMServiceError(f"Intent analysis failed: {e}")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """生成文本"""
        if not self.is_available():
            raise LLMServiceError("Gemini service not available")
        
        try:
            response = await self._call_gemini(prompt, **kwargs)
            return response
        except Exception as e:
            logger.error(f"Text generation failed: {e}")
            raise LLMServiceError(f"Text generation failed: {e}")
    
    async def _call_gemini(
        self, 
        prompt: str, 
        temperature: float = 0.7,
        max_tokens: int = 1000,
        response_format: str = "text"
    ) -> str:
        """
        调用 Gemini API
        
        Args:
            prompt: 提示词
            temperature: 温度参数 (0-1)
            max_tokens: 最大 token 数
            response_format: 响应格式 ("text" | "json")
        
        Returns:
            str: 模型响应
        """
        try:
            generation_config = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            }
            
            # 如果需要 JSON 格式，在 prompt 中明确要求
            if response_format == "json":
                prompt = f"{prompt}\n\nPlease respond with valid JSON only, no additional text."
            
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            return response.text.strip()
        
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            raise
    
    def _build_intent_prompt(self, query: str, context: Optional[Dict[str, Any]] = None) -> str:
        """构建意图分析的 prompt"""
        prompt = f"""You are an AI assistant that analyzes user queries about AI news and technology.

Available commands:
- /latest: Get the latest AI news articles
- /trending: Get trending AI topics
- /search: Search for specific topics or keywords
- /deepdive: Get in-depth analysis on a topic
- /help: Show help information

User query: "{query}"

Analyze the user's intent and extract:
1. Which command best matches their intent
2. Relevant parameters (count, keywords, topic, etc.)
3. Time range if mentioned (e.g., "last week", "today", "recent")na m
4. Importance level (high, medium, all)
5. Key entities (companies, technologies, people)

Respond with a JSON object in this exact format:
{{
    "command": "/latest or /trending or /search or /deepdive",
    "params": {{
        "count": 10,
        "keywords": ["keyword1", "keyword2"],
        "topic": "topic name",
        "time_range": "last 7 days"
    }},
    "confidence": 0.95,
    "keywords": ["extracted", "keywords"],
    "time_range": "last 7 days",
    "importance": "high",
    "entities": {{
        "companies": ["OpenAI", "Google"],
        "technologies": ["GPT-4", "Gemini"],
        "people": []
    }}
}}

Rules:
- confidence should be between 0.0 and 1.0
- Use /search for specific topic queries
- Use /latest for general "what's new" queries
- Use /trending for "hot topics" or "popular" queries
- Use /deepdive for "analysis" or "detailed" queries
- Extract all relevant keywords and entities
- If time range is not specified, omit it from params
"""
        
        if context:
            prompt += f"\n\nContext: {json.dumps(context, ensure_ascii=False)}"
        
        return prompt
    
    def _parse_intent_response(self, response: str, original_query: str) -> Dict[str, Any]:
        """解析 LLM 返回的意图数据"""
        try:
            # 尝试提取 JSON（可能包含在 markdown 代码块中）
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()
            
            data = json.loads(response)
            
            # 验证必需字段
            if "command" not in data:
                raise ValueError("Missing 'command' field")
            
            # 添加元数据
            data["source"] = "natural_language"
            data["original_input"] = original_query
            
            # 设置默认值
            if "params" not in data:
                data["params"] = {}
            if "confidence" not in data:
                data["confidence"] = 0.8
            if "keywords" not in data:
                data["keywords"] = []
            
            return data
        
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {response}")
            logger.error(f"JSON error: {e}")
            raise LLMServiceError(f"Invalid JSON response from LLM: {e}")
        except Exception as e:
            logger.error(f"Failed to parse intent response: {e}")
            raise LLMServiceError(f"Failed to parse intent: {e}")


# 工厂模式创建服务
class LLMServiceFactory:
    """LLM 服务工厂"""
    
    @staticmethod
    def create_service(provider: Optional[str] = None) -> Optional[BaseLLMService]:
        """
        创建 LLM 服务实例
        
        Args:
            provider: LLM 提供商 ("google" | "openai" | None)
        
        Returns:
            BaseLLMService 实例或 None
        """
        if provider is None:
            provider = settings.LLM_PROVIDER
        
        if provider == "none" or not provider:
            logger.info("LLM service disabled")
            return None
        
        try:
            if provider == "google":
                if not settings.GOOGLE_API_KEY:
                    logger.warning("GOOGLE_API_KEY not set, LLM service disabled")
                    return None
                
                return GeminiLLMService(
                    api_key=settings.GOOGLE_API_KEY,
                    model=settings.GEMINI_MODEL_FLASH
                )
            
            elif provider == "openai":
                # TODO: 实现 OpenAI 服务
                logger.warning("OpenAI service not implemented yet")
                return None
            
            else:
                logger.warning(f"Unknown LLM provider: {provider}")
                return None
        
        except Exception as e:
            logger.error(f"Failed to create LLM service: {e}")
            return None


# 全局 LLM 服务实例 - 全局单例管理
_llm_service: Optional[BaseLLMService] = None


def get_llm_service() -> Optional[BaseLLMService]:
    """获取全局 LLM 服务实例"""
    global _llm_service
    
    if _llm_service is None:
        _llm_service = LLMServiceFactory.create_service()
    
    return _llm_service
