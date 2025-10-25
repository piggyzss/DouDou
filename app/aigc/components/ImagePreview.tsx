"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  imageUrl: string;
  hasPrev: boolean;
  hasNext: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentIndex?: number;
  total?: number;
}

export default function ImagePreview({
  isOpen,
  imageUrl,
  hasPrev,
  hasNext,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  total,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-4xl max-h-[90vh] mx-8"
          >
            {/* 图片容器 - 确保控件定位在图片内 */}
            <div className="relative inline-block overflow-hidden rounded shadow-2xl">
              {/* 图片 */}
              <Image
                src={imageUrl}
                alt="预览图片"
                width={800}
                height={600}
                className="max-w-full max-h-[80vh] object-contain block"
              />
              
              {/* 左上角计数器（图片内，响应式内边距） */}
              {typeof currentIndex === "number" &&
                typeof total === "number" && (
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 text-white text-xs sm:text-sm bg-black/70 px-2 py-1 sm:px-3 sm:py-1.5 rounded backdrop-blur-sm z-10 font-medium">
                    {currentIndex + 1} / {total}
                  </div>
                )}
              
              {/* 关闭按钮（图片内右上角，响应式内边距） */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                onClick={onClose}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 text-white hover:text-gray-300 transition-all duration-200 z-10 p-2 sm:p-2.5 bg-black/70 rounded-full hover:bg-black/80 hover:scale-110 backdrop-blur-sm"
                title="关闭预览"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </motion.button>
              
              {/* 左切换按钮（响应式内边距和尺寸） */}
              {hasPrev && (
                <motion.button
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  onClick={onPrev}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-black/70 text-white p-2 sm:p-3 rounded-full hover:bg-black/80 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                  title="上一张"
                >
                  <ChevronLeft size={18} className="sm:w-6 sm:h-6" />
                </motion.button>
              )}
              
              {/* 右切换按钮（响应式内边距和尺寸） */}
              {hasNext && (
                <motion.button
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  onClick={onNext}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-black/70 text-white p-2 sm:p-3 rounded-full hover:bg-black/80 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                  title="下一张"
                >
                  <ChevronRight size={18} className="sm:w-6 sm:h-6" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
