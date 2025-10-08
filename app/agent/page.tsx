"use client";

// import { Metadata } from "next";
import AgentTerminal from "./components/AgentTerminal";

export default function AgentPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto py-12">
        {/* 页面标题 */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-text-primary font-heading">
            AI News Agent
          </h1>
          <p className="text-text-secondary mt-1 font-blog">
            获取最新的 AI 资讯，通过控制台 AI Agent 进行交互
          </p>
        </div>

        {/* Agent 终端组件 */}
        <AgentTerminal />
      </div>
    </div>
  );
}
