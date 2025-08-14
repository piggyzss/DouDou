'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export default function LatestContent() {
  return (
    <section className="py-16 bg-bg-secondary dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-normal text-text-primary mb-3">最新内容</h2>
          <p className="text-lg sm:text-xl text-text-secondary font-light">
            分享最新的技术文章和创意作品
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 最新博客 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-normal text-text-primary mb-4">最新博客</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-text-muted font-light">
                  <Calendar size={16} />
                  <span>2024-01-15</span>
                </div>
                <h4 className="font-normal text-text-primary text-base">Next.js 14 新特性解析</h4>
                <p className="text-text-secondary text-sm font-light leading-relaxed">
                  深入探讨Next.js 14带来的新功能和性能优化...
                </p>
                <Link href="/blog" className="text-primary text-sm font-normal hover:underline inline-flex items-center">
                  阅读更多 <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* 最新项目 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-normal text-text-primary mb-4">最新项目</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-text-muted font-light">
                  <Clock size={16} />
                  <span>2024-01-10</span>
                </div>
                <h4 className="font-normal text-text-primary text-base">AI聊天助手</h4>
                <p className="text-text-secondary text-sm font-light leading-relaxed">
                  基于OpenAI API的智能聊天应用，支持多轮对话...
                </p>
                <Link href="/projects" className="text-primary text-sm font-normal hover:underline inline-flex items-center">
                  查看项目 <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* 最新AIGC作品 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-normal text-text-primary mb-4">最新AIGC作品</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-text-muted font-light">
                  <Calendar size={16} />
                  <span>2024-01-08</span>
                </div>
                <h4 className="font-normal text-text-primary text-base">未来城市概念图</h4>
                <p className="text-text-secondary text-sm font-light leading-relaxed">
                  使用Midjourney生成的未来城市概念设计...
                </p>
                <Link href="/aigc" className="text-primary text-sm font-normal hover:underline inline-flex items-center">
                  浏览作品 <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}