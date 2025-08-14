'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Code, Palette } from 'lucide-react'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* 左侧内容 */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <motion.h1
              className="text-2xl sm:text-3xl lg:text-4xl text-text-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Hello, I'm{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                shanshan
              </span>
            </motion.h1>
            
            <motion.p
              className="text-lg sm:text-xl text-text-secondary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              前端开发者、AI爱好者、创意工作者
            </motion.p>
            
            <motion.p
              className="text-base sm:text-lg text-text-muted leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              用代码创造美好，用AI探索未来，让创意与技术完美融合
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Link href="/projects">
              <motion.button
                className="flex items-center space-x-2 bg-secondary text-white px-6 py-3 rounded-2xl hover:bg-secondary/90 transition-all duration-300 text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>查看作品</span>
                <ArrowRight size={18} />
              </motion.button>
            </Link>
            
            <Link href="/blog">
              <motion.button
                className="flex items-center space-x-2 border-2 border-secondary text-secondary px-6 py-3 rounded-2xl hover:bg-secondary hover:text-white transition-all duration-300 text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>阅读博客</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* 右侧卡片 */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-accent/20 dark:bg-accent/30 rounded-full flex items-center justify-center">
                <Code className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg text-text-primary">开发作品</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              探索我的前端项目，从简单的组件到复杂的应用
            </p>
            <Link href="/projects" className="text-primary text-sm hover:underline mt-3 inline-block">
              查看项目 →
            </Link>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-accent/20 dark:bg-accent/30 rounded-full flex items-center justify-center">
                <Palette className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg text-text-primary">AIGC作品</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              欣赏AI生成的创意作品，体验科技与艺术的碰撞
            </p>
            <Link href="/aigc" className="text-primary text-sm hover:underline mt-3 inline-block">
              浏览作品 →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}