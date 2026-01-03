"""
Reflection Engine - 自我反思和质量评估引擎

实现了：
- 输出质量评估（完整性和质量评分）
- 任务完成检测
- 循环终止逻辑
- 缺失信息识别
"""

from typing import List, Dict, Any, Optional
from loguru import logger

from ..models.react import (
    ReActStep,
    ExecutionPlan,
    QualityEvaluation
)
from ..services.llm_service import BaseLLMService, get_llm_service, LLMServiceError


class ReflectionEngine:
    """
    反思引擎
    
    职责：
    1. 评估 Agent 输出的完整性和质量
    2. 确定任务是否完成
    3. 识别缺失的信息
    4. 防止无限循环
    
    设计原则：
    - 使用 LLM 进行智能评估
    - 提供明确的评分标准（0-10）
    - 支持自适应终止条件
    """
    
    def __init__(self, llm_service: Optional[BaseLLMService] = None):
        """
        初始化反思引擎
        
        Args:
            llm_service: LLM 服务（可选）
        """
        self.llm_service = llm_service or get_llm_service()
        logger.info("ReflectionEngine initialized")
    
    async def evaluate_output(
        self,
        query: str,
        output: str,
        plan: ExecutionPlan,
        steps: List[ReActStep]
    ) -> QualityEvaluation:
        """
        评估 Agent 输出的质量
        
        Args:
            query: 原始用户查询
            output: Agent 生成的输出
            plan: 执行计划
            steps: 执行步骤列表
        
        Returns:
            QualityEvaluation: 质量评估结果
        
        评估维度：
        1. 完整性（0-10）：输出是否完全回答了查询
        2. 质量（0-10）：输出是否准确、格式良好
        3. 缺失信息：识别未回答的部分
        4. 是否需要重试：基于评分决定
        5. 改进建议：提供具体的改进方向
        """
        logger.info("Evaluating output quality")
        
        try:
            # 检查 LLM 是否可用
            if not self.llm_service or not self.llm_service.is_available():
                logger.warning("LLM service not available, using fallback evaluation")
                return self._fallback_evaluation(output, steps)
            
            # 使用 LLM 进行评估
            evaluation = await self._llm_evaluate(query, output, plan, steps)
            
            logger.info(
                f"Evaluation complete: completeness={evaluation.completeness_score}/10, "
                f"quality={evaluation.quality_score}/10, needs_retry={evaluation.needs_retry}"
            )
            
            return evaluation
        
        except Exception as e:
            logger.error(f"Evaluation failed: {e}", exc_info=True)
            return self._fallback_evaluation(output, steps)
    
    async def _llm_evaluate(
        self,
        query: str,
        output: str,
        plan: ExecutionPlan,
        steps: List[ReActStep]
    ) -> QualityEvaluation:
        """
        使用 LLM 进行智能评估
        
        Args:
            query: 原始查询
            output: Agent 输出
            plan: 执行计划
            steps: 执行步骤
        
        Returns:
            QualityEvaluation: 评估结果
        """
        from ..prompts.react_prompts import ReflectionPrompt
        
        # 构建评估提示
        prompt = ReflectionPrompt.create_prompt(
            query=query,
            output=output,
            plan=plan.to_dict(),
            steps=[step.to_dict() for step in steps]
        )
        
        # 调用 LLM
        response = await self.llm_service.generate_text(
            prompt,
            temperature=0.3,  # 较低温度以获得更一致的评估
            max_tokens=500
        )
        
        # 解析响应
        evaluation_data = ReflectionPrompt.parse_response(response)
        
        # 确保评分在有效范围内
        completeness_score = self._clamp_score(evaluation_data.get('completeness_score', 5))
        quality_score = self._clamp_score(evaluation_data.get('quality_score', 5))
        
        # 根据评分决定是否需要重试
        needs_retry = completeness_score < 7
        
        return QualityEvaluation(
            completeness_score=completeness_score,
            quality_score=quality_score,
            missing_info=evaluation_data.get('missing_info', []),
            needs_retry=needs_retry,
            suggestions=evaluation_data.get('suggestions', [])
        )
    
    def _fallback_evaluation(
        self,
        output: str,
        steps: List[ReActStep]
    ) -> QualityEvaluation:
        """
        降级评估方法（当 LLM 不可用时）
        
        基于简单规则进行评估：
        - 输出长度
        - 成功步骤比例
        - 是否有错误
        
        Args:
            output: Agent 输出
            steps: 执行步骤
        
        Returns:
            QualityEvaluation: 评估结果
        """
        logger.info("Using fallback evaluation method")
        
        if not steps:
            return QualityEvaluation(
                completeness_score=0,
                quality_score=0,
                missing_info=["No steps executed"],
                needs_retry=True,
                suggestions=["Execute at least one step"]
            )
        
        # 计算成功率
        successful_steps = [s for s in steps if s.is_successful()]
        success_rate = len(successful_steps) / len(steps)
        
        # 基于成功率和输出长度评分
        completeness_score = int(success_rate * 10)
        
        # 输出长度影响质量评分
        if len(output) < 50:
            quality_score = max(0, completeness_score - 2)
        elif len(output) > 1000:
            quality_score = min(10, completeness_score + 1)
        else:
            quality_score = completeness_score
        
        # 识别缺失信息
        missing_info = []
        if success_rate < 1.0:
            failed_steps = [s for s in steps if not s.is_successful()]
            missing_info = [f"Step {s.step_number} failed: {s.observation.error}" for s in failed_steps]
        
        needs_retry = completeness_score < 7
        
        suggestions = []
        if needs_retry:
            suggestions.append("Consider retrying failed steps")
        if len(output) < 50:
            suggestions.append("Provide more detailed response")
        
        return QualityEvaluation(
            completeness_score=completeness_score,
            quality_score=quality_score,
            missing_info=missing_info,
            needs_retry=needs_retry,
            suggestions=suggestions
        )
    
    def should_continue(
        self,
        steps: List[ReActStep],
        plan: ExecutionPlan,
        evaluation: Optional[QualityEvaluation] = None
    ) -> bool:
        """
        确定是否应该继续执行更多迭代
        
        Args:
            steps: 当前执行步骤列表
            plan: 执行计划
            evaluation: 质量评估（可选）
        
        Returns:
            bool: True 表示应该继续，False 表示应该停止
        
        改进的终止逻辑：
        1. 优先检查计划步骤完成度
        2. 检查是否超过最大迭代次数（硬限制）
        3. 检查最后一步是否失败
        4. 基于质量评估决定（如果有）
        5. 对于复杂任务，允许更多迭代
        """
        # 检查是否有步骤
        if not steps:
            return True  # 至少执行一步
        
        current_iterations = len(steps)
        last_step = steps[-1]
        
        # 硬限制：绝对最大迭代次数（防止无限循环）
        absolute_max_iterations = 5  # ReactAgent.MAX_ITERATIONS
        if current_iterations >= absolute_max_iterations:
            logger.info(
                f"Stopping: reached absolute max iterations ({absolute_max_iterations})"
            )
            return False
        
        # 条件 1：最后一步失败
        if last_step.status == "failed":
            logger.info("Stopping: last step failed")
            return False
        
        # 条件 2：基于评估决定（如果有完整评估）
        if evaluation:
            if evaluation.completeness_score >= 8:
                logger.info(
                    f"Stopping: high completeness score ({evaluation.completeness_score}/10)"
                )
                return False
            
            if not evaluation.needs_retry:
                logger.info("Stopping: evaluation indicates no retry needed")
                return False
        
        # 条件 3：检查计划步骤完成度
        # 统计已执行的不同工具类型
        executed_tools = set(step.action.tool_name for step in steps if step.is_successful())
        planned_tools = set(step.tool_name for step in plan.steps)
        
        # 如果所有计划的工具都已执行，检查是否应该继续
        if planned_tools.issubset(executed_tools):
            # 对于复杂任务，即使完成了所有计划步骤，也可能需要额外的综合步骤
            if plan.complexity == "complex" and current_iterations < plan.estimated_iterations:
                logger.info(
                    f"Continuing: complex task, all planned tools executed but "
                    f"may need synthesis ({current_iterations}/{plan.estimated_iterations})"
                )
                return True
            else:
                logger.info(
                    f"Stopping: all planned tools executed "
                    f"({len(executed_tools)}/{len(planned_tools)})"
                )
                return False
        
        # 条件 4：对于复杂任务，允许更多迭代
        if plan.complexity == "complex":
            # 复杂任务允许超过估计迭代次数
            max_allowed = min(plan.estimated_iterations + 2, absolute_max_iterations)
        elif plan.complexity == "medium":
            # 中等任务允许少量额外迭代
            max_allowed = min(plan.estimated_iterations + 1, absolute_max_iterations)
        else:
            # 简单任务严格按照估计
            max_allowed = min(plan.estimated_iterations, absolute_max_iterations)
        
        if current_iterations >= max_allowed:
            logger.info(
                f"Stopping: reached max allowed iterations for {plan.complexity} task "
                f"({current_iterations}/{max_allowed})"
            )
            return False
        
        # 默认：继续执行
        logger.info(
            f"Continuing: {current_iterations}/{max_allowed} iterations, "
            f"executed tools: {len(executed_tools)}/{len(planned_tools)}"
        )
        return True
    
    def _clamp_score(self, score: Any) -> int:
        """
        将评分限制在 0-10 范围内
        
        Args:
            score: 原始评分
        
        Returns:
            int: 限制后的评分（0-10）
        """
        try:
            score_int = int(score)
            return max(0, min(10, score_int))
        except (ValueError, TypeError):
            logger.warning(f"Invalid score value: {score}, using default 5")
            return 5


# 全局 ReflectionEngine 实例
_reflection_engine: Optional[ReflectionEngine] = None


def get_reflection_engine(llm_service: Optional[BaseLLMService] = None) -> ReflectionEngine:
    """
    获取全局 ReflectionEngine 实例
    
    Args:
        llm_service: LLM 服务（可选）
    
    Returns:
        ReflectionEngine: ReflectionEngine 实例
    """
    global _reflection_engine
    
    if _reflection_engine is None:
        _reflection_engine = ReflectionEngine(llm_service)
    
    return _reflection_engine
