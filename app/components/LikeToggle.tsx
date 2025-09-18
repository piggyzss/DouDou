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
  // 极简状态管理：只维护显示状态
  const [liked, setLiked] = useState<boolean>(initialLiked)
  const [count, setCount] = useState<number>(initialCount)
  const [busy, setBusy] = useState(false)

  // 只在组件首次加载时获取一次真实状态
  useEffect(() => {
    const fetchRealStatus = async () => {
      try {
        const res = await fetch('/api/likes/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targets: [{ type: targetType, id: targetId }] })
        })
        
        if (res.ok) {
          const json = await res.json()
          const status = json.statuses?.[0]
          if (status) {
            setLiked(status.liked || false)
            setCount(status.likesCount || 0)
          }
        }
      } catch (err) {
        console.error('Failed to fetch like status:', err)
      }
    }
    
    fetchRealStatus()
  }, []) // 空依赖数组，只在组件挂载时执行一次

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (busy) return
    
    setBusy(true)
    
    // 保存当前状态用于回滚
    const oldLiked = liked
    const oldCount = count
    
    // 立即切换状态和数量（乐观更新）
    const newLiked = !liked
    const newCount = Math.max(0, count + (newLiked ? 1 : -1))
    setLiked(newLiked)
    setCount(newCount)
    
    // 立即通知父组件（使用乐观更新的状态）
    onChanged?.(newLiked, newCount)
    
    try {
      // 调用后端
      const res = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, action: newLiked ? 'like' : 'unlike' })
      })
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      const json = await res.json()
      
      // 如果后端返回的状态与前端乐观更新不一致，则使用后端数据
      if (typeof json.liked === 'boolean' && json.liked !== newLiked) {
        setLiked(json.liked)
        onChanged?.(json.liked, json.likesCount || newCount)
      }
      if (typeof json.likesCount === 'number' && json.likesCount !== newCount) {
        setCount(json.likesCount)
        onChanged?.(json.liked || newLiked, json.likesCount)
      }
      
    } catch (err) {
      console.error('Like toggle error:', err)
      // 回滚状态
      setLiked(oldLiked)
      setCount(oldCount)
      onChanged?.(oldLiked, oldCount)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button 
      disabled={busy} 
      onClick={toggle} 
      className={`group inline-flex items-center gap-1 p-0 m-0 bg-transparent text-sm leading-none ${className}`}
      data-liked={liked.toString()}
      data-loading={busy.toString()}
    >
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
