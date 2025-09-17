'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Terminal, Code, FileText, Palette, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt?: string
  published_at?: string
  created_at: string
}

interface ArtworkImage {
  id: number
  file_url: string
  original_name: string
  file_size?: number
  width?: number
  height?: number
  mime_type?: string
  created_at: string
}

interface ArtworkCollection {
  id: string
  title: string
  description?: string
  created_at: string
  images: ArtworkImage[]
}

interface App {
  id: number
  name: string
  slug: string
  description: string
  tags: string[]
  type: 'app' | 'miniprogram' | 'game'
  platform: 'web' | 'mobile' | 'wechat'
  status: 'development' | 'beta' | 'online'
  experience_method: 'download' | 'qrcode'
  download_url?: string
  qr_code_url?: string
  cover_image_url?: string
  video_url?: string
  dau: number
  downloads: number
  likes_count: number
  trend: string
  created_at: string
  updated_at: string
  published_at?: string
}

export default function Project() {
  const router = useRouter()
  const [latestBlog, setLatestBlog] = useState<BlogPost | null>(null)
  const [latestArtwork, setLatestArtwork] = useState<ArtworkCollection | null>(null)
  const [latestApp, setLatestApp] = useState<App | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLatestContent = async () => {
      try {
        setError(null)
        
        // 获取最新博客
        const blogResponse = await fetch('/api/blog?limit=1')
        if (blogResponse.ok) {
          const blogData = await blogResponse.json()
          if (blogData.data?.posts?.length > 0) {
            setLatestBlog(blogData.data.posts[0])
          }
        } else {
          console.warn('获取博客数据失败:', blogResponse.status)
        }

        // 获取最新AIGC作品
        const artworkResponse = await fetch('/api/aigc/artworks?limit=1')
        if (artworkResponse.ok) {
          const artworkData = await artworkResponse.json()
          if (artworkData.data?.collections?.length > 0) {
            setLatestArtwork(artworkData.data.collections[0])
          }
        } else {
          console.warn('获取AIGC作品数据失败:', artworkResponse.status)
        }

        // 获取最新应用
        const appResponse = await fetch('/api/apps?limit=1&status=online')
        if (appResponse.ok) {
          const appData = await appResponse.json()
          if (appData.apps?.length > 0) {
            setLatestApp(appData.apps[0])
          }
        } else {
          console.warn('获取应用数据失败:', appResponse.status)
        }
      } catch (error) {
        console.error('获取最新内容失败:', error)
        setError('获取内容失败，请稍后重试')
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
              Project
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 最新博客 - 终端风格 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false }}
            className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden group cursor-pointer hover:border-green-400 transition-all duration-300"
            onClick={() => router.push('/blog')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                router.push('/blog')
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="查看最新博客"
          >
            {/* 终端标题栏 */}
            <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--terminal-green)' }}></div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Terminal size={14} />
                <span>latest-blog.md</span>
              </div>
            </div>
            
            {/* 终端内容 */}
            <div className="p-4 font-mono text-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <span className="text-yellow-400">$</span>
                  <span className="text-blue-400">cat</span>
                  <span className="text-purple-400">latest-blog.md</span>
                </div>
                
                {loading ? (
                  <div className="space-y-2">
                    <div className="animate-pulse">
                      <div className="h-3 bg-gray-700 rounded w-20"></div>
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                      <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ) : latestBlog ? (
                  <div className="space-y-2">
                    <div className="text-gray-400 font-light">
                      <span className="text-[var(--primary)]">#</span> <span className="text-white">{latestBlog.title}</span>
                    </div>
                    <div className="text-gray-500 text-xs font-light">
                      <span className="text-yellow-400">date:</span> <span className="text-white">{formatDate(latestBlog.published_at || latestBlog.created_at)}</span>
                    </div>
                    <div className="text-gray-300 leading-relaxed text-xs font-thin line-clamp-4">
                      {latestBlog.excerpt || '暂无摘要...'}
                    </div>
                    <div className="flex items-center gap-2 text-[var(--code-green)] mt-3">
                      <ChevronRight size={14} />
                      <span>read more...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-gray-400 font-light">
                      <span className="text-[var(--primary)]">#</span> 暂无博客文章
                    </div>
                    <div className="text-gray-500 text-xs font-light">
                      <span className="text-yellow-400">status:</span> 还没有发布任何博客文章...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 最新项目 - 代码编辑器风格 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: false }}
            className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden group cursor-pointer hover:border-blue-400 transition-all duration-300"
            onClick={() => router.push('/apps')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                router.push('/apps')
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="查看最新项目"
          >
            {/* 编辑器标题栏 */}
            <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--terminal-green)' }}></div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Code size={14} />
                <span>app.tsx</span>
              </div>
            </div>
            
            {/* 编辑器内容 */}
            <div className="p-4 font-mono text-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <span className="text-yellow-400">$</span>
                  <span className="text-blue-400">ls</span>
                  <span className="text-purple-400">-la</span>
                  <span className="text-green-400">latest-app/</span>
                </div>
                
                {loading ? (
                  <div className="space-y-2">
                    <div className="animate-pulse">
                      <div className="h-3 bg-gray-700 rounded w-20"></div>
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                      <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ) : latestApp ? (
                  <div className="space-y-2">
                    <div className="text-gray-400 font-light">
                      <span className="text-[var(--primary)]">📱</span> <span className="text-white">{latestApp.name}</span>
                    </div>
                    <div className="text-gray-500 text-xs font-light">
                      <span className="text-yellow-400">类型:</span> <span className="text-white">{latestApp.type === 'app' ? '应用' : latestApp.type === 'miniprogram' ? '小程序' : '游戏'}</span>
                    </div>
                    <div className="text-gray-500 text-xs font-light">
                      <span className="text-yellow-400">平台:</span> <span className="text-white">{latestApp.platform === 'web' ? 'Web' : latestApp.platform === 'mobile' ? '移动端' : '微信'}</span>
                    </div>
                    <div className="text-gray-500 text-xs font-light">
                      <span className="text-yellow-400">创建:</span> <span className="text-white">{formatDate(latestApp.created_at)}</span>
                    </div>
                    <div className="text-gray-300 leading-relaxed text-xs font-thin">
                      {latestApp.description.length > 60 ? latestApp.description.substring(0, 60) + '...' : latestApp.description}
                    </div>
                    {latestApp.tags && latestApp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {latestApp.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300 font-light"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[var(--code-green)] mt-3">
                      <ChevronRight size={14} />
                      <span>view project...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-gray-400 font-light">
                      <span className="text-[var(--primary)]">📱</span> <span className="text-white">暂无应用</span>
                    </div>
                    <div className="text-gray-500 text-xs font-light">
                      <span className="text-yellow-400">状态:</span> 还没有发布任何应用...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 最新AIGC作品 - 终端风格 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: false }}
            className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden group cursor-pointer hover:border-purple-400 transition-all duration-300"
            onClick={() => router.push('/aigc')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                router.push('/aigc')
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="查看最新AIGC作品"
          >
            {/* 终端标题栏 */}
            <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--terminal-green)' }}></div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Palette size={14} />
                <span>aigc.sh</span>
              </div>
            </div>
            
            {/* 终端内容 */}
            <div className="p-4 font-mono text-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <span className="text-yellow-400">$</span>
                  <span className="text-blue-400">python</span>
                  <span className="text-purple-400">generate_artwork.py</span>
                </div>
                
                {loading ? (
                  <div className="space-y-2">
                    <div className="animate-pulse">
                      <div className="h-3 bg-gray-700 rounded w-20"></div>
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                      <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ) : latestArtwork ? (
                  <div className="space-y-2">
                    <div className="text-gray-300 font-thin">
                      <span className="text-[var(--primary)]">[INFO]</span> 正在生成艺术作品...
                    </div>
                    <div className="text-gray-500 text-xs font-light">
                      <span className="text-yellow-400">prompt:</span> <span className="text-white">{latestArtwork.title}</span>
                    </div>
                    <div className="text-gray-500 text-xs font-light">
                      <span className="text-yellow-400">created:</span> <span className="text-white">{formatDate(latestArtwork.created_at)}</span>
                    </div>
                    {latestArtwork.images && latestArtwork.images.length > 0 ? (
                      <div className="mt-3 p-2 bg-gray-800 rounded border border-gray-600">
                        <div className="text-gray-400 text-xs mb-1 font-light">preview:</div>
                        <div className="w-full h-20 bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-gray-500 text-xs font-light">🎨 artwork preview</span>
                        </div>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2 text-[var(--code-green)] mt-3">
                      <ChevronRight size={14} />
                      <span>view gallery...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-gray-400 font-light">
                      <span className="text-[var(--primary)]">[INFO]</span> 暂无AIGC作品
                    </div>
                    <div className="text-gray-500 text-xs font-light">
                      <span className="text-yellow-400">status:</span> 还没有创建任何AIGC作品...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
