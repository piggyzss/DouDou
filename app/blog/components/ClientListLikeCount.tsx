"use client"

import LikeToggle from '@/app/components/LikeToggle'

export default function ClientListLikeCount({ postId, initial }: { postId: number; initial: number }) {
  return (
    <LikeToggle
      targetType="blog"
      targetId={postId}
      initialCount={initial}
      size={14}
      showCount={true}
      className="text-[11px]"
      countClassName="text-[11px] leading-none"
      unlikedColorClass="text-text-muted"
      likedColorClass="text-red-500"
    />
  )
}


