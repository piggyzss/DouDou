"""
LLM Service - 统一的 LLM 调用接口
支持多个 LLM 提供商（Gemini, OpenAI）
"""
import json
from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
from loguru import logger

from ..config import settings


class LLMServiceError(Exception):
    """LLM 服务错误"""
    pass


# ========== 接口定义（接口隔离原则 ISP）==========

class Generatable(ABC):
    """文本生成接口 - 只包含生成相关的方法"""
    
    @abstractmethod
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """生成文本"""
        pass
    
    @abstractmethod
    async def generate_text_stream(self, prompt: str, **kwargs):
        """流式生成文本（异步生成器）"""
        pass
    
    @abstractmethod
    async def generate_text_stream(self, prompt: str, **kwargs):
        """流式生成文本（异步生成器）"""
        pass


class ToolSelectable(ABC):
    """工具选择接口 - 只包含工具选择相关的方法"""
    
    @abstractmethod
    async def select_tool(self, user_input: str, tools_description: str, context: Optional[Dict[str, Any]] = None):
        """选择合适的工具"""
        pass


class ServiceAvailability(ABC):
    """服务可用性接口 - 只包含可用性检查"""
    
    @abstractmethod
    def is_available(self) -> bool:
        """检查服务是否可用"""
        pass


# ========== 组合接口（方便使用）==========

class BaseLLMService(Generatable, ToolSelectable, ServiceAvailability):
    """
    LLM 服务基类 - 组合多个小接口
    
    设计说明：
    - 这是一个便利类，组合了四个小接口
    - 实际使用时应该依赖具体的小接口，而不是这个大接口
    - 例如：AgentExecutor 只依赖 ToolSelectable
    
    符合原则：
    - ISP: 使用者可以只依赖需要的小接口
    - SRP: 实现类的职责是"封装 LLM API"
    """
    pass


# ========== Gemini API 集成 ==========
class GeminiLLMService(BaseLLMService):
    """
    Google Gemini LLM 服务
    
    实现了三个接口：
    - Generatable: 文本生成
    - ToolSelectable: 工具选择
    - ServiceAvailability: 可用性检查
    
    单一职责：封装 Gemini API 的调用
    """
    
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
    
    async def generate_text_stream(self, prompt: str, **kwargs):
        """
        流式生成文本（异步生成器）
        
        Args:
            prompt: 提示词
            **kwargs: 其他参数（temperature, max_tokens等）
        
        Yields:
            str: 文本块
        """
        if not self.is_available():
            raise LLMServiceError("Gemini service not available")
        
        try:
            async for chunk in self._call_gemini_stream(prompt, **kwargs):
                yield chunk
        except Exception as e:
            logger.error(f"Streaming text generation failed: {e}")
            raise LLMServiceError(f"Streaming text generation failed: {e}")
    
    async def generate_text_stream(self, prompt: str, **kwargs):
        """
        流式生成文本（异步生成器）
        
        Args:
            prompt: 提示词
            **kwargs: 其他参数（temperature, max_tokens等）
        
        Yields:
            str: 文本块
        """
        if not self.is_available():
            raise LLMServiceError("Gemini service not available")
        
        try:
            async for chunk in self._call_gemini_stream(prompt, **kwargs):
                yield chunk
        except Exception as e:
            logger.error(f"Streaming text generation failed: {e}")
            raise LLMServiceError(f"Streaming text generation failed: {e}")
    
    async def select_tool(self, user_input: str, tools_description: str, context: Optional[Dict[str, Any]] = None):
        """
        使用 Gemini 选择合适的工具
        
        Args:
            user_input: 用户输入
            tools_description: 工具描述（由 ToolRegistry.format_for_llm() 生成）
            context: 上下文信息（可选）
        
        Returns:
            ToolCall 对象
        """
        if not self.is_available():
            raise LLMServiceError("Gemini service not available")
        
        # 导入 ToolCall（避免循环导入）
        from ..models.tool import ToolCall
        
        # 构建 prompt
        prompt = self._build_tool_selection_prompt(user_input, tools_description, context)
        
        try:
            # 调用 Gemini API
            response = await self._call_gemini(prompt, temperature=0.3, response_format="json")
            
            # 解析响应
            tool_call_data = self._parse_tool_selection_response(response, user_input)
            
            return ToolCall(**tool_call_data)
        
        except Exception as e:
            logger.error(f"Tool selection failed: {e}")
            raise LLMServiceError(f"Tool selection failed: {e}")
    
    async def _call_gemini(
        self, 
        prompt: str, 
        temperature: float = 0.7,
        max_tokens: int = 1000,
        response_format: str = "text",
        max_retries: int = 3,
        timeout: float = 30.0  # 30 秒超时
    ) -> str:
        """
        调用 Gemini API（带重试机制和超时）
        
        Args:
            prompt: 提示词
            temperature: 温度参数 (0-1)
            max_tokens: 最大 token 数
            response_format: 响应格式 ("text" | "json")
            max_retries: 最大重试次数
            timeout: 超时时间（秒）
        
        Returns:
            str: 模型响应
        """
        import asyncio
        
        last_error = None
        
        for attempt in range(max_retries):
            try:
                generation_config = {
                    "temperature": temperature,
                    "max_output_tokens": max_tokens,
                }
                
                # 如果需要 JSON 格式，在 prompt 中明确要求
                if response_format == "json":
                    prompt_with_format = f"{prompt}\n\nPlease respond with valid JSON only, no additional text."
                else:
                    prompt_with_format = prompt
                
                # 使用 asyncio.wait_for 添加超时
                response = await asyncio.wait_for(
                    asyncio.to_thread(
                        self.model.generate_content,
                        prompt_with_format,
                        generation_config=generation_config
                    ),
                    timeout=timeout
                )
                
                return response.text.strip()
            
            except asyncio.TimeoutError:
                last_error = LLMServiceError(f"Gemini API call timed out after {timeout}s")
                logger.warning(f"Gemini API call timed out (attempt {attempt + 1}/{max_retries})")
                
                # 如果不是最后一次尝试，等待后重试
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2  # 指数退避：2s, 4s, 6s
                    logger.info(f"Retrying in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
            
            except Exception as e:
                last_error = e
                logger.warning(f"Gemini API call failed (attempt {attempt + 1}/{max_retries}): {e}")
                
                # 如果不是最后一次尝试，等待后重试
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2  # 指数退避：2s, 4s, 6s
                    logger.info(f"Retrying in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
        
        # 所有重试都失败
        logger.error(f"Gemini API call failed after {max_retries} attempts")
        raise last_error
    
    async def _call_gemini_stream(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        response_format: str = "text",
        max_retries: int = 3,
        timeout: float = 30.0
    ):
        """
        流式调用 Gemini API（带重试机制）
        
        Args:
            prompt: 提示词
            temperature: 温度参数 (0-1)
            max_tokens: 最大 token 数
            response_format: 响应格式 ("text" | "json")
            max_retries: 最大重试次数
            timeout: 超时时间（秒）
        
        Yields:
            str: 文本块
        """
        import asyncio
        
        last_error = None
        
        for attempt in range(max_retries):
            try:
                generation_config = {
                    "temperature": temperature,
                    "max_output_tokens": max_tokens,
                }
                
                # 如果需要 JSON 格式，在 prompt 中明确要求
                if response_format == "json":
                    prompt_with_format = f"{prompt}\n\nPlease respond with valid JSON only, no additional text."
                else:
                    prompt_with_format = prompt
                
                # 使用 stream=True 开启流式输出
                # 注意：不能使用 asyncio.to_thread，因为需要迭代生成器
                response_stream = self.model.generate_content(
                    prompt_with_format,
                    generation_config=generation_config,
                    stream=True  # 关键：开启流式输出
                )
                
                # 流式处理响应
                for chunk in response_stream:
                    if chunk.text:
                        yield chunk.text
                        # 添加延迟，让流式效果更明显
                        # 思考过程：50ms 延迟（更慢，让用户看清推理过程）
                        # 最终响应：30ms 延迟（稍快，但仍有打字机效果）
                        await asyncio.sleep(0.05)  # 50ms
                
                # 成功完成，退出重试循环
                return
            
            except asyncio.TimeoutError:
                last_error = LLMServiceError(f"Gemini API stream timed out after {timeout}s")
                logger.warning(f"Gemini API stream timed out (attempt {attempt + 1}/{max_retries})")
                
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2
                    logger.info(f"Retrying in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
            
            except Exception as e:
                last_error = e
                logger.warning(f"Gemini API stream failed (attempt {attempt + 1}/{max_retries}): {e}")
                
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2
                    logger.info(f"Retrying in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
        
        # 所有重试都失败
        logger.error(f"Gemini API stream failed after {max_retries} attempts")
        raise last_error
    
    async def _call_gemini_stream(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        response_format: str = "text",
        max_retries: int = 3,
        timeout: float = 30.0
    ):
        """
        流式调用 Gemini API（带重试机制）
        
        Args:
            prompt: 提示词
            temperature: 温度参数 (0-1)
            max_tokens: 最大 token 数
            response_format: 响应格式 ("text" | "json")
            max_retries: 最大重试次数
            timeout: 超时时间（秒）
        
        Yields:
            str: 文本块
        """
        import asyncio
        
        last_error = None
        
        for attempt in range(max_retries):
            try:
                generation_config = {
                    "temperature": temperature,
                    "max_output_tokens": max_tokens,
                }
                
                # 如果需要 JSON 格式，在 prompt 中明确要求
                if response_format == "json":
                    prompt_with_format = f"{prompt}\n\nPlease respond with valid JSON only, no additional text."
                else:
                    prompt_with_format = prompt
                
                # 使用 stream=True 开启流式输出
                # 注意：不能使用 asyncio.to_thread，因为需要迭代生成器
                response_stream = self.model.generate_content(
                    prompt_with_format,
                    generation_config=generation_config,
                    stream=True  # 关键：开启流式输出
                )
                
                # 流式处理响应
                for chunk in response_stream:
                    if chunk.text:
                        yield chunk.text
                        # 添加延迟，让流式效果更明显
                        # 思考过程：50ms 延迟（更慢，让用户看清推理过程）
                        # 最终响应：30ms 延迟（稍快，但仍有打字机效果）
                        await asyncio.sleep(0.05)  # 50ms
                
                # 成功完成，退出重试循环
                return
            
            except asyncio.TimeoutError:
                last_error = LLMServiceError(f"Gemini API stream timed out after {timeout}s")
                logger.warning(f"Gemini API stream timed out (attempt {attempt + 1}/{max_retries})")
                
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2
                    logger.info(f"Retrying in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
            
            except Exception as e:
                last_error = e
                logger.warning(f"Gemini API stream failed (attempt {attempt + 1}/{max_retries}): {e}")
                
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2
                    logger.info(f"Retrying in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
        
        # 所有重试都失败
        logger.error(f"Gemini API stream failed after {max_retries} attempts")
        raise last_error
    
    def _build_tool_selection_prompt(self, user_input: str, tools_description: str, context: Optional[Dict[str, Any]] = None) -> str:
        """构建工具选择的 prompt"""
        prompt = f"""You are an AI assistant that helps users by selecting the most appropriate tool for their request.

{tools_description}

User request: "{user_input}"

Analyze the user's request and select the most appropriate tool. Consider:
1. What is the user trying to accomplish?
2. Which tool best matches their intent?
3. What parameters does the tool need?
4. How confident are you in this selection?

Respond with a JSON object in this exact format:
{{
    "tool_name": "name_of_selected_tool",
    "parameters": {{
        "param1": "value1",
        "param2": "value2"
    }},
    "reasoning": "Brief explanation of why you chose this tool",
    "confidence": 0.95
}}

Rules:
- tool_name must exactly match one of the available tools
- parameters must match the tool's parameter schema
- confidence should be between 0.0 and 1.0
- reasoning should be concise (1-2 sentences)
- Only include parameters that are mentioned or can be inferred from the user's request
"""
        
        if context:
            prompt += f"\n\nContext: {json.dumps(context, ensure_ascii=False)}"
        
        return prompt
    
    def _parse_tool_selection_response(self, response: str, original_input: str) -> Dict[str, Any]:
        """解析 LLM 返回的工具选择数据"""
        try:
            # 提取 JSON
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
            if "tool_name" not in data:
                raise ValueError("Missing 'tool_name' field")
            
            # 添加元数据
            data["source"] = "llm"
            data["original_input"] = original_input
            
            # 设置默认值
            if "parameters" not in data:
                data["parameters"] = {}
            if "reasoning" not in data:
                data["reasoning"] = "No reasoning provided"
            if "confidence" not in data:
                data["confidence"] = 0.8
            
            return data
        
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {response}")
            logger.error(f"JSON error: {e}")
            raise LLMServiceError(f"Invalid JSON response from LLM: {e}")
        except Exception as e:
            logger.error(f"Failed to parse tool selection response: {e}")
            raise LLMServiceError(f"Failed to parse tool selection: {e}")


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
