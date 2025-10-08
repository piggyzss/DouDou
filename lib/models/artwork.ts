import { query, getRow, getRows } from "../database";

export interface ArtworkCollection {
  id: number;
  title: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  likes_count: number;
  views_count: number;
  status: "active" | "draft" | "archived";
  cover_image_url?: string;
}

export interface ArtworkImage {
  id: number;
  collection_id: number;
  filename: string;
  original_name: string;
  file_url: string;
  thumbnail_url?: string;
  file_size?: number;
  width?: number;
  height?: number;
  mime_type?: string;
  created_at: string;
  sort_order: number;
}

export interface CreateArtworkData {
  title: string;
  description?: string;
  tags: string[];
  cover_image_url?: string;
}

export interface UpdateArtworkData {
  title?: string;
  description?: string;
  tags?: string[];
  cover_image_url?: string;
  status?: "active" | "draft" | "archived";
}

export class ArtworkModel {
  // 创建作品集
  static async create(data: CreateArtworkData): Promise<ArtworkCollection> {
    const result = await query(
      `INSERT INTO artwork_collections (title, description, tags, cover_image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.title, data.description, data.tags, data.cover_image_url],
    );
    return result.rows[0];
  }

  // 根据ID获取作品集
  static async findById(id: number): Promise<ArtworkCollection | null> {
    return await getRow("SELECT * FROM artwork_collections WHERE id = $1", [
      id,
    ]);
  }

  // 获取所有作品集（分页）
  static async findAll(
    page: number = 1,
    limit: number = 10,
    status: string = "active",
  ): Promise<{
    collections: ArtworkCollection[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const offset = (page - 1) * limit;

    // 获取总数
    const countResult = await query(
      "SELECT COUNT(*) FROM artwork_collections WHERE status = $1",
      [status],
    );
    const total = parseInt(countResult.rows[0].count);

    // 获取数据
    const collections = await getRows(
      `SELECT * FROM artwork_collections
       WHERE status = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset],
    );

    return {
      collections,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // 更新作品集
  static async update(
    id: number,
    data: UpdateArtworkData,
  ): Promise<ArtworkCollection | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex}`);
      values.push(data.title);
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

    if (data.cover_image_url !== undefined) {
      fields.push(`cover_image_url = $${paramIndex}`);
      values.push(data.cover_image_url);
      paramIndex++;
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex}`);
      values.push(data.status);
      paramIndex++;
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE artwork_collections
       SET ${fields.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values,
    );

    return result.rows[0] || null;
  }

  // 删除作品集
  static async delete(id: number): Promise<boolean> {
    const result = await query(
      "DELETE FROM artwork_collections WHERE id = $1",
      [id],
    );
    return (result.rowCount || 0) > 0;
  }

  // 增加点赞数
  static async incrementLikes(id: number): Promise<void> {
    await query(
      "UPDATE artwork_collections SET likes_count = likes_count + 1 WHERE id = $1",
      [id],
    );
  }

  // 直接设置点赞数
  static async updateLikes(id: number, likesCount: number): Promise<void> {
    await query(
      "UPDATE artwork_collections SET likes_count = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [likesCount, id],
    );
  }

  // 增加浏览数
  static async incrementViews(id: number): Promise<void> {
    await query(
      "UPDATE artwork_collections SET views_count = views_count + 1 WHERE id = $1",
      [id],
    );
  }

  // 记录点赞
  static async recordLike(
    collectionId: number,
    ipAddress: string,
    userAgent?: string,
  ): Promise<boolean> {
    try {
      await query(
        `INSERT INTO artwork_likes (collection_id, ip_address, user_agent)
         VALUES ($1, $2, $3)`,
        [collectionId, ipAddress, userAgent],
      );

      // 增加点赞数
      await this.incrementLikes(collectionId);
      return true;
    } catch (error) {
      // 如果违反唯一约束，说明已经点赞过了
      return false;
    }
  }

  // 检查是否已点赞
  static async hasLiked(
    collectionId: number,
    ipAddress: string,
  ): Promise<boolean> {
    const result = await getRow(
      "SELECT id FROM artwork_likes WHERE collection_id = $1 AND ip_address = $2",
      [collectionId, ipAddress],
    );
    return !!result;
  }

  // 获取作品集的所有图片
  static async getImages(collectionId: number): Promise<ArtworkImage[]> {
    return await getRows(
      `SELECT * FROM artwork_images
       WHERE collection_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
      [collectionId],
    );
  }

  // 添加图片到作品集
  static async addImage(
    collectionId: number,
    imageData: {
      filename: string;
      original_name: string;
      file_url: string;
      thumbnail_url?: string;
      file_size?: number;
      width?: number;
      height?: number;
      mime_type?: string;
      sort_order?: number;
    },
  ): Promise<ArtworkImage> {
    const result = await query(
      `INSERT INTO artwork_images
       (collection_id, filename, original_name, file_url, thumbnail_url, file_size, width, height, mime_type, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        collectionId,
        imageData.filename,
        imageData.original_name,
        imageData.file_url,
        imageData.thumbnail_url,
        imageData.file_size,
        imageData.width,
        imageData.height,
        imageData.mime_type,
        imageData.sort_order || 0,
      ],
    );
    return result.rows[0];
  }

  // 删除图片
  static async deleteImage(imageId: number): Promise<boolean> {
    const result = await query("DELETE FROM artwork_images WHERE id = $1", [
      imageId,
    ]);
    return (result.rowCount || 0) > 0;
  }

  // 更新图片排序
  static async updateImageOrder(
    imageId: number,
    sortOrder: number,
  ): Promise<void> {
    await query("UPDATE artwork_images SET sort_order = $1 WHERE id = $2", [
      sortOrder,
      imageId,
    ]);
  }

  // 根据标签搜索作品集
  static async findByTags(
    tags: string[],
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    collections: ArtworkCollection[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const offset = (page - 1) * limit;

    // 构建标签查询条件
    const tagConditions = tags
      .map((_, index) => `$${index + 1} = ANY(tags)`)
      .join(" AND ");

    // 获取总数
    const countResult = await query(
      `SELECT COUNT(*) FROM artwork_collections
       WHERE status = 'active' AND ${tagConditions}`,
      tags,
    );
    const total = parseInt(countResult.rows[0].count);

    // 获取数据
    const collections = await getRows(
      `SELECT * FROM artwork_collections
       WHERE status = 'active' AND ${tagConditions}
       ORDER BY created_at DESC
       LIMIT $${tags.length + 1} OFFSET $${tags.length + 2}`,
      [...tags, limit, offset],
    );

    return {
      collections,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
