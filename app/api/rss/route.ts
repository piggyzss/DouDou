import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 获取博客文章数据
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    // 这里应该从数据库获取最新的博客文章
    // 为了演示，我们先创建一个基本的RSS feed
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>shanshan的博客</title>
    <description>前端开发者 | AI爱好者 | 创意工作者</description>
    <link>${baseUrl}</link>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    
    <item>
      <title>欢迎订阅我的博客</title>
      <description>感谢您订阅我的博客RSS！这里会分享前端开发、AI技术和创意设计相关的内容。</description>
      <link>${baseUrl}/blog</link>
      <guid>${baseUrl}/blog</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('RSS生成错误:', error)
    return NextResponse.json(
      { error: 'RSS生成失败' },
      { status: 500 }
    )
  }
}
