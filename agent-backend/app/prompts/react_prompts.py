"""
ReAct Prompt Templates - ReAct Agent 提示模板

定义了 ReAct Agent 系统使用的所有 LLM 提示模板。
每个模板都经过精心设计，以获得最佳的 LLM 响应质量。
"""

from typing import Dict, Any, List, Optional
from datetime import datetime


class TaskPlanningPrompt:
    """
    任务规划提示模板
    
    用于分析用户查询并创建结构化的执行计划。
    包括复杂度分类、任务分解和工具选择。
    """
    
    SYSTEM_PROMPT = """You are an expert task planning assistant for an AI agent system.

Your role is to:
1. Analyze user queries and classify their complexity
2. Break down complex queries into executable sub-tasks
3. Identify the appropriate tools for each sub-task
4. Estimate the number of iterations needed
5. Define dependencies between tasks

You have access to various tools that can help accomplish different tasks.
Always think step-by-step and create clear, actionable plans."""
    
    @staticmethod
    def create_prompt(
        query: str,
        tools_description: str,
        conversation_history: Optional[List[Dict[str, Any]]] = None,
        complexity: str = "medium"
    ) -> str:
        """
        创建任务规划提示
        
        Args:
            query: 用户查询
            tools_description: 可用工具描述
            conversation_history: 对话历史（可选）
        
        Returns:
            str: 完整的提示文本
        """
        history_context = ""
        if conversation_history:
            history_context = "\n\nConversation History:\n"
            for turn in conversation_history[-3:]:  # 最近3轮对话
                history_context += f"User: {turn.get('user_query', '')}\n"
                history_context += f"Agent: {turn.get('agent_response', '')}\n"
        
        prompt = f"""Analyze the following user query and create an execution plan.

User Query: {query}
{history_context}

Available Tools:
{tools_description}

Please analyze the query and provide a structured execution plan in JSON format:

{{
  "complexity": "simple|medium|complex",
  "reasoning": "Brief explanation of complexity classification",
  "steps": [
    {{
      "step_number": 1,
      "description": "Clear description of what this step does",
      "tool_name": "name_of_tool_to_use",
      "parameters": {{"param1": "value1"}},
      "required": true,
      "depends_on": null
    }}
  ],
  "estimated_iterations": 3
}}

Classification Guidelines:
- **Simple**: Single tool, straightforward task, no dependencies (1 step)
- **Medium**: 2-3 tools, some coordination needed (2-3 steps)
- **Complex**: Multiple tools, complex dependencies, multi-step reasoning (3+ steps)

Important:
- For simple queries, create a plan with exactly 1 step
- For complex queries, create at least 2 steps
- Estimated iterations should be realistic (1-5)
- Mark steps as required=false only if they're truly optional
- Use depends_on to reference previous step numbers when needed

Return ONLY the JSON object, no additional text."""
        
        return prompt
    
    @staticmethod
    def parse_response(response: str) -> Dict[str, Any]:
        """
        解析 LLM 响应为结构化数据
        
        Args:
            response: LLM 响应文本
        
        Returns:
            Dict: 解析后的计划数据
        """
        import json
        import re
        
        # 尝试提取 JSON
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # 如果解析失败，返回默认简单计划
        return {
            "complexity": "simple",
            "reasoning": "Failed to parse LLM response",
            "steps": [{
                "step_number": 1,
                "description": "Process query",
                "tool_name": "echo",
                "parameters": {},
                "required": True,
                "depends_on": None
            }],
            "estimated_iterations": 1
        }


class ReActIterationPrompt:
    """
    ReAct 迭代提示模板
    
    用于在 ReAct 循环的每次迭代中生成思考和选择行动。
    遵循 Thought → Action → Observation 的模式。
    """
    
    SYSTEM_PROMPT = """You are an intelligent AI agent using the ReAct (Reasoning + Acting) framework.

Your task is to:
1. Think step-by-step about what needs to be done
2. Choose the most appropriate tool and parameters
3. Reason about why this action will help accomplish the goal

Always be explicit about your reasoning and choose actions that make progress toward the goal."""
    
    @staticmethod
    def create_prompt(
        query: str,
        plan: Dict[str, Any],
        history: List[Dict[str, Any]],
        available_tools: str,
        iteration: int
    ) -> str:
        """
        创建 ReAct 迭代提示
        
        Args:
            query: 原始用户查询
            plan: 执行计划
            history: 已执行的步骤历史
            available_tools: 可用工具描述
            iteration: 当前迭代次数
        
        Returns:
            str: 完整的提示文本
        """
        # 构建历史上下文
        history_text = ""
        if history:
            history_text = "\n\nPrevious Steps:\n"
            for step in history:
                history_text += f"Step {step['step_number']}:\n"
                history_text += f"  Thought: {step['thought']}\n"
                history_text += f"  Action: {step['action']['tool_name']}({step['action']['parameters']})\n"
                history_text += f"  Observation: {step['observation'].get('data', step['observation'].get('error', 'N/A'))}\n"
                history_text += f"  Status: {step['status']}\n"
        
        # 构建计划上下文
        plan_text = f"\nExecution Plan (Complexity: {plan.get('complexity', 'unknown')}):\n"
        for step in plan.get('steps', []):
            plan_text += f"  {step['step_number']}. {step['description']} (Tool: {step['tool_name']})\n"
        
        prompt = f"""You are executing a task using the ReAct framework.

Original Task: {query}
{plan_text}
{history_text}

Current Iteration: {iteration}/{plan.get('estimated_iterations', 5)}

Available Tools:
{available_tools}

Think step-by-step about what to do next:
1. What have we accomplished so far?
2. What's the next logical step toward completing the task?
3. Which tool should we use and with what parameters?

Respond in JSON format (NO markdown code blocks, just raw JSON):
{{
  "thought": "Your detailed reasoning about the next step",
  "tool_name": "name_of_tool_to_use",
  "parameters": {{
    "param1": "value1",
    "param2": "value2"
  }},
  "reasoning": "Why this action will help accomplish the goal"
}}

Example response:
{{
  "thought": "The user wants to know about recent OpenAI developments. I should use the get_latest_news tool to fetch recent AI news.",
  "tool_name": "get_latest_news",
  "parameters": {{
    "count": 5,
    "keywords": ["OpenAI"]
  }},
  "reasoning": "This will retrieve the most recent news articles about OpenAI"
}}

CRITICAL RULES:
- Return ONLY the JSON object
- Do NOT wrap in markdown code blocks (no ```)
- Do NOT add any explanatory text before or after the JSON
- Choose a tool from the available tools list above
- Be specific and actionable in your thought process
- Use information from previous observations when available

Return your response now:"""
        
        return prompt
    
    @staticmethod
    def parse_response(response: str) -> Dict[str, Any]:
        """
        解析 LLM 响应为结构化数据
        
        Args:
            response: LLM 响应文本
        
        Returns:
            Dict: 解析后的行动数据
        """
        import json
        import re
        from loguru import logger
        
        # 尝试提取 JSON（支持 markdown 代码块）
        # 首先尝试提取 ```json ... ``` 代码块
        code_block_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
        if code_block_match:
            try:
                return json.loads(code_block_match.group(1))
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse JSON from code block: {e}")
        
        # 然后尝试直接提取 JSON 对象
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse JSON: {e}")
        
        # 如果解析失败，记录详细日志并返回错误指示
        logger.error(f"Unable to parse LLM response. Response text: {response[:500]}...")
        
        # 返回一个特殊的错误标记，而不是调用不存在的工具
        return {
            "thought": "I apologize, but I encountered an error processing your request. The system was unable to parse my internal reasoning.",
            "tool_name": "_parsing_error",  # 特殊标记，不是真实工具
            "parameters": {"error": "LLM response parsing failed", "response_preview": response[:200]},
            "reasoning": "Parsing error - this indicates a prompt engineering issue that needs to be fixed"
        }


class ReflectionPrompt:
    """
    反思评估提示模板
    
    用于评估 Agent 输出的质量和完整性,
    决定是否需要继续迭代.
    """
    
    SYSTEM_PROMPT = """You are a quality evaluation expert for AI agent outputs.

Your role is to:
1. Evaluate the completeness of the agent's response
2. Assess the quality and accuracy of the output
3. Identify any missing information
4. Provide constructive suggestions for improvement
5. Decide if the task is complete or needs more work

Be objective and thorough in your evaluation."""
    
    @staticmethod
    def create_prompt(
        query: str,
        plan: Dict[str, Any],
        response: str,
        execution_steps: List[Dict[str, Any]]
    ) -> str:
        """
        创建反思评估提示
        
        Args:
            query: 原始用户查询
            plan: 执行计划
            response: Agent 生成的响应
            execution_steps: 执行步骤列表
        
        Returns:
            str: 完整的提示文本
        """
        steps_summary = "\n".join([
            f"Step {s['step_number']}: {s['action']['tool_name']} - {s['status']}"
            for s in execution_steps
        ])
        
        prompt = f"""Evaluate the quality of this AI agent's response.

Original Query: {query}

Execution Plan Complexity: {plan.get('complexity', 'unknown')}
Estimated Iterations: {plan.get('estimated_iterations', 'N/A')}

Execution Steps:
{steps_summary}

Agent's Response:
{response}

Please evaluate the response on the following criteria:

1. **Completeness** (0-10): Does the response fully address the user's query?
   - 0-3: Missing critical information
   - 4-6: Partially complete, missing some details
   - 7-9: Mostly complete, minor gaps
   - 10: Fully complete and comprehensive

2. **Quality** (0-10): Is the response accurate, well-formatted, and useful?
   - 0-3: Poor quality, inaccurate, or unhelpful
   - 4-6: Acceptable quality with some issues
   - 7-9: Good quality, minor improvements possible
   - 10: Excellent quality, accurate and helpful

Provide your evaluation in JSON format:
{{
  "completeness_score": 8,
  "quality_score": 9,
  "missing_info": ["List any missing information"],
  "needs_retry": false,
  "suggestions": ["List suggestions for improvement"],
  "reasoning": "Brief explanation of your scores"
}}

Guidelines:
- Score >= 8 on completeness means the task is complete (needs_retry=false)
- Score < 7 on completeness means more work is needed (needs_retry=true)
- Be specific about what's missing or could be improved
- Consider the complexity of the original query

Return ONLY the JSON object, no additional text."""
        
        return prompt
    
    @staticmethod
    def parse_response(response: str) -> Dict[str, Any]:
        """
        解析 LLM 响应为结构化数据
        
        Args:
            response: LLM 响应文本
        
        Returns:
            Dict: 解析后的评估数据
        """
        import json
        import re
        
        # 尝试提取 JSON
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            try:
                data = json.loads(json_match.group())
                # 确保分数在有效范围内
                data['completeness_score'] = max(0, min(10, data.get('completeness_score', 5)))
                data['quality_score'] = max(0, min(10, data.get('quality_score', 5)))
                return data
            except json.JSONDecodeError:
                pass
        
        # 如果解析失败，返回默认评估
        return {
            "completeness_score": 5,
            "quality_score": 5,
            "missing_info": ["Unable to evaluate"],
            "needs_retry": True,
            "suggestions": ["Retry with clearer instructions"],
            "reasoning": "Failed to parse evaluation response"
        }


class ResponseSynthesisPrompt:
    """
    响应合成提示模板
    
    用于从执行历史中生成最终的、连贯的响应。
    将多个步骤的结果整合成用户友好的回答。
    """
    
    SYSTEM_PROMPT = """You are an expert at synthesizing information into clear, helpful responses.

Your role is to:
1. Review the execution history of an AI agent
2. Extract key information from tool outputs
3. Synthesize a coherent, user-friendly response
4. Ensure the response directly addresses the user's query

Always be clear, concise, and helpful in your responses."""
    
    @staticmethod
    def create_prompt(
        query: str,
        execution_steps: List[Dict[str, Any]],
        plan: Dict[str, Any]
    ) -> str:
        """
        创建响应合成提示
        
        Args:
            query: 原始用户查询
            execution_steps: 执行步骤列表
            plan: 执行计划
        
        Returns:
            str: 完整的提示文本
        """
        # 构建执行历史
        execution_history = ""
        for step in execution_steps:
            execution_history += f"\nStep {step['step_number']}: {step['action']['tool_name']}\n"
            execution_history += f"  Thought: {step['thought']}\n"
            
            observation = step['observation']
            if observation.get('success'):
                execution_history += f"  Result: {observation.get('data', 'N/A')}\n"
            else:
                execution_history += f"  Error: {observation.get('error', 'Unknown error')}\n"
        
        prompt = f"""Synthesize a final response based on the agent's execution history.

User's Original Query:
{query}

Task Complexity: {plan.get('complexity', 'unknown')}

Execution History:
{execution_history}

Based on the execution history above, create a clear, helpful response that:
1. Directly addresses the user's query
2. Incorporates relevant information from successful tool executions
3. Is well-formatted and easy to understand
4. Acknowledges any limitations or errors encountered
5. Provides actionable information when possible

Guidelines:
- Start with the most important information
- Use clear, natural language
- Format lists or structured data appropriately
- If errors occurred, explain what went wrong and suggest alternatives
- Keep the response concise but complete
- Do not mention internal details like "Step 1", "Tool X", etc. - focus on the user's needs

Generate the final response (plain text, not JSON):"""
        
        return prompt
    
    @staticmethod
    def parse_response(response: str) -> str:
        """
        解析 LLM 响应
        
        Args:
            response: LLM 响应文本
        
        Returns:
            str: 清理后的响应文本
        """
        # 移除可能的 JSON 包装
        import re
        
        # 如果响应被 JSON 包装，提取内容
        json_match = re.search(r'"response"\s*:\s*"([^"]*)"', response)
        if json_match:
            return json_match.group(1)
        
        # 否则返回清理后的原始响应
        return response.strip()


# 便利函数

def format_tools_for_prompt(tools: List[Dict[str, Any]]) -> str:
    """
    格式化工具列表为提示文本
    
    Args:
        tools: 工具定义列表
    
    Returns:
        str: 格式化的工具描述
    """
    if not tools:
        return "No tools available."
    
    formatted = []
    for tool in tools:
        tool_desc = f"- **{tool['name']}**: {tool.get('description', 'No description')}"
        
        if tool.get('parameters'):
            params = ", ".join([
                f"{p['name']} ({p['type']})"
                for p in tool['parameters']
            ])
            tool_desc += f"\n  Parameters: {params}"
        
        formatted.append(tool_desc)
    
    return "\n".join(formatted)


def format_conversation_history(history: List[Dict[str, Any]], limit: int = 5) -> str:
    """
    格式化对话历史为提示文本
    
    Args:
        history: 对话历史列表
        limit: 最多包含的轮次数
    
    Returns:
        str: 格式化的对话历史
    """
    if not history:
        return "No previous conversation."
    
    recent_history = history[-limit:]
    formatted = []
    
    for i, turn in enumerate(recent_history, 1):
        formatted.append(f"Turn {i}:")
        formatted.append(f"  User: {turn.get('user_query', 'N/A')}")
        formatted.append(f"  Agent: {turn.get('agent_response', 'N/A')[:200]}...")  # 截断长响应
    
    return "\n".join(formatted)
