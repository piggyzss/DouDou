"use client";

import { useState, useCallback, useRef } from "react";
import { ReActStep, ExecutionPlan, QualityEvaluation } from "../types/react-agent";

export interface AgentMessage {
  id: string;
  type: "user" | "agent" | "system";
  content: string;
  timestamp: Date;
  status?: "sending" | "success" | "error";
  steps?: ReActStep[];
  plan?: ExecutionPlan;
  evaluation?: QualityEvaluation;
}

export interface AgentState {
  status: "idle" | "processing" | "error";
  lastUpdate: Date | null;
  currentStep?: number;
  totalSteps?: number;
}

export function useAgent() {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "1",
      type: "system",
      content:
        "> Welcome to AI News Agent\n> Intelligence about Intelligence\n> Type '/help' for available commands or ask in natural language",
      timestamp: new Date(),
      status: "success",
    },
  ]);

  const [agentState, setAgentState] = useState<AgentState>({
    status: "idle",
    lastUpdate: new Date(),
    currentStep: undefined,
    totalSteps: undefined,
  });

  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [streamingSteps, setStreamingSteps] = useState<ReActStep[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string>("");

  // 清理 EventSource 连接
  const cleanupEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

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
    setAgentState((prev) => ({ 
      ...prev, 
      status: "processing",
      currentStep: undefined,
      totalSteps: undefined,
    }));

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
        currentStep: undefined,
        totalSteps: undefined,
      }));
      return;
    }

    // 重置流式步骤和响应
    setStreamingSteps([]);
    setCurrentResponse("");

    // 清理之前的 EventSource 连接
    cleanupEventSource();

    try {
      const messageId = (Date.now() + 1).toString();
      const steps: ReActStep[] = [];
      let plan: ExecutionPlan | undefined;
      let evaluation: QualityEvaluation | undefined;
      let accumulatedResponse = "";
      
      const params = new URLSearchParams({
        input: trimmedCommand,
        session_id: "default",
      });
      
      const eventSource = new EventSource(`/api/agent/execute?${params}`);
      eventSourceRef.current = eventSource;
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'start') {
            // 开始执行
          } else if (data.type === 'plan') {
            plan = data.plan as ExecutionPlan;
          } else if (data.type === 'step') {
            const step: ReActStep = {
              step_number: data.step_number,
              thought: data.thought,
              action: { 
                tool_name: data.action, 
                parameters: {} 
              },
              observation: { 
                success: true,
                data: data.observation 
              },
              status: data.status,
              timestamp: new Date().toISOString(),
            };
            steps.push(step);
            setStreamingSteps([...steps]);
            
            setAgentState((prev) => ({
              ...prev,
              currentStep: data.step_number,
              lastUpdate: new Date(),
            }));
          } else if (data.type === 'response_chunk') {
            accumulatedResponse += data.chunk;
            setCurrentResponse(accumulatedResponse);
          } else if (data.type === 'complete') {
            if (data.evaluation) {
              evaluation = data.evaluation as QualityEvaluation;
            }
            
            const finalMessage: AgentMessage = {
              id: messageId,
              type: "agent",
              content: data.response || accumulatedResponse,
              timestamp: new Date(),
              status: "success",
              steps,
              plan,
              evaluation,
            };
            
            setAgentState((prev) => ({
              ...prev,
              status: "idle",
              lastUpdate: new Date(),
              currentStep: undefined,
              totalSteps: undefined,
            }));
            
            setStreamingSteps([]);
            setCurrentResponse("");
            setMessages((prev) => [...prev, finalMessage]);
            
            cleanupEventSource();
          } else if (data.type === 'error') {
            const errorMessage: AgentMessage = {
              id: messageId,
              type: "system",
              content: `[ERROR] ${data.error}\n\n${data.original_error ? `详细信息: ${data.original_error}` : ''}`,
              timestamp: new Date(),
              status: "error",
            };
            
            setAgentState((prev) => ({
              ...prev,
              status: "error",
              lastUpdate: new Date(),
              currentStep: undefined,
              totalSteps: undefined,
            }));
            
            setCurrentResponse("");
            setStreamingSteps([]);
            setMessages((prev) => [...prev, errorMessage]);
            
            cleanupEventSource();
          }
        } catch (err) {
          // 忽略 SSE 解析错误
        }
      };
      
      eventSource.onerror = () => {
        const errorMessage: AgentMessage = {
          id: messageId,
          type: "system",
          content: `> [ERROR] Connection failed. Please try again.`,
          timestamp: new Date(),
          status: "error",
        };
        
        setAgentState((prev) => ({
          ...prev,
          status: "error",
          lastUpdate: new Date(),
          currentStep: undefined,
          totalSteps: undefined,
        }));
        
        setCurrentResponse("");
        setStreamingSteps([]);
        
        setMessages((prev) => {
          const existing = prev.find(m => m.id === messageId);
          if (existing) {
            return prev.map(m => m.id === messageId ? errorMessage : m);
          } else {
            return [...prev, errorMessage];
          }
        });
        
        cleanupEventSource();
      };
      
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
        currentStep: undefined,
        totalSteps: undefined,
      }));
    }
  }, [cleanupEventSource]);

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
    streamingSteps,
    cleanupEventSource,
    currentResponse,
  };
}
