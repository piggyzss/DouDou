#!/usr/bin/env ts-node

import 'dotenv/config'
import { db } from '../lib/database'
import { fileExists } from '../lib/tencent-cos'

type ImageRow = { id: number; file_url: string }

function getKeyFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const key = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname
    return key || null
  } catch {
    // 不是绝对 URL，可能已是相对路径或代理路径
    if (url.startsWith('http')) return null
    if (url.startsWith('/api/aigc/proxy-image')) return null
    return url.replace(/^\//, '') || null
  }
}

async function main() {
  const DRY_RUN = (process.env.FIX || '').toLowerCase() !== 'delete'
  console.log(`🔎 扫描 AIGC 图片有效性（${DRY_RUN ? '预览模式' : '删除无效记录'}）`)
  try {
    const rows = await db.getRows('SELECT id, file_url FROM artwork_images ORDER BY id ASC') as ImageRow[]
    console.log(`📋 总记录: ${rows.length}`)

    const missing: ImageRow[] = []
    let ok = 0

    for (const row of rows) {
      const key = getKeyFromUrl(row.file_url)
      if (!key) {
        // 无法解析为 COS key，视为缺失
        missing.push(row)
        continue
      }
      const exists = await fileExists(key)
      if (!exists) {
        missing.push(row)
      } else {
        ok++
      }
    }

    console.log(`✅ 有效图片: ${ok}`)
    console.log(`❌ 缺失图片: ${missing.length}`)

    if (missing.length > 0) {
      console.log('示例缺失记录（最多前 10 条）:')
      missing.slice(0, 10).forEach((m) => console.log(`  - id=${m.id} url=${m.file_url}`))

      if (!DRY_RUN) {
        // 执行删除缺失记录
        const ids = missing.map(m => m.id)
        const res = await db.query('DELETE FROM artwork_images WHERE id = ANY($1::int[])', [ids])
        console.log(`🧹 已删除缺失记录: ${res.rowCount || 0}`)
      } else {
        console.log('💡 预览模式未删除任何记录。要删除请以 FIX=delete 环境变量运行本脚本。')
      }
    }
  } catch (e) {
    console.error('❌ 扫描失败:', e)
  } finally {
    await db.end()
  }
}

main()


