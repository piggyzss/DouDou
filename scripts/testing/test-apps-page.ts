import { AppModel } from "../../lib/models/app";

async function testAppsPage() {
  try {
    console.log("🧪 测试Apps页面数据...");

    // 测试获取应用列表
    console.log("\n1. 测试获取应用列表...");
    const appsList = await AppModel.findAll({
      page: 1,
      limit: 10,
      status: "online",
    });
    console.log(`✅ 获取到 ${appsList.apps.length} 个在线应用`);

    if (appsList.apps.length > 0) {
      const app = appsList.apps[0];
      console.log(`   示例应用: ${app.name}`);
      console.log(`   类型: ${app.type}`);
      console.log(`   平台: ${app.platform}`);
      console.log(`   状态: ${app.status}`);
      console.log(`   标签: ${app.tags.join(", ")}`);
      console.log(`   封面: ${app.cover_image_url || "无"}`);
      console.log(`   视频: ${app.video_url || "无"}`);
      console.log(`   二维码: ${app.qr_code_url || "无"}`);
    }

    // 测试按类型筛选
    console.log("\n2. 测试按类型筛选...");
    const appTypeResult = await AppModel.findAll({
      type: "app",
      status: "online",
      page: 1,
      limit: 5,
    });
    console.log(`✅ 应用类型: 找到 ${appTypeResult.apps.length} 个应用`);

    const gameTypeResult = await AppModel.findAll({
      type: "game",
      status: "online",
      page: 1,
      limit: 5,
    });
    console.log(`✅ 游戏类型: 找到 ${gameTypeResult.apps.length} 个游戏`);

    // 测试按平台筛选
    console.log("\n3. 测试按平台筛选...");
    const webResult = await AppModel.findAll({
      platform: "web",
      status: "online",
      page: 1,
      limit: 5,
    });
    console.log(`✅ Web平台: 找到 ${webResult.apps.length} 个应用`);

    const mobileResult = await AppModel.findAll({
      platform: "mobile",
      status: "online",
      page: 1,
      limit: 5,
    });
    console.log(`✅ 移动端: 找到 ${mobileResult.apps.length} 个应用`);

    // 测试搜索功能
    console.log("\n4. 测试搜索功能...");
    const searchResult = await AppModel.search("AI", { page: 1, limit: 5 });
    console.log(`✅ 搜索"AI": 找到 ${searchResult.apps.length} 个应用`);

    const searchResult2 = await AppModel.search("游戏", { page: 1, limit: 5 });
    console.log(`✅ 搜索"游戏": 找到 ${searchResult2.apps.length} 个应用`);

    // 测试统计数据
    if (appsList.apps.length > 0) {
      console.log("\n5. 测试统计数据...");
      const appId = appsList.apps[0].id;
      const stats = await AppModel.getStats(appId, 7);
      console.log(`✅ 应用 ${appId} 的统计数据: ${stats.length} 条记录`);

      if (stats.length > 0) {
        console.log(`   最新DAU: ${stats[0].dau}`);
        console.log(`   最新下载: ${stats[0].downloads}`);
      }
    }

    // 测试标签
    console.log("\n6. 测试标签...");
    const tags = await AppModel.getTags();
    console.log(`✅ 获取到 ${tags.length} 个标签`);
    if (tags.length > 0) {
      console.log(
        `   标签示例: ${tags
          .slice(0, 3)
          .map((t) => t.name)
          .join(", ")}`,
      );
    }

    console.log("\n🎉 Apps页面数据测试完成!");
    console.log("\n📊 数据统计:");
    console.log(`   - 总应用数: ${appsList.total}`);
    console.log(`   - 在线应用: ${appsList.apps.length}`);
    console.log(`   - 应用类型: ${appTypeResult.apps.length}`);
    console.log(`   - 游戏类型: ${gameTypeResult.apps.length}`);
    console.log(`   - Web平台: ${webResult.apps.length}`);
    console.log(`   - 移动端: ${mobileResult.apps.length}`);
    console.log(`   - 标签数量: ${tags.length}`);
  } catch (error) {
    console.error("❌ Apps页面数据测试失败:", error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testAppsPage()
    .then(() => {
      console.log("🎉 Apps页面数据测试完成!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Apps页面数据测试失败:", error);
      process.exit(1);
    });
}

export { testAppsPage };
