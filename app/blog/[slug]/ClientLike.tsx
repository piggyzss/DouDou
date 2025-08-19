
'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

type Props = { slug: string }

export default function ClientLike({ slug }: Props) {
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    const key = `like:${slug}`
    const saved = localStorage.getItem(key)
    if (saved) {
      const data = JSON.parse(saved)
      setCount(data.count || 0)
      setLiked(Boolean(data.liked))
    }
  }, [slug])

  const toggle = () => {
    const key = `like:${slug}`
    const nextLiked = !liked
    const nextCount = count + (nextLiked ? 1 : -1)
    setLiked(nextLiked)
    setCount(Math.max(0, nextCount))
    localStorage.setItem(key, JSON.stringify({ liked: nextLiked, count: Math.max(0, nextCount) }))
  }

  return (
    <button onClick={toggle} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${liked ? 'text-primary border-primary/30' : 'text-text-secondary border-gray-200 dark:border-gray-700'} hover:text-primary transition-colors`}>
      <Heart size={14} className={liked ? 'fill-primary text-primary' : ''} />
      <span className="text-xs">{count}</span>
    </button>
  )
}


