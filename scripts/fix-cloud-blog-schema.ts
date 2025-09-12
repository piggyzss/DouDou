import { query } from '../lib/database'

async function fixCloudBlogSchema() {
  try {
    console.log('🔧 修复云数据库中的 blog_posts 表结构...')
    
    // 检查当前连接的数据库
    const dbInfo = await query('SELECT current_database(), current_user, version()')
    console.log('📊 当前数据库:', dbInfo.rows[0])
    
    console.log('\n🗑️  删除现有的 blog_posts 表...')
    await query('DROP TABLE IF EXISTS blog_posts CASCADE;')
    console.log('✅ 旧表已删除')
    
    console.log('\n🆕 创建新的 blog_posts 表（包含所有字段）...')
    await query(`
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
    await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);')
    await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);')
    await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);')
    await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);')
    console.log('✅ 索引创建完成')
    
    // 验证表结构
    console.log('\n📋 验证表结构...')
    const columns = await query(`
      SELECT column_name, data_type, is_nullable, column_default
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
    console.log('\n🧪 测试 published_at 字段查询...')
    const testResult = await query(`
      SELECT COUNT(*) as total, 
             COUNT(published_at) as with_published_at
      FROM blog_posts;
    `)
    
    console.log('✅ 查询成功!')
    console.log(`📊 总记录数: ${testResult.rows[0].total}`)
    console.log(`📊 有发布时间的记录: ${testResult.rows[0].with_published_at}`)
    
  } catch (error) {
    console.error('❌ 修复失败:', error instanceof Error ? error.message : error)
    console.error('完整错误:', error)
    throw error
  }
}

fixCloudBlogSchema()
  .then(() => {
    console.log('\n🎉 云数据库 blog_posts 表修复完成!')
    console.log('💡 现在重启开发服务器，博客页面应该可以正常访问')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 修复异常:', error)
    process.exit(1)
  })

