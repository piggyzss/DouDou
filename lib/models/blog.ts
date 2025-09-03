import { db } from '../database'

export interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  published_at?: string
  views_count: number
  likes_count: number
  comments_count: number
}

export interface BlogTag {
  id: number
  name: string
  slug: string
  description?: string
  created_at: string
}

export interface BlogComment {
  id: number
  post_id: number
  author_name: string
  author_email?: string
  content: string
  status: 'pending' | 'approved' | 'spam'
  created_at: string
  updated_at: string
}

export class BlogModel {
  // 创建博客文章
  static async create(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'likes_count' | 'comments_count'>): Promise<BlogPost> {
    const result = await db.query(
      `INSERT INTO blog_posts (title, slug, content, excerpt, status, published_at) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [post.title, post.slug, post.content, post.excerpt, post.status, post.published_at || new Date().toISOString()]
    )
    return result.rows[0]
  }

  // 根据ID查找博客文章
  static async findById(id: number): Promise<BlogPost | null> {
    const result = await db.query('SELECT * FROM blog_posts WHERE id = $1', [id])
    return result.rows[0] || null
  }

  // 根据slug查找博客文章
  static async findBySlug(slug: string): Promise<BlogPost | null> {
    const result = await db.query('SELECT * FROM blog_posts WHERE slug = $1', [slug])
    return result.rows[0] || null
  }

  // 获取所有已发布的博客文章
  static async findAllPublished(page: number = 1, limit: number = 10): Promise<{ posts: (BlogPost & { tags: string[] })[], total: number, totalPages: number, currentPage: number }> {
    const offset = (page - 1) * limit
    
    // 获取总数
    const countResult = await db.query('SELECT COUNT(*) FROM blog_posts WHERE status = $1', ['published'])
    const total = parseInt(countResult.rows[0].count)
    const totalPages = Math.ceil(total / limit)
    
    // 获取分页数据
    const result = await db.query(
      `SELECT * FROM blog_posts 
       WHERE status = $1 
       ORDER BY published_at DESC, created_at DESC 
       LIMIT $2 OFFSET $3`,
      ['published', limit, offset]
    )
    
    // 为每篇文章获取标签
    const postsWithTags = await Promise.all(
      result.rows.map(async (post) => {
        const tags = await this.getPostTags(post.id)
        return {
          ...post,
          tags: tags.map(tag => tag.name)
        }
      })
    )
    
    return {
      posts: postsWithTags,
      total,
      totalPages,
      currentPage: page
    }
  }

  // 更新博客文章
  static async update(id: number, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
    const values = Object.values(updates).filter((_, index) => fields[index])
    
    if (fields.length === 0) return null
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
    const query = `UPDATE blog_posts SET ${setClause} WHERE id = $1 RETURNING *`
    
    const result = await db.query(query, [id, ...values])
    return result.rows[0] || null
  }

  // 删除博客文章
  static async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM blog_posts WHERE id = $1', [id])
    return (result.rowCount || 0) > 0
  }

  // 增加浏览量
  static async incrementViews(id: number): Promise<void> {
    await db.query('UPDATE blog_posts SET views_count = views_count + 1 WHERE id = $1', [id])
  }

  // 创建标签
  static async createTag(tag: Omit<BlogTag, 'id' | 'created_at'>): Promise<BlogTag> {
    const result = await db.query(
      'INSERT INTO blog_tags (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
      [tag.name, tag.slug, tag.description]
    )
    return result.rows[0]
  }

  // 根据slug查找标签
  static async findTagBySlug(slug: string): Promise<BlogTag | null> {
    const result = await db.query('SELECT * FROM blog_tags WHERE slug = $1', [slug])
    return result.rows[0] || null
  }

  // 获取所有标签
  static async getAllTags(): Promise<BlogTag[]> {
    const result = await db.query('SELECT * FROM blog_tags ORDER BY name')
    return result.rows
  }

  // 为博客文章添加标签
  static async addTagToPost(postId: number, tagId: number): Promise<void> {
    await db.query(
      'INSERT INTO blog_post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [postId, tagId]
    )
  }

  // 获取博客文章的所有标签
  static async getPostTags(postId: number): Promise<BlogTag[]> {
    const result = await db.query(
      `SELECT t.* FROM blog_tags t 
       JOIN blog_post_tags pt ON t.id = pt.tag_id 
       WHERE pt.post_id = $1 
       ORDER BY t.name`,
      [postId]
    )
    return result.rows
  }

  // 创建评论
  static async createComment(comment: Omit<BlogComment, 'id' | 'created_at' | 'updated_at'>): Promise<BlogComment> {
    const result = await db.query(
      'INSERT INTO blog_comments (post_id, author_name, author_email, content, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [comment.post_id, comment.author_name, comment.author_email, comment.content, comment.status]
    )
    return result.rows[0]
  }

  // 获取博客文章的评论
  static async getPostComments(postId: number, status: 'approved' | 'pending' | 'spam' = 'approved'): Promise<BlogComment[]> {
    const result = await db.query(
      'SELECT * FROM blog_comments WHERE post_id = $1 AND status = $2 ORDER BY created_at DESC',
      [postId, status]
    )
    return result.rows
  }

  // 更新评论状态
  static async updateCommentStatus(id: number, status: 'pending' | 'approved' | 'spam'): Promise<BlogComment | null> {
    const result = await db.query(
      'UPDATE blog_comments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )
    return result.rows[0] || null
  }
}
