import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 简单的静态响应，不依赖数据库
    const mockBlogData = {
      posts: [],
      total: 0,
      totalPages: 0,
      currentPage: 1
    }
    
    return NextResponse.json({
      success: true,
      message: 'Simple blog API working',
      data: mockBlogData
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
