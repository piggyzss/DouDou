import { query } from '../lib/database'

async function addPublishedAtColumn() {
  try {
    console.log('🔧 开始为 blog_posts 表添加 published_at 字段...')

    // 检查字段是否已存在
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'blog_posts' AND column_name = 'published_at'
    `)

    if (checkColumn.rows.length > 0) {
      console.log('✅ published_at 字段已存在，无需添加')
      return
    }

    // 添加 published_at 字段
    await query(`
      ALTER TABLE blog_posts 
      ADD COLUMN published_at TIMESTAMP
    `)

    console.log('✅ published_at 字段添加成功')

    // 为已发布的文章设置 published_at 时间
    const updateResult = await query(`
      UPDATE blog_posts 
      SET published_at = created_at 
      WHERE status = 'published' AND published_at IS NULL
    `)

    console.log(`✅ 已为 ${updateResult.rowCount || 0} 篇已发布文章设置 published_at 时间`)

    console.log('🎉 迁移完成！')

  } catch (error) {
    console.error('❌ 迁移失败:', error)
    process.exit(1)
  }
}

addPublishedAtColumn()
