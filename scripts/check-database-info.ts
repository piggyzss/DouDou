#!/usr/bin/env ts-node

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { Pool } from 'pg'

interface DatabaseInfo {
  host: string
  port: number
  database: string
  user: string
  version: string
  currentTime: string
  connectionString?: string
}

async function checkDatabaseConnection(): Promise<DatabaseInfo | null> {
  let pool: Pool | null = null
  
  try {
    // 检查环境变量
    console.log('🔍 检查数据库环境变量...')
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ 已设置' : '❌ 未设置'}`)
    console.log(`POSTGRES_URL: ${process.env.POSTGRES_URL ? '✅ 已设置' : '❌ 未设置'}`)
    console.log(`DB_HOST: ${process.env.DB_HOST || '未设置'}`)
    console.log(`DB_NAME: ${process.env.DB_NAME || '未设置'}`)
    console.log(`DB_USER: ${process.env.DB_USER || '未设置'}`)
    console.log('')

    // 获取数据库配置
    const config = getDatabaseConfig()
    
    // 创建连接池
    pool = new Pool(config)
    
    // 执行查询获取数据库信息
    const client = await pool.connect()
    
    try {
      // 获取数据库基本信息
      const dbInfoQuery = `
        SELECT 
          current_database() as database_name,
          current_user as current_user,
          inet_server_addr() as server_ip,
          inet_server_port() as server_port,
          version() as version,
          now() as current_time
      `
      
      const result = await client.query(dbInfoQuery)
      const dbInfo = result.rows[0]
      
      // 获取连接信息
      const connectionInfo = (client as any).connection || {}
      
      const info: DatabaseInfo = {
        host: connectionInfo.host || config.host || 'unknown',
        port: connectionInfo.port || config.port || 5432,
        database: dbInfo.database_name,
        user: dbInfo.current_user,
        version: dbInfo.version,
        currentTime: dbInfo.current_time,
        connectionString: config.connectionString
      }
      
      return info
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return null
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

function getDatabaseConfig() {
  // 优先使用 DATABASE_URL（Vercel 推荐方式）
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    return {
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  }
  
  // 回退到单独的环境变量（本地开发）
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'doudou_db',
    user: process.env.DB_USER || 'doudou_user',
    password: process.env.DB_PASSWORD || 'doudou_password',
  }
}

function identifyDatabaseEnvironment(info: DatabaseInfo): string {
  const { host, database, connectionString } = info
  
  // 检查是否是 Vercel Postgres
  if (connectionString && connectionString.includes('vercel-storage.com')) {
    return '☁️ Vercel Postgres (云数据库)'
  }
  
  // 检查是否是 Prisma 的云数据库 (db.prisma.io)
  if (connectionString && connectionString.includes('db.prisma.io')) {
    return '☁️ Prisma Cloud Database (云数据库)'
  }
  
  // 检查是否是本地数据库
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    return '💻 本地数据库 (localhost)'
  }
  
  // 检查其他云服务商
  if (host.includes('supabase')) {
    return '☁️ Supabase (云数据库)'
  }
  
  if (host.includes('planetscale')) {
    return '☁️ PlanetScale (云数据库)'
  }
  
  if (host.includes('railway')) {
    return '☁️ Railway (云数据库)'
  }
  
  if (host.includes('neon')) {
    return '☁️ Neon (云数据库)'
  }
  
  if (host.includes('vercel')) {
    return '☁️ Vercel Postgres (云数据库)'
  }
  
  // 默认分类
  if (host.includes('.com') || host.includes('.net') || host.includes('.org')) {
    return '☁️ 云数据库'
  }
  
  return '🔍 未知环境'
}

async function main() {
  console.log('🔍 数据库连接信息检查工具')
  console.log('='.repeat(60))
  
  const info = await checkDatabaseConnection()
  
  if (!info) {
    console.log('❌ 无法获取数据库连接信息')
    process.exit(1)
  }
  
  const environment = identifyDatabaseEnvironment(info)
  
  console.log('📊 当前数据库连接信息:')
  console.log('='.repeat(60))
  console.log(`🏷️  环境类型: ${environment}`)
  console.log(`🏠 主机地址: ${info.host}`)
  console.log(`🔌 端口号: ${info.port}`)
  console.log(`💾 数据库名: ${info.database}`)
  console.log(`👤 用户名: ${info.user}`)
  console.log(`🕐 服务器时间: ${new Date(info.currentTime).toLocaleString()}`)
  console.log(`📝 PostgreSQL版本: ${info.version.split(',')[0]}`)
  
  if (info.connectionString) {
    // 隐藏敏感信息的连接字符串
    const maskedConnectionString = info.connectionString.replace(
      /(:\/\/[^:]+:)[^@]+(@)/,
      '$1****$2'
    )
    console.log(`🔗 连接字符串: ${maskedConnectionString}`)
  }
  
  console.log('='.repeat(60))
  
  // 额外的环境提示
  if (environment.includes('Vercel')) {
    console.log('💡 提示: 你当前连接的是 Vercel 的云数据库')
    console.log('   - 这是生产环境数据库')
    console.log('   - 请谨慎进行数据操作')
  } else if (environment.includes('本地')) {
    console.log('💡 提示: 你当前连接的是本地数据库')
    console.log('   - 这是开发环境数据库')
    console.log('   - 可以安全地进行测试操作')
  } else if (environment.includes('云数据库')) {
    console.log('💡 提示: 你当前连接的是云数据库')
    console.log('   - 请确认这是否是你预期的环境')
    console.log('   - 进行操作前请谨慎确认')
  }
  
  console.log('')
  console.log('🔧 如需切换数据库环境，请修改 .env.local 文件中的环境变量')
}

if (require.main === module) {
  main().catch(console.error)
}

export { checkDatabaseConnection, identifyDatabaseEnvironment }
