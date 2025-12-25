from typing import List
from ..models.base import BasePlugin, AgentRequest, AgentResponse
from ..models.tool import ToolDefinition, ToolParameter, ToolCall, ToolResult
from ..services.news_collector import NewsCollectorService
from ..services.llm_service import get_llm_service


class NewsPlugin(BasePlugin):
    """AI资讯插件（增强版，支持工具定义）"""

    def __init__(self, use_real_data: bool = True):
        super().__init__(
            name="AI资讯", plugin_id="news", description="获取最新的AI和科技资讯"
        )
        # 默认使用真实数据，可以通过参数控制
        self.news_service = NewsCollectorService(use_real_data=use_real_data)
        # 获取 LLM 服务用于深度分析
        self.llm_service = get_llm_service()
    
    def get_tool_definitions(self) -> List[ToolDefinition]:
        """返回工具定义列表（NEW）"""
        return [
            ToolDefinition(
                name="get_latest_news",
                description="Get the latest AI news articles from various sources including company blogs, tech media, and community discussions",
                parameters=[
                    ToolParameter(
                        name="count",
                        type="integer",
                        description="Number of articles to retrieve (1-20)",
                        required=False,
                        default=5
                    ),
                    ToolParameter(
                        name="keywords",
                        type="array",
                        description="Filter articles by keywords (e.g., ['OpenAI', 'GPT'])",
                        required=False
                    )
                ],
                examples=[
                    {
                        "input": "Show me the latest 10 AI news",
                        "parameters": {"count": 10}
                    },
                    {
                        "input": "Latest news about OpenAI",
                        "parameters": {"count": 5, "keywords": ["OpenAI"]}
                    },
                    {
                        "input": "What's new in AI?",
                        "parameters": {"count": 5}
                    }
                ],
                plugin_id=self.id,
                command="/latest",
                category="news"
            ),
            ToolDefinition(
                name="get_trending_topics",
                description="Get currently trending AI topics and discussions based on mention frequency and engagement",
                parameters=[
                    ToolParameter(
                        name="category",
                        type="string",
                        description="Filter by category",
                        required=False,
                        enum=["all", "research", "industry", "products"]
                    )
                ],
                examples=[
                    {
                        "input": "What's trending in AI?",
                        "parameters": {}
                    },
                    {
                        "input": "Show me trending AI research topics",
                        "parameters": {"category": "research"}
                    }
                ],
                plugin_id=self.id,
                command="/trending",
                category="news"
            ),
            ToolDefinition(
                name="deep_analysis",
                description="Perform in-depth analysis on a specific AI topic, including recent developments, technical insights, and industry impact",
                parameters=[
                    ToolParameter(
                        name="topic",
                        type="string",
                        description="The topic to analyze (e.g., 'GPT-4', 'multimodal AI', 'AI safety')",
                        required=True
                    )
                ],
                examples=[
                    {
                        "input": "Deep dive into GPT-4 developments",
                        "parameters": {"topic": "GPT-4"}
                    },
                    {
                        "input": "Analyze recent progress in multimodal AI",
                        "parameters": {"topic": "multimodal AI"}
                    }
                ],
                plugin_id=self.id,
                command="/deepdive",
                category="analysis"
            )
        ]

    async def execute_tool(self, tool_call: ToolCall) -> ToolResult:
        """执行工具调用（ReactAgent 使用）"""
        try:
            tool_name = tool_call.tool_name
            parameters = tool_call.parameters

            if tool_name == "get_latest_news":
                response = await self._handle_latest(parameters)
                return ToolResult(
                    success=response.success,
                    data=response.data,
                    error=response.error if not response.success else None,
                    tool_name=tool_name,
                )
            elif tool_name == "get_trending_topics":
                response = await self._handle_trending(parameters)
                return ToolResult(
                    success=response.success,
                    data=response.data,
                    error=response.error if not response.success else None,
                    tool_name=tool_name,
                )
            elif tool_name == "deep_analysis":
                response = await self._handle_deepdive(parameters)
                return ToolResult(
                    success=response.success,
                    data=response.data,
                    error=response.error if not response.success else None,
                    tool_name=tool_name,
                )
            else:
                return ToolResult(
                    success=False,
                    data=None,
                    error=f"Unknown tool: {tool_name}",
                    tool_name=tool_name,
                )
        except Exception as e:
            return ToolResult(
                success=False,
                data=None,
                error=str(e),
                tool_name=tool_name if "tool_name" in locals() else "unknown",
            )

    async def execute(self, request: AgentRequest) -> AgentResponse:
        """执行命令（向后兼容）"""
        command = request.command
        params = request.params

        try:
            if command == "/help":
                return await self._handle_help(params)
            elif command == "/latest":
                return await self._handle_latest(params)
            elif command == "/trending":
                return await self._handle_trending(params)
            elif command == "/deepdive":
                return await self._handle_deepdive(params)
            else:
                return AgentResponse(
                    success=False,
                    error=f"Unknown command: {command}",
                    type="error",
                    plugin=self.id,
                    command=command,
                )
        except Exception as e:
            return AgentResponse(
                success=False,
                error=str(e),
                type="error",
                plugin=self.id,
                command=command,
            )

    async def _handle_help(self, params: dict) -> AgentResponse:
        """处理帮助命令"""
        help_text = "=== AI资讯插件 ===\n\n"
        help_text += "可用工具:\n"
        for tool in self.tools:
            help_text += f"• {tool.name.ljust(25)} - {tool.description}\n"
            if params.get("detailed"):
                help_text += f"  参数: {', '.join([p.name for p in tool.parameters])}\n"
                if tool.examples:
                    help_text += f"  示例: {tool.examples[0]['input']}\n"
                help_text += "\n"

        return AgentResponse(
            success=True, data=help_text, type="text", plugin=self.id, command="/help"
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
                command="/latest",
            )

        # 格式化输出 - 按照要求的格式
        response_text = f"[INFO] Fetching latest AI news...\n"
        response_text += f"[SUCCESS] Found {len(news_items)} articles\n\n"
        response_text += "=" * 80 + "\n\n"

        for i, item in enumerate(news_items, 1):
            # 标题
            response_text += f"{item.title}\n"
            
            # 来源和时间
            response_text += f"Source: {item.source} | {item.publish_time}\n"
            
            # 分类和标签（如果有）
            if item.category:
                response_text += f"Category: {item.category}\n"
            if item.tags:
                response_text += f"Tags: {', '.join(item.tags[:5])}\n"  # 最多显示5个标签
            
            # 摘要
            response_text += f"Abstract: {item.summary}\n"
            
            # 链接
            response_text += f"Link: {item.url}\n"
            
            # 分隔线（最后一条不加）
            if i < len(news_items):
                response_text += "\n" + "-" * 80 + "\n\n"

        response_text += "\n" + "=" * 80

        return AgentResponse(
            success=True,
            data=response_text,
            type="text",
            plugin=self.id,
            command="/latest",
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
            command="/trending",
        )

    async def _handle_deepdive(self, params: dict) -> AgentResponse:
        """
        处理深度分析命令
        使用 LLM 对指定主题进行深度分析
        """
        topic = params.get("topic", "AI developments")

        response_text = "[INFO] Initializing deep analysis mode...\n"
        response_text += f"[ANALYSIS] Processing recent developments in {topic}...\n\n"

        try:
            # 1. 搜索相关新闻
            related_news = await self.news_service.search_news(topic, limit=10)
            
            if not related_news:
                response_text += "[WARNING] No recent news found for this topic.\n"
                response_text += "Using general AI trends analysis...\n\n"
            
            # 2. 准备新闻摘要给 LLM
            news_summary = self._prepare_news_summary(related_news, topic)
            
            # 3. 使用 LLM 进行深度分析
            if self.llm_service and self.llm_service.is_available():
                response_text += "[LLM] Generating deep analysis...\n\n"
                
                analysis = await self._generate_llm_analysis(topic, news_summary)
                response_text += analysis
            else:
                # LLM 不可用时的降级方案
                response_text += "[FALLBACK] LLM service not available, using basic analysis...\n\n"
                response_text += self._generate_basic_analysis(related_news, topic)
        
        except Exception as e:
            response_text += f"[ERROR] Analysis failed: {str(e)}\n"
            response_text += "Using fallback analysis...\n\n"
            response_text += self._generate_basic_analysis([], topic)

        return AgentResponse(
            success=True,
            data=response_text,
            type="text",
            plugin=self.id,
            command="/deepdive",
        )
    
    def _prepare_news_summary(self, news_items: list, topic: str) -> str:
        """准备新闻摘要供 LLM 分析"""
        if not news_items:
            return f"No recent news found about {topic}."
        
        summary = f"Recent news about {topic}:\n\n"
        for i, item in enumerate(news_items[:5], 1):  # 只取前5条
            summary += f"{i}. {item.title}\n"
            summary += f"   Source: {item.source} | {item.publish_time}\n"
            summary += f"   Summary: {item.summary[:200]}...\n\n"
        
        return summary
    
    async def _generate_llm_analysis(self, topic: str, news_summary: str) -> str:
        """使用 LLM 生成深度分析"""
        prompt = f"""You are an AI technology analyst. Analyze the following recent news about "{topic}" and provide a comprehensive deep-dive analysis.

{news_summary}

Please provide:
1. Key Trends: Identify 3-5 major trends or patterns
2. Technical Insights: Explain the technical significance
3. Industry Impact: Analyze the impact on the AI industry
4. Future Outlook: Predict developments in the next 30-60 days
5. Recommendations: Suggest 3 focus areas for monitoring

Format your response in a clear, structured way with bullet points and sections.
Keep it concise but insightful (around 300-400 words).
"""
        
        try:
            analysis = await self.llm_service.generate_text(
                prompt,
                temperature=0.7,
                max_tokens=800
            )
            
            return f"┌─ Deep Analysis: {topic} ────────────────────────────────┐\n\n{analysis}\n\n└─────────────────────────────────────────────────────────┘"
        
        except Exception as e:
            return f"[ERROR] LLM analysis failed: {str(e)}\nFalling back to basic analysis..."
    
    def _generate_basic_analysis(self, news_items: list, topic: str) -> str:
        """生成基础分析（降级方案）"""
        analysis = f"┌─ Basic Analysis: {topic} ───────────────────────────────┐\n\n"
        
        if news_items:
            # 统计来源
            sources = {}
            for item in news_items:
                sources[item.source] = sources.get(item.source, 0) + 1
            
            # 统计标签
            tags = {}
            for item in news_items:
                for tag in item.tags:
                    tags[tag] = tags.get(tag, 0) + 1
            
            analysis += "[INSIGHTS] Key findings:\n\n"
            analysis += f"• Found {len(news_items)} recent articles about {topic}\n"
            analysis += f"• Top sources: {', '.join(list(sources.keys())[:3])}\n"
            
            if tags:
                top_tags = sorted(tags.items(), key=lambda x: x[1], reverse=True)[:5]
                analysis += f"• Related topics: {', '.join([tag for tag, _ in top_tags])}\n"
            
            analysis += f"\n[RECENT DEVELOPMENTS]\n\n"
            for i, item in enumerate(news_items[:3], 1):
                analysis += f"{i}. {item.title}\n"
                analysis += f"   {item.summary[:150]}...\n\n"
        else:
            analysis += "[INSIGHTS] General AI trends:\n\n"
            analysis += "• Large Language Models continue to evolve rapidly\n"
            analysis += "• Multimodal AI gaining significant traction\n"
            analysis += "• Open-source models closing the performance gap\n"
            analysis += "• AI Safety becoming increasingly important\n"
        
        analysis += "\n[RECOMMENDATION] Focus areas:\n"
        analysis += "1. Monitor latest model releases and benchmarks\n"
        analysis += "2. Track open-source developments\n"
        analysis += "3. Watch for regulatory updates\n\n"
        analysis += "└─────────────────────────────────────────────────────────┘"
        
        return analysis
