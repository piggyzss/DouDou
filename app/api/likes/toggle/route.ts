import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await (globalThis.crypto as Crypto).subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function ensureLikesTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      target_type VARCHAR(20) NOT NULL,
      target_id INTEGER NOT NULL,
      anon_id VARCHAR(64),
      ip_hash VARCHAR(128),
      ua_hash VARCHAR(128),
      status VARCHAR(10) DEFAULT 'liked',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
  // 索引：
  // 1) 仅 anon_id 唯一（历史保留）
  await query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique_anon ON likes(target_type, target_id, anon_id) WHERE anon_id IS NOT NULL`)
  // 2) 供 ON CONFLICT (target_type,target_id,anon_id) 使用的非部分唯一索引
  await query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique_all ON likes(target_type, target_id, anon_id)`)
  // 3) 供匿名用户使用的唯一索引（ip+ua）
  await query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique_ipua ON likes(target_type, target_id, ip_hash, ua_hash)`)
  // 查询加速
  await query(`CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id)`)
}

export async function POST(req: NextRequest) {
  try {
    await ensureLikesTable()

    const { targetType, targetId, action } = await req.json()
    const idNum = Number(targetId)
    if (!targetType || !Number.isFinite(idNum) || !['like', 'unlike'].includes(action)) {
      return NextResponse.json({ error: 'invalid params' }, { status: 400 })
    }

    const anonId = req.cookies.get('anon_id')?.value || null
    const ip = (req as any).ip || req.headers.get('x-forwarded-for') || '0.0.0.0'
    const ua = req.headers.get('user-agent') || ''
    const ipHash = await sha256Hex(String(ip))
    const uaHash = await sha256Hex(ua)

    if (action === 'like') {
      if (anonId) {
        await query(
          `INSERT INTO likes(target_type, target_id, anon_id, ip_hash, ua_hash, status)
           VALUES ($1,$2,$3,$4,$5,'liked')
           ON CONFLICT (target_type, target_id, anon_id) DO UPDATE SET status='liked'`,
          [targetType, idNum, anonId, ipHash, uaHash]
        )
      } else {
        await query(
          `INSERT INTO likes(target_type, target_id, anon_id, ip_hash, ua_hash, status)
           VALUES ($1,$2,NULL,$3,$4,'liked')
           ON CONFLICT (target_type, target_id, ip_hash, ua_hash) DO UPDATE SET status='liked'`,
          [targetType, idNum, ipHash, uaHash]
        )
      }
      await bumpCount(targetType, idNum, +1)
    } else {
      if (anonId) {
        await query(
          `DELETE FROM likes WHERE target_type=$1 AND target_id=$2 AND anon_id=$3`,
          [targetType, idNum, anonId]
        )
      } else {
        await query(
          `DELETE FROM likes WHERE target_type=$1 AND target_id=$2 AND anon_id IS NULL AND ip_hash=$3 AND ua_hash=$4`,
          [targetType, idNum, ipHash, uaHash]
        )
      }
      await bumpCount(targetType, idNum, -1)
    }

    const likesCount = await getCount(targetType, idNum)
    return NextResponse.json({ success: true, liked: action === 'like', likesCount })
  } catch (e: any) {
    console.error('toggle like error', e)
    return NextResponse.json({ error: 'server error', message: e?.message || String(e) }, { status: 500 })
  }
}

async function bumpCount(targetType: string, targetId: number, delta: number) {
  if (targetType === 'blog') {
    await query('UPDATE blog_posts SET likes_count = GREATEST(likes_count + $1, 0) WHERE id=$2', [delta, targetId])
  } else if (targetType === 'artwork') {
    await query('UPDATE artwork_collections SET likes_count = GREATEST(likes_count + $1, 0) WHERE id=$2', [delta, targetId])
  } else if (targetType === 'music') {
    await query('UPDATE music_tracks SET likes_count = GREATEST(likes_count + $1, 0) WHERE id=$2', [delta, targetId])
  }
}

async function getCount(targetType: string, targetId: number) {
  if (targetType === 'blog') {
    const r = await query('SELECT likes_count FROM blog_posts WHERE id=$1', [targetId])
    return r.rows[0]?.likes_count ?? 0
  }
  if (targetType === 'artwork') {
    const r = await query('SELECT likes_count FROM artwork_collections WHERE id=$1', [targetId])
    return r.rows[0]?.likes_count ?? 0
  }
  if (targetType === 'music') {
    const r = await query('SELECT likes_count FROM music_tracks WHERE id=$1', [targetId])
    return r.rows[0]?.likes_count ?? 0
  }
  return 0
}
