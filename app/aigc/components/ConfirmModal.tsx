"use client";

import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "确认",
  cancelText = "取消",
  type = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: <AlertTriangle className="text-red-500" size={24} />,
          button: "bg-red-500 hover:bg-red-600 text-white",
          border: "border-red-200 dark:border-red-800",
        };
      case "warning":
        return {
          icon: <AlertCircle className="text-yellow-500" size={24} />,
          button: "bg-yellow-500 hover:bg-yellow-600 text-white",
          border: "border-yellow-200 dark:border-yellow-800",
        };
      default:
        return {
          icon: <Info className="text-blue-500" size={24} />,
          button: "bg-blue-500 hover:bg-blue-600 text-white",
          border: "border-blue-200 dark:border-blue-800",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`bg-white dark:bg-gray-800 rounded p-6 w-full max-w-md mx-4 relative border ${styles.border}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">{styles.icon}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-heading mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-body">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
