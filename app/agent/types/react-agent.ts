/**
 * TypeScript interfaces for ReactAgent
 * Corresponds to Python data models in agent-backend/app/models/react.py
 */

export interface ToolCall {
  tool_name: string;
  parameters: Record<string, any>;
}

export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
}

export type StepStatus = "pending" | "running" | "completed" | "failed";

export interface ReActStep {
  step_number: number;
  thought: string;
  action: ToolCall;
  observation: ToolResult;
  status: StepStatus;
  timestamp: string;
}

export interface PlanStep {
  step_number: number;
  description: string;
  tool_name: string;
  parameters: Record<string, any>;
  required: boolean;
  depends_on?: number;
}

export type QueryComplexity = "simple" | "medium" | "complex";

export interface ExecutionPlan {
  query: string;
  complexity: QueryComplexity;
  steps: PlanStep[];
  estimated_iterations: number;
}

export interface QualityEvaluation {
  completeness_score: number;
  quality_score: number;
  missing_info: string[];
  needs_retry: boolean;
  suggestions: string[];
}

export interface ReactResponse {
  success: boolean;
  response: string;
  steps: ReActStep[];
  plan: ExecutionPlan;
  evaluation: QualityEvaluation;
  session_id: string;
  execution_time: number;
  error?: string;
}

export interface AgentMetadata {
  steps?: ReActStep[];
  plan?: ExecutionPlan;
  evaluation?: QualityEvaluation;
  session_id?: string;
  execution_time?: number;
}
