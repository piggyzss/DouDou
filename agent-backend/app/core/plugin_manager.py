from typing import Dict, List, Optional
from ..models.base import BasePlugin, AgentRequest, AgentResponse
from ..plugins.news_plugin import NewsPlugin
from datetime import datetime


class PluginManager:
    """插件管理器"""

    def __init__(self):
        self.plugins: Dict[str, BasePlugin] = {}
        self.command_map: Dict[str, str] = {}
        self._initialize_plugins()

    def _initialize_plugins(self):
        """初始化插件"""
        # 注册AI资讯插件
        news_plugin = NewsPlugin()
        self.register_plugin(news_plugin)

    def register_plugin(self, plugin: BasePlugin):
        """注册插件"""
        self.plugins[plugin.id] = plugin

        # 注册命令映射
        for command in plugin.commands:
            self.command_map[command.command] = plugin.id

    def get_plugin(self, plugin_id: str) -> Optional[BasePlugin]:
        """获取插件"""
        return self.plugins.get(plugin_id)

    def get_all_plugins(self) -> List[BasePlugin]:
        """获取所有插件"""
        return list(self.plugins.values())

    def get_enabled_plugins(self) -> List[BasePlugin]:
        """获取启用的插件"""
        return [plugin for plugin in self.plugins.values() if plugin.enabled]

    def get_plugin_for_command(self, command: str) -> Optional[str]:
        """获取处理指定命令的插件ID"""
        return self.command_map.get(command)

    def get_all_commands(self) -> List[str]:
        """获取所有可用命令"""
        return list(self.command_map.keys())

    def is_command_valid(self, command: str) -> bool:
        """检查命令是否有效"""
        return command in self.command_map

    async def execute_command(self, request: AgentRequest) -> AgentResponse:
        """执行命令"""
        command = request.command
        plugin_id = self.get_plugin_for_command(command)

        if not plugin_id:
            return AgentResponse(
                success=False,
                error=f"Unknown command: {command}. Type /help for available commands.",
                type="error",
                plugin="system",
                command=command,
                timestamp=datetime.now(),
            )

        plugin = self.get_plugin(plugin_id)
        if not plugin or not plugin.enabled:
            return AgentResponse(
                success=False,
                error=f"Plugin {plugin_id} is not available.",
                type="error",
                plugin=plugin_id,
                command=command,
                timestamp=datetime.now(),
            )

        try:
            return await plugin.execute(request)
        except Exception as e:
            return AgentResponse(
                success=False,
                error=f"Error executing command: {str(e)}",
                type="error",
                plugin=plugin_id,
                command=command,
                timestamp=datetime.now(),
            )


# 全局插件管理器实例
plugin_manager = PluginManager()
