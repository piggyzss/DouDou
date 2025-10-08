"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Terminal, Wifi, Link, Bot, Command } from "lucide-react";
import { useTerminalTheme } from "../hooks/useTerminalTheme";
import { useAgent } from "../hooks/useAgent";

export default function AgentTerminal() {
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const terminalTheme = useTerminalTheme();
  const { messages, agentState, processCommand, getHistoryCommand } =
    useAgent();

  // 确保只在客户端渲染时显示时间
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 自动滚动到底部，但不影响页面整体位置
  useEffect(() => {
    if (messagesEndRef.current) {
      // 只滚动终端内部的消息区域，不影响页面整体位置
      const messagesContainer = messagesEndRef.current.closest(
        ".terminal-messages-container",
      );
      if (messagesContainer) {
        // 使用 requestAnimationFrame 确保 DOM 更新完成后再滚动
        requestAnimationFrame(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
      }
    }
  }, [messages]);

  // 自动聚焦输入框
  useEffect(() => {
    if (!isMinimized) {
      // 延迟聚焦确保组件完全渲染
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMinimized]);

  // 确保输入框始终有焦点，但不干扰文本选择
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // 检查是否在终端消息区域内，如果是则不重新聚焦
      const target = e.target as HTMLElement;
      const isInMessagesArea = target.closest(".terminal-messages-container");

      // 如果用户正在选择文本，不重新聚焦
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        return;
      }

      // 如果点击的是终端消息区域，不重新聚焦
      if (isInMessagesArea) {
        return;
      }

      if (!isMinimized && inputRef.current) {
        inputRef.current.focus();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isMinimized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await processCommand(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const historyCommand = getHistoryCommand("up");
      if (historyCommand !== null) {
        setInput(historyCommand);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const historyCommand = getHistoryCommand("down");
      if (historyCommand !== null) {
        setInput(historyCommand);
      }
    }
  };

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, index) => {
      // 检测不同类型的输出并应用样式
      if (line.includes("[INFO]")) {
        const parts = line.split("[INFO]");
        return (
          <div key={index} className="flex mb-3">
            <span className="text-terminal-blue font-bold text-sm">[INFO]</span>
            <span className="text-terminal-text ml-3 font-medium leading-relaxed">
              {parts[1] || ""}
            </span>
          </div>
        );
      } else if (line.includes("[SUCCESS]")) {
        const parts = line.split("[SUCCESS]");
        return (
          <div key={index} className="flex mb-3">
            <span className="text-terminal-green font-bold text-sm">
              [SUCCESS]
            </span>
            <span className="text-terminal-text ml-3 font-medium leading-relaxed">
              {parts[1] || ""}
            </span>
          </div>
        );
      } else if (line.includes("[ERROR]")) {
        const parts = line.split("[ERROR]");
        return (
          <div key={index} className="flex mb-3">
            <span className="text-terminal-red font-bold text-sm">[ERROR]</span>
            <span className="text-terminal-text ml-3 font-medium leading-relaxed">
              {parts[1] || ""}
            </span>
          </div>
        );
      } else if (line.includes("[ANALYSIS]")) {
        const parts = line.split("[ANALYSIS]");
        return (
          <div key={index} className="flex mb-3">
            <span className="text-terminal-cyan font-bold text-sm">
              [ANALYSIS]
            </span>
            <span className="text-terminal-text ml-3 font-medium leading-relaxed">
              {parts[1] || ""}
            </span>
          </div>
        );
      } else if (line.includes("[INSIGHTS]")) {
        const parts = line.split("[INSIGHTS]");
        return (
          <div key={index} className="flex mb-3">
            <span className="text-terminal-accent font-bold text-sm">
              [INSIGHTS]
            </span>
            <span className="text-terminal-text ml-3 font-medium leading-relaxed">
              {parts[1] || ""}
            </span>
          </div>
        );
      } else if (line.includes("[RECOMMENDATION]")) {
        const parts = line.split("[RECOMMENDATION]");
        return (
          <div key={index} className="flex mb-3">
            <span className="text-terminal-pink font-bold text-sm">
              [RECOMMENDATION]
            </span>
            <span className="text-terminal-text ml-3 font-medium leading-relaxed">
              {parts[1] || ""}
            </span>
          </div>
        );
      } else if (line.startsWith("user@agent:~$")) {
        return (
          <div key={index} className="flex mb-3">
            <span className="text-terminal-accent font-bold">
              user@agent:~$
            </span>
            <span className="ml-3 text-terminal-text font-medium">
              {line.replace("user@agent:~$", "").trim()}
            </span>
          </div>
        );
      } else if (line.startsWith(">")) {
        return (
          <div key={index} className="text-gray-400 mb-1">
            {line}
          </div>
        );
      }

      // 处理数字标题（如 "1. 标题"）
      if (line.match(/^\d+\./)) {
        return (
          <div key={index} className="mb-2">
            <div className="text-terminal-cyan font-semibold text-sm mb-1">
              {line}
            </div>
          </div>
        );
      }

      // 处理Title标签
      if (line.includes("Title:")) {
        const parts = line.split("Title:");
        return (
          <div key={index} className="mb-2">
            <div className="flex items-center">
              <span className="text-terminal-orange font-semibold text-sm">
                Title:
              </span>
              <span className="text-terminal-text ml-2 text-sm">
                {parts[1] || ""}
              </span>
            </div>
          </div>
        );
      }

      // 处理Summary标签
      if (line.includes("Summary:")) {
        const parts = line.split("Summary:");
        return (
          <div key={index} className="mb-2">
            <div className="flex items-center">
              <span className="text-terminal-pink font-semibold text-sm">
                Summary:
              </span>
              <span className="text-terminal-text ml-2 text-sm">
                {parts[1] || ""}
              </span>
            </div>
          </div>
        );
      }

      // 处理Source行 - 使用灰色
      if (line.includes("Source:")) {
        const parts = line.split("Source:");
        return (
          <div key={index} className="mb-2">
            <div className="flex items-center">
              <span className="text-terminal-light-gray font-semibold text-sm">
                Source:
              </span>
              <span className="text-terminal-light-gray ml-2 text-sm">
                {parts[1] || ""}
              </span>
            </div>
          </div>
        );
      }

      // 处理时间行 - 使用特殊颜色
      if (
        line.includes("Time:") ||
        line.includes("Date:") ||
        line.includes("Published:")
      ) {
        const parts = line.split(/Time:|Date:|Published:/);
        const label = line.includes("Time:")
          ? "Time:"
          : line.includes("Date:")
            ? "Date:"
            : "Published:";
        return (
          <div key={index} className="mb-2">
            <div className="flex items-center">
              <span className="text-terminal-orange font-semibold text-sm">
                {label}
              </span>
              <span className="text-terminal-gray ml-2 text-sm">
                {parts[1] || ""}
              </span>
            </div>
          </div>
        );
      }

      // 处理包含链接的行
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      if (urlRegex.test(line)) {
        const parts = line.split(urlRegex);
        return (
          <div key={index} className="text-terminal-text mb-2 leading-relaxed">
            {parts.map((part, partIndex) => {
              if (urlRegex.test(part)) {
                // 截断长链接，保留前50个字符
                const maxLength = 50;
                const displayText =
                  part.length > maxLength
                    ? part.substring(0, maxLength) + "..."
                    : part;

                return (
                  <a
                    key={partIndex}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="terminal-link inline-flex items-center gap-1"
                    style={{
                      color: "var(--primary-light)",
                      textDecoration: "underline",
                      transition: "color 0.2s ease",
                      maxWidth: "100%",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--primary-light)";
                    }}
                    title={part} // 显示完整链接作为tooltip
                  >
                    <Link size={12} />
                    {displayText}
                  </a>
                );
              }
              return part;
            })}
          </div>
        );
      }

      // 处理特殊关键词
      if (line.includes("Category:") || line.includes("Tags:")) {
        const parts = line.split(/Category:|Tags:/);
        const label = line.includes("Category:") ? "Category:" : "Tags:";
        return (
          <div key={index} className="mb-2">
            <div className="flex items-center">
              <span className="text-terminal-orange font-semibold text-sm">
                {label}
              </span>
              <span className="text-terminal-gray ml-2 text-sm">
                {parts[1] || ""}
              </span>
            </div>
          </div>
        );
      }

      // 处理普通文本内容
      if (line.trim()) {
        return (
          <div key={index} className="text-terminal-text mb-2 leading-relaxed">
            {line}
          </div>
        );
      }

      // 空行
      return <div key={index} className="mb-1"></div>;
    });
  };

  if (isMinimized) {
    return (
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-2 px-4 py-2 bg-terminal-bg border border-terminal-border rounded-lg shadow-lg hover:shadow-xl transition-all"
          style={{
            backgroundColor: "var(--terminal-bg)",
            borderColor: "var(--terminal-border)",
            color: "var(--terminal-text)",
          }}
        >
          <Terminal size={16} strokeWidth={1.5} />
          <span className="text-sm font-medium font-blog">AI Agent</span>
          {agentState.status === "processing" && (
            <div className="w-2 h-2 bg-terminal-accent rounded-full animate-pulse"></div>
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        className={`terminal-container ${terminalTheme} w-full rounded-lg shadow-2xl overflow-hidden flex flex-col`}
        style={{
          backgroundColor: "var(--terminal-bg)",
          borderColor: "var(--terminal-border)",
          height: "600px",
          maxHeight: "600px",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Terminal 标题栏 */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--terminal-border)" }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center space-x-2">
              <Terminal
                size={16}
                strokeWidth={1.5}
                className="text-terminal-accent"
              />
              <span
                className="text-sm font-medium font-blog"
                style={{ color: "var(--terminal-text)" }}
              >
                AI News Agent v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 状态显示 */}
            <div
              className="flex items-center space-x-2 text-xs font-blog"
              style={{ color: "var(--terminal-muted)" }}
            >
              <div className="flex items-center space-x-1">
                <Bot
                  size={14}
                  strokeWidth={1.5}
                  className={`${
                    agentState.status === "idle"
                      ? "text-green-500"
                      : agentState.status === "processing"
                        ? "text-yellow-500 animate-pulse"
                        : "text-red-500"
                  } flex-shrink-0`}
                />
                <span className="capitalize">{agentState.status}</span>
              </div>
              <span>|</span>
              <div className="flex items-center space-x-1">
                <Wifi size={12} strokeWidth={1.5} className="flex-shrink-0" />
                <span>Online</span>
              </div>
              <span>|</span>
              <span>
                Last Update:{" "}
                {isClient
                  ? agentState.lastUpdate?.toLocaleTimeString()
                  : "--:--:--"}
              </span>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={isSidebarOpen ? "Hide Commands" : "Show Commands"}
              >
                <Command
                  size={16}
                  strokeWidth={1.5}
                  style={{ color: "var(--terminal-muted)" }}
                />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Minimize"
              >
                <X
                  size={16}
                  strokeWidth={1.5}
                  style={{ color: "var(--terminal-muted)" }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Terminal 内容区域 */}
        <div className="flex flex-1 min-h-0">
          {/* 主要终端区域 */}
          <div className="flex-1 flex flex-col">
            {/* 消息显示区域 */}
            <div className="flex-1 p-6 overflow-y-auto font-mono text-sm font-normal leading-relaxed terminal-messages-container custom-scrollbar terminal-content-text">
              {messages.map((message) => (
                <div key={message.id} className="mb-2">
                  {formatMessage(message.content)}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div
              className="p-6 border-t"
              style={{ borderColor: "var(--terminal-border)" }}
            >
              <form onSubmit={handleSubmit} className="flex items-center">
                <span className="text-terminal-accent font-mono text-sm font-bold">
                  user@agent:~$
                </span>
                <div className="flex-1 flex items-center ml-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none font-mono text-sm font-medium terminal-input"
                    style={{
                      color: "var(--terminal-text)",
                      caretColor: "var(--terminal-accent)",
                    }}
                    placeholder="Type a command..."
                    disabled={agentState.status === "processing"}
                  />
                </div>
                {agentState.status === "processing" && (
                  <div className="flex items-center space-x-1 ml-2">
                    <div
                      className="w-0.5 h-4 bg-terminal-accent animate-pulse"
                      style={{
                        animation: "blink 1s infinite",
                        width: "2px",
                      }}
                    ></div>
                    <span className="text-xs text-terminal-muted">
                      Processing...
                    </span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* 侧边栏 - 快捷命令 */}
          <motion.div
            className="border-l bg-gray-50 dark:bg-gray-800 overflow-hidden"
            style={{ borderColor: "var(--terminal-border)" }}
            animate={{
              width: isSidebarOpen ? 256 : 0,
              opacity: isSidebarOpen ? 1 : 0,
            }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
          >
            <div className="w-64 p-4">
              <h3
                className="text-sm font-medium mb-3 font-blog"
                style={{ color: "var(--terminal-text)" }}
              >
                Quick Commands
              </h3>
              <div className="space-y-2">
                {[
                  { cmd: "/latest", desc: "Get latest news" },
                  { cmd: "/trending", desc: "Show trends" },
                  { cmd: "/deepdive", desc: "Deep analysis" },
                  { cmd: "/help", desc: "Show help" },
                ].map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => {
                      setInput(item.cmd);
                      inputRef.current?.focus();
                    }}
                    className="w-full text-left p-2 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    style={{ color: "var(--terminal-muted)" }}
                  >
                    <div className="font-mono text-terminal-accent">
                      {item.cmd}
                    </div>
                    <div className="font-blog">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
