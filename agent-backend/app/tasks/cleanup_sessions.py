"""
定时任务：清理过期会话和删除旧数据

- 每小时标记 24 小时未活动的会话为过期
- 每天删除 30 天前的过期数据
"""

import asyncio
from loguru import logger
from datetime import datetime

from ..core.conversation_memory import get_conversation_memory


async def cleanup_expired_sessions_task():
    """
    清理过期会话的定时任务
    
    每小时运行一次，标记 24 小时未活动的会话为过期
    """
    logger.info("Starting session cleanup task")
    
    conversation_memory = get_conversation_memory()
    
    while True:
        try:
            logger.info("Running session cleanup...")
            
            # 标记过期会话
            count = await conversation_memory.cleanup_expired_sessions(expiry_hours=24)
            
            logger.info(f"Session cleanup completed: {count} sessions marked as expired")
            
            # 等待 1 小时
            await asyncio.sleep(3600)
        
        except Exception as e:
            logger.error(f"Session cleanup task failed: {e}", exc_info=True)
            # 出错后等待 5 分钟再重试
            await asyncio.sleep(300)


async def delete_old_data_task():
    """
    删除旧数据的定时任务
    
    每天运行一次，删除 30 天前的过期数据
    """
    logger.info("Starting old data deletion task")
    
    conversation_memory = get_conversation_memory()
    
    while True:
        try:
            logger.info("Running old data deletion...")
            
            # 删除 30 天前的数据
            result = await conversation_memory.delete_old_data(days=30)
            
            logger.info(
                f"Old data deletion completed: "
                f"{result['sessions']} sessions, "
                f"{result['conversations']} conversations deleted"
            )
            
            # 等待 24 小时
            await asyncio.sleep(86400)
        
        except Exception as e:
            logger.error(f"Old data deletion task failed: {e}", exc_info=True)
            # 出错后等待 1 小时再重试
            await asyncio.sleep(3600)


def start_cleanup_task():
    """
    启动清理任务（在后台运行）
    """
    try:
        # 启动会话过期标记任务
        asyncio.create_task(cleanup_expired_sessions_task())
        logger.info("Session cleanup task started (runs every hour)")
        
        # 启动旧数据删除任务
        asyncio.create_task(delete_old_data_task())
        logger.info("Old data deletion task started (runs every 24 hours)")
    except Exception as e:
        logger.error(f"Failed to start cleanup tasks: {e}", exc_info=True)
