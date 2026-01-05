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
  // 生成唯一的 session ID（每个浏览器标签页一个会话）
  const [sessionId] = useState(() => {
    // 尝试从 localStorage 获取现有 session ID
    const stored = typeof window !== 'undefined' ? localStorage.getItem('agent_session_id') : null;
    if (stored) {
      return stored;
    }
    // 生成新的 session ID: timestamp + random
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('agent_session_id', newSessionId);
    }
    return newSessionId;
  });

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
        session_id: sessionId,  // 使用唯一的 session ID
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
          } else if (data.type === 'thought_chunk') {
            // 实时思考块 - 更新当前步骤的思考内容
            const stepNumber = data.step_number;
            
            setStreamingSteps((prevSteps) => {
              const existingStepIndex = prevSteps.findIndex(s => s.step_number === stepNumber);
              if (existingStepIndex >= 0) {
                // 更新现有步骤的思考内容
                const updatedSteps = [...prevSteps];
                updatedSteps[existingStepIndex] = {
                  ...updatedSteps[existingStepIndex],
                  thought: (updatedSteps[existingStepIndex].thought || '') + data.chunk,
                  status: 'running',  // 确保状态是 running
                };
                return updatedSteps;
              } else {
                // 创建新步骤
                return [...prevSteps, {
                  step_number: stepNumber,
                  thought: data.chunk,
                  action: { tool_name: '', parameters: {} },
                  observation: { success: true, data: '' },
                  status: 'running',  // 设置为 running 状态
                  timestamp: new Date().toISOString(),
                }];
              }
            });
            
            setAgentState((prev) => ({
              ...prev,
              currentStep: stepNumber,
              lastUpdate: new Date(),
            }));
          } else if (data.type === 'action') {
            // 行动事件 - 包含完整思考和选择的工具
            const stepNumber = data.step_number;
            setStreamingSteps((prevSteps) => {
              const existingStepIndex = prevSteps.findIndex(s => s.step_number === stepNumber);
              if (existingStepIndex >= 0) {
                // 更新现有步骤
                const updatedSteps = [...prevSteps];
                updatedSteps[existingStepIndex] = {
                  ...updatedSteps[existingStepIndex],
                  thought: data.thought || updatedSteps[existingStepIndex].thought,
                  action: {
                    tool_name: data.tool_name,
                    parameters: data.parameters || {},
                  },
                  status: 'running',  // 使用 'running' 而不是 'executing'
                };
                return updatedSteps;
              } else {
                // 创建新步骤
                return [...prevSteps, {
                  step_number: stepNumber,
                  thought: data.thought || '',
                  action: {
                    tool_name: data.tool_name,
                    parameters: data.parameters || {},
                  },
                  observation: { success: true, data: '' },
                  status: 'running',  // 使用 'running' 而不是 'executing'
                  timestamp: new Date().toISOString(),
                }];
              }
            });
          } else if (data.type === 'observation') {
            // 观察事件 - 工具执行结果
            const stepNumber = data.step_number;
            
            // 更新 streamingSteps 并同时更新 steps 数组
            setStreamingSteps((prevSteps) => {
              const existingStepIndex = prevSteps.findIndex(s => s.step_number === stepNumber);
              if (existingStepIndex >= 0) {
                const updatedSteps = [...prevSteps];
                const updatedStep = {
                  ...updatedSteps[existingStepIndex],
                  observation: {
                    success: data.success,
                    data: data.data,
                    error: data.error,
                  },
                  status: data.success ? 'completed' : 'failed',
                };
                updatedSteps[existingStepIndex] = updatedStep;
                
                // 同时更新 steps 数组
                const existingInSteps = steps.findIndex(s => s.step_number === stepNumber);
                if (existingInSteps >= 0) {
                  steps[existingInSteps] = updatedStep;
                } else {
                  steps.push(updatedStep);
                }
                
                return updatedSteps;
              }
              return prevSteps;
            });
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
