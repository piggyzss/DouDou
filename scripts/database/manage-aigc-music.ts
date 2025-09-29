#!/usr/bin/env ts-node

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { query } from '../lib/database'

async function listMusic() {
  const res = await query('SELECT id, title, tags, audio_url, cover_url, duration, likes_count, created_at FROM music_tracks ORDER BY created_at DESC LIMIT 100')
  if (!res.rows.length) {
    console.log('暂无音乐数据')
    return
  }
  console.log('AIGC 音乐列表 (前100条)：')
  console.log('---------------------------------------------')
  for (const row of res.rows) {
    console.log(`ID: ${row.id}`)
    console.log(`标题: ${row.title}`)
    console.log(`标签: ${(row.tags || []).join(', ')}`)
    console.log(`音频: ${row.audio_url}`)
    console.log(`封面: ${row.cover_url || ''}`)
    console.log(`时长: ${row.duration || 0}s`)
    console.log(`点赞: ${row.likes_count || 0}`)
    console.log(`创建: ${row.created_at}`)
    console.log('---------------------------------------------')
  }
}

async function main() {
  try {
    await listMusic()
    process.exit(0)
  } catch (e) {
    console.error('读取音乐数据失败:', e)
    process.exit(1)
  }
}

main()


