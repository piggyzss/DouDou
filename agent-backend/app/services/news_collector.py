from typing import List
from ..models.news import NewsItem, NewsCategory, TrendingTopic
import asyncio
from datetime import datetime

class NewsCollectorService:
    """新闻收集服务"""
    
    def __init__(self):
        # Mock数据 - 后续可以替换为真实的新闻爬虫
        self.mock_news = [
            NewsItem(
                title="OpenAI releases GPT-4.5 with enhanced reasoning",
                summary="New model shows 40% improvement in complex reasoning tasks and mathematical problem solving.",
                url="https://techcrunch.com/example1",
                source="TechCrunch",
                publish_time="2 hours ago",
                category="Machine Learning",
                tags=["GPT", "OpenAI", "LLM"]
            ),
            NewsItem(
                title="Google DeepMind announces breakthrough in robotics",
                summary="RT-2 model enables robots to perform complex manipulation tasks with human-level dexterity.",
                url="https://nature.com/example2",
                source="Nature",
                publish_time="4 hours ago",
                category="Robotics",
                tags=["Google", "DeepMind", "Robotics"]
            ),
            NewsItem(
                title="Meta unveils Llama 3 with multimodal capabilities",
                summary="New open-source model supports text, image, and video understanding with competitive performance.",
                url="https://ai.meta.com/example3",
                source="Meta AI Blog",
                publish_time="6 hours ago",
                category="Computer Vision",
                tags=["Meta", "Llama", "Multimodal"]
            ),
            NewsItem(
                title="Anthropic introduces Constitutional AI 2.0",
                summary="Enhanced safety measures and improved alignment through constitutional training methods.",
                url="https://anthropic.com/example4",
                source="Anthropic Blog",
                publish_time="8 hours ago",
                category="AI Safety",
                tags=["Anthropic", "Safety", "Constitutional AI"]
            ),
            NewsItem(
                title="Microsoft Copilot integrates with Azure AI Studio",
                summary="Developers can now build custom AI agents using enterprise-grade tools and infrastructure.",
                url="https://microsoft.com/example5",
                source="Microsoft Blog",
                publish_time="10 hours ago",
                category="Enterprise AI",
                tags=["Microsoft", "Copilot", "Azure"]
            )
        ]
        
        self.mock_categories = [
            NewsCategory(name="Machine Learning", count=234, description="ML algorithms and models"),
            NewsCategory(name="Natural Language Processing", count=189, description="NLP and language models"),
            NewsCategory(name="Computer Vision", count=156, description="Image and video processing"),
            NewsCategory(name="Robotics", count=123, description="AI-powered robotics"),
            NewsCategory(name="AI Safety", count=98, description="AI safety and alignment"),
            NewsCategory(name="Enterprise AI", count=87, description="Business AI applications")
        ]
        
        self.mock_trending = [
            TrendingTopic(keyword="GPT-4.5", mentions=1247, change="↑ 23%", description="Latest OpenAI model"),
            TrendingTopic(keyword="Multimodal AI", mentions=892, change="↑ 15%", description="Multi-format AI systems"),
            TrendingTopic(keyword="AI Safety", mentions=567, change="↑ 8%", description="AI safety research"),
            TrendingTopic(keyword="Open Source LLM", mentions=445, change="↑ 12%", description="Open source language models"),
            TrendingTopic(keyword="AI Robotics", mentions=334, change="↑ 18%", description="AI in robotics applications")
        ]
    
    async def get_latest_news(self, limit: int = 10, category: str = None) -> List[NewsItem]:
        """获取最新新闻"""
        # 模拟异步操作
        await asyncio.sleep(0.1)
        
        news = self.mock_news
        if category:
            news = [item for item in news if item.category and item.category.lower() == category.lower()]
        
        return news[:limit]
    
    async def get_categories(self) -> List[NewsCategory]:
        """获取新闻分类"""
        await asyncio.sleep(0.1)
        return self.mock_categories
    
    async def get_trending_topics(self, limit: int = 10) -> List[TrendingTopic]:
        """获取热门话题"""
        await asyncio.sleep(0.1)
        return self.mock_trending[:limit]
    
    async def search_news(self, query: str, limit: int = 10) -> List[NewsItem]:
        """搜索新闻"""
        await asyncio.sleep(0.1)
        
        # 简单的关键词匹配搜索
        results = []
        query_lower = query.lower()
        
        for item in self.mock_news:
            if (query_lower in item.title.lower() or 
                query_lower in item.summary.lower() or
                any(query_lower in tag.lower() for tag in item.tags)):
                results.append(item)
        
        return results[:limit]
    
    async def get_news_by_source(self, source: str, limit: int = 10) -> List[NewsItem]:
        """按来源获取新闻"""
        await asyncio.sleep(0.1)
        
        news = [item for item in self.mock_news if item.source.lower() == source.lower()]
        return news[:limit]
