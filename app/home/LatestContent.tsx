'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, ArrowRight, Pointer } from 'lucide-react'
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
    <section className="pt-12 pb-20">
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
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => window.location.href = '/blog'}
          >
            <div className="p-6">
              <h3 className="text-lg font-normal text-text-primary mb-4 group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                最新博客
                <Pointer size={16} className="rotate-90" />
              </h3>
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
                  <h4 className="font-normal text-text-primary text-base group-hover:scale-[1.02] transition-transform duration-300">{latestBlog.title}</h4>
                  <p className="text-sm blog-body-text line-clamp-5">
                    {latestBlog.excerpt || '暂无摘要...'}
                  </p>
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
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => window.location.href = '/projects'}
          >
            <div className="p-6">
              <h3 className="text-lg font-normal text-text-primary mb-4 group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                最新项目
                <Pointer size={16} className="rotate-90" />
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-text-muted font-light">
                  <Calendar size={16} />
                  <span>2024-01-10</span>
                </div>
                <h4 className="font-normal text-text-primary text-base group-hover:scale-[1.02] transition-transform duration-300">AI聊天助手</h4>
                <p className="text-sm blog-body-text">
                  基于OpenAI API的智能聊天应用，支持多轮对话...
                </p>
              </div>
            </div>
          </motion.div>

          {/* 最新AIGC作品 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: false }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => window.location.href = '/aigc'}
          >
            <div className="p-6">
              <h3 className="text-lg font-normal text-text-primary mb-4 group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                最新AIGC作品
                <Pointer size={16} className="rotate-90" />
              </h3>
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
                  <h4 className="font-normal text-text-primary text-base group-hover:scale-[1.02] transition-transform duration-300">{latestArtwork.title}</h4>
                  {latestArtwork.images && latestArtwork.images.length > 0 ? (
                    <div className="relative w-full h-40 overflow-hidden rounded border border-gray-100 dark:border-gray-700">
                      <img
                        src={latestArtwork.images[0].file_url.startsWith('/') ? latestArtwork.images[0].file_url : `/api/aigc/proxy-image?url=${encodeURIComponent(latestArtwork.images[0].file_url)}`}
                        alt={latestArtwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
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
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
