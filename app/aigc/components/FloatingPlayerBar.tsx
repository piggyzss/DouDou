"use client"

import { Repeat1, VolumeX, Volume1, Volume2, Play, Pause, SkipBack, SkipForward, Headphones, Shuffle, ListMusic, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface Props {
  title: string
  tags: string[]
  coverUrl: string
  likes: number
  isPlaying: boolean 
  currentTime: number
  duration: number
  repeatMode: 'one' | 'all' | 'shuffle'
  volume: number
  showVolumePanel: boolean
  onPrev: () => void
  onNext: () => void
  onTogglePlay: () => void
  onCycleRepeat: () => void
  onSeekByClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onToggleVolumePanel: () => void
  onChangeVolume: (v: number) => void
  onClose: () => void
}

export default function FloatingPlayerBar({ title, tags, coverUrl, /* likes */ isPlaying, currentTime, duration, repeatMode, volume, showVolumePanel, onPrev, onNext, onTogglePlay, onCycleRepeat, onSeekByClick, onToggleVolumePanel, onChangeVolume, onClose }: Props) {
  const volumeWrapRef = useRef<HTMLDivElement | null>(null)
  const format = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${String(sec).padStart(2, '0')}`
  }
  const renderVolumeIcon = () => {
    if (volume <= 0.001) return <VolumeX size={18} />
    if (volume < 0.5) return <Volume1 size={18} />
    return <Volume2 size={18} />
  }
  const renderRepeatIcon = () => {
    if (repeatMode === 'all') return <ListMusic size={18} />
    if (repeatMode === 'one') return <Repeat1 size={18} />
    return <Shuffle size={18} />
  }
  const repeatTitle = repeatMode === 'all' ? '列表循环' : repeatMode === 'one' ? '单曲循环' : '随机播放'
  const progressPercent = Math.min(100, duration ? (currentTime / duration) * 100 : 0)

  // 点击空白处收起音量面板
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!showVolumePanel) return
      const wrap = volumeWrapRef.current
      if (wrap && !wrap.contains(e.target as Node)) {
        onToggleVolumePanel()
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showVolumePanel, onToggleVolumePanel])

  return (
    <div className="fixed left-0 right-0 bottom-4 md:bottom-6 flex justify-center z-40">
      <div className="relative w-[92%] md:w-1/2 mx-auto rounded-lg overflow-visible shadow-lg border border-gray-200 dark:border-gray-700 player-pop">
        {/* 内容层：移除背景色，保留磨砂与圆角 */}
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-lg">
        <div className="relative py-3.5 md:py-4 px-2.5">
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 h-7 w-7 flex items-center justify-center rounded-full bg-white text-text-secondary transform transition-transform duration-150 hover:scale-110 z-50"
          title="关闭播放器"
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-3 md:gap-3 py-2">
          {/* 封面 */}
          <div className="relative w-11 h-11 md:w-12 md:h-12">
            <img src={coverUrl} alt={title} className="w-full h-full rounded-md object-cover" />
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="p-1 bg-white bg-opacity-90 rounded-full shadow-lg">
                  <Headphones size={14} className="text-gray-600/70 animate-[spin_2.5s_linear_infinite]" />
                </span>
              </div>
            )}
          </div>

          {/* 标题与标签（去掉喜欢数），标签样式与卡片一致 */}
          <div className="min-w-0 flex-1">
            <div className="text-sm md:text-base font-heading text-text-primary truncate">{title}</div>
            <div className="flex flex-wrap items-center gap-1 mt-1">
              {tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-[10px] md:text-xs font-blog">#{tag}</span>
              ))}
            </div>
          </div>

          {/* 中间控制 */}
          <div className="flex items-center justify-center gap-2.5 flex-none">
            <button onClick={onPrev} className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 transition-transform duration-150 hover:scale-105 active:scale-95" title="上一首">
              <SkipBack size={18} />
            </button>
            <button onClick={onTogglePlay} className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 transition-transform duration-150 hover:scale-105 active:scale-95" title={isPlaying ? '暂停' : '播放'}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={onNext} className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 transition-transform duration-150 hover:scale-105 active:scale-95" title="下一首">
              <SkipForward size={18} />
            </button>
          </div>

          {/* 右侧时间/循环/音量（更高更居中、音量条更长更紧凑） */}
          <div className="flex items-center justify-end gap-2 md:gap-2.5 flex-1">
            <div className="hidden md:flex items-center gap-1 text-xs text-text-secondary mr-1">
              <span>{format(currentTime)}</span>
              <span>/</span>
              <span>{format(duration)}</span>
            </div>
            <button onClick={onCycleRepeat} className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 transition-transform duration-150 hover:scale-105 active:scale-95" title={repeatTitle}>
              {renderRepeatIcon()}
            </button>
            <div className="relative" ref={volumeWrapRef}>
              <button onClick={onToggleVolumePanel} className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 transition-transform duration-150 hover:scale-105 active:scale-95" title="音量">
                {renderVolumeIcon()}
              </button>
              {showVolumePanel && (
                <div className="absolute bottom-12 right-0 w-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-md shadow-lg border border-gray-200 dark:border-gray-700 px-1 py-1 z-50">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[11px] text-text-secondary">{Math.round(volume * 100)}%</span>
                    <div className="h-36 flex items-center">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        className="w-24 transform -rotate-90 appearance-none transition-none volume-vertical"
                        onChange={(e) => onChangeVolume(Number(e.target.value))}
                        style={{
                          background: 'linear-gradient(to right, var(--primary, #ef4444) ' + Math.round(volume * 100) + '%, rgba(107,114,128,0.35) ' + Math.round(volume * 100) + '%)',
                          height: '6px',
                          borderRadius: '9999px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
        </div>
        {/* 进度条：纯色 --primary */}
        <div className="absolute left-0 right-0 bottom-0 h-1.5 cursor-pointer rounded-b-lg overflow-hidden" onClick={onSeekByClick}>
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: `${progressPercent}%`,
              background: 'var(--primary)'
            }}
          />
        </div>
      </div>
      <style jsx>{`
        .player-cute-bg {
          background:
            radial-gradient(circle at 12px 12px, rgba(255,255,255,0.18) 0 2px, transparent 2px),
            radial-gradient(circle at 32px 28px, rgba(255,255,255,0.12) 0 1.5px, transparent 1.5px),
            linear-gradient(135deg, var(--secondary), var(--primary));
          background-size: 28px 28px, 36px 36px, cover;
          filter: saturate(1.05);
        }
        .volume-vertical::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: var(--secondary, #6366f1);
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          border: 2px solid white;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.08);
        }
        .volume-vertical::-moz-range-thumb {
          background: var(--secondary, #6366f1);
          width: 14px;
          height: 14px;
          border: 2px solid white;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  )
}
