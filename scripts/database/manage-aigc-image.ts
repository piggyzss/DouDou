#!/usr/bin/env ts-node

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { query, getRows, getRow } from '../../lib/database'
import { ArtworkModel } from '../../lib/models/artwork'

interface DatabaseRecord {
  id: number
  title: string
  description?: string
  tags: string[]
  created_at: string
  likes_count: number
  views_count: number
  status: string
  cover_image_url?: string
}

interface ImageRecord {
  id: number
  collection_id: number
  filename: string
  original_name: string
  file_url: string
  file_size?: number
  created_at: string
}

async function showMenu() {
  console.log('\n🎨 AIGC图片作品集数据库管理工具')
  console.log('='.repeat(50))
  console.log('1. 查看所有图片作品集')
  console.log('2. 查看作品集详情')
  console.log('3. 查看作品集图片')
  console.log('4. 删除作品集')
  console.log('5. 删除图片')
  console.log('6. 更新作品集信息')
  console.log('7. 数据库统计信息')
  console.log('0. 退出')
  console.log('='.repeat(50))
}

async function listAllCollections() {
  try {
    console.log('\n📋 所有作品集列表:')
    console.log('-'.repeat(80))

    const result = await ArtworkModel.findAll(1, 100)

    if (result.collections.length === 0) {
      console.log('暂无作品集')
      return
    }

    result.collections.forEach((collection: DatabaseRecord) => {
      console.log(`ID: ${collection.id}`)
      console.log(`标题: ${collection.title}`)
      console.log(`标签: ${collection.tags?.join(', ') || '无'}`)
      console.log(`状态: ${collection.status}`)
      console.log(`创建时间: ${collection.created_at}`)
      console.log(`点赞数: ${collection.likes_count}`)
      console.log(`浏览数: ${collection.views_count}`)
      console.log('-'.repeat(40))
    })

    console.log(`总计: ${result.total} 个作品集`)
  } catch (error) {
    console.error('❌ 获取作品集列表失败:', error)
  }
}

async function showCollectionDetail() {
  try {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const id = await new Promise<string>((resolve) => {
      readline.question('请输入作品集ID: ', resolve)
    })
    readline.close()

    const collection = await ArtworkModel.findById(parseInt(id))
    if (!collection) {
      console.log('❌ 未找到该作品集')
      return
    }

    console.log('\n📖 作品集详情:')
    console.log('-'.repeat(50))
    console.log(`ID: ${collection.id}`)
    console.log(`标题: ${collection.title}`)
    console.log(`描述: ${collection.description || '无'}`)
    console.log(`标签: ${collection.tags?.join(', ') || '无'}`)
    console.log(`状态: ${collection.status}`)
    console.log(`创建时间: ${collection.created_at}`)
    console.log(`更新时间: ${collection.updated_at}`)
    console.log(`点赞数: ${collection.likes_count}`)
    console.log(`浏览数: ${collection.views_count}`)
    console.log(`封面图片: ${collection.cover_image_url || '无'}`)

    // 获取图片列表
    const images = await ArtworkModel.getImages(collection.id)
    console.log(`\n图片数量: ${images.length}`)
    if (images.length > 0) {
      console.log('图片列表:')
      images.forEach((img: ImageRecord, index: number) => {
        console.log(`  ${index + 1}. ${img.original_name} (${img.file_size} bytes)`)
        console.log(`     URL: ${img.file_url}`)
      })
    }
  } catch (error) {
    console.error('❌ 获取作品集详情失败:', error)
  }
}

async function showCollectionImages() {
  try {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const id = await new Promise<string>((resolve) => {
      readline.question('请输入作品集ID: ', resolve)
    })
    readline.close()

    const images = await ArtworkModel.getImages(parseInt(id))

    if (images.length === 0) {
      console.log('❌ 该作品集没有图片')
      return
    }

    console.log(`\n🖼️  作品集 ${id} 的图片列表:`)
    console.log('-'.repeat(80))

    images.forEach((img: ImageRecord, index: number) => {
      console.log(`${index + 1}. 图片ID: ${img.id}`)
      console.log(`   原始文件名: ${img.original_name}`)
      console.log(`   存储文件名: ${img.filename}`)
      console.log(`   文件大小: ${img.file_size || '未知'} bytes`)
      console.log(`   创建时间: ${img.created_at}`)
      console.log(`   访问URL: ${img.file_url}`)
      console.log('-'.repeat(40))
    })
  } catch (error) {
    console.error('❌ 获取图片列表失败:', error)
  }
}

async function deleteCollection() {
  try {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const id = await new Promise<string>((resolve) => {
      readline.question('请输入要删除的作品集ID: ', resolve)
    })

    const confirm = await new Promise<string>((resolve) => {
      readline.question('确认删除？这将同时删除所有相关图片记录 (y/N): ', resolve)
    })
    readline.close()

    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ 取消删除')
      return
    }

    const success = await ArtworkModel.delete(parseInt(id))
    if (success) {
      console.log('✅ 作品集删除成功')
    } else {
      console.log('❌ 作品集删除失败')
    }
  } catch (error) {
    console.error('❌ 删除作品集失败:', error)
  }
}

async function deleteImage() {
  try {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const id = await new Promise<string>((resolve) => {
      readline.question('请输入要删除的图片ID: ', resolve)
    })

    const confirm = await new Promise<string>((resolve) => {
      readline.question('确认删除这张图片？ (y/N): ', resolve)
    })
    readline.close()

    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ 取消删除')
      return
    }

    const success = await ArtworkModel.deleteImage(parseInt(id))
    if (success) {
      console.log('✅ 图片删除成功')
    } else {
      console.log('❌ 图片删除失败')
    }
  } catch (error) {
    console.error('❌ 删除图片失败:', error)
  }
}

async function updateCollection() {
  try {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const id = await new Promise<string>((resolve) => {
      readline.question('请输入要更新的作品集ID: ', resolve)
    })

    const title = await new Promise<string>((resolve) => {
      readline.question('新标题 (留空保持不变): ', resolve)
    })

    const description = await new Promise<string>((resolve) => {
      readline.question('新描述 (留空保持不变): ', resolve)
    })

    const tags = await new Promise<string>((resolve) => {
      readline.question('新标签 (用逗号分隔，留空保持不变): ', resolve)
    })

    const status = await new Promise<string>((resolve) => {
      readline.question('新状态 (active/draft/archived，留空保持不变): ', resolve)
    })

    readline.close()

    const updateData: any = {}
    if (title.trim()) updateData.title = title.trim()
    if (description.trim()) updateData.description = description.trim()
    if (tags.trim()) updateData.tags = tags.split(',').map(t => t.trim())
    if (status.trim()) updateData.status = status.trim()

    if (Object.keys(updateData).length === 0) {
      console.log('❌ 没有提供任何更新数据')
      return
    }

    const result = await ArtworkModel.update(parseInt(id), updateData)
    if (result) {
      console.log('✅ 作品集更新成功')
      console.log('更新后的信息:')
      console.log(`标题: ${result.title}`)
      console.log(`描述: ${result.description || '无'}`)
      console.log(`标签: ${result.tags?.join(', ') || '无'}`)
      console.log(`状态: ${result.status}`)
    } else {
      console.log('❌ 作品集更新失败')
    }
  } catch (error) {
    console.error('❌ 更新作品集失败:', error)
  }
}

async function showDatabaseStats() {
  try {
    console.log('\n📊 数据库统计信息:')
    console.log('-'.repeat(50))

    // 作品集统计
    const collectionsResult = await query('SELECT COUNT(*) as count FROM artwork_collections')
    const collectionsCount = collectionsResult.rows[0].count

    const activeCollectionsResult = await query("SELECT COUNT(*) as count FROM artwork_collections WHERE status = 'active'")
    const activeCollectionsCount = activeCollectionsResult.rows[0].count

    // 图片统计
    const imagesResult = await query('SELECT COUNT(*) as count FROM artwork_images')
    const imagesCount = imagesResult.rows[0].count

    // 点赞统计
    const likesResult = await query('SELECT COUNT(*) as count FROM artwork_likes')
    const likesCount = likesResult.rows[0].count

    // 总点赞数
    const totalLikesResult = await query('SELECT SUM(likes_count) as total FROM artwork_collections')
    const totalLikes = totalLikesResult.rows[0].total || 0

    console.log(`作品集总数: ${collectionsCount}`)
    console.log(`活跃作品集: ${activeCollectionsCount}`)
    console.log(`图片总数: ${imagesCount}`)
    console.log(`点赞记录数: ${likesCount}`)
    console.log(`总点赞数: ${totalLikes}`)

    // 最近创建的作品集
    const recentCollections = await query(`
      SELECT title, created_at, likes_count
      FROM artwork_collections
      ORDER BY created_at DESC
      LIMIT 5
    `)

    if (recentCollections.rows.length > 0) {
      console.log('\n最近创建的作品集:')
      recentCollections.rows.forEach((row: any) => {
        console.log(`  - ${row.title} (${row.created_at.split('T')[0]}) - ${row.likes_count} 赞`)
      })
    }
  } catch (error) {
    console.error('❌ 获取统计信息失败:', error)
  }
}

async function main() {
  console.log('🔧 AIGC图片作品集数据库管理工具启动...')

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
    await showMenu()

    const choice = await new Promise<string>((resolve) => {
      readline.question('请选择操作 (0-7): ', resolve)
    })

    switch (choice) {
      case '1':
        await listAllCollections()
        break
      case '2':
        await showCollectionDetail()
        break
      case '3':
        await showCollectionImages()
        break
      case '4':
        await deleteCollection()
        break
      case '5':
        await deleteImage()
        break
      case '6':
        await updateCollection()
        break
      case '7':
        await showDatabaseStats()
        break
      case '0':
        console.log('👋 再见！')
        readline.close()
        process.exit(0)
      default:
        console.log('❌ 无效选择，请重新输入')
    }

    await new Promise<void>((resolve) => {
      readline.question('\n按回车键继续...', () => resolve())
    })
  }
}

main().catch(console.error)
