import { query } from '../lib/database'

async function fixBlogPublishedAt() {
  console.log('🔍 检查并修复 blog_posts 表的 published_at 字段...')
  
  try {
    // 检查 published_at 字段是否存在
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'blog_posts' 
      AND column_name = 'published_at'
    `)
    
    if (checkColumn.rows.length === 0) {
      console.log('❌ published_at 字段不存在，正在添加...')
      
      // 添加 published_at 字段
      await query('ALTER TABLE blog_posts ADD COLUMN published_at TIMESTAMP')
      console.log('✅ 已添加 published_at 字段')
      
      // 为已发布的文章设置 published_at 时间
      await query(`
        UPDATE blog_posts 
        SET published_at = created_at 
        WHERE status = 'published' AND published_at IS NULL
      `)
      console.log('✅ 已为现有发布文章设置 published_at 时间')
      
    } else {
      console.log('✅ published_at 字段已存在')
    }
    
    // 检查其他可能缺少的字段
    const requiredFields = [
      { name: 'excerpt', type: 'TEXT' },
      { name: 'cover_url', type: 'VARCHAR(500)' },
      { name: 'views_count', type: 'INTEGER', default: '0' },
      { name: 'likes_count', type: 'INTEGER', default: '0' }
    ]
    
    for (const field of requiredFields) {
      const checkField = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = $1
      `, [field.name])
      
      if (checkField.rows.length === 0) {
        let sql = `ALTER TABLE blog_posts ADD COLUMN ${field.name} ${field.type}`
        if (field.default) {
          sql += ` DEFAULT ${field.default}`
        }
        
        await query(sql)
        console.log(`✅ 已添加 ${field.name} 字段`)
      } else {
        console.log(`✅ ${field.name} 字段已存在`)
      }
    }
    
    // 创建必要的索引
    await query('CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at)')
    console.log('✅ 已创建 published_at 索引')
    
    console.log('\n🎉 blog_posts 表修复完成!')
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error)
    throw error
  }
}

fixBlogPublishedAt().catch(console.error)
