from abc import ABC, abstractmethod
from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime


class AgentCommand(BaseModel):
    command: str
    description: str
    usage: str
    examples: List[str]


class AgentRequest(BaseModel):
    """Agent 请求模型 - 支持命令和自然语言输入"""
    input: str  # 用户输入（命令或自然语言）
    session_id: str = "default"
    user_id: str = ""
    context: Dict[str, Any] = {}  # 上下文信息
    
    # 保留向后兼容（废弃）
    command: str = ""  # 废弃，使用 input 代替
    params: Dict[str, Any] = {}


class AgentResponse(BaseModel):
    success: bool
    data: Any = None
    error: str = ""
    type: str = "text"  # text, structured, error, loading
    plugin: str
    command: str
    timestamp: datetime = datetime.now()


class BasePlugin(ABC):
    """Agent插件基类"""

    def __init__(self, name: str, plugin_id: str, description: str):
        self.name = name
        self.id = plugin_id
        self.description = description
        self.enabled = True
        self.commands = self.get_commands()

    @abstractmethod
    def get_commands(self) -> List[AgentCommand]:
        """返回插件支持的命令列表"""
        pass

    @abstractmethod
    async def execute(self, request: AgentRequest) -> AgentResponse:
        """执行命令"""
        pass

    def is_command_supported(self, command: str) -> bool:
        """检查命令是否被支持"""
        return any(cmd.command == command for cmd in self.commands)
