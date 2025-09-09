import { query, getRow, getRows } from '../database'

export interface Video {
  id: number
  title: string
  tags: string[]
  video_url: string
  cover_url?: string
  duration: number
  likes_count: number
  created_at: string
  updated_at: string
  status: 'active' | 'draft' | 'archived'
}

export interface CreateVideoData {
  title: string
  tags: string[]
  video_url: string
  cover_url?: string
  duration?: number
}

export class VideoModel {
  static async create(data: CreateVideoData): Promise<Video> {
    const res = await query(
      `INSERT INTO videos (title, tags, video_url, cover_url, duration)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.title, data.tags, data.video_url, data.cover_url, data.duration || 0]
    )
    return res.rows[0]
  }

  static async findAll(page = 1, limit = 10, status = 'active') {
    const offset = (page - 1) * limit
    const count = await query('SELECT COUNT(*) FROM videos WHERE status = $1', [status])
    const total = parseInt(count.rows[0].count)
    const rows = await getRows(`SELECT * FROM videos WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [status, limit, offset])
    return { videos: rows as Video[], total, totalPages: Math.ceil(total / limit), currentPage: page }
  }

  static async delete(id: number) {
    const res = await query('DELETE FROM videos WHERE id = $1', [id])
    return (res.rowCount || 0) > 0
  }
}


