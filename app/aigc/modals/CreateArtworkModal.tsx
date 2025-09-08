"use client"

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (artwork: any) => void
}

export default function CreateArtworkModal({ isOpen, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setTitle('')
    setTags('')
    setImages([])
    setImagePreviews([])
    setError('')
    setIsSubmitting(false)
  }

  useEffect(() => {
    if (!isOpen) {
      // 弹窗关闭时清空表单
      resetForm()
    }
  }, [isOpen])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setImages(prev => [...prev, ...imageFiles])
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => setImagePreviews(prev => [...prev, e.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean)
      const formData = new FormData()
      formData.append('title', title)
      formData.append('tags', tagArray.join(','))
      images.forEach((file) => formData.append('files', file))

      const response = await fetch('/api/aigc/artworks', { method: 'POST', body: formData })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '创建作品集失败')
      }
      const result = await response.json()
      onSubmit({ title, tags: tagArray, images: result.uploadedFiles || [] })
      setTitle('')
      setTags('')
      setImages([])
      setImagePreviews([])
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建作品集失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-text-primary mb-4 font-heading">新建作品集</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">作品集名称</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white" placeholder="请输入作品集名称" required disabled={isSubmitting} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">标签</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white" placeholder="请输入标签，用逗号分隔" disabled={isSubmitting} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">上传图片</label>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isSubmitting} />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting} className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400">点击上传图片</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">支持 JPG, PNG, GIF 等格式</p>
            </button>
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">已上传的图片：</h4>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`预览 ${index + 1}`} className="w-full h-20 object-cover rounded-md" />
                      <button type="button" onClick={() => removeImage(index)} disabled={isSubmitting} className="absolute top-1 right-1 bg-white bg-opacity-80 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { resetForm(); onClose() }} disabled={isSubmitting} className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-text-primary dark:text-white bg-white dark:bg-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-blog disabled:opacity-50 disabled:cursor-not-allowed">取消</button>
            <button type="submit" disabled={isSubmitting || !title.trim()} className="flex-1 px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
              {isSubmitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>上传中...</>) : ('完成')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
