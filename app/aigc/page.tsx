'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Palette, Film, Music4, Heart, MessageCircle, X, ChevronLeft, ChevronRight, Play, SkipBack, SkipForward, Headphones, Trash2, Upload, ImagePlus } from 'lucide-react'

// 统一的日期格式化函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface Artwork {
  id: string
  title: string
  tags: string[]
  images: string[]
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
}

function CreateArtworkModal({ isOpen, onClose, onSubmit }: CreateArtworkModalProps) {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    setImages(prev => [...prev, ...imageFiles])
    
    // 创建预览URL
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    
    // 将文件转换为URL（这里简化处理，实际项目中应该上传到服务器）
    const imageUrls = imagePreviews
    
    onSubmit({
      title,
      tags: tagArray,
      images: imageUrls
    })
    
    // Reset form
    setTitle('')
    setTags('')
    setImages([])
    setImagePreviews([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-text-primary mb-4 font-heading">新建作品集</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              作品集名称
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              placeholder="请输入作品集名称"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              标签
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              placeholder="请输入标签，用逗号分隔"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              上传图片
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700"
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400">点击上传图片</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">支持 JPG, PNG, GIF 等格式</p>
            </button>
            
            {/* 图片预览 */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">已上传的图片：</h4>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`预览 ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white bg-opacity-80 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-text-primary dark:text-white bg-white dark:bg-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-blog"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
            >
              完成
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function CreateMusicModal({ isOpen, onClose, onSubmit }: CreateMusicModalProps) {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file)
    }
  }

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCover = () => {
    setCoverFile(null)
    setCoverPreview('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    
    // 这里简化处理，实际项目中应该上传到服务器
    const audioUrl = audioFile ? URL.createObjectURL(audioFile) : ''
    const coverUrl = coverPreview
    
    onSubmit({
      title,
      tags: tagArray,
      audioUrl,
      coverUrl
    })
    
    // Reset form
    setTitle('')
    setTags('')
    setAudioFile(null)
    setCoverFile(null)
    setCoverPreview('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-text-primary mb-4 font-heading">新建音乐</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              作品名称
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              placeholder="请输入作品名称"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              标签
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              placeholder="请输入标签，用逗号分隔"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              上传音频文件
            </label>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700"
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {audioFile ? audioFile.name : '点击上传音频文件'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">支持 MP3, WAV, FLAC 等格式</p>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              上传封面图片
            </label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700"
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {coverFile ? coverFile.name : '点击上传封面图片'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">支持 JPG, PNG, GIF 等格式</p>
            </button>
            
            {/* 封面预览 */}
            {coverPreview && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">封面预览：</h4>
                <div className="relative inline-block">
                  <img
                    src={coverPreview}
                    alt="封面预览"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={removeCover}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-text-primary dark:text-white bg-white dark:bg-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-blog"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
            >
              完成
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function CreateVideoModal({ isOpen, onClose, onSubmit }: CreateVideoModalProps) {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const videoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
    }
  }

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCover = () => {
    setCoverFile(null)
    setCoverPreview('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    
    // 这里简化处理，实际项目中应该上传到服务器
    const videoUrl = videoFile ? URL.createObjectURL(videoFile) : ''
    const coverUrl = coverPreview
    
    onSubmit({
      title,
      tags: tagArray,
      videoUrl,
      coverUrl
    })
    
    // Reset form
    setTitle('')
    setTags('')
    setVideoFile(null)
    setCoverFile(null)
    setCoverPreview('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-text-primary mb-4 font-heading">新建视频</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              作品名称
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              placeholder="请输入作品名称"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              标签
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              placeholder="请输入标签，用逗号分隔"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              上传视频文件
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700"
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {videoFile ? videoFile.name : '点击上传视频文件'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">支持 MP4, AVI, MOV 等格式</p>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              上传封面图片
            </label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700"
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {coverFile ? coverFile.name : '点击上传封面图片'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">支持 JPG, PNG, GIF 等格式</p>
            </button>
            
            {/* 封面预览 */}
            {coverPreview && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">封面预览：</h4>
                <div className="relative inline-block">
                  <img
                    src={coverPreview}
                    alt="封面预览"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={removeCover}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-text-primary dark:text-white bg-white dark:bg-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-blog"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
            >
              完成
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function AddImageModal({ isOpen, onClose, onSubmit, artworkTitle, artworkTags }: AddImageModalProps) {
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    setImages(prev => [...prev, ...imageFiles])
    
    // 创建预览URL
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 将文件转换为URL（这里简化处理，实际项目中应该上传到服务器）
    const imageUrls = imagePreviews
    
    onSubmit(imageUrls)
    
    // Reset form
    setImages([])
    setImagePreviews([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-text-primary mb-4 font-heading">添加图片</h2>
        
        {/* 作品集信息（只读） */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="mb-2">
            <label className="block text-sm font-medium text-text-primary mb-1 font-body">
              作品集名称
            </label>
            <p className="text-sm text-text-secondary font-body">{artworkTitle}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1 font-body">
              标签
            </label>
            <div className="flex flex-wrap gap-1">
              {artworkTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-text-secondary text-xs font-blog"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              上传图片
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700"
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400">点击上传图片</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">支持 JPG, PNG, GIF 等格式</p>
            </button>
            
            {/* 图片预览 */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">已上传的图片：</h4>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`预览 ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white bg-opacity-80 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-text-primary dark:text-white bg-white dark:bg-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-blog"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
            >
              完成
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function AIGCPage() {
  const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'music'>('images')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false)
  const [selectedArtworkForAdd, setSelectedArtworkForAdd] = useState<Artwork | null>(null)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    artworkId: string
    imageIndex: number
  } | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([
    {
      id: '1',
      title: '城市印象系列',
      tags: ['城市', '建筑', '现代'],
      images: [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
      ],
      likes: 16400,
      comments: 314,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: '自然风光集',
      tags: ['自然', '风景', '山水'],
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
      ],
      likes: 12800,
      comments: 256,
      createdAt: '2024-01-10'
    }
  ])

  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([
    {
      id: '1',
      title: '夜空中最亮的星',
      tags: ['流行', '民谣', '温暖'],
      audioUrl: 'https://example.com/music1.mp3',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      duration: 240,
      likes: 12800,
      comments: 456,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: '春风十里',
      tags: ['民谣', '清新', '春天'],
      audioUrl: 'https://example.com/music2.mp3',
      coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
      duration: 195,
      likes: 9600,
      comments: 234,
      createdAt: '2024-01-12'
    },
    {
      id: '3',
      title: '海阔天空',
      tags: ['摇滚', '经典', '励志'],
      audioUrl: 'https://example.com/music3.mp3',
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
      duration: 326,
      likes: 15200,
      comments: 678,
      createdAt: '2024-01-10'
    },
    {
      id: '4',
      title: '小幸运',
      tags: ['流行', '电影', '青春'],
      audioUrl: 'https://example.com/music4.mp3',
      coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
      duration: 218,
      likes: 8900,
      comments: 345,
      createdAt: '2024-01-08'
    }
  ])

  const [videoTracks, setVideoTracks] = useState<VideoTrack[]>([
    {
      id: '1',
      title: '城市夜景延时摄影',
      tags: ['延时摄影', '城市', '夜景'],
      videoUrl: 'https://example.com/video1.mp4',
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
      videoUrl: 'https://example.com/video2.mp4',
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
      videoUrl: 'https://example.com/video3.mp4',
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
      videoUrl: 'https://example.com/video4.mp4',
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

  const handleCreateArtwork = (artworkData: Omit<Artwork, 'id' | 'likes' | 'comments' | 'createdAt'>) => {
    const newArtwork: Artwork = {
      ...artworkData,
      id: Date.now().toString(),
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setArtworks([newArtwork, ...artworks])
  }

  const handleCreateMusic = (musicData: Omit<MusicTrack, 'id' | 'likes' | 'comments' | 'createdAt' | 'duration'>) => {
    const newMusic: MusicTrack = {
      ...musicData,
      id: Date.now().toString(),
      likes: 0,
      comments: 0,
      duration: 0, // 实际应用中可以通过音频文件获取
      createdAt: new Date().toISOString().split('T')[0]
    }
    setMusicTracks([newMusic, ...musicTracks])
  }

  const handleDeleteArtwork = (artworkId: string) => {
    setArtworks(artworks.filter(artwork => artwork.id !== artworkId))
  }

  const handleDeleteMusic = (musicId: string) => {
    setMusicTracks(musicTracks.filter(music => music.id !== musicId))
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
      url: artwork.images[newIndex],
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

  const handleAddImages = (artworkId: string, newImages: string[]) => {
    setArtworks(prev => prev.map(artwork => 
      artwork.id === artworkId 
        ? { ...artwork, images: [...artwork.images, ...newImages] }
        : artwork
    ))
  }

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
              {artworks.map((artwork) => (
                <div key={artwork.id} className="mb-12 relative group">
                  {/* 删除按钮 - 仅在开发模式下显示 */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="absolute top-0 right-0 flex gap-2 group/delete">
                      <button
                        onClick={() => {
                          setSelectedArtworkForAdd(artwork)
                          setIsAddImageModalOpen(true)
                        }}
                        className="p-2 bg-blue-500 text-white rounded-full opacity-0 group-hover/delete:opacity-100 transition-opacity duration-300 hover:bg-blue-600 z-10"
                        title="添加图片"
                      >
                        <ImagePlus size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteArtwork(artwork.id)}
                        className="p-2 bg-red-500 text-white rounded-full opacity-0 group-hover/delete:opacity-100 transition-opacity duration-300 hover:bg-red-600 z-10"
                        title="删除作品集"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  
                  {/* 作品集信息 */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-text-primary mb-2 font-heading">{artwork.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {artwork.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <time>{formatDate(artwork.createdAt)}</time>
                      <span>·</span>
                      <span>{artwork.images.length} 张图片</span>
                    </div>
                  </div>

                  {/* 作品展示区域 */}
                  <div className="overflow-x-auto custom-scrollbar">
                    <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                      {artwork.images.map((image, index) => (
                        <div key={index} className="relative group flex-shrink-0">
                          <div 
                            className="w-80 h-60 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => setSelectedImage({
                              url: image,
                              artworkId: artwork.id,
                              imageIndex: index
                            })}
                          >
                            <img
                              src={image}
                              alt={`${artwork.title} - 图片 ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          
                          {/* 交互按钮 */}
                          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-90 transition-opacity duration-300">
                            <button className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                              <Heart size={16} className="text-gray-700" />
                            </button>
                            <button className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                              <MessageCircle size={16} className="text-gray-700" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 统计信息 */}
                  <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-text-muted font-blog">
                      <Heart size={16} />
                      <span>{formatNumber(artwork.likes)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted font-blog">
                      <MessageCircle size={16} />
                      <span>{artwork.comments}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'videos' && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {videoTracks.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-unified group hover:shadow-xl transition-all duration-300 relative"
                >
                  {/* 删除按钮 - 仅在开发模式下显示 */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="absolute top-2 right-2 w-8 h-8 group/delete">
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover/delete:opacity-100 transition-opacity duration-300 hover:bg-red-600 z-10"
                        title="删除视频"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  
                  {/* 视频封面区域 */}
                  <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    {video.coverUrl ? (
                      <img
                        src={video.coverUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={48} className="text-gray-400" />
                      </div>
                    )}
                    
                    {/* 播放控制按钮 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-90 transition-opacity duration-300">
                        <button className="p-3 bg-primary bg-opacity-90 rounded-full shadow-lg hover:bg-primary-dark transition-colors">
                          <Play size={20} className="text-white" />
                        </button>
                      </div>
                    </div>

                    {/* 播放进度条信息 */}
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-90 transition-opacity duration-300">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-1">
                        <div className="bg-primary h-1 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-white font-blog">
                        <span>0:00</span>
                        <span>{formatDuration(video.duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 视频信息区域 */}
                  <div className="p-2">
                    {/* 标题 */}
                    <h3 className="text-base font-semibold text-text-primary font-heading line-clamp-1 mb-2">
                      {video.title}
                    </h3>
                    
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {video.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* 统计信息和操作 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-text-muted font-blog">
                        <div className="flex items-center gap-1">
                          <Heart size={12} />
                          <span>{formatNumber(video.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          <span>{video.comments}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-text-muted font-blog">
                        <time>{formatDate(video.createdAt)}</time>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'music' && (
            <motion.div
              key="music"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {musicTracks.map((track) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-unified group hover:shadow-xl transition-all duration-300 relative"
                >
                  {/* 删除按钮 - 仅在开发模式下显示 */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="absolute top-2 right-2 w-8 h-8 group/delete">
                      <button
                        onClick={() => handleDeleteMusic(track.id)}
                        className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover/delete:opacity-100 transition-opacity duration-300 hover:bg-red-600 z-10"
                        title="删除音乐"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  {/* 磁带封面区域 */}
                  <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Headphones size={48} className="text-gray-400" />
                      </div>
                    )}
                    
                    {/* 播放控制按钮 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-90 transition-opacity duration-300">
                        <button className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                          <SkipBack size={16} className="text-gray-700" />
                        </button>
                        <button className="p-3 bg-primary bg-opacity-90 rounded-full shadow-lg hover:bg-primary-dark transition-colors">
                          <Headphones size={20} className="text-white" />
                        </button>
                        <button className="p-2 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                          <SkipForward size={16} className="text-gray-700" />
                        </button>
                      </div>
                    </div>

                    {/* 播放进度条信息 */}
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-90 transition-opacity duration-300">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-1">
                        <div className="bg-primary h-1 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-white font-blog">
                        <span>0:00</span>
                        <span>{formatDuration(track.duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 音乐信息区域 */}
                  <div className="p-2">
                    {/* 标题 */}
                    <h3 className="text-base font-semibold text-text-primary font-heading line-clamp-1 mb-2">
                      {track.title}
                    </h3>
                    
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {track.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* 统计信息和操作 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-text-muted font-blog">
                        <div className="flex items-center gap-1">
                          <Heart size={12} />
                          <span>{formatNumber(track.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          <span>{track.comments}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-text-muted font-blog">
                        <time>{formatDate(track.createdAt)}</time>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
        onSubmit={(newImages) => {
          if (selectedArtworkForAdd) {
            handleAddImages(selectedArtworkForAdd.id, newImages)
          }
        }}
        artworkTitle={selectedArtworkForAdd?.title || ''}
        artworkTags={selectedArtworkForAdd?.tags || []}
      />

      {/* 图片放大弹窗 */}
      {selectedImage && (() => {
        const artwork = artworks.find(a => a.id === selectedImage.artworkId)
        const hasMultipleImages = artwork && artwork.images.length > 1
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative max-w-4xl max-h-full mx-4">
              {/* 关闭按钮 */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors text-2xl font-bold z-10"
              >
                ×
              </button>
              
              {/* 图片计数器 */}
              {hasMultipleImages && (
                <div className="absolute -top-10 left-0 text-white text-sm">
                  {selectedImage.imageIndex + 1} / {artwork!.images.length}
                </div>
              )}
              
              {/* 主图片 */}
              <img
                src={selectedImage.url}
                alt="放大图片"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              {/* 左右切换按钮 */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}