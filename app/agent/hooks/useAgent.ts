"use client";

import { useState, useCallback } from "react";
import { agentPluginManager } from "@/lib/agent/plugin-manager";
import { AgentRequest, AgentResponse } from "@/lib/agent/types";

// 格式化结构化响应的辅助函数
const formatStructuredResponse = (data: any, command: string): string => {
  if (command === "/help") {
    const plugins = agentPluginManager.getAllPlugins();
    let helpText = "Available commands:\n";

    plugins.forEach((plugin) => {
      if (plugin.enabled) {
        helpText += `\n=== ${plugin.name} ===\n`;
        plugin.commands.forEach((cmd) => {
          helpText += `${cmd.command.padEnd(20)} # ${cmd.description}\n`;
        });
      }
    });

    return helpText;
  }

  // 默认格式化
  if (typeof data === "string") {
    return data;
  }

  return JSON.stringify(data, null, 2);
};

export interface AgentMessage {
  id: string;
  type: "user" | "agent" | "system";
  content: string;
  timestamp: Date;
  status?: "sending" | "success" | "error";
}

export interface AgentState {
  status: "idle" | "processing" | "error";
  lastUpdate: Date | null;
}

export function useAgent() {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "1",
      type: "system",
      content:
        "> Welcome to AI News Agent\n> Intelligence about Intelligence\n> Type '/help' for available commands",
      timestamp: new Date(),
      status: "success",
    },
  ]);

  const [agentState, setAgentState] = useState<AgentState>({
    status: "idle",
    lastUpdate: new Date(),
  });

  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const processCommand = useCallback(async (command: string) => {
    const trimmedCommand = command.trim();

    // 添加用户消息
    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      type: "user",
      content: `user@agent:~$ ${command}`,
      timestamp: new Date(),
      status: "success",
    };

    setMessages((prev) => [...prev, userMessage]);

    // 更新命令历史
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    // 设置处理状态
    setAgentState((prev) => ({ ...prev, status: "processing" }));

    // 处理特殊命令
    if (trimmedCommand.toLowerCase() === "/clear") {
      // 清空消息历史
      setMessages([
        {
          id: Date.now().toString(),
          type: "system",
          content: "> Terminal cleared\n> Welcome back to AI News Agent",
          timestamp: new Date(),
          status: "success",
        },
      ]);
      setAgentState((prev) => ({
        ...prev,
        status: "idle",
        lastUpdate: new Date(),
      }));
      return;
    }

    try {
      // 使用插件管理器处理命令
      const request: AgentRequest = {
        command: trimmedCommand.toLowerCase(),
        params: {},
        sessionId: "default",
      };

      const response: AgentResponse =
        await agentPluginManager.executeCommand(request);

      let responseContent = "";
      if (response.success) {
        // 根据响应类型格式化内容
        if (response.type === "structured" && response.data) {
          responseContent = formatStructuredResponse(
            response.data,
            response.command,
          );
        } else {
          responseContent = response.data || "> Command executed successfully";
        }
      } else {
        responseContent = `> [ERROR] ${response.error}`;
      }

      const agentMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        type: response.success ? "agent" : "system",
        content: responseContent,
        timestamp: new Date(),
        status: response.success ? "success" : "error",
      };

      setMessages((prev) => [...prev, agentMessage]);
      setAgentState((prev) => ({
        ...prev,
        status: "idle",
        lastUpdate: new Date(),
      }));
    } catch (error) {
      const errorMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content: `> [ERROR] ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        timestamp: new Date(),
        status: "error",
      };

      setMessages((prev) => [...prev, errorMessage]);
      setAgentState((prev) => ({
        ...prev,
        status: "error",
        lastUpdate: new Date(),
      }));
    }
  }, []);

  const getHistoryCommand = useCallback(
    (direction: "up" | "down") => {
      if (commandHistory.length === 0) return "";

      if (direction === "up") {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          return commandHistory[commandHistory.length - 1 - newIndex];
        }
      } else {
        const newIndex = historyIndex - 1;
        if (newIndex >= 0) {
          setHistoryIndex(newIndex);
          return commandHistory[commandHistory.length - 1 - newIndex];
        } else if (newIndex === -1) {
          setHistoryIndex(-1);
          return "";
        }
      }

      return null;
    },
    [commandHistory, historyIndex],
  );

  return {
    messages,
    agentState,
    processCommand,
    getHistoryCommand,
    setMessages,
  };
}
