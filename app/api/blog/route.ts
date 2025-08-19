import { NextRequest, NextResponse } from 'next/server'
import { saveNewPost } from '@/lib/blog'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, slug, tags, content } = body
    if (!title || !content) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }
    const res = saveNewPost({ title, slug, tags: Array.isArray(tags) ? tags : [], content })
    return NextResponse.json(res)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '保存失败' }, { status: 500 })
  }
}


