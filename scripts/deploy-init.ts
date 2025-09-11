#!/usr/bin/env ts-node

/**
 * 生产环境数据库初始化脚本
 * 用于部署后初始化数据库表结构
 */

import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

// 从环境变量获取数据库连接信息
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DB_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function initDatabase() {
  try {
    console.log('🚀 开始初始化生产数据库...')

    // 读取 SQL 文件
    const sqlPath = path.join(__dirname, '../database/schema.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // 执行 SQL
    await pool.query(sql)
    console.log('✅ 数据库表结构创建成功')

    // 检查表是否创建成功
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    console.log('📊 已创建的表:')
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })

    console.log('🎉 数据库初始化完成!')

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// 运行初始化
if (require.main === module) {
  initDatabase()
}

export default initDatabase
