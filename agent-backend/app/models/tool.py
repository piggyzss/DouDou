"""
Tool Definition Models - 工具定义数据模型

定义了 Agent 工具系统的核心数据结构：
- ToolParameter: 工具参数定义
- ToolDefinition: 工具定义
- ToolCall: 工具调用请求
- ToolResult: 工具执行结果
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime


class ToolParameter(BaseModel):
    """
    工具参数定义
    
    定义工具的单个参数，包括名称、类型、描述等信息。
    用于 LLM 理解工具的参数要求。
    """
    name: str = Field(..., description="参数名称")
    type: str = Field(..., description="参数类型: string, number, boolean, array, object")
    description: str = Field(..., description="参数描述，帮助 LLM 理解参数用途")
    required: bool = Field(default=False, description="是否必需参数")
    default: Optional[Any] = Field(default=None, description="默认值")
    enum: Optional[List[Any]] = Field(default=None, description="枚举值列表")
    
    @validator('type')
    def validate_type(cls, v):
        """验证参数类型"""
        valid_types = ['string', 'number', 'boolean', 'array', 'object', 'integer']
        if v not in valid_types:
            raise ValueError(f"Invalid parameter type: {v}. Must be one of {valid_types}")
        return v
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        result = {
            "name": self.name,
            "type": self.type,
            "description": self.description,
            "required": self.required
        }
        if self.default is not None:
            result["default"] = self.default
        if self.enum is not None:
            result["enum"] = self.enum
        return result


class ToolDefinition(BaseModel):
    """
    工具定义
    
    完整定义一个工具，包括名称、描述、参数列表和使用示例。
    这是 LLM 理解和选择工具的核心信息。
    """
    name: str = Field(..., description="工具名称，如 get_latest_news")
    description: str = Field(..., description="工具功能描述")
    parameters: List[ToolParameter] = Field(default_factory=list, description="参数列表")
    examples: List[Dict[str, Any]] = Field(default_factory=list, description="使用示例")
    plugin_id: str = Field(..., description="所属插件 ID")
    command: str = Field(..., description="对应的命令，如 /latest")
    category: str = Field(default="general", description="工具分类")
    
    @validator('name')
    def validate_name(cls, v):
        """验证工具名称格式"""
        if not v or not v.replace('_', '').isalnum():
            raise ValueError(f"Invalid tool name: {v}. Must be alphanumeric with underscores")
        return v
    
    def get_required_parameters(self) -> List[ToolParameter]:
        """获取必需参数列表"""
        return [p for p in self.parameters if p.required]
    
    def get_optional_parameters(self) -> List[ToolParameter]:
        """获取可选参数列表"""
        return [p for p in self.parameters if not p.required]
    
    def to_llm_format(self) -> str:
        """
        转换为 LLM 可理解的格式
        
        生成清晰的文本描述，帮助 LLM 理解工具的功能和使用方法。
        """
        lines = []
        
        # 工具名称和描述
        lines.append(f"Tool: {self.name}")
        lines.append(f"Description: {self.description}")
        lines.append(f"Command: {self.command}")
        
        # 参数列表
        if self.parameters:
            lines.append("\nParameters:")
            for param in self.parameters:
                required_mark = " (required)" if param.required else " (optional)"
                lines.append(f"  - {param.name} ({param.type}){required_mark}: {param.description}")
                
                if param.default is not None:
                    lines.append(f"    Default: {param.default}")
                if param.enum:
                    lines.append(f"    Allowed values: {', '.join(map(str, param.enum))}")
        
        # 使用示例
        if self.examples:
            lines.append("\nExamples:")
            for i, example in enumerate(self.examples, 1):
                lines.append(f"  {i}. Input: \"{example.get('input', '')}\"")
                if 'parameters' in example:
                    lines.append(f"     Parameters: {example['parameters']}")
        
        return "\n".join(lines)
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": [p.to_dict() for p in self.parameters],
            "examples": self.examples,
            "plugin_id": self.plugin_id,
            "command": self.command,
            "category": self.category
        }


class ToolCall(BaseModel):
    """
    工具调用请求
    
    表示一次工具调用，包含工具名称、参数和元数据。
    由 LLM 或系统生成，用于执行具体的工具。
    """
    tool_name: str = Field(..., description="要调用的工具名称")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="工具参数")
    reasoning: str = Field(default="", description="LLM 的推理过程")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="置信度 0-1")
    source: str = Field(default="llm", description="来源: llm, command, fallback")
    original_input: str = Field(default="", description="原始用户输入")
    session_id: str = Field(default="", description="会话 ID")
    
    @validator('confidence')
    def validate_confidence(cls, v):
        """验证置信度范围"""
        if not 0.0 <= v <= 1.0:
            raise ValueError(f"Confidence must be between 0 and 1, got {v}")
        return v
    
    def is_high_confidence(self) -> bool:
        """判断是否高置信度（> 0.8）"""
        return self.confidence > 0.8
    
    def is_low_confidence(self) -> bool:
        """判断是否低置信度（< 0.5）"""
        return self.confidence < 0.5
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "tool_name": self.tool_name,
            "parameters": self.parameters,
            "reasoning": self.reasoning,
            "confidence": self.confidence,
            "source": self.source,
            "original_input": self.original_input,
            "session_id": self.session_id
        }


class ToolResult(BaseModel):
    """
    工具执行结果
    
    表示工具执行的结果，包括成功状态、数据、错误信息等。
    """
    success: bool = Field(..., description="执行是否成功")
    data: Optional[Any] = Field(default=None, description="返回数据")
    error: Optional[str] = Field(default=None, description="错误信息")
    execution_time: float = Field(default=0.0, description="执行时间（秒）")
    tool_name: str = Field(..., description="工具名称")
    timestamp: datetime = Field(default_factory=datetime.now, description="执行时间戳")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="额外元数据")
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "success": self.success,
            "data": self.data,
            "error": self.error,
            "execution_time": self.execution_time,
            "tool_name": self.tool_name,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata
        }
    
    def is_success(self) -> bool:
        """判断是否执行成功"""
        return self.success and self.error is None
    
    def get_error_message(self) -> str:
        """获取错误信息"""
        return self.error or "Unknown error"
