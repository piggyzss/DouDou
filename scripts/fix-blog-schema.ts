import { Pool } from 'pg'
import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: '.env.local' })

function getDatabaseConfig() {
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    return {
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  }
  
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'doudou_db',
    user: process.env.DB_USER || 'doudou_user',
    password: process.env.DB_PASSWORD || '',
  }
}

const pool = new Pool(getDatabaseConfig())

async function checkAndFixBlogSchema() {
  console.log('🔍 检查 blog_posts 表结构...')
  
  try {
    // 检查当前表结构
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'blog_posts' 
      ORDER BY ordinal_position
    `)
    
    console.log('\n📊 当前 blog_posts 表结构:')
    console.log('列名 | 数据类型 | 可为空 | 默认值')
    console.log('-'.repeat(60))
    
    const existingColumns = new Set()
    result.rows.forEach(row => {
      existingColumns.add(row.column_name)
      console.log(`${row.column_name} | ${row.data_type} | ${row.is_nullable} | ${row.column_default || 'NULL'}`)
    })
    
    // 检查需要添加的字段
    const requiredColumns = [
      { name: 'published_at', type: 'TIMESTAMP', nullable: true },
      { name: 'excerpt', type: 'TEXT', nullable: true },
      { name: 'cover_url', type: 'VARCHAR(500)', nullable: true },
      { name: 'views_count', type: 'INTEGER', default: '0' },
      { name: 'likes_count', type: 'INTEGER', default: '0' },
      { name: 'comments_count', type: 'INTEGER', default: '0' }
    ]
    
    console.log('\n🔧 检查缺少的字段...')
    const missingColumns = []
    
    for (const col of requiredColumns) {
      if (!existingColumns.has(col.name)) {
        missingColumns.push(col)
        console.log(`❌ 缺少字段: ${col.name}`)
      } else {
        console.log(`✅ 字段存在: ${col.name}`)
      }
    }
    
    // 添加缺少的字段
    if (missingColumns.length > 0) {
      console.log('\n🛠️ 正在添加缺少的字段...')
      
      for (const col of missingColumns) {
        let sql = `ALTER TABLE blog_posts ADD COLUMN ${col.name} ${col.type}`
        
        if (col.default) {
          sql += ` DEFAULT ${col.default}`
        }
        
        console.log(`执行: ${sql}`)
        await pool.query(sql)
        console.log(`✅ 已添加字段: ${col.name}`)
      }
    } else {
      console.log('\n✅ 所有必需字段都已存在!')
    }
    
    // 检查并创建索引
    console.log('\n🔍 检查索引...')
    const indexResult = await pool.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'blog_posts'
    `)
    
    console.log('现有索引:')
    indexResult.rows.forEach(row => {
      console.log(`- ${row.indexname}`)
    })
    
    // 创建缺少的索引
    const requiredIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)',
      'CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)',
      'CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at)',
      'CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at)'
    ]
    
    console.log('\n🛠️ 创建索引...')
    for (const indexSql of requiredIndexes) {
      await pool.query(indexSql)
      console.log(`✅ 索引创建完成: ${indexSql.split(' ON ')[0].split(' ').pop()}`)
    }
    
    console.log('\n🎉 blog_posts 表结构修复完成!')
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error)
  } finally {
    await pool.end()
  }
}

checkAndFixBlogSchema()
