import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...')
    
    // 测试基本连接
    const testQuery = await db.query('SELECT NOW() as current_time')
    console.log('✅ Basic connection test passed')
    
    // 测试blog_posts表是否存在
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'blog_posts'
    `)
    
    const blogTableExists = tableCheck.rows.length > 0
    console.log(`📊 blog_posts table exists: ${blogTableExists}`)
    
    let blogPostsCount = 0
    if (blogTableExists) {
      const countResult = await db.query('SELECT COUNT(*) FROM blog_posts')
      blogPostsCount = parseInt(countResult.rows[0].count)
      console.log(`📝 blog_posts count: ${blogPostsCount}`)
    }
    
    // 检查环境变量
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      NODE_ENV: process.env.NODE_ENV
    }
    
    return NextResponse.json({
      success: true,
      timestamp: testQuery.rows[0].current_time,
      database: {
        connected: true,
        blogTableExists,
        blogPostsCount
      },
      environment: envCheck
    })
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        detail: error.detail
      },
      environment: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        POSTGRES_URL: !!process.env.POSTGRES_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 })
  }
}
