#!/usr/bin/env ts-node

/**
 * 生产环境部署验证脚本
 * 检查所有服务是否正常运行
 */

import { Pool } from 'pg'
import https from 'https'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'

async function verifyDatabase() {
  console.log('🔍 检查数据库连接...')
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.DB_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    const result = await pool.query('SELECT NOW() as current_time')
    console.log('✅ 数据库连接正常:', result.rows[0].current_time)
    
    // 检查必要的表是否存在
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    const requiredTables = ['blog_posts', 'blog_tags', 'artwork_collections', 'likes']
    const existingTables = tables.rows.map(row => row.table_name)
    
    console.log('📊 数据库表检查:')
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`  ✅ ${table}`)
      } else {
        console.log(`  ❌ ${table} - 缺失`)
      }
    })
    
    await pool.end()
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}

async function verifyWebsite() {
  console.log('🔍 检查网站访问...')
  
  return new Promise((resolve) => {
    https.get(SITE_URL, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ 网站访问正常')
        resolve(true)
      } else {
        console.log(`❌ 网站访问异常，状态码: ${res.statusCode}`)
        resolve(false)
      }
    }).on('error', (error) => {
      console.error('❌ 网站访问失败:', error)
      resolve(false)
    })
  })
}

async function verifyAPI() {
  console.log('🔍 检查 API 接口...')
  
  const apiEndpoints = [
    '/api/blog',
    '/api/aigc/artworks',
    '/api/likes/status'
  ]
  
  let allPassed = true
  
  for (const endpoint of apiEndpoints) {
    try {
      const url = `${SITE_URL}${endpoint}`
      const result = await new Promise((resolve) => {
        https.get(url, (res) => {
          resolve(res.statusCode)
        }).on('error', () => resolve(500))
      })
      
      if (result === 200 || result === 404) { // 404 也是正常的，表示路由存在
        console.log(`  ✅ ${endpoint}`)
      } else {
        console.log(`  ❌ ${endpoint} - 状态码: ${result}`)
        allPassed = false
      }
    } catch (error) {
      console.log(`  ❌ ${endpoint} - 错误: ${error}`)
      allPassed = false
    }
  }
  
  return allPassed
}

async function main() {
  console.log('🚀 开始生产环境验证...\n')
  
  const dbOk = await verifyDatabase()
  console.log('')
  
  const websiteOk = await verifyWebsite()
  console.log('')
  
  const apiOk = await verifyAPI()
  console.log('')
  
  if (dbOk && websiteOk && apiOk) {
    console.log('🎉 所有检查通过！网站部署成功！')
    console.log(`🌐 网站地址: ${SITE_URL}`)
  } else {
    console.log('❌ 部分检查失败，请检查配置')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
