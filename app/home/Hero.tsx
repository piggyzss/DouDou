'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 relative overflow-hidden">
      {/* 背景图片 */}
      <div className="absolute inset-0 flex justify-end items-center pointer-events-none">
        <div className="relative w-96 h-96" style={{ opacity: 0.18 }}>
          <Image
            src="/app/assets/images/avatar.png?v=20240821"
            alt="shanshan头像背景"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* 居中内容 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl text-text-primary font-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="font-english">Hello, I'm</span>{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-english">
                shanshan
              </span>
            </motion.h1>
            
            <motion.p
              className="text-lg sm:text-xl text-text-secondary font-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              前端开发者、AI爱好者、创意工作者
            </motion.p>
            
            <motion.p
              className="text-base sm:text-lg text-text-primary leading-8 font-blog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              用代码创造美好，用AI探索未来，让创意与技术完美融合
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}