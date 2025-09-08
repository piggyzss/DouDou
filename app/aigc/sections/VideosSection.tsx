"use client"

import { Film, Heart, MessageCircle } from 'lucide-react'

export interface VideoTrack {
  id: string
  title: string
  tags: string[]
  videoUrl: string
  coverUrl: string
  duration: number
  likes: number
  comments: number
  createdAt: string
}

interface VideosSectionProps {
  videos: VideoTrack[]
  formatDate: (date: string) => string
  formatNumber: (num: number) => string
}

export default function VideosSection({ videos, formatDate, formatNumber }: VideosSectionProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Film className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-text-secondary">暂无视频</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-unified group hover:shadow-xl transition-all duration-300 relative">
          <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
            {video.coverUrl ? (
              <img src={video.coverUrl} alt={video.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film size={48} className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="p-2">
            <h3 className="text-base font-semibold text-text-primary font-heading line-clamp-1 mb-2">{video.title}</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {video.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog">#{tag}</span>
              ))}
            </div>
            {/* 与作品集时间信息一致：小号灰字，点分隔 时间·喜欢·留言 */}
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <div className="flex items-center gap-1">
                <time>{formatDate(video.createdAt)}</time>
              </div>
              <span className="mx-0.5 inline-flex items-center justify-center text-[11px] leading-none text-text-muted translate-y-[2px] select-none">·</span>
              <div className="flex items-center gap-1">
                <Heart size={14} />
                <span>{formatNumber(video.likes)}</span>
              </div>
              <span className="mx-0.5 inline-flex items-center justify-center text-[11px] leading-none text-text-muted translate-y-[2px] select-none">·</span>
              <div className="flex items-center gap-1">
                <MessageCircle size={14} />
                <span>{formatNumber(video.comments)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
