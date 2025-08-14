'use client'

import { motion } from 'framer-motion'
import { User, Award, Heart } from 'lucide-react'

export default function About() {
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
          <h2 className="text-xl sm:text-2xl text-text-primary mb-3">关于我</h2>
          <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto">
            热爱技术，追求创新，致力于用代码改变世界
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg text-text-primary mb-3">前端开发者</h3>
            <p className="text-text-secondary text-base leading-relaxed">
              专注于现代Web开发，熟练使用React、Vue、TypeScript等技术栈
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-lg text-text-primary mb-3">AI爱好者</h3>
            <p className="text-text-secondary text-base leading-relaxed">
              积极探索AI技术，将人工智能融入创意设计和产品开发
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg text-text-primary mb-3">创意工作者</h3>
            <p className="text-text-secondary text-base leading-relaxed">
              追求美学与功能的完美平衡，创造有温度的数字体验
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}