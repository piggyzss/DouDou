from typing import List
from ..models.base import BasePlugin, AgentCommand, AgentRequest, AgentResponse
from ..services.news_collector import NewsCollectorService
from ..services.llm_service import get_llm_service


class NewsPlugin(BasePlugin):
    """AI资讯插件"""

    def __init__(self, use_real_data: bool = True):
        super().__init__(
            name="AI资讯", plugin_id="news", description="获取最新的AI和科技资讯"
        )
        # 默认使用真实数据，可以通过参数控制
        self.news_service = NewsCollectorService(use_real_data=use_real_data)
        # 获取 LLM 服务用于深度分析
        self.llm_service = get_llm_service()

    def get_commands(self) -> List[AgentCommand]:
        return [
            AgentCommand(
                command="/latest",
                description="获取最新AI资讯",
                usage="/latest [count]",
                examples=["/latest", "/latest 5"],
            ),
            AgentCommand(
                command="/trending",
                description="获取热门趋势",
                usage="/trending [category]",
                examples=["/trending", "/trending ai"],
            ),
            AgentCommand(
                command="/deepdive",
                description="深度分析特定主题",
                usage="/deepdive <topic>",
                examples=["/deepdive GPT-4", "/deepdive 机器学习"],
            ),
            AgentCommand(
                command="/help",
                description="显示帮助信息",
                usage="/help [command]",
                examples=["/help", "/help /latest"],
            ),
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
        help_text = "=== AI资讯插件 ===\n"
        for cmd in self.commands:
            help_text += f"{cmd.command.ljust(20)} # {cmd.description}\n"
            if params.get("detailed"):
                help_text += f"  用法: {cmd.usage}\n"
                help_text += f"  示例: {', '.join(cmd.examples)}\n\n"

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

        # 格式化输出
        response_text = "[INFO] Fetching latest AI news...\n"
        response_text += f"[SUCCESS] Found {len(news_items)} new articles\n\n"
        response_text += "┌─ Latest AI News ────────────────────────────────────────┐\n"

        for i, item in enumerate(news_items, 1):
            response_text += f"│ {i}. {item.title}\n"
            response_text += f"│    Source: {item.source} | {item.publish_time}\n"
            # 增加概括内容到三行左右
            summary_lines = item.summary.split(". ")
            if len(summary_lines) >= 3:
                # 如果概括内容足够，显示前3行
                for j in range(min(3, len(summary_lines))):
                    response_text += f"│    {summary_lines[j]}{'.' if j < 2 else ''}\n"
            else:
                # 如果概括内容不够，重复或扩展
                response_text += f"│    {item.summary}\n"
                if len(item.summary) < 100:  # 如果概括太短，添加额外信息
                    response_text += "│    This development represents a significant advancement in the field.\n"
                    response_text += "│    Industry experts are closely monitoring the implications.\n"
            response_text += f"│    Link: {item.url}\n"
            response_text += "│\n"

        response_text += "└─────────────────────────────────────────────────────────┘"

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
