"""
Database Connection Pool Management

使用 asyncpg 管理 PostgreSQL 连接池
"""

import asyncpg
from typing import Optional
from loguru import logger
from ..config import settings


# 全局连接池
_db_pool: Optional[asyncpg.Pool] = None


async def get_db_pool() -> Optional[asyncpg.Pool]:
    """
    获取数据库连接池
    
    Returns:
        Optional[asyncpg.Pool]: 数据库连接池，如果未配置或连接失败则返回 None
    """
    global _db_pool
    
    # 如果连接池已存在，直接返回
    if _db_pool is not None:
        return _db_pool
    
    # 检查是否配置了数据库连接字符串
    db_url = settings.DB_CONNECTION_STRING
    if not db_url:
        logger.warning("Database URL not configured. Agent conversations will not be persisted.")
        return None
    
    try:
        logger.info("Initializing database connection pool...")
        
        # 创建连接池
        _db_pool = await asyncpg.create_pool(
            db_url,
            min_size=2,  # 最小连接数
            max_size=10,  # 最大连接数
            command_timeout=60,  # 命令超时（秒）
            timeout=30,  # 连接超时（秒）
        )
        
        # 测试连接
        async with _db_pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        
        logger.info("Database connection pool initialized successfully")
        return _db_pool
    
    except Exception as e:
        logger.error(f"Failed to initialize database connection pool: {e}")
        logger.warning("Agent will continue without database persistence")
        _db_pool = None
        return None


async def close_db_pool() -> None:
    """
    关闭数据库连接池
    """
    global _db_pool
    
    if _db_pool is not None:
        try:
            logger.info("Closing database connection pool...")
            await _db_pool.close()
            _db_pool = None
            logger.info("Database connection pool closed")
        except Exception as e:
            logger.error(f"Error closing database connection pool: {e}")


async def get_db_connection():
    """
    获取数据库连接（用于 ConversationMemory）
    
    Returns:
        数据库连接池或 None
    """
    return await get_db_pool()
