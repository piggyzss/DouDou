export const dynamic = 'force-dynamic'
export const revalidate = 0

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BlogModel } from '@/lib/models/blog'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrism from 'rehype-prism-plus'
import rehypeStringify from 'rehype-stringify'
import TOC from './toc'
import ClientLikesHeader from './ClientLikesHeader'
import LikeToggle from '../../components/LikeToggle'
import ClientBackToTop from './ClientBackToTop'
import ClientCodeBlock from './ClientCodeBlock'
import ClientFadeIn from './ClientFadeIn'

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
  const normalizedSlug = (() => {
    try { return decodeURIComponent(params.slug).normalize('NFC') } catch { return String(params.slug || '').normalize('NFC') }
  })()
  const post = await BlogModel.findBySlug(normalizedSlug)
  if (!post) return notFound()
  const htmlContent = await renderMarkdown(post.content)
  const tagRows = await BlogModel.getPostTags(post.id)
  const tags = tagRows.map(t => ({ name: t.name, slug: t.slug }))
  const isDev = process.env.NODE_ENV === 'development'
  const initialLikes = (post as any).likes_count ?? 0
  return (
    <div className="min-h-screen pt-16">
      <div className="w-full py-8 relative">
        <ClientFadeIn>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8">
            <article className="min-w-0">
              <h1 className="text-4xl font-bold text-text-primary font-heading">{post.title}</h1>
              <ClientLikesHeader
                likes={initialLikes}
                publishedAt={(post as any).published_at}
                createdAt={(post as any).created_at}
                tags={tags}
                postId={post.id}
              />

              {(post as any).cover_url && (
              <div className="mt-4">
                <img
                  src={(post as any).cover_url.startsWith('/') ? (post as any).cover_url : `/api/aigc/proxy-image?url=${encodeURIComponent((post as any).cover_url)}`}
                  alt={post.title}
                  className="w-full max-h-[360px] object-cover rounded border border-gray-100 dark:border-gray-700"
                />
              </div>
              )}

              {/* 编辑按钮已移至列表页 hover 区域 */}

              <div className="blog-content prose prose-slate max-w-none dark:prose-invert mt-6 text-base font-body text-text-primary" dangerouslySetInnerHTML={{ __html: htmlContent }} />
              <ClientCodeBlock />

              {/* 移除正文底部喜欢按钮，交互移动到顶部信息栏 */}
            </article>
            <aside className="hidden md:block">
              <div className="sticky top-24">
                <TOC />
              </div>
            </aside>
          </div>
        </ClientFadeIn>
      </div>
      <BackToTop />
    </div>
  )
}

function BackToTop() {
  return (
    <div className="fixed right-4 bottom-6 z-40">
      <ClientBackToTop />
    </div>
  )
}

