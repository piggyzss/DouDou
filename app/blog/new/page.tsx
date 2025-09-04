'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

const PRIMARY_BTN = 'inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark disabled:opacity-60 transition-colors font-blog text-sm shadow-sm'
const SECONDARY_BTN = 'inline-flex items-center px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-secondary hover:text-primary transition-colors font-blog text-sm shadow-sm'

export default function NewBlogPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadCover = async (): Promise<string | null> => {
    if (!coverFile) return null
    try {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', coverFile)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('封面上传失败')
      const json = await res.json()
      return json.url as string
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    try {
      setSaving(true)
      setError(null)

      const cover_url = await uploadCover()

      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, tags: tags.split(',').map(t => t.trim()).filter(Boolean), content, cover_url })
      })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      router.push(`/blog/${json.post.slug || json.slug}`)
    } catch (e: any) {
      setError(e.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="w-full py-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-4">新建博客</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">标题</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-bg-secondary outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Slug (可选)</label>
              <input value={slug} onChange={e=>setSlug(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-bg-secondary outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">标签 (逗号分隔)</label>
              <input value={tags} onChange={e=>setTags(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-bg-secondary outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          {/* 封面上传 */}
          <div>
            <label className="block text-sm text-text-muted mb-1">封面图片 (可选)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setCoverFile(file)
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (ev) => setCoverPreview(ev.target?.result as string)
                  reader.readAsDataURL(file)
                } else {
                  setCoverPreview('')
                }
              }}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button type="button" className={PRIMARY_BTN} onClick={() => fileInputRef.current?.click()}>
                选择文件
              </button>
              {coverFile && (
                <span className="text-sm text-text-secondary font-blog">{coverFile.name}</span>
              )}
            </div>
            {coverPreview && (
              <div className="mt-2">
                <img src={coverPreview} alt="封面预览" className="w-48 h-32 object-cover rounded-md border border-gray-200 dark:border-gray-700" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">内容 (Markdown)</label>
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={20} className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-bg-secondary outline-none font-mono text-sm" />
          </div>
          {error && <div className="text-red-500 text-sm mt-4">{error}</div>}
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => router.back()} className={SECONDARY_BTN}>取消</button>
            <button onClick={save} disabled={saving || uploading} className={PRIMARY_BTN}>{saving ? '保存中...' : (uploading ? '上传封面中...' : '保存')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}


