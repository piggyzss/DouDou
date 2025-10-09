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
    command: str
    params: Dict[str, Any] = {}
    session_id: str = "default"
    user_id: str = ""


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
