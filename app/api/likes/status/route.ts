import { NextRequest, NextResponse } from 'next/server'
import { LikesModel } from '@/lib/models/likes'

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await (globalThis.crypto as Crypto).subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(req: NextRequest) {
  try {
    const { targets } = await req.json()
    if (!Array.isArray(targets) || targets.length === 0) return NextResponse.json({ statuses: [] })
    const ua = req.headers.get('user-agent') || ''
    const ip = (req as any).ip || req.headers.get('x-forwarded-for') || '0.0.0.0'
    const ipHash = await sha256Hex(String(ip))
    const uaHash = await sha256Hex(ua)
    const statuses = await Promise.all(
      targets.map(async (t: { type: string; id: number }) => {
        const s = await LikesModel.getUserLike(t.type, Number(t.id), ipHash, uaHash)
        const count = await LikesModel.getLikesCount(t.type, Number(t.id))
        return { targetType: t.type, targetId: t.id, liked: s?.status === 'liked', likesCount: count }
      })
    )
    return NextResponse.json({ statuses })
  } catch (e) {
    console.error('likes status error:', e)
    return NextResponse.json({ statuses: [] })
  }
}
