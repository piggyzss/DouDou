#!/usr/bin/env ts-node

import "dotenv/config";
import { initDatabase } from "../../lib/database";

async function main() {
  try {
    console.log("🚀 正在初始化AIGC数据库...");

    await initDatabase();

    console.log("✅ AIGC数据库初始化完成！");
    console.log("📋 已创建以下表：");
    console.log("   - artwork_collections (作品集表)");
    console.log("   - artwork_images (图片资源表)");
    console.log("   - artwork_likes (点赞记录表)");
    console.log("   - blog_posts (博客文章表)");

    process.exit(0);
  } catch (error) {
    console.error("❌ 数据库初始化失败:", error);
    process.exit(1);
  }
}

main();
