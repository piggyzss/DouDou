import Link from 'next/link'
import { getAllPosts, paginatePosts } from '@/lib/blog'

type Props = {
  searchParams?: { page?: string }
}

export default function BlogPage({ searchParams }: Props) {
  const page = Number(searchParams?.page ?? '1') || 1
  const all = getAllPosts()
  const { items, currentPage, totalPages } = paginatePosts(all, page, 5)
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen pt-16">
      <div className="w-full py-12 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-heading">博客文章</h1>
          <p className="text-text-secondary mt-1 font-blog">分享技术心得和生活感悟</p>
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

        <div className="space-y-6">
          {items.map((post) => (
            <section key={post.slug} className="rounded-lg border border-gray-100 dark:border-gray-800 bg-bg-primary p-5 hover:shadow-md transition-shadow">
                              <h2 className="text-xl font-semibold text-text-primary font-heading">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary">{post.title}</Link>
              </h2>
              <div className="mt-2 text-sm text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 font-blog">
                <time>{new Date(post.date).toLocaleDateString()}</time>
                <span>·</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-bg-secondary text-text-secondary text-xs">#{t}</span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-text-secondary leading-7 font-blog text-base">{post.excerpt}</p>
              <div className="mt-3">
                <Link href={`/blog/${post.slug}`} className="text-primary hover:underline text-base font-english">Read more →</Link>
              </div>
            </section>
          ))}
        </div>

        {/* 分页 */}
        <div className="mt-8 flex items-center justify-between text-base font-blog">
          <Link
            href={currentPage > 1 ? `/blog?page=${currentPage - 1}` : '#'}
            className={`px-3 py-1.5 rounded-md border ${currentPage > 1 ? 'text-text-secondary hover:text-primary border-gray-200 dark:border-gray-700' : 'cursor-not-allowed text-text-light border-gray-100 dark:border-gray-800'}`}
            aria-disabled={currentPage <= 1}
          >
            上一页
          </Link>
          <span className="text-text-muted">{currentPage} / {totalPages}</span>
          <Link
            href={currentPage < totalPages ? `/blog?page=${currentPage + 1}` : '#'}
            className={`px-3 py-1.5 rounded-md border ${currentPage < totalPages ? 'text-text-secondary hover:text-primary border-gray-200 dark:border-gray-700' : 'cursor-not-allowed text-text-light border-gray-100 dark:border-gray-800'}`}
            aria-disabled={currentPage >= totalPages}
          >
            下一页
          </Link>
        </div>
      </div>
    </div>
  )
}