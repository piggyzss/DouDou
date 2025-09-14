'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { PenSquare } from 'lucide-react'
import { BlogModel } from '../../lib/models/blog'

export default function BlogPage() {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const isDev = process.env.NODE_ENV === 'development'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await BlogModel.findAllPublished(1, 10)
        setResult(data)
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
        <div className="w-full py-12 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary font-heading">博客文章</h1>
            <p className="text-text-secondary mt-1 font-blog">分享技术心得和生活感悟</p>
          </div>

          {/* 新建博客按钮 - 仅在开发模式下显示 */}
          {isDev && (
            <div className="mb-6">
              <Link
                href="/blog/new"
                className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
              >
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
        <div className="w-full py-12 relative">
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
      <div className="w-full py-12 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-heading">博客文章</h1>
          <p className="text-text-secondary mt-1 font-blog">分享技术心得和生活感悟</p>
        </div>

        {/* 新建博客按钮 - 仅在开发模式下显示 */}
        {isDev && (
          <div className="mb-6">
            <Link
              href="/blog/new"
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
            >
              新建博客
            </Link>
          </div>
        )}
        
        <div className="space-y-6">
          {result?.posts && result.posts.length > 0 ? (
            result.posts.map((post: any) => (
              <div key={post.id} className="border p-3 mb-2">
                <h4>{post.title}</h4>
                <p>状态: {post.status}</p>
                <p>创建时间: {post.created_at}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <PenSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-text-secondary">暂无博客</p>
              <p className="text-sm text-text-muted mt-2 blog-body-text">点击上方按钮创建您的第一篇博客</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}