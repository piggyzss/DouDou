from abc import ABC, abstractmethod
from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime


# 导入 ToolDefinition 和 ToolCall（避免循环导入）
try:
    from .tool import ToolDefinition, ToolCall, ToolResult
except ImportError:
    ToolDefinition = None
    ToolCall = None
    ToolResult = None


class AgentRequest(BaseModel):
    """Agent 请求模型 - 自然语言输入"""
    input: str  # 用户输入（自然语言）
    session_id: str = "default"
    user_id: str = ""
    context: Dict[str, Any] = {}  # 上下文信息
    
    # 向后兼容字段（已废弃，仅用于兼容旧版 API）
    command: str = ""  # 废弃，使用 input 代替


class AgentResponse(BaseModel):
    """Agent 响应模型 - 支持传统和 ReactAgent 响应"""
    success: bool
    data: Any = None
    error: str = ""
    type: str = "text"  # text, structured, error, loading
    plugin: str
    command: str
    timestamp: datetime = None
    
    # ReactAgent 扩展字段（可选，向后兼容）
    metadata: Dict[str, Any] = {}  # 包含 steps, plan, evaluation 等
    
    def __init__(self, **data):
        if 'timestamp' not in data or data['timestamp'] is None:
            data['timestamp'] = datetime.now()
        super().__init__(**data)


class BasePlugin(ABC):
    """Agent 插件基类"""

    def __init__(self, name: str, plugin_id: str, description: str):
        self.name = name
        self.id = plugin_id
        self.description = description
        self.enabled = True
        self.tools = self.get_tool_definitions()

    def get_tool_definitions(self) -> List:
        """
        返回工具定义列表
        
        子类应该重写此方法以提供工具定义。
        如果不重写，将返回空列表。
        
        Returns:
            List[ToolDefinition]: 工具定义列表
        """
        return []

    @abstractmethod
    async def execute_tool(self, tool_call) -> Any:
        """
        执行工具调用
        
        子类必须实现此方法以提供工具执行逻辑。
        
        Args:
            tool_call: ToolCall 对象
        
        Returns:
            ToolResult: 工具执行结果
        """
        pass
