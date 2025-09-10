'use client'

import { motion } from 'framer-motion'

const skills = [
  { name: 'React', level: 90, color: '#6747ce' },
  { name: 'TypeScript', level: 85, color: '#fdded9' },
  { name: 'Next.js', level: 80, color: '#84a5f4' },
  { name: 'Vue.js', level: 75, color: '#fed336' },
  { name: 'Node.js', level: 70, color: '#8ccc79' },
  { name: 'Python', level: 65, color: '#53b88f' },
  { name: 'AI/ML', level: 60, color: '#6747ce' },
  { name: 'UI/UX', level: 75, color: '#fdded9' },
]

export default function Skills() {
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
            
            {/* 中间的skill文案 */}
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
              Skill
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {skills.slice(0, 4).map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: false }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-primary font-normal text-base">{skill.name}</span>
                  <span className="text-text-secondary text-sm font-light">{skill.level}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: skill.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    viewport={{ once: false }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            {skills.slice(4).map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: false }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-primary font-normal text-base">{skill.name}</span>
                  <span className="text-text-secondary text-sm font-light">{skill.level}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: skill.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    viewport={{ once: false }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}