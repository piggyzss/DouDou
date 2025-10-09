import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # 应用配置
    APP_NAME: str = "AI News Agent"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS配置 - 直接设置，避免环境变量解析问题
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://host.docker.internal:3000",
            "https://yourdomain.com",  # 替换为实际域名
        ]

    # Redis配置
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")

    # 缓存配置
    CACHE_TTL: int = 3600  # 1小时
    NEWS_CACHE_TTL: int = 1800  # 30分钟

    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # 新闻源配置
    NEWS_SOURCES: dict = {
        "techcrunch": {
            "url": "https://techcrunch.com/category/artificial-intelligence/",
            "enabled": True,
        },
        "venturebeat": {"url": "https://venturebeat.com/ai/", "enabled": True},
        "mit_tech_review": {
            "url": "https://www.technologyreview.com/topic/artificial-intelligence/",
            "enabled": True,
        },
    }

    # 日志配置
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/agent.log"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
