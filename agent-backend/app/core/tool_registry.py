"""
Tool Registry - 工具注册表

管理所有可用工具的注册、查询和格式化。
提供统一的工具发现和管理接口。
"""

from typing import Dict, List, Optional
from loguru import logger

from ..models.tool import ToolDefinition


class ToolRegistry:
    """
    工具注册表
    
    职责：
    1. 注册和管理所有可用工具
    2. 提供工具查询接口
    3. 将工具格式化为 LLM 可理解的格式
    """
    
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}  # tool_name -> ToolDefinition
        self._plugin_tools: Dict[str, List[str]] = {}  # plugin_id -> [tool_names]
        self._command_to_tool: Dict[str, str] = {}  # command -> tool_name
        logger.info("Tool Registry initialized")
    
    def register_tool(self, tool: ToolDefinition) -> None:
        """
        注册工具
        
        Args:
            tool: 工具定义
        
        Raises:
            ValueError: 如果工具名称已存在
        """
        if tool.name in self._tools:
            logger.warning(f"Tool {tool.name} already registered, overwriting")
        
        # 注册工具
        self._tools[tool.name] = tool
        
        # 更新插件工具映射
        if tool.plugin_id not in self._plugin_tools:
            self._plugin_tools[tool.plugin_id] = []
        if tool.name not in self._plugin_tools[tool.plugin_id]:
            self._plugin_tools[tool.plugin_id].append(tool.name)
        
        # 更新命令映射
        self._command_to_tool[tool.command] = tool.name
        
        logger.info(f"Registered tool: {tool.name} (plugin: {tool.plugin_id}, command: {tool.command})")
    
    def register_tools(self, tools: List[ToolDefinition]) -> None:
        """
        批量注册工具
        
        Args:
            tools: 工具定义列表
        """
        for tool in tools:
            self.register_tool(tool)
    
    def get_tool(self, tool_name: str) -> Optional[ToolDefinition]:
        """
        获取工具定义
        
        Args:
            tool_name: 工具名称
        
        Returns:
            工具定义，如果不存在返回 None
        """
        return self._tools.get(tool_name)
    
    def get_tool_by_command(self, command: str) -> Optional[ToolDefinition]:
        """
        通过命令获取工具
        
        Args:
            command: 命令，如 /latest
        
        Returns:
            工具定义，如果不存在返回 None
        """
        tool_name = self._command_to_tool.get(command)
        if tool_name:
            return self.get_tool(tool_name)
        return None
    
    def get_all_tools(self) -> List[ToolDefinition]:
        """
        获取所有工具
        
        Returns:
            工具定义列表
        """
        return list(self._tools.values())
    
    def get_tools_by_plugin(self, plugin_id: str) -> List[ToolDefinition]:
        """
        获取指定插件的所有工具
        
        Args:
            plugin_id: 插件 ID
        
        Returns:
            工具定义列表
        """
        tool_names = self._plugin_tools.get(plugin_id, [])
        return [self._tools[name] for name in tool_names if name in self._tools]
    
    def get_all_tool_names(self) -> List[str]:
        """
        获取所有工具名称
        
        Returns:
            工具名称列表
        """
        return list(self._tools.keys())
    
    def has_tool(self, tool_name: str) -> bool:
        """
        检查工具是否存在
        
        Args:
            tool_name: 工具名称
        
        Returns:
            是否存在
        """
        return tool_name in self._tools
    
    def remove_tool(self, tool_name: str) -> bool:
        """
        移除工具
        
        Args:
            tool_name: 工具名称
        
        Returns:
            是否成功移除
        """
        if tool_name not in self._tools:
            return False
        
        tool = self._tools[tool_name]
        
        # 从工具字典中移除
        del self._tools[tool_name]
        
        # 从插件工具映射中移除
        if tool.plugin_id in self._plugin_tools:
            if tool_name in self._plugin_tools[tool.plugin_id]:
                self._plugin_tools[tool.plugin_id].remove(tool_name)
        
        # 从命令映射中移除
        if tool.command in self._command_to_tool:
            del self._command_to_tool[tool.command]
        
        logger.info(f"Removed tool: {tool_name}")
        return True
    
    def remove_plugin_tools(self, plugin_id: str) -> int:
        """
        移除指定插件的所有工具
        
        Args:
            plugin_id: 插件 ID
        
        Returns:
            移除的工具数量
        """
        tool_names = self._plugin_tools.get(plugin_id, []).copy()
        count = 0
        
        for tool_name in tool_names:
            if self.remove_tool(tool_name):
                count += 1
        
        if plugin_id in self._plugin_tools:
            del self._plugin_tools[plugin_id]
        
        logger.info(f"Removed {count} tools from plugin: {plugin_id}")
        return count
    
    def clear(self) -> None:
        """清空所有工具"""
        self._tools.clear()
        self._plugin_tools.clear()
        self._command_to_tool.clear()
        logger.info("Tool Registry cleared")
    
    def format_for_llm(self, category: Optional[str] = None) -> str:
        """
        将工具格式化为 LLM 可理解的文本
        
        Args:
            category: 可选的工具分类过滤
        
        Returns:
            格式化的工具描述文本
        """
        tools = self.get_all_tools()
        
        # 按分类过滤
        if category:
            tools = [t for t in tools if t.category == category]
        
        if not tools:
            return "No tools available."
        
        lines = ["Available Tools:", ""]
        
        for i, tool in enumerate(tools, 1):
            lines.append(f"{i}. {tool.to_llm_format()}")
            lines.append("")  # 空行分隔
        
        return "\n".join(lines)
    
    def get_tool_summary(self) -> Dict[str, any]:
        """
        获取工具注册表摘要
        
        Returns:
            包含统计信息的字典
        """
        return {
            "total_tools": len(self._tools),
            "total_plugins": len(self._plugin_tools),
            "tools_by_plugin": {
                plugin_id: len(tool_names)
                for plugin_id, tool_names in self._plugin_tools.items()
            },
            "tool_names": self.get_all_tool_names()
        }


# 全局工具注册表实例
_tool_registry: Optional[ToolRegistry] = None


def get_tool_registry() -> ToolRegistry:
    """获取全局工具注册表实例"""
    global _tool_registry
    
    if _tool_registry is None:
        _tool_registry = ToolRegistry()
    
    return _tool_registry
