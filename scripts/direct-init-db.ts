#!/usr/bin/env ts-node

import dotenv from 'dotenv'
import { Pool } from 'pg'

// 加载环境变量
dotenv.config({ path: '.env.local' })

async function createTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  })

  try {
    console.log('🚀 正在连接数据库...')
    
    // 测试连接
    await pool.query('SELECT NOW()')
    console.log('✅ 数据库连接成功')

    console.log('📋 正在创建表...')

    // 创建作品集表
    await pool.query(`
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
    console.log('✅ artwork_collections 表创建完成')

    // 创建图片资源表
    await pool.query(`
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
    console.log('✅ artwork_images 表创建完成')

    // 创建点赞记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS artwork_likes (
        id SERIAL PRIMARY KEY,
        collection_id INTEGER REFERENCES artwork_collections(id) ON DELETE CASCADE,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(collection_id, ip_address)
      )
    `)
    console.log('✅ artwork_likes 表创建完成')

    // 创建音乐表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS music_tracks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        tags TEXT[],
        audio_url VARCHAR(500) NOT NULL,
        cover_url VARCHAR(500),
        duration INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active'
      )
    `)
    console.log('✅ music_tracks 表创建完成')

    // 创建视频表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        tags TEXT[],
        video_url VARCHAR(500) NOT NULL,
        cover_url VARCHAR(500),
        duration INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active'
      )
    `)
    console.log('✅ videos 表创建完成')

    // 创建博客文章表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        cover_url VARCHAR(500),
        tags TEXT[],
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        views_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0
      )
    `)
    console.log('✅ blog_posts 表创建完成')

    // 创建点赞表（匿名）
    await pool.query(`
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
    console.log('✅ likes 表创建完成')

    // 创建索引
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique_anon ON likes(target_type, target_id, anon_id) WHERE anon_id IS NOT NULL`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id)`)
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique_all ON likes(target_type, target_id, anon_id)`)
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique_ipua ON likes(target_type, target_id, ip_hash, ua_hash)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_artwork_collections_created_at ON artwork_collections(created_at)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_artwork_collections_tags ON artwork_collections USING GIN(tags)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_artwork_images_collection_id ON artwork_images(collection_id)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_music_tracks_created_at ON music_tracks(created_at)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_music_tracks_status ON music_tracks(status)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status)`)
    
    console.log('✅ 索引创建完成')

    // 验证表创建
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    console.log('\n📋 已创建的表:')
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })

    console.log('\n🎉 数据库初始化完成！')

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// 运行初始化
createTables().catch(console.error)
