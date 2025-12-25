"""
定时任务：清理过期会话

定期清理 24 小时未活动的会话
"""

import asyncio
from loguru import logger
from datetime import datetime

from ..core.conversation_memory import get_conversation_memory


async def cleanup_expired_sessions_task():
    """
    清理过期会话的定时任务
    
    每小时运行一次，清理 24 小时未活动的会话
    """
    logger.info("Starting session cleanup task")
    
    conversation_memory = get_conversation_memory()
    
    while True:
        try:
            logger.info("Running session cleanup...")
            
            # 清理过期会话
            count = await conversation_memory.cleanup_expired_sessions()
            
            logger.info(f"Session cleanup completed: {count} sessions marked as expired")
            
            # 等待 1 小时
            await asyncio.sleep(3600)
        
        except Exception as e:
            logger.error(f"Session cleanup task failed: {e}", exc_info=True)
            # 出错后等待 5 分钟再重试
            await asyncio.sleep(300)


def start_cleanup_task():
    """
    启动清理任务（在后台运行）
    """
    try:
        asyncio.create_task(cleanup_expired_sessions_task())
        logger.info("Session cleanup task started")
    except Exception as e:
        logger.error(f"Failed to start cleanup task: {e}", exc_info=True)
