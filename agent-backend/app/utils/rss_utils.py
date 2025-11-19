"""RSS 处理工具函数"""
from datetime import datetime
from typing import Optional, Dict, Any
import feedparser


def parse_publish_time(entry: Any) -> str:
    """
    解析 RSS entry 的发布时间
    
    Args:
        entry: feedparser 的 entry 对象
    
    Returns:
        格式化的时间字符串 (YYYY-MM-DD HH:MM:SS)
    """
    if hasattr(entry, 'published_parsed') and entry.published_parsed:
        return datetime(*entry.published_parsed[:6]).strftime("%Y-%m-%d %H:%M:%S")
    elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
        return datetime(*entry.updated_parsed[:6]).strftime("%Y-%m-%d %H:%M:%S")
    else:
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def extract_category(entry: Any, default: str = "AI & Technology") -> str:
    """
    从 RSS entry 提取分类
    
    Args:
        entry: feedparser 的 entry 对象
        default: 默认分类
    
    Returns:
        分类名称
    """
    if hasattr(entry, 'tags') and entry.tags:
        return entry.tags[0].get('term', default)
    return default


def extract_tags(entry: Any, max_count: int = 5) -> list:
    """
    从 RSS entry 提取标签
    
    Args:
        entry: feedparser 的 entry 对象
        max_count: 最多返回的标签数量
    
    Returns:
        标签列表
    """
    if hasattr(entry, 'tags'):
        return [tag.get('term', '') for tag in entry.tags[:max_count]]
    return []


def parse_rss_entry(entry: Any) -> Dict[str, Any]:
    """
    解析单个 RSS entry
    
    Args:
        entry: feedparser 的 entry 对象
    
    Returns:
        包含解析后数据的字典
    """
    return {
        'title': entry.get('title', 'No title'),
        'summary': entry.get('summary', entry.get('description', '')),
        'url': entry.get('link', ''),
        'publish_time': parse_publish_time(entry),
        'category': extract_category(entry),
        'tags': extract_tags(entry)
    }
