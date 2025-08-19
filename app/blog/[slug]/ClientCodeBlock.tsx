'use client'

import { useEffect } from 'react'

export default function ClientCodeBlock() {
  useEffect(() => {
    // 为所有代码块添加复制按钮
    const codeBlocks = document.querySelectorAll('.blog-content pre')
    
    codeBlocks.forEach((pre) => {
      // 检查是否已经有复制按钮
      if (pre.querySelector('.copy-button')) return
      
      const code = pre.querySelector('code')
      if (!code) return
      
      // 创建复制按钮容器
      const copyButtonContainer = document.createElement('div')
      copyButtonContainer.className = 'copy-button'
      copyButtonContainer.title = '复制代码'
      
      // 创建复制图标
      const copyIcon = document.createElement('div')
      copyIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
      `
      copyIcon.className = 'copy-icon'
      
      // 创建复制成功图标（隐藏）
      const copyCheckIcon = document.createElement('div')
      copyCheckIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6 9 17l-5-5"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      `
      copyCheckIcon.className = 'copy-check-icon'
      copyCheckIcon.style.display = 'none'
      copyCheckIcon.style.position = 'absolute'
      copyCheckIcon.style.top = '0'
      copyCheckIcon.style.left = '0'
      copyCheckIcon.style.width = '100%'
      copyCheckIcon.style.height = '100%'
      copyCheckIcon.style.display = 'flex'
      copyCheckIcon.style.alignItems = 'center'
      copyCheckIcon.style.justifyContent = 'center'
      
      copyButtonContainer.appendChild(copyIcon)
      copyButtonContainer.appendChild(copyCheckIcon)
      
      // 添加点击事件
      copyButtonContainer.addEventListener('click', () => {
        const text = code.textContent || ''
        navigator.clipboard.writeText(text).then(() => {
          copyIcon.style.display = 'none'
          copyCheckIcon.style.display = 'flex'
          copyButtonContainer.classList.add('copied')
          
          setTimeout(() => {
            copyIcon.style.display = 'flex'
            copyCheckIcon.style.display = 'none'
            copyButtonContainer.classList.remove('copied')
          }, 2000)
        })
      })
      
      pre.appendChild(copyButtonContainer)
    })
  }, [])

  return null
}
