"use client";

import { motion } from "framer-motion";
import { Code, Smartphone, Gamepad2, Wallet, Puzzle } from "lucide-react";

interface FilterBarProps {
  onFilter: (type: string) => void;
  selectedType: string;
}

function FilterBar({ onFilter, selectedType }: FilterBarProps) {
  const typeOptions = [
    { value: "all", label: "全部", icon: Wallet, size: 18 },
    { value: "app", label: "应用", icon: Code, size: 20 },
    { value: "miniprogram", label: "小程序", icon: Smartphone, size: 20 },
    { value: "game", label: "游戏", icon: Gamepad2, size: 20 },
    { value: "plugin", label: "插件", icon: Puzzle, size: 18 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex space-x-4"
    >
      {typeOptions.map((option) => {
        const Icon = option.icon;
        return (
          <div key={option.value} className="relative group">
            <motion.button
              onClick={() => onFilter(option.value)}
              className={`p-2 rounded-full transition-all duration-300 ${
                selectedType === option.value
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-text-secondary hover:text-text-primary"
              }`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon size={option.size} />
            </motion.button>
            {/* 自定义tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs font-blog rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {option.label}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

export default FilterBar;
