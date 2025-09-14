import { PenSquare } from 'lucide-react'
import { BlogModel } from '../../lib/models/blog'

export default async function BlogPage() {
  try {
    const result = await BlogModel.findAllPublished(1, 10)
    
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
  } catch (error: any) {
    console.error('博客页面错误:', error)
    
    return (
      <div className="min-h-screen pt-16">
        <div className="w-full py-12 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-600">博客页面错误</h1>
          </div>
          <div className="bg-red-100 p-4 rounded">
            <p><strong>错误信息:</strong> {error.message}</p>
            <pre className="text-xs mt-2 overflow-auto">{error.stack}</pre>
          </div>
        </div>
      </div>
    )
  }
}