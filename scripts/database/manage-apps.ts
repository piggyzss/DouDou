#!/usr/bin/env ts-node

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { query, getRows, getRow } from "../../lib/database";
import { AppModel } from "../../lib/models/app";

async function showMenu() {
  console.log("\n📱 应用数据库管理工具");
  console.log("=".repeat(50));
  console.log("1. 查看所有应用");
  console.log("2. 查看应用详情");
  console.log("3. 按状态筛选应用");
  console.log("4. 按类型筛选应用");
  console.log("5. 按平台筛选应用");
  console.log("6. 搜索应用");
  console.log("7. 删除应用");
  console.log("8. 更新应用信息");
  console.log("9. 数据库统计信息");
  console.log("10. 查看数据库表结构");
  console.log("0. 退出");
  console.log("=".repeat(50));
}

async function listAllApps() {
  try {
    console.log("\n📋 所有应用列表:");
    console.log("-".repeat(100));

    const result = await AppModel.findAll({ page: 1, limit: 50 });

    if (result.apps.length === 0) {
      console.log("暂无应用");
      return;
    }

    result.apps.forEach((app: any) => {
      console.log(`ID: ${app.id}`);
      console.log(`名称: ${app.name}`);
      console.log(`Slug: ${app.slug}`);
      console.log(
        `类型: ${app.type} | 平台: ${app.platform} | 状态: ${app.status}`,
      );
      console.log(`体验方式: ${app.experience_method}`);
      console.log(`标签: ${app.tags?.join(", ") || "无"}`);
      console.log(
        `DAU: ${app.dau} | 下载量: ${app.downloads} | 点赞数: ${app.likes_count}`,
      );
      console.log(`趋势: ${app.trend}`);
      console.log(`创建时间: ${app.created_at}`);
      console.log(`发布时间: ${app.published_at || "未发布"}`);
      console.log("-".repeat(50));
    });

    console.log(`总计: ${result.total} 个应用`);
  } catch (error) {
    console.error("❌ 获取应用列表失败:", error);
  }
}

async function showAppDetail() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const id = await new Promise<string>((resolve) => {
      readline.question("请输入应用ID: ", resolve);
    });
    readline.close();

    const app = await AppModel.findById(parseInt(id));
    if (!app) {
      console.log("❌ 未找到该应用");
      return;
    }

    console.log("\n📱 应用详情:");
    console.log("-".repeat(60));
    console.log(`ID: ${app.id}`);
    console.log(`名称: ${app.name}`);
    console.log(`Slug: ${app.slug}`);
    console.log(`描述: ${app.description}`);
    console.log(`类型: ${app.type}`);
    console.log(`平台: ${app.platform}`);
    console.log(`状态: ${app.status}`);
    console.log(`体验方式: ${app.experience_method}`);
    console.log(`标签: ${app.tags?.join(", ") || "无"}`);
    console.log(`DAU: ${app.dau}`);
    console.log(`下载量: ${app.downloads}`);
    console.log(`点赞数: ${app.likes_count}`);
    console.log(`趋势: ${app.trend}`);
    console.log(`创建时间: ${app.created_at}`);
    console.log(`更新时间: ${app.updated_at}`);
    console.log(`发布时间: ${app.published_at || "未发布"}`);

    if (app.download_url) {
      console.log(`下载链接: ${app.download_url}`);
    }
    if (app.qr_code_url) {
      console.log(`二维码链接: ${app.qr_code_url}`);
    }
    if (app.cover_image_url) {
      console.log(`封面图片: ${app.cover_image_url}`);
    }
    if (app.video_url) {
      console.log(`演示视频: ${app.video_url}`);
    }
  } catch (error) {
    console.error("❌ 获取应用详情失败:", error);
  }
}

async function filterAppsByStatus() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("\n可用状态:");
    console.log("1. online (已上线)");
    console.log("2. beta (测试版)");
    console.log("3. development (开发中)");

    const statusChoice = await new Promise<string>((resolve) => {
      readline.question("请选择状态 (1-3): ", resolve);
    });

    let status = "";
    switch (statusChoice) {
      case "1":
        status = "online";
        break;
      case "2":
        status = "beta";
        break;
      case "3":
        status = "development";
        break;
      default:
        console.log("❌ 无效选择");
        readline.close();
        return;
    }
    readline.close();

    console.log(`\n📋 状态为 "${status}" 的应用列表:`);
    console.log("-".repeat(80));

    const result = await AppModel.findAll({ page: 1, limit: 50, status });

    if (result.apps.length === 0) {
      console.log(`暂无状态为 "${status}" 的应用`);
      return;
    }

    result.apps.forEach((app: any) => {
      console.log(
        `ID: ${app.id} | 名称: ${app.name} | 类型: ${app.type} | 平台: ${app.platform}`,
      );
      console.log(
        `DAU: ${app.dau} | 下载量: ${app.downloads} | 点赞数: ${app.likes_count}`,
      );
      console.log(`创建时间: ${app.created_at}`);
      console.log("-".repeat(40));
    });

    console.log(`总计: ${result.total} 个应用`);
  } catch (error) {
    console.error("❌ 筛选应用失败:", error);
  }
}

async function filterAppsByType() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("\n可用类型:");
    console.log("1. app (应用)");
    console.log("2. miniprogram (小程序)");
    console.log("3. game (游戏)");

    const typeChoice = await new Promise<string>((resolve) => {
      readline.question("请选择类型 (1-3): ", resolve);
    });

    let type = "";
    switch (typeChoice) {
      case "1":
        type = "app";
        break;
      case "2":
        type = "miniprogram";
        break;
      case "3":
        type = "game";
        break;
      default:
        console.log("❌ 无效选择");
        readline.close();
        return;
    }
    readline.close();

    console.log(`\n📋 类型为 "${type}" 的应用列表:`);
    console.log("-".repeat(80));

    const result = await AppModel.findAll({ page: 1, limit: 50, type });

    if (result.apps.length === 0) {
      console.log(`暂无类型为 "${type}" 的应用`);
      return;
    }

    result.apps.forEach((app: any) => {
      console.log(
        `ID: ${app.id} | 名称: ${app.name} | 状态: ${app.status} | 平台: ${app.platform}`,
      );
      console.log(
        `DAU: ${app.dau} | 下载量: ${app.downloads} | 点赞数: ${app.likes_count}`,
      );
      console.log(`创建时间: ${app.created_at}`);
      console.log("-".repeat(40));
    });

    console.log(`总计: ${result.total} 个应用`);
  } catch (error) {
    console.error("❌ 筛选应用失败:", error);
  }
}

async function filterAppsByPlatform() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("\n可用平台:");
    console.log("1. web (Web)");
    console.log("2. mobile (移动端)");
    console.log("3. wechat (微信)");

    const platformChoice = await new Promise<string>((resolve) => {
      readline.question("请选择平台 (1-3): ", resolve);
    });

    let platform = "";
    switch (platformChoice) {
      case "1":
        platform = "web";
        break;
      case "2":
        platform = "mobile";
        break;
      case "3":
        platform = "wechat";
        break;
      default:
        console.log("❌ 无效选择");
        readline.close();
        return;
    }
    readline.close();

    console.log(`\n📋 平台为 "${platform}" 的应用列表:`);
    console.log("-".repeat(80));

    const result = await AppModel.findAll({ page: 1, limit: 50, platform });

    if (result.apps.length === 0) {
      console.log(`暂无平台为 "${platform}" 的应用`);
      return;
    }

    result.apps.forEach((app: any) => {
      console.log(
        `ID: ${app.id} | 名称: ${app.name} | 类型: ${app.type} | 状态: ${app.status}`,
      );
      console.log(
        `DAU: ${app.dau} | 下载量: ${app.downloads} | 点赞数: ${app.likes_count}`,
      );
      console.log(`创建时间: ${app.created_at}`);
      console.log("-".repeat(40));
    });

    console.log(`总计: ${result.total} 个应用`);
  } catch (error) {
    console.error("❌ 筛选应用失败:", error);
  }
}

async function searchApps() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const searchTerm = await new Promise<string>((resolve) => {
      readline.question("请输入搜索关键词: ", resolve);
    });
    readline.close();

    if (!searchTerm.trim()) {
      console.log("❌ 搜索关键词不能为空");
      return;
    }

    console.log(`\n🔍 搜索结果 (关键词: "${searchTerm}"):`);
    console.log("-".repeat(80));

    const result = await AppModel.search(searchTerm, { page: 1, limit: 50 });

    if (result.apps.length === 0) {
      console.log(`未找到包含 "${searchTerm}" 的应用`);
      return;
    }

    result.apps.forEach((app: any) => {
      console.log(
        `ID: ${app.id} | 名称: ${app.name} | 类型: ${app.type} | 状态: ${app.status}`,
      );
      console.log(`描述: ${app.description.substring(0, 100)}...`);
      console.log(
        `DAU: ${app.dau} | 下载量: ${app.downloads} | 点赞数: ${app.likes_count}`,
      );
      console.log(`创建时间: ${app.created_at}`);
      console.log("-".repeat(40));
    });

    console.log(`总计: ${result.total} 个应用`);
  } catch (error) {
    console.error("❌ 搜索应用失败:", error);
  }
}

async function deleteApp() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const id = await new Promise<string>((resolve) => {
      readline.question("请输入要删除的应用ID: ", resolve);
    });

    const confirm = await new Promise<string>((resolve) => {
      readline.question("确认删除？这将同时删除所有相关数据 (y/N): ", resolve);
    });
    readline.close();

    if (confirm.toLowerCase() !== "y") {
      console.log("❌ 取消删除");
      return;
    }

    const success = await AppModel.delete(parseInt(id));
    if (success) {
      console.log("✅ 应用删除成功");
    } else {
      console.log("❌ 应用删除失败");
    }
  } catch (error) {
    console.error("❌ 删除应用失败:", error);
  }
}

async function updateApp() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const id = await new Promise<string>((resolve) => {
      readline.question("请输入要更新的应用ID: ", resolve);
    });

    const app = await AppModel.findById(parseInt(id));
    if (!app) {
      console.log("❌ 未找到该应用");
      readline.close();
      return;
    }

    console.log("\n当前应用信息:");
    console.log(`名称: ${app.name}`);
    console.log(`描述: ${app.description}`);
    console.log(`状态: ${app.status}`);
    console.log(`DAU: ${app.dau}`);
    console.log(`下载量: ${app.downloads}`);
    console.log(`点赞数: ${app.likes_count}`);
    console.log(`趋势: ${app.trend}`);

    console.log("\n请输入新的信息 (留空保持不变):");

    const newName = await new Promise<string>((resolve) => {
      readline.question(`名称 [${app.name}]: `, resolve);
    });

    const newDescription = await new Promise<string>((resolve) => {
      readline.question(`描述 [${app.description}]: `, resolve);
    });

    const newStatus = await new Promise<string>((resolve) => {
      readline.question(
        `状态 (online/beta/development) [${app.status}]: `,
        resolve,
      );
    });

    const newDau = await new Promise<string>((resolve) => {
      readline.question(`DAU [${app.dau}]: `, resolve);
    });

    const newDownloads = await new Promise<string>((resolve) => {
      readline.question(`下载量 [${app.downloads}]: `, resolve);
    });

    const newTrend = await new Promise<string>((resolve) => {
      readline.question(
        `趋势 (rising/stable/declining) [${app.trend}]: `,
        resolve,
      );
    });

    readline.close();

    const updateData: any = {};
    if (newName.trim()) updateData.name = newName.trim();
    if (newDescription.trim()) updateData.description = newDescription.trim();
    if (newStatus.trim()) updateData.status = newStatus.trim();
    if (newDau.trim()) updateData.dau = parseInt(newDau.trim());
    if (newDownloads.trim())
      updateData.downloads = parseInt(newDownloads.trim());
    if (newTrend.trim()) updateData.trend = newTrend.trim();

    if (Object.keys(updateData).length === 0) {
      console.log("❌ 没有提供任何更新信息");
      return;
    }

    const updatedApp = await AppModel.update(parseInt(id), updateData);
    if (updatedApp) {
      console.log("✅ 应用更新成功");
      console.log("更新后的信息:");
      console.log(`名称: ${updatedApp.name}`);
      console.log(`描述: ${updatedApp.description}`);
      console.log(`状态: ${updatedApp.status}`);
      console.log(`DAU: ${updatedApp.dau}`);
      console.log(`下载量: ${updatedApp.downloads}`);
      console.log(`趋势: ${updatedApp.trend}`);
    } else {
      console.log("❌ 应用更新失败");
    }
  } catch (error) {
    console.error("❌ 更新应用失败:", error);
  }
}

async function showDatabaseStats() {
  try {
    console.log("\n📊 应用数据库统计信息:");
    console.log("-".repeat(50));

    // 应用总数统计
    const totalAppsResult = await query("SELECT COUNT(*) as count FROM apps");
    const totalApps = totalAppsResult.rows[0].count;

    // 按状态统计
    const statusStats = await query(`
      SELECT status, COUNT(*) as count 
      FROM apps 
      GROUP BY status 
      ORDER BY count DESC
    `);

    // 按类型统计
    const typeStats = await query(`
      SELECT type, COUNT(*) as count 
      FROM apps 
      GROUP BY type 
      ORDER BY count DESC
    `);

    // 按平台统计
    const platformStats = await query(`
      SELECT platform, COUNT(*) as count 
      FROM apps 
      GROUP BY platform 
      ORDER BY count DESC
    `);

    // 总统计数据
    const totalStats = await query(`
      SELECT 
        SUM(dau) as total_dau,
        SUM(downloads) as total_downloads,
        SUM(likes_count) as total_likes,
        AVG(dau) as avg_dau,
        AVG(downloads) as avg_downloads,
        AVG(likes_count) as avg_likes
      FROM apps
    `);

    console.log(`应用总数: ${totalApps}`);

    console.log("\n按状态统计:");
    statusStats.rows.forEach((row: any) => {
      const statusName =
        row.status === "online"
          ? "已上线"
          : row.status === "beta"
            ? "测试版"
            : "开发中";
      console.log(`  ${statusName}: ${row.count} 个`);
    });

    console.log("\n按类型统计:");
    typeStats.rows.forEach((row: any) => {
      const typeName =
        row.type === "app"
          ? "应用"
          : row.type === "miniprogram"
            ? "小程序"
            : "游戏";
      console.log(`  ${typeName}: ${row.count} 个`);
    });

    console.log("\n按平台统计:");
    platformStats.rows.forEach((row: any) => {
      const platformName =
        row.platform === "web"
          ? "Web"
          : row.platform === "mobile"
            ? "移动端"
            : "微信";
      console.log(`  ${platformName}: ${row.count} 个`);
    });

    const stats = totalStats.rows[0];
    console.log("\n总体数据:");
    console.log(`  总DAU: ${stats.total_dau || 0}`);
    console.log(`  总下载量: ${stats.total_downloads || 0}`);
    console.log(`  总点赞数: ${stats.total_likes || 0}`);
    console.log(`  平均DAU: ${Math.round(stats.avg_dau || 0)}`);
    console.log(`  平均下载量: ${Math.round(stats.avg_downloads || 0)}`);
    console.log(`  平均点赞数: ${Math.round(stats.avg_likes || 0)}`);

    // 最近创建的应用
    const recentApps = await query(`
      SELECT name, type, platform, status, created_at, dau, downloads
      FROM apps
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (recentApps.rows.length > 0) {
      console.log("\n最近创建的应用:");
      recentApps.rows.forEach((row: any) => {
        console.log(
          `  - ${row.name} (${row.type}/${row.platform}/${row.status})`,
        );
        console.log(`    DAU: ${row.dau} | 下载量: ${row.downloads}`);
        const createdAtDate =
          row.created_at instanceof Date
            ? row.created_at
            : new Date(row.created_at);
        const createdAtStr = isNaN(createdAtDate.getTime())
          ? String(row.created_at)
          : createdAtDate.toISOString().slice(0, 10);
        console.log(`    创建时间: ${createdAtStr}`);
      });
    }
  } catch (error) {
    console.error("❌ 获取统计信息失败:", error);
  }
}

async function showTableStructure() {
  try {
    console.log("\n🏗️  应用数据库表结构:");
    console.log("-".repeat(50));

    // 应用表结构
    console.log("\n📱 apps 表:");
    const appsStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'apps'
      ORDER BY ordinal_position
    `);

    if (appsStructure.rows.length === 0) {
      console.log("  apps 表不存在，请先运行数据库初始化");
      return;
    }

    appsStructure.rows.forEach((col: any) => {
      console.log(
        `  ${col.column_name}: ${col.data_type} ${col.is_nullable === "YES" ? "(可空)" : "(非空)"} ${col.column_default ? `默认: ${col.column_default}` : ""}`,
      );
    });

    // 检查相关表
    console.log("\n🔗 相关表检查:");

    // 检查点赞表
    try {
      const likesCount = await query(
        "SELECT COUNT(*) as count FROM likes WHERE target_type = 'app'",
      );
      console.log(`  likes 表中应用相关记录: ${likesCount.rows[0].count} 条`);
    } catch (error) {
      console.log("  likes 表: 不存在或未初始化");
    }
  } catch (error) {
    console.error("❌ 获取表结构失败:", error);
  }
}

async function main() {
  console.log("🔧 应用数据库管理工具启动...");

  // 测试数据库连接
  try {
    await query("SELECT NOW()");
    console.log("✅ 数据库连接成功");
  } catch (error) {
    console.error("❌ 数据库连接失败:", error);
    process.exit(1);
  }

  // 非交互环境（如管道、CI），直接执行统计后退出，避免 readline 报错
  if (!process.stdin.isTTY) {
    await showDatabaseStats();
    process.exit(0);
  }

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.on("close", () => {
    console.log("🔌 输入已关闭，退出。");
    process.exit(0);
  });

  while (true) {
    await showMenu();

    const choice = await new Promise<string>((resolve) => {
      readline.question("请选择操作 (0-10): ", resolve);
    });

    switch (choice) {
      case "1":
        await listAllApps();
        break;
      case "2":
        await showAppDetail();
        break;
      case "3":
        await filterAppsByStatus();
        break;
      case "4":
        await filterAppsByType();
        break;
      case "5":
        await filterAppsByPlatform();
        break;
      case "6":
        await searchApps();
        break;
      case "7":
        await deleteApp();
        break;
      case "8":
        await updateApp();
        break;
      case "9":
        await showDatabaseStats();
        break;
      case "10":
        await showTableStructure();
        break;
      case "0":
        console.log("👋 再见！");
        readline.close();
        process.exit(0);
      default:
        console.log("❌ 无效选择，请重新输入");
    }

    await new Promise<void>((resolve) => {
      readline.question("\n按回车键继续...", () => resolve());
    });
  }
}

main().catch(console.error);
