from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    应用配置管理
    
    配置优先级：
    1. 环境变量（最高优先级）
    2. .env 文件
    3. 默认值（最低优先级）
    
    配置分类：
    - 应用常量：不会改变的值（如 APP_NAME）
    - 环境相关：开发/生产不同的值（如 DEBUG）
    - 敏感信息：必须从环境变量读取（如 API Keys）
    - 业务配置：有合理默认值，可选覆盖（如 CACHE_TTL）
    """
    
    # ========== 应用常量（不会改变）==========
    APP_NAME: str = "AI News Agent"
    APP_VERSION: str = "1.0.0"

    # ========== 环境相关配置（开发/生产不同）==========
    DEBUG: bool = False  # .env 中设置 DEBUG=true
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"  # 可选：DEBUG, INFO, WARNING, ERROR
    LOG_FILE: str = "logs/agent.log"

    # ========== CORS 配置 ==========
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """允许的跨域来源"""
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://host.docker.internal:3000",
            "https://yourdomain.com",  # 生产环境需要替换
        ]

    # ========== Redis 配置（外部服务）==========
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""

    # ========== 缓存配置（业务配置）==========
    CACHE_TTL: int = 3600  # 1小时（秒）
    NEWS_CACHE_TTL: int = 1800  # 30分钟（秒）

    # ========== LLM 配置 ==========
    # 敏感信息：必须从环境变量读取
    GOOGLE_API_KEY: str = ""  # 必须在 .env 中设置
    OPENAI_API_KEY: str = ""  # 可选
    
    # LLM 提供商选择
    LLM_PROVIDER: str = "none"  # 选项: "google" | "openai" | "none"
    
    # Gemini 模型配置
    # 使用 Gemini 2.5 系列（1.5 系列已淘汰）
    GEMINI_MODEL_FLASH: str = "gemini-2.5-flash"
    GEMINI_MODEL_PRO: str = "gemini-2.5-pro"
    
    # OpenAI 模型配置（稳定配置）
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    OPENAI_MAX_TOKENS: int = 1000
    OPENAI_TEMPERATURE: float = 0.7
    
    # ========== Agent 功能开关 ==========
    ENABLE_INTENT_ANALYSIS: bool = False  # .env 中设置 ENABLE_INTENT_ANALYSIS=true
    ENABLE_CONTENT_ANALYSIS: bool = False  # .env 中设置 ENABLE_CONTENT_ANALYSIS=true
    MAX_ARTICLES_PER_QUERY: int = 50

    # ========== 新闻源配置（业务配置）==========
    NEWS_SOURCES: dict = {
        "techcrunch": {
            "url": "https://techcrunch.com/category/artificial-intelligence/",
            "enabled": True,
        },
        "venturebeat": {
            "url": "https://venturebeat.com/ai/",
            "enabled": True
        },
        "mit_tech_review": {
            "url": "https://www.technologyreview.com/topic/artificial-intelligence/",
            "enabled": True,
        },
    }

    class Config:
        """Pydantic 配置"""
        env_file = ".env"  # 自动读取 .env 文件
        case_sensitive = True  # 环境变量区分大小写
        # env_file_encoding = 'utf-8'  # 可选：指定编码


# 全局配置实例
settings = Settings()
