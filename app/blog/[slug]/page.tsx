import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug } from '@/lib/blog'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrism from 'rehype-prism-plus'
import rehypeStringify from 'rehype-stringify'
import TOC from './toc'
import ClientLike from './ClientLike'
import ClientBackToTop from './ClientBackToTop'
import ClientCodeBlock from './ClientCodeBlock'

// 统一的日期格式化函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type Params = { params: { slug: string } }

async function renderMarkdown(md: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'append' })
    .use(rehypePrism, { showLineNumbers: true })
    .use(rehypeStringify)
    .process(md)
  return String(file)
}

export default async function BlogDetailPage({ params }: Params) {
  const post = getPostBySlug(params.slug)
  if (!post) return notFound()
  const htmlContent = await renderMarkdown(post.content)
  const isDev = process.env.NODE_ENV === 'development'
  return (
    <div className="min-h-screen pt-16">
      <div className="w-full py-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8">
          <article className="min-w-0">
            <h1 className="text-4xl font-bold text-text-primary font-heading">{post.title}</h1>
            <div className="mt-2 text-sm text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 font-blog">
              <time>{formatDate(post.date)}</time>
              <span>·</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-bg-secondary text-text-secondary text-xs">#{t}</span>
                ))}
              </div>
              <span>·</span>
              <LikeButton slug={post.slug} />
            </div>
            
            {/* 开发模式下的编辑按钮 */}
            {isDev && (
              <div className="mt-4 mb-6">
                <Link 
                  href={`/blog/${post.slug}/edit`} 
                  className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
                >
                  编辑文章
                </Link>
              </div>
            )}
            
            <div className="blog-content prose prose-slate max-w-none dark:prose-invert mt-6 text-base" dangerouslySetInnerHTML={{ __html: htmlContent }} />
            <ClientCodeBlock />
          </article>
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <TOC />
            </div>
          </aside>
        </div>
      </div>
      <BackToTop />
    </div>
  )
}

function LikeButton({ slug }: { slug: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-text-secondary">
      <ClientLike slug={slug} />
    </span>
  )
}

function BackToTop() {
  return (
    <div className="fixed right-4 bottom-6 z-40">
      <ClientBackToTop />
    </div>
  )
}

