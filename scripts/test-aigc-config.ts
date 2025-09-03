#!/usr/bin/env ts-node

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { validateCosConfig } from '../lib/tencent-cos-config'
import { query } from '../lib/database'

async function testDatabaseConnection() {
  try {
    console.log('🔍 测试数据库连接...')
    const result = await query('SELECT NOW() as current_time')
    console.log('✅ 数据库连接成功:', result.rows[0].current_time)
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}

async function testCosConfig() {
  try {
    console.log('🔍 测试腾讯云COS配置...')
    validateCosConfig()
    console.log('✅ 腾讯云COS配置验证成功')
    return true
  } catch (error) {
    console.error('❌ 腾讯云COS配置验证失败:', error)
    return false
  }
}

async function testDatabaseTables() {
  try {
    console.log('🔍 检查数据库表...')
    
    const tables = [
      'artwork_collections',
      'artwork_images', 
      'artwork_likes',
      'blog_posts'
    ]
    
    for (const table of tables) {
      const result = await query(`SELECT COUNT(*) FROM ${table}`)
      console.log(`✅ 表 ${table} 存在，记录数: ${result.rows[0].count}`)
    }
    
    return true
  } catch (error) {
    console.error('❌ 数据库表检查失败:', error)
    return false
  }
}

async function main() {
  console.log('🧪 开始AIGC配置测试...\n')
  
  const dbConnection = await testDatabaseConnection()
  const cosConfig = await testCosConfig()
  const dbTables = await testDatabaseTables()
  
  console.log('\n📊 测试结果汇总:')
  console.log(`   数据库连接: ${dbConnection ? '✅' : '❌'}`)
  console.log(`   腾讯云COS配置: ${cosConfig ? '✅' : '❌'}`)
  console.log(`   数据库表: ${dbTables ? '✅' : '❌'}`)
  
  if (dbConnection && cosConfig && dbTables) {
    console.log('\n🎉 所有配置测试通过！AIGC功能可以正常使用。')
    process.exit(0)
  } else {
    console.log('\n⚠️  部分配置存在问题，请检查相关配置。')
    process.exit(1)
  }
}

main()
