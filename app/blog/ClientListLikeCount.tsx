"use client"

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

export default function ClientListLikeCount({ postId, initial }: { postId: number; initial: number }) {
  const [count, setCount] = useState<number>(initial)

  useEffect(() => {
    // 1) 监听全局 like 事件（同一个会话内从详情页返回列表时实时更新）
    const handler = (e: any) => {
      const d = e.detail
      if (d?.targetType === 'blog' && d?.targetId === postId) {
        setCount(d.count)
        try { localStorage.setItem(`likes:blog:${postId}`, String(d.count)) } catch {}
      }
    }
    window.addEventListener('like:changed', handler as any)

    // 2) 读取本地缓存（从详情页返回列表时可立即显示最新值）
    try {
      const cached = localStorage.getItem(`likes:blog:${postId}`)
      if (cached) setCount(Number(cached))
    } catch {}

    return () => window.removeEventListener('like:changed', handler as any)
  }, [postId])

  return (
    <div className="flex items-center gap-1 self-center text-sm text-text-muted">
      <Heart size={14} />
      <span className="leading-none">{count}</span>
    </div>
  )
}


