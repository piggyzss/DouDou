'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export default function LatestContent() {
  return (
    <section className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
              style={{ transformOrigin: 'right' }}
            />
            
            {/* 中间的project文案 */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 10
              }}
              viewport={{ once: false }}
              className="mx-6 px-4 py-2 text-text-primary text-2xl font-medium font-english"
            >
              Project
            </motion.div>
            
            {/* 右侧横线 */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: false }}
              className="h-0.5 bg-text-primary flex-1 max-w-32"
              style={{ transformOrigin: 'left' }}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 最新博客 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false }}
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
            viewport={{ once: false }}
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
            viewport={{ once: false }}
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