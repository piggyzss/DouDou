"""Utility functions module"""
from .text_utils import (
    clean_html,
    truncate_text,
    extract_keywords,
    extract_ai_keywords,
    AI_KEYWORDS
)
from .rss_utils import (
    parse_publish_time,
    extract_category,
    extract_tags,
    parse_rss_entry
)
from .search_utils import (
    calculate_relevance_score,
    sort_by_relevance,
    filter_by_category,
    filter_by_source
)

__all__ = [
    # text_utils
    "clean_html",
    "truncate_text",
    "extract_keywords",
    "extract_ai_keywords",
    "AI_KEYWORDS",
    # rss_utils
    "parse_publish_time",
    "extract_category",
    "extract_tags",
    "parse_rss_entry",
    # search_utils
    "calculate_relevance_score",
    "sort_by_relevance",
    "filter_by_category",
    "filter_by_source",
]
