"use client";

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import BaseModal from "./BaseModal";

export type ConfirmType = "danger" | "warning" | "info";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "确认",
  cancelText = "取消",
  type = "danger",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
}) {
  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: <AlertTriangle className="text-red-500" size={24} />,
          button: "bg-red-500 hover:bg-red-600 text-white",
        };
      case "warning":
        return {
          icon: <AlertCircle className="text-yellow-500" size={24} />,
          button: "bg-yellow-500 hover:bg-yellow-600 text-white",
        };
      default:
        return {
          icon: <Info className="text-blue-500" size={24} />,
          button: "bg-blue-500 hover:bg-blue-600 text-white",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{styles.icon}</div>
        <div className="flex-1">
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
    </BaseModal>
  );
}
