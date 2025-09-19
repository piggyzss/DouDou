'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { PenSquare, Calendar, Tag, Eye, Edit, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import LikeToggle from '../components/LikeToggle'

// 日期格式化函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 生成摘要
const generateExcerpt = (content: string, maxLength: number = 150) => {
  const cleanContent = content.replace(/[#*`>\-\[\]]/g, '').trim()
  if (cleanContent.length <= maxLength) return cleanContent
  return cleanContent.slice(0, maxLength) + '...'
}

export default function BlogPage() {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const isDev = process.env.NODE_ENV === 'development'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/blog/posts?page=1&limit=10')
        const data = await response.json()
        
        if (data.success) {
          setResult(data.data)
        } else {
          setError(data.error || '数据加载失败')
        }
      } catch (err) {
        console.error('博客页面加载失败:', err)
        setError('数据加载失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary font-heading">博客文章</h1>
            <p className="text-text-secondary mt-1 font-blog">分享技术心得和生活感悟</p>
          </div>

          {/* 新建博客按钮 - 仅在开发模式下显示 */}
          {isDev && (
            <div className="mb-6">
              <Link
                href="/blog/new"
                className="inline-flex items-center px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
              >
                <PenSquare size={16} className="mr-2" />
                新建博客
              </Link>
            </div>
          )}

          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-text-secondary">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-600">博客页面错误</h1>
          </div>
          <div className="bg-red-100 p-4 rounded">
            <p><strong>错误信息:</strong> {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-heading">博客文章</h1>
          <p className="text-text-secondary mt-1 font-blog">分享技术心得和生活感悟</p>
        </div>

        {/* 新建博客按钮 - 仅在开发模式下显示 */}
        {isDev && (
          <div className="mb-6">
            <Link
              href="/blog/new"
              className="inline-flex items-center px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
            >
              <PenSquare size={16} className="mr-2" />
              新建博客
            </Link>
          </div>
        )}
        
        <AnimatePresence>
          {result?.posts && result.posts.length > 0 ? (
            <div className="space-y-6">
              {result.posts.map((post: any, index: number) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:shadow-lg transition-all duration-300 p-4">
                    <div className="flex h-56">
                      {/* 左侧封面图片 - 3:4比例 */}
                      {post.cover_url ? (
                        <div className="w-42 h-full flex-shrink-0 rounded overflow-hidden">
                          <img
                            src={post.cover_url.startsWith('/') ? post.cover_url : `/api/aigc/proxy-image?url=${encodeURIComponent(post.cover_url)}`}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-42 h-full flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center rounded">
                          <PenSquare className="text-gray-400" size={48} />
                        </div>
                      )}

                      {/* 右侧内容 */}
                      <div className="flex-1 pl-6 flex flex-col justify-between">
                        {/* 标题和操作按钮 */}
                        <div className="flex items-center gap-3 mb-4">
                          <h2 className="text-xl font-bold text-text-primary font-heading group-hover:text-primary transition-colors line-clamp-2 flex-1">
                            <Link href={`/blog/${post.slug}`}>
                              {post.title}
                            </Link>
                          </h2>
                          {isDev && (
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                              <Link
                                href={`/blog/${post.slug}/edit`}
                                className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors pointer-events-auto"
                                title="编辑博客"
                              >
                                <Edit size={14} />
                              </Link>
                              <button
                                className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors pointer-events-auto"
                                title="删除博客"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 标签 */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog"
                              >
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-text-muted font-blog">+{post.tags.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* 信息栏：时间、喜欢 - 参考AIGC样式 */}
                        <div className="flex items-center gap-2 text-[11px] text-text-muted mb-4">
                          <div className="flex items-center gap-1">
                            <time>{formatDate(post.published_at || post.created_at)}</time>
                          </div>
                          <span className="mx-0.5 inline-flex items-center justify-center text-[11px] leading-none text-text-muted translate-y-[2px] select-none">·</span>
                          <div className="flex items-center gap-1">
                            <LikeToggle
                              targetType="blog"
                              targetId={post.id}
                              initialCount={post.likes_count || 0}
                              size={14}
                              showCount={true}
                              className="text-[11px]"
                              countClassName="text-[11px] leading-none text-text-muted"
                              unlikedColorClass="text-text-muted"
                              likedColorClass="text-red-500"
                            />
                          </div>
                        </div>

                        {/* 文章摘要 */}
                        {post.excerpt && (
                          <p className="text-text-secondary text-sm font-blog line-clamp-2 flex-grow">
                            {generateExcerpt(post.excerpt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <PenSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-text-secondary">暂无博客</p>
              <p className="text-sm text-text-muted mt-2 blog-body-text">点击上方按钮创建您的第一篇博客</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}