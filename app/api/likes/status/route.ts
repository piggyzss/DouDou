import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { query } from '@/lib/database'

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { targets } = await req.json()
    if (!Array.isArray(targets) || targets.length === 0) {
      return NextResponse.json({ error: 'invalid targets' }, { status: 400 })
    }
    const anonId = req.cookies.get('anon_id')?.value || null
    const ip = req.ip || req.headers.get('x-forwarded-for') || '0.0.0.0'
    const ua = req.headers.get('user-agent') || ''
    const ipHash = sha256(String(ip))
    const uaHash = sha256(ua)

    // 构造查询
    const conditions: string[] = []
    const params: any[] = []
    let idx = 1
    for (const t of targets) {
      if (!t?.type || !t?.id) continue
      if (anonId) {
        conditions.push(`(target_type=$${idx++} AND target_id=$${idx++} AND anon_id=$${idx++})`)
        params.push(t.type, t.id, anonId)
      } else {
        conditions.push(`(target_type=$${idx++} AND target_id=$${idx++} AND anon_id IS NULL AND ip_hash=$${idx++} AND ua_hash=$${idx++})`)
        params.push(t.type, t.id, ipHash, uaHash)
      }
    }
    if (conditions.length === 0) return NextResponse.json({ statuses: [] })

    const sql = `SELECT target_type, target_id FROM likes WHERE ${conditions.join(' OR ')}`
    const r = await query(sql, params)
    const set = new Set(r.rows.map((row: any) => `${row.target_type}:${row.target_id}`))

    const statuses = targets.map((t: any) => ({
      type: t.type,
      id: t.id,
      liked: set.has(`${t.type}:${t.id}`)
    }))

    return NextResponse.json({ statuses })
  } catch (e) {
    console.error('status like error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
