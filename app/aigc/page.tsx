'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Palette, Film, Music4, Heart, MessageCircle, X, ChevronLeft, ChevronRight, Play, SkipBack, SkipForward, Headphones, Trash2, Upload, ImagePlus } from 'lucide-react'
import LikeToggle from '@/app/components/LikeToggle'
import ConfirmModal from './ConfirmModal'
import CreateArtworkModal from './modals/CreateArtworkModal'
import CreateMusicModal from './modals/CreateMusicModal'
import CreateVideoModal from './modals/CreateVideoModal'
import AddImageModal from './modals/AddImageModal'
import ImagePreview from './components/ImagePreview'
import FloatingPlayerBar from './components/FloatingPlayerBar'
import ImagesSection from './sections/ImagesSection'
import VideosSection from './sections/VideosSection'
import MusicSection from './sections/MusicSection'

// 统一的日期格式化函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface ArtworkImage {
  id: number
  file_url: string
  original_name: string
  file_size?: number
  width?: number
  height?: number
  mime_type?: string
  created_at: string
}

interface Artwork {
  id: string
  title: string
  tags: string[]
  images: ArtworkImage[]
  likes: number
  comments: number
  createdAt: string
}

interface MusicTrack {
  id: string
  title: string
  tags: string[]
  audioUrl: string
  coverUrl: string
  duration: number
  likes: number
  comments: number
  createdAt: string
}

interface VideoTrack {
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

interface CreateArtworkModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (artwork: Omit<Artwork, 'id' | 'likes' | 'comments' | 'createdAt'>) => void
}

interface CreateMusicModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (music: Omit<MusicTrack, 'id' | 'likes' | 'comments' | 'createdAt' | 'duration'>) => void
}

interface CreateVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (video: Omit<VideoTrack, 'id' | 'likes' | 'comments' | 'createdAt' | 'duration'>) => void
}

interface AddImageModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (images: string[]) => void
  artworkTitle: string
  artworkTags: string[]
  artworkId?: string
}

export default function AIGCPage() {
  const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'music'>('images')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false)
  const [selectedArtworkForAdd, setSelectedArtworkForAdd] = useState<Artwork | null>(null)
  
  // 确认弹窗状态
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  })
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    artworkId: string
    imageIndex: number
  } | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)

  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([])

  const [videoTracks, setVideoTracks] = useState<VideoTrack[]>([
    {
      id: '1',
      title: '城市夜景延时摄影',
      tags: ['延时摄影', '城市', '夜景'],
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=400&fit=crop',
      duration: 180,
      likes: 8900,
      comments: 234,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: '自然风光航拍',
      tags: ['航拍', '自然', '风景'],
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      duration: 240,
      likes: 7600,
      comments: 189,
      createdAt: '2024-01-12'
    },
    {
      id: '3',
      title: '创意动画短片',
      tags: ['动画', '创意', '短片'],
      videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1518700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
      duration: 120,
      likes: 11200,
      comments: 456,
      createdAt: '2024-01-10'
    },
    {
      id: '4',
      title: '生活记录片段',
      tags: ['生活', '记录', '日常'],
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      duration: 90,
      likes: 5400,
      comments: 123,
      createdAt: '2024-01-08'
    }
  ])

  const tabs = [
    { id: 'images', label: '图片', icon: Palette },
    { id: 'videos', label: '视频', icon: Film },
    { id: 'music', label: '音乐', icon: Music4 }
  ] as const

  // 加载作品集数据
  const loadArtworks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/aigc/artworks')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.collections) {
          // 转换数据格式以匹配前端接口
          const convertedArtworks: Artwork[] = data.data.collections.map((collection: any) => ({
            id: collection.id.toString(),
            title: collection.title,
            tags: collection.tags || [],
            images: collection.images || [], // 这里images是ArtworkImage[]格式
            likes: collection.likes_count || 0,
            comments: 0, // 暂时设为0，后续可以添加评论功能
            createdAt: collection.created_at.split('T')[0]
          }))
          
          // 为所有图片生成代理URL
          const artworksWithProxyUrls = convertedArtworks.map((artwork) => {
            if (artwork.images.length > 0) {
              const proxyImages = artwork.images.map((image) => {
                // 将COS URL转换为代理URL，同时保留图片的其他信息
                return {
                  ...image,
                  file_url: `/api/aigc/proxy-image?url=${encodeURIComponent(image.file_url)}`
                }
              })
              return { ...artwork, images: proxyImages }
            }
            return artwork
          })
          
          setArtworks(artworksWithProxyUrls)
        }
      }
    } catch (error) {
      console.error('加载作品集失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时获取数据
  useEffect(() => {
    loadArtworks()
    loadMusic()
  }, [])

  const handleCreateArtwork = (artworkData: Omit<Artwork, 'id' | 'likes' | 'comments' | 'createdAt'>) => {
    // 创建成功后重新加载数据
    loadArtworks()
    
    // 显示成功消息
    console.log('✅ 作品集创建成功:', artworkData.title)
  }

  // 加载音乐列表
  const loadMusic = async () => {
    try {
      const res = await fetch('/api/aigc/music')
      if (!res.ok) return
      const data = await res.json()
      if (!data.success || !data.data?.tracks) return
      const tracks: MusicTrack[] = data.data.tracks.map((t: any) => ({
        id: String(t.id),
        title: t.title,
        tags: t.tags || [],
        audioUrl: `/api/aigc/proxy-audio?url=${encodeURIComponent(t.audio_url)}`,
        coverUrl: t.cover_url ? `/api/aigc/proxy-image?url=${encodeURIComponent(t.cover_url)}` : '',
        duration: t.duration || 0,
        likes: t.likes_count || 0,
        comments: 0,
        createdAt: (t.created_at || '').split('T')[0] || ''
      }))
      setMusicTracks(tracks)
    } catch (e) {
      console.error('加载音乐失败:', e)
    }
  }

  const handleCreateMusic = (_musicData: Omit<MusicTrack, 'id' | 'likes' | 'comments' | 'createdAt' | 'duration'>) => {
    // 后端已落库并上传COS，直接重新拉取列表
    loadMusic()
  }

  // 删除单张图片
  const handleDeleteImage = async (collectionId: string, imageId: number) => {
    try {
      const response = await fetch(`/api/aigc/artworks/${collectionId}/images/${imageId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // 从本地状态中移除图片
        setArtworks(prev => prev.map(artwork => 
          artwork.id === collectionId 
            ? { ...artwork, images: artwork.images.filter(img => img.id !== imageId) }
            : artwork
        ))
        console.log('✅ 图片删除成功')
      } else {
        const errorData = await response.json()
        console.error('❌ 图片删除失败:', errorData.error)
      }
    } catch (error) {
      console.error('❌ 删除图片失败:', error)
    }
  }

  // 删除整个作品集
  const handleDeleteArtwork = async (artworkId: string) => {
    setConfirmModal({
      isOpen: true,
      title: '删除作品集',
      message: '确定要删除这个作品集吗？这将删除所有相关的图片，此操作无法撤销。',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/aigc/artworks/${artworkId}`, {
            method: 'DELETE',
          })
          
          if (response.ok) {
            // 从本地状态中移除作品集
            setArtworks(prev => prev.filter(artwork => artwork.id !== artworkId))
            console.log('✅ 作品集删除成功')
          } else {
            const errorData = await response.json()
            console.error('❌ 作品集删除失败:', errorData.error)
          }
        } catch (error) {
          console.error('❌ 删除作品集失败:', error)
        }
      },
      type: 'danger'
    })
  }

  const handleUpdateArtworkLikes = (artworkId: string, newCount: number) => {
    setArtworks(prev => prev.map(a => a.id === artworkId ? { ...a, likes: newCount } : a))
  }

  const handleDeleteMusic = async (id: string) => {
    try {
      const res = await fetch(`/api/aigc/music/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        console.error('删除音乐失败')
        return
      }
      setMusicTracks(prev => prev.filter(t => t.id !== id))
    } catch (e) {
      console.error('删除音乐接口异常:', e)
    }
  }

  const handleCreateVideo = (videoData: Omit<VideoTrack, 'id' | 'likes' | 'comments' | 'createdAt' | 'duration'>) => {
    const newVideo: VideoTrack = {
      ...videoData,
      id: Date.now().toString(),
      likes: 0,
      comments: 0,
      duration: 0, // 实际应用中可以通过视频文件获取
      createdAt: new Date().toISOString().split('T')[0]
    }
    setVideoTracks([newVideo, ...videoTracks])
  }

  const handleDeleteVideo = (videoId: string) => {
    setVideoTracks(videoTracks.filter(video => video.id !== videoId))
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toString()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return
    
    const artwork = artworks.find(a => a.id === selectedImage.artworkId)
    if (!artwork) return
    
    let newIndex = selectedImage.imageIndex
    if (direction === 'prev') {
      newIndex = newIndex > 0 ? newIndex - 1 : artwork.images.length - 1
    } else {
      newIndex = newIndex < artwork.images.length - 1 ? newIndex + 1 : 0
    }
    
    setSelectedImage({
      url: artwork.images[newIndex].file_url,
      artworkId: selectedImage.artworkId,
      imageIndex: newIndex
    })
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedImage) return
    
    if (e.key === 'ArrowLeft') {
      navigateImage('prev')
    } else if (e.key === 'ArrowRight') {
      navigateImage('next')
    } else if (e.key === 'Escape') {
      setSelectedImage(null)
    }
  }

  // 添加键盘事件监听
  useEffect(() => {
    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedImage])

  const handleAddImages = async (artworkId: string, newImages: string[]) => {
    try {
      // 调用API添加图片到数据库
      const response = await fetch(`/api/aigc/artworks/${artworkId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: newImages })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ 图片添加成功:', result)
        
        // 重新加载作品集数据以获取最新的图片信息
        await loadArtworks()
      } else {
        const errorData = await response.json()
        console.error('❌ 图片添加失败:', errorData.error)
      }
    } catch (error) {
      console.error('❌ 添加图片失败:', error)
    }
  }

  // 音乐播放（最小可用实现）
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [repeatMode, setRepeatMode] = useState<'one' | 'all' | 'shuffle'>('all')
  const [showVolumePanel, setShowVolumePanel] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    const onPlay = () => setIsAudioPlaying(true)
    const onPause = () => setIsAudioPlaying(false)
    const onLoadedMeta = () => setDuration(audio.duration || 0)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('loadedmetadata', onLoadedMeta)
    audio.addEventListener('timeupdate', onTimeUpdate)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('loadedmetadata', onLoadedMeta)
      audio.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [])

  const togglePlayTrack = (track: MusicTrack) => {
    const audio = audioRef.current
    if (!audio) return
    if (currentTrackId !== track.id) {
      audio.src = track.audioUrl
      setCurrentTrackId(track.id)
      audio.play().catch(() => {})
      return
    }
    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }

  const findCurrentIndex = () => musicTracks.findIndex(t => t.id === currentTrackId)
  const handlePrev = () => {
    const idx = findCurrentIndex()
    if (idx <= 0) return
    togglePlayTrack(musicTracks[idx - 1])
  }
  const handleNext = () => {
    const idx = findCurrentIndex()
    if (idx < 0 || idx >= musicTracks.length - 1) return
    togglePlayTrack(musicTracks[idx + 1])
  }

  const handleSeekByClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    audio.currentTime = ratio * duration
    setCurrentTime(audio.currentTime)
  }

  const cycleRepeat = () => {
    setRepeatMode(prev => (prev === 'all' ? 'one' : prev === 'one' ? 'shuffle' : 'all'))
  }

  const onChangeVolume = (v: number) => {
    const audio = audioRef.current
    const vol = Math.min(Math.max(v, 0), 1)
    setVolume(vol)
    if (audio) audio.volume = vol
  }

  // 兼容模块事件：让 MusicSection 触发的播放事件驱动页面级播放器
  useEffect(() => {
    const onPlayEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; url: string }>).detail
      if (!detail || !detail.id) return
      const t = musicTracks.find(x => x.id === detail.id)
      if (t) togglePlayTrack(t)
    }
    window.addEventListener('music:play', onPlayEvent as EventListener)
    return () => window.removeEventListener('music:play', onPlayEvent as EventListener)
  }, [musicTracks, currentTrackId])

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary font-heading">AIGC作品</h1>
          <p className="text-text-secondary mt-1 font-blog">AI生成的创意作品画廊</p>
        </div>

        {/* Tab导航 */}
        <div className="flex justify-start mb-8">
          <div className="flex space-x-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-text-secondary hover:text-text-primary'
                  }`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={20} />
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* 新建按钮 - 仅在开发模式下显示 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6">
            {activeTab === 'images' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
              >
                新建作品集
              </button>
            )}
            {activeTab === 'music' && (
              <button
                onClick={() => setIsMusicModalOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
              >
                新建音乐
              </button>
            )}
            {activeTab === 'videos' && (
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
              >
                新建视频
              </button>
            )}
          </div>
        )}

        {/* 内容区域 */}
        <AnimatePresence mode="wait">
          {activeTab === 'images' && (
            <motion.div
              key="images"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <ImagesSection
                artworks={artworks}
                loading={loading}
                onAddImages={(artwork) => { setSelectedArtworkForAdd(artwork); setIsAddImageModalOpen(true) }}
                onDeleteArtwork={handleDeleteArtwork}
                onClickImage={(artworkId, index, url) => setSelectedImage({ url, artworkId, imageIndex: index })}
                onDeleteImage={handleDeleteImage}
                onUpdateArtworkLikes={handleUpdateArtworkLikes}
                formatDate={formatDate}
                formatNumber={formatNumber}
              />
            </motion.div>
          )}

          {activeTab === 'videos' && (
            <motion.div key="videos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <VideosSection videos={videoTracks} formatDate={formatDate} formatNumber={formatNumber} />
            </motion.div>
          )}

          {activeTab === 'music' && (
            <motion.div key="music" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <MusicSection
                tracks={musicTracks}
                currentTrackId={currentTrackId}
                setCurrentTrackId={setCurrentTrackId}
                isAudioPlaying={isAudioPlaying}
                formatDuration={formatDuration}
                formatNumber={formatNumber}
                formatDate={formatDate}
                onDeleteMusic={handleDeleteMusic}
                onUpdateMusicLikes={(id, count) => setMusicTracks(prev => prev.map(t => t.id === id ? { ...t, likes: count } : t))}
              />
            </motion.div>
          )}
        </AnimatePresence>
                    </div>

      {/* 底部悬浮播放器（完整版） */}
      <AnimatePresence mode="wait" initial={false}>
        {currentTrackId && (() => {
          const track = musicTracks.find(t => t.id === currentTrackId)
          if (!track) return null
          return (
            <motion.div
              className="fixed inset-x-0 bottom-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <FloatingPlayerBar
                title={track.title}
                tags={track.tags}
                coverUrl={track.coverUrl}
                likes={track.likes}
                isPlaying={isAudioPlaying}
                currentTime={currentTime}
                duration={duration}
                repeatMode={repeatMode}
                volume={volume}
                showVolumePanel={showVolumePanel}
                onPrev={handlePrev}
                onNext={handleNext}
                onTogglePlay={() => togglePlayTrack(track)}
                onCycleRepeat={cycleRepeat}
                onSeekByClick={handleSeekByClick}
                onToggleVolumePanel={() => setShowVolumePanel(v=>!v)}
                onChangeVolume={onChangeVolume}
                onClose={() => {
                  const audio = audioRef.current
                  if (audio) audio.pause()
                  setCurrentTrackId(null)
                }}
              />
                </motion.div>
          )
        })()}
        </AnimatePresence>

      {/* 新建作品集弹窗 */}
      <CreateArtworkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateArtwork}
      />

      {/* 新建音乐弹窗 */}
      <CreateMusicModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSubmit={handleCreateMusic}
      />

      {/* 新建视频弹窗 */}
      <CreateVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSubmit={handleCreateVideo}
      />

      {/* 添加图片弹窗 */}
      <AddImageModal
        isOpen={isAddImageModalOpen}
        onClose={() => {
          setIsAddImageModalOpen(false)
          setSelectedArtworkForAdd(null)
        }}
        onSubmit={(newImages: string[]) => {
          if (selectedArtworkForAdd) {
            handleAddImages(selectedArtworkForAdd.id, newImages)
          }
        }}
        artworkTitle={selectedArtworkForAdd?.title || ''}
        artworkTags={selectedArtworkForAdd?.tags || []}
        artworkId={selectedArtworkForAdd?.id || ''}
      />

      <ImagePreview
        isOpen={!!selectedImage}
        imageUrl={selectedImage?.url || ''}
        hasPrev={!!(selectedImage && artworks.find(a => a.id === selectedImage.artworkId)?.images.length && (artworks.find(a => a.id === selectedImage.artworkId)!.images.length > 1))}
        hasNext={!!(selectedImage && artworks.find(a => a.id === selectedImage.artworkId)?.images.length && (artworks.find(a => a.id === selectedImage.artworkId)!.images.length > 1))}
        onClose={() => setSelectedImage(null)}
        onPrev={() => navigateImage('prev')}
        onNext={() => navigateImage('next')}
        currentIndex={selectedImage?.imageIndex}
        total={artworks.find(a => a.id === selectedImage?.artworkId)?.images.length || 0}
      />
      
      {/* 确认弹窗 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
      {/* 隐藏音频元素用于播放 */}
      <audio ref={audioRef} preload="auto" playsInline className="hidden" />
    </div>
  )
}