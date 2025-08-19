'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewBlogPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    try {
      setSaving(true)
      setError(null)
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, tags: tags.split(',').map(t => t.trim()).filter(Boolean), content })
      })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      router.push(`/blog/${json.slug}`)
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
          <div>
            <label className="block text-sm text-text-muted mb-1">内容 (Markdown)</label>
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={20} className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-bg-secondary outline-none font-mono text-sm" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end">
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark disabled:opacity-60">{saving ? '保存中...' : '保存'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}


