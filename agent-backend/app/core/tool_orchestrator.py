"""
Tool Orchestrator - 工具编排器

职责：
1. 执行单个工具调用
2. 执行工具链（多个工具按顺序）
3. 解析参数引用（${step1.result}）
4. 缓存工具结果
5. 处理工具执行错误
"""

import time
import hashlib
import json
from typing import Dict, Any, Optional, List, TYPE_CHECKING
from datetime import datetime, timedelta
from loguru import logger

from ..models.tool import ToolCall, ToolResult
from ..models.react import PlanStep
from ..core.tool_registry import ToolRegistry, get_tool_registry

# 避免循环导入
if TYPE_CHECKING:
    from ..core.plugin_manager import PluginManager


class ToolOrchestrator:
    """
    工具编排器
    
    功能：
    - 执行单个工具
    - 执行工具链
    - 参数解析（支持 ${stepN.result} 引用）
    - 结果缓存（5 分钟 TTL）
    - 错误处理
    """
    
    # 缓存配置
    CACHE_TTL_SECONDS = 300  # 5 分钟
    MAX_CACHE_SIZE = 100  # 最多缓存 100 个结果
    
    def __init__(
        self,
        tool_registry: Optional[ToolRegistry] = None,
        plugin_manager: Optional['PluginManager'] = None
    ):
        """
        初始化工具编排器
        
        Args:
            tool_registry: 工具注册表
            plugin_manager: 插件管理器
        """
        self.tool_registry = tool_registry or get_tool_registry()
        self.plugin_manager = plugin_manager
        
        # 结果缓存: {cache_key: {"result": ToolResult, "timestamp": datetime}}
        self._cache: Dict[str, Dict[str, Any]] = {}
        
        logger.info("ToolOrchestrator initialized")
    
    async def execute_tool(
        self,
        tool_call: ToolCall,
        use_cache: bool = True
    ) -> ToolResult:
        """
        执行单个工具
        
        Args:
            tool_call: 工具调用对象
            use_cache: 是否使用缓存
        
        Returns:
            ToolResult: 工具执行结果
        """
        start_time = time.time()
        
        try:
            # 检查缓存
            if use_cache:
                cached_result = self._get_cached_result(tool_call)
                if cached_result:
                    logger.info(f"Using cached result for {tool_call.tool_name}")
                    return cached_result
            
            # 获取工具定义
            tool_def = self.tool_registry.get_tool(tool_call.tool_name)
            
            if not tool_def:
                logger.warning(f"Tool not found: {tool_call.tool_name}")
                return ToolResult(
                    success=False,
                    error=f"Tool not found: {tool_call.tool_name}",
                    execution_time=0.0,
                    tool_name=tool_call.tool_name
                )
            
            logger.info(f"Executing tool: {tool_call.tool_name} with parameters: {tool_call.parameters}")
            
            # 检查 plugin_manager
            if not self.plugin_manager:
                logger.error("Plugin manager not available")
                return ToolResult(
                    success=False,
                    error="Plugin manager not available",
                    execution_time=0.0,
                    tool_name=tool_call.tool_name
                )
            
            # 获取对应的插件
            plugin = self.plugin_manager.get_plugin(tool_def.plugin_id)
            
            if not plugin or not plugin.enabled:
                logger.warning(f"Plugin not available: {tool_def.plugin_id}")
                return ToolResult(
                    success=False,
                    error=f"Plugin not available: {tool_def.plugin_id}",
                    execution_time=0.0,
                    tool_name=tool_call.tool_name
                )
            
            # 执行工具
            result = await plugin.execute_tool(tool_call)
            
            # 记录执行时间
            execution_time = time.time() - start_time
            result.execution_time = execution_time
            
            # 缓存成功的结果
            if result.success and use_cache:
                self._cache_result(tool_call, result)
            
            logger.info(f"Tool executed: {tool_call.tool_name} (time: {execution_time:.2f}s, success: {result.success})")
            
            return result
        
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"Tool execution failed: {e}", exc_info=True)
            
            return ToolResult(
                success=False,
                error=str(e),
                execution_time=execution_time,
                tool_name=tool_call.tool_name
            )
    
    async def execute_chain(
        self,
        plan_steps: List[PlanStep],
        context: Optional[Dict[str, Any]] = None
    ) -> List[ToolResult]:
        """
        执行工具链
        
        按顺序执行多个工具，支持步骤间的参数引用
        
        Args:
            plan_steps: 计划步骤列表
            context: 上下文信息
        
        Returns:
            List[ToolResult]: 执行结果列表
        """
        logger.info(f"Executing tool chain with {len(plan_steps)} steps")
        
        if context is None:
            context = {}
        
        results = []
        step_results = {}  # 存储每个步骤的结果，用于参数引用
        
        for step in plan_steps:
            logger.info(f"Executing step {step.step_number}: {step.tool_name}")
            
            try:
                # 解析参数（支持 ${stepN.result} 引用）
                resolved_params = self.resolve_parameters(
                    step.parameters,
                    step_results
                )
                
                # 创建工具调用
                tool_call = ToolCall(
                    tool_name=step.tool_name,
                    parameters=resolved_params,
                    reasoning=step.description,
                    confidence=0.9,
                    source="plan"
                )
                
                # 执行工具
                result = await self.execute_tool(tool_call)
                
                # 存储结果
                results.append(result)
                step_results[f"step{step.step_number}"] = result
                
                # 如果是必需步骤且失败，停止执行
                if step.required and not result.success:
                    logger.warning(f"Required step {step.step_number} failed, halting chain")
                    break
                
                # 如果是可选步骤且失败，继续执行
                if not step.required and not result.success:
                    logger.info(f"Optional step {step.step_number} failed, continuing")
                    continue
            
            except Exception as e:
                logger.error(f"Step {step.step_number} execution failed: {e}", exc_info=True)
                
                # 创建失败结果
                error_result = ToolResult(
                    success=False,
                    error=str(e),
                    execution_time=0.0,
                    tool_name=step.tool_name
                )
                results.append(error_result)
                
                # 如果是必需步骤，停止执行
                if step.required:
                    logger.warning(f"Required step {step.step_number} failed with exception, halting chain")
                    break
        
        logger.info(f"Tool chain completed: {len(results)} steps executed")
        
        return results
    
    def resolve_parameters(
        self,
        parameters: Dict[str, Any],
        step_results: Dict[str, ToolResult]
    ) -> Dict[str, Any]:
        """
        解析参数中的引用
        
        支持 ${stepN.result} 语法引用之前步骤的结果
        
        Args:
            parameters: 原始参数
            step_results: 步骤结果字典
        
        Returns:
            Dict: 解析后的参数
        """
        import re
        
        resolved = {}
        
        for key, value in parameters.items():
            if isinstance(value, str):
                # 查找 ${stepN.result} 模式
                pattern = r'\$\{step(\d+)\.result\}'
                matches = re.findall(pattern, value)
                
                if matches:
                    # 替换引用
                    resolved_value = value
                    for step_num in matches:
                        step_key = f"step{step_num}"
                        if step_key in step_results:
                            result = step_results[step_key]
                            # 使用结果数据替换引用
                            replacement = result.data if result.success else ""
                            resolved_value = resolved_value.replace(
                                f"${{step{step_num}.result}}",
                                str(replacement)
                            )
                        else:
                            logger.warning(f"Step {step_num} result not found for parameter {key}")
                    
                    resolved[key] = resolved_value
                else:
                    resolved[key] = value
            else:
                resolved[key] = value
        
        return resolved
    
    def _get_cache_key(self, tool_call: ToolCall) -> str:
        """
        生成缓存键
        
        Args:
            tool_call: 工具调用
        
        Returns:
            str: 缓存键
        """
        # 使用工具名和参数的哈希作为缓存键
        cache_data = {
            "tool_name": tool_call.tool_name,
            "parameters": tool_call.parameters
        }
        
        cache_str = json.dumps(cache_data, sort_keys=True)
        return hashlib.md5(cache_str.encode()).hexdigest()
    
    def _get_cached_result(self, tool_call: ToolCall) -> Optional[ToolResult]:
        """
        获取缓存的结果
        
        Args:
            tool_call: 工具调用
        
        Returns:
            Optional[ToolResult]: 缓存的结果，如果不存在或过期则返回 None
        """
        cache_key = self._get_cache_key(tool_call)
        
        if cache_key not in self._cache:
            return None
        
        cached = self._cache[cache_key]
        
        # 检查是否过期
        age = (datetime.now() - cached["timestamp"]).total_seconds()
        if age > self.CACHE_TTL_SECONDS:
            # 过期，删除缓存
            del self._cache[cache_key]
            return None
        
        return cached["result"]
    
    def _cache_result(self, tool_call: ToolCall, result: ToolResult) -> None:
        """
        缓存工具执行结果
        
        Args:
            tool_call: 工具调用
            result: 执行结果
        """
        cache_key = self._get_cache_key(tool_call)
        
        # 如果缓存已满，删除最旧的条目
        if len(self._cache) >= self.MAX_CACHE_SIZE:
            oldest_key = min(
                self._cache.keys(),
                key=lambda k: self._cache[k]["timestamp"]
            )
            del self._cache[oldest_key]
        
        # 添加到缓存
        self._cache[cache_key] = {
            "result": result,
            "timestamp": datetime.now()
        }
        
        logger.debug(f"Cached result for {tool_call.tool_name} (cache size: {len(self._cache)})")
    
    def clear_cache(self) -> None:
        """清空缓存"""
        self._cache.clear()
        logger.info("Tool result cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        获取缓存统计信息
        
        Returns:
            Dict: 缓存统计
        """
        return {
            "size": len(self._cache),
            "max_size": self.MAX_CACHE_SIZE,
            "ttl_seconds": self.CACHE_TTL_SECONDS
        }


# 全局实例
_tool_orchestrator: Optional[ToolOrchestrator] = None


def get_tool_orchestrator(
    tool_registry: Optional[ToolRegistry] = None,
    plugin_manager: Optional['PluginManager'] = None
) -> ToolOrchestrator:
    """
    获取全局 ToolOrchestrator 实例
    
    Args:
        tool_registry: 工具注册表（可选）
        plugin_manager: 插件管理器（可选）
    
    Returns:
        ToolOrchestrator: ToolOrchestrator 实例
    """
    global _tool_orchestrator
    
    if _tool_orchestrator is None:
        _tool_orchestrator = ToolOrchestrator(tool_registry, plugin_manager)
    
    return _tool_orchestrator
