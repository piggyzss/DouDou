"use client";

import { motion } from "framer-motion";
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
  const handlePrev = () => {
    onPrev();
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <>
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
            className="relative inline-block max-w-[95vw] max-h-[95vh]"
          >
            {/* 图片容器 */}
            <div className="relative rounded shadow-2xl bg-transparent">
              <Image
                src={imageUrl}
                alt="预览图片"
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain"
                style={{ 
                  height: 'auto', 
                  display: 'block'
                }}
              />
              
              {/* 左上角计数器（图片内，统一边距） */}
              {typeof currentIndex === "number" &&
                typeof total === "number" && (
                  <div className="absolute top-4 left-4 text-white text-sm bg-black/70 px-3 py-1.5 rounded backdrop-blur-sm z-10 font-medium">
                    {currentIndex + 1} / {total}
                  </div>
                )}
              
              {/* 关闭按钮（图片内右上角，统一边距） */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-all duration-200 z-10 p-2.5 bg-black/70 rounded-full hover:bg-black/80 hover:scale-110 backdrop-blur-sm"
                title="关闭预览"
              >
                <X size={20} />
              </motion.button>
              
              {/* 左切换按钮（统一边距和尺寸） */}
              {hasPrev && (
                <motion.button
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/80 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                  title="上一张"
                >
                  <ChevronLeft size={20} />
                </motion.button>
              )}
              
              {/* 右切换按钮（统一边距和尺寸） */}
              {hasNext && (
                <motion.button
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/80 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                  title="下一张"
                >
                  <ChevronRight size={20} />
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
