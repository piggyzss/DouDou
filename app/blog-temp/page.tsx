export default function TempBlogPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="w-full py-12 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-heading">博客文章（临时页面）</h1>
          <p className="text-text-secondary mt-1 font-blog">分享技术心得和生活感悟</p>
        </div>
        
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-text-secondary">暂时没有博客文章</p>
            <p className="text-text-muted text-sm mt-2">数据库连接正常，等待添加内容</p>
          </div>
        </div>
      </div>
    </div>
  )
}
