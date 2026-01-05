"""
Conversation Memory - 会话记忆管理

职责：
1. 持久化对话历史到数据库
2. 检索历史对话
3. 会话摘要生成
4. 过期会话清理
"""

import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from loguru import logger

from ..models.react import ReactResponse, ConversationTurn
from ..services.llm_service import BaseLLMService, get_llm_service


class ConversationMemory:
    """
    会话记忆管理器
    
    功能：
    - 保存对话到数据库
    - 检索历史对话（最近 10 条）
    - 生成对话摘要（超过 20 条时）
    - 清理过期会话（24 小时未活动）
    """
    
    # 历史记录限制
    MAX_HISTORY_ITEMS = 10
    SUMMARY_THRESHOLD = 20
    SESSION_EXPIRY_HOURS = 24
    
    def __init__(
        self,
        db_connection: Optional[Any] = None,
        llm_service: Optional[BaseLLMService] = None
    ):
        """
        初始化会话记忆管理器
        
        Args:
            db_connection: 数据库连接（可选）
            llm_service: LLM 服务（用于生成摘要）
        """
        self.db = db_connection
        self.llm_service = llm_service or get_llm_service()
        
        # 摘要缓存（避免重复生成）
        self._summary_cache: Dict[str, Dict[str, Any]] = {}
        
        logger.info("ConversationMemory initialized")
    
    def generate_session_id(self) -> str:
        """
        生成唯一的会话 ID
        
        Returns:
            str: 会话 ID (格式: session_<16位hex>)
        """
        return f"session_{uuid.uuid4().hex[:16]}"
    
    async def save_interaction(
        self,
        session_id: str,
        query: str,
        response: ReactResponse,
        user_id: Optional[str] = None
    ) -> bool:
        """
        保存对话交互到数据库
        
        Args:
            session_id: 会话 ID
            query: 用户查询
            response: Agent 响应
            user_id: 用户 ID（可选）
        
        Returns:
            bool: 是否保存成功
        """
        try:
            if not self.db:
                logger.warning("Database not available, skipping save")
                return False
            
            # 构建对话记录
            conversation_data = {
                "session_id": session_id,
                "user_id": user_id,
                "query": query,
                "response": response.response,
                "success": response.success,
                "steps_count": len(response.steps),
                "execution_time": response.execution_time,
                "metadata": {
                    "plan": response.plan.to_dict(),
                    "evaluation": response.evaluation.to_dict(),
                    "steps": [step.to_dict() for step in response.steps]
                },
                "created_at": datetime.now()
            }
            
            # 保存到数据库
            await self._insert_conversation(conversation_data)
            
            # 更新会话最后活动时间
            await self._update_session_activity(session_id, user_id)
            
            logger.info(f"Saved conversation: session={session_id}, query_length={len(query)}")
            
            return True
        
        except Exception as e:
            logger.error(f"Failed to save interaction: {e}", exc_info=True)
            return False
    
    async def get_history(
        self,
        session_id: str,
        limit: int = MAX_HISTORY_ITEMS
    ) -> List[ConversationTurn]:
        """
        获取会话历史记录
        
        Args:
            session_id: 会话 ID
            limit: 最多返回的记录数（默认 10）
        
        Returns:
            List[ConversationTurn]: 对话历史列表
        """
        try:
            if not self.db:
                logger.warning("Database not available, returning empty history")
                return []
            
            # 从数据库查询历史
            rows = await self._query_conversations(session_id, limit)
            
            # 转换为 ConversationTurn 对象
            history = []
            for row in rows:
                turn = ConversationTurn(
                    query=row["query"],
                    response=row["response"],
                    timestamp=row["created_at"],
                    success=row.get("success", True),
                    metadata=row.get("metadata", {})
                )
                history.append(turn)
            
            logger.info(f"Retrieved history: session={session_id}, count={len(history)}")
            
            return history
        
        except Exception as e:
            logger.error(f"Failed to get history: {e}", exc_info=True)
            return []
    
    async def get_context_summary(
        self,
        session_id: str,
        force_refresh: bool = False
    ) -> Optional[str]:
        """
        获取会话上下文摘要
        
        当会话超过 SUMMARY_THRESHOLD 条记录时，使用 LLM 生成摘要
        
        Args:
            session_id: 会话 ID
            force_refresh: 是否强制刷新摘要
        
        Returns:
            Optional[str]: 摘要文本，如果不需要摘要则返回 None
        """
        try:
            # 检查缓存
            if not force_refresh and session_id in self._summary_cache:
                cached = self._summary_cache[session_id]
                # 缓存有效期 5 分钟
                if (datetime.now() - cached["timestamp"]).seconds < 300:
                    logger.debug(f"Using cached summary for session={session_id}")
                    return cached["summary"]
            
            # 获取完整历史
            full_history = await self._query_conversations(
                session_id,
                limit=1000  # 获取所有记录
            )
            
            # 如果记录数少于阈值，不需要摘要
            if len(full_history) < self.SUMMARY_THRESHOLD:
                return None
            
            # 检查 LLM 是否可用
            if not self.llm_service or not self.llm_service.is_available():
                logger.warning("LLM not available, cannot generate summary")
                return None
            
            # 生成摘要
            summary = await self._generate_summary(full_history)
            
            # 缓存摘要
            self._summary_cache[session_id] = {
                "summary": summary,
                "timestamp": datetime.now()
            }
            
            logger.info(f"Generated summary: session={session_id}, length={len(summary)}")
            
            return summary
        
        except Exception as e:
            logger.error(f"Failed to get context summary: {e}", exc_info=True)
            return None
    
    async def cleanup_expired_sessions(self, expiry_hours: int = 24) -> int:
        """
        清理过期会话
        
        标记指定时间未活动的会话为过期
        
        Args:
            expiry_hours: 会话过期时间（小时），默认 24 小时
        
        Returns:
            int: 清理的会话数量
        """
        try:
            if not self.db:
                logger.warning("Database not available, skipping cleanup")
                return 0
            
            expiry_time = datetime.now() - timedelta(hours=expiry_hours)
            
            # 更新过期会话状态
            count = await self._mark_sessions_expired(expiry_time)
            
            logger.info(f"Marked {count} sessions as expired (inactive for {expiry_hours}+ hours)")
            
            return count
        
        except Exception as e:
            logger.error(f"Failed to cleanup expired sessions: {e}", exc_info=True)
            return 0
    
    async def delete_old_data(self, days: int = 30) -> Dict[str, int]:
        """
        删除旧数据
        
        删除指定天数之前的过期会话和对话记录
        
        Args:
            days: 保留天数，默认 30 天（删除 30 天前的数据）
        
        Returns:
            Dict[str, int]: 删除的记录数 {"sessions": count, "conversations": count}
        """
        try:
            if not self.db:
                logger.warning("Database not available, skipping deletion")
                return {"sessions": 0, "conversations": 0}
            
            cutoff_time = datetime.now() - timedelta(days=days)
            
            async with self.db.acquire() as conn:
                # 1. 删除旧的对话记录
                conversations_deleted = await conn.execute(
                    """
                    DELETE FROM agent_conversations
                    WHERE created_at < $1
                    """,
                    cutoff_time
                )
                
                # 2. 删除旧的过期会话
                sessions_deleted = await conn.execute(
                    """
                    DELETE FROM agent_sessions
                    WHERE is_expired = true
                      AND last_active < $1
                    """,
                    cutoff_time
                )
                
                result = {
                    "sessions": int(sessions_deleted.split()[-1]) if sessions_deleted else 0,
                    "conversations": int(conversations_deleted.split()[-1]) if conversations_deleted else 0
                }
                
                logger.info(
                    f"Deleted old data: {result['sessions']} sessions, "
                    f"{result['conversations']} conversations (older than {days} days)"
                )
                
                return result
        
        except Exception as e:
            logger.error(f"Failed to delete old data: {e}", exc_info=True)
            return {"sessions": 0, "conversations": 0}
    
    async def _insert_conversation(self, data: Dict[str, Any]) -> None:
        """
        插入对话记录到数据库
        
        Args:
            data: 对话数据
        """
        if not self.db:
            raise Exception("Database connection not available")
        
        # 使用 asyncpg 插入数据
        query = """
            INSERT INTO agent_conversations 
            (session_id, user_query, agent_response, steps, plan, evaluation, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """
        
        import json
        
        async with self.db.acquire() as conn:
            await conn.execute(
                query,
                data["session_id"],
                data["query"],
                data["response"],
                json.dumps(data["metadata"]["steps"]),
                json.dumps(data["metadata"]["plan"]),
                json.dumps(data["metadata"]["evaluation"]),
                data["created_at"]
            )
    
    async def _query_conversations(
        self,
        session_id: str,
        limit: int
    ) -> List[Dict[str, Any]]:
        """
        查询对话记录
        
        Args:
            session_id: 会话 ID
            limit: 最多返回的记录数
        
        Returns:
            List[Dict]: 对话记录列表
        """
        if not self.db:
            return []
        
        # 使用 asyncpg 查询数据
        query = """
            SELECT session_id, user_query, agent_response, steps, plan, evaluation, created_at
            FROM agent_conversations
            WHERE session_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        """
        
        import json
        
        async with self.db.acquire() as conn:
            rows = await conn.fetch(query, session_id, limit)
        
        # 转换为字典列表
        result = []
        for row in rows:
            result.append({
                "session_id": row["session_id"],
                "query": row["user_query"],
                "response": row["agent_response"],
                "success": True,  # 默认成功
                "steps_count": len(json.loads(row["steps"])) if row["steps"] else 0,
                "execution_time": 0.0,  # 暂时不存储执行时间
                "metadata": {
                    "steps": json.loads(row["steps"]) if row["steps"] else [],
                    "plan": json.loads(row["plan"]) if row["plan"] else {},
                    "evaluation": json.loads(row["evaluation"]) if row["evaluation"] else {},
                },
                "created_at": row["created_at"]
            })
        
        return result
    
    async def _update_session_activity(
        self,
        session_id: str,
        user_id: Optional[str] = None
    ) -> None:
        """
        更新会话最后活动时间
        
        Args:
            session_id: 会话 ID
            user_id: 用户 ID（可选）
        """
        if not self.db:
            return
        
        # 使用 asyncpg 更新或插入会话记录
        query = """
            INSERT INTO agent_sessions (session_id, user_id, last_active, created_at)
            VALUES ($1, $2, $3, $3)
            ON CONFLICT (session_id)
            DO UPDATE SET last_active = $3, user_id = COALESCE($2, agent_sessions.user_id)
        """
        
        async with self.db.acquire() as conn:
            await conn.execute(query, session_id, user_id, datetime.now())
    
    async def _mark_sessions_expired(self, expiry_time: datetime) -> int:
        """
        标记过期会话
        
        Args:
            expiry_time: 过期时间阈值
        
        Returns:
            int: 标记的会话数量
        """
        if not self.db:
            return 0
        
        # 使用 asyncpg 删除过期会话
        query = """
            DELETE FROM agent_sessions
            WHERE last_active < $1
        """
        
        async with self.db.acquire() as conn:
            result = await conn.execute(query, expiry_time)
        
        # 从结果中提取受影响的行数
        # asyncpg 返回格式: "DELETE N"
        return int(result.split()[-1]) if result and result.startswith("DELETE") else 0
    
    async def _generate_summary(self, history: List[Dict[str, Any]]) -> str:
        """
        使用 LLM 生成对话摘要
        
        Args:
            history: 对话历史列表
        
        Returns:
            str: 摘要文本
        """
        try:
            # 构建摘要提示
            prompt = self._build_summary_prompt(history)
            
            # 调用 LLM
            summary = await self.llm_service.generate_text(
                prompt,
                temperature=0.5,
                max_tokens=300
            )
            
            return summary.strip()
        
        except Exception as e:
            logger.error(f"Failed to generate summary: {e}", exc_info=True)
            # 降级：返回简单摘要
            return self._simple_summary(history)
    
    def _build_summary_prompt(self, history: List[Dict[str, Any]]) -> str:
        """
        构建摘要提示
        
        Args:
            history: 对话历史列表
        
        Returns:
            str: 提示文本
        """
        # 只包含最近的对话
        recent_history = history[:20]
        
        conversation_text = "\n\n".join([
            f"User: {item['query']}\nAssistant: {item['response']}"
            for item in recent_history
        ])
        
        prompt = f"""Please summarize the following conversation between a user and an AI assistant.
Focus on:
1. Main topics discussed
2. Key information exchanged
3. User's goals and preferences
4. Important context for future interactions

Conversation:
{conversation_text}

Summary (2-3 sentences):"""
        
        return prompt
    
    def _simple_summary(self, history: List[Dict[str, Any]]) -> str:
        """
        生成简单摘要（降级方案）
        
        Args:
            history: 对话历史列表
        
        Returns:
            str: 简单摘要
        """
        total_interactions = len(history)
        recent = history[:5]
        
        topics = set()
        for item in recent:
            # 简单提取关键词
            query = item["query"].lower()
            if "新闻" in query or "资讯" in query:
                topics.add("新闻资讯")
            if "天气" in query:
                topics.add("天气查询")
            if "搜索" in query or "查找" in query:
                topics.add("信息搜索")
        
        topics_str = "、".join(topics) if topics else "一般对话"
        
        return f"共 {total_interactions} 次交互，主要涉及：{topics_str}"


# 全局实例
_conversation_memory: Optional[ConversationMemory] = None


def get_conversation_memory(
    db_connection: Optional[Any] = None,
    llm_service: Optional[BaseLLMService] = None
) -> ConversationMemory:
    """
    获取全局 ConversationMemory 实例
    
    Args:
        db_connection: 数据库连接（可选）
        llm_service: LLM 服务（可选）
    
    Returns:
        ConversationMemory: ConversationMemory 实例
    """
    global _conversation_memory
    
    if _conversation_memory is None:
        _conversation_memory = ConversationMemory(db_connection, llm_service)
    
    return _conversation_memory
