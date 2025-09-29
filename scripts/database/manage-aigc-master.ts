#!/usr/bin/env ts-node

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { query } from '../lib/database'

async function showMainMenu() {
  console.log('\n🎨 AIGC内容管理工具')
  console.log('='.repeat(50))
  console.log('1. 图片作品集管理')
  console.log('2. 视频作品管理 (待开发)')
  console.log('3. 音乐作品管理 (待开发)')
  console.log('4. 全局统计信息')
  console.log('0. 退出')
  console.log('='.repeat(50))
}

async function showImageMenu() {
  console.log('\n🖼️  图片作品集管理')
  console.log('='.repeat(40))
  console.log('1. 查看所有图片作品集')
  console.log('2. 查看作品集详情')
  console.log('3. 查看作品集图片')
  console.log('4. 删除作品集')
  console.log('5. 删除图片')
  console.log('6. 更新作品集信息')
  console.log('7. 图片模块统计信息')
  console.log('0. 返回主菜单')
  console.log('='.repeat(40))
}

async function showVideoMenu() {
  console.log('\n🎬 视频作品管理 (功能开发中)')
  console.log('='.repeat(40))
  console.log('此功能正在开发中，敬请期待...')
  console.log('0. 返回主菜单')
  console.log('='.repeat(40))
}

async function showMusicMenu() {
  console.log('\n🎵 音乐作品管理 (功能开发中)')
  console.log('='.repeat(40))
  console.log('此功能正在开发中，敬请期待...')
  console.log('0. 返回主菜单')
  console.log('='.repeat(40))
}

async function handleImageManagement() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  while (true) {
    await showImageMenu()

    const choice = await new Promise<string>((resolve) => {
      readline.question('请选择操作 (0-7): ', resolve)
    })

    if (choice === '0') {
      readline.close()
      break
    }

    // 这里可以调用图片管理的具体功能
    // 暂时显示提示信息
    console.log('请使用 npm run db:manage-aigc 来管理图片作品集')
    console.log('或者我们可以在这里集成图片管理功能')

    await new Promise<void>((resolve) => {
      readline.question('\n按回车键继续...', () => resolve())
    })
  }
}

async function showGlobalStats() {
  try {
    console.log('\n📊 AIGC全局统计信息:')
    console.log('-'.repeat(50))

    // 检查图片模块统计
    try {
      const imageCollectionsResult = await query('SELECT COUNT(*) as count FROM artwork_collections')
      const imageCollectionsCount = imageCollectionsResult.rows[0].count

      const imageFilesResult = await query('SELECT COUNT(*) as count FROM artwork_images')
      const imageFilesCount = imageFilesResult.rows[0].count

      console.log('🖼️  图片模块:')
      console.log(`  作品集数量: ${imageCollectionsCount}`)
      console.log(`  图片文件数量: ${imageFilesCount}`)
    } catch (error) {
      console.log('🖼️  图片模块: 表不存在或未初始化')
    }

    // 检查视频模块统计 (预留)
    console.log('🎬 视频模块: 功能开发中')

    // 检查音乐模块统计 (预留)
    console.log('🎵 音乐模块: 功能开发中')

    // 检查博客模块统计
    try {
      const blogPostsResult = await query('SELECT COUNT(*) as count FROM blog_posts')
      const blogPostsCount = blogPostsResult.rows[0].count

      console.log('📝 博客模块:')
      console.log(`  文章数量: ${blogPostsCount}`)
    } catch (error) {
      console.log('📝 博客模块: 表不存在或未初始化')
    }

  } catch (error) {
    console.error('❌ 获取统计信息失败:', error)
  }
}

async function main() {
  console.log('🔧 AIGC内容管理工具启动...')

  // 测试数据库连接
  try {
    await query('SELECT NOW()')
    console.log('✅ 数据库连接成功')
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    process.exit(1)
  }

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  while (true) {
    await showMainMenu()

    const choice = await new Promise<string>((resolve) => {
      readline.question('请选择模块 (0-4): ', resolve)
    })

    switch (choice) {
      case '1':
        await handleImageManagement()
        break
      case '2':
        await showVideoMenu()
        await new Promise<void>((resolve) => {
          readline.question('\n按回车键继续...', () => resolve())
        })
        break
      case '3':
        await showMusicMenu()
        await new Promise<void>((resolve) => {
          readline.question('\n按回车键继续...', () => resolve())
        })
        break
      case '4':
        await showGlobalStats()
        await new Promise<void>((resolve) => {
          readline.question('\n按回车键继续...', () => resolve())
        })
        break
      case '0':
        console.log('👋 再见！')
        readline.close()
        process.exit(0)
      default:
        console.log('❌ 无效选择，请重新输入')
    }
  }
}

main().catch(console.error)
