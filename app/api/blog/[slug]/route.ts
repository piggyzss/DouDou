import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug, readPostFile, updateExistingPost } from '@/lib/blog'

export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params
  const res = readPostFile(slug)
  if (!res) return NextResponse.json({ error: '未找到' }, { status: 404 })
  return NextResponse.json(res)
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const body = await req.json()
    const { title, tags, content } = body
    if (!title || !content) return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    const res = updateExistingPost({ slug, title, tags: Array.isArray(tags) ? tags : [], content })
    return NextResponse.json(res)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '保存失败' }, { status: 500 })
  }
}


