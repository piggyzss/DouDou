"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  isOpen: boolean
  imageUrl: string
  hasPrev: boolean
  hasNext: boolean
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  currentIndex?: number
  total?: number
}

export default function ImagePreview({ isOpen, imageUrl, hasPrev, hasNext, onClose, onPrev, onNext, currentIndex, total }: Props) {
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
            {/* 上下留白（通过父容器 max-h 以及内容 padding 控制） */}
            <div className="py-6">
              <div className="relative inline-block">
                {/* 左上角计数器（图片内） */}
                {(typeof currentIndex === 'number' && typeof total === 'number') && (
                  <div className="absolute top-2 left-2 text-white text-sm bg-black/50 px-2 py-0.5 rounded z-10">
                    {currentIndex + 1} / {total}
                  </div>
                )}
                {/* 关闭按钮（图片内右上角） */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  onClick={onClose}
                  className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors z-10 p-2 bg-black/60 rounded-full hover:bg-black/80"
                  title="关闭预览"
                >
                  <X size={22} />
                </motion.button>
                {/* 左右切换（与计数/关闭统一 8px 边距） */}
                {hasPrev && (
                  <motion.button
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                    onClick={onPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2.5 rounded-full hover:bg-black/80 transition-all hover:scale-110"
                    title="上一张"
                  >
                    <ChevronLeft size={24} />
                  </motion.button>
                )}
                {hasNext && (
                  <motion.button
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                    onClick={onNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2.5 rounded-full hover:bg-black/80 transition-all hover:scale-110"
                    title="下一张"
                  >
                    <ChevronRight size={24} />
                  </motion.button>
                )}

                <img src={imageUrl} alt="预览图片" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
