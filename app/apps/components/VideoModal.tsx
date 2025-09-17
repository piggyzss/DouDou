'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface VideoModalProps {
  videoUrl: string
  title: string
  onClose: () => void
}

function VideoModal({ videoUrl, title, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh]"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-text-primary font-heading">{title}</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* 视频播放器 */}
          <div className="relative bg-black">
            <video
              ref={videoRef}
              className="w-full h-auto max-h-[60vh] mx-auto"
              controls
              autoPlay
              playsInline
              preload="metadata"
            >
              <source src={videoUrl ? `/api/apps/proxy-video?url=${encodeURIComponent(videoUrl)}` : ''} type="video/mp4" />
              您的浏览器不支持视频播放。
            </video>
          </div>

          {/* 底部信息 */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-text-secondary font-body text-center">
              点击视频外部区域或按 ESC 键关闭
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VideoModal
