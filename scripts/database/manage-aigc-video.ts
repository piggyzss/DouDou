#!/usr/bin/env ts-node

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { query, getRows, getRow } from '../lib/database'
import { VideoModel } from '../lib/models/video'
import * as readline from 'readline'

interface VideoRecord {
  id: number
  title: string
  tags: string[]
  video_url: string
  cover_url?: string
  duration: number
  likes_count: number
  created_at: string
  updated_at: string
  status: string
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function showMenu() {
  console.log('\n🎬 AIGC视频数据库管理工具')
  console.log('='.repeat(50))
  console.log('1. 查看所有视频')
  console.log('2. 查看视频详情')
  console.log('3. 删除视频')
  console.log('4. 更新视频信息')
  console.log('5. 数据库统计信息')
  console.log('6. 按标签筛选视频')
  console.log('7. 按状态筛选视频')
  console.log('0. 退出')
  console.log('='.repeat(50))
}

async function listAllVideos() {
  try {
    console.log('\n📋 所有视频列表:')
    console.log('-'.repeat(80))

    const videos = await VideoModel.getList()
    
    if (!videos.length) {
      console.log('暂无视频数据')
      return
    }

    console.log(`共找到 ${videos.length} 个视频\n`)
    
    videos.forEach((video: VideoRecord, index: number) => {
      const duration = formatDuration(video.duration)
      const tags = video.tags ? video.tags.join(', ') : '无标签'
      
      console.log(`${index + 1}. ID: ${video.id}`)
      console.log(`   标题: ${video.title}`)
      console.log(`   标签: ${tags}`)
      console.log(`   时长: ${duration}`)
      console.log(`   点赞: ${video.likes_count} | 状态: ${video.status}`)
      console.log(`   创建时间: ${new Date(video.created_at).toLocaleString()}`)
      console.log(`   视频URL: ${video.video_url}`)
      if (video.cover_url) {
        console.log(`   封面URL: ${video.cover_url}`)
      }
      console.log('-'.repeat(80))
    })
  } catch (error) {
    console.error('❌ 获取视频列表失败:', error)
  }
}

async function showVideoDetail() {
  try {
    const idStr = await askQuestion('请输入视频ID: ')
    const id = parseInt(idStr)
    
    if (isNaN(id)) {
      console.log('❌ 请输入有效的数字ID')
      return
    }

    const video = await VideoModel.getById(id)
    
    if (!video) {
      console.log(`❌ 未找到ID为 ${id} 的视频`)
      return
    }

    console.log('\n📹 视频详情:')
    console.log('='.repeat(50))
    console.log(`ID: ${video.id}`)
    console.log(`标题: ${video.title}`)
    console.log(`标签: ${video.tags ? video.tags.join(', ') : '无标签'}`)
    console.log(`视频URL: ${video.video_url}`)
    console.log(`封面URL: ${video.cover_url || '无'}`)
    console.log(`时长: ${formatDuration(video.duration)}`)
    console.log(`点赞数: ${video.likes_count}`)
    console.log(`状态: ${video.status}`)
    console.log(`创建时间: ${new Date(video.created_at).toLocaleString()}`)
    console.log(`更新时间: ${new Date(video.updated_at).toLocaleString()}`)
    console.log('='.repeat(50))
  } catch (error) {
    console.error('❌ 获取视频详情失败:', error)
  }
}

async function deleteVideo() {
  try {
    const idStr = await askQuestion('请输入要删除的视频ID: ')
    const id = parseInt(idStr)
    
    if (isNaN(id)) {
      console.log('❌ 请输入有效的数字ID')
      return
    }

    const video = await VideoModel.getById(id)
    if (!video) {
      console.log(`❌ 未找到ID为 ${id} 的视频`)
      return
    }

    console.log(`\n即将删除视频: ${video.title}`)
    const confirm = await askQuestion('确认删除？(y/N): ')
    
    if (confirm.toLowerCase() === 'y') {
      await VideoModel.delete(id)
      console.log('✅ 视频删除成功')
    } else {
      console.log('❌ 取消删除')
    }
  } catch (error) {
    console.error('❌ 删除视频失败:', error)
  }
}

async function updateVideo() {
  try {
    const idStr = await askQuestion('请输入要更新的视频ID: ')
    const id = parseInt(idStr)
    
    if (isNaN(id)) {
      console.log('❌ 请输入有效的数字ID')
      return
    }

    const video = await VideoModel.getById(id)
    if (!video) {
      console.log(`❌ 未找到ID为 ${id} 的视频`)
      return
    }

    console.log(`\n当前视频信息:`)
    console.log(`标题: ${video.title}`)
    console.log(`标签: ${video.tags ? video.tags.join(', ') : '无'}`)
    console.log(`状态: ${video.status}`)

    const newTitle = await askQuestion(`新标题 (当前: ${video.title}): `)
    const newTagsStr = await askQuestion(`新标签 (用逗号分隔, 当前: ${video.tags ? video.tags.join(', ') : '无'}): `)
    const newStatus = await askQuestion(`新状态 (active/draft/archived, 当前: ${video.status}): `)

    const updateData: any = {}
    if (newTitle) updateData.title = newTitle
    if (newTagsStr) updateData.tags = newTagsStr.split(',').map(tag => tag.trim()).filter(tag => tag)
    if (newStatus && ['active', 'draft', 'archived'].includes(newStatus)) {
      updateData.status = newStatus
    }

    if (Object.keys(updateData).length === 0) {
      console.log('❌ 没有提供更新信息')
      return
    }

    await VideoModel.update(id, updateData)
    console.log('✅ 视频信息更新成功')
  } catch (error) {
    console.error('❌ 更新视频失败:', error)
  }
}

async function showStatistics() {
  try {
    console.log('\n📊 数据库统计信息:')
    console.log('='.repeat(50))

    // 总数统计
    const totalResult = await query('SELECT COUNT(*) as total FROM videos')
    const total = totalResult.rows[0].total

    // 状态统计
    const statusResult = await query(`
      SELECT status, COUNT(*) as count 
      FROM videos 
      GROUP BY status 
      ORDER BY count DESC
    `)

    // 标签统计
    const tagResult = await query(`
      SELECT unnest(tags) as tag, COUNT(*) as count 
      FROM videos 
      WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
      GROUP BY tag 
      ORDER BY count DESC 
      LIMIT 10
    `)

    // 时长统计
    const durationResult = await query(`
      SELECT 
        AVG(duration) as avg_duration,
        MIN(duration) as min_duration,
        MAX(duration) as max_duration,
        SUM(duration) as total_duration
      FROM videos 
      WHERE duration > 0
    `)

    console.log(`总视频数: ${total}`)
    
    console.log('\n📈 状态分布:')
    statusResult.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`)
    })

    if (durationResult.rows[0].avg_duration) {
      const stats = durationResult.rows[0]
      console.log('\n⏱️ 时长统计:')
      console.log(`  平均时长: ${formatDuration(Math.round(stats.avg_duration))}`)
      console.log(`  最短时长: ${formatDuration(stats.min_duration)}`)
      console.log(`  最长时长: ${formatDuration(stats.max_duration)}`)
      console.log(`  总时长: ${formatDuration(stats.total_duration)}`)
    }

    if (tagResult.rows.length > 0) {
      console.log('\n🏷️ 热门标签 (前10):')
      tagResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.tag}: ${row.count}`)
      })
    }

    console.log('='.repeat(50))
  } catch (error) {
    console.error('❌ 获取统计信息失败:', error)
  }
}

async function filterByTag() {
  try {
    const tag = await askQuestion('请输入标签名称: ')
    if (!tag) {
      console.log('❌ 请输入标签名称')
      return
    }

    const result = await query(
      'SELECT * FROM videos WHERE $1 = ANY(tags) ORDER BY created_at DESC',
      [tag]
    )

    if (!result.rows.length) {
      console.log(`❌ 未找到包含标签 "${tag}" 的视频`)
      return
    }

    console.log(`\n🏷️ 包含标签 "${tag}" 的视频 (${result.rows.length}个):`)
    console.log('-'.repeat(80))

    result.rows.forEach((video: VideoRecord, index: number) => {
      console.log(`${index + 1}. ID: ${video.id} - ${video.title}`)
      console.log(`   时长: ${formatDuration(video.duration)} | 点赞: ${video.likes_count}`)
      console.log(`   创建: ${new Date(video.created_at).toLocaleString()}`)
      console.log('-'.repeat(80))
    })
  } catch (error) {
    console.error('❌ 按标签筛选失败:', error)
  }
}

async function filterByStatus() {
  try {
    const status = await askQuestion('请输入状态 (active/draft/archived): ')
    if (!['active', 'draft', 'archived'].includes(status)) {
      console.log('❌ 请输入有效的状态: active, draft, archived')
      return
    }

    const result = await query(
      'SELECT * FROM videos WHERE status = $1 ORDER BY created_at DESC',
      [status]
    )

    if (!result.rows.length) {
      console.log(`❌ 未找到状态为 "${status}" 的视频`)
      return
    }

    console.log(`\n📊 状态为 "${status}" 的视频 (${result.rows.length}个):`)
    console.log('-'.repeat(80))

    result.rows.forEach((video: VideoRecord, index: number) => {
      console.log(`${index + 1}. ID: ${video.id} - ${video.title}`)
      console.log(`   时长: ${formatDuration(video.duration)} | 点赞: ${video.likes_count}`)
      console.log(`   创建: ${new Date(video.created_at).toLocaleString()}`)
      console.log('-'.repeat(80))
    })
  } catch (error) {
    console.error('❌ 按状态筛选失败:', error)
  }
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return '0秒'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}时${minutes}分${remainingSeconds}秒`
  } else if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`
  } else {
    return `${remainingSeconds}秒`
  }
}

async function showDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!databaseUrl) {
    console.log('❌ 未找到数据库连接信息')
    return
  }

  try {
    const url = new URL(databaseUrl)
    let dbType = '🗄️ 其他数据库'
    
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      dbType = '🏠 本地数据库'
    } else if (url.hostname.includes('vercel-storage.com')) {
      dbType = '☁️ Vercel Postgres'
    }
    
    console.log(`📊 当前连接: ${dbType} (${url.hostname})`)
    console.log(`📋 数据库名: ${url.pathname.slice(1)}`)
  } catch (error) {
    console.log('📊 当前连接: 数据库连接已配置')
  }
}

async function main() {
  try {
    console.log('🎬 AIGC 视频管理工具')
    console.log('连接数据库中...')
    await showDatabaseConnection()
    console.log('')

    while (true) {
      await showMenu()
      const choice = await askQuestion('\n请选择操作 (0-7): ')

      switch (choice) {
        case '1':
          await listAllVideos()
          break
        case '2':
          await showVideoDetail()
          break
        case '3':
          await deleteVideo()
          break
        case '4':
          await updateVideo()
          break
        case '5':
          await showStatistics()
          break
        case '6':
          await filterByTag()
          break
        case '7':
          await filterByStatus()
          break
        case '0':
          console.log('👋 再见!')
          rl.close()
          process.exit(0)
          break
        default:
          console.log('❌ 无效选择，请输入 0-7')
          break
      }

      if (choice !== '0') {
        await askQuestion('\n按 Enter 键继续...')
      }
    }
  } catch (error) {
    console.error('❌ 程序运行错误:', error)
    rl.close()
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
