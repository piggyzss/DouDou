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
  countClassName = '',
  onChanged,
  unlikedFill = 'none',
  unlikedColorClass = 'text-text-muted',
  likedColorClass = 'text-red-500',
  ignoreExternalEvents = false
}: {
  targetType: 'blog' | 'artwork' | 'artwork_image' | 'music'
  targetId: number
  initialLiked?: boolean
  initialCount?: number
  size?: number
  showCount?: boolean
  className?: string
  countClassName?: string
  onChanged?: (liked: boolean, count: number) => void
  unlikedFill?: 'none' | 'currentColor'
  unlikedColorClass?: string
  likedColorClass?: string
  ignoreExternalEvents?: boolean
}) {
  const [liked, setLiked] = useState<boolean>(initialLiked)
  const [count, setCount] = useState<number>(initialCount)
  const [busy, setBusy] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false)

  useEffect(() => {
    const fetchStatus = async () => {
      const now = Date.now()
      // 如果用户刚刚交互过，不要重新获取状态
      if (hasUserInteracted && now - lastFetchTime < 2000) return
      
      try {
        const res = await fetch('/api/likes/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targets: [{ type: targetType, id: targetId }] })
        })
        if (!res.ok) return
        const json = await res.json()
        const s = json.statuses?.[0]
        if (s && typeof s.liked === 'boolean') {
          setLiked(s.liked)
        }
        if (s && typeof s.likesCount === 'number') {
          setCount(s.likesCount)
        }
        setLastFetchTime(now)
      } catch {}
    }
    fetchStatus()
  }, [targetType, targetId, lastFetchTime, hasUserInteracted])

  // 同步跨组件的点赞状态（例如预览模式与列表 hover 图标之间）
  useEffect(() => {
    if (ignoreExternalEvents) return
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { targetType: 'blog' | 'artwork' | 'artwork_image'; targetId: number; liked: boolean; count: number }
      if (!detail) return
      if (detail.targetType === targetType && detail.targetId === targetId) {
        setLiked(detail.liked)
        setCount(detail.count)
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('like:changed', handler as EventListener)
      return () => window.removeEventListener('like:changed', handler as EventListener)
    }
  }, [targetType, targetId, ignoreExternalEvents])

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    setHasUserInteracted(true) // 标记用户已交互
    const nextLiked = !liked
    const prevCount = count
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
      const finalLiked = typeof json.liked === 'boolean' ? json.liked : nextLiked
      const finalCount = typeof json.likesCount === 'number' ? json.likesCount : Math.max(0, prevCount + (finalLiked ? 1 : -1))
      setLiked(finalLiked)
      setCount(finalCount)
      setLastFetchTime(Date.now()) // 更新最后获取时间，防止立即重新获取
      onChanged?.(finalLiked, finalCount)
      // 广播全局事件，供展示组件同步
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('like:changed', {
          detail: { targetType, targetId, liked: finalLiked, count: finalCount }
        }))
        try {
          localStorage.setItem(`likes:${targetType}:${targetId}`, String(finalCount))
        } catch {}
      }
    } catch (err) {
      // 回滚到之前的状态
      setLiked(liked)
      setCount(prevCount)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button disabled={busy} onClick={toggle} className={`group inline-flex items-center gap-1 p-0 m-0 bg-transparent text-sm leading-none ${className}`}>
      <motion.span
        animate={{ scale: liked ? 1.15 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20, duration: 0.15 }}
        whileTap={{ scale: 0.9 }}
        className="inline-flex"
      >
        <Heart
          size={size}
          className={`${liked ? likedColorClass : unlikedColorClass} transition-colors duration-200`}
          fill={liked ? 'currentColor' : unlikedFill}
        />
      </motion.span>
      {showCount && <span className={`leading-none text-text-muted transition-colors duration-200 ${countClassName}`}>{count}</span>}
    </button>
  )
}
