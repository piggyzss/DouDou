import { NextRequest, NextResponse } from 'next/server'
import { deleteFile } from '@/lib/tencent-cos'
import { MusicModel } from '@/lib/models/music'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idNum = parseInt(params.id)
    if (Number.isNaN(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

    const music = await MusicModel.findById(idNum)
    if (!music) return NextResponse.json({ error: '找不到音乐' }, { status: 404 })

    const urls: string[] = [music.cover_url, music.audio_url].filter(Boolean) as string[]
    for (const u of urls) {
      try {
        const urlObj = new URL(u)
        const objectKey = urlObj.pathname.substring(1)
        await deleteFile(objectKey)
      } catch (e) {
        console.warn('删除COS文件失败:', e)
      }
    }

    const ok = await MusicModel.delete(idNum)
    if (!ok) return NextResponse.json({ error: '删除失败' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('删除音乐失败:', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
