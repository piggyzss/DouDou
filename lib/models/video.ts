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

  static async getList(): Promise<Video[]> {
    const rows = await getRows('SELECT * FROM videos ORDER BY created_at DESC')
    return rows as Video[]
  }

  static async getById(id: number): Promise<Video | null> {
    const row = await getRow('SELECT * FROM videos WHERE id = $1', [id])
    return row as Video | null
  }

  static async findAll(page = 1, limit = 10, status = 'active') {
    const offset = (page - 1) * limit
    const count = await query('SELECT COUNT(*) FROM videos WHERE status = $1', [status])
    const total = parseInt(count.rows[0].count)
    const rows = await getRows(`SELECT * FROM videos WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [status, limit, offset])
    return { videos: rows as Video[], total, totalPages: Math.ceil(total / limit), currentPage: page }
  }

  static async update(id: number, data: Partial<CreateVideoData & { status: string }>): Promise<Video | null> {
    const fields = []
    const values = []
    let paramCount = 1

    if (data.title) {
      fields.push(`title = $${paramCount++}`)
      values.push(data.title)
    }
    if (data.tags) {
      fields.push(`tags = $${paramCount++}`)
      values.push(data.tags)
    }
    if (data.video_url) {
      fields.push(`video_url = $${paramCount++}`)
      values.push(data.video_url)
    }
    if (data.cover_url !== undefined) {
      fields.push(`cover_url = $${paramCount++}`)
      values.push(data.cover_url)
    }
    if (data.duration !== undefined) {
      fields.push(`duration = $${paramCount++}`)
      values.push(data.duration)
    }
    if (data.status) {
      fields.push(`status = $${paramCount++}`)
      values.push(data.status)
    }

    if (fields.length === 0) {
      return null
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const res = await query(
      `UPDATE videos SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )

    return res.rows[0] as Video | null
  }

  static async delete(id: number) {
    const res = await query('DELETE FROM videos WHERE id = $1', [id])
    return (res.rowCount || 0) > 0
  }

  static async updateLikes(id: number, likes: number) {
    await query('UPDATE videos SET likes_count = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [likes, id])
  }
}


