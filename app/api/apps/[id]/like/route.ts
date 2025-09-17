import { NextRequest, NextResponse } from 'next/server'
import { AppModel } from '@/lib/models/app'

// 点赞/取消点赞应用
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的应用ID' },
        { status: 400 }
      )
    }

    // 检查应用是否存在
    const app = await AppModel.findById(id)
    if (!app) {
      return NextResponse.json(
        { error: '应用不存在' },
        { status: 404 }
      )
    }

    // 获取客户端IP和User-Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || ''

    // 尝试记录点赞
    const success = await AppModel.recordLike(id, ipAddress, userAgent)
    
    if (success) {
      return NextResponse.json({ 
        message: '点赞成功',
        liked: true 
      })
    } else {
      return NextResponse.json({ 
        message: '您已经点赞过了',
        liked: false 
      })
    }
  } catch (error) {
    console.error('点赞失败:', error)
    return NextResponse.json(
      { error: '点赞失败' },
      { status: 500 }
    )
  }
}

// 检查是否已点赞
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的应用ID' },
        { status: 400 }
      )
    }

    // 获取客户端IP
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'

    // 检查是否已点赞
    const hasLiked = await AppModel.hasLiked(id, ipAddress)

    return NextResponse.json({ 
      liked: hasLiked 
    })
  } catch (error) {
    console.error('检查点赞状态失败:', error)
    return NextResponse.json(
      { error: '检查点赞状态失败' },
      { status: 500 }
    )
  }
}
