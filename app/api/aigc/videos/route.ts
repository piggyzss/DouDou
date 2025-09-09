import { NextRequest, NextResponse } from 'next/server'
import { VideoModel } from '@/lib/models/video'
import { uploadFile } from '@/lib/tencent-cos'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const result = await VideoModel.findAll(page, limit)
    return NextResponse.json({ success: true, data: result })
  } catch (e) {
    return NextResponse.json({ error: '获取视频列表失败' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const title = (form.get('title') as string) || ''
    const tags = ((form.get('tags') as string) || '').split(',').map(t=>t.trim()).filter(Boolean)
    const video = form.get('video') as File | null
    const cover = form.get('cover') as File | null
    if (!title) return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    if (!video) return NextResponse.json({ error: '缺少视频文件' }, { status: 400 })

    const vbuf = Buffer.from(await video.arrayBuffer())
    const vres = await uploadFile(vbuf, video.name, video.type, 'aigc/videos/file')
    if (!vres.success || !vres.url) return NextResponse.json({ error: vres.error || '视频上传失败' }, { status: 500 })

    let coverUrl: string | undefined
    if (cover) {
      const cbuf = Buffer.from(await cover.arrayBuffer())
      const cres = await uploadFile(cbuf, cover.name, cover.type, 'aigc/videos/cover')
      if (!cres.success || !cres.url) return NextResponse.json({ error: cres.error || '封面上传失败' }, { status: 500 })
      coverUrl = cres.url
    }

    const created = await VideoModel.create({ title, tags, video_url: vres.url, cover_url: coverUrl, duration: vres.duration || 0 })
    return NextResponse.json({ success: true, data: created })
  } catch (e) {
    return NextResponse.json({ error: '创建视频失败' }, { status: 500 })
  }
}


