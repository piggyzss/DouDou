#!/usr/bin/env ts-node

/**
 * 测试 Vercel Postgres 数据库连接
 */

import { Pool } from 'pg'

async function testDatabaseConnection() {
  console.log('🔍 测试 Vercel Postgres 数据库连接...\n')

  // 检查环境变量
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!dbUrl) {
    console.error('❌ 未找到数据库连接字符串')
    console.log('请确保设置了以下环境变量之一：')
    console.log('  - DATABASE_URL')
    console.log('  - POSTGRES_URL')
    process.exit(1)
  }

  console.log('✅ 找到数据库连接字符串')
  console.log(`📍 连接地址: ${dbUrl.replace(/\/\/.*@/, '//***:***@')}`)

  try {
    // 创建连接池
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false
      }
    })

    console.log('🔌 尝试连接数据库...')

    // 测试连接
    const client = await pool.connect()
    console.log('✅ 数据库连接成功！')

    // 获取数据库信息
    const result = await client.query('SELECT version(), current_database(), current_user')
    const { version, current_database, current_user } = result.rows[0]

    console.log('\n📊 数据库信息:')
    console.log(`  - 版本: ${version}`)
    console.log(`  - 数据库: ${current_database}`)
    console.log(`  - 用户: ${current_user}`)

    // 检查表是否存在
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    console.log('\n📋 现有表:')
    if (tablesResult.rows.length === 0) {
      console.log('  - 暂无表（需要运行数据库初始化）')
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`)
      })
    }

    client.release()
    await pool.end()

    console.log('\n🎉 数据库连接测试完成！')

  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  testDatabaseConnection()
}

export default testDatabaseConnection
