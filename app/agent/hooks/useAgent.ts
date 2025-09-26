'use client'

import { useState, useCallback } from 'react'

export interface AgentMessage {
  id: string
  type: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  status?: 'sending' | 'success' | 'error'
}

export interface AgentState {
  status: 'idle' | 'processing' | 'error'
  lastUpdate: Date | null
}

// Mock 数据
const mockNewsData = [
  {
    title: "OpenAI releases GPT-4.5 with enhanced reasoning",
    source: "TechCrunch",
    time: "2 hours ago",
    summary: "New model shows 40% improvement in complex reasoning tasks and mathematical problem solving."
  },
  {
    title: "Google DeepMind announces breakthrough in robotics",
    source: "Nature",
    time: "4 hours ago", 
    summary: "RT-2 model enables robots to perform complex manipulation tasks with human-level dexterity."
  },
  {
    title: "Meta unveils Llama 3 with multimodal capabilities",
    source: "Meta AI Blog",
    time: "6 hours ago",
    summary: "New open-source model supports text, image, and video understanding with competitive performance."
  },
  {
    title: "Anthropic introduces Constitutional AI 2.0",
    source: "Anthropic Blog", 
    time: "8 hours ago",
    summary: "Enhanced safety measures and improved alignment through constitutional training methods."
  },
  {
    title: "Microsoft Copilot integrates with Azure AI Studio",
    source: "Microsoft Blog",
    time: "10 hours ago",
    summary: "Developers can now build custom AI agents using enterprise-grade tools and infrastructure."
  }
]

const mockCategories = [
  { name: "Large Language Models", count: 23 },
  { name: "Computer Vision", count: 18 },
  { name: "Robotics", count: 15 },
  { name: "Machine Learning", count: 31 },
  { name: "AI Safety", count: 12 },
  { name: "Natural Language Processing", count: 27 }
]

const mockTrends = [
  { keyword: "GPT-4.5", mentions: 1250, change: "+45%" },
  { keyword: "Multimodal AI", mentions: 890, change: "+32%" },
  { keyword: "AI Safety", mentions: 675, change: "+28%" },
  { keyword: "Open Source LLM", mentions: 543, change: "+18%" },
  { keyword: "AI Agents", mentions: 432, change: "+15%" }
]

export function useAgent() {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: '1',
      type: 'system',
      content: '> Welcome to AI News Agent\n> Type \'/help\' for available commands\n> Type \'/trending\' for display trends\n> Type \'/deepdive\' for depth analysis',
      timestamp: new Date(),
      status: 'success'
    }
  ])
  
  const [agentState, setAgentState] = useState<AgentState>({
    status: 'idle',
    lastUpdate: new Date()
  })

  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // 模拟打字机效果
  const typeMessage = useCallback((content: string, messageId: string) => {
    const words = content.split(' ')
    let currentContent = ''
    
    words.forEach((word, index) => {
      setTimeout(() => {
        currentContent += (index === 0 ? '' : ' ') + word
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: currentContent }
              : msg
          )
        )
      }, index * 100) // 每个单词间隔100ms
    })
  }, [])

  const processCommand = useCallback(async (command: string) => {
    const trimmedCommand = command.trim().toLowerCase()
    
    // 添加用户消息
    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `user@agent:~$ ${command}`,
      timestamp: new Date(),
      status: 'success'
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // 更新命令历史
    setCommandHistory(prev => [...prev, command])
    setHistoryIndex(-1)
    
    // 设置处理状态
    setAgentState(prev => ({ ...prev, status: 'processing' }))
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let response = ''
    const agentMessageId = (Date.now() + 1).toString()
    
    // 根据命令生成响应
    switch (trimmedCommand) {
      case '/help':
        response = `Available commands:
/help                   # Show this help message
/latest                 # Get latest AI news
/search <keyword>       # Search for specific topics
/categories             # Show news categories
/trending               # Show trending topics
/deepdive               # Perform deep analysis
/history                # Show command history
/clear                  # Clear terminal
/status                 # Show agent status
/config                 # Configuration settings`
        break
        
      case '/latest':
        response = `[INFO] Fetching latest AI news...
[SUCCESS] Found ${mockNewsData.length} new articles

┌─ Latest AI News ────────────────────────────────────────┐
${mockNewsData.map((item, index) => 
  `│ ${index + 1}. ${item.title}
│    Source: ${item.source} | ${item.time}
│    ${item.summary}
│`).join('\n')}
└─────────────────────────────────────────────────────────┘`
        break
        
      case '/categories':
        response = `[INFO] Loading news categories...

┌─ News Categories ───────────────────────────────────────┐
${mockCategories.map(cat => 
  `│ ${cat.name.padEnd(30)} ${cat.count.toString().padStart(3)} articles │`
).join('\n')}
└─────────────────────────────────────────────────────────┘`
        break
        
      case '/trending':
        response = `[INFO] Analyzing trending topics...

┌─ Trending AI Topics ────────────────────────────────────┐
${mockTrends.map((trend, index) => 
  `│ ${(index + 1).toString().padStart(2)}. ${trend.keyword.padEnd(20)} ${trend.mentions.toString().padStart(4)} mentions ${trend.change} │`
).join('\n')}
└─────────────────────────────────────────────────────────┘`
        break
        
      case '/deepdive':
        response = `[INFO] Initializing deep analysis mode...
[ANALYSIS] Processing recent AI developments...
[INSIGHTS] Key trends identified:

• Large Language Models continue to dominate with GPT-4.5 release
• Multimodal AI gaining significant traction across major tech companies  
• Open-source models closing performance gap with proprietary solutions
• AI Safety becoming increasingly important in enterprise adoption
• Robotics integration with LLMs showing promising real-world applications

[RECOMMENDATION] Focus areas for next 30 days:
1. Monitor GPT-4.5 performance benchmarks
2. Track open-source LLM developments
3. Watch for regulatory updates on AI safety`
        break
        
      case '/status':
        response = `Agent Status: ● Online
Last Update: ${new Date().toLocaleString()}
Memory Usage: 45.2 MB
Active Connections: 1
News Sources: 15 active
Cache Status: Healthy`
        break
        
      case '/history':
        response = commandHistory.length > 0 
          ? `Command History:\n${commandHistory.map((cmd, i) => `${i + 1}. ${cmd}`).join('\n')}`
          : 'No command history available'
        break
        
      case '/clear':
        setMessages([{
          id: Date.now().toString(),
          type: 'system', 
          content: '> Terminal cleared\n> Welcome back to AI News Agent',
          timestamp: new Date(),
          status: 'success'
        }])
        setAgentState(prev => ({ ...prev, status: 'idle', lastUpdate: new Date() }))
        return
        
      default:
        if (trimmedCommand.startsWith('/search ')) {
          const keyword = command.slice(8).trim()
          response = `[INFO] Searching for "${keyword}"...
[RESULTS] Found 3 relevant articles:

1. "Understanding ${keyword} in Modern AI Systems"
   Source: AI Research Journal | 1 day ago
   
2. "Latest Developments in ${keyword} Technology"  
   Source: Tech News Daily | 2 days ago
   
3. "Industry Impact of ${keyword} Innovation"
   Source: Business AI Weekly | 3 days ago`
        } else {
          response = `[ERROR] Unknown command: ${command}
Type '/help' to see available commands`
        }
    }
    
    // 添加 agent 响应
    const agentMessage: AgentMessage = {
      id: agentMessageId,
      type: 'agent',
      content: '',
      timestamp: new Date(),
      status: 'success'
    }
    
    setMessages(prev => [...prev, agentMessage])
    
    // 打字机效果显示响应
    typeMessage(response, agentMessageId)
    
    // 更新状态
    setTimeout(() => {
      setAgentState(prev => ({ 
        ...prev, 
        status: 'idle', 
        lastUpdate: new Date() 
      }))
    }, response.split(' ').length * 100)
    
  }, [typeMessage, commandHistory])

  const getHistoryCommand = useCallback((direction: 'up' | 'down') => {
    if (commandHistory.length === 0) return ''
    
    if (direction === 'up') {
      const newIndex = historyIndex + 1
      if (newIndex < commandHistory.length) {
        setHistoryIndex(newIndex)
        return commandHistory[commandHistory.length - 1 - newIndex]
      }
    } else {
      const newIndex = historyIndex - 1
      if (newIndex >= 0) {
        setHistoryIndex(newIndex)
        return commandHistory[commandHistory.length - 1 - newIndex]
      } else if (newIndex === -1) {
        setHistoryIndex(-1)
        return ''
      }
    }
    
    return null
  }, [commandHistory, historyIndex])

  return {
    messages,
    agentState,
    processCommand,
    getHistoryCommand,
    setMessages
  }
}
