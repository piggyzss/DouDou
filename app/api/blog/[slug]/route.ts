import { NextRequest, NextResponse } from 'next/server'
import { BlogModel } from '@/lib/models/blog'
import { deleteFile } from '@/lib/tencent-cos'

function normalizeSlug(input: string) {
  try {
    return decodeURIComponent(input).normalize('NFC')
  } catch {
    return String(input || '').normalize('NFC')
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = normalizeSlug(params.slug)

    // 获取博客文章
    const post = await BlogModel.findBySlug(slug)
    if (!post) {
      return NextResponse.json(
        { error: '博客文章不存在' },
        { status: 404 }
      )
    }

    // 增加浏览量
    await BlogModel.incrementViews(post.id)

    // 获取标签
    const tags = await BlogModel.getPostTags(post.id)

    // 获取评论
    const comments = await BlogModel.getPostComments(post.id)

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        tags: tags.map(tag => tag.name),
        comments
      }
    })
  } catch (error) {
    console.error('获取博客文章失败:', error)
    return NextResponse.json(
      { error: '获取博客文章失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: '只允许在开发模式下编辑博客' },
        { status: 403 }
      )
    }

    const slug = normalizeSlug(params.slug)
    const { title, content, tags, status, cover_url } = await req.json()

    // 获取博客文章
    const post = await BlogModel.findBySlug(slug)
    if (!post) {
      return NextResponse.json(
        { error: '博客文章不存在' },
        { status: 404 }
      )
    }

    // 更新博客文章
    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (status !== undefined) updates.status = status
    if (cover_url !== undefined && cover_url !== null) updates.cover_url = cover_url

    const updatedPost = await BlogModel.update(post.id, updates)
    if (!updatedPost) {
      return NextResponse.json(
        { error: '更新博客文章失败' },
        { status: 500 }
      )
    }

    // 处理标签更新（暂略）

    return NextResponse.json({
      success: true,
      message: '博客文章更新成功',
      post: updatedPost
    })
  } catch (error) {
    console.error('更新博客文章失败:', error)
    return NextResponse.json(
      { error: '更新博客文章失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: '只允许在开发模式下删除博客' },
        { status: 403 }
      )
    }

    const slug = normalizeSlug(params.slug)

    // 获取博客文章
    const post = await BlogModel.findBySlug(slug)
    if (!post) {
      return NextResponse.json(
        { error: '博客文章不存在' },
        { status: 404 }
      )
    }

    // 删除封面（如果存在）
    if ((post as any).cover_url) {
      try {
        const u = new URL((post as any).cover_url)
        const key = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname
        if (key) await deleteFile(key)
      } catch (e) {
        console.warn('封面删除异常（已忽略）：', e)
      }
    }

    // 删除内容文件（可忽略失败）
    try {
      const contentKey = `blog/content/blog-${post.id}-${post.slug}.md`
      await deleteFile(contentKey)
    } catch {}

    // 删除博客文章
    const success = await BlogModel.delete(post.id)
    if (!success) {
      return NextResponse.json(
        { error: '删除博客文章失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: '博客文章删除成功' })
  } catch (error) {
    console.error('删除博客文章失败:', error)
    return NextResponse.json(
      { error: '删除博客文章失败' },
      { status: 500 }
    )
  }
}


