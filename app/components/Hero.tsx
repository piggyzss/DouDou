'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* 居中内容 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <motion.h1
              className="text-2xl sm:text-3xl lg:text-4xl text-text-primary font-heading"
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
              className="text-lg sm:text-xl text-text-secondary font-body"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              前端开发者、AI爱好者、创意工作者
            </motion.p>
            
            <motion.p
              className="text-sm sm:text-base text-text-muted leading-relaxed font-body"
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