import { query, getRow } from '../lib/database'

async function testDatabaseConnection() {
  console.log('🧪 Testing database connection...\n')

  try {
    // 测试基本连接
    console.log('📊 Testing basic connection...')
    const result = await query('SELECT NOW() as current_time')
    console.log('✅ Database connected successfully!')
    console.log(`   Current time: ${result.rows[0].current_time}`)

    // 测试表是否存在
    console.log('\n📋 Testing table existence...')
    const tables = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `)

    console.log('✅ Found tables:')
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`)
    })

    // 测试作品集表
    console.log('\n🎨 Testing artwork_collections table...')
    const artworkCount = await query('SELECT COUNT(*) as count FROM artwork_collections')
    console.log(`   Total artwork collections: ${artworkCount.rows[0].count}`)

    // 测试博客表
    console.log('\n📝 Testing blog_posts table...')
    const blogCount = await query('SELECT COUNT(*) as count FROM blog_posts')
    console.log(`   Total blog posts: ${blogCount.rows[0].count}`)

    console.log('\n🎉 All database tests completed successfully!')

  } catch (error) {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  }
}

// 运行测试
testDatabaseConnection()
