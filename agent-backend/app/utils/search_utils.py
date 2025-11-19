"""搜索和排序工具函数"""
from typing import List, Tuple, Any


def calculate_relevance_score(
    query: str,
    title: str,
    summary: str,
    tags: List[str],
    source: str
) -> int:
    """
    计算搜索相关性分数
    
    Args:
        query: 搜索关键词
        title: 标题
        summary: 摘要
        tags: 标签列表
        source: 来源
    
    Returns:
        相关性分数（越高越相关）
    """
    score = 0
    query_lower = query.lower()
    
    # 标题匹配（权重最高）
    if query_lower in title.lower():
        score += 10
    
    # 摘要匹配
    if query_lower in summary.lower():
        score += 5
    
    # 标签匹配
    for tag in tags:
        if query_lower in tag.lower():
            score += 3
    
    # 来源匹配
    if query_lower in source.lower():
        score += 2
    
    return score


def sort_by_relevance(items: List[Tuple[int, Any]]) -> List[Any]:
    """
    按相关性分数排序
    
    Args:
        items: (score, item) 元组列表
    
    Returns:
        排序后的 item 列表
    """
    items.sort(key=lambda x: x[0], reverse=True)
    return [item for _, item in items]


def filter_by_category(items: List[Any], category: str) -> List[Any]:
    """
    按分类过滤项目
    
    Args:
        items: 项目列表（需要有 category 属性）
        category: 分类名称
    
    Returns:
        过滤后的列表
    """
    return [
        item for item in items
        if hasattr(item, 'category') and item.category and category.lower() in item.category.lower()
    ]


def filter_by_source(items: List[Any], source: str) -> List[Any]:
    """
    按来源过滤项目
    
    Args:
        items: 项目列表（需要有 source 属性）
        source: 来源名称
    
    Returns:
        过滤后的列表
    """
    return [
        item for item in items
        if hasattr(item, 'source') and source.lower() in item.source.lower()
    ]
