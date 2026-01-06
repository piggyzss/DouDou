"""
ReAct Agent - ReAct (Reasoning + Acting) Agent 实现

实现了完整的 ReAct 循环，包括：
- 多步推理和行动
- 任务规划
- 工具编排
- 自我反思
- 会话记忆
"""

import time
import uuid
from typing import Dict, Any, Optional, List, TYPE_CHECKING
from loguru import logger
from datetime import datetime

from ..models.react import (
    ReActStep,
    ExecutionPlan,
    ReactResponse,
    QualityEvaluation,
    ConversationTurn
)
from ..models.tool import ToolCall, ToolResult
from ..services.llm_service import BaseLLMService, get_llm_service
from ..core.tool_registry import ToolRegistry, get_tool_registry
from ..core.conversation_memory import ConversationMemory, get_conversation_memory
from ..core.task_planner import TaskPlanner, get_task_planner
from ..core.tool_orchestrator import ToolOrchestrator, get_tool_orchestrator
from ..core.reflection_engine import ReflectionEngine, get_reflection_engine

# 避免循环导入
if TYPE_CHECKING:
    from ..core.plugin_manager import PluginManager


class ReactAgent:
    """
    ReAct Agent 执行器
    
    职责：
    1. 协调 ReAct 循环执行
    2. 管理迭代状态和历史
    3. 集成任务规划器、工具编排器和反思引擎
    4. 合成最终响应
    
    设计原则：
    - 单一职责：专注于 ReAct 循环的协调
    - 依赖注入：通过构造函数注入依赖
    - 向后兼容：支持旧版 API 格式
    """
    
    # 最大迭代次数限制
    MAX_ITERATIONS = 5
    
    # 内存会话存储（降级方案）
    _memory_sessions: Dict[str, List[Dict[str, Any]]] = {}
    
    def __init__(
        self,
        tool_registry: Optional[ToolRegistry] = None,
        llm_service: Optional[BaseLLMService] = None,
        plugin_manager: Optional['PluginManager'] = None,
        conversation_memory: Optional[ConversationMemory] = None,
        task_planner: Optional[TaskPlanner] = None,
        tool_orchestrator: Optional[ToolOrchestrator] = None,
        reflection_engine: Optional[ReflectionEngine] = None
    ):
        """
        初始化 ReAct Agent
        
        Args:
            tool_registry: 工具注册表
            llm_service: LLM 服务
            plugin_manager: 插件管理器（用于执行工具）
            conversation_memory: 会话记忆管理器
            task_planner: 任务规划器
            tool_orchestrator: 工具编排器
            reflection_engine: 反思引擎
        """
        self.tool_registry = tool_registry or get_tool_registry()
        self.llm_service = llm_service or get_llm_service()
        self.plugin_manager = plugin_manager
        self.conversation_memory = conversation_memory or get_conversation_memory()
        self.task_planner = task_planner or get_task_planner(self.tool_registry, self.llm_service)
        self.tool_orchestrator = tool_orchestrator or get_tool_orchestrator(self.tool_registry, plugin_manager)
        self.reflection_engine = reflection_engine or get_reflection_engine(self.llm_service)
        
        logger.info("ReAct Agent initialized")
    
    async def execute(
        self,
        query: str,
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        streaming_callback: Optional[Any] = None
    ) -> ReactResponse:
        """
        执行用户查询，使用 ReAct 循环
        
        Args:
            query: 用户查询
            session_id: 会话 ID（可选，如果未提供则生成新的）
            context: 上下文信息（可选）
            streaming_callback: 流式回调函数（可选），用于实时发送执行事件
        
        Returns:
            ReactResponse: 完整的执行响应
        
        流程：
        1. 生成会话 ID（如果需要）
        2. 创建执行计划（未来实现）
        3. 执行 ReAct 循环（最多 MAX_ITERATIONS 次）
        4. 合成最终响应
        5. 评估输出质量（未来实现）
        6. 返回完整响应
        
        如果提供了 streaming_callback，将在以下时机调用：
        - 生成思考后：callback("thought", {"step_number": N, "content": "..."})
        - 选择行动后：callback("action", {"step_number": N, "tool_name": "...", "parameters": {...}})
        - 执行观察后：callback("observation", {"step_number": N, "success": bool, "data": ...})
        """
        start_time = time.time()
        
        # 生成会话 ID
        if session_id is None:
            session_id = self._generate_session_id()
        
        if context is None:
            context = {}
        
        logger.info(f"ReAct Agent executing query: '{query}' (session: {session_id})")
        
        try:
            # 加载会话历史
            conversation_history = await self.conversation_memory.get_history(session_id)
            
            # 获取会话摘要（如果需要）
            context_summary = await self.conversation_memory.get_context_summary(session_id)
            
            if context_summary:
                logger.info(f"Using context summary: {context_summary[:100]}...")
                context["conversation_summary"] = context_summary
            
            if conversation_history:
                logger.info(f"Loaded {len(conversation_history)} previous interactions")
                context["conversation_history"] = [turn.to_dict() for turn in conversation_history]
            
            # 创建执行计划（使用 TaskPlanner）
            plan = await self.task_planner.create_plan(
                query=query,
                conversation_history=conversation_history,
                context=context
            )
            
            # 发送 plan 事件（如果有流式回调）
            if streaming_callback:
                await streaming_callback('plan', {
                    'plan': {
                        'complexity': plan.complexity,
                        'steps': [step.to_dict() for step in plan.steps],
                        'estimated_iterations': plan.estimated_iterations
                    }
                })
            
            # 执行 ReAct 循环
            steps = await self._react_loop(query, plan, context, streaming_callback)
            
            # 合成最终响应（支持流式）
            final_response = await self._synthesize_response(query, steps, plan, streaming_callback)
            
            # 评估输出质量（使用 ReflectionEngine）
            evaluation = await self.reflection_engine.evaluate_output(
                query=query,
                output=final_response,
                plan=plan,
                steps=steps
            )
            
            # 计算执行时间
            execution_time = time.time() - start_time
            
            # 构建响应
            response = ReactResponse(
                success=True,
                response=final_response,
                steps=steps,
                plan=plan,
                evaluation=evaluation,
                session_id=session_id,
                execution_time=execution_time,
                timestamp=datetime.now()
            )
            
            # 保存到会话历史
            try:
                saved = await self.conversation_memory.save_interaction(
                    session_id=session_id,
                    query=query,
                    response=response,
                    user_id=context.get("user_id")
                )
                
                if not saved:
                    # 降级：使用内存存储
                    await self._save_conversation_fallback(session_id, query, response)
            except Exception as e:
                logger.warning(f"Failed to save conversation: {e}")
                # 降级：使用内存存储
                try:
                    await self._save_conversation_fallback(session_id, query, response)
                except Exception as fallback_error:
                    logger.error(f"Fallback save also failed: {fallback_error}")
            
            logger.info(
                f"ReAct Agent completed: {len(steps)} steps, "
                f"{execution_time:.2f}s, quality: {evaluation.completeness_score}/10"
            )
            
            return response
        
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"ReAct Agent execution failed: {e}", exc_info=True)
            
            # 安全地创建简单计划（处理 query 可能未定义的情况）
            try:
                simple_plan = self._create_simple_plan(query)
            except Exception as plan_error:
                logger.error(f"Failed to create simple plan: {plan_error}")
                # 创建最小化的计划
                from ..models.react import PlanStep
                simple_plan = ExecutionPlan(
                    query=query if 'query' in locals() else "Unknown query",
                    complexity="simple",
                    steps=[],
                    estimated_iterations=1
                )
            
            # 返回错误响应
            return ReactResponse(
                success=False,
                response="",
                steps=[],
                plan=simple_plan,
                evaluation=QualityEvaluation(
                    completeness_score=0,
                    quality_score=0,
                    missing_info=["Execution failed"],
                    needs_retry=True,
                    suggestions=["Check logs for details"]
                ),
                session_id=session_id or "error",
                execution_time=execution_time,
                error=str(e),
                timestamp=datetime.now()
            )
    
    async def _react_loop(
        self,
        query: str,
        plan: ExecutionPlan,
        context: Dict[str, Any],
        streaming_callback: Optional[Any] = None
    ) -> List[ReActStep]:
        """
        执行 ReAct 循环
        
        Args:
            query: 用户查询
            plan: 执行计划
            context: 上下文信息
        
        Returns:
            List[ReActStep]: 执行步骤列表
        
        循环流程：
        1. 生成思考（Thought）
        2. 选择行动（Action）
        3. 执行工具
        4. 记录观察（Observation）
        5. 评估是否继续
        """
        steps: List[ReActStep] = []
        iteration = 0
        
        while iteration < self.MAX_ITERATIONS:
            iteration += 1
            
            logger.info(f"ReAct iteration {iteration}/{self.MAX_ITERATIONS}")
            
            try:
                # 执行一次 ReAct 迭代
                step = await self._react_iteration(
                    query=query,
                    plan=plan,
                    history=steps,
                    context=context,
                    iteration=iteration,
                    streaming_callback=streaming_callback
                )
                
                steps.append(step)
                
                # 检查是否应该继续（使用 ReflectionEngine）
                should_continue = self.reflection_engine.should_continue(
                    steps=steps,
                    plan=plan,
                    evaluation=None  # 在迭代中不进行完整评估，只在最后评估
                )
                
                if not should_continue:
                    logger.info("ReflectionEngine determined task is complete")
                    break
                
                # 添加迭代间延迟，使流式输出更明显
                if iteration < self.MAX_ITERATIONS:
                    import asyncio
                    await asyncio.sleep(0.2)  # 200ms 延迟
            
            except Exception as e:
                logger.error(f"ReAct iteration {iteration} failed: {e}", exc_info=True)
                # 创建失败步骤
                failed_step = ReActStep(
                    step_number=iteration,
                    thought=f"Iteration failed: {str(e)}",
                    action=ToolCall(
                        tool_name="error",
                        parameters={},
                        reasoning="Error occurred",
                        confidence=0.0,
                        source="system"
                    ),
                    observation=ToolResult(
                        success=False,
                        error=str(e),
                        execution_time=0.0,
                        tool_name="error"
                    ),
                    status="failed",
                    timestamp=datetime.now()
                )
                steps.append(failed_step)
                break
        
        logger.info(f"ReAct loop completed with {len(steps)} steps")
        return steps
    
    async def _react_iteration(
        self,
        query: str,
        plan: ExecutionPlan,
        history: List[ReActStep],
        context: Dict[str, Any],
        iteration: int,
        streaming_callback: Optional[Any] = None
    ) -> ReActStep:
        """
        执行单次 ReAct 迭代
        
        Args:
            query: 用户查询
            plan: 执行计划
            history: 历史步骤
            context: 上下文
            iteration: 当前迭代次数
            streaming_callback: 流式回调函数（可选）
        
        Returns:
            ReActStep: 执行步骤
        
        流程：
        1. Reason: 生成推理/思考
        2. Act: 选择行动
        3. Observe: 执行工具并获取结果
        4. 构建 ReActStep
        """
        logger.info(f"Starting ReAct iteration {iteration}")
        
        try:
            # Step 1: Reason - 生成思考（包含流式处理）
            thought = await self._reason(
                query=query,
                plan=plan,
                history=history,
                context=context,
                iteration=iteration,
                streaming_callback=streaming_callback
            )
            
            logger.info(f"Thought: {thought[:100]}...")
            
            # Step 2: Act - 选择行动（包含流式处理）
            tool_call = await self._act(
                query=query,
                thought=thought,
                plan=plan,
                history=history,
                context=context,
                iteration=iteration,
                streaming_callback=streaming_callback
            )
            
            logger.info(f"Action: {tool_call.tool_name}({tool_call.parameters})")
            
            # Step 3: Observe - 执行工具（包含流式处理）
            observation = await self._observe(
                tool_call=tool_call,
                iteration=iteration,
                streaming_callback=streaming_callback
            )
            
            logger.info(f"Observation: {'Success' if observation.is_success() else 'Failed'}")
            
            # Step 4: 构建结果
            step = ReActStep(
                step_number=iteration,
                thought=thought,
                action=tool_call,
                observation=observation,
                status="completed" if observation.is_success() else "failed",
                timestamp=datetime.now()
            )
            
            return step
        
        except Exception as e:
            logger.error(f"ReAct iteration {iteration} failed: {e}", exc_info=True)
            
            # 返回失败步骤
            return ReActStep(
                step_number=iteration,
                thought=f"Error during iteration: {str(e)}",
                action=ToolCall(
                    tool_name="error",
                    parameters={},
                    reasoning="Iteration failed",
                    confidence=0.0,
                    source="system"
                ),
                observation=ToolResult(
                    success=False,
                    error=str(e),
                    execution_time=0.0,
                    tool_name="error"
                ),
                status="failed",
                timestamp=datetime.now()
            )
    
    async def _reason(
        self,
        query: str,
        plan: ExecutionPlan,
        history: List[ReActStep],
        context: Dict[str, Any],
        iteration: int,
        streaming_callback: Optional[Any] = None
    ) -> str:
        """
        使用 LLM 生成推理/思考（ReAct 的 Reason 步骤）
        
        Args:
            query: 用户查询
            plan: 执行计划
            history: 历史步骤
            context: 上下文
            iteration: 当前迭代次数
            streaming_callback: 流式回调函数（可选）
        
        Returns:
            str: 生成的思考内容
        
        Raises:
            LLMServiceError: 当 LLM 服务不可用或调用失败时
        """
        from ..prompts.react_prompts import ReActReasoningPrompt, format_tools_for_prompt
        from ..services.llm_service import LLMServiceError
        
        logger.info(f"Generating reasoning for iteration {iteration}")
        
        try:
            # 检查 LLM 是否可用
            if not self.llm_service or not self.llm_service.is_available():
                raise LLMServiceError("LLM service not available. Please check your API configuration.")
            
            # 获取可用工具描述
            tools = self.tool_registry.get_all_tools()
            tools_description = format_tools_for_prompt([
                {
                    'name': tool.name,
                    'description': tool.description,
                    'parameters': [
                        {'name': p.name, 'type': p.type}
                        for p in tool.parameters
                    ]
                }
                for tool in tools
            ])
            
            # 构建提示
            prompt = ReActReasoningPrompt.create_prompt(
                query=query,
                plan=plan.to_dict(),
                history=[step.to_dict() for step in history],
                available_tools=tools_description,
                iteration=iteration
            )
            
            # 如果有流式回调，使用流式生成
            if streaming_callback:
                thought = ""
                try:
                    async for chunk in self.llm_service.generate_text_stream(
                        prompt,
                        temperature=0.7,
                        max_tokens=2000
                    ):
                        thought += chunk
                        # 实时发送思考块
                        try:
                            await streaming_callback("thought_chunk", {
                                "step_number": iteration,
                                "chunk": chunk
                            })
                        except Exception as e:
                            logger.warning(f"Streaming callback failed for thought_chunk: {e}")
                except Exception as e:
                    logger.error(f"Streaming reasoning generation failed: {e}")
                    raise
            else:
                # 非流式调用
                thought = await self.llm_service.generate_text(
                    prompt,
                    temperature=0.7,
                    max_tokens=2000
                )
            
            # 解析响应
            thought = ReActReasoningPrompt.parse_response(thought)
            
            logger.info(f"Generated reasoning: {thought[:100]}...")
            return thought
        
        except LLMServiceError as e:
            logger.error(f"LLM service failed during reasoning: {e}")
            error_thought = f"Error generating thought: {str(e)}"
            return error_thought
        except Exception as e:
            logger.error(f"Unexpected error during reasoning: {e}", exc_info=True)
            error_thought = f"Unexpected error during reasoning: {str(e)}"
            return error_thought
    
    async def _act(
        self,
        query: str,
        thought: str,
        plan: ExecutionPlan,
        history: List[ReActStep],
        context: Dict[str, Any],
        iteration: int,
        streaming_callback: Optional[Any] = None
    ) -> ToolCall:
        """
        选择行动（ReAct 的 Act 步骤）
        
        Args:
            query: 用户查询
            thought: 推理内容（来自 _reason()）
            plan: 执行计划
            history: 历史步骤
            context: 上下文
            iteration: 当前迭代次数
            streaming_callback: 流式回调函数（可选）
        
        Returns:
            ToolCall: 选择的工具调用
        """
        from ..prompts.react_prompts import ReActActionPrompt, format_tools_for_prompt
        from ..services.llm_service import LLMServiceError
        
        logger.info(f"Selecting action for iteration {iteration}")
        
        try:
            # 检查 LLM 是否可用
            if not self.llm_service or not self.llm_service.is_available():
                raise LLMServiceError("LLM service not available. Please check your API configuration.")
            
            # 获取可用工具描述
            tools = self.tool_registry.get_all_tools()
            tools_description = format_tools_for_prompt([
                {
                    'name': tool.name,
                    'description': tool.description,
                    'parameters': [
                        {'name': p.name, 'type': p.type}
                        for p in tool.parameters
                    ]
                }
                for tool in tools
            ])
            
            # 构建提示
            prompt = ReActActionPrompt.create_prompt(
                query=query,
                thought=thought,
                plan=plan.to_dict(),
                history=[step.to_dict() for step in history],
                available_tools=tools_description,
                iteration=iteration
            )
            
            # 调用 LLM（行动选择通常不需要流式，因为响应较短）
            response = await self.llm_service.generate_text(
                prompt,
                temperature=0.7,
                max_tokens=1000
            )
            
            # 解析响应
            action_data = ReActActionPrompt.parse_response(response)
            
            # 检查是否是解析错误
            if action_data.get('tool_name') == '_parsing_error':
                logger.error(f"Action parsing failed. Prompt: {prompt[:200]}...")
                logger.error(f"LLM response: {response[:500]}...")
                raise ValueError("Failed to parse LLM response into valid action")
            
            # 创建 ToolCall 对象
            tool_call = ToolCall(
                tool_name=action_data.get('tool_name'),
                parameters=action_data.get('parameters', {}),
                reasoning=action_data.get('reasoning', thought),
                confidence=0.8,
                source="llm"
            )
            
            logger.info(f"Selected action: {tool_call.tool_name}({tool_call.parameters})")
            
            # 发送流式事件
            if streaming_callback:
                try:
                    await streaming_callback("action", {
                        "step_number": iteration,
                        "tool_name": tool_call.tool_name,
                        "parameters": tool_call.parameters,
                        "thought": thought  # 包含完整思考以提供上下文
                    })
                except Exception as e:
                    logger.warning(f"Streaming callback failed for action: {e}")
            
            return tool_call
        
        except (LLMServiceError, ValueError) as e:
            logger.error(f"Action selection failed: {e}")
            # 返回错误 ToolCall
            error_tool_call = ToolCall(
                tool_name="_error",
                parameters={"error": str(e)},
                reasoning="Action selection failed",
                confidence=0.0,
                source="system"
            )
            
            # 仍然发送流式事件（表示错误）
            if streaming_callback:
                try:
                    await streaming_callback("action", {
                        "step_number": iteration,
                        "tool_name": error_tool_call.tool_name,
                        "parameters": error_tool_call.parameters,
                        "thought": thought
                    })
                except Exception as callback_error:
                    logger.warning(f"Streaming callback failed for error action: {callback_error}")
            
            return error_tool_call
        except Exception as e:
            logger.error(f"Unexpected error during action selection: {e}", exc_info=True)
            # 返回错误 ToolCall
            error_tool_call = ToolCall(
                tool_name="_error",
                parameters={"error": str(e)},
                reasoning="Unexpected error during action selection",
                confidence=0.0,
                source="system"
            )
            return error_tool_call
    
    async def _observe(
        self,
        tool_call: ToolCall,
        iteration: int,
        streaming_callback: Optional[Any] = None
    ) -> ToolResult:
        """
        执行工具并收集观察结果（ReAct 的 Observe 步骤）
        
        Args:
            tool_call: 要执行的工具调用
            iteration: 当前迭代次数
            streaming_callback: 流式回调函数（可选）
        
        Returns:
            ToolResult: 工具执行结果
        """
        logger.info(f"Executing tool: {tool_call.tool_name}")
        
        # 使用 ToolOrchestrator 执行工具（带缓存）
        observation = await self.tool_orchestrator.execute_tool(tool_call, use_cache=True)
        
        logger.info(f"Tool execution {'succeeded' if observation.is_success() else 'failed'}")
        
        # 发送流式事件
        if streaming_callback:
            try:
                await streaming_callback("observation", {
                    "step_number": iteration,
                    "success": observation.is_success(),
                    "data": observation.data if observation.is_success() else None,
                    "error": observation.error if not observation.is_success() else None
                })
            except Exception as e:
                logger.warning(f"Streaming callback failed for observation: {e}")
        
        return observation

    
    async def _synthesize_response(
        self,
        query: str,
        steps: List[ReActStep],
        plan: ExecutionPlan,
        streaming_callback: Optional[Any] = None
    ) -> str:
        """
        从执行历史合成最终响应
        
        Args:
            query: 原始查询
            steps: 执行步骤列表
            plan: 执行计划
            streaming_callback: 流式回调函数（可选）
        
        Returns:
            str: 最终响应文本
        
        Raises:
            LLMServiceError: 当 LLM 服务不可用或调用失败时
        """
        from ..prompts.react_prompts import ResponseSynthesisPrompt
        from ..services.llm_service import LLMServiceError
        
        logger.info("Synthesizing final response from execution history")
        
        if not steps:
            return "I wasn't able to execute any steps to answer your query. Please try rephrasing your question."
        
        # 检查 LLM 是否可用
        if not self.llm_service or not self.llm_service.is_available():
            raise LLMServiceError("LLM service not available. Please check your API configuration.")
        
        # 构建提示
        prompt = ResponseSynthesisPrompt.create_prompt(
            query=query,
            execution_steps=[step.to_dict() for step in steps],
            plan=plan.to_dict()
        )
        
        # 如果有流式回调，使用流式生成
        if streaming_callback:
            final_response = ""
            try:
                async for chunk in self.llm_service.generate_text_stream(
                    prompt,
                    temperature=0.7,
                    max_tokens=4000  # Increased for comprehensive responses - prevents truncation
                ):
                    final_response += chunk
                    # 实时发送响应块
                    try:
                        await streaming_callback("response_chunk", {
                            "chunk": chunk
                        })
                    except Exception as e:
                        logger.warning(f"Streaming callback failed: {e}")
            except Exception as e:
                logger.error(f"Streaming synthesis failed: {e}")
                raise
        else:
            # 非流式调用
            final_response = await self.llm_service.generate_text(
                prompt,
                temperature=0.7,
                max_tokens=4000  # Increased for comprehensive responses - prevents truncation
            )
        
        # 解析响应
        final_response = ResponseSynthesisPrompt.parse_response(final_response)
        
        logger.info(f"Synthesized response: {len(final_response)} characters")
        
        return final_response
    

    def _create_simple_plan(self, query: str) -> ExecutionPlan:
        """
        创建简单的执行计划（临时实现）
        
        Args:
            query: 用户查询
        
        Returns:
            ExecutionPlan: 执行计划
        """
        from ..models.react import PlanStep
        
        # 简单分类：根据查询长度判断复杂度
        complexity = "simple" if len(query) < 50 else "medium"
        
        return ExecutionPlan(
            query=query,
            complexity=complexity,
            steps=[
                PlanStep(
                    step_number=1,
                    description="Process user query",
                    tool_name="echo",
                    parameters={"message": query},
                    required=True
                )
            ],
            estimated_iterations=1
        )
    
    def _generate_session_id(self) -> str:
        """
        生成唯一的会话 ID
        
        Returns:
            str: 会话 ID
        """
        return f"session_{uuid.uuid4().hex[:16]}"
    
    async def _save_conversation_fallback(
        self,
        session_id: str,
        query: str,
        response: ReactResponse
    ) -> None:
        """
        保存对话到内存（降级方案）
        
        当数据库不可用时使用内存存储
        
        Args:
            session_id: 会话 ID
            query: 用户查询
            response: Agent 响应
        """
        try:
            # 初始化会话存储
            if session_id not in self._memory_sessions:
                self._memory_sessions[session_id] = []
            
            # 保存对话
            conversation_entry = {
                "timestamp": datetime.now().isoformat(),
                "query": query,
                "response": response.response,
                "steps_count": len(response.steps),
                "success": response.success,
                "execution_time": response.execution_time
            }
            
            self._memory_sessions[session_id].append(conversation_entry)
            
            # 限制内存使用：每个会话最多保留 20 条记录
            if len(self._memory_sessions[session_id]) > 20:
                self._memory_sessions[session_id] = self._memory_sessions[session_id][-20:]
            
            logger.debug(f"Saved conversation to memory: session={session_id}, total={len(self._memory_sessions[session_id])}")
        
        except Exception as e:
            logger.error(f"Failed to save conversation to memory: {e}")
    
    async def _load_conversation_history_fallback(
        self,
        session_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        从内存加载对话历史（降级方案）
        
        Args:
            session_id: 会话 ID
            limit: 最多返回的记录数
        
        Returns:
            List[Dict]: 对话历史
        """
        try:
            if session_id not in self._memory_sessions:
                return []
            
            history = self._memory_sessions[session_id]
            return history[-limit:] if len(history) > limit else history
        
        except Exception as e:
            logger.error(f"Failed to load conversation history from memory: {e}")
            return []


# 全局 ReactAgent 实例
_react_agent: Optional[ReactAgent] = None


def get_react_agent(
    tool_registry: Optional[ToolRegistry] = None,
    llm_service: Optional[BaseLLMService] = None,
    plugin_manager: Optional['PluginManager'] = None,
    conversation_memory: Optional[ConversationMemory] = None,
    task_planner: Optional[TaskPlanner] = None,
    tool_orchestrator: Optional[ToolOrchestrator] = None,
    reflection_engine: Optional[ReflectionEngine] = None
) -> ReactAgent:
    """
    获取全局 ReactAgent 实例
    
    Args:
        tool_registry: 工具注册表（可选）
        llm_service: LLM 服务（可选）
        plugin_manager: 插件管理器（可选）
        conversation_memory: 会话记忆管理器（可选）
        task_planner: 任务规划器（可选）
        tool_orchestrator: 工具编排器（可选）
        reflection_engine: 反思引擎（可选）
    
    Returns:
        ReactAgent: ReactAgent 实例
    """
    global _react_agent
    
    if _react_agent is None:
        _react_agent = ReactAgent(
            tool_registry,
            llm_service,
            plugin_manager,
            conversation_memory,
            task_planner,
            tool_orchestrator,
            reflection_engine
        )
    
    return _react_agent
