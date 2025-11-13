"""
Intent 模型 - 统一的用户意图表示
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class Intent(BaseModel):
    """统一的用户意图模型"""
    
    # 核心字段（必需）
    command: str = Field(..., description="映射到的命令，如 /latest, /search, /trending")
    params: Dict[str, Any] = Field(default_factory=dict, description="命令参数")
    
    # 元数据字段（用于日志、分析、可选增强）
    source: str = Field(default="command", description="输入来源: command | natural_language")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="置信度 0-1")
    original_input: str = Field(default="", description="原始用户输入")
    
    # 自然语言增强字段（可选，仅自然语言输入时填充）
    keywords: List[str] = Field(default_factory=list, description="提取的关键词")
    time_range: Optional[str] = Field(default=None, description="时间范围，如 'last 7 days'")
    importance: str = Field(default="all", description="重要性过滤: high, medium, all")
    entities: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="实体识别，如 {'companies': ['OpenAI'], 'topics': ['GPT-4']}"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "command": "/search",
                "params": {
                    "count": 10,
                    "keywords": ["OpenAI"],
                    "time_range": "last 7 days"
                },
                "source": "natural_language",
                "confidence": 0.95,
                "original_input": "最近 OpenAI 有什么新进展？",
                "keywords": ["OpenAI"],
                "time_range": "last 7 days",
                "importance": "high",
                "entities": {
                    "companies": ["OpenAI"]
                }
            }
        }


class InvalidCommandError(Exception):
    """无效命令异常"""
    pass
