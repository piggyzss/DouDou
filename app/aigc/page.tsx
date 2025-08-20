'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Image, Video, Music, Heart, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Artwork {
  id: string
  title: string
  tags: string[]
  images: string[]
  likes: number
  comments: number
  createdAt: string
}

interface CreateArtworkModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (artwork: Omit<Artwork, 'id' | 'likes' | 'comments' | 'createdAt'>) => void
}

function CreateArtworkModal({ isOpen, onClose, onSubmit }: CreateArtworkModalProps) {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [images, setImages] = useState<string[]>([''])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    const imageArray = images.filter(img => img.trim())
    
    onSubmit({
      title,
      tags: tagArray,
      images: imageArray
    })
    
    // Reset form
    setTitle('')
    setTags('')
    setImages([''])
    onClose()
  }

  const addImageField = () => {
    setImages([...images, ''])
  }

  const updateImage = (index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = value
    setImages(newImages)
  }

  const removeImage = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index))
    }
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 placeholder:font-light"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 placeholder:font-light"
              placeholder="请输入标签，用逗号分隔"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">
              图片地址
            </label>
            {images.map((image, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 placeholder:font-light"
                  placeholder="请输入图片URL"
                  required
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-body text-sm"
            >
              <Plus size={16} />
              添加图片
            </button>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-md border border-primary text-primary bg-white text-sm hover:bg-gray-50 transition-colors font-blog"
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

  const tabs = [
    { id: 'images', label: '图片', icon: Image },
    { id: 'videos', label: '视频', icon: Video },
    { id: 'music', label: '音乐', icon: Music }
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

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toString()
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

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4 font-heading">AIGC作品</h1>
          <p className="text-xl text-text-secondary font-body">AI生成的创意作品画廊</p>
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
                      : 'bg-gray-100 dark:bg-gray-800 text-text-secondary hover:text-text-primary'
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

        {/* 新建作品集按钮 - 仅在开发模式下显示 */}
        {process.env.NODE_ENV === 'development' && activeTab === 'images' && (
          <div className="mb-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog"
            >
              新建作品集
            </button>
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
                <div key={artwork.id} className="mb-12">
                  {/* 作品集信息 */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-text-primary mb-2 font-heading">{artwork.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {artwork.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-bg-secondary text-text-secondary text-xs font-blog"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-muted font-blog">
                      <time>{new Date(artwork.createdAt).toLocaleDateString()}</time>
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
                          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <Heart size={16} className="text-red-500" />
                            </button>
                            <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <MessageCircle size={16} className="text-blue-500" />
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
              className="text-center py-20"
            >
              <Video size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-text-muted font-body">视频展示模块正在开发中...</p>
            </motion.div>
          )}

          {activeTab === 'music' && (
            <motion.div
              key="music"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center py-20"
            >
              <Music size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-text-muted font-body">音乐展示模块正在开发中...</p>
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