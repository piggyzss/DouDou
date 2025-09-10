"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import ConfirmModal from '../../components/ConfirmModal'

export default function PostDeleteButton({ slug, currentPage }: { slug: string; currentPage: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const onConfirm = async () => {
    if (loading) return
    try {
      setLoading(true)
      const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || '删除失败')
      }
      router.push(`/blog?page=${currentPage}`)
      router.refresh()
    } catch (e) {
      console.error(e)
      alert('删除失败，请查看控制台日志')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-60"
        title={loading ? '删除中...' : '删除文章'}
      >
        <Trash2 size={14} />
      </button>
      <ConfirmModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        title="删除文章"
        message="确定要删除该文章及关联资源吗？此操作无法撤销。"
        confirmText={loading ? '删除中...' : '确认删除'}
        cancelText="取消"
        type="danger"
      />
    </>
  )
}
