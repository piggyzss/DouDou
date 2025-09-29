#!/usr/bin/env ts-node

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { query, getRows, getRow } from '../lib/database'
import { BlogModel } from '../lib/models/blog'

async function showMenu() {
  console.log('\n📝 博客数据库管理工具')
  console.log('='.repeat(50))
  console.log('1. 查看所有博客文章')
  console.log('2. 查看博客文章详情')
  console.log('3. 查看博客标签')
  console.log('4. 查看博客评论')
  console.log('5. 删除博客文章')
  console.log('6. 数据库统计信息')
  console.log('7. 查看数据库表结构')
  console.log('0. 退出')
  console.log('='.repeat(50))
}

async function listAllBlogPosts() {
  try {
    console.log('\n📋 所有博客文章列表:')
    console.log('-'.repeat(80))

    const result = await BlogModel.findAllPublished(1, 100)

    if (result.posts.length === 0) {
      console.log('暂无博客文章')
      return
    }

    result.posts.forEach((post: any) => {
      console.log(`ID: ${post.id}`)
      console.log(`标题: ${post.title}`)
      console.log(`Slug: ${post.slug}`)
      console.log(`标签: ${post.tags?.join(', ') || '无'}`)
      console.log(`状态: ${post.status}`)
      console.log(`创建时间: ${post.created_at}`)
      console.log(`发布时间: ${post.published_at || '未发布'}`)
      console.log(`浏览量: ${post.views_count}`)
      console.log(`点赞数: ${post.likes_count}`)
      console.log(`评论数: ${post.comments_count}`)
      console.log('-'.repeat(40))
    })

    console.log(`总计: ${result.total} 篇博客文章`)
  } catch (error) {
    console.error('❌ 获取博客文章列表失败:', error)
  }
}

async function showBlogPostDetail() {
  try {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const id = await new Promise<string>((resolve) => {
      readline.question('请输入博客文章ID: ', resolve)
    })
    readline.close()

    const post = await BlogModel.findById(parseInt(id))
    if (!post) {
      console.log('❌ 未找到该博客文章')
      return
    }

    console.log('\n📖 博客文章详情:')
    console.log('-'.repeat(50))
    console.log(`ID: ${post.id}`)
    console.log(`标题: ${post.title}`)
    console.log(`Slug: ${post.slug}`)
    console.log(`状态: ${post.status}`)
    console.log(`创建时间: ${post.created_at}`)
    console.log(`更新时间: ${post.updated_at}`)
    console.log(`发布时间: ${post.published_at || '未发布'}`)
    console.log(`浏览量: ${post.views_count}`)
    console.log(`点赞数: ${post.likes_count}`)
    console.log(`评论数: ${post.comments_count}`)
    console.log(`摘要: ${post.excerpt || '无'}`)
    console.log(`内容长度: ${post.content.length} 字符`)

    // 获取标签
    const tags = await BlogModel.getPostTags(post.id)
    console.log(`\n标签数量: ${tags.length}`)
    if (tags.length > 0) {
      console.log('标签列表:')
      tags.forEach((tag: any) => {
        console.log(`  - ${tag.name} (${tag.slug})`)
      })
    }

    // 获取评论
    const comments = await BlogModel.getPostComments(post.id)
    console.log(`\n评论数量: ${comments.length}`)
    if (comments.length > 0) {
      console.log('评论列表:')
      comments.forEach((comment: any, index: number) => {
        console.log(`  ${index + 1}. ${comment.author_name} (${comment.status})`)
        console.log(`     内容: ${comment.content.substring(0, 50)}...`)
        console.log(`     时间: ${comment.created_at}`)
      })
    }
  } catch (error) {
    console.error('❌ 获取博客文章详情失败:', error)
  }
}

async function showBlogTags() {
  try {
    console.log('\n🏷️  所有博客标签:')
    console.log('-'.repeat(50))

    const tags = await BlogModel.getAllTags()

    if (tags.length === 0) {
      console.log('暂无博客标签')
      return
    }

    tags.forEach((tag: any) => {
      console.log(`ID: ${tag.id}`)
      console.log(`名称: ${tag.name}`)
      console.log(`Slug: ${tag.slug}`)
      console.log(`描述: ${tag.description || '无'}`)
      console.log(`创建时间: ${tag.created_at}`)
      console.log('-'.repeat(30))
    })

    console.log(`总计: ${tags.length} 个标签`)
  } catch (error) {
    console.error('❌ 获取标签列表失败:', error)
  }
}

async function showBlogComments() {
  try {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const postId = await new Promise<string>((resolve) => {
      readline.question('请输入博客文章ID (留空查看所有评论): ', resolve)
    })
    readline.close()

    if (postId.trim()) {
      const comments = await BlogModel.getPostComments(parseInt(postId))
      console.log(`\n💬 博客文章 ${postId} 的评论列表:`)
      console.log('-'.repeat(80))

      if (comments.length === 0) {
        console.log('该文章暂无评论')
        return
      }

      comments.forEach((comment: any, index: number) => {
        console.log(`${index + 1}. 评论ID: ${comment.id}`)
        console.log(`   作者: ${comment.author_name}`)
        console.log(`   邮箱: ${comment.author_email || '无'}`)
        console.log(`   状态: ${comment.status}`)
        console.log(`   内容: ${comment.content}`)
        console.log(`   创建时间: ${comment.created_at}`)
        console.log('-'.repeat(40))
      })
    } else {
      // 查看所有评论
      const allComments = await query(`
        SELECT c.*, p.title as post_title
        FROM blog_comments c
        JOIN blog_posts p ON c.post_id = p.id
        ORDER BY c.created_at DESC
        LIMIT 20
      `)

      console.log('\n💬 最近20条评论:')
      console.log('-'.repeat(80))

      if (allComments.rows.length === 0) {
        console.log('暂无评论')
        return
      }

      allComments.rows.forEach((comment: any, index: number) => {
        console.log(`${index + 1}. 评论ID: ${comment.id}`)
        console.log(`   文章: ${comment.post_title} (ID: ${comment.post_id})`)
        console.log(`   作者: ${comment.author_name}`)
        console.log(`   状态: ${comment.status}`)
        console.log(`   内容: ${comment.content.substring(0, 50)}...`)
        console.log(`   时间: ${comment.created_at}`)
        console.log('-'.repeat(40))
      })
    }
  } catch (error) {
    console.error('❌ 获取评论列表失败:', error)
  }
}

async function deleteBlogPost() {
  try {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const id = await new Promise<string>((resolve) => {
      readline.question('请输入要删除的博客文章ID: ', resolve)
    })

    const confirm = await new Promise<string>((resolve) => {
      readline.question('确认删除？这将同时删除所有相关标签和评论记录 (y/N): ', resolve)
    })
    readline.close()

    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ 取消删除')
      return
    }

    const success = await BlogModel.delete(parseInt(id))
    if (success) {
      console.log('✅ 博客文章删除成功')
    } else {
      console.log('❌ 博客文章删除失败')
    }
  } catch (error) {
    console.error('❌ 删除博客文章失败:', error)
  }
}

async function showDatabaseStats() {
  try {
    console.log('\n📊 博客数据库统计信息:')
    console.log('-'.repeat(50))

    // 博客文章统计
    const postsResult = await query('SELECT COUNT(*) as count FROM blog_posts')
    const postsCount = postsResult.rows[0].count

    const publishedPostsResult = await query("SELECT COUNT(*) as count FROM blog_posts WHERE status = 'published'")
    const publishedPostsCount = publishedPostsResult.rows[0].count

    const draftPostsResult = await query("SELECT COUNT(*) as count FROM blog_posts WHERE status = 'draft'")
    const draftPostsCount = draftPostsResult.rows[0].count

    // 标签统计
    const tagsResult = await query('SELECT COUNT(*) as count FROM blog_tags')
    const tagsCount = tagsResult.rows[0].count

    // 评论统计
    const commentsResult = await query('SELECT COUNT(*) as count FROM blog_comments')
    const commentsCount = commentsResult.rows[0].count

    const approvedCommentsResult = await query("SELECT COUNT(*) as count FROM blog_comments WHERE status = 'approved'")
    const approvedCommentsCount = approvedCommentsResult.rows[0].count

    // 总浏览量和点赞数
    const totalViewsResult = await query('SELECT SUM(views_count) as total FROM blog_posts')
    const totalViews = totalViewsResult.rows[0].total || 0

    const totalLikesResult = await query('SELECT SUM(likes_count) as total FROM blog_posts')
    const totalLikes = totalLikesResult.rows[0].total || 0

    console.log(`博客文章总数: ${postsCount}`)
    console.log(`已发布文章: ${publishedPostsCount}`)
    console.log(`草稿文章: ${draftPostsCount}`)
    console.log(`标签总数: ${tagsCount}`)
    console.log(`评论总数: ${commentsCount}`)
    console.log(`已批准评论: ${approvedCommentsCount}`)
    console.log(`总浏览量: ${totalViews}`)
    console.log(`总点赞数: ${totalLikes}`)

    // 最近创建的博客文章
    const recentPosts = await query(`
      SELECT title, status, created_at, views_count
      FROM blog_posts
      ORDER BY created_at DESC
      LIMIT 5
    `)

    if (recentPosts.rows.length > 0) {
      console.log('\n最近创建的博客文章:')
      recentPosts.rows.forEach((row: any) => {
        console.log(`  - ${row.title} (${row.status}) - ${row.views_count} 浏览`)
        const createdAtDate = row.created_at instanceof Date
          ? row.created_at
          : new Date(row.created_at)
        const createdAtStr = isNaN(createdAtDate.getTime())
          ? String(row.created_at)
          : createdAtDate.toISOString().slice(0, 10)
        console.log(`    创建时间: ${createdAtStr}`)
      })
    }
  } catch (error) {
    console.error('❌ 获取统计信息失败:', error)
  }
}

async function showTableStructure() {
  try {
    console.log('\n🏗️  博客数据库表结构:')
    console.log('-'.repeat(50))

    // 博客文章表结构
    console.log('\n📝 blog_posts 表:')
    const postsStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'blog_posts'
      ORDER BY ordinal_position
    `)

    postsStructure.rows.forEach((col: any) => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(可空)' : '(非空)'} ${col.column_default ? `默认: ${col.column_default}` : ''}`)
    })

    // 博客标签表结构
    console.log('\n🏷️  blog_tags 表:')
    const tagsStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'blog_tags'
      ORDER BY ordinal_position
    `)

    tagsStructure.rows.forEach((col: any) => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(可空)' : '(非空)'} ${col.column_default ? `默认: ${col.column_default}` : ''}`)
    })

    // 博客评论表结构
    console.log('\n💬 blog_comments 表:')
    const commentsStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'blog_comments'
      ORDER BY ordinal_position
    `)

    commentsStructure.rows.forEach((col: any) => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(可空)' : '(非空)'} ${col.column_default ? `默认: ${col.column_default}` : ''}`)
    })

    // 关联表结构
    console.log('\n🔗 blog_post_tags 表:')
    const postTagsStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'blog_post_tags'
      ORDER BY ordinal_position
    `)

    postTagsStructure.rows.forEach((col: any) => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(可空)' : '(非空)'} ${col.column_default ? `默认: ${col.column_default}` : ''}`)
    })

  } catch (error) {
    console.error('❌ 获取表结构失败:', error)
  }
}

async function main() {
  console.log('🔧 博客数据库管理工具启动...')

  // 测试数据库连接
  try {
    await query('SELECT NOW()')
    console.log('✅ 数据库连接成功')
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    process.exit(1)
  }

  // 非交互环境（如管道、CI），直接执行统计后退出，避免 readline 报错
  if (!process.stdin.isTTY) {
    await showDatabaseStats()
    process.exit(0)
  }

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  readline.on('close', () => {
    console.log('🔌 输入已关闭，退出。')
    process.exit(0)
  })

  while (true) {
    await showMenu()

    const choice = await new Promise<string>((resolve) => {
      readline.question('请选择操作 (0-7): ', resolve)
    })

    switch (choice) {
      case '1':
        await listAllBlogPosts()
        break
      case '2':
        await showBlogPostDetail()
        break
      case '3':
        await showBlogTags()
        break
      case '4':
        await showBlogComments()
        break
      case '5':
        await deleteBlogPost()
        break
      case '6':
        await showDatabaseStats()
        break
      case '7':
        await showTableStructure()
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
