import { AppModel } from '../lib/models/app'

async function testAppsAPI() {
  try {
    console.log('🧪 开始测试Apps API...')

    // 测试1: 获取应用列表
    console.log('\n1. 测试获取应用列表...')
    const appsList = await AppModel.findAll({ page: 1, limit: 10 })
    console.log(`✅ 获取到 ${appsList.apps.length} 个应用`)
    console.log(`   总数: ${appsList.total}, 当前页: ${appsList.currentPage}`)

    // 测试2: 根据ID获取应用
    if (appsList.apps.length > 0) {
      console.log('\n2. 测试根据ID获取应用...')
      const app = await AppModel.findById(appsList.apps[0].id)
      console.log(`✅ 获取应用: ${app?.name}`)
    }

    // 测试3: 根据slug获取应用
    if (appsList.apps.length > 0) {
      console.log('\n3. 测试根据slug获取应用...')
      const app = await AppModel.findBySlug(appsList.apps[0].slug)
      console.log(`✅ 获取应用: ${app?.name}`)
    }

    // 测试4: 创建新应用
    console.log('\n4. 测试创建新应用...')
    const newApp = await AppModel.create({
      name: '测试应用',
      description: '这是一个测试应用，用于验证API功能是否正常工作。',
      tags: ['测试', 'API'],
      type: 'app',
      platform: 'web',
      status: 'development',
      experience_method: 'download',
      download_url: 'https://test-app.com'
    })
    console.log(`✅ 创建应用成功: ${newApp.name} (ID: ${newApp.id})`)

    // 测试5: 更新应用
    console.log('\n5. 测试更新应用...')
    const updatedApp = await AppModel.update(newApp.id, {
      description: '更新后的描述：这是一个经过更新的测试应用。',
      tags: ['测试', 'API', '更新']
    })
    console.log(`✅ 更新应用成功: ${updatedApp?.name}`)

    // 测试6: 记录点赞
    console.log('\n6. 测试记录点赞...')
    const likeResult = await AppModel.recordLike(newApp.id, '127.0.0.1', 'Test User Agent')
    console.log(`✅ 点赞结果: ${likeResult ? '成功' : '已点赞过'}`)

    // 测试7: 检查点赞状态
    console.log('\n7. 测试检查点赞状态...')
    const hasLiked = await AppModel.hasLiked(newApp.id, '127.0.0.1')
    console.log(`✅ 点赞状态: ${hasLiked ? '已点赞' : '未点赞'}`)

    // 测试8: 获取统计数据
    console.log('\n8. 测试获取统计数据...')
    const stats = await AppModel.getStats(newApp.id, 7)
    console.log(`✅ 获取到 ${stats.length} 条统计数据`)

    // 测试9: 更新每日统计
    console.log('\n9. 测试更新每日统计...')
    await AppModel.updateDailyStats(newApp.id, new Date().toISOString().split('T')[0], {
      dau: 100,
      downloads: 50
    })
    console.log('✅ 更新每日统计成功')

    // 测试10: 获取标签列表
    console.log('\n10. 测试获取标签列表...')
    const tags = await AppModel.getTags()
    console.log(`✅ 获取到 ${tags.length} 个标签`)

    // 测试11: 创建标签
    console.log('\n11. 测试创建标签...')
    const newTag = await AppModel.createTag({
      name: '测试标签',
      description: '这是一个测试标签',
      color: '#FF6B6B'
    })
    console.log(`✅ 创建标签成功: ${newTag.name} (ID: ${newTag.id})`)

    // 测试12: 搜索应用
    console.log('\n12. 测试搜索应用...')
    const searchResult = await AppModel.search('测试', { page: 1, limit: 5 })
    console.log(`✅ 搜索结果: 找到 ${searchResult.apps.length} 个应用`)

    // 测试13: 按类型筛选
    console.log('\n13. 测试按类型筛选...')
    const appTypeResult = await AppModel.findAll({ type: 'app', page: 1, limit: 5 })
    console.log(`✅ 应用类型筛选: 找到 ${appTypeResult.apps.length} 个应用`)

    // 测试14: 按平台筛选
    console.log('\n14. 测试按平台筛选...')
    const platformResult = await AppModel.findAll({ platform: 'web', page: 1, limit: 5 })
    console.log(`✅ Web平台筛选: 找到 ${platformResult.apps.length} 个应用`)

    // 测试15: 按标签筛选
    console.log('\n15. 测试按标签筛选...')
    const tagResult = await AppModel.findAll({ tag: '测试', page: 1, limit: 5 })
    console.log(`✅ 标签筛选: 找到 ${tagResult.apps.length} 个应用`)

    // 清理测试数据
    console.log('\n🧹 清理测试数据...')
    await AppModel.delete(newApp.id)
    console.log('✅ 测试应用删除成功')

    console.log('\n🎉 所有API测试通过!')
    
  } catch (error) {
    console.error('❌ API测试失败:', error)
    throw error
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testAppsAPI()
    .then(() => {
      console.log('🎉 Apps API测试完成!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Apps API测试失败:', error)
      process.exit(1)
    })
}

export { testAppsAPI }
