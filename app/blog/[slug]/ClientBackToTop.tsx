'use client'

import { ArrowUp } from 'lucide-react'

export default function ClientBackToTop() {
  const onClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full bg-bg-secondary hover:bg-bg-tertiary border border-gray-200 dark:border-gray-700 text-text-secondary hover:text-primary shadow-sm transition-colors"
      aria-label="回到顶部"
    >
      <ArrowUp size={16} />
    </button>
  )
}


