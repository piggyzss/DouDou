'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { SquareCode } from 'lucide-react'
import AppCard from './components/AppCard'
import FilterBar from './components/FilterBar'
import CreateAppModal from './components/CreateAppModal'

// Demo数据
const demoApps = [
  {
    id: 1,
    name: 'AI聊天助手',
    description: '基于OpenAI API的智能聊天应用，支持多轮对话、语音输入和图片识别功能，让AI成为你的智能助手。',
    type: 'app' as const,
    platform: 'web' as const,
    status: 'online' as const,
    videoUrl: '/videos/ai-chat-demo.mp4',
    thumbnailUrl: '/images/ai-chat-thumb.jpg',
    dau: 1234,
    downloads: 5678,
    likes: 128,
    trend: '+12%',
    experienceUrl: 'https://ai-chat-demo.com',
    downloadUrl: 'https://apps.apple.com/ai-chat',
    updatedAt: '2024-01-15',
    dauTrend: [1200, 1250, 1180, 1300, 1280, 1240, 1234],
    qrCodeUrl: '/images/qr-ai-chat.png'
  },
  {
    id: 2,
    name: '智能记账本',
    description: '简洁易用的记账应用，支持多账户管理、分类统计、预算提醒，让理财变得简单高效。',
    type: 'app' as const,
    platform: 'mobile' as const,
    status: 'online' as const,
    videoUrl: '/videos/expense-tracker-demo.mp4',
    thumbnailUrl: '/images/expense-tracker-thumb.jpg',
    dau: 856,
    downloads: 2345,
    likes: 89,
    trend: '+8%',
    experienceUrl: 'https://expense-tracker-demo.com',
    downloadUrl: 'https://play.google.com/expense-tracker',
    updatedAt: '2024-01-12',
    dauTrend: [800, 820, 850, 880, 870, 860, 856],
    qrCodeUrl: '/images/qr-expense-tracker.png'
  },
  {
    id: 3,
    name: '像素冒险',
    description: '复古风格的像素冒险游戏，探索神秘世界，收集道具，挑战各种关卡，体验经典游戏乐趣。',
    type: 'game' as const,
    platform: 'web' as const,
    status: 'online' as const,
    videoUrl: '/videos/pixel-adventure-demo.mp4',
    thumbnailUrl: '/images/pixel-adventure-thumb.jpg',
    dau: 2341,
    downloads: 8901,
    likes: 256,
    trend: '+15%',
    experienceUrl: 'https://pixel-adventure-demo.com',
    downloadUrl: null,
    updatedAt: '2024-01-10',
    dauTrend: [2200, 2250, 2300, 2400, 2350, 2320, 2341],
    qrCodeUrl: '/images/qr-pixel-adventure.png'
  },
  {
    id: 4,
    name: '健康打卡',
    description: '微信小程序，帮助用户养成健康生活习惯，支持运动记录、饮食管理、睡眠监测等功能。',
    type: 'miniprogram' as const,
    platform: 'wechat' as const,
    status: 'online' as const,
    videoUrl: '/videos/health-checkin-demo.mp4',
    thumbnailUrl: '/images/health-checkin-thumb.jpg',
    dau: 3456,
    downloads: 12345,
    likes: 445,
    trend: '+22%',
    experienceUrl: 'https://health-checkin-miniprogram.com',
    downloadUrl: null,
    updatedAt: '2024-01-08',
    dauTrend: [3200, 3300, 3400, 3500, 3480, 3460, 3456],
    qrCodeUrl: '/images/qr-health-checkin.png'
  },
  {
    id: 5,
    name: '代码编辑器',
    description: '在线代码编辑器，支持多种编程语言，实时预览，协作编辑，让编程变得更加高效便捷。',
    type: 'app' as const,
    platform: 'web' as const,
    status: 'beta' as const,
    videoUrl: '/videos/code-editor-demo.mp4',
    thumbnailUrl: '/images/code-editor-thumb.jpg',
    dau: 567,
    downloads: 1234,
    likes: 67,
    trend: '+5%',
    experienceUrl: 'https://code-editor-beta.com',
    downloadUrl: null,
    updatedAt: '2024-01-05',
    dauTrend: [550, 560, 570, 580, 575, 570, 567],
    qrCodeUrl: '/images/qr-code-editor.png'
  },
  {
    id: 6,
    name: '音乐播放器',
    description: '简洁美观的音乐播放器，支持本地音乐播放、在线搜索、播放列表管理，享受纯净的音乐体验。',
    type: 'app' as const,
    platform: 'mobile' as const,
    status: 'online' as const,
    videoUrl: '/videos/music-player-demo.mp4',
    thumbnailUrl: '/images/music-player-thumb.jpg',
    dau: 1890,
    downloads: 4567,
    likes: 234,
    trend: '+18%',
    experienceUrl: 'https://music-player-demo.com',
    downloadUrl: 'https://apps.apple.com/music-player',
    updatedAt: '2024-01-03',
    dauTrend: [1800, 1820, 1850, 1900, 1880, 1895, 1890],
    qrCodeUrl: '/images/qr-music-player.png'
  }
]

export default function AppsPage() {
  const [filteredApps, setFilteredApps] = useState(demoApps)
  const [selectedType, setSelectedType] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const isDev = process.env.NODE_ENV === 'development'

  const handleFilter = (type: string) => {
    setSelectedType(type)
    filterApps(type)
  }

  const filterApps = (type: string) => {
    let filtered = demoApps

    // 类型过滤
    if (type !== 'all') {
      filtered = filtered.filter(app => app.type === type)
    }

    setFilteredApps(filtered)
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto py-12">
        {/* 页面标题 - 类似博客页面样式 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-heading">App开发</h1>
          <p className="text-text-secondary mt-1 font-blog">做点有意思的</p>
        </div>

        {/* 新建App按钮 - 仅在开发模式下显示 */}
        {isDev && (
          <div className="mb-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
            >
              <SquareCode size={16} className="mr-2" />
              新建App
            </button>
          </div>
        )}

        {/* 筛选栏 */}
        <div className="mb-8">
          <FilterBar 
            onFilter={handleFilter}
            selectedType={selectedType}
          />
        </div>

        {/* 作品展示区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          {filteredApps.map((app, index) => (
            <motion.article
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <AppCard app={app} />
            </motion.article>
          ))}
        </motion.div>

        {/* 空状态 */}
        {filteredApps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-text-muted text-lg">没有找到匹配的作品</p>
            <p className="text-text-muted text-sm mt-2">请尝试调整筛选条件</p>
          </motion.div>
        )}

        {/* 新建App弹窗 */}
        {isCreateModalOpen && (
          <CreateAppModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={(appData: any) => {
              console.log('新建App数据:', appData)
              // TODO: 处理新建App逻辑
              setIsCreateModalOpen(false)
            }}
          />
        )}
      </div>
    </div>
  )
}
