#!/usr/bin/env ts-node

/**
 * 测试数据库连接脚本
 * 用于验证DATABASE_URL是否正确
 */

import { Pool } from 'pg'

async function testConnection() {
  const databaseUrl = process.env.DATABASE_URL
  
  console.log('🔍 测试数据库连接...')
  console.log('DATABASE_URL:', databaseUrl ? '已设置' : '未设置')
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 环境变量未设置')
    process.exit(1)
  }

  // 解析URL以显示详细信息
  try {
    const url = new URL(databaseUrl)
    console.log('📊 连接信息:')
    console.log(`  主机: ${url.hostname}`)
    console.log(`  端口: ${url.port}`)
    console.log(`  数据库: ${url.pathname.slice(1)}`)
    console.log(`  用户: ${url.username}`)
    console.log(`  SSL: ${url.searchParams.get('sslmode')}`)
  } catch (error) {
    console.error('❌ DATABASE_URL 格式错误:', error)
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  })

  try {
    // 测试连接
    const client = await pool.connect()
    console.log('✅ 数据库连接成功!')
    
    // 测试查询
    const result = await client.query('SELECT version()')
    console.log('📊 PostgreSQL版本:', result.rows[0].version)
    
    // 检查数据库名称
    const dbResult = await client.query('SELECT current_database()')
    console.log('📊 当前数据库:', dbResult.rows[0].current_database)
    
    client.release()
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// 运行测试
if (require.main === module) {
  testConnection()
}

export default testConnection
