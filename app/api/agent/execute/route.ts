import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 转发请求到Python Agent后端
    const response = await fetch(`${process.env.PYTHON_BACKEND_URL}/api/agent/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Agent API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Agent service unavailable',
        message: 'Python后端服务暂时不可用，请稍后重试'
      }, 
      { status: 503 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Agent API proxy is running',
    backend: process.env.PYTHON_BACKEND_URL || 'Not configured'
  })
}