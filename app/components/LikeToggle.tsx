"use client"

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LikeToggle({
  targetType,
  targetId,
  initialLiked = false,
  initialCount = 0,
  size = 14,
  showCount = true,
  className = '',
  onChanged
}: {
  targetType: 'blog' | 'artwork'
  targetId: number
  initialLiked?: boolean
  initialCount?: number
  size?: number
  showCount?: boolean
  className?: string
  onChanged?: (liked: boolean, count: number) => void
}) {
  const [liked, setLiked] = useState<boolean>(initialLiked)
  const [count, setCount] = useState<number>(initialCount)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/likes/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targets: [{ type: targetType, id: targetId }] })
        })
        if (!res.ok) return
        const json = await res.json()
        const s = json.statuses?.[0]
        if (s && typeof s.liked === 'boolean') setLiked(s.liked)
      } catch {}
    }
    fetchStatus()
  }, [targetType, targetId])

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount(c => Math.max(0, c + (nextLiked ? 1 : -1)))
    try {
      const res = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, action: nextLiked ? 'like' : 'unlike' })
      })
      if (!res.ok) {
        let msg = ''
        try { msg = await res.text() } catch {}
        console.error('Toggle like failed:', msg)
        throw new Error('toggle failed')
      }
      const json = await res.json()
      setLiked(json.liked)
      setCount(json.likesCount)
      onChanged?.(json.liked, json.likesCount)
      // 广播全局事件，供展示组件同步
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('like:changed', {
          detail: { targetType, targetId, liked: json.liked, count: json.likesCount }
        }))
        try {
          localStorage.setItem(`likes:${targetType}:${targetId}`, String(json.likesCount))
        } catch {}
      }
    } catch (err) {
      setLiked(!nextLiked)
      setCount(c => Math.max(0, c + (nextLiked ? -1 : 1)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button disabled={busy} onClick={toggle} className={`flex items-center gap-1 text-sm ${className}`}>
      <motion.span
        animate={{ scale: liked ? 1.15 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20, duration: 0.15 }}
        whileTap={{ scale: 0.9 }}
        className="inline-flex"
      >
        <Heart
          size={size}
          className={`${liked ? 'text-red-500' : 'text-text-muted'} transition-colors duration-200`}
          fill={liked ? 'currentColor' : 'none'}
        />
      </motion.span>
      {showCount && <span className="leading-none text-text-muted transition-colors duration-200">{count}</span>}
    </button>
  )
}
