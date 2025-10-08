import { query, getRow, getRows } from "../database";

// 应用基础信息
export interface App {
  id: number;
  name: string;
  slug: string;
  description: string;
  tags: string[];
  type: "app" | "miniprogram" | "game" | "plugin";
  platform: "web" | "mobile" | "wechat";
  status: "development" | "beta" | "online";

  // 体验相关
  experience_method: "download" | "qrcode";
  download_url?: string;
  qr_code_url?: string;

  // 媒体文件
  cover_image_url?: string;
  video_url?: string;

  // 统计数据
  dau: number;
  downloads: number;
  likes_count: number;
  trend: string;

  // 时间戳
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// 创建应用数据
export interface CreateAppData {
  name: string;
  description: string;
  tags: string[];
  type: "app" | "miniprogram" | "game" | "plugin";
  platform: "web" | "mobile" | "wechat";
  status: "development" | "beta" | "online";
  experience_method: "download" | "qrcode";
  download_url?: string;
  qr_code_url?: string;
  cover_image_url?: string;
  video_url?: string;
}

// 更新应用数据
export interface UpdateAppData {
  name?: string;
  description?: string;
  tags?: string[];
  type?: "app" | "miniprogram" | "game";
  platform?: "web" | "mobile" | "wechat";
  status?: "development" | "beta" | "online";
  experience_method?: "download" | "qrcode";
  download_url?: string;
  qr_code_url?: string;
  cover_image_url?: string;
  video_url?: string;
}

// 应用统计数据
export interface AppStats {
  app_id: number;
  date: string;
  dau: number;
  downloads: number;
  created_at: string;
}

// 应用标签
export interface AppTag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  created_at: string;
}

// 分页查询结果
export interface AppListResult {
  apps: App[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// 生成slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .normalize("NFC");
}

export class AppModel {
  // 创建应用
  static async create(data: CreateAppData): Promise<App> {
    const slug = generateSlug(data.name);
    const result = await query(
      `INSERT INTO apps (name, slug, description, tags, type, platform, status, experience_method, download_url, qr_code_url, cover_image_url, video_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        data.name,
        slug,
        data.description,
        data.tags,
        data.type,
        data.platform,
        data.status,
        data.experience_method,
        data.download_url,
        data.qr_code_url,
        data.cover_image_url,
        data.video_url,
      ],
    );
    return result.rows[0];
  }

  // 根据ID获取应用
  static async findById(id: number): Promise<App | null> {
    return await getRow("SELECT * FROM apps WHERE id = $1", [id]);
  }

  // 根据slug获取应用
  static async findBySlug(slug: string): Promise<App | null> {
    return await getRow("SELECT * FROM apps WHERE slug = $1", [slug]);
  }

  // 获取应用列表（分页）
  static async findAll(
    options: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
      platform?: string;
      tag?: string;
    } = {},
  ): Promise<AppListResult> {
    const {
      page = 1,
      limit = 10,
      status = "online",
      type,
      platform,
      tag,
    } = options;

    const offset = (page - 1) * limit;
    const conditions = ["status = $1"];
    const params: any[] = [status];
    let paramIndex = 2;

    if (type) {
      conditions.push(`type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (platform) {
      conditions.push(`platform = $${paramIndex}`);
      params.push(platform);
      paramIndex++;
    }

    if (tag) {
      conditions.push(`$${paramIndex} = ANY(tags)`);
      params.push(tag);
      paramIndex++;
    }

    const whereClause = conditions.join(" AND ");

    // 获取总数
    const countResult = await query(
      `SELECT COUNT(*) FROM apps WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    // 获取数据
    const apps = await getRows(
      `SELECT * FROM apps
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    return {
      apps,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // 更新应用
  static async update(id: number, data: UpdateAppData): Promise<App | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(data.name);
      paramIndex++;
    }

    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(data.description);
      paramIndex++;
    }

    if (data.tags !== undefined) {
      fields.push(`tags = $${paramIndex}`);
      values.push(data.tags);
      paramIndex++;
    }

    if (data.type !== undefined) {
      fields.push(`type = $${paramIndex}`);
      values.push(data.type);
      paramIndex++;
    }

    if (data.platform !== undefined) {
      fields.push(`platform = $${paramIndex}`);
      values.push(data.platform);
      paramIndex++;
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex}`);
      values.push(data.status);
      paramIndex++;
    }

    if (data.experience_method !== undefined) {
      fields.push(`experience_method = $${paramIndex}`);
      values.push(data.experience_method);
      paramIndex++;
    }

    if (data.download_url !== undefined) {
      fields.push(`download_url = $${paramIndex}`);
      values.push(data.download_url);
      paramIndex++;
    }

    if (data.qr_code_url !== undefined) {
      fields.push(`qr_code_url = $${paramIndex}`);
      values.push(data.qr_code_url);
      paramIndex++;
    }

    if (data.cover_image_url !== undefined) {
      fields.push(`cover_image_url = $${paramIndex}`);
      values.push(data.cover_image_url);
      paramIndex++;
    }

    if (data.video_url !== undefined) {
      fields.push(`video_url = $${paramIndex}`);
      values.push(data.video_url);
      paramIndex++;
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE apps
       SET ${fields.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values,
    );

    return result.rows[0] || null;
  }

  // 删除应用
  static async delete(id: number): Promise<boolean> {
    const result = await query("DELETE FROM apps WHERE id = $1", [id]);
    return (result.rowCount || 0) > 0;
  }

  // 记录点赞
  static async recordLike(
    appId: number,
    ipAddress: string,
    userAgent?: string,
  ): Promise<boolean> {
    try {
      await query(
        `INSERT INTO app_likes (app_id, ip_address, user_agent)
         VALUES ($1, $2, $3)`,
        [appId, ipAddress, userAgent],
      );

      // 增加点赞数
      await this.incrementLikes(appId);
      return true;
    } catch (error) {
      // 如果违反唯一约束，说明已经点赞过了
      return false;
    }
  }

  // 检查是否已点赞
  static async hasLiked(appId: number, ipAddress: string): Promise<boolean> {
    const result = await getRow(
      "SELECT id FROM app_likes WHERE app_id = $1 AND ip_address = $2",
      [appId, ipAddress],
    );
    return !!result;
  }

  // 增加点赞数
  static async incrementLikes(id: number): Promise<void> {
    await query("UPDATE apps SET likes_count = likes_count + 1 WHERE id = $1", [
      id,
    ]);
  }

  // 更新点赞数
  static async updateLikes(id: number, likesCount: number): Promise<void> {
    await query(
      "UPDATE apps SET likes_count = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [likesCount, id],
    );
  }

  // 获取应用统计数据
  static async getStats(appId: number, days: number = 7): Promise<AppStats[]> {
    return await getRows(
      `SELECT * FROM app_daily_stats
       WHERE app_id = $1
       ORDER BY date DESC
       LIMIT $2`,
      [appId, days],
    );
  }

  // 更新每日统计
  static async updateDailyStats(
    appId: number,
    date: string,
    stats: Partial<AppStats>,
  ): Promise<void> {
    await query(
      `INSERT INTO app_daily_stats (app_id, date, dau, downloads)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (app_id, date)
       DO UPDATE SET
         dau = EXCLUDED.dau,
         downloads = EXCLUDED.downloads,
         created_at = CURRENT_TIMESTAMP`,
      [appId, date, stats.dau || 0, stats.downloads || 0],
    );
  }

  // 获取标签列表
  static async getTags(): Promise<AppTag[]> {
    return await getRows("SELECT * FROM app_tags ORDER BY name ASC");
  }

  // 创建标签
  static async createTag(data: {
    name: string;
    description?: string;
    color?: string;
  }): Promise<AppTag> {
    const slug = generateSlug(data.name);
    const result = await query(
      `INSERT INTO app_tags (name, slug, description, color)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, slug, data.description, data.color || "#6B7280"],
    );
    return result.rows[0];
  }

  // 搜索应用
  static async search(
    queryText: string,
    options: {
      page?: number;
      limit?: number;
      type?: string;
      platform?: string;
    } = {},
  ): Promise<AppListResult> {
    const { page = 1, limit = 10, type, platform } = options;

    const offset = (page - 1) * limit;
    const conditions = [
      "status = $1",
      "(name ILIKE $2 OR description ILIKE $2)",
    ];
    const params: any[] = ["online", `%${queryText}%`];
    let paramIndex = 3;

    if (type) {
      conditions.push(`type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (platform) {
      conditions.push(`platform = $${paramIndex}`);
      params.push(platform);
      paramIndex++;
    }

    const whereClause = conditions.join(" AND ");

    // 获取总数
    const countResult = await query(
      `SELECT COUNT(*) FROM apps WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    // 获取数据
    const apps = await getRows(
      `SELECT * FROM apps
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    return {
      apps,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
