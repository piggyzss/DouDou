"""
ReAct Agent Data Models - ReAct Agent 数据模型

定义了 ReAct Agent 系统的核心数据结构：
- ReActStep: ReAct 循环的单次迭代
- ExecutionPlan: 任务执行计划
- PlanStep: 执行计划中的单个步骤
- QualityEvaluation: 输出质量评估
- ReactResponse: ReAct 执行的完整响应
- ConversationTurn: 对话轮次
"""

from typing import Dict, Any, List, Optional, Literal
from pydantic import BaseModel, Field, validator
from datetime import datetime

# 导入现有的工具模型
from .tool import ToolCall, ToolResult


class ReActStep(BaseModel):
    """
    ReAct 循环的单次迭代
    
    表示 ReAct (Reasoning + Acting) 循环中的一个步骤，
    包含思考、行动和观察三个核心要素。
    """
    step_number: int = Field(..., description="步骤编号，从 1 开始")
    thought: str = Field(..., description="Agent 的思考过程和推理")
    action: ToolCall = Field(..., description="选择执行的工具调用")
    observation: ToolResult = Field(..., description="工具执行的观察结果")
    status: Literal["pending", "running", "completed", "failed"] = Field(
        default="pending",
        description="步骤状态"
    )
    timestamp: datetime = Field(default_factory=datetime.now, description="步骤时间戳")
    
    @validator('thought')
    def validate_thought(cls, v):
        """验证思考内容不为空"""
        if not v or not v.strip():
            raise ValueError("Thought cannot be empty")
        return v.strip()
    
    @validator('step_number')
    def validate_step_number(cls, v):
        """验证步骤编号为正数"""
        if v < 1:
            raise ValueError(f"Step number must be positive, got {v}")
        return v
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "step_number": self.step_number,
            "thought": self.thought,
            "action": self.action.to_dict(),
            "observation": self.observation.to_dict(),
            "status": self.status,
            "timestamp": self.timestamp.isoformat()
        }
    
    def is_completed(self) -> bool:
        """判断步骤是否完成"""
        return self.status in ["completed", "failed"]
    
    def is_successful(self) -> bool:
        """判断步骤是否成功"""
        return self.status == "completed" and self.observation.is_success()


class PlanStep(BaseModel):
    """
    执行计划中的单个步骤
    
    描述任务分解后的一个子任务，包括要使用的工具、
    参数和依赖关系。
    """
    step_number: int = Field(..., description="步骤编号")
    description: str = Field(..., description="步骤描述")
    tool_name: str = Field(..., description="要使用的工具名称")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="工具参数")
    required: bool = Field(default=True, description="是否为必需步骤")
    depends_on: Optional[int] = Field(default=None, description="依赖的步骤编号")
    
    @validator('tool_name')
    def validate_tool_name(cls, v):
        """验证工具名称不为空"""
        if not v or not v.strip():
            raise ValueError("Tool name cannot be empty")
        return v.strip()
    
    @validator('description')
    def validate_description(cls, v):
        """验证描述不为空"""
        if not v or not v.strip():
            raise ValueError("Description cannot be empty")
        return v.strip()
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "step_number": self.step_number,
            "description": self.description,
            "tool_name": self.tool_name,
            "parameters": self.parameters,
            "required": self.required,
            "depends_on": self.depends_on
        }
    
    def has_dependency(self) -> bool:
        """判断是否有依赖"""
        return self.depends_on is not None


class ExecutionPlan(BaseModel):
    """
    任务执行计划
    
    将复杂查询分解为一系列可执行的步骤，
    包括复杂度评估和迭代次数估计。
    """
    query: str = Field(..., description="原始用户查询")
    complexity: Literal["simple", "medium", "complex"] = Field(
        ...,
        description="查询复杂度"
    )
    steps: List[PlanStep] = Field(default_factory=list, description="执行步骤列表")
    estimated_iterations: int = Field(..., ge=1, description="预计迭代次数")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    
    @validator('estimated_iterations')
    def validate_iterations(cls, v):
        """验证迭代次数为正数"""
        if v < 1:
            raise ValueError(f"Estimated iterations must be at least 1, got {v}")
        if v > 10:
            raise ValueError(f"Estimated iterations too high: {v}, maximum is 10")
        return v
    
    @validator('steps')
    def validate_steps(cls, v, values):
        """验证步骤列表"""
        complexity = values.get('complexity')
        
        # 复杂查询至少需要 2 个步骤
        if complexity == 'complex' and len(v) < 2:
            raise ValueError("Complex queries must have at least 2 steps")
        
        # 简单查询最多 1 个步骤
        if complexity == 'simple' and len(v) > 1:
            raise ValueError("Simple queries should have at most 1 step")
        
        return v
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "query": self.query,
            "complexity": self.complexity,
            "steps": [step.to_dict() for step in self.steps],
            "estimated_iterations": self.estimated_iterations,
            "created_at": self.created_at.isoformat()
        }
    
    def is_simple(self) -> bool:
        """判断是否为简单查询"""
        return self.complexity == "simple"
    
    def is_complex(self) -> bool:
        """判断是否为复杂查询"""
        return self.complexity == "complex"
    
    def get_step(self, step_number: int) -> Optional[PlanStep]:
        """获取指定编号的步骤"""
        for step in self.steps:
            if step.step_number == step_number:
                return step
        return None


class QualityEvaluation(BaseModel):
    """
    输出质量评估
    
    评估 Agent 输出的完整性和质量，
    用于决定是否需要继续迭代。
    """
    completeness_score: int = Field(..., ge=0, le=10, description="完整性评分 (0-10)")
    quality_score: int = Field(..., ge=0, le=10, description="质量评分 (0-10)")
    missing_info: List[str] = Field(default_factory=list, description="缺失的信息")
    needs_retry: bool = Field(..., description="是否需要重试")
    suggestions: List[str] = Field(default_factory=list, description="改进建议")
    evaluated_at: datetime = Field(default_factory=datetime.now, description="评估时间")
    
    @validator('completeness_score', 'quality_score')
    def validate_score_range(cls, v):
        """验证评分范围"""
        if not 0 <= v <= 10:
            raise ValueError(f"Score must be between 0 and 10, got {v}")
        return v
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "completeness_score": self.completeness_score,
            "quality_score": self.quality_score,
            "missing_info": self.missing_info,
            "needs_retry": self.needs_retry,
            "suggestions": self.suggestions,
            "evaluated_at": self.evaluated_at.isoformat()
        }
    
    def is_high_quality(self) -> bool:
        """判断是否高质量（完整性 >= 8）"""
        return self.completeness_score >= 8
    
    def is_low_quality(self) -> bool:
        """判断是否低质量（完整性 < 7）"""
        return self.completeness_score < 7
    
    def get_average_score(self) -> float:
        """获取平均分"""
        return (self.completeness_score + self.quality_score) / 2.0


class ReactResponse(BaseModel):
    """
    ReAct 执行的完整响应
    
    包含最终响应、执行步骤、计划和质量评估等
    完整的执行信息。
    """
    success: bool = Field(..., description="执行是否成功")
    response: str = Field(..., description="最终响应内容")
    steps: List[ReActStep] = Field(default_factory=list, description="执行步骤列表")
    plan: ExecutionPlan = Field(..., description="执行计划")
    evaluation: QualityEvaluation = Field(..., description="质量评估")
    session_id: str = Field(..., description="会话 ID")
    execution_time: float = Field(..., ge=0, description="总执行时间（秒）")
    error: Optional[str] = Field(default=None, description="错误信息")
    timestamp: datetime = Field(default_factory=datetime.now, description="响应时间戳")
    
    # 向后兼容字段
    type: str = Field(default="react", description="响应类型")
    plugin: str = Field(default="react_agent", description="插件名称")
    command: str = Field(default="", description="命令（向后兼容）")
    
    @validator('execution_time')
    def validate_execution_time(cls, v):
        """验证执行时间为非负数"""
        if v < 0:
            raise ValueError(f"Execution time cannot be negative, got {v}")
        return v
    
    @validator('steps')
    def validate_steps_limit(cls, v):
        """验证步骤数量不超过限制"""
        if len(v) > 5:
            raise ValueError(f"Too many steps: {len(v)}, maximum is 5")
        return v
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "success": self.success,
            "response": self.response,
            "steps": [step.to_dict() for step in self.steps],
            "plan": self.plan.to_dict(),
            "evaluation": self.evaluation.to_dict(),
            "session_id": self.session_id,
            "execution_time": self.execution_time,
            "error": self.error,
            "timestamp": self.timestamp.isoformat(),
            "type": self.type,
            "plugin": self.plugin,
            "command": self.command
        }
    
    def get_iteration_count(self) -> int:
        """获取实际迭代次数"""
        return len(self.steps)
    
    def get_successful_steps(self) -> List[ReActStep]:
        """获取成功的步骤"""
        return [step for step in self.steps if step.is_successful()]
    
    def get_failed_steps(self) -> List[ReActStep]:
        """获取失败的步骤"""
        return [step for step in self.steps if step.status == "failed"]
    
    def to_legacy_response(self) -> Dict[str, Any]:
        """
        转换为旧版 AgentResponse 格式（向后兼容）
        
        Returns:
            Dict: 兼容旧版 API 的响应格式
        """
        return {
            "success": self.success,
            "data": self.response,
            "error": self.error or "",
            "type": self.type,
            "plugin": self.plugin,
            "command": self.command,
            "timestamp": self.timestamp.isoformat(),
            # 新增字段
            "steps": [step.to_dict() for step in self.steps],
            "plan": self.plan.to_dict(),
            "evaluation": self.evaluation.to_dict(),
            "execution_time": self.execution_time
        }


class ConversationTurn(BaseModel):
    """
    对话轮次
    
    表示一次完整的用户-Agent 交互，
    用于会话历史存储和检索。
    """
    id: Optional[int] = Field(default=None, description="数据库 ID")
    session_id: str = Field(..., description="会话 ID")
    user_query: str = Field(..., description="用户查询")
    agent_response: str = Field(..., description="Agent 响应")
    steps: List[Dict[str, Any]] = Field(default_factory=list, description="执行步骤（JSON）")
    plan: Optional[Dict[str, Any]] = Field(default=None, description="执行计划（JSON）")
    evaluation: Optional[Dict[str, Any]] = Field(default=None, description="质量评估（JSON）")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    
    @validator('user_query', 'agent_response')
    def validate_not_empty(cls, v):
        """验证内容不为空"""
        if not v or not v.strip():
            raise ValueError("Query and response cannot be empty")
        return v.strip()
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "id": self.id,
            "session_id": self.session_id,
            "user_query": self.user_query,
            "agent_response": self.agent_response,
            "steps": self.steps,
            "plan": self.plan,
            "evaluation": self.evaluation,
            "created_at": self.created_at.isoformat()
        }
    
    @classmethod
    def from_react_response(
        cls,
        session_id: str,
        user_query: str,
        react_response: ReactResponse
    ) -> "ConversationTurn":
        """
        从 ReactResponse 创建 ConversationTurn
        
        Args:
            session_id: 会话 ID
            user_query: 用户查询
            react_response: ReAct 响应
        
        Returns:
            ConversationTurn: 对话轮次对象
        """
        return cls(
            session_id=session_id,
            user_query=user_query,
            agent_response=react_response.response,
            steps=[step.to_dict() for step in react_response.steps],
            plan=react_response.plan.to_dict(),
            evaluation=react_response.evaluation.to_dict(),
            created_at=react_response.timestamp
        )
