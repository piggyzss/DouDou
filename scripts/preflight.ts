#!/usr/bin/env ts-node

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { db, initDatabase } from '../lib/database'
import { listFiles, fileExists } from '../lib/tencent-cos'

function getKeyFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    return u.pathname.replace(/^\//, '')
  } catch {
    return url.startsWith('/') ? url.slice(1) : url
  }
}

async function main() {
  console.log('🚦 Preflight: 启动前环境检查...')
  try {
    // 1) 数据库连接
    await db.query('SELECT NOW()')
    console.log('✅ DB 可连接')

    // 2) 创建缺失表（幂等）
    await initDatabase()
    console.log('✅ 表结构已确保存在')

    // 3) 基础统计
    const tables = ['artwork_collections', 'artwork_images', 'music_tracks', 'blog_posts']
    for (const t of tables) {
      try {
        const r = await db.query(`SELECT COUNT(*) FROM ${t}`)
        console.log(`📦 ${t}: ${r.rows[0].count}`)
      } catch (e) {
        console.warn(`⚠️  跳过统计: ${t}（表不存在或查询失败）`)
      }
    }

    // 4) COS 基础可用性
    try {
      const files = await listFiles('aigc/images', 5)
      console.log(`🗂️  COS 列表(aigc/images) 预览: ${files.length} 条`)
    } catch (e) {
      console.warn('⚠️  COS 列表失败：请检查密钥/Region/Bucket')
    }

    // 5) 抽样验证 DB 中第一条图片 URL 是否存在于 COS（如有）
    try {
      const img = await db.getRow('SELECT file_url FROM artwork_images ORDER BY id ASC LIMIT 1') as { file_url?: string }
      if (img?.file_url) {
        const key = getKeyFromUrl(img.file_url)
        if (key) {
          const exists = await fileExists(key)
          console.log(`🔎 样本图片可用性: ${exists ? '✅ 存在' : '❌ 缺失'} (${key})`)
        }
      } else {
        console.log('ℹ️  没有可抽样的图片记录')
      }
    } catch {
      console.log('ℹ️  图片抽样检查跳过')
    }

    console.log('🎉 Preflight 完成')
  } catch (e) {
    console.error('❌ Preflight 失败:', e)
    process.exit(1)
  } finally {
    await db.end()
  }
}

main()


