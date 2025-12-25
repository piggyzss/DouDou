from typing import Dict, List, Optional
from ..models.base import BasePlugin, AgentRequest, AgentResponse
from ..plugins.news_plugin import NewsPlugin
from datetime import datetime
from loguru import logger


class PluginManager:
    """插件管理器"""

    def __init__(self, tool_registry=None):
        self.plugins: Dict[str, BasePlugin] = {}
        self.tool_registry = tool_registry
        self._initialize_plugins()

    def _initialize_plugins(self):
        """初始化插件"""
        # 注册AI资讯插件
        news_plugin = NewsPlugin()
        self.register_plugin(news_plugin)

    def register_plugin(self, plugin: BasePlugin):
        """注册插件并自动注册工具"""
        self.plugins[plugin.id] = plugin
        
        # 自动注册工具到 Tool Registry
        if self.tool_registry and hasattr(plugin, 'tools'):
            for tool in plugin.tools:
                try:
                    self.tool_registry.register_tool(tool)
                    logger.info(f"Registered tool: {tool.name} from plugin: {plugin.id}")
                except Exception as e:
                    logger.error(f"Failed to register tool {tool.name}: {e}")

    def get_plugin(self, plugin_id: str) -> Optional[BasePlugin]:
        """获取插件"""
        return self.plugins.get(plugin_id)

    def get_all_plugins(self) -> List[BasePlugin]:
        """获取所有插件"""
        return list(self.plugins.values())

    def get_enabled_plugins(self) -> List[BasePlugin]:
        """获取启用的插件"""
        return [plugin for plugin in self.plugins.values() if plugin.enabled]


# 全局插件管理器实例
plugin_manager = PluginManager()
