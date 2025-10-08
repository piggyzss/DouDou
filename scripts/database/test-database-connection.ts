#!/usr/bin/env ts-node

/**
 * 测试数据库连接脚本
 * 用于验证 Vercel Postgres 连接是否正常
 */

import { Pool } from "pg";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: ".env.local" });

async function testDatabaseConnection() {
  console.log("🔍 正在测试数据库连接...\n");

  // 检查环境变量
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const postgresUrl = process.env.POSTGRES_URL;
  const postgresPrismaUrl = process.env.POSTGRES_PRISMA_URL;

  console.log("📋 环境变量检查:");
  console.log(`  DATABASE_URL: ${databaseUrl ? "✅ 已设置" : "❌ 未设置"}`);
  console.log(`  POSTGRES_URL: ${postgresUrl ? "✅ 已设置" : "❌ 未设置"}`);
  console.log(
    `  POSTGRES_PRISMA_URL: ${postgresPrismaUrl ? "✅ 已设置" : "❌ 未设置"}`,
  );
  console.log("");

  if (!databaseUrl) {
    console.error("❌ 错误：未找到 DATABASE_URL 或 POSTGRES_URL");
    console.log("请确保在 .env.local 文件中设置了数据库连接字符串");
    console.log("或者从 Vercel Dashboard 复制环境变量");
    process.exit(1);
  }

  // 创建数据库连接
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    console.log("🔗 正在连接数据库...");

    // 测试基本连接
    const client = await pool.connect();
    console.log("✅ 数据库连接成功!");

    // 测试查询
    const result = await client.query(
      "SELECT NOW() as current_time, version() as postgres_version",
    );
    const { current_time, postgres_version } = result.rows[0];

    console.log("\n📊 数据库信息:");
    console.log(`  当前时间: ${current_time}`);
    console.log(`  PostgreSQL 版本: ${postgres_version}`);

    // 检查现有表
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("\n📋 现有表:");
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row) => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log("  (无表，需要运行数据库初始化)");
    }

    client.release();
    console.log("\n✅ 数据库连接测试完成!");
  } catch (error) {
    console.error("\n❌ 数据库连接失败:");
    console.error(error);

    console.log("\n🔧 故障排除建议:");
    console.log("1. 检查 DATABASE_URL 格式是否正确");
    console.log("2. 确保数据库服务器正在运行");
    console.log("3. 检查网络连接");
    console.log("4. 验证用户名和密码");
  } finally {
    await pool.end();
  }
}

// 运行测试
testDatabaseConnection().catch(console.error);
