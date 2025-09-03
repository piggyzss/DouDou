'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function EditBlogPage() {
  const { slug } = useParams() as { slug: string }
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/blog/${slug}`)
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        setTitle(json.frontmatter.title || '')
        setTags((json.frontmatter.tags || []).join(','))
        setContent(json.content || '')
      } catch (e: any) {
        setError(e.message || '加载失败')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const save = async () => {
    try {
      setSaving(true)
      setError(null)
      const res = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, tags: tags.split(',').map(t => t.trim()).filter(Boolean), content })
      })
      if (!res.ok) throw new Error(await res.text())
      router.push(`/blog/${slug}`)
    } catch (e: any) {
      setError(e.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen pt-16"><div className="w-full py-8 text-text-secondary font-blog">Loading...</div></div>

  return (
    <div className="min-h-screen pt-16">
      <div className="w-full py-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-4 font-blog">编辑博客</h1>
        
        {/* 保存按钮移到标题下方 */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-3">
            <button 
              onClick={save} 
              disabled={saving} 
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark disabled:opacity-60 transition-colors font-blog text-sm"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <button 
              onClick={() => router.push(`/blog/${slug}`)}
              className="inline-flex items-center px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-secondary hover:text-primary transition-colors font-blog text-sm"
            >
              取消
            </button>
          </div>
          {error && <div className="text-red-500 text-sm font-blog">{error}</div>}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1 font-blog">标题</label>
            <input 
              value={title} 
              onChange={e=>setTitle(e.target.value)} 
              className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-bg-secondary outline-none focus:ring-2 focus:ring-primary font-blog" 
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1 font-blog">标签 (逗号分隔)</label>
            <input 
              value={tags} 
              onChange={e=>setTags(e.target.value)} 
              className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-bg-secondary outline-none focus:ring-2 focus:ring-primary font-blog" 
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1 font-blog">内容 (Markdown)</label>
            <textarea 
              value={content} 
              onChange={e=>setContent(e.target.value)} 
              rows={20} 
              className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-bg-secondary outline-none font-mono text-sm" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}


