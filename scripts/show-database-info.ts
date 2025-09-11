#!/usr/bin/env ts-node

import dotenv from 'dotenv'
import { Pool } from 'pg'
import { URL } from 'url'

// 加载环境变量
dotenv.config({ path: '.env.local' })

interface DatabaseInfo {
  host: string
  port: number
  database: string
  user: string
  ssl: boolean
  connectionString: string
  type: 'local' | 'vercel' | 'other'
}

function parseDatabaseUrl(connectionString: string): DatabaseInfo {
  try {
    const url = new URL(connectionString)
    
    const info: DatabaseInfo = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // 移除开头的 '/'
      user: url.username,
      ssl: url.searchParams.has('sslmode') || url.searchParams.has('ssl'),
      connectionString: connectionString,
      type: 'other'
    }
    
    // 判断数据库类型
    if (info.host === 'localhost' || info.host === '127.0.0.1') {
      info.type = 'local'
    } else if (info.host.includes('vercel-storage.com') || info.host.includes('postgres.vercel-storage.com')) {
      info.type = 'vercel'
    }
    
    return info
  } catch (error) {
    throw new Error(`无法解析数据库连接字符串: ${error}`)
  }
}

async function getDatabaseVersion(pool: Pool): Promise<string> {
  try {
    const result = await pool.query('SELECT version()')
    return result.rows[0].version
  } catch (error) {
    return '无法获取版本信息'
  }
}

async function getDatabaseSize(pool: Pool, databaseName: string): Promise<string> {
  try {
    const result = await pool.query(`
      SELECT pg_size_pretty(pg_database_size($1)) as size
    `, [databaseName])
    return result.rows[0].size
  } catch (error) {
    return '无法获取大小信息'
  }
}

async function getTableCount(pool: Pool): Promise<number> {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    return parseInt(result.rows[0].count)
  } catch (error) {
    return 0
  }
}

async function getConnectionCount(pool: Pool): Promise<number> {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `)
    return parseInt(result.rows[0].count)
  } catch (error) {
    return 0
  }
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'local':
      return '🏠'
    case 'vercel':
      return '☁️'
    default:
      return '🗄️'
  }
}

function getTypeDescription(type: string): string {
  switch (type) {
    case 'local':
      return '本地数据库'
    case 'vercel':
      return 'Vercel Postgres'
    default:
      return '其他数据库'
  }
}

async function showDatabaseInfo() {
  console.log('🔍 正在检查数据库连接信息...\n')

  // 检查环境变量
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  const postgresUrl = process.env.POSTGRES_URL
  const postgresPrismaUrl = process.env.POSTGRES_PRISMA_URL
  
  console.log('📋 环境变量状态:')
  console.log(`  DATABASE_URL: ${databaseUrl ? '✅ 已设置' : '❌ 未设置'}`)
  console.log(`  POSTGRES_URL: ${postgresUrl ? '✅ 已设置' : '❌ 未设置'}`)
  console.log(`  POSTGRES_PRISMA_URL: ${postgresPrismaUrl ? '✅ 已设置' : '❌ 未设置'}`)
  console.log('')

  if (!databaseUrl) {
    console.error('❌ 错误：未找到 DATABASE_URL 或 POSTGRES_URL')
    console.log('请确保在 .env.local 文件中设置了数据库连接字符串')
    process.exit(1)
  }

  try {
    // 解析数据库连接信息
    const dbInfo = parseDatabaseUrl(databaseUrl)
    const typeIcon = getTypeIcon(dbInfo.type)
    const typeDesc = getTypeDescription(dbInfo.type)

    console.log('🗄️ 当前数据库连接信息:')
    console.log('='.repeat(60))
    console.log(`${typeIcon} 数据库类型: ${typeDesc}`)
    console.log(`🏠 主机地址: ${dbInfo.host}`)
    console.log(`🔌 端口号: ${dbInfo.port}`)
    console.log(`📊 数据库名: ${dbInfo.database}`)
    console.log(`👤 用户名: ${dbInfo.user}`)
    console.log(`🔒 SSL连接: ${dbInfo.ssl ? '启用' : '禁用'}`)
    
    // 隐藏密码的连接字符串
    const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ':****@')
    console.log(`🔗 连接字符串: ${maskedUrl}`)
    console.log('')

    // 创建数据库连接
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: dbInfo.ssl ? { rejectUnauthorized: false } : false
    })

    console.log('🔗 正在连接数据库...')
    
    // 获取数据库详细信息
    const [version, size, tableCount, connectionCount] = await Promise.all([
      getDatabaseVersion(pool),
      getDatabaseSize(pool, dbInfo.database),
      getTableCount(pool),
      getConnectionCount(pool)
    ])

    console.log('✅ 连接成功！')
    console.log('')
    console.log('📈 数据库状态信息:')
    console.log('='.repeat(60))
    console.log(`🔢 PostgreSQL 版本: ${version.split(',')[0]}`)
    console.log(`💾 数据库大小: ${size}`)
    console.log(`📋 表数量: ${tableCount}`)
    console.log(`🔗 当前连接数: ${connectionCount}`)
    console.log(`⏰ 连接时间: ${new Date().toLocaleString()}`)
    console.log('')

    // 显示主要表的记录数
    if (tableCount > 0) {
      console.log('📊 主要表记录数:')
      console.log('-'.repeat(40))
      
      const tables = [
        'artwork_collections',
        'artwork_images', 
        'music_tracks',
        'videos',
        'blog_posts',
        'likes'
      ]

      for (const table of tables) {
        try {
          const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`)
          const count = result.rows[0].count
          console.log(`  ${table.padEnd(20)}: ${count}`)
        } catch (error) {
          // 表不存在或无法访问
          console.log(`  ${table.padEnd(20)}: -`)
        }
      }
    }

    await pool.end()
    
    console.log('')
    console.log('='.repeat(60))
    console.log(`${typeIcon} 当前连接的是: ${typeDesc}`)
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('\n❌ 数据库连接失败:')
    console.error(error)
    
    console.log('\n🔧 故障排除建议:')
    console.log('1. 检查 DATABASE_URL 格式是否正确')
    console.log('2. 确保数据库服务器正在运行')
    console.log('3. 检查网络连接')
    console.log('4. 验证用户名和密码')
    console.log('5. 检查防火墙设置')
  }
}

// 运行检查
showDatabaseInfo().catch(console.error)
