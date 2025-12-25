-- Migration: Add Agent Tables
-- Description: Creates tables for ReAct agent conversation storage and session management
-- Date: 2024-12-17

-- Agent conversations table - stores individual conversation turns
CREATE TABLE IF NOT EXISTS agent_conversations (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_query TEXT NOT NULL,
    agent_response TEXT NOT NULL,
    steps JSONB,
    plan JSONB,
    evaluation JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent sessions table - stores session metadata and context
CREATE TABLE IF NOT EXISTS agent_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    context JSONB,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_agent_conversations_session_id ON agent_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_created_at ON agent_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_session_time ON agent_conversations(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_last_active ON agent_sessions(last_active);

-- Add comments for documentation
COMMENT ON TABLE agent_conversations IS 'Stores individual conversation turns with execution details';
COMMENT ON TABLE agent_sessions IS 'Stores session metadata and conversation context';
COMMENT ON COLUMN agent_conversations.steps IS 'JSON array of ReActStep objects from execution';
COMMENT ON COLUMN agent_conversations.plan IS 'JSON object containing the ExecutionPlan';
COMMENT ON COLUMN agent_conversations.evaluation IS 'JSON object containing QualityEvaluation';
COMMENT ON COLUMN agent_sessions.context IS 'JSON object containing session context and metadata';
COMMENT ON COLUMN agent_sessions.summary IS 'Compressed summary of conversation history for long sessions';
