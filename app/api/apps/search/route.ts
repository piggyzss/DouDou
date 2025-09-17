import { NextRequest, NextResponse } from 'next/server'
import { AppModel } from '@/lib/models/app'

// 搜索应用
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') || undefined
    const platform = searchParams.get('platform') || undefined

    if (!query) {
      return NextResponse.json(
        { error: '搜索关键词不能为空' },
        { status: 400 }
      )
    }

    const result = await AppModel.search(query, {
      page,
      limit,
      type,
      platform
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('搜索应用失败:', error)
    return NextResponse.json(
      { error: '搜索应用失败' },
      { status: 500 }
    )
  }
}
