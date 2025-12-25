# Design Document: ReAct Agent Upgrade

## Overview

This design document outlines the architecture and implementation strategy for upgrading the existing Agent system from a single-turn tool router to a full ReAct (Reasoning + Acting) Agent with autonomous multi-step execution, conversation memory, task planning, tool orchestration, and self-reflection capabilities.

The upgrade preserves the existing plugin architecture and tool registry while adding new components for reasoning loops, memory management, and intelligent task decomposition. The system will support both legacy command-style inputs and natural language queries, ensuring backward compatibility.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ AgentTerminal    │  │ StepVisualization│                │
│  │ Component        │  │ Component        │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/SSE
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /api/agent/execute (POST) - Execute Agent Query      │  │
│  │ /api/agent/stream (GET) - Stream ReAct Steps (SSE)   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Agent Core Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ ReactAgent   │  │ TaskPlanner  │  │ Reflection   │     │
│  │ Executor     │  │              │  │ Engine       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Tool         │  │ Conversation │  │ Tool         │     │
│  │ Orchestrator │  │ Memory       │  │ Registry     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ LLM Service  │  │ PostgreSQL   │  │ Plugin       │     │
│  │ (Gemini)     │  │ Database     │  │ Manager      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. ReactAgent.execute(query, session_id)                    │
│    ├─ Load conversation history from Memory                 │
│    ├─ Create task plan using TaskPlanner                    │
│    └─ Enter ReAct Loop (max 5 iterations)                   │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ReAct Loop Iteration                                     │
│    ├─ Thought: LLM generates reasoning                      │
│    ├─ Action: Select tool and parameters                    │
│    ├─ Execute: ToolOrchestrator.execute_tool()             │
│    ├─ Observation: Record tool result                       │
│    └─ Reflect: ReflectionEngine.should_continue()          │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Task Completion                                          │
│    ├─ Synthesize final response from history                │
│    ├─ Evaluate output quality                               │
│    ├─ Save conversation to Memory                           │
│    └─ Return response with execution trace                  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. ReactAgent (Core Executor)

**File**: `agent-backend/app/core/react_agent.py`

**Responsibilities**:
- Orchestrate the ReAct loop execution
- Manage iteration state and history
- Coordinate between planner, orchestrator, and reflection engine
- Synthesize final responses

**Key Methods**:
```python
class ReactAgent:
    async def execute(
        self, 
        query: str, 
        session_id: str,
        context: Optional[Dict] = None
    ) -> ReactResponse:
        """Execute a query using the ReAct loop"""
        
    async def _react_iteration(
        self,
        plan: ExecutionPlan,
        history: List[ReActStep]
    ) -> ReActStep:
        """Execute one ReAct iteration"""
        
    async def _synthesize_response(
        self,
        history: List[ReActStep],
        plan: ExecutionPlan
    ) -> str:
        """Generate final response from execution history"""
```

**Data Structures**:
```python
@dataclass
class ReActStep:
    step_number: int
    thought: str
    action: ToolCall
    observation: ToolResult
    status: Literal["pending", "running", "completed", "failed"]
    timestamp: datetime

@dataclass
class ReactResponse:
    success: bool
    response: str
    steps: List[ReActStep]
    plan: ExecutionPlan
    evaluation: QualityEvaluation
    session_id: str
    execution_time: float
```

### 2. TaskPlanner

**File**: `agent-backend/app/core/task_planner.py`

**Responsibilities**:
- Analyze query complexity
- Decompose complex queries into sub-tasks
- Identify required tools and execution order
- Adjust plans based on execution feedback

**Key Methods**:
```python
class TaskPlanner:
    async def create_plan(
        self,
        query: str,
        history: List[Dict]
    ) -> ExecutionPlan:
        """Create an execution plan for the query"""
        
    async def adjust_plan(
        self,
        plan: ExecutionPlan,
        observation: str
    ) -> ExecutionPlan:
        """Adjust plan based on execution results"""
        
    def _classify_complexity(
        self,
        query: str
    ) -> Literal["simple", "medium", "complex"]:
        """Classify query complexity"""
```

**Data Structures**:
```python
@dataclass
class ExecutionPlan:
    query: str
    complexity: Literal["simple", "medium", "complex"]
    steps: List[PlanStep]
    estimated_iterations: int
    
@dataclass
class PlanStep:
    step_number: int
    description: str
    tool_name: str
    parameters: Dict[str, Any]
    required: bool
    depends_on: Optional[int] = None
```

### 3. ConversationMemory

**File**: `agent-backend/app/core/conversation_memory.py`

**Responsibilities**:
- Store and retrieve conversation history
- Manage session lifecycle
- Compress long conversations using summarization
- Handle session expiration

**Key Methods**:
```python
class ConversationMemory:
    async def get_history(
        self,
        session_id: str,
        limit: int = 10
    ) -> List[ConversationTurn]:
        """Retrieve conversation history"""
        
    async def save_interaction(
        self,
        session_id: str,
        query: str,
        response: ReactResponse
    ) -> None:
        """Save a conversation turn"""
        
    async def get_context_summary(
        self,
        session_id: str
    ) -> str:
        """Get compressed summary of long conversations"""
        
    async def cleanup_expired_sessions(
        self,
        hours: int = 24
    ) -> int:
        """Remove expired sessions"""
```

**Database Schema**:
```sql
CREATE TABLE agent_conversations (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_query TEXT NOT NULL,
    agent_response TEXT NOT NULL,
    steps JSONB,
    plan JSONB,
    evaluation JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at)
);

CREATE TABLE agent_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    context JSONB,
    summary TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    INDEX idx_last_active (last_active)
);
```

### 4. ToolOrchestrator

**File**: `agent-backend/app/core/tool_orchestrator.py`

**Responsibilities**:
- Execute tool chains with dependency resolution
- Resolve parameter references from previous results
- Handle tool failures with retry logic
- Cache tool results

**Key Methods**:
```python
class ToolOrchestrator:
    async def execute_tool(
        self,
        tool_call: ToolCall,
        context: Dict[str, Any]
    ) -> ToolResult:
        """Execute a single tool"""
        
    async def execute_chain(
        self,
        tools: List[ToolCall],
        context: Dict[str, Any]
    ) -> List[ToolResult]:
        """Execute a chain of tools"""
        
    def resolve_parameters(
        self,
        parameters: Dict[str, Any],
        previous_results: List[ToolResult]
    ) -> Dict[str, Any]:
        """Resolve parameter references like ${step1.result}"""
```

### 5. ReflectionEngine

**File**: `agent-backend/app/core/reflection_engine.py`

**Responsibilities**:
- Evaluate output completeness and quality
- Determine if task is complete
- Identify missing information
- Prevent infinite loops

**Key Methods**:
```python
class ReflectionEngine:
    async def evaluate_output(
        self,
        output: str,
        plan: ExecutionPlan
    ) -> QualityEvaluation:
        """Evaluate output quality"""
        
    def should_continue(
        self,
        history: List[ReActStep],
        plan: ExecutionPlan
    ) -> bool:
        """Determine if more iterations are needed"""
```

**Data Structures**:
```python
@dataclass
class QualityEvaluation:
    completeness_score: int  # 0-10
    quality_score: int  # 0-10
    missing_info: List[str]
    needs_retry: bool
    suggestions: List[str]
```

## Data Models

### Core Data Models

```python
# agent-backend/app/models/react.py

from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime

@dataclass
class ReActStep:
    """Represents one iteration of the ReAct loop"""
    step_number: int
    thought: str
    action: ToolCall
    observation: ToolResult
    status: Literal["pending", "running", "completed", "failed"]
    timestamp: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_number": self.step_number,
            "thought": self.thought,
            "action": self.action.to_dict(),
            "observation": self.observation.to_dict(),
            "status": self.status,
            "timestamp": self.timestamp.isoformat()
        }

@dataclass
class ExecutionPlan:
    """Task execution plan"""
    query: str
    complexity: Literal["simple", "medium", "complex"]
    steps: List[PlanStep]
    estimated_iterations: int
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "query": self.query,
            "complexity": self.complexity,
            "steps": [step.to_dict() for step in self.steps],
            "estimated_iterations": self.estimated_iterations
        }

@dataclass
class PlanStep:
    """Individual step in execution plan"""
    step_number: int
    description: str
    tool_name: str
    parameters: Dict[str, Any]
    required: bool
    depends_on: Optional[int] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_number": self.step_number,
            "description": self.description,
            "tool_name": self.tool_name,
            "parameters": self.parameters,
            "required": self.required,
            "depends_on": self.depends_on
        }

@dataclass
class QualityEvaluation:
    """Output quality evaluation"""
    completeness_score: int
    quality_score: int
    missing_info: List[str]
    needs_retry: bool
    suggestions: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "completeness_score": self.completeness_score,
            "quality_score": self.quality_score,
            "missing_info": self.missing_info,
            "needs_retry": self.needs_retry,
            "suggestions": self.suggestions
        }

@dataclass
class ReactResponse:
    """Complete ReAct execution response"""
    success: bool
    response: str
    steps: List[ReActStep]
    plan: ExecutionPlan
    evaluation: QualityEvaluation
    session_id: str
    execution_time: float
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "response": self.response,
            "steps": [step.to_dict() for step in self.steps],
            "plan": self.plan.to_dict(),
            "evaluation": self.evaluation.to_dict(),
            "session_id": self.session_id,
            "execution_time": self.execution_time,
            "error": self.error
        }

@dataclass
class ConversationTurn:
    """One turn in a conversation"""
    id: int
    session_id: str
    user_query: str
    agent_response: str
    steps: List[Dict[str, Any]]
    created_at: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "user_query": self.user_query,
            "agent_response": self.agent_response,
            "steps": self.steps,
            "created_at": self.created_at.isoformat()
        }
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### ReAct Loop Properties

**Property 1: Maximum iteration bound**
*For any* user query, the ReAct loop should never exceed 5 iterations
**Validates: Requirements 1.1**

**Property 2: Thought completeness**
*For any* ReActStep in the execution history, the thought field should be non-empty
**Validates: Requirements 1.2**

**Property 3: Action follows thought**
*For any* iteration with a thought, there must be a corresponding action (ToolCall)
**Validates: Requirements 1.3**

**Property 4: Observation follows action**
*For any* action executed, there must be a corresponding observation (ToolResult)
**Validates: Requirements 1.4**

**Property 5: Response completeness**
*For any* completed ReAct loop, the ReactResponse must contain both a final response string and a complete execution trace (steps)
**Validates: Requirements 1.7**

### Conversation Memory Properties

**Property 6: Session uniqueness**
*For any* two new conversations started independently, their session_ids should be unique
**Validates: Requirements 2.1**

**Property 7: History retrieval**
*For any* query processed, the system should load conversation history before execution
**Validates: Requirements 2.2**

**Property 8: Persistence round-trip**
*For any* conversation interaction saved to memory, retrieving it should return the same data
**Validates: Requirements 2.3**

**Property 9: History compression trigger**
*For any* session with more than 10 interactions, the system should compress older messages when loading history
**Validates: Requirements 10.5**

### Task Planning Properties

**Property 10: Complexity classification**
*For any* user query, the Task Planner should classify it as exactly one of: simple, medium, or complex
**Validates: Requirements 3.2**

**Property 11: Complex query decomposition**
*For any* query classified as complex, the execution plan should contain at least 2 steps
**Validates: Requirements 3.3**

**Property 12: Plan structure completeness**
*For any* PlanStep in an ExecutionPlan, it must have a non-empty tool_name
**Validates: Requirements 3.4**

**Property 13: Plan estimation**
*For any* ExecutionPlan created, it must have an estimated_iterations value greater than 0
**Validates: Requirements 3.5**

**Property 14: Plan adaptation**
*For any* plan where a sub-task fails, calling adjust_plan should return a modified plan
**Validates: Requirements 3.6**

### Tool Orchestration Properties

**Property 15: Execution order preservation**
*For any* tool chain, tools should be executed in the order specified in the plan
**Validates: Requirements 4.1**

**Property 16: Parameter resolution**
*For any* tool parameter containing a reference like ${step1.result}, it should be resolved to the actual value from previous results
**Validates: Requirements 4.2**

**Property 17: Required tool failure halts chain**
*For any* tool chain where a required tool fails, execution should halt and no subsequent tools should execute
**Validates: Requirements 4.3**

**Property 18: Optional tool failure continues chain**
*For any* tool chain where an optional tool fails, execution should continue with remaining tools
**Validates: Requirements 4.4**

**Property 19: Result aggregation**
*For any* tool chain execution, the returned results list should have the same length as the number of tools executed
**Validates: Requirements 4.5**

**Property 20: Caching prevents redundant execution**
*For any* tool executed twice with identical parameters within 5 minutes, the second execution should return cached results without re-executing
**Validates: Requirements 4.6, 10.2**

### Reflection and Quality Properties

**Property 21: Completeness score range**
*For any* QualityEvaluation, the completeness_score should be between 0 and 10 inclusive
**Validates: Requirements 5.1**

**Property 22: Quality score range**
*For any* QualityEvaluation, the quality_score should be between 0 and 10 inclusive
**Validates: Requirements 5.2**

**Property 23: Low score triggers retry**
*For any* evaluation with completeness_score < 7, needs_retry should be True
**Validates: Requirements 5.3**

**Property 24: High score completes task**
*For any* evaluation with completeness_score >= 8, needs_retry should be False
**Validates: Requirements 5.4**

**Property 25: Iteration limit prevents infinite loops**
*For any* ReAct execution where iterations exceed estimated_iterations + 2, should_continue should return False
**Validates: Requirements 5.6**

### Error Handling Properties

**Property 26: Tool failure captured in observation**
*For any* tool execution that fails, the observation should contain error information
**Validates: Requirements 9.1**

**Property 27: Maximum iterations generates response**
*For any* execution that reaches maximum iterations, a final response should still be synthesized
**Validates: Requirements 9.4**

**Property 28: Structured error responses**
*For any* unexpected exception, the error response should have success=False and a non-empty error field
**Validates: Requirements 9.5**

### Performance Optimization Properties

**Property 29: Simple query optimization**
*For any* query classified as simple, the system should skip detailed task planning
**Validates: Requirements 10.1**

### Backward Compatibility Properties

**Property 30: Command input compatibility**
*For any* input starting with "/", the system should process it using the legacy command parser
**Validates: Requirements 8.1**

**Property 31: Response schema compatibility**
*For any* ReactResponse, it should be serializable to a format compatible with the legacy AgentResponse schema
**Validates: Requirements 8.4**

## Error Handling

### Error Categories

1. **LLM Service Errors**
   - Service unavailable
   - Rate limiting
   - Invalid responses
   - **Handling**: Retry with exponential backoff, fallback to simpler models, return user-friendly error

2. **Tool Execution Errors**
   - Tool not found
   - Invalid parameters
   - Execution timeout
   - Plugin unavailable
   - **Handling**: Log error, include in observation, allow ReAct loop to adapt

3. **Database Errors**
   - Connection failure
   - Query timeout
   - Schema mismatch
   - **Handling**: Fallback to in-memory storage, log for admin review

4. **Validation Errors**
   - Invalid session_id
   - Malformed query
   - Missing required parameters
   - **Handling**: Return 400 Bad Request with clear error message

5. **System Errors**
   - Out of memory
   - Unexpected exceptions
   - **Handling**: Log with full stack trace, return 500 with sanitized error

### Error Response Format

```python
@dataclass
class ErrorResponse:
    success: bool = False
    error: str
    error_type: str  # "llm_error", "tool_error", "db_error", etc.
    details: Optional[Dict[str, Any]] = None
    suggestions: List[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)
```

### Retry Strategy

- **LLM calls**: 3 retries with exponential backoff (1s, 2s, 4s)
- **Tool execution**: 2 retries for transient errors
- **Database operations**: 3 retries with 500ms delay
- **No retry**: Validation errors, user errors

## Testing Strategy

### Unit Testing

**Test Coverage Areas**:
1. **ReactAgent**: Loop logic, iteration management, response synthesis
2. **TaskPlanner**: Complexity classification, plan generation, plan adjustment
3. **ConversationMemory**: CRUD operations, summarization, expiration
4. **ToolOrchestrator**: Chain execution, parameter resolution, caching
5. **ReflectionEngine**: Quality evaluation, continuation logic

**Testing Framework**: pytest with pytest-asyncio for async tests

**Mock Strategy**:
- Mock LLM service responses for deterministic testing
- Mock database with in-memory SQLite
- Mock tool executions with predefined results

### Property-Based Testing

**Property Testing Library**: Hypothesis (Python)

**Configuration**: Each property test should run a minimum of 100 iterations

**Test Tagging Format**: `# Feature: react-agent-upgrade, Property {number}: {property_text}`

**Key Properties to Test**:
1. Maximum iteration bound (Property 1)
2. Thought completeness (Property 2)
3. Session uniqueness (Property 6)
4. Complexity classification (Property 10)
5. Parameter resolution (Property 16)
6. Score range validation (Properties 21-22)
7. Caching behavior (Property 20)

**Example Property Test**:
```python
from hypothesis import given, strategies as st

# Feature: react-agent-upgrade, Property 1: Maximum iteration bound
@given(query=st.text(min_size=1, max_size=500))
async def test_max_iteration_bound(query):
    """For any user query, the ReAct loop should never exceed 5 iterations"""
    agent = ReactAgent()
    response = await agent.execute(query, session_id="test")
    assert len(response.steps) <= 5
```

### Integration Testing

**Test Scenarios**:
1. End-to-end ReAct loop with real LLM (using test API key)
2. Database persistence and retrieval
3. Multi-turn conversation flow
4. Tool chain execution with dependencies
5. Error recovery and fallback mechanisms

**Test Environment**: Docker Compose with PostgreSQL, Redis (optional), and test LLM endpoint

### Frontend Testing

**Testing Framework**: Jest + React Testing Library

**Test Coverage**:
1. AgentTerminal component rendering
2. Step visualization updates
3. Streaming response handling
4. Error state display
5. Loading indicators

## Implementation Notes

### LLM Prompt Engineering

**Task Planning Prompt Template**:
```
You are a task planning assistant. Analyze the following user query and create an execution plan.

User Query: {query}
Conversation History: {history}

Available Tools:
{tools_description}

Classify the query complexity (simple/medium/complex) and break it down into steps.
For each step, specify:
- Description
- Tool to use
- Parameters needed
- Whether it's required or optional
- Dependencies on previous steps

Return your response as JSON following this schema:
{
  "complexity": "simple|medium|complex",
  "steps": [
    {
      "step_number": 1,
      "description": "...",
      "tool_name": "...",
      "parameters": {},
      "required": true,
      "depends_on": null
    }
  ],
  "estimated_iterations": 3
}
```

**ReAct Iteration Prompt Template**:
```
You are an intelligent agent executing a task using the ReAct (Reasoning + Acting) framework.

Task: {query}
Execution Plan: {plan}
Current Progress: {history}

Think step-by-step:
1. What have we accomplished so far?
2. What's the next action needed?
3. Which tool should we use and with what parameters?

Respond in JSON format:
{
  "thought": "Your reasoning about the next step",
  "tool_name": "name_of_tool_to_use",
  "parameters": {
    "param1": "value1"
  }
}
```

**Reflection Prompt Template**:
```
Evaluate the quality of this agent response:

Original Query: {query}
Execution Plan: {plan}
Agent Response: {response}

Rate the response on:
1. Completeness (0-10): Does it fully answer the query?
2. Quality (0-10): Is it accurate and well-formatted?
3. Missing Information: What's missing, if anything?

Return JSON:
{
  "completeness_score": 8,
  "quality_score": 9,
  "missing_info": [],
  "needs_retry": false,
  "suggestions": []
}
```

### Database Indexing Strategy

```sql
-- Optimize session lookups
CREATE INDEX idx_session_id ON agent_conversations(session_id);
CREATE INDEX idx_created_at ON agent_conversations(created_at);

-- Optimize session expiration queries
CREATE INDEX idx_last_active ON agent_sessions(last_active);

-- Composite index for common queries
CREATE INDEX idx_session_time ON agent_conversations(session_id, created_at DESC);
```

### Caching Strategy

**Tool Result Cache**:
- **Storage**: In-memory dictionary with TTL
- **Key**: Hash of (tool_name, parameters)
- **TTL**: 5 minutes
- **Eviction**: LRU when memory limit reached

**Conversation Summary Cache**:
- **Storage**: Redis (if available) or in-memory
- **Key**: session_id
- **TTL**: 1 hour
- **Invalidation**: On new conversation turn

### Performance Targets

- **Simple query response**: < 2 seconds
- **Complex query response**: < 10 seconds
- **Database query**: < 100ms
- **LLM call**: < 3 seconds (depends on provider)
- **Memory per session**: < 1MB
- **Concurrent sessions**: 100+

### Security Considerations

1. **Input Validation**: Sanitize all user inputs to prevent injection attacks
2. **Session Isolation**: Ensure sessions cannot access each other's data
3. **Rate Limiting**: Limit requests per session to prevent abuse
4. **Error Sanitization**: Don't expose internal errors to users
5. **Database Security**: Use parameterized queries, principle of least privilege

### Monitoring and Observability

**Metrics to Track**:
- Average iterations per query
- Tool execution success rate
- LLM call latency
- Database query performance
- Session duration
- Error rates by type

**Logging Strategy**:
- **DEBUG**: Detailed execution traces
- **INFO**: Query start/end, tool selections
- **WARNING**: Retries, fallbacks
- **ERROR**: Failures with stack traces

**Log Format**:
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "INFO",
  "session_id": "abc123",
  "component": "ReactAgent",
  "message": "ReAct iteration completed",
  "data": {
    "iteration": 2,
    "tool": "news_search",
    "success": true,
    "duration_ms": 1234
  }
}
```
