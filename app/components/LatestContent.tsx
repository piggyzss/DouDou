'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt?: string
  published_at?: string
  created_at: string
}

interface ArtworkCollection {
  id: string
  title: string
  description?: string
  created_at: string
  images: any[]
}

export default function LatestContent() {
  const [latestBlog, setLatestBlog] = useState<BlogPost | null>(null)
  const [latestArtwork, setLatestArtwork] = useState<ArtworkCollection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestContent = async () => {
      try {
        // 获取最新博客
        const blogResponse = await fetch('/api/blog?limit=1')
        if (blogResponse.ok) {
          const blogData = await blogResponse.json()
          if (blogData.data.posts.length > 0) {
            setLatestBlog(blogData.data.posts[0])
          }
        }

        // 获取最新AIGC作品
        const artworkResponse = await fetch('/api/aigc/artworks?limit=1')
        if (artworkResponse.ok) {
          const artworkData = await artworkResponse.json()
          if (artworkData.data.collections.length > 0) {
            setLatestArtwork(artworkData.data.collections[0])
          }
        }
      } catch (error) {
        console.error('获取最新内容失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestContent()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <section className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
            
            {/* 中间的project文案 */}
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
              Project
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 最新博客 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-normal text-text-primary mb-4">最新博客</h3>
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ) : latestBlog ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-text-muted font-light">
                    <Calendar size={16} />
                    <span>{formatDate(latestBlog.published_at || latestBlog.created_at)}</span>
                  </div>
                  <h4 className="font-normal text-text-primary text-base">{latestBlog.title}</h4>
                  <p className="text-text-secondary text-sm font-light leading-relaxed">
                    {latestBlog.excerpt || '暂无摘要...'}
                  </p>
                  <Link href={`/blog/${latestBlog.slug}`} className="text-primary text-sm font-normal hover:underline inline-flex items-center">
                    阅读更多 <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-text-muted font-light">
                    <Calendar size={16} />
                    <span>暂无博客</span>
                  </div>
                  <h4 className="font-normal text-text-primary text-base">暂无博客文章</h4>
                  <p className="text-text-secondary text-sm font-light leading-relaxed">
                    还没有发布任何博客文章...
                  </p>
                  <Link href="/blog" className="text-primary text-sm font-normal hover:underline inline-flex items-center">
                    查看博客 <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* 最新项目 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: false }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-normal text-text-primary mb-4">最新项目</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-text-muted font-light">
                  <Clock size={16} />
                  <span>2024-01-10</span>
                </div>
                <h4 className="font-normal text-text-primary text-base">AI聊天助手</h4>
                <p className="text-text-secondary text-sm font-light leading-relaxed">
                  基于OpenAI API的智能聊天应用，支持多轮对话...
                </p>
                <Link href="/projects" className="text-primary text-sm font-normal hover:underline inline-flex items-center">
                  查看项目 <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* 最新AIGC作品 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: false }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-normal text-text-primary mb-4">最新AIGC作品</h3>
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ) : latestArtwork ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-text-muted font-light">
                    <Calendar size={16} />
                    <span>{formatDate(latestArtwork.created_at)}</span>
                  </div>
                  <h4 className="font-normal text-text-primary text-base">{latestArtwork.title}</h4>
                  <p className="text-text-secondary text-sm font-light leading-relaxed">
                    {latestArtwork.description || `包含 ${latestArtwork.images.length} 张图片的作品集`}
                  </p>
                  <Link href="/aigc" className="text-primary text-sm font-normal hover:underline inline-flex items-center">
                    浏览作品 <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-text-muted font-light">
                    <Calendar size={16} />
                    <span>暂无作品</span>
                  </div>
                  <h4 className="font-normal text-text-primary text-base">暂无AIGC作品</h4>
                  <p className="text-text-secondary text-sm font-light leading-relaxed">
                    还没有创建任何AIGC作品...
                  </p>
                  <Link href="/aigc" className="text-primary text-sm font-normal hover:underline inline-flex items-center">
                    查看作品 <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}