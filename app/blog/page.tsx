import { BlogModel } from '../../lib/models/blog'

export default async function BlogPage() {
  try {
    // 尝试调用BlogModel，看是否有错误
    const result = await BlogModel.findAllPublished(1, 10)
    
    return (
      <div className="min-h-screen pt-16">
        <div className="w-full py-12 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary font-heading">博客文章</h1>
            <p className="text-text-secondary mt-1 font-blog">分享技术心得和生活感悟</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-100 p-4 rounded">
              <p><strong>总文章数:</strong> {result.total}</p>
              <p><strong>总页数:</strong> {result.totalPages}</p>
              <p><strong>当前页:</strong> {result.currentPage}</p>
              <p><strong>文章数量:</strong> {result.posts?.length || 0}</p>
            </div>
            
            {result.posts && result.posts.length > 0 ? (
              <div>
                <h3>文章列表:</h3>
                {result.posts.map((post: any) => (
                  <div key={post.id} className="border p-3 mb-2">
                    <h4>{post.title}</h4>
                    <p>状态: {post.status}</p>
                    <p>创建时间: {post.created_at}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>暂无博客文章</p>
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
            <p><strong>错误堆栈:</strong></p>
            <pre className="text-xs mt-2 overflow-auto">{error.stack}</pre>
          </div>
        </div>
      </div>
    )
  }
}