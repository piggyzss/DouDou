-- Rollback Migration: Remove Agent Tables
-- Description: Drops agent-related tables and indexes
-- Date: 2024-12-17

-- Drop indexes first
DROP INDEX IF EXISTS idx_agent_conversations_session_id;
DROP INDEX IF EXISTS idx_agent_conversations_created_at;
DROP INDEX IF EXISTS idx_agent_conversations_session_time;
DROP INDEX IF EXISTS idx_agent_sessions_last_active;

-- Drop tables
DROP TABLE IF EXISTS agent_conversations;
DROP TABLE IF EXISTS agent_sessions;
