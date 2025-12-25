"""
Task Planner - 智能任务规划器

职责：
1. 分析查询复杂度
2. 分解复杂任务为子任务
3. 识别所需工具
4. 估算迭代次数
5. 生成结构化执行计划
"""

from typing import List, Dict, Any, Optional
from loguru import logger

from ..models.react import ExecutionPlan, PlanStep, ConversationTurn
from ..services.llm_service import BaseLLMService, get_llm_service
from ..core.tool_registry import ToolRegistry, get_tool_registry


class TaskPlanner:
    """
    任务规划器
    
    功能：
    - 分析查询复杂度（simple, medium, complex）
    - 将复杂查询分解为多个步骤
    - 为每个步骤选择合适的工具
    - 估算所需的迭代次数
    """
    
    # 复杂度阈值
    SIMPLE_QUERY_MAX_LENGTH = 50
    MEDIUM_QUERY_MAX_LENGTH = 150
    
    def __init__(
        self,
        tool_registry: Optional[ToolRegistry] = None,
        llm_service: Optional[BaseLLMService] = None
    ):
        """
        初始化任务规划器
        
        Args:
            tool_registry: 工具注册表
            llm_service: LLM 服务
        """
        self.tool_registry = tool_registry or get_tool_registry()
        self.llm_service = llm_service or get_llm_service()
        
        logger.info("TaskPlanner initialized")
    
    async def create_plan(
        self,
        query: str,
        conversation_history: Optional[List[ConversationTurn]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> ExecutionPlan:
        """
        创建执行计划
        
        Args:
            query: 用户查询
            conversation_history: 对话历史
            context: 上下文信息
        
        Returns:
            ExecutionPlan: 执行计划
        
        流程：
        1. 分析查询复杂度
        2. 如果是简单查询，返回简单计划
        3. 如果是复杂查询，使用 LLM 分解任务
        4. 生成结构化执行计划
        """
        logger.info(f"Creating plan for query: '{query[:100]}...'")
        
        if conversation_history is None:
            conversation_history = []
        
        if context is None:
            context = {}
        
        # 1. 分析复杂度
        complexity = self._classify_complexity(query, conversation_history)
        
        logger.info(f"Query complexity: {complexity}")
        
        # 2. 根据复杂度创建计划
        if complexity == "simple":
            plan = await self._create_simple_plan(query)
        elif complexity == "medium":
            plan = await self._create_medium_plan(query, conversation_history, context)
        else:  # complex
            plan = await self._create_complex_plan(query, conversation_history, context)
        
        logger.info(f"Plan created: {len(plan.steps)} steps, estimated {plan.estimated_iterations} iterations")
        
        return plan
    
    def _classify_complexity(
        self,
        query: str,
        conversation_history: List[ConversationTurn]
    ) -> str:
        """
        分类查询复杂度
        
        Args:
            query: 用户查询
            conversation_history: 对话历史
        
        Returns:
            str: "simple", "medium", or "complex"
        
        分类规则：
        - Simple: 短查询，单一意图，无需上下文
        - Medium: 中等长度，可能需要多个工具
        - Complex: 长查询，多个意图，需要上下文
        """
        query_length = len(query)
        
        # 检查是否有多个问题或请求
        has_multiple_intents = any(
            marker in query.lower()
            for marker in ["然后", "接着", "还有", "另外", "同时", "以及", "and then", "also", "additionally"]
        )
        
        # 检查是否需要上下文
        needs_context = any(
            marker in query.lower()
            for marker in ["继续", "上次", "之前", "刚才", "那个", "这个", "continue", "previous", "last"]
        )
        
        # 分类逻辑
        if query_length <= self.SIMPLE_QUERY_MAX_LENGTH and not has_multiple_intents and not needs_context:
            return "simple"
        elif query_length <= self.MEDIUM_QUERY_MAX_LENGTH or has_multiple_intents:
            return "medium"
        else:
            return "complex"
    
    async def _create_simple_plan(self, query: str) -> ExecutionPlan:
        """
        创建简单计划
        
        简单查询通常只需要一个工具调用
        
        Args:
            query: 用户查询
        
        Returns:
            ExecutionPlan: 简单执行计划
        """
        # 尝试匹配最合适的工具
        tool = self._match_tool_for_query(query)
        
        steps = [
            PlanStep(
                step_number=1,
                description=f"Process query: {query[:50]}...",
                tool_name=tool.name if tool else "echo",
                parameters=self._extract_parameters(query, tool.name if tool else "echo"),
                required=True
            )
        ]
        
        return ExecutionPlan(
            query=query,
            complexity="simple",
            steps=steps,
            estimated_iterations=1
        )
    
    async def _create_medium_plan(
        self,
        query: str,
        conversation_history: List[ConversationTurn],
        context: Dict[str, Any]
    ) -> ExecutionPlan:
        """
        创建中等复杂度计划
        
        可能需要 2-3 个工具调用
        
        Args:
            query: 用户查询
            conversation_history: 对话历史
            context: 上下文
        
        Returns:
            ExecutionPlan: 中等复杂度计划
        """
        # 检查 LLM 是否可用
        if not self.llm_service or not self.llm_service.is_available():
            logger.warning("LLM not available, using simple plan")
            return await self._create_simple_plan(query)
        
        try:
            # 使用 LLM 生成计划
            plan_data = await self._generate_plan_with_llm(
                query, conversation_history, context, complexity="medium"
            )
            
            return self._parse_plan_data(query, plan_data, "medium")
        
        except Exception as e:
            logger.error(f"Failed to create medium plan: {e}", exc_info=True)
            return await self._create_simple_plan(query)
    
    async def _create_complex_plan(
        self,
        query: str,
        conversation_history: List[ConversationTurn],
        context: Dict[str, Any]
    ) -> ExecutionPlan:
        """
        创建复杂计划
        
        需要多个工具调用和步骤依赖
        
        Args:
            query: 用户查询
            conversation_history: 对话历史
            context: 上下文
        
        Returns:
            ExecutionPlan: 复杂执行计划
        """
        # 检查 LLM 是否可用
        if not self.llm_service or not self.llm_service.is_available():
            logger.warning("LLM not available, using medium plan")
            return await self._create_medium_plan(query, conversation_history, context)
        
        try:
            # 使用 LLM 生成计划
            plan_data = await self._generate_plan_with_llm(
                query, conversation_history, context, complexity="complex"
            )
            
            return self._parse_plan_data(query, plan_data, "complex")
        
        except Exception as e:
            logger.error(f"Failed to create complex plan: {e}", exc_info=True)
            return await self._create_medium_plan(query, conversation_history, context)

    
    async def _generate_plan_with_llm(
        self,
        query: str,
        conversation_history: List[ConversationTurn],
        context: Dict[str, Any],
        complexity: str
    ) -> Dict[str, Any]:
        """
        使用 LLM 生成执行计划
        
        Args:
            query: 用户查询
            conversation_history: 对话历史
            context: 上下文
            complexity: 复杂度
        
        Returns:
            Dict: 计划数据
        """
        from ..prompts.react_prompts import TaskPlanningPrompt, format_tools_for_prompt
        
        # 获取可用工具
        tools = self.tool_registry.get_all_tools()
        tools_description = format_tools_for_prompt([
            {
                'name': tool.name,
                'description': tool.description,
                'parameters': [
                    {'name': p.name, 'type': p.type, 'description': p.description}
                    for p in tool.parameters
                ]
            }
            for tool in tools
        ])
        
        # 构建提示
        prompt = TaskPlanningPrompt.create_prompt(
            query=query,
            available_tools=tools_description,
            conversation_history=[turn.to_dict() for turn in conversation_history[-5:]],  # 最近 5 条
            complexity=complexity
        )
        
        # 调用 LLM
        response = await self.llm_service.generate_text(
            prompt,
            temperature=0.5,  # 较低温度以获得更确定的计划
            max_tokens=800
        )
        
        # 解析响应
        plan_data = TaskPlanningPrompt.parse_response(response)
        
        return plan_data
    
    def _parse_plan_data(
        self,
        query: str,
        plan_data: Dict[str, Any],
        complexity: str
    ) -> ExecutionPlan:
        """
        解析计划数据为 ExecutionPlan 对象
        
        Args:
            query: 用户查询
            plan_data: LLM 返回的计划数据
            complexity: 复杂度
        
        Returns:
            ExecutionPlan: 执行计划
        """
        steps = []
        
        for i, step_data in enumerate(plan_data.get('steps', []), 1):
            step = PlanStep(
                step_number=i,
                description=step_data.get('description', ''),
                tool_name=step_data.get('tool_name', 'echo'),
                parameters=step_data.get('parameters', {}),
                required=step_data.get('required', True),
                dependencies=step_data.get('dependencies', [])
            )
            steps.append(step)
        
        # 如果没有步骤，创建默认步骤
        if not steps:
            steps = [
                PlanStep(
                    step_number=1,
                    description=f"Process query: {query[:50]}...",
                    tool_name="echo",
                    parameters={"message": query},
                    required=True
                )
            ]
        
        estimated_iterations = plan_data.get('estimated_iterations', len(steps))
        
        return ExecutionPlan(
            query=query,
            complexity=complexity,
            steps=steps,
            estimated_iterations=estimated_iterations
        )
    
    def _match_tool_for_query(self, query: str):
        """
        为查询匹配最合适的工具
        
        Args:
            query: 用户查询
        
        Returns:
            Tool: 匹配的工具，如果没有匹配则返回 None
        """
        query_lower = query.lower()
        
        # 获取所有工具
        tools = self.tool_registry.get_all_tools()
        
        # 简单的关键词匹配
        for tool in tools:
            tool_keywords = [
                tool.name.lower(),
                tool.description.lower()
            ]
            
            # 检查查询是否包含工具关键词
            if any(keyword in query_lower for keyword in tool_keywords):
                return tool
        
        # 默认返回第一个工具或 None
        return tools[0] if tools else None
    
    def _extract_parameters(self, query: str, tool_name: str) -> Dict[str, Any]:
        """
        从查询中提取工具参数
        
        Args:
            query: 用户查询
            tool_name: 工具名称
        
        Returns:
            Dict: 参数字典
        """
        # 简单实现：返回查询作为消息
        # 未来可以使用 LLM 或 NER 提取参数
        
        if tool_name == "echo":
            return {"message": query}
        
        # 对于其他工具，尝试提取常见参数
        params = {}
        
        # 提取数量
        import re
        numbers = re.findall(r'\d+', query)
        if numbers:
            params['limit'] = int(numbers[0])
        
        # 提取查询关键词
        if "搜索" in query or "查找" in query or "search" in query.lower():
            # 提取搜索关键词（简单实现）
            words = query.split()
            if len(words) > 1:
                params['query'] = ' '.join(words[1:])
        
        return params if params else {"query": query}
    
    async def adjust_plan(
        self,
        original_plan: ExecutionPlan,
        executed_steps: List,
        failure_reason: Optional[str] = None
    ) -> ExecutionPlan:
        """
        调整执行计划
        
        当工具失败或需要改变策略时调整计划
        
        Args:
            original_plan: 原始计划
            executed_steps: 已执行的步骤
            failure_reason: 失败原因
        
        Returns:
            ExecutionPlan: 调整后的计划
        """
        logger.info(f"Adjusting plan due to: {failure_reason or 'strategy change'}")
        
        # 检查 LLM 是否可用
        if not self.llm_service or not self.llm_service.is_available():
            logger.warning("LLM not available, keeping original plan")
            return original_plan
        
        try:
            # 使用 LLM 重新规划
            from ..prompts.react_prompts import TaskPlanningPrompt
            
            # 构建调整提示
            prompt = f"""The original plan failed or needs adjustment.

Original Query: {original_plan.query}

Original Plan:
{original_plan.to_dict()}

Executed Steps:
{[step.to_dict() for step in executed_steps]}

Failure Reason: {failure_reason or 'Strategy needs adjustment'}

Please create an adjusted plan that:
1. Avoids the previous failure
2. Uses alternative tools if needed
3. Adjusts the approach

Provide the adjusted plan in JSON format.
"""
            
            response = await self.llm_service.generate_text(prompt, temperature=0.5)
            plan_data = TaskPlanningPrompt.parse_response(response)
            
            adjusted_plan = self._parse_plan_data(
                original_plan.query,
                plan_data,
                original_plan.complexity
            )
            
            logger.info(f"Plan adjusted: {len(adjusted_plan.steps)} steps")
            
            return adjusted_plan
        
        except Exception as e:
            logger.error(f"Failed to adjust plan: {e}", exc_info=True)
            return original_plan


# 全局实例
_task_planner: Optional[TaskPlanner] = None


def get_task_planner(
    tool_registry: Optional[ToolRegistry] = None,
    llm_service: Optional[BaseLLMService] = None
) -> TaskPlanner:
    """
    获取全局 TaskPlanner 实例
    
    Args:
        tool_registry: 工具注册表（可选）
        llm_service: LLM 服务（可选）
    
    Returns:
        TaskPlanner: TaskPlanner 实例
    """
    global _task_planner
    
    if _task_planner is None:
        _task_planner = TaskPlanner(tool_registry, llm_service)
    
    return _task_planner
