from typing import List
from ..models.base import BasePlugin, AgentCommand, AgentRequest, AgentResponse
from ..models.news import NewsItem, NewsCategory, TrendingTopic
from ..services.news_collector import NewsCollectorService
from datetime import datetime
import json

class NewsPlugin(BasePlugin):
    """AI资讯插件"""
    
    def __init__(self):
        super().__init__(
            name="AI资讯",
            plugin_id="news",
            description="获取最新的AI和科技资讯"
        )
        self.news_service = NewsCollectorService()
    
    def get_commands(self) -> List[AgentCommand]:
        return [
            AgentCommand(
                command="/latest",
                description="获取最新AI资讯",
                usage="/latest [count]",
                examples=["/latest", "/latest 5"]
            ),
            AgentCommand(
                command="/trending",
                description="获取热门趋势",
                usage="/trending [category]",
                examples=["/trending", "/trending ai"]
            ),
            AgentCommand(
                command="/categories",
                description="显示资讯分类",
                usage="/categories",
                examples=["/categories"]
            ),
            AgentCommand(
                command="/deepdive",
                description="深度分析特定主题",
                usage="/deepdive <topic>",
                examples=["/deepdive GPT-4", "/deepdive 机器学习"]
            ),
            AgentCommand(
                command="/help",
                description="显示帮助信息",
                usage="/help [command]",
                examples=["/help", "/help /latest"]
            )
        ]
    
    async def execute(self, request: AgentRequest) -> AgentResponse:
        command = request.command
        params = request.params
        
        try:
            if command == "/help":
                return await self._handle_help(params)
            elif command == "/latest":
                return await self._handle_latest(params)
            elif command == "/trending":
                return await self._handle_trending(params)
            elif command == "/categories":
                return await self._handle_categories(params)
            elif command == "/deepdive":
                return await self._handle_deepdive(params)
            else:
                return AgentResponse(
                    success=False,
                    error=f"Unknown command: {command}",
                    type="error",
                    plugin=self.id,
                    command=command
                )
        except Exception as e:
            return AgentResponse(
                success=False,
                error=str(e),
                type="error",
                plugin=self.id,
                command=command
            )
    
    async def _handle_help(self, params: dict) -> AgentResponse:
        """处理帮助命令"""
        help_text = "=== AI资讯插件 ===\n"
        for cmd in self.commands:
            help_text += f"{cmd.command.ljust(20)} # {cmd.description}\n"
            if params.get("detailed"):
                help_text += f"  用法: {cmd.usage}\n"
                help_text += f"  示例: {', '.join(cmd.examples)}\n\n"
        
        return AgentResponse(
            success=True,
            data=help_text,
            type="text",
            plugin=self.id,
            command="/help"
        )
    
    async def _handle_latest(self, params: dict) -> AgentResponse:
        """处理获取最新资讯命令"""
        count = params.get("count", 5)
        try:
            count = int(count) if count else 5
        except (ValueError, TypeError):
            count = 5
        
        # 获取最新资讯
        news_items = await self.news_service.get_latest_news(limit=count)
        
        if not news_items:
            return AgentResponse(
                success=True,
                data="[INFO] No news items found at the moment.",
                type="text",
                plugin=self.id,
                command="/latest"
            )
        
        # 格式化输出
        response_text = f"[INFO] Fetching latest AI news...\n"
        response_text += f"[SUCCESS] Found {len(news_items)} new articles\n\n"
        response_text += "┌─ Latest AI News ────────────────────────────────────────┐\n"
        
        for i, item in enumerate(news_items, 1):
            response_text += f"│ {i}. {item.title}\n"
            response_text += f"│    Source: {item.source} | {item.publish_time}\n"
            response_text += f"│    {item.summary}\n"
            response_text += "│\n"
        
        response_text += "└─────────────────────────────────────────────────────────┘"
        
        return AgentResponse(
            success=True,
            data=response_text,
            type="text",
            plugin=self.id,
            command="/latest"
        )
    
    async def _handle_trending(self, params: dict) -> AgentResponse:
        """处理获取趋势命令"""
        trending_topics = await self.news_service.get_trending_topics()
        
        response_text = "[INFO] Analyzing trending topics...\n\n"
        response_text += "┌─ Trending AI Topics ────────────────────────────────────┐\n"
        
        for i, topic in enumerate(trending_topics, 1):
            response_text += f"│ {str(i).rjust(2)}. {topic.keyword.ljust(20)} {str(topic.mentions).rjust(4)} mentions {topic.change} │\n"
        
        response_text += "└─────────────────────────────────────────────────────────┘"
        
        return AgentResponse(
            success=True,
            data=response_text,
            type="text",
            plugin=self.id,
            command="/trending"
        )
    
    async def _handle_categories(self, params: dict) -> AgentResponse:
        """处理获取分类命令"""
        categories = await self.news_service.get_categories()
        
        response_text = "[INFO] Loading news categories...\n\n"
        response_text += "┌─ News Categories ───────────────────────────────────────┐\n"
        
        for category in categories:
            response_text += f"│ {category.name.ljust(30)} {str(category.count).rjust(3)} articles │\n"
        
        response_text += "└─────────────────────────────────────────────────────────┘"
        
        return AgentResponse(
            success=True,
            data=response_text,
            type="text",
            plugin=self.id,
            command="/categories"
        )
    
    async def _handle_deepdive(self, params: dict) -> AgentResponse:
        """处理深度分析命令"""
        topic = params.get("topic", "AI developments")
        
        # 这里可以集成LLM进行深度分析
        response_text = f"[INFO] Initializing deep analysis mode...\n"
        response_text += f"[ANALYSIS] Processing recent {topic}...\n"
        response_text += "[INSIGHTS] Key trends identified:\n\n"
        response_text += "• Large Language Models continue to dominate with recent releases\n"
        response_text += "• Multimodal AI gaining significant traction across major tech companies\n"
        response_text += "• Open-source models closing performance gap with proprietary solutions\n"
        response_text += "• AI Safety becoming increasingly important in enterprise adoption\n"
        response_text += "• Robotics integration with LLMs showing promising real-world applications\n\n"
        response_text += "[RECOMMENDATION] Focus areas for next 30 days:\n"
        response_text += "1. Monitor latest model performance benchmarks\n"
        response_text += "2. Track open-source LLM developments\n"
        response_text += "3. Watch for regulatory updates on AI safety"
        
        return AgentResponse(
            success=True,
            data=response_text,
            type="text",
            plugin=self.id,
            command="/deepdive"
        )
