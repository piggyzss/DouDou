import { NextRequest, NextResponse } from 'next/server'

// Python后端服务配置
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plugin, command, params, sessionId } = body

    // 构造发送给Python后端的请求
    const backendRequest = {
      command: command,
      params: params || {},
      session_id: sessionId || 'default',
      user_id: ''
    }

    // 调用Python后端API
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/agent/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRequest)
    })

    if (!response.ok) {
      // 如果Python后端不可用，回退到mock数据
      console.warn('Python backend not available, falling back to mock data')
      return handleFallback(command, params)
    }

    const result = await response.json()
    
    // 转换Python后端响应格式
    return NextResponse.json({
      success: result.success,
      data: result.data,
      error: result.error,
      type: result.type || 'text'
    })

  } catch (error) {
    console.error('Error calling Python backend:', error)
    
    // 回退到mock数据
    const body = await request.json()
    return handleFallback(body.command, body.params)
  }
}

// Mock数据作为后备方案
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
  }
]

const mockCategories = [
  { name: 'Machine Learning', count: 234 },
  { name: 'Natural Language Processing', count: 189 },
  { name: 'Computer Vision', count: 156 },
  { name: 'Robotics', count: 123 },
  { name: 'AI Safety', count: 98 }
]

const mockTrends = [
  { keyword: 'GPT-4.5', mentions: 1247, change: '↑ 23%' },
  { keyword: 'Multimodal AI', mentions: 892, change: '↑ 15%' },
  { keyword: 'AI Safety', mentions: 567, change: '↑ 8%' },
  { keyword: 'Open Source LLM', mentions: 445, change: '↑ 12%' },
  { keyword: 'AI Robotics', mentions: 334, change: '↑ 18%' }
]

function handleFallback(command: string, params: any) {
  switch (command) {
    case '/help':
      return NextResponse.json({
        success: true,
        data: 'help_content', // 将由前端formatStructuredResponse处理
        type: 'structured'
      })

    case '/latest':
      const count = parseInt(params.count) || mockNewsData.length
      const limitedNews = mockNewsData.slice(0, count)
      
      const newsResponse = `[INFO] Fetching latest AI news...
[SUCCESS] Found ${limitedNews.length} new articles

┌─ Latest AI News ────────────────────────────────────────┐
${limitedNews.map((item, index) => 
  `│ ${index + 1}. ${item.title}
│    Source: ${item.source} | ${item.time}
│    ${item.summary}
│`).join('\n')}
└─────────────────────────────────────────────────────────┘`

      return NextResponse.json({
        success: true,
        data: newsResponse,
        type: 'text'
      })

    case '/categories':
      const categoriesResponse = `[INFO] Loading news categories...

┌─ News Categories ───────────────────────────────────────┐
${mockCategories.map(cat => 
  `│ ${cat.name.padEnd(30)} ${cat.count.toString().padStart(3)} articles │`
).join('\n')}
└─────────────────────────────────────────────────────────┘`

      return NextResponse.json({
        success: true,
        data: categoriesResponse,
        type: 'text'
      })

    case '/trending':
      const trendingResponse = `[INFO] Analyzing trending topics...

┌─ Trending AI Topics ────────────────────────────────────┐
${mockTrends.map((trend, index) => 
  `│ ${(index + 1).toString().padStart(2)}. ${trend.keyword.padEnd(20)} ${trend.mentions.toString().padStart(4)} mentions ${trend.change} │`
).join('\n')}
└─────────────────────────────────────────────────────────┘`

      return NextResponse.json({
        success: true,
        data: trendingResponse,
        type: 'text'
      })

    case '/deepdive':
      const topic = params.topic || 'AI developments'
      const deepdiveResponse = `[INFO] Initializing deep analysis mode...
[ANALYSIS] Processing recent ${topic}...
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

      return NextResponse.json({
        success: true,
        data: deepdiveResponse,
        type: 'text'
      })

    default:
      return NextResponse.json({
        success: false,
        error: `Unknown command: ${command}`,
        type: 'error'
      })
  }
}
