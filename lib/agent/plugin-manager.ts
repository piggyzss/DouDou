import { AgentRequest, AgentResponse } from "./types";

/**
 * Agent Plugin Manager - 简化版
 * 
 * 职责：
 * - 作为前端与后端 Agent API 的接口层
 * - 所有插件管理、命令验证、意图解析都由后端处理
 */
export class AgentPluginManager {
  /**
   * 执行命令或自然语言查询
   * 
   * @param request - 包含 command（用户输入）和其他参数
   * @returns Agent 响应
   */
  async executeCommand(request: AgentRequest): Promise<AgentResponse> {
    try {
      const response = await fetch("/api/agent/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: request.command, // 用户输入（命令或自然语言）
          session_id: request.sessionId || "default",
          context: request.params || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // 处理错误响应
      if (!result.success) {
        return {
          success: false,
          error: result.error || "Unknown error",
          type: "error",
          plugin: result.plugin || "system",
          command: request.command,
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: result.data,
        type: result.type || "text",
        plugin: result.plugin || "unknown",
        command: result.command || request.command,
        timestamp: Date.now(),
        metadata: result.metadata, // 传递 metadata（包含 steps, plan, evaluation）
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        type: "error",
        plugin: "system",
        command: request.command,
        timestamp: Date.now(),
      };
    }
  }
}

// 单例模式
export const agentPluginManager = new AgentPluginManager();
