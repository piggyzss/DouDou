import Link from 'next/link'
import EmptyState from './EmptyState'
import PostDeleteButton from './PostDeleteButton'
import { PenSquare, Heart } from 'lucide-react'
import ClientListLikeCount from './ClientListLikeCount'
import { BlogModel } from '@/lib/models/blog'
import ClientFadeIn from './[slug]/ClientFadeIn'

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
  const page = Number(searchParams?.page ?? '1') || 1
  const result = await BlogModel.findAllPublished(page, 2)
  const isDev = process.env.NODE_ENV === 'development'

  // 生成分页按钮数组
  const generatePaginationButtons = () => {
    const buttons = []
    const maxVisible = 5 // 最多显示5个按钮
    
    if (result.totalPages <= maxVisible) {
      // 如果总页数少于等于最大显示数，显示所有页
      for (let i = 1; i <= result.totalPages; i++) {
        buttons.push(i)
      }
    } else {
      // 如果总页数大于最大显示数，智能显示
      if (result.currentPage <= 3) {
        // 当前页在前3页，显示前5页
        for (let i = 1; i <= 5; i++) {
          buttons.push(i)
        }
      } else if (result.currentPage >= result.totalPages - 2) {
        // 当前页在后3页，显示后5页
        for (let i = result.totalPages - 4; i <= result.totalPages; i++) {
          buttons.push(i)
        }
      } else {
        // 当前页在中间，显示当前页前后各2页
        for (let i = result.currentPage - 2; i <= result.currentPage + 2; i++) {
          buttons.push(i)
        }
      }
    }
    
    return buttons
  }

  const paginationButtons = generatePaginationButtons()

  return (
    <div className="min-h-screen pt-16">
      <div className="w-full py-12 relative">
        <div className="mb-8">
          <h1 className="text-3xl text-text-primary font-heading">博客文章</h1>
          <p className="text-text-secondary mt-1 font-english">分享技术心得和生活感悟</p>
        </div>

        {/* 新建博客按钮 */}
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

        <ClientFadeIn>
          <div className="space-y-6">
          {result.posts && result.posts.length > 0 ? (
            result.posts.map((post: any) => (
              <section key={post.slug} className="group rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-md transition-shadow">
                <div className="flex gap-4 items-stretch">
                  {post.cover_url ? (
                    <Link href={`/blog/${post.slug}`} className="flex-shrink-0 block w-32 md:w-40 h-full">
                      <img
                        src={post.cover_url.startsWith('/') ? post.cover_url : `/api/aigc/proxy-image?url=${encodeURIComponent(post.cover_url)}`}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-md border border-gray-100 dark:border-gray-700"
                      />
                    </Link>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xl font-semibold text-text-primary font-heading leading-6">
                        <Link href={`/blog/${post.slug}`} className="hover:text-primary">{post.title}</Link>
                      </h2>
                      {process.env.NODE_ENV === 'development' && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/blog/${post.slug}/edit`}
                            className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="编辑文章"
                          >
                            <PenSquare size={14} />
                          </Link>
                          <PostDeleteButton slug={post.slug} currentPage={result.currentPage} />
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-text-muted text-[11px]">
                      <time className="leading-none">{formatDate(post.published_at || post.created_at)}</time>
                      <span className="inline-flex items-center justify-center align-middle leading-none translate-y-[2px] mx-0.5">·</span>
                      <div className="flex flex-wrap gap-1 self-center">
                        {post.tags && post.tags.length > 0 ? (
                          post.tags.map((t: any) => (
                            <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog">#{t}</span>
                          ))
                        ) : (
                          <span className="text-text-light text-xs">无标签</span>
                        )}
                      </div>
                      <span className="inline-flex items-center justify-center align-middle leading-none translate-y-[2px] mx-0.5">·</span>
                      <ClientListLikeCount postId={post.id} initial={post.likes_count ?? 0} />
                    </div>
                    <p className="mt-3 text-text-secondary leading-7 font-blog text-base line-clamp-2 md:line-clamp-3">{post.excerpt}</p>
                    <div className="mt-3">
                      <Link href={`/blog/${post.slug}`} className="text-primary hover:underline text-base font-english">Read more →</Link>
                    </div>
                  </div>
                </div>
              </section>
            ))
          ) : (
            <EmptyState />
          )}
          </div>
        </ClientFadeIn>

        {/* 优化后的分页 */}
        {result.totalPages > 1 && result.posts && result.posts.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {/* 上一页按钮 */}
            <div className="w-8 h-8">
              {result.currentPage > 1 ? (
                <Link
                  href={`/blog?page=${result.currentPage - 1}`}
                  className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-text-secondary hover:text-primary hover:shadow-md transition-all duration-200 font-blog shadow-sm"
                >
                  ←
                </Link>
              ) : (
                <div className="w-full h-full rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-text-light font-blog opacity-50 shadow-sm">
                  ←
                </div>
              )}
            </div>
            
            {/* 分页按钮 */}
            {paginationButtons.map((pageNum) => (
              <div key={pageNum} className="w-8 h-8">
                <Link
                  href={`/blog?page=${pageNum}`}
                  className={`w-full h-full rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 shadow-sm ${
                    pageNum === result.currentPage
                      ? 'bg-gradient-primary-secondary text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-text-secondary border border-gray-200 dark:border-gray-700 hover:text-primary hover:shadow-md'
                  }`}
                >
                  {pageNum}
                </Link>
              </div>
            ))}
            
            {/* 下一页按钮 */}
            <div className="w-8 h-8">
              {result.currentPage < result.totalPages ? (
                <Link
                  href={`/blog?page=${result.currentPage + 1}`}
                  className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-text-secondary hover:text-primary hover:shadow-md transition-all duration-200 font-blog shadow-sm"
                >
                  →
                </Link>
              ) : (
                <div className="w-full h-full rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-text-light font-blog opacity-50 shadow-sm">
                  →
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}