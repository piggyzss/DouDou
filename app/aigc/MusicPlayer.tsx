"use client"

import { useEffect, useRef, useState } from 'react'

export interface TrackLike {
  id: string
  audioUrl: string
}

interface MusicPlayerProps {
  currentTrackId: string | null
  onCurrentTrackIdChange: (id: string | null) => void
}

export default function MusicPlayer({ currentTrackId, onCurrentTrackIdChange }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [])

  useEffect(() => {
    // parent controls source by dispatching a custom event with url
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ url: string | null; id: string | null }>).detail
      const audio = audioRef.current || new Audio()
      if (!audioRef.current) audioRef.current = audio
      if (!detail || !detail.url || !detail.id) {
        audio.pause()
        onCurrentTrackIdChange(null)
        return
      }
      audio.src = detail.url
      onCurrentTrackIdChange(detail.id)
      audio.play().catch(() => {})
    }
    window.addEventListener('music:play', handler as EventListener)
    return () => window.removeEventListener('music:play', handler as EventListener)
  }, [onCurrentTrackIdChange])

  return <audio ref={audioRef} preload="auto" playsInline className="hidden" />
}
