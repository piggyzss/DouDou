'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTheme } from '../providers'

export default function Skills() {
  const { theme } = useTheme()
  
  return (
    <section className="pt-12 pb-20">
      <div className="max-w-7xl mx-auto">

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

            {/* 标题 */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: false }}
              className="text-2xl font-medium text-text-primary font-english mx-6 px-4 py-2"
            >
              Skill
            </motion.h2>

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

        {/* 技能图片展示 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false }}
          className="flex justify-center items-center"
        >
          <div className="relative w-full max-w-4xl">
            <Image
              src={theme === 'dark' ? '/assets/images/skill_dark.svg' : '/assets/images/skill.svg'}
              alt="技能展示"
              width={800}
              height={400}
              className="w-full h-auto"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}