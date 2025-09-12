import { Pool } from 'pg'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function fixActualCloudDB() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 环境变量未设置')
    process.exit(1)
  }
  
  console.log('🔗 连接到云数据库...')
  console.log('🔗 URL:', databaseUrl.replace(/:[^:]*@/, ':****@'))
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  })
  
  try {
    // 测试连接
    const client = await pool.connect()
    const dbInfo = await client.query('SELECT current_database(), current_user, version()')
    console.log('📊 连接成功!', dbInfo.rows[0])
    
    console.log('\n🗑️  删除现有的 blog_posts 表...')
    await client.query('DROP TABLE IF EXISTS blog_posts CASCADE;')
    console.log('✅ 旧表已删除')
    
    console.log('\n🆕 创建新的 blog_posts 表（包含所有字段）...')
    await client.query(`
      CREATE TABLE blog_posts (
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
        published_at TIMESTAMP,
        views_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        author_id INTEGER,
        featured_image_url VARCHAR(500),
        meta_title VARCHAR(255),
        meta_description TEXT
      );
    `)
    console.log('✅ 新表创建完成')
    
    // 创建索引
    console.log('\n🔍 创建索引...')
    await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);')
    console.log('✅ 索引创建完成')
    
    // 验证表结构
    console.log('\n📋 验证表结构...')
    const columns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'blog_posts'
      ORDER BY ordinal_position;
    `)
    
    console.log('字段列表:')
    columns.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.column_name}: ${col.data_type}`)
    })
    
    // 测试查询
    console.log('\n🧪 测试查询...')
    const testResult = await client.query(`
      SELECT COUNT(*) as total
      FROM blog_posts
      WHERE status = 'published'
      ORDER BY published_at DESC, created_at DESC
      LIMIT 1;
    `)
    console.log('✅ 查询成功!', testResult.rows[0])
    
    client.release()
    
  } catch (error) {
    console.error('❌ 修复失败:', error instanceof Error ? error.message : error)
    throw error
  } finally {
    await pool.end()
  }
}

fixActualCloudDB()
  .then(() => {
    console.log('\n🎉 云数据库修复完成!')
    console.log('💡 现在重启开发服务器，博客页面应该可以正常访问')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 修复异常:', error)
    process.exit(1)
  })

