'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState } from 'react'
import { User, Award, Heart, Github, Linkedin, Twitter, Mail, MapPin, Calendar, PawPrint } from 'lucide-react'
import Image from 'next/image'

interface ExperienceCard {
  id: number
  title: string
  company: string
  period: string
  description: string
  color: string
  x: number
  y: number
  rotation: number
}

export default function About() {
  const [cards, setCards] = useState<ExperienceCard[]>([
    {
      id: 1,
      title: "前端开发工程师",
      company: "某科技公司",
      period: "2022 - 至今",
      description: "负责公司核心产品的前端开发，使用React、TypeScript等技术栈",
      color: "#6747ce",
      x: 35,
      y: -15,
      rotation: -8
    },
    {
      id: 2,
      title: "UI/UX设计师",
      company: "设计工作室",
      period: "2020 - 2022",
      description: "专注于用户体验设计，创造直观易用的数字产品界面",
      color: "#fdded9",
      x: 72,
      y: 10,
      rotation: 12
    },
    {
      id: 3,
      title: "全栈开发者",
      company: "创业公司",
      period: "2018 - 2020",
      description: "从零开始构建产品，涵盖前端、后端、数据库等全栈技术",
      color: "#84a5f4",
      x: 5,
      y: 15,
      rotation: -5
    },
    {
      id: 4,
      title: "技术顾问",
      company: "咨询公司",
      period: "2016 - 2018",
      description: "为客户提供技术解决方案，优化业务流程和系统架构",
      color: "#fed336",
      x: 52,
      y: 32,
      rotation: 10
    },
    {
      id: 5,
      title: "产品经理",
      company: "互联网公司",
      period: "2014 - 2016",
      description: "负责产品规划和管理，协调开发团队实现产品目标",
      color: "#8ccc79",
      x: 17,
      y: 60,
      rotation: -3
    },
    {
      id: 6,
      title: "软件工程师",
      company: "传统企业",
      period: "2012 - 2014",
      description: "参与企业级软件开发，积累丰富的项目经验",
      color: "#53b88f",
      x: 46,
      y: 75,
      rotation: 7
    }
  ])

  const handleDragEnd = (cardId: number, info: any) => {
    const container = document.querySelector('.about-section')
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = ((info.point.x - rect.left) / rect.width) * 100
    const y = ((info.point.y - rect.top) / rect.height) * 100

    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, x: Math.max(5, Math.min(90, x)), y: Math.max(5, Math.min(90, y)) }
        : card
    ))
  }

  return (
    <section className="py-16">
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
              About
            </motion.div>
            
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

        {/* 主要内容区域 - 左右布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* 左侧：Links、Skills、Experience */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Links */}
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-4 font-english">Links</h3>
              <div className="flex space-x-4">
                <motion.a
                  href="#"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Github size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Linkedin size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Twitter size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mail size={20} />
                </motion.a>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6">
              <h3 className="text-xl font-bold text-text-primary mb-4 font-english">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Vue.js', 'Node.js', 'UI/UX Design', 'AI/ML', 'Figma', 'Next.js'].map((skill, index) => (
                  <span 
                    key={skill}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:border-primary hover:text-primary transition-colors cursor-pointer font-english"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="mt-6">
              <h3 className="text-xl font-bold text-text-primary mb-4 font-english">Experience</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <PawPrint className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-text-primary">前端开发工程师</h4>
                    <p className="text-sm blog-body-text mt-2 mb-2">某科技公司 • 2022 ～ 至今</p>
                    <p className="text-sm blog-body-text">负责公司核心产品的前端开发，使用React、TypeScript等技术栈</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <PawPrint className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-text-primary">UI/UX设计师</h4>
                    <p className="text-sm blog-body-text mt-2 mb-2">设计工作室 • 2020 ～ 2022</p>
                    <p className="text-sm blog-body-text">专注于用户体验设计，创造直观易用的数字产品界面</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 右侧：头像和可拖拽卡片 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative flex flex-col items-center justify-center"
          >
            {/* 头像区域 */}
            <div className="text-center mb-8 ml-4">
              <div className="relative w-52 h-52 mx-auto mb-6">
                {/* 装饰性背景圆圈 */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-sm"></div>
                <div className="relative w-full h-full">
                  <Image
                    src="/app/assets/images/avatar.png?v=20240821"
                    alt="shanshan的头像"
                    width={208}
                    height={208}
                    className="w-full h-full object-cover rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-4 border-white dark:border-gray-800 hover:scale-105"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* 可拖拽卡片区域 */}
            <div className="relative w-full h-72">
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 * card.id }}
                  viewport={{ once: true }}
                  className="absolute cursor-move z-10"
                  style={{
                    left: `${card.x}%`,
                    top: `${card.y}%`,
                    transform: `translate(-50%, -50%) rotate(${card.rotation}deg)`
                  }}
                  drag
                  dragMomentum={false}
                  dragElastic={0.1}
                  onDragEnd={(event, info) => handleDragEnd(card.id, info)}
                >
                  <div 
                    className="w-40 h-40 p-4 rounded-lg shadow-lg blog-body-text hover:shadow-xl transition-shadow duration-200 font-body"
                    style={{ 
                      backgroundColor: `${card.color}95`,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <h4 className="font-semibold text-sm mb-1">{card.title}</h4>
                    <p className="text-xs opacity-90 mb-2">{card.company}</p>
                    <p className="text-xs opacity-75 mb-2">{card.period}</p>
                    <p className="text-xs opacity-80 leading-relaxed">{card.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}