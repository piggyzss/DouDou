"use client"

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (video: any) => void
}

export default function CreateVideoModal({ isOpen, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
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
      reader.onload = (e) => setCoverPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeCover = () => {
    setCoverFile(null)
    setCoverPreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      if (!title.trim()) throw new Error('请输入作品名称')
      if (!videoFile) throw new Error('请上传视频文件')

      const form = new FormData()
      form.append('title', title.trim())
      form.append('tags', tags)
      form.append('video', videoFile)
      if (coverFile) form.append('cover', coverFile)

      const res = await fetch('/api/aigc/videos', { method: 'POST', body: form })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || '创建视频失败')
      }
      const data = await res.json()

      // 通知上层刷新列表
      onSubmit(data.data)

      // 清理状态并关闭
      setTitle('')
      setTags('')
      setVideoFile(null)
      setCoverFile(null)
      setCoverPreview('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建视频失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-800 rounded p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-text-primary mb-4 font-heading">新建视频</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">作品名称</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white" placeholder="请输入作品名称" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">标签</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-700 text-text-primary dark:text-white" placeholder="请输入标签，用逗号分隔" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">上传视频文件</label>
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
            <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700">
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400">{videoFile ? videoFile.name : '点击上传视频文件'}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">支持 MP4, AVI, MOV 等格式</p>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 font-body">上传封面图片</label>
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <button type="button" onClick={() => coverInputRef.current?.click()} className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700">
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400">{coverFile ? coverFile.name : '点击上传封面图片'}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">支持 JPG, PNG, GIF 等格式</p>
            </button>
            {coverPreview && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">封面预览：</h4>
                <div className="relative inline-block">
                  <img src={coverPreview} alt="封面预览" className="w-32 h-32 object-cover rounded-md" />
                  <button type="button" onClick={removeCover} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-text-primary dark:text-white bg-white dark:bg-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-blog disabled:opacity-50 disabled:cursor-not-allowed">取消</button>
            <button type="submit" disabled={isSubmitting || !title.trim() || !videoFile} className="flex-1 px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary-dark transition-colors font-blog disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
              {isSubmitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>上传中...</>) : ('完成')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
