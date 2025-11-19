"""文本处理工具函数"""
import re
from typing import List


def clean_html(text: str) -> str:
    """
    清理 HTML 标签
    
    Args:
        text: 包含 HTML 的文本
    
    Returns:
        清理后的纯文本
    """
    return re.sub(r'<[^>]+>', '', text)


def truncate_text(text: str, max_length: int = 300, suffix: str = '...') -> str:
    """
    截断文本到指定长度
    
    Args:
        text: 原始文本
        max_length: 最大长度
        suffix: 截断后缀
    
    Returns:
        截断后的文本
    """
    if len(text) <= max_length:
        return text
    return text[:max_length] + suffix


def extract_keywords(text: str, keyword_list: List[str], max_count: int = 5) -> List[str]:
    """
    从文本中提取关键词
    
    Args:
        text: 待提取的文本
        keyword_list: 关键词列表
        max_count: 最多返回的关键词数量
    
    Returns:
        找到的关键词列表
    """
    found_keywords = []
    text_lower = text.lower()
    
    for keyword in keyword_list:
        if keyword.lower() in text_lower:
            found_keywords.append(keyword)
    
    return found_keywords[:max_count]


# AI 相关关键词常量
AI_KEYWORDS = [
    "OpenAI", "GPT", "ChatGPT", "Anthropic", "Claude",
    "Google", "Gemini", "DeepMind", "Meta", "Llama",
    "Microsoft", "Copilot", "AI", "Machine Learning",
    "Deep Learning", "Neural Network", "Transformer", "LLM",
    "Robotics", "Computer Vision", "NLP", "AGI",
    "Tesla", "Autonomous", "NVIDIA", "Stability AI"
]


def extract_ai_keywords(text: str, max_count: int = 5) -> List[str]:
    """
    从文本中提取 AI 相关关键词
    
    Args:
        text: 待提取的文本
        max_count: 最多返回的关键词数量
    
    Returns:
        找到的 AI 关键词列表
    """
    return extract_keywords(text, AI_KEYWORDS, max_count)
