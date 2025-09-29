#!/usr/bin/env ts-node

/**
 * 变更日志更新工具
 * 使用方法：
 * npm run changelog -- --type=fix --message="修复音乐播放器状态同步问题"
 * npm run changelog -- --type=feat --message="新增视频播放器功能"
 * npm run changelog -- --type=change --message="优化首页加载性能"
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface ChangelogEntry {
  type: 'feat' | 'fix' | 'change' | 'remove' | 'security'
  message: string
  author?: string
  date?: string
}

const CHANGELOG_PATH = join(process.cwd(), 'CHANGELOG.md')

const TYPE_MAP = {
  feat: '新增',
  fix: '修复',
  change: '变更',
  remove: '移除',
  security: '安全'
}

function getCurrentDate(): string {
  return new Date().toLocaleDateString('zh-CN')
}

function getAuthor(): string {
  try {
    const { execSync } = require('child_process')
    const gitUser = execSync('git config user.name', { encoding: 'utf8' }).trim()
    return gitUser
  } catch {
    return 'Unknown'
  }
}

function parseArgs(): ChangelogEntry {
  const args = process.argv.slice(2)
  const entry: ChangelogEntry = {
    type: 'feat',
    message: '',
    author: getAuthor(),
    date: getCurrentDate()
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg.startsWith('--type=')) {
      const type = arg.split('=')[1] as ChangelogEntry['type']
      if (Object.keys(TYPE_MAP).includes(type)) {
        entry.type = type
      } else {
        console.error(`❌ 无效的变更类型: ${type}`)
        console.error(`支持的类型: ${Object.keys(TYPE_MAP).join(', ')}`)
        process.exit(1)
      }
    } else if (arg.startsWith('--message=')) {
      entry.message = arg.split('=')[1]
    } else if (arg.startsWith('--author=')) {
      entry.author = arg.split('=')[1]
    }
  }

  if (!entry.message) {
    console.error('❌ 请提供变更描述: --message="描述内容"')
    process.exit(1)
  }

  return entry
}

function updateChangelog(entry: ChangelogEntry): void {
  try {
    const content = readFileSync(CHANGELOG_PATH, 'utf8')

    // 查找 [未发布] 部分
    const unreleasedRegex = /## \[未发布\]\s*\n\n### 新增\s*\n([\s\S]*?)\n\n### 变更\s*\n([\s\S]*?)\n\n### 修复\s*\n([\s\S]*?)\n\n##/

    if (!unreleasedRegex.test(content)) {
      console.error('❌ 无法找到 [未发布] 部分，请检查 CHANGELOG.md 格式')
      process.exit(1)
    }

    const typeName = TYPE_MAP[entry.type]
    const newEntry = `- ${entry.message} (${entry.author}, ${entry.date})\n`

    let updatedContent = content.replace(unreleasedRegex, (match, feat, change, fix) => {
      switch (entry.type) {
        case 'feat':
          return `## [未发布]\n\n### 新增\n${feat}${newEntry}\n\n### 变更\n${change}\n\n### 修复\n${fix}\n\n##`
        case 'change':
          return `## [未发布]\n\n### 新增\n${feat}\n\n### 变更\n${change}${newEntry}\n\n### 修复\n${fix}\n\n##`
        case 'fix':
        case 'security':
          return `## [未发布]\n\n### 新增\n${feat}\n\n### 变更\n${change}\n\n### 修复\n${fix}${newEntry}\n\n##`
        case 'remove':
          return `## [未发布]\n\n### 新增\n${feat}\n\n### 变更\n${change}${newEntry}\n\n### 修复\n${fix}\n\n##`
        default:
          return match
      }
    })

    writeFileSync(CHANGELOG_PATH, updatedContent, 'utf8')

    console.log(`✅ 已添加 ${typeName} 记录: ${entry.message}`)
    console.log(`📝 作者: ${entry.author}`)
    console.log(`📅 日期: ${entry.date}`)

  } catch (error) {
    console.error('❌ 更新变更日志失败:', error)
    process.exit(1)
  }
}

function showHelp(): void {
  console.log(`
📝 变更日志更新工具

使用方法:
  npm run changelog -- --type=<类型> --message="<描述>"

参数:
  --type=<类型>     变更类型 (必需)
  --message="<描述>" 变更描述 (必需)
  --author="<作者>"  作者名称 (可选，默认使用 git 配置)

支持的类型:
  feat     新增功能
  fix      问题修复
  change   功能变更
  remove   移除功能
  security 安全修复

示例:
  npm run changelog -- --type=feat --message="新增视频播放器功能"
  npm run changelog -- --type=fix --message="修复音乐播放器状态同步问题"
  npm run changelog -- --type=change --message="优化首页加载性能"
`)
}

// 主程序
function main(): void {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    return
  }

  if (args.length === 0) {
    console.error('❌ 请提供参数，使用 --help 查看帮助')
    process.exit(1)
  }

  const entry = parseArgs()
  updateChangelog(entry)
}

if (require.main === module) {
  main()
}
