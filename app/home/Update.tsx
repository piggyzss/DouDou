'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Contribution {
  date: string
  count: number
}

export default function Update() {
  const [selectedYear, setSelectedYear] = useState(2025)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 生成贡献数据（更随机的模拟：考虑月份活跃度、工作日权重与短期爆发）
  const generateContributions = (year: number): Contribution[] => {
    // 简单的可复现伪随机数（Mulberry32）
    const mulberry32 = (a: number) => {
      return () => {
        let t = (a += 0x6D2B79F5)
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }

    const rng = mulberry32(year * 1013904223)
    const contributions: Contribution[] = []
    const startDate = new Date(`${year}-01-01`)
    const endDate = new Date(`${year}-12-31`)
    
    // 找到该年第一天是星期几 (0=Sunday, 1=Monday, ..., 6=Saturday)
    const firstDayOfYear = startDate.getDay()
    
    // 从该年第一天开始，但需要补齐前面的空白格子
    // 如果第一天不是星期天，需要添加空白格子
    for (let i = 0; i < firstDayOfYear; i++) {
      contributions.push({ date: '', count: -1 }) // -1 表示空白格子
    }
    
    // 添加该年的所有日期
    let streakDays = 0
    let streakLevel = 0
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      const month = date.getMonth() // 0..11
      const weekday = date.getDay() // 0..6

      // 月份活跃度（如年初与年末低，中间略高）
      const monthCurve = [0.7, 0.75, 0.85, 0.95, 1.0, 1.05, 1.05, 1.0, 0.95, 0.9, 0.8, 0.75][month]
      // 工作日更活跃，周末略低
      const weekdayWeight = ([0.8, 0.95, 1.05, 1.1, 1.1, 1.0, 0.85] as number[])[weekday]
      // 基础随机项
      const base = rng()

      // 触发短期爆发（2-4 天）
      if (streakDays === 0 && base > 0.92) {
        streakDays = 2 + Math.floor(rng() * 3) // 2~4 天
        streakLevel = 2 + Math.floor(rng() * 3) // 2~4 级强度
      }

      const activity = base * monthCurve * weekdayWeight + (streakDays > 0 ? 0.2 * streakLevel : 0)

      // 将 activity 映射到离散计数，更随机更离散
      let count = 0
      if (activity < 0.15) count = 0
      else if (activity < 0.3) count = 1
      else if (activity < 0.45) count = 2
      else if (activity < 0.55) count = 3
      else if (activity < 0.65) count = 4
      else if (activity < 0.72) count = 5
      else if (activity < 0.8) count = 6
      else if (activity < 0.86) count = 7
      else if (activity < 0.9) count = 8
      else if (activity < 0.94) count = 9
      else if (activity < 0.97) count = 10
      else count = 12

      contributions.push({ date: dateStr, count })

      if (streakDays > 0) streakDays -= 1
    }
    
    return contributions
  }

  const contributions = generateContributions(selectedYear)
  // 保留计算以便后续可能拓展使用（当前不展示）
  const totalContributions = contributions.reduce((sum, c) => sum + (c.count === -1 ? 0 : c.count), 0)

  // 获取贡献颜色
  const getContributionColorCustom = (count: number, date: string) => {
    if (count === 0) {
      const contributionDate = new Date(date)
      const today = new Date()
      return contributionDate > today ? '#ffffff' : '#ebedf0'
    }
    
    const intensity = Math.min(count / 12, 1)
    const alpha = 0.15 + (intensity * 0.85)
    return `rgba(103, 71, 206, ${alpha})`
  }

  // 按月份分组数据 - 从1月到12月
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const displayMonths = months

  return (
    <section className="pt-12 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* 作为背景展示：移除标题与装饰 */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="transition-all duration-300 group"
        >
          {/* 去除顶部标题/设置 */}

          {/* 贡献图 */}
          <div className="w-full">
            <div className="flex justify-center">
              <div className="inline-block">
                {/* 移除月份标签行 */}

                {/* 星期标签和贡献方块 */}
                <div className="flex group-hover:scale-[1.01] transition-transform duration-300">
                  {/* 贡献方块网格（移除左侧星期标签） */}
                  <div className="flex flex-col">
                    {[0, 1, 2, 3, 4, 5, 6].map(weekDay => {
                      const weekContributions = contributions.filter((_, index) => index % 7 === weekDay)
                      const decemberInWeek = weekContributions.filter(c => {
                        const date = new Date(c.date)
                        return date.getMonth() === 11
                      })
                      
                      
                      return (
                      <div key={weekDay} className="flex mb-1">
                        {weekContributions.map((contribution, dayIndex) => {
                          // 如果是空白格子，显示占位但不绘制色块
                          if (contribution.count === -1) {
                            return (
                              <div
                                key={`${weekDay}-${dayIndex}`}
                                style={{
                                  width: '11px',
                                  height: '11px',
                                  marginRight: '2px',
                                  marginBottom: '2px'
                                }}
                              />
                            )
                          }
                          
                          const contributionDate = new Date(contribution.date)
                          const contributionYear = contributionDate.getFullYear()
                          
                          // 只显示当前选中年份的日期
                          if (contributionYear !== selectedYear) {
                            return (
                              <div
                                key={`${weekDay}-${dayIndex}`}
                                style={{
                                  width: '11px',
                                  height: '11px',
                                  marginRight: '2px',
                                  marginBottom: '2px'
                                }}
                              />
                            )
                          }
                          
                          const isDecember = contributionDate.getMonth() === 11
                          const color = getContributionColorCustom(contribution.count, contribution.date)
                          
                          
                          return (
                            <motion.div
                              key={`${weekDay}-${dayIndex}`}
                              className="relative cursor-pointer hover:scale-110 transition-transform duration-200 group/date"
                              style={{
                                borderRadius: '0.1rem',
                                width: '11px',
                                height: '11px',
                                backgroundColor: color,
                                border: contribution.count === 0 && new Date(contribution.date) > new Date() ? '1px solid #e5e7eb' : 'none',
                                marginRight: '2px',
                                marginBottom: '2px'
                              }}
                              whileHover={{ 
                                scale: 1.3,
                                zIndex: 10
                              }}
                              transition={{ 
                                duration: 0.15,
                                ease: "easeOut"
                              }}
                            >
                              {/* 自定义Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded shadow-lg opacity-0 group-hover/date:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                <div className="font-medium">
                                  {contribution.count} {contribution.count === 1 ? 'contribution' : 'contributions'}
                                </div>
                                <div className="text-gray-300">
                                  {new Date(contribution.date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                {/* 小三角箭头 */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 移除右下角图例 */}
        </motion.div>
      </div>
    </section>
  )
}