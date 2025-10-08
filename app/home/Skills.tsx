"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { useTheme } from "../providers";
import { useState, useEffect } from "react";

export default function Skills() {
  const { theme } = useTheme();
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const handleImageClick = () => {
    setIsImagePreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsImagePreviewOpen(false);
  };

  // 添加ESC键关闭功能
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isImagePreviewOpen) {
        handleClosePreview();
      }
    };

    if (isImagePreviewOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // 防止背景滚动
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isImagePreviewOpen]);

  return (
    <section className="pt-16 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* 新的动画标题区域 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false }}
          className="text-center mb-12"
        >
          {/* 两条横线容器 */}
          <div className="flex items-center justify-center mb-6">
            {/* 左侧横线 */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: false }}
              className="h-0.5 bg-text-primary flex-1 max-w-32"
              style={{ transformOrigin: "right" }}
            />

            {/* 标题 */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: false }}
              className="text-2xl font-medium text-text-primary font-english mx-6 px-4 py-2"
            >
              Skill
            </motion.h2>

            {/* 右侧横线 */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: false }}
              className="h-0.5 bg-text-primary flex-1 max-w-32"
              style={{ transformOrigin: "left" }}
            />
          </div>
        </motion.div>

        {/* 技能图片展示 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false }}
          className="flex justify-center items-center"
        >
          <div className="relative w-full max-w-4xl">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer"
              onClick={handleImageClick}
            >
              <Image
                src={
                  theme === "dark"
                    ? "/assets/images/skill_dark.svg"
                    : "/assets/images/skill.svg"
                }
                alt="技能展示"
                width={800}
                height={400}
                className="w-full h-auto transition-all duration-300 hover:shadow-lg"
                priority
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* 图片预览模态框 */}
      <AnimatePresence>
        {isImagePreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={handleClosePreview}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-6xl max-h-[90vh] mx-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 上下留白 */}
              <div className="py-6">
                <div className="relative inline-block">
                  {/* 关闭按钮（右上角） */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    onClick={handleClosePreview}
                    className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors z-10 p-2 bg-black/60 rounded-full hover:bg-black/80"
                    title="关闭预览"
                  >
                    <X size={22} />
                  </motion.button>

                  <Image
                    src={
                      theme === "dark"
                        ? "/assets/images/skill_dark.svg"
                        : "/assets/images/skill.svg"
                    }
                    alt="技能展示"
                    className="max-w-full max-h-[80vh] object-contain rounded shadow-2xl"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
