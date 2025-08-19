'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState } from 'react'
import { User, Award, Heart, Github, Linkedin, Twitter, Mail, MapPin, Calendar, Briefcase } from 'lucide-react'

interface ExperienceCard {
  id: number
  title: string
  company: string
  period: string
  description: string
  color: string
  x: number
  y: number
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
      x: 0,
      y: 0
    },
    {
      id: 2,
      title: "UI/UX设计师",
      company: "设计工作室",
      period: "2020 - 2022",
      description: "专注于用户体验设计，创造直观易用的数字产品界面",
      color: "#d26c9e",
      x: 50,
      y: 30
    },
    {
      id: 3,
      title: "全栈开发者",
      company: "创业公司",
      period: "2018 - 2020",
      description: "从零开始构建产品，涵盖前端、后端、数据库等全栈技术",
      color: "#5d8eff",
      x: 20,
      y: 80
    },
    {
      id: 4,
      title: "技术顾问",
      company: "咨询公司",
      period: "2016 - 2018",
      description: "为客户提供技术解决方案，优化业务流程和系统架构",
      color: "#59d3a6",
      x: 80,
      y: 10
    },
    {
      id: 5,
      title: "产品经理",
      company: "互联网公司",
      period: "2014 - 2016",
      description: "负责产品规划和管理，协调开发团队实现产品目标",
      color: "#59bcff",
      x: 10,
      y: 60
    },
    {
      id: 6,
      title: "软件工程师",
      company: "传统企业",
      period: "2012 - 2014",
      description: "参与企业级软件开发，积累丰富的项目经验",
      color: "#ff7a7a",
      x: 60,
      y: 50
    }
  ])

  const handleDragEnd = (cardId: number, info: any) => {
    const container = document.querySelector('.drag-container')
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = ((info.point.x - rect.left) / rect.width) * 100
    const y = ((info.point.y - rect.top) / rect.height) * 100

    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) }
        : card
    ))
  }

  return (
    <section className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 动画标题区域 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: false }}
              className="h-0.5 bg-primary flex-1 max-w-32"
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
              className="mx-6 px-4 py-2 text-primary text-2xl font-medium"
            >
              About
            </motion.div>
            
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: false }}
              className="h-0.5 bg-primary flex-1 max-w-32"
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
              <h3 className="text-xl font-bold text-text-primary mb-4">Links</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Vue.js', 'Node.js', 'UI/UX Design', 'AI/ML', 'Figma', 'Next.js'].map((skill, index) => (
                  <span 
                    key={skill}
                    className="px-3 py-1 border-2 border-gray-300 rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Experience</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Briefcase className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-text-primary">前端开发工程师</h4>
                    <p className="text-sm text-text-secondary">某科技公司 • 2022 - 至今</p>
                    <p className="text-sm text-text-muted mt-1">负责公司核心产品的前端开发，使用React、TypeScript等技术栈</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Briefcase className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-text-primary">UI/UX设计师</h4>
                    <p className="text-sm text-text-secondary">设计工作室 • 2020 - 2022</p>
                    <p className="text-sm text-text-muted mt-1">专注于用户体验设计，创造直观易用的数字产品界面</p>
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
            className="relative"
          >
            {/* 头像区域 */}
            <div className="text-center mb-8">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-200">
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Yours Truly</h2>
              <p className="text-text-secondary">前端开发者 & 创意工作者</p>
            </div>

            {/* 可拖拽卡片区域 */}
            <div className="drag-container relative w-full h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 * card.id }}
                  viewport={{ once: true }}
                  className="absolute cursor-move"
                  style={{
                    left: `${card.x}%`,
                    top: `${card.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  drag
                  dragMomentum={false}
                  onDragEnd={(event, info) => handleDragEnd(card.id, info)}
                >
                  <div 
                    className="w-48 p-4 rounded-lg shadow-lg text-white"
                    style={{ backgroundColor: card.color }}
                  >
                    <h4 className="font-semibold text-sm mb-1">{card.title}</h4>
                    <p className="text-xs opacity-90 mb-2">{card.company}</p>
                    <p className="text-xs opacity-75 mb-2">{card.period}</p>
                    <p className="text-xs opacity-80 leading-relaxed">{card.description}</p>
                  </div>
                </motion.div>
              ))}
              
              {/* 拖拽提示 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-sm">拖拽卡片到任意位置</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}