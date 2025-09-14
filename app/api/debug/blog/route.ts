import { NextRequest, NextResponse } from 'next/server'
import { BlogModel } from '../../../../lib/models/blog'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing BlogModel.findAllPublished...')
    
    // 测试博客模型的查询
    const result = await BlogModel.findAllPublished(1, 5)
    
    return NextResponse.json({
      success: true,
      result: {
        totalPosts: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        postsCount: result.posts?.length || 0,
        posts: result.posts?.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: (post as any).status,
          created_at: post.created_at
        })) || []
      }
    })
    
  } catch (error: any) {
    console.error('❌ Blog test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack
      }
    }, { status: 500 })
  }
}
