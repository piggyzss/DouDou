import Link from 'next/link'
import { BlogModel } from '../../lib/models/blog'

// 统一的日期格式化函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type Props = {
  searchParams?: { page?: string }
}

export default async function BlogPage({ searchParams }: Props) {
  try {
    const page = Number(searchParams?.page ?? '1') || 1
    const result = await BlogModel.findAllPublished(page, 10)
    const isDev = process.env.NODE_ENV === 'development'

    return (
      <div className="min-h-screen pt-16">
        <div className="w-full py-12 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary font-heading">博客文章</h1>
            <p className="text-text-secondary mt-1 font-blog">分享技术心得和生活感悟</p>
          </div>

          <div className="space-y-6">
            {result.posts && result.posts.length > 0 ? (
              result.posts.map((post: any) => (
                <div key={post.id || post.slug} className="border p-4 rounded-lg">
                  <h2 className="text-xl font-semibold">
                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mt-2">{post.excerpt || '暂无摘要'}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    发布时间: {formatDate(post.published_at || post.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-text-secondary">暂无博客文章</p>
                <p className="text-text-muted text-sm mt-2">数据库连接正常，等待添加内容</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error('博客页面错误:', error)
    console.error('错误堆栈:', error.stack)
    
    return (
      <div className="min-h-screen pt-16">
        <div className="w-full py-12 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-600">博客页面错误</h1>
          </div>
          <div className="bg-red-100 p-4 rounded">
            <p><strong>错误信息:</strong> {error.message}</p>
            <p><strong>错误名称:</strong> {error.name}</p>
            <p><strong>错误代码:</strong> {error.code}</p>
            <pre className="text-xs mt-2 max-h-96 overflow-auto">{error.stack}</pre>
          </div>
        </div>
      </div>
    )
  }
}