from typing import List, Optional
import asyncio
from datetime import datetime, timedelta
from loguru import logger
import feedparser
import aiohttp
from collections import Counter

from ..models.news import NewsItem, TrendingTopic
from ..mocks import get_mock_news, get_mock_trending
from ..utils import (
    clean_html,
    truncate_text,
    extract_ai_keywords,
    parse_rss_entry,
    calculate_relevance_score,
    sort_by_relevance,
    filter_by_category,
    filter_by_source
)


class NewsCollectorService:
    """
    新闻收集服务
    
    支持多种数据源：
    1. RSS Feeds（主要来源）
    2. Mock 数据（降级方案）
    """

    def __init__(self, use_real_data: bool = True):
        """
        初始化新闻收集服务
        
        Args:
            use_real_data: 是否使用真实数据（False 则使用 mock 数据）
        """
        self.use_real_data = use_real_data
        self._init_rss_feeds()
        self._init_mock_data()

    def _init_rss_feeds(self):
        """初始化 RSS 订阅源"""
        self.rss_feeds = {
            # AI 和机器学习
            "OpenAI Blog": "https://openai.com/blog/rss.xml",
            "Google AI Blog": "https://ai.googleblog.com/feeds/posts/default",
            "DeepMind Blog": "https://deepmind.google/blog/rss.xml",
            "Meta AI": "https://ai.meta.com/blog/rss/",
            "Anthropic": "https://www.anthropic.com/news/rss",
            
            # 科技新闻
            "TechCrunch AI": "https://techcrunch.com/category/artificial-intelligence/feed/",
            "VentureBeat AI": "https://venturebeat.com/category/ai/feed/",
            "MIT Technology Review AI": "https://www.technologyreview.com/topic/artificial-intelligence/feed",
            "The Verge AI": "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
            
            # 学术和研究
            "arXiv AI": "http://export.arxiv.org/rss/cs.AI",
            "arXiv ML": "http://export.arxiv.org/rss/cs.LG",
        }
        
        # 缓存
        self._news_cache: List[NewsItem] = []
        self._cache_time: Optional[datetime] = None
        self._cache_duration = timedelta(minutes=15)  # 缓存 15 分钟
    
    def _init_mock_data(self):
        """初始化 Mock 数据（降级方案）"""
        self.mock_news = get_mock_news()
        self.mock_trending = get_mock_trending()
    
    # 单个 RSS 源的读取
    async def _fetch_rss_feed(self, source: str, url: str) -> List[NewsItem]:
        """
        获取单个 RSS feed
        
        Args:
            source: 来源名称
            url: RSS feed URL
        
        Returns:
            新闻列表
        """
        try:
            # 1. 使用 aiohttp发送 HTTP 请求获取 RSS XML
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status != 200:
                        logger.warning(f"Failed to fetch {source}: HTTP {response.status}")
                        return []
                    
                    content = await response.text()
            
            # 2. 解析 RSS
            feed = feedparser.parse(content)
            
            # 3. 遍历每条新闻
            news_items = []
            for entry in feed.entries[:20]:  # 每个源最多取 20 条
                try:
                    # 解析 RSS entry
                    parsed = parse_rss_entry(entry)
                    
                    # 清理和截断摘要
                    summary = clean_html(parsed['summary'])
                    summary = truncate_text(summary, max_length=300)
                    
                    # 提取标签（如果没有则从文本中提取关键词）
                    tags = parsed['tags']
                    if not tags:
                        tags = extract_ai_keywords(parsed['title'] + ' ' + summary)
                    
                    news_item = NewsItem(
                        title=parsed['title'],
                        summary=summary,
                        url=parsed['url'],
                        source=source,
                        publish_time=parsed['publish_time'],
                        category=parsed['category'],
                        tags=tags
                    )
                    news_items.append(news_item)
                
                except Exception as e:
                    logger.warning(f"Failed to parse entry from {source}: {e}")
                    continue
            
            logger.info(f"Fetched {len(news_items)} items from {source}")
            return news_items
        
        except asyncio.TimeoutError:
            logger.warning(f"Timeout fetching {source}")
            return []
        except Exception as e:
            logger.error(f"Error fetching {source}: {e}")
            return []
    

    
    async def _fetch_all_news(self) -> List[NewsItem]:
        """
        从所有 RSS 源获取新闻
        
        Returns:
            所有新闻列表
        """
        # 1. 检查缓存（15 分钟内有效）
        if self._cache_time and datetime.now() - self._cache_time < self._cache_duration:
            logger.info(f"Using cached news ({len(self._news_cache)} items)")
            return self._news_cache
        
        # 2. 缓存过期，重新获取
        logger.info("Fetching news from all RSS feeds...")
        
        # 3. 并发获取所有 RSS feeds
        tasks = [
            self._fetch_rss_feed(source, url)
            for source, url in self.rss_feeds.items()
        ]
        
        # 4. 等待所有请求完成
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 5. 合并所有新闻
        all_news = []
        for result in results:
            if isinstance(result, list):
                all_news.extend(result)
            elif isinstance(result, Exception):
                logger.error(f"Task failed: {result}")
        
        # 按时间排序
        all_news.sort(key=lambda x: x.publish_time, reverse=True)
        
        # 6. 保存到缓存
        self._news_cache = all_news
        self._cache_time = datetime.now()
        
        logger.info(f"Fetched total {len(all_news)} news items")
        return all_news
    
    async def get_latest_news(
        self, limit: int = 10, category: str = None
    ) -> List[NewsItem]:
        """
        获取最新新闻
        
        Args:
            limit: 返回数量
            category: 分类过滤（可选）
        
        Returns:
            新闻列表
        """
        if not self.use_real_data:
            # 使用 mock 数据
            await asyncio.sleep(0.1)
            news = self.mock_news
            if category:
                news = [
                    item
                    for item in news
                    if item.category and item.category.lower() == category.lower()
                ]
            return news[:limit]
        
        try:
            # 获取真实数据
            all_news = await self._fetch_all_news()
            
            # 分类过滤
            if category:
                all_news = filter_by_category(all_news, category)
            
            return all_news[:limit]
        
        except Exception as e:
            logger.error(f"Failed to fetch real news, falling back to mock data: {e}")
            # 降级到 mock 数据
            news = self.mock_news
            if category:
                news = [
                    item
                    for item in news
                    if item.category and item.category.lower() == category.lower()
                ]
            return news[:limit]

    async def get_trending_topics(self, limit: int = 10) -> List[TrendingTopic]:
        """
        获取热门话题
        
        基于最近新闻中的关键词统计
        
        Args:
            limit: 返回数量
        
        Returns:
            热门话题列表
        """
        if not self.use_real_data:
            await asyncio.sleep(0.1)
            return self.mock_trending[:limit]
        
        try:
            # 获取最近的新闻
            recent_news = await self._fetch_all_news()
            recent_news = recent_news[:100]  # 只分析最近 100 条
            
            # 统计关键词
            keyword_counter = Counter()
            for news in recent_news:
                for tag in news.tags:
                    if tag:  # 忽略空标签
                        keyword_counter[tag] += 1
            
            # 生成热门话题
            trending = []
            for keyword, count in keyword_counter.most_common(limit):
                # 计算变化（简化版，实际需要历史数据对比）
                change = f"↑ {min(count * 2, 30)}%"
                
                # 生成描述
                description = self._generate_topic_description(keyword)
                
                trending.append(TrendingTopic(
                    keyword=keyword,
                    mentions=count,
                    change=change,
                    description=description
                ))
            
            return trending
        
        except Exception as e:
            logger.error(f"Failed to get trending topics, falling back to mock data: {e}")
            return self.mock_trending[:limit]
    
    def _generate_topic_description(self, keyword: str) -> str:
        """生成话题描述"""
        descriptions = {
            "OpenAI": "Leading AI research company",
            "GPT": "Generative Pre-trained Transformer",
            "ChatGPT": "Conversational AI assistant",
            "Anthropic": "AI safety and research company",
            "Claude": "Anthropic's AI assistant",
            "Google": "Tech giant's AI initiatives",
            "Gemini": "Google's multimodal AI model",
            "DeepMind": "Google's AI research lab",
            "Meta": "Meta's AI research and products",
            "Llama": "Meta's open-source LLM",
            "Microsoft": "Microsoft's AI products",
            "Copilot": "AI coding assistant",
            "Machine Learning": "ML algorithms and applications",
            "Deep Learning": "Neural network research",
            "LLM": "Large Language Models",
            "Robotics": "AI in robotics",
            "Computer Vision": "Visual AI systems",
            "NLP": "Natural Language Processing",
            "Tesla": "Autonomous driving technology",
            "NVIDIA": "AI hardware and GPUs",
        }
        return descriptions.get(keyword, f"{keyword} related topics")

    async def search_news(self, query: str, limit: int = 10) -> List[NewsItem]:
        """
        搜索新闻
        
        Args:
            query: 搜索关键词
            limit: 返回数量
        
        Returns:
            匹配的新闻列表
        """
        if not self.use_real_data:
            await asyncio.sleep(0.1)
            results = []
            query_lower = query.lower()
            for item in self.mock_news:
                if (
                    query_lower in item.title.lower()
                    or query_lower in item.summary.lower()
                    or any(query_lower in tag.lower() for tag in item.tags)
                ):
                    results.append(item)
            return results[:limit]
        
        try:
            # 获取所有新闻
            all_news = await self._fetch_all_news()
            
            # 搜索匹配
            results = []
            query_lower = query.lower()
            
            for item in all_news:
                score = calculate_relevance_score(
                    query_lower,
                    item.title,
                    item.summary,
                    item.tags,
                    item.source
                )
                
                if score > 0:
                    results.append((score, item))
            
            # 按相关性排序并返回
            sorted_results = sort_by_relevance(results)
            return sorted_results[:limit]
        
        except Exception as e:
            logger.error(f"Failed to search news, falling back to mock data: {e}")
            results = []
            query_lower = query.lower()
            for item in self.mock_news:
                if (
                    query_lower in item.title.lower()
                    or query_lower in item.summary.lower()
                    or any(query_lower in tag.lower() for tag in item.tags)
                ):
                    results.append(item)
            return results[:limit]

    async def get_news_by_source(self, source: str, limit: int = 10) -> List[NewsItem]:
        """
        按来源获取新闻
        
        Args:
            source: 来源名称
            limit: 返回数量
        
        Returns:
            该来源的新闻列表
        """
        if not self.use_real_data:
            await asyncio.sleep(0.1)
            news = [
                item for item in self.mock_news if item.source.lower() == source.lower()
            ]
            return news[:limit]
        
        try:
            # 获取所有新闻
            all_news = await self._fetch_all_news()
            
            # 按来源过滤
            news = filter_by_source(all_news, source)
            return news[:limit]
        
        except Exception as e:
            logger.error(f"Failed to get news by source, falling back to mock data: {e}")
            news = [
                item for item in self.mock_news if item.source.lower() == source.lower()
            ]
            return news[:limit]
    
    def clear_cache(self):
        """清除缓存"""
        self._news_cache = []
        self._cache_time = None
        logger.info("News cache cleared")
