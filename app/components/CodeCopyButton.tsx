'use client'

import { useState, useEffect } from 'react'
import copy from 'copy-to-clipboard'

interface CodeCopyButtonProps {
  code: string
}

export default function CodeCopyButton({ code }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    copy(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`copy-button ${copied ? 'copied' : ''}`}
      title={copied ? '已复制!' : '复制代码'}
    >
      {copied ? '✓ 已复制' : '复制'}
    </button>
  )
}
