"""
测试 ReAct Agent 重构后的功能

验证新的三步 API（_reason, _act, _observe）是否正常工作
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime

from app.core.react_agent import ReactAgent
from app.models.react import ExecutionPlan, PlanStep, ReActStep
from app.models.tool import ToolCall, ToolResult


@pytest.fixture
def mock_llm_service():
    """创建模拟的 LLM 服务"""
    mock = Mock()
    mock.is_available = Mock(return_value=True)
    mock.generate_text = AsyncMock(return_value="I need to search for information")
    mock.generate_text_stream = AsyncMock()
    
    # 模拟流式生成
    async def mock_stream(*args, **kwargs):
        chunks = ["I ", "need ", "to ", "search"]
        for chunk in chunks:
            yield chunk
    
    mock.generate_text_stream.return_value = mock_stream()
    return mock


@pytest.fixture
def mock_tool_registry():
    """创建模拟的工具注册表"""
    mock = Mock()
    mock_tool = Mock()
    mock_tool.name = "search"
    mock_tool.description = "Search for information"
    mock_tool.parameters = []
    mock.get_all_tools = Mock(return_value=[mock_tool])
    return mock


@pytest.fixture
def mock_tool_orchestrator():
    """创建模拟的工具编排器"""
    mock = Mock()
    mock.execute_tool = AsyncMock(return_value=ToolResult(
        success=True,
        data="Search results",
        execution_time=0.5,
        tool_name="search"
    ))
    return mock


@pytest.fixture
def simple_plan():
    """创建简单的执行计划"""
    return ExecutionPlan(
        query="Test query",
        complexity="simple",
        steps=[
            PlanStep(
                step_number=1,
                description="Search for information",
                tool_name="search",
                parameters={},
                required=True
            )
        ],
        estimated_iterations=1
    )


@pytest.mark.asyncio
async def test_reason_generates_thought(mock_llm_service, mock_tool_registry, simple_plan):
    """测试 _reason() 方法生成思考"""
    agent = ReactAgent(
        llm_service=mock_llm_service,
        tool_registry=mock_tool_registry
    )
    
    thought = await agent._reason(
        query="Test query",
        plan=simple_plan,
        history=[],
        context={},
        iteration=1
    )
    
    assert isinstance(thought, str)
    assert len(thought) > 0
    assert mock_llm_service.generate_text.called


@pytest.mark.asyncio
async def test_reason_streams_chunks(mock_llm_service, mock_tool_registry, simple_plan):
    """测试 _reason() 方法发送流式事件"""
    agent = ReactAgent(
        llm_service=mock_llm_service,
        tool_registry=mock_tool_registry
    )
    
    callback_calls = []
    
    async def mock_callback(event_type, data):
        callback_calls.append((event_type, data))
    
    # 重新设置流式生成模拟
    async def mock_stream(*args, **kwargs):
        chunks = ["I ", "need ", "to ", "search"]
        for chunk in chunks:
            yield chunk
    
    mock_llm_service.generate_text_stream = AsyncMock(return_value=mock_stream())
    
    thought = await agent._reason(
        query="Test query",
        plan=simple_plan,
        history=[],
        context={},
        iteration=1,
        streaming_callback=mock_callback
    )
    
    # 验证回调被调用
    thought_chunks = [call for call in callback_calls if call[0] == "thought_chunk"]
    assert len(thought_chunks) > 0


@pytest.mark.asyncio
async def test_act_selects_tool(mock_llm_service, mock_tool_registry, simple_plan):
    """测试 _act() 方法选择工具"""
    # 模拟 LLM 返回 JSON 格式的行动
    mock_llm_service.generate_text = AsyncMock(return_value='''
    {
        "tool_name": "search",
        "parameters": {"query": "test"},
        "reasoning": "Need to search"
    }
    ''')
    
    agent = ReactAgent(
        llm_service=mock_llm_service,
        tool_registry=mock_tool_registry
    )
    
    tool_call = await agent._act(
        query="Test query",
        thought="I need to search",
        plan=simple_plan,
        history=[],
        context={},
        iteration=1
    )
    
    assert isinstance(tool_call, ToolCall)
    assert tool_call.tool_name == "search"
    assert tool_call.parameters == {"query": "test"}


@pytest.mark.asyncio
async def test_act_sends_action_event(mock_llm_service, mock_tool_registry, simple_plan):
    """测试 _act() 方法发送 action 事件"""
    mock_llm_service.generate_text = AsyncMock(return_value='''
    {
        "tool_name": "search",
        "parameters": {"query": "test"},
        "reasoning": "Need to search"
    }
    ''')
    
    agent = ReactAgent(
        llm_service=mock_llm_service,
        tool_registry=mock_tool_registry
    )
    
    callback_calls = []
    
    async def mock_callback(event_type, data):
        callback_calls.append((event_type, data))
    
    tool_call = await agent._act(
        query="Test query",
        thought="I need to search",
        plan=simple_plan,
        history=[],
        context={},
        iteration=1,
        streaming_callback=mock_callback
    )
    
    # 验证 action 事件被发送
    action_events = [call for call in callback_calls if call[0] == "action"]
    assert len(action_events) == 1
    assert action_events[0][1]["tool_name"] == "search"


@pytest.mark.asyncio
async def test_observe_executes_tool(mock_tool_orchestrator):
    """测试 _observe() 方法执行工具"""
    agent = ReactAgent(
        tool_orchestrator=mock_tool_orchestrator
    )
    
    tool_call = ToolCall(
        tool_name="search",
        parameters={"query": "test"},
        reasoning="test",
        confidence=1.0,
        source="test"
    )
    
    observation = await agent._observe(tool_call, iteration=1)
    
    assert isinstance(observation, ToolResult)
    assert observation.success is True
    assert observation.tool_name == "search"
    assert mock_tool_orchestrator.execute_tool.called


@pytest.mark.asyncio
async def test_observe_sends_observation_event(mock_tool_orchestrator):
    """测试 _observe() 方法发送 observation 事件"""
    agent = ReactAgent(
        tool_orchestrator=mock_tool_orchestrator
    )
    
    callback_calls = []
    
    async def mock_callback(event_type, data):
        callback_calls.append((event_type, data))
    
    tool_call = ToolCall(
        tool_name="search",
        parameters={"query": "test"},
        reasoning="test",
        confidence=1.0,
        source="test"
    )
    
    observation = await agent._observe(
        tool_call,
        iteration=1,
        streaming_callback=mock_callback
    )
    
    # 验证 observation 事件被发送
    observation_events = [call for call in callback_calls if call[0] == "observation"]
    assert len(observation_events) == 1
    assert observation_events[0][1]["success"] is True


@pytest.mark.asyncio
async def test_react_iteration_complete_flow(
    mock_llm_service,
    mock_tool_registry,
    mock_tool_orchestrator,
    simple_plan
):
    """测试 _react_iteration() 完整流程"""
    # 设置 LLM 模拟
    async def mock_stream(*args, **kwargs):
        chunks = ["I ", "need ", "to ", "search"]
        for chunk in chunks:
            yield chunk
    
    mock_llm_service.generate_text_stream = AsyncMock(return_value=mock_stream())
    mock_llm_service.generate_text = AsyncMock(return_value='''
    {
        "tool_name": "search",
        "parameters": {"query": "test"},
        "reasoning": "Need to search"
    }
    ''')
    
    agent = ReactAgent(
        llm_service=mock_llm_service,
        tool_registry=mock_tool_registry,
        tool_orchestrator=mock_tool_orchestrator
    )
    
    step = await agent._react_iteration(
        query="Test query",
        plan=simple_plan,
        history=[],
        context={},
        iteration=1
    )
    
    # 验证返回的步骤完整
    assert isinstance(step, ReActStep)
    assert step.thought is not None
    assert step.action is not None
    assert step.observation is not None
    assert step.status in ["completed", "failed"]


@pytest.mark.asyncio
async def test_react_iteration_streaming_order(
    mock_llm_service,
    mock_tool_registry,
    mock_tool_orchestrator,
    simple_plan
):
    """测试 _react_iteration() 流式事件顺序"""
    # 设置 LLM 模拟
    async def mock_stream(*args, **kwargs):
        chunks = ["I ", "need ", "to ", "search"]
        for chunk in chunks:
            yield chunk
    
    mock_llm_service.generate_text_stream = AsyncMock(return_value=mock_stream())
    mock_llm_service.generate_text = AsyncMock(return_value='''
    {
        "tool_name": "search",
        "parameters": {"query": "test"},
        "reasoning": "Need to search"
    }
    ''')
    
    agent = ReactAgent(
        llm_service=mock_llm_service,
        tool_registry=mock_tool_registry,
        tool_orchestrator=mock_tool_orchestrator
    )
    
    events = []
    
    async def capture_callback(event_type, data):
        events.append(event_type)
    
    step = await agent._react_iteration(
        query="Test query",
        plan=simple_plan,
        history=[],
        context={},
        iteration=1,
        streaming_callback=capture_callback
    )
    
    # 验证事件顺序：thought_chunk → action → observation
    assert "thought_chunk" in events
    assert "action" in events
    assert "observation" in events
    
    # 验证 action 在 thought_chunk 之后
    first_thought_idx = events.index("thought_chunk")
    action_idx = events.index("action")
    observation_idx = events.index("observation")
    
    assert action_idx > first_thought_idx
    assert observation_idx > action_idx


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
