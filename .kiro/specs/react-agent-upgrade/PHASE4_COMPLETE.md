# Phase 4 完成报告：任务规划和工具编排

## 📋 概述

**阶段**: Phase 4 - Task Planning and Tool Orchestration  
**状态**: ✅ 100% 完成（7/7 任务）  
**完成时间**: 2024年12月17日

---

## ✅ 已完成的任务

### 任务 4.1: 创建 TaskPlanner 类 ✅
**文件**: `agent-backend/app/core/task_planner.py`

**实现内容**:
- TaskPlanner 类，负责智能任务规划
- 查询复杂度分类（simple, medium, complex）
- 任务分解和工具选择
- 迭代次数估算

**核心功能**:
```python
class TaskPlanner:
    SIMPLE_QUERY_MAX_LENGTH = 50
    MEDIUM_QUERY_MAX_LENGTH = 150
    
    async def create_plan(
        self,
        query: str,
        conversation_history: Optional[List[ConversationTurn]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> ExecutionPlan:
        """创建执行计划"""
        # 1. 分析复杂度
        complexity = self._classify_complexity(query, conversation_history)
        
        # 2. 根据复杂度创建计划
        if complexity == "simple":
            plan = await self._create_simple_plan(query)
        elif complexity == "medium":
            plan = await self._create_medium_plan(query, conversation_history, context)
        else:  # complex
            plan = await self._create_complex_plan(query, conversation_history, context)
        
        return plan
```

**复杂度分类规则**:
- **Simple**: 查询长度 ≤ 50，单一意图，无需上下文
- **Medium**: 查询长度 ≤ 150，可能需要多个工具
- **Complex**: 长查询，多个意图，需要上下文

---

### 任务 4.2: 实现查询分解 ✅

**实现内容**:
- 使用 LLM 分解复杂查询
- 识别所需工具
- 估算迭代次数
- 生成结构化执行计划

**查询分解流程**:
```python
async def _generate_plan_with_llm(
    self,
    query: str,
    conversation_history: List[ConversationTurn],
    context: Dict[str, Any],
    complexity: str
) -> Dict[str, Any]:
    """使用 LLM 生成执行计划"""
    # 1. 获取可用工具描述
    tools = self.tool_registry.get_all_tools()
    tools_description = format_tools_for_prompt(tools)
    
    # 2. 构建提示
    prompt = TaskPlanningPrompt.create_prompt(
        query=query,
        available_tools=tools_description,
        conversation_history=[turn.to_dict() for turn in conversation_history[-5:]],
        complexity=complexity
    )
    
    # 3. 调用 LLM
    response = await self.llm_service.generate_text(prompt, temperature=0.5)
    
    # 4. 解析响应
    plan_data = TaskPlanningPrompt.parse_response(response)
    
    return plan_data
```

**生成的计划结构**:
```json
{
  "steps": [
    {
      "step_number": 1,
      "description": "Search for AI news",
      "tool_name": "search_news",
      "parameters": {"query": "AI", "limit": 5},
      "required": true,
      "dependencies": []
    },
    {
      "step_number": 2,
      "description": "Summarize results",
      "tool_name": "summarize",
      "parameters": {"text": "${step1.result}"},
      "required": false,
      "dependencies": [1]
    }
  ],
  "estimated_iterations": 2
}
```

---

### 任务 4.3: 添加计划调整能力 ✅

**实现内容**:
- 当工具失败时重新规划
- 根据观察结果调整策略
- 使用 LLM 生成调整后的计划

**计划调整**:
```python
async def adjust_plan(
    self,
    original_plan: ExecutionPlan,
    executed_steps: List,
    failure_reason: Optional[str] = None
) -> ExecutionPlan:
    """调整执行计划"""
    # 使用 LLM 重新规划
    prompt = f"""The original plan failed or needs adjustment.

Original Query: {original_plan.query}
Original Plan: {original_plan.to_dict()}
Executed Steps: {[step.to_dict() for step in executed_steps]}
Failure Reason: {failure_reason}

Please create an adjusted plan that:
1. Avoids the previous failure
2. Uses alternative tools if needed
3. Adjusts the approach
"""
    
    response = await self.llm_service.generate_text(prompt)
    plan_data = TaskPlanningPrompt.parse_response(response)
    
    return self._parse_plan_data(original_plan.query, plan_data, original_plan.complexity)
```

---

### 任务 4.4: 创建 ToolOrchestrator 类 ✅
**文件**: `agent-backend/app/core/tool_orchestrator.py`

**实现内容**:
- ToolOrchestrator 类，负责工具执行编排
- 单个工具执行
- 工具链执行
- 结果缓存（5 分钟 TTL）
- 错误处理

**核心功能**:
```python
class ToolOrchestrator:
    CACHE_TTL_SECONDS = 300  # 5 分钟
    MAX_CACHE_SIZE = 100
    
    async def execute_tool(
        self,
        tool_call: ToolCall,
        use_cache: bool = True
    ) -> ToolResult:
        """执行单个工具（带缓存）"""
        # 1. 检查缓存
        if use_cache:
            cached_result = self._get_cached_result(tool_call)
            if cached_result:
                return cached_result
        
        # 2. 执行工具
        result = await plugin.execute_tool(tool_call)
        
        # 3. 缓存结果
        if result.success and use_cache:
            self._cache_result(tool_call, result)
        
        return result
    
    async def execute_chain(
        self,
        plan_steps: List[PlanStep],
        context: Optional[Dict[str, Any]] = None
    ) -> List[ToolResult]:
        """执行工具链"""
        results = []
        step_results = {}
        
        for step in plan_steps:
            # 解析参数引用
            resolved_params = self.resolve_parameters(
                step.parameters,
                step_results
            )
            
            # 执行工具
            result = await self.execute_tool(tool_call)
            results.append(result)
            step_results[f"step{step.step_number}"] = result
            
            # 如果必需步骤失败，停止执行
            if step.required and not result.success:
                break
        
        return results
```

---

### 任务 4.5: 实现参数解析 ✅

**实现内容**:
- 支持 `${stepN.result}` 语法
- 从之前步骤的结果中提取值
- 动态参数替换

**参数解析**:
```python
def resolve_parameters(
    self,
    parameters: Dict[str, Any],
    step_results: Dict[str, ToolResult]
) -> Dict[str, Any]:
    """解析参数中的引用"""
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
                        replacement = result.data if result.success else ""
                        resolved_value = resolved_value.replace(
                            f"${{step{step_num}.result}}",
                            str(replacement)
                        )
                
                resolved[key] = resolved_value
            else:
                resolved[key] = value
        else:
            resolved[key] = value
    
    return resolved
```

**使用示例**:
```python
# 步骤 1 的参数
params1 = {"query": "AI news"}

# 步骤 2 的参数（引用步骤 1 的结果）
params2 = {"text": "${step1.result}"}

# 解析后
resolved_params2 = {"text": "Found 5 AI news articles..."}
```

---

### 任务 4.6: 添加工具结果缓存 ✅

**实现内容**:
- LRU 缓存策略
- 5 分钟 TTL
- 最多缓存 100 个结果
- 基于工具名和参数的哈希键

**缓存机制**:
```python
def _get_cache_key(self, tool_call: ToolCall) -> str:
    """生成缓存键"""
    cache_data = {
        "tool_name": tool_call.tool_name,
        "parameters": tool_call.parameters
    }
    cache_str = json.dumps(cache_data, sort_keys=True)
    return hashlib.md5(cache_str.encode()).hexdigest()

def _get_cached_result(self, tool_call: ToolCall) -> Optional[ToolResult]:
    """获取缓存的结果"""
    cache_key = self._get_cache_key(tool_call)
    
    if cache_key not in self._cache:
        return None
    
    cached = self._cache[cache_key]
    
    # 检查是否过期
    age = (datetime.now() - cached["timestamp"]).total_seconds()
    if age > self.CACHE_TTL_SECONDS:
        del self._cache[cache_key]
        return None
    
    return cached["result"]

def _cache_result(self, tool_call: ToolCall, result: ToolResult) -> None:
    """缓存工具执行结果"""
    cache_key = self._get_cache_key(tool_call)
    
    # 如果缓存已满，删除最旧的条目（LRU）
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
```

**缓存优势**:
- 避免重复执行相同的工具调用
- 减少 API 调用成本
- 提高响应速度
- 自动过期和清理

---

### 任务 4.7: 添加工具链错误处理 ✅

**实现内容**:
- 必需步骤失败时停止执行
- 可选步骤失败时继续执行
- 详细的错误日志
- 异常捕获和恢复

**错误处理逻辑**:
```python
for step in plan_steps:
    try:
        # 执行工具
        result = await self.execute_tool(tool_call)
        results.append(result)
        
        # 如果是必需步骤且失败，停止执行
        if step.required and not result.success:
            logger.warning(f"Required step {step.step_number} failed, halting chain")
            break
        
        # 如果是可选步骤且失败，继续执行
        if not step.required and not result.success:
            logger.info(f"Optional step {step.step_number} failed, continuing")
            continue
    
    except Exception as e:
        logger.error(f"Step {step.step_number} execution failed: {e}")
        
        error_result = ToolResult(
            success=False,
            error=str(e),
            execution_time=0.0,
            tool_name=step.tool_name
        )
        results.append(error_result)
        
        # 如果是必需步骤，停止执行
        if step.required:
            break
```

---

## 🔗 ReactAgent 集成

### 集成到 ReactAgent
**文件**: `agent-backend/app/core/react_agent.py`

**修改内容**:

#### 1. 添加依赖
```python
from ..core.task_planner import TaskPlanner, get_task_planner
from ..core.tool_orchestrator import ToolOrchestrator, get_tool_orchestrator

def __init__(
    self,
    ...,
    task_planner: Optional[TaskPlanner] = None,
    tool_orchestrator: Optional[ToolOrchestrator] = None
):
    self.task_planner = task_planner or get_task_planner(...)
    self.tool_orchestrator = tool_orchestrator or get_tool_orchestrator(...)
```

#### 2. 使用 TaskPlanner 创建计划
```python
# 之前：创建简单计划
plan = self._create_simple_plan(query)

# 现在：使用 TaskPlanner
plan = await self.task_planner.create_plan(
    query=query,
    conversation_history=conversation_history,
    context=context
)
```

#### 3. 使用 ToolOrchestrator 执行工具
```python
# 之前：直接通过 plugin_manager 执行
result = await plugin.execute_tool(tool_call)

# 现在：使用 ToolOrchestrator（带缓存）
result = await self.tool_orchestrator.execute_tool(tool_call, use_cache=True)
```

---

## 🎯 实现的功能

### 1. 智能任务规划
- ✅ 自动分类查询复杂度
- ✅ 分解复杂任务为子任务
- ✅ 选择合适的工具
- ✅ 估算迭代次数
- ✅ 计划调整能力

### 2. 工具编排
- ✅ 单个工具执行
- ✅ 工具链执行
- ✅ 参数引用解析
- ✅ 结果缓存
- ✅ 错误处理

### 3. 性能优化
- ✅ LRU 缓存（5 分钟 TTL）
- ✅ 避免重复执行
- ✅ 自动过期清理

### 4. 错误恢复
- ✅ 必需 vs 可选步骤
- ✅ 失败时停止或继续
- ✅ 计划调整

---

## 📊 执行流程图

```
用户查询
    ↓
TaskPlanner.create_plan()
    ├─ 分析复杂度
    ├─ Simple → 1 步计划
    ├─ Medium → 2-3 步计划
    └─ Complex → 3+ 步计划（使用 LLM）
    ↓
ReactAgent._react_loop()
    ↓
每次迭代:
    ├─ 生成思考和行动
    ├─ ToolOrchestrator.execute_tool()
    │   ├─ 检查缓存
    │   ├─ 执行工具
    │   └─ 缓存结果
    └─ 记录观察
    ↓
合成最终响应
```

---

## 📝 使用示例

### 1. 简单查询
```python
# 查询: "获取最新资讯"
# 复杂度: simple
# 计划: 1 步
plan = ExecutionPlan(
    query="获取最新资讯",
    complexity="simple",
    steps=[
        PlanStep(
            step_number=1,
            description="Search for latest news",
            tool_name="search_news",
            parameters={"limit": 5},
            required=True
        )
    ],
    estimated_iterations=1
)
```

### 2. 中等复杂度查询
```python
# 查询: "获取最新的AI资讯并总结"
# 复杂度: medium
# 计划: 2 步
plan = ExecutionPlan(
    query="获取最新的AI资讯并总结",
    complexity="medium",
    steps=[
        PlanStep(
            step_number=1,
            description="Search for AI news",
            tool_name="search_news",
            parameters={"query": "AI", "limit": 5},
            required=True
        ),
        PlanStep(
            step_number=2,
            description="Summarize the news",
            tool_name="summarize",
            parameters={"text": "${step1.result}"},  # 引用步骤 1 的结果
            required=False
        )
    ],
    estimated_iterations=2
)
```

### 3. 复杂查询
```python
# 查询: "搜索最新的AI资讯，分析趋势，然后生成报告"
# 复杂度: complex
# 计划: 3+ 步（由 LLM 生成）
```

---

## 🎉 Phase 4 总结

Phase 4 成功实现了智能任务规划和工具编排：

1. **TaskPlanner** - 智能分析和分解任务
2. **ToolOrchestrator** - 高效执行和缓存
3. **参数引用** - 步骤间数据传递
4. **错误处理** - 必需 vs 可选步骤
5. **计划调整** - 失败时重新规划
6. **性能优化** - LRU 缓存机制

**ReactAgent 现在可以处理复杂的多步任务！** 🚀

---

## 🚀 下一步

Phase 4 完成后，按照计划继续：

1. **Phase 7: Frontend UI** - 前端界面升级
2. **Phase 5: Reflection** - 反思和质量评估
3. **Phase 8: Optimization** - 性能优化
4. **Phase 9: Documentation** - 文档完善

---

**完成日期**: 2024年12月17日  
**实现者**: Kiro AI Assistant  
**文档版本**: 1.0
