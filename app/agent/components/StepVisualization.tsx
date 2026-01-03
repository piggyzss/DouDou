"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Circle } from "lucide-react";
import { ReActStep, StepStatus } from "../types/react-agent";

interface StepVisualizationProps {
  steps: ReActStep[];
  currentStep?: number;
  isStreaming?: boolean;
}

const getStatusIcon = (status: StepStatus) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "failed":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "running":
      return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
    case "pending":
      return <Circle className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: StepStatus) => {
  switch (status) {
    case "completed":
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    case "failed":
      return "border-red-500 bg-red-50 dark:bg-red-900/20";
    case "running":
      return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
    case "pending":
      return "border-gray-300 bg-gray-50 dark:bg-gray-800";
  }
};

export default function StepVisualization({
  steps,
  currentStep,
  isStreaming = false,
}: StepVisualizationProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {steps.map((step, index) => (
          <motion.div
            key={step.step_number}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`border-l-4 rounded-lg p-3 ${getStatusColor(step.status)}`}
          >
            {/* Step Header */}
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Step {step.step_number}
                  </span>
                  {step.status === "running" && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 animate-pulse">
                      Processing...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Thought */}
            {step.thought && (
              <div className="mb-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  💭 Thought:
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 pl-4">
                  {step.thought}
                  {/* 如果步骤正在运行，显示打字机光标 */}
                  {step.status === 'running' && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-yellow-500 animate-pulse align-middle"></span>
                  )}
                </div>
              </div>
            )}

            {/* Action */}
            {step.action && (
              <div className="mb-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  🔧 Action:
                </div>
                <div className="text-sm pl-4">
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {step.action.tool_name}
                  </span>
                  {Object.keys(step.action.parameters).length > 0 && (
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      ({Object.entries(step.action.parameters)
                        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                        .join(", ")})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Observation */}
            {step.observation && step.status !== "pending" && (
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  📊 Observation:
                </div>
                <div className="text-sm pl-4">
                  {step.observation.success ? (
                    <div className="text-gray-700 dark:text-gray-300">
                      {typeof step.observation.data === "string"
                        ? step.observation.data
                        : JSON.stringify(step.observation.data, null, 2)}
                    </div>
                  ) : (
                    <div className="text-red-600 dark:text-red-400">
                      Error: {step.observation.error || "Unknown error"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
