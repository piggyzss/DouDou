import { NextRequest, NextResponse } from 'next/server'
import { MusicModel } from '@/lib/models/music'
import { uploadFile } from '@/lib/tencent-cos'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const result = await MusicModel.findAll(page, limit)
    return NextResponse.json({ success: true, data: result })
  } catch (e) {
    console.error('Get music list error:', e)
    return NextResponse.json({ error: '获取音乐列表失败' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const title = (form.get('title') as string) || ''
    const tags = ((form.get('tags') as string) || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
    const audio = form.get('audio') as File | null
    const cover = form.get('cover') as File | null

    if (!title) return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    if (!audio) return NextResponse.json({ error: '缺少音频文件' }, { status: 400 })

    // 上传音频
    const audioBuf = Buffer.from(await audio.arrayBuffer())
    const audioRes = await uploadFile(audioBuf, audio.name, audio.type, 'aigc/music/audio')
    if (!audioRes.success || !audioRes.url) {
      return NextResponse.json({ error: audioRes.error || '音频上传失败' }, { status: 500 })
    }

    // 上传封面（可选）
    let coverUrl: string | undefined
    if (cover) {
      const coverBuf = Buffer.from(await cover.arrayBuffer())
      const coverRes = await uploadFile(coverBuf, cover.name, cover.type, 'aigc/music/cover')
      if (!coverRes.success || !coverRes.url) {
        return NextResponse.json({ error: coverRes.error || '封面上传失败' }, { status: 500 })
      }
      coverUrl = coverRes.url
    }

    const created = await MusicModel.create({
      title,
      tags,
      audio_url: audioRes.url,
      cover_url: coverUrl,
      duration: audioRes.duration || 0
    })

    return NextResponse.json({ success: true, data: created })
  } catch (e) {
    console.error('Create music error:', e)
    return NextResponse.json({ error: '创建音乐失败' }, { status: 500 })
  }
}


