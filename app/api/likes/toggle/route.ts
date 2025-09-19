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
    }

    // 重新计算并更新 likes_count
    await updateLikesCount(targetType, idNum)
    
    // 获取用户当前状态和总数
    const userLiked = await getUserLikeStatus(targetType, idNum, ipHash, uaHash, anonId)
    const likesCount = await getActualLikesCount(targetType, idNum)
    
    return NextResponse.json({ success: true, liked: userLiked, likesCount })
  } catch (e: any) {
    console.error('toggle like error', e)
    return NextResponse.json({ error: 'server error', message: e?.message || String(e) }, { status: 500 })
  }
}

// 重新计算并更新 likes_count 字段
async function updateLikesCount(targetType: string, targetId: number) {
  try {
    // 从 likes 表计算实际数量
    const countResult = await query(
      'SELECT COUNT(*) as count FROM likes WHERE target_type=$1 AND target_id=$2 AND status=$3',
      [targetType, targetId, 'liked']
    )
    const actualCount = parseInt(countResult.rows[0]?.count || '0')
    
    // 更新对应表的 likes_count 字段
    if (targetType === 'blog') {
      await query('UPDATE blog_posts SET likes_count = $1 WHERE id=$2', [actualCount, targetId])
    } else if (targetType === 'artwork') {
      await query('UPDATE artwork_collections SET likes_count = $1 WHERE id=$2', [actualCount, targetId])
    } else if (targetType === 'music') {
      await query('UPDATE music_tracks SET likes_count = $1 WHERE id=$2', [actualCount, targetId])
    } else if (targetType === 'video') {
      await query('UPDATE videos SET likes_count = $1 WHERE id=$2', [actualCount, targetId])
    }
  } catch (error) {
    console.error('Error updating likes count:', error)
    throw error
  }
}

// 获取用户是否喜欢过
async function getUserLikeStatus(targetType: string, targetId: number, ipHash: string, uaHash: string, anonId: string | null) {
  try {
    const result = await query(
      `SELECT status FROM likes WHERE target_type = $1 AND target_id = $2 AND (
         (ip_hash = $3 AND ua_hash = $4) OR (anon_id IS NOT NULL AND anon_id = $5)
       ) ORDER BY created_at DESC LIMIT 1`,
      [targetType, targetId, ipHash, uaHash, anonId]
    )
    return result.rows[0]?.status === 'liked'
  } catch (error) {
    console.error('Error getting user like status:', error)
    return false
  }
}

// 获取实际的喜欢数量
async function getActualLikesCount(targetType: string, targetId: number) {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM likes WHERE target_type=$1 AND target_id=$2 AND status=$3',
      [targetType, targetId, 'liked']
    )
    return parseInt(result.rows[0]?.count || '0')
  } catch (error) {
    console.error('Error getting actual likes count:', error)
    return 0
  }
}
