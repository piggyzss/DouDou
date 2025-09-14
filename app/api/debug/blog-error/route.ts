import { NextResponse } from 'next/server'
import { BlogModel } from '../../../../lib/models/blog'

export async function GET() {
  try {
    console.log('开始测试博客页面逻辑...')
    
    // 测试基本的数据库连接
    console.log('1. 测试数据库连接...')
    const result = await BlogModel.findAllPublished(1, 10)
    console.log('数据库查询结果:', result)
    
    // 测试日期格式化函数
    console.log('2. 测试日期格式化...')
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    if (result.posts && result.posts.length > 0) {
      console.log('3. 测试第一篇文章数据处理...')
      const firstPost = result.posts[0]
      console.log('文章数据:', firstPost)
      
      const formattedDate = formatDate(firstPost.published_at || firstPost.created_at)
      console.log('格式化日期:', formattedDate)
    }
    
    return NextResponse.json({
      success: true,
      message: '博客页面逻辑测试通过',
      result: result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('博客页面逻辑测试失败:', error)
    console.error('错误堆栈:', error.stack)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorName: error.name,
      errorCode: error.code,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
