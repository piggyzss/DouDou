import { query, getRow } from '../database'

export type TargetType = 'blog' | 'artwork' | 'artwork_image' | 'music' | 'video' | string

export class LikesModel {
  static async getLikesCount(targetType: TargetType, targetId: number): Promise<number> {
    // 从各个表的 likes_count 字段获取数据，而不是从 likes 表计算
    if (targetType === 'blog') {
      const res = await query('SELECT likes_count FROM blog_posts WHERE id = $1', [targetId])
      return res.rows[0]?.likes_count ?? 0
    } else if (targetType === 'artwork') {
      const res = await query('SELECT likes_count FROM artwork_collections WHERE id = $1', [targetId])
      return res.rows[0]?.likes_count ?? 0
    } else if (targetType === 'music') {
      const res = await query('SELECT likes_count FROM music_tracks WHERE id = $1', [targetId])
      return res.rows[0]?.likes_count ?? 0
    } else if (targetType === 'video') {
      const res = await query('SELECT likes_count FROM videos WHERE id = $1', [targetId])
      return res.rows[0]?.likes_count ?? 0
    }
    return 0
  }

  static async getUserLike(targetType: TargetType, targetId: number, ipHash?: string, uaHash?: string, anonId?: string) {
    const res = await getRow(
      `SELECT id, status FROM likes WHERE target_type = $1 AND target_id = $2 AND (
         (ip_hash = $3 AND ua_hash = $4) OR (anon_id IS NOT NULL AND anon_id = $5)
       ) ORDER BY created_at DESC LIMIT 1`,
      [targetType, targetId, ipHash || null, uaHash || null, anonId || null]
    )
    return res as { id: number; status: string } | null
  }

  static async setLike(targetType: TargetType, targetId: number, like: boolean, ipHash?: string, uaHash?: string, anonId?: string) {
    const existing = await this.getUserLike(targetType, targetId, ipHash, uaHash, anonId)
    const status = like ? 'liked' : 'unliked'
    if (existing) {
      await query(`UPDATE likes SET status = $1 WHERE id = $2`, [status, existing.id])
    } else {
      await query(
        `INSERT INTO likes (target_type, target_id, anon_id, ip_hash, ua_hash, status) VALUES ($1,$2,$3,$4,$5,$6)`,
        [targetType, targetId, anonId || null, ipHash || null, uaHash || null, status]
      )
    }
    const likesCount = await this.getLikesCount(targetType, targetId)
    return { liked: like, likesCount }
  }
}


