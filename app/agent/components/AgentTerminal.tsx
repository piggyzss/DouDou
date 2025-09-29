'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Minimize2, Maximize2, Terminal, Wifi } from 'lucide-react'
import { useTerminalTheme } from '../hooks/useTerminalTheme'
import { useAgent } from '../hooks/useAgent'

export default function AgentTerminal() {
  const [input, setInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const terminalTheme = useTerminalTheme()
  const { messages, agentState, processCommand, getHistoryCommand } = useAgent()

  // 确保只在客户端渲染时显示时间
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 自动滚动到底部，但不影响页面整体位置
  useEffect(() => {
    if (messagesEndRef.current) {
      // 只滚动终端内部的消息区域，不影响页面整体位置
      const messagesContainer = messagesEndRef.current.closest('.terminal-messages-container')
      if (messagesContainer) {
        // 使用 requestAnimationFrame 确保 DOM 更新完成后再滚动
        requestAnimationFrame(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        })
      }
    }
  }, [messages])

  // 自动聚焦输入框
  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus()
    }
  }, [isMinimized])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    await processCommand(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const historyCommand = getHistoryCommand('up')
      if (historyCommand !== null) {
        setInput(historyCommand)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const historyCommand = getHistoryCommand('down')
      if (historyCommand !== null) {
        setInput(historyCommand)
      }
    }
  }

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => {
      // 检测不同类型的输出并应用样式
      if (line.includes('[INFO]')) {
        const parts = line.split('[INFO]')
        return (
          <div key={index} className="flex">
            <span className="text-terminal-blue">[INFO]</span>
            <span className="text-terminal-accent">{parts[1] || ''}</span>
          </div>
        )
      } else if (line.includes('[SUCCESS]')) {
        const parts = line.split('[SUCCESS]')
        return (
          <div key={index} className="flex">
            <span className="text-terminal-green">[SUCCESS]</span>
            <span className="text-terminal-accent">{parts[1] || ''}</span>
          </div>
        )
      } else if (line.includes('[ERROR]')) {
        const parts = line.split('[ERROR]')
        return (
          <div key={index} className="flex">
            <span className="text-terminal-red">[ERROR]</span>
            <span className="text-terminal-accent">{parts[1] || ''}</span>
          </div>
        )
      } else if (line.includes('[ANALYSIS]')) {
        const parts = line.split('[ANALYSIS]')
        return (
          <div key={index} className="flex">
            <span className="text-terminal-blue">[ANALYSIS]</span>
            <span className="text-terminal-accent">{parts[1] || ''}</span>
          </div>
        )
      } else if (line.includes('[INSIGHTS]')) {
        const parts = line.split('[INSIGHTS]')
        return (
          <div key={index} className="flex">
            <span className="text-terminal-blue">[INSIGHTS]</span>
            <span className="text-terminal-accent">{parts[1] || ''}</span>
          </div>
        )
      } else if (line.includes('[RECOMMENDATION]')) {
        const parts = line.split('[RECOMMENDATION]')
        return (
          <div key={index} className="flex">
            <span className="text-terminal-blue">[RECOMMENDATION]</span>
            <span className="text-terminal-accent">{parts[1] || ''}</span>
          </div>
        )
      } else if (line.startsWith('user@agent:~$')) {
        return (
          <div key={index} className="flex">
            <span className="text-terminal-accent">user@agent:~$</span>
            <span className="ml-2 text-terminal-text">{line.replace('user@agent:~$', '').trim()}</span>
          </div>
        )
      } else if (line.startsWith('>')) {
        return (
          <div key={index} className="text-terminal-muted">
            {line}
          </div>
        )
      }
      
      return (
        <div key={index} className="text-terminal-text">
          {line}
        </div>
      )
    })
  }

  if (isMinimized) {
    return (
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-2 px-4 py-2 bg-terminal-bg border border-terminal-border rounded-lg shadow-lg hover:shadow-xl transition-all"
          style={{
            backgroundColor: 'var(--terminal-bg)',
            borderColor: 'var(--terminal-border)',
            color: 'var(--terminal-text)'
          }}
        >
          <Terminal size={16} />
          <span className="text-sm font-medium font-blog">AI Agent</span>
          {agentState.status === 'processing' && (
            <div className="w-2 h-2 bg-terminal-accent rounded-full animate-pulse"></div>
          )}
        </button>
      </motion.div>
    )
  }

  return (
    <div className="relative">
      <motion.div
        className={`terminal-container ${terminalTheme} w-full rounded-lg shadow-2xl overflow-hidden`}
        style={{
          backgroundColor: 'var(--terminal-bg)',
          borderColor: 'var(--terminal-border)',
          minHeight: '600px'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      {/* Terminal 标题栏 */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--terminal-border)' }}
      >
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center space-x-2">
            <Terminal size={16} className="text-terminal-accent" />
            <span className="text-sm font-medium font-blog" style={{ color: 'var(--terminal-text)' }}>
              AI News Agent v1.0
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 状态显示 */}
          <div className="flex items-center space-x-2 text-xs font-blog" style={{ color: 'var(--terminal-muted)' }}>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                agentState.status === 'idle' ? 'bg-green-500' : 
                agentState.status === 'processing' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`}></div>
              <span className="capitalize">{agentState.status}</span>
            </div>
            <span>|</span>
            <div className="flex items-center space-x-1">
              <Wifi size={12} />
              <span>Online</span>
            </div>
            <span>|</span>
            <span>Last Update: {isClient ? agentState.lastUpdate?.toLocaleTimeString() : '--:--:--'}</span>
          </div>
          
          {/* 控制按钮 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Minimize2 size={14} style={{ color: 'var(--terminal-muted)' }} />
            </button>
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
              <Maximize2 size={14} style={{ color: 'var(--terminal-muted)' }} />
            </button>
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
              <X size={14} style={{ color: 'var(--terminal-muted)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Terminal 内容区域 */}
      <div className="flex h-[500px]">
        {/* 主要终端区域 */}
        <div className="flex-1 flex flex-col">
          {/* 消息显示区域 */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm font-light leading-relaxed terminal-messages-container custom-scrollbar">
            {messages.map((message) => (
              <div key={message.id} className="mb-2">
                {formatMessage(message.content)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--terminal-border)' }}>
            <form onSubmit={handleSubmit} className="flex items-center">
              <span className="text-terminal-accent font-mono text-sm font-light">user@agent:~$</span>
              <div className="flex-1 flex items-center ml-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none font-mono text-sm font-light"
                  style={{ color: 'var(--terminal-text)' }}
                  placeholder="Type a command..."
                  disabled={agentState.status === 'processing'}
                />
                {!input && agentState.status !== 'processing' && (
                  <div 
                    className="w-0.5 h-4 bg-terminal-accent animate-pulse ml-1"
                    style={{
                      animation: 'blink 1s infinite',
                      width: '2px'
                    }}
                  ></div>
                )}
              </div>
              {agentState.status === 'processing' && (
                <div className="flex items-center space-x-1 ml-2">
                  <div 
                    className="w-0.5 h-4 bg-terminal-accent animate-pulse"
                    style={{
                      animation: 'blink 1s infinite',
                      width: '2px'
                    }}
                  ></div>
                  <span className="text-xs text-terminal-muted">Processing...</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* 侧边栏 - 快捷命令 */}
        <div 
          className="w-64 border-l p-4 bg-gray-50 dark:bg-gray-800"
          style={{ borderColor: 'var(--terminal-border)' }}
        >
          <h3 className="text-sm font-medium mb-3 font-blog" style={{ color: 'var(--terminal-text)' }}>
            Quick Commands
          </h3>
          <div className="space-y-2">
            {[
              { cmd: '/latest', desc: 'Get latest news' },
              { cmd: '/trending', desc: 'Show trends' },
              { cmd: '/categories', desc: 'News categories' },
              { cmd: '/deepdive', desc: 'Deep analysis' },
              { cmd: '/help', desc: 'Show help' }
            ].map((item) => (
              <button
                key={item.cmd}
                onClick={() => {
                  setInput(item.cmd)
                  inputRef.current?.focus()
                }}
                className="w-full text-left p-2 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                style={{ color: 'var(--terminal-muted)' }}
              >
                <div className="font-mono text-terminal-accent">{item.cmd}</div>
                <div className="font-blog">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  )
}
