from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class NewsItem(BaseModel):
    title: str
    summary: str
    url: str
    source: str
    publish_time: str
    category: Optional[str] = None
    tags: List[str] = []

class NewsCategory(BaseModel):
    name: str
    count: int
    description: Optional[str] = None

class TrendingTopic(BaseModel):
    keyword: str
    mentions: int
    change: str  # e.g., "↑ 23%"
    description: Optional[str] = None

class NewsResponse(BaseModel):
    items: List[NewsItem]
    total: int
    page: int = 1
    per_page: int = 10
    categories: List[NewsCategory] = []
    trending: List[TrendingTopic] = []
