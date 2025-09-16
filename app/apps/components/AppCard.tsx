'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { Play, Download, ExternalLink, Heart, Users, TrendingUp, MessageCircle, Calendar, QrCode } from 'lucide-react'
import VideoModal from './VideoModal'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'

interface App {
  id: number
  name: string
  description: string
  type: 'app' | 'miniprogram' | 'game'
  platform: 'web' | 'mobile' | 'wechat'
  status: 'online' | 'beta' | 'development'
  videoUrl: string
  thumbnailUrl: string
  dau: number
  downloads: number
  likes: number
  trend: string
  experienceUrl: string
  downloadUrl: string | null
  updatedAt: string
  dauTrend: number[] // 最近7天的DAU数据
  qrCodeUrl: string // 二维码图片URL
}

interface AppCardProps {
  app: App
}

// 日期格式化函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function AppCard({ app }: AppCardProps) {
  const [showVideoModal, setShowVideoModal] = useState(false)

  // DAU趋势图表配置
  const getDauChartOptions = () => {
    const dates: string[] = []
    const fullDates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }))
      fullDates.push(date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit'
      }).replace(/\//g, '/'))
    }

    // 计算Y轴范围
    const minValue = Math.min(...app.dauTrend)
    const maxValue = Math.max(...app.dauTrend)
    const range = maxValue - minValue
    const padding = range * 0.1 // 10% padding
    
    // 智能计算合适的刻度单位
    const rawRange = maxValue - minValue + padding * 2
    const idealTickCount = 5 // 理想的刻度数量
    const rawTickSize = rawRange / idealTickCount
    
    // 计算合适的刻度单位（1, 2, 5, 10, 20, 50, 100, 200, 500, 1000等）
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawTickSize)))
    const normalizedTickSize = rawTickSize / magnitude
    let tickSize = magnitude
    
    if (normalizedTickSize <= 1) {
      tickSize = magnitude
    } else if (normalizedTickSize <= 2) {
      tickSize = 2 * magnitude
    } else if (normalizedTickSize <= 5) {
      tickSize = 5 * magnitude
    } else {
      tickSize = 10 * magnitude
    }
    
    // 计算Y轴范围
    const yMin = Math.floor((minValue - padding) / tickSize) * tickSize
    const yMax = Math.ceil((maxValue + padding) / tickSize) * tickSize
    
    // 生成Y轴刻度
    const yAxisTicks: number[] = []
    for (let i = yMin; i <= yMax; i += tickSize) {
      yAxisTicks.push(i)
    }

    return {
      chart: {
        type: 'line',
        height: 180,
        backgroundColor: 'transparent',
        spacing: [5, 5, 5, 5],
        animation: {
          duration: 1000
        }
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: dates,
        labels: {
          style: {
            fontSize: '10px',
            color: '#6B7280'
          }
        },
        lineWidth: 0,
        tickLength: 0,
        gridLineWidth: 0
      },
      yAxis: {
        title: {
          text: ''
        },
        min: yMin,
        max: yMax,
        tickPositions: yAxisTicks,
        labels: {
          enabled: true,
          style: {
            fontSize: '10px',
            color: '#6B7280'
          }
        },
        gridLineWidth: 1,
        gridLineColor: '#F3F4F6',
        lineWidth: 0,
        tickLength: 0,
        plotBands: yAxisTicks.slice(0, -1).map((tick, index) => ({
          from: tick,
          to: yAxisTicks[index + 1],
          color: index % 2 === 0 ? '#f1f8fc' : 'transparent'
        }))
      },
      series: [{
        name: 'DAU',
        data: app.dauTrend,
        color: '#006aff',
        lineWidth: 2,
        marker: {
          radius: 3,
          fillColor: '#006aff',
          lineWidth: 0
        },
        animation: {
          duration: 1000,
          easing: 'easeOutBounce'
        }
      }],
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 8,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          offsetX: 0,
          offsetY: 2,
          opacity: 0.1,
          width: 3
        },
        style: {
          color: '#374151',
          fontSize: '12px'
        },
        formatter: function(this: any): string {
          const pointIndex = this.point.index
          const fullDate = fullDates[pointIndex]
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px; color: #111827;">${fullDate}</div>
            <div style="color: #6b7280;">DAU: <span style="color: #006aff; font-weight: 600;">${this.y.toLocaleString()}</span></div>
          </div>`
        }
      },
      plotOptions: {
        line: {
          animation: {
            duration: 1000
          }
        }
      }
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'app': return '应用'
      case 'miniprogram': return '小程序'
      case 'game': return '游戏'
      default: return '应用'
    }
  }

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'web': return 'Web'
      case 'mobile': return '移动端'
      case 'wechat': return '微信'
      default: return 'Web'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'beta': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'development': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return '已上线'
      case 'beta': return '测试版'
      case 'development': return '开发中'
      default: return '未知'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 py-4">
        <div className="flex h-72">
          {/* 左侧封面图片 - 3:4比例 */}
          <div className="w-48 h-full flex-shrink-0 rounded overflow-hidden relative group/cover">
            <img
              src={app.thumbnailUrl}
              alt={app.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
            />
            
            {/* 播放按钮覆盖层 */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center cursor-pointer hover:bg-opacity-40 transition-all duration-300 opacity-0 group-hover/cover:opacity-100"
              onClick={() => setShowVideoModal(true)}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white bg-opacity-90 rounded-full p-3"
              >
                <Play className="w-6 h-6 text-gray-800 ml-0.5" fill="currentColor" />
              </motion.div>
            </div>

            {/* 状态标签 */}
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                {getStatusLabel(app.status)}
              </span>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 pl-6 flex flex-col">
            {/* 标题和操作按钮 */}
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-text-primary font-heading group-hover:text-primary transition-colors line-clamp-2 flex-1">
                <Link href={`/apps/${app.id}`}>
                  {app.name}
                </Link>
              </h2>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog">
                #{getTypeLabel(app.type)}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog">
                #{getPlatformLabel(app.platform)}
              </span>
            </div>

            {/* 下方左右两个区域 */}
            <div className="flex gap-4 flex-grow">
              {/* 左侧区域：信息行和简介 */}
              <div className="flex-1 flex flex-col">
                {/* 信息栏：数据指标 */}
                <div className="flex items-center gap-2 text-[11px] text-text-muted h-5 mb-4">
                  <div className="flex items-center gap-1">
                    <span>{formatDate(app.updatedAt)}</span>
                  </div>
                  <span className="mx-0.5 inline-flex items-center justify-center text-[11px] leading-none text-text-muted translate-y-[2px] select-none">·</span>
                  <div className="flex items-center gap-1">
                    <span>DAU {formatNumber(app.dau)}</span>
                  </div>
                  <span className="mx-0.5 inline-flex items-center justify-center text-[11px] leading-none text-text-muted translate-y-[2px] select-none">·</span>
                  <div className="flex items-center gap-1">
                    <Download size={14} className="translate-y-[-1px]" />
                    <span>{formatNumber(app.downloads)}</span>
                  </div>
                  {/* <span className="mx-0.5 inline-flex items-center justify-center text-[11px] leading-none text-text-muted translate-y-[2px] select-none">·</span> */}
                  {/* <div className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-green-500 translate-y-[-1px]" />
                    <span className="text-green-600 dark:text-green-400">{app.trend}</span>
                  </div> */}
                </div>

                {/* 应用描述 */}
                <div className="text-text-secondary text-sm font-blog line-clamp-3 flex-grow">
                  {app.description}
                </div>

                {/* 体验入口 */}
                <div className="mt-3">
                  <div className="relative inline-block group/qr">
                    <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-all duration-300 font-blog bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 px-3 py-2 rounded-md hover:scale-105">
                      <QrCode size={14} />
                      <span>体验一下</span>
                    </button>
                    
                    {/* 二维码悬浮显示 */}
                    <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover/qr:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                        <img
                          src={app.qrCodeUrl}
                          alt={`${app.name} 二维码`}
                          className="w-32 h-32"
                        />
                        <div className="text-xs text-text-muted mt-2 text-center">扫码体验</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧区域：DAU趋势图表 */}
              <div className="w-64 flex flex-col">
                <div className="text-xs text-text-muted mb-4 font-blog">最近7天DAU趋势</div>
                <div className="flex-grow">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={getDauChartOptions()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 卡片分隔线 */}
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700"></div>

      {/* 视频播放模态框 */}
      {showVideoModal && (
        <VideoModal
          videoUrl={app.videoUrl}
          title={app.name}
          onClose={() => setShowVideoModal(false)}
        />
      )}
    </>
  )
}
