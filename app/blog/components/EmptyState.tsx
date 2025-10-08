"use client";

import { motion } from "framer-motion";
import { PenSquare } from "lucide-react";

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center py-12"
    >
      <PenSquare className="mx-auto text-gray-400 mb-4" size={48} />
      <p className="text-text-secondary">暂无博客文章</p>
      <p className="text-sm text-text-muted mt-2 blog-body-text">
        点击上方按钮创建您的第一篇博客文章
      </p>
    </motion.div>
  );
}
