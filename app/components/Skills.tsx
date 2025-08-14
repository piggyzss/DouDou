'use client'

import { motion } from 'framer-motion'

const skills = [
  { name: 'React', level: 90, color: '#61DAFB' },
  { name: 'TypeScript', level: 85, color: '#3178C6' },
  { name: 'Next.js', level: 80, color: '#000000' },
  { name: 'Vue.js', level: 75, color: '#4FC08D' },
  { name: 'Node.js', level: 70, color: '#339933' },
  { name: 'Python', level: 65, color: '#3776AB' },
  { name: 'AI/ML', level: 60, color: '#FF6B6B' },
  { name: 'UI/UX', level: 75, color: '#FFD93D' },
]

export default function Skills() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-xl sm:text-2xl text-text-primary mb-3">技能专长</h2>
          <p className="text-lg sm:text-xl text-text-secondary font-light">
            持续学习，不断提升技术能力
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {skills.slice(0, 4).map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
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
                    viewport={{ once: true }}
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
                viewport={{ once: true }}
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
                    viewport={{ once: true }}
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