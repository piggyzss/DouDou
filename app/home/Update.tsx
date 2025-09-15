'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarRange } from 'lucide-react'

interface Contribution {
  date: string
  count: number
}

export default function Update() {
  const [selectedYear, setSelectedYear] = useState(2025)
  const [showYearPanel, setShowYearPanel] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 生成贡献数据
  const generateContributions = (year: number): Contribution[] => {
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
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      
      // 使用更稳定的种子算法
      const seed = (date.getDate() + date.getMonth() * 31 + date.getFullYear() * 365) % 100 / 100
      
      let count = 0
      if (seed < 0.1) count = 0
      else if (seed < 0.2) count = 1
      else if (seed < 0.3) count = 2
      else if (seed < 0.4) count = 3
      else if (seed < 0.5) count = 4
      else if (seed < 0.6) count = 5
      else if (seed < 0.7) count = 6
      else if (seed < 0.8) count = 8
      else if (seed < 0.9) count = 10
      else count = 12
      
      contributions.push({ date: dateStr, count })
    }
    
    return contributions
  }

  const contributions = generateContributions(selectedYear)
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
              Update
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:shadow-lg transition-all duration-300 p-6 group"
        >
          {/* 标题和设置 */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-text-secondary ml-2 group-hover:text-text-primary transition-colors duration-300">
              {isMounted ? totalContributions : 0} contributions in {selectedYear}
            </span>
            <div className="relative group">
              <div
                onMouseEnter={() => setShowYearPanel(true)}
                onMouseLeave={() => setShowYearPanel(false)}
                className="inline-block p-2 -m-2 flex items-center"
              >
                <CalendarRange 
                  className="w-5 h-5 text-text-secondary cursor-pointer hover:text-primary transition-colors mr-4" 
                  strokeWidth={1.5}
                />
                
                {/* 年份选择面板 */}
                {showYearPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:shadow-lg transition-all duration-300 p-2 z-10"
                    onMouseEnter={() => setShowYearPanel(true)}
                    onMouseLeave={() => setShowYearPanel(false)}
                  >
                    <div className="flex flex-col gap-1">
                      {[2023, 2024, 2025, 2026].map(year => (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYear(year)
                            setShowYearPanel(false)
                          }}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            selectedYear === year ? 'text-primary bg-primary/10' : 'text-text-secondary'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* 贡献图 */}
          <div className="w-full">
            <div className="flex justify-center">
              <div className="inline-block">
                {/* 月份标签 */}
                <div className="flex mb-2 group-hover:scale-[1.01] transition-transform duration-300" style={{ paddingLeft: "24px" }}>
                  {displayMonths.map((month, index) => {
                    // 计算该月份在贡献方块网格中的实际列位置
                    const monthStartDate = new Date(`${selectedYear}-${String(index + 1).padStart(2, "0")}-01`)
                    
                    // 找到该月份第一天在contributions数组中的位置
                    const monthStartIndex = contributions.findIndex(c => c.date === monthStartDate.toISOString().split("T")[0])
                    
                    // 计算该月份在网格中的起始列位置（基于7列布局）
                    const startColumn = monthStartIndex >= 0 ? Math.floor(monthStartIndex / 7) : 0
                    
                    // 计算下个月的起始列位置
                    let nextMonthStartColumn = startColumn + 4 // 默认4周
                    if (index < 11) {
                      const nextMonthDate = new Date(`${selectedYear}-${String(index + 2).padStart(2, "0")}-01`)
                      const nextMonthIndex = contributions.findIndex(c => c.date === nextMonthDate.toISOString().split("T")[0])
                      if (nextMonthIndex >= 0) {
                        nextMonthStartColumn = Math.floor(nextMonthIndex / 7)
                      }
                    } else {
                      // 12月特殊处理，计算到年底
                      nextMonthStartColumn = Math.floor(contributions.length / 7)
                    }
                    
                    // 计算该月份跨越的列数
                    const monthColumns = Math.max(nextMonthStartColumn - startColumn, 4)
                    const finalWidth = monthColumns * 13
                    
                    
                    return (
                      <div
                        key={month}
                        className="text-xs text-text-muted flex-shrink-0"
                        style={{ 
                          width: `${finalWidth}px`,
                          marginRight: index < displayMonths.length - 1 ? "2px" : "0",
                          textAlign: "left"
                        }}
                      >
                        {month}
                      </div>
                    )
                  })}
                </div>

                {/* 星期标签和贡献方块 */}
                <div className="flex group-hover:scale-[1.01] transition-transform duration-300">
                  {/* 星期标签 */}
                  <div className="flex flex-col justify-between mr-2 group-hover:scale-105 transition-transform duration-300" style={{ height: '112px' }}>
                    <span className="text-xs text-text-muted">Sun</span>
                    <span className="text-xs text-text-muted">Tue</span>
                    <span className="text-xs text-text-muted">Thu</span>
                    <span className="text-xs text-text-muted">Sat</span>
                  </div>

                  {/* 贡献方块网格 */}
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

          {/* 图例 */}
          <div className="flex items-center justify-end mt-4 mr-4 group-hover:scale-105 transition-transform duration-300">
            <span className="text-xs text-text-muted mr-2">Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => {
                // 为图例创建固定的颜色级别，从最浅到最深
                const getLegendColor = (level: number) => {
                  if (level === 0) return '#ebedf0' // 最浅
                  const intensity = level / 4 // 0.25, 0.5, 0.75, 1
                  const alpha = 0.15 + (intensity * 0.85)
                  return `rgba(103, 71, 206, ${alpha})`
                }
                
                return (
                  <div
                    key={level}
                    style={{
                      borderRadius: '0.1rem',
                      width: '10px',
                      height: '10px',
                      backgroundColor: getLegendColor(level),
                      border: 'none'
                    }}
                  />
                )
              })}
            </div>
            <span className="text-xs text-text-muted ml-2">More</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}