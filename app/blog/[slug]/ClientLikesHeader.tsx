"use client"

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

type Tag = { name: string; slug: string }

export default function ClientLikesHeader({ likes, publishedAt, createdAt, tags, postId }: { likes: number; publishedAt?: string; createdAt: string; tags: Tag[]; postId: number }) {
  const [count, setCount] = useState(likes)

  useEffect(() => {
    const handler = (e: any) => {
      const d = e.detail
      if (d?.targetType === 'blog' && d?.targetId === postId) {
        setCount(d.count)
      }
    }
    window.addEventListener('like:changed', handler as any)
    return () => window.removeEventListener('like:changed', handler as any)
  }, [postId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div className="my-3 flex items-center gap-2 text-sm text-text-muted">
      <time>{formatDate(publishedAt || createdAt)}</time>
      <span>·</span>
      <div className="flex flex-wrap gap-2">
        {tags.map((t: Tag) => (
          <span key={t.slug} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog">#{t.name}</span>
        ))}
      </div>
      <span>·</span>
      <div className="flex items-center gap-1 text-sm text-text-muted">
        <Heart size={14} />
        <span>{count}</span>
      </div>
    </div>
  )
}


