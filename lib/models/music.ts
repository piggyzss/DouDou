import { query, getRow, getRows } from "../database";

export interface MusicTrack {
  id: number;
  title: string;
  tags: string[];
  audio_url: string;
  cover_url?: string;
  duration: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  status: "active" | "draft" | "archived";
}

export interface CreateMusicData {
  title: string;
  tags: string[];
  audio_url: string;
  cover_url?: string;
  duration?: number;
}

export interface UpdateMusicData {
  title?: string;
  tags?: string[];
  audio_url?: string;
  cover_url?: string;
  duration?: number;
  status?: "active" | "draft" | "archived";
}

export class MusicModel {
  static async create(data: CreateMusicData): Promise<MusicTrack> {
    const res = await query(
      `INSERT INTO music_tracks (title, tags, audio_url, cover_url, duration)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.title,
        data.tags,
        data.audio_url,
        data.cover_url,
        data.duration || 0,
      ],
    );
    return res.rows[0];
  }

  static async findById(id: number): Promise<MusicTrack | null> {
    return await getRow("SELECT * FROM music_tracks WHERE id = $1", [id]);
  }

  static async findAll(
    page: number = 1,
    limit: number = 10,
    status: string = "active",
  ) {
    const offset = (page - 1) * limit;
    const count = await query(
      "SELECT COUNT(*) FROM music_tracks WHERE status = $1",
      [status],
    );
    const total = parseInt(count.rows[0].count);
    const rows = await getRows(
      `SELECT * FROM music_tracks WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [status, limit, offset],
    );
    return {
      tracks: rows as MusicTrack[],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  static async delete(id: number): Promise<boolean> {
    const res = await query("DELETE FROM music_tracks WHERE id = $1", [id]);
    return (res.rowCount || 0) > 0;
  }

  static async updateLikes(id: number, likes: number) {
    await query(
      "UPDATE music_tracks SET likes_count = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [likes, id],
    );
  }
}
