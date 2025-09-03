import { Pool, PoolClient } from 'pg'

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'doudou_db',
  user: process.env.DB_USER || 'doudou_user',
  password: process.env.DB_PASSWORD || 'doudou_password',
  max: 20, // 连接池最大连接数
  idleTimeoutMillis: 30000, // 连接空闲超时
  connectionTimeoutMillis: 2000, // 连接超时
}

// 创建连接池
const pool = new Pool(dbConfig)

// 连接池事件监听
pool.on('connect', (client: PoolClient) => {
  console.log('✅ Database connected')
})

pool.on('error', (err: Error, client: PoolClient) => {
  console.error('❌ Database connection error:', err)
})

pool.on('remove', (client: PoolClient) => {
  console.log('🔌 Database connection removed')
})

// 数据库操作工具函数
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log(`📊 Query executed in ${duration}ms: ${text}`)
    return res
  } catch (error) {
    console.error('❌ Query error:', error)
    throw error
  }
}

export async function getRow(text: string, params?: any[]) {
  const res = await query(text, params)
  return res.rows[0]
}

export async function getRows(text: string, params?: any[]) {
  const res = await query(text, params)
  return res.rows
}

export async function transaction(callback: (client: PoolClient) => Promise<any>) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function closePool() {
  await pool.end()
}

// 数据库初始化
export async function initDatabase() {
  try {
    // 创建表结构
    await createTables()
    console.log('✅ Database tables created successfully')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

async function createTables() {
  // 创建作品集表
  await query(`
    CREATE TABLE IF NOT EXISTS artwork_collections (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      tags TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      likes_count INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'active',
      cover_image_url VARCHAR(500)
    )
  `)

  // 创建图片资源表
  await query(`
    CREATE TABLE IF NOT EXISTS artwork_images (
      id SERIAL PRIMARY KEY,
      collection_id INTEGER REFERENCES artwork_collections(id) ON DELETE CASCADE,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_url VARCHAR(500) NOT NULL,
      thumbnail_url VARCHAR(500),
      file_size INTEGER,
      width INTEGER,
      height INTEGER,
      mime_type VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sort_order INTEGER DEFAULT 0
    )
  `)

  // 创建点赞记录表
  await query(`
    CREATE TABLE IF NOT EXISTS artwork_likes (
      id SERIAL PRIMARY KEY,
      collection_id INTEGER REFERENCES artwork_collections(id) ON DELETE CASCADE,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(collection_id, ip_address)
    )
  `)

  // 创建博客文章表
  await query(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      tags TEXT[],
      status VARCHAR(20) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      views_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0
    )
  `)

  // 创建索引
  await query(`CREATE INDEX IF NOT EXISTS idx_artwork_collections_created_at ON artwork_collections(created_at)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_artwork_collections_tags ON artwork_collections USING GIN(tags)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_artwork_images_collection_id ON artwork_images(collection_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)`)
}

// 导出数据库实例
export const db = {
  query: query,
  getRow: getRow,
  getRows: getRows,
  transaction: transaction,
  end: closePool
}

export default pool
