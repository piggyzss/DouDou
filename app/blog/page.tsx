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
                <div key={post.id} className="group rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <h2 className="text-xl font-semibold text-text-primary font-heading mb-3">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-text-secondary leading-7 font-blog mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-text-muted text-sm">
                    <time>{new Date(post.published_at || post.created_at).toLocaleDateString('zh-CN')}</time>
                    {post.tags && post.tags.length > 0 && (
                      <>
                        <span>·</span>
                        <div className="flex gap-1">
                          {post.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">暂无博客文章</h3>
                <p className="text-text-secondary">内容正在准备中，敬请期待...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error('博客页面加载失败:', error)
    
    return (
      <div className="min-h-screen pt-16">
        <div className="w-full py-12 relative">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-600 mb-2">页面加载失败</h3>
            <p className="text-text-secondary">抱歉，页面暂时无法加载，请稍后再试</p>
          </div>
        </div>
      </div>
    )
  }
}