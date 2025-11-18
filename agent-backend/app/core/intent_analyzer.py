"""
Intent Analyzer - 意图分析器
将所有输入（命令式/自然语言）转换为统一的 Intent 模型

设计原则：
- 依赖倒置原则（DIP）：依赖 Analyzable 接口，而非具体实现
- 接口隔离原则（ISP）：只依赖需要的 analyze_intent 方法
"""
from typing import Dict, Any, Optional, TYPE_CHECKING
from ..models.intent import Intent, InvalidCommandError
from ..core.plugin_manager import PluginManager

# 类型提示：只依赖 Analyzable 接口
if TYPE_CHECKING:
    from ..services.llm_service import Analyzable


class IntentAnalyzer:
    """
    意图分析器 - 将所有输入转换为 Intent
    
    依赖注入：
    - plugin_manager: 插件管理器
    - llm_service: 只依赖 Analyzable 接口（不是 BaseLLMService）
    
    符合 ISP：只依赖需要的 analyze_intent 方法
    """
    
    def __init__(self, plugin_manager: PluginManager, llm_service: Optional['Analyzable'] = None):
        self.plugin_manager = plugin_manager
        self.llm_service = llm_service  # 类型是 Analyzable，不是 BaseLLMService
    
    async def parse_input(self, user_input: str, context: Optional[Dict[str, Any]] = None) -> Intent:
        """
        统一入口：将任何输入转换为 Intent
        
        Args:
            user_input: 用户输入（命令或自然语言）
            context: 上下文信息（会话历史等）
        
        Returns:
            Intent: 统一的意图模型
        
        Raises:
            InvalidCommandError: 无效命令
        """
        if context is None:
            context = {}
        
        # 1. 命令式输入：直接解析
        if user_input.strip().startswith('/'):
            return self._parse_command(user_input)
        
        # 2. 自然语言：使用 LLM 转换（如果可用）
        if self.llm_service:
            return await self._parse_natural_language(user_input, context)
        else:
            # LLM 不可用时，尝试简单的关键词匹配
            return self._parse_keyword_matching(user_input)
    
    def _parse_command(self, command: str) -> Intent:
        """解析命令式输入"""
        parts = command.strip().split()
        cmd = parts[0]
        
        # 验证命令
        if not self.plugin_manager.is_command_valid(cmd):
            raise InvalidCommandError(f"Unknown command: {cmd}. Type /help for available commands.")
        
        # 解析参数
        params = self._parse_params(parts[1:], cmd)
        
        return Intent(
            command=cmd,
            params=params,
            source="command",
            confidence=1.0,
            original_input=command
        )
    
    def _parse_params(self, args: list, command: str) -> Dict[str, Any]:
        """解析命令参数"""
        params = {}
        
        if command == "/latest":
            # /latest [count]
            if args:
                try:
                    params["count"] = int(args[0])
                except (ValueError, IndexError):
                    params["count"] = 5
            else:
                params["count"] = 5
        
        elif command == "/trending":
            # /trending [category]
            if args:
                params["category"] = args[0]
        
        elif command == "/deepdive":
            # /deepdive <topic>
            if args:
                params["topic"] = " ".join(args)
            else:
                params["topic"] = "AI developments"
        
        elif command == "/search":
            # /search <keywords>
            if args:
                params["keywords"] = args
                params["count"] = 10
        
        elif command == "/help":
            # /help [command]
            if args:
                params["command"] = args[0]
        
        return params
    
    async def _parse_natural_language(self, query: str, context: Dict[str, Any]) -> Intent:
        """使用 LLM 解析自然语言"""
        # TODO: 实现 LLM 调用
        # 这里先返回一个基本的 Intent，后续会实现完整的 LLM 集成
        
        # 临时实现：使用简单的关键词匹配
        return self._parse_keyword_matching(query)
    
    def _parse_keyword_matching(self, query: str) -> Intent:
        """
        基于关键词匹配解析自然语言（降级方案）
        当 LLM 不可用时使用此方法
        """
        query_lower = query.lower()
        
        # 检测意图
        if any(keyword in query_lower for keyword in ["最新", "latest", "new", "recent"]):
            # 映射到 /latest
            count = 5
            # 尝试提取数字
            import re
            numbers = re.findall(r'\d+', query)
            if numbers:
                count = int(numbers[0])
            
            return Intent(
                command="/latest",
                params={"count": min(count, 20)},
                source="natural_language",
                confidence=0.7,
                original_input=query,
                keywords=self._extract_keywords(query)
            )
        
        elif any(keyword in query_lower for keyword in ["趋势", "热门", "trending", "hot", "popular"]):
            # 映射到 /trending
            return Intent(
                command="/trending",
                params={},
                source="natural_language",
                confidence=0.7,
                original_input=query,
                keywords=self._extract_keywords(query)
            )
        
        elif any(keyword in query_lower for keyword in ["深度", "分析", "deepdive", "analysis", "详细"]):
            # 映射到 /deepdive
            keywords = self._extract_keywords(query)
            topic = " ".join(keywords) if keywords else "AI developments"
            
            return Intent(
                command="/deepdive",
                params={"topic": topic},
                source="natural_language",
                confidence=0.7,
                original_input=query,
                keywords=keywords
            )
        
        else:
            # 默认映射到搜索
            keywords = self._extract_keywords(query)
            
            return Intent(
                command="/search" if keywords else "/latest",
                params={
                    "keywords": keywords,
                    "count": 10
                } if keywords else {"count": 5},
                source="natural_language",
                confidence=0.6,
                original_input=query,
                keywords=keywords
            )
    
    def _extract_keywords(self, text: str) -> list:
        """提取关键词（简单实现）"""
        # AI 相关关键词列表
        ai_keywords = [
            "openai", "gpt", "chatgpt", "anthropic", "claude",
            "google", "gemini", "deepmind", "meta", "llama",
            "microsoft", "copilot", "ai", "人工智能", "机器学习",
            "深度学习", "神经网络", "transformer", "llm", "大模型"
        ]
        
        text_lower = text.lower()
        found_keywords = []
        
        for keyword in ai_keywords:
            if keyword in text_lower:
                found_keywords.append(keyword)
        
        return found_keywords[:5]  # 最多返回 5 个关键词
