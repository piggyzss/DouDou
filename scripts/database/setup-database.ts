#!/usr/bin/env ts-node

import { Client } from "pg";
import * as dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: ".env.local" });

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: "postgres", // 连接到默认数据库
  user: process.env.DB_USER || "postgres", // 使用默认postgres用户
  password: process.env.DB_PASSWORD || "",
};

const TARGET_DB_NAME = process.env.DB_NAME || "doudou_db";
const TARGET_DB_USER = "doudou_user";
const TARGET_DB_PASSWORD = "doudou_password";

async function setupDatabase() {
  console.log("🔧 开始设置数据库...");

  // 连接到默认的postgres数据库
  const client = new Client(DB_CONFIG);

  try {
    await client.connect();
    console.log("✅ 连接到PostgreSQL成功");

    // 检查目标数据库是否存在
    const dbExistsResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [TARGET_DB_NAME],
    );

    if (dbExistsResult.rows.length === 0) {
      console.log(`📦 创建数据库: ${TARGET_DB_NAME}`);
      await client.query(`CREATE DATABASE ${TARGET_DB_NAME}`);
      console.log("✅ 数据库创建成功");
    } else {
      console.log(`✅ 数据库 ${TARGET_DB_NAME} 已存在`);
    }

    // 检查用户是否存在
    const userExistsResult = await client.query(
      "SELECT 1 FROM pg_user WHERE usename = $1",
      [TARGET_DB_USER],
    );

    if (userExistsResult.rows.length === 0) {
      console.log(`👤 创建用户: ${TARGET_DB_USER}`);
      await client.query(
        `CREATE USER ${TARGET_DB_USER} WITH PASSWORD '${TARGET_DB_PASSWORD}'`,
      );
      console.log("✅ 用户创建成功");
    } else {
      console.log(`✅ 用户 ${TARGET_DB_USER} 已存在`);
    }

    // 授予权限
    console.log("🔐 授予数据库权限...");
    await client.query(
      `GRANT ALL PRIVILEGES ON DATABASE ${TARGET_DB_NAME} TO ${TARGET_DB_USER}`,
    );
    console.log("✅ 权限授予成功");

    await client.end();

    // 现在连接到新创建的数据库来创建表
    console.log("📋 创建数据库表结构...");
    await createTables();

    console.log("🎉 数据库设置完成！");
    console.log("\n📝 环境变量配置:");
    console.log(`DB_HOST=${DB_CONFIG.host}`);
    console.log(`DB_PORT=${DB_CONFIG.port}`);
    console.log(`DB_NAME=${TARGET_DB_NAME}`);
    console.log(`DB_USER=${TARGET_DB_USER}`);
    console.log(`DB_PASSWORD=${TARGET_DB_PASSWORD}`);
  } catch (error) {
    console.error("❌ 数据库设置失败:", error);
    await client.end();
    process.exit(1);
  }
}

async function createTables() {
  const client = new Client({
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    database: TARGET_DB_NAME,
    user: TARGET_DB_USER,
    password: TARGET_DB_PASSWORD,
  });

  try {
    await client.connect();

    // 创建AIGC图片相关表
    console.log("🖼️  创建AIGC图片表...");

    // 作品集表
    await client.query(`
      CREATE TABLE IF NOT EXISTS artwork_collections (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        likes_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        cover_image_url VARCHAR(500)
      )
    `);

    // 图片资源表
    await client.query(`
      CREATE TABLE IF NOT EXISTS artwork_images (
        id SERIAL PRIMARY KEY,
        collection_id INTEGER REFERENCES artwork_collections(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        file_size INTEGER,
        width INTEGER,
        height INTEGER,
        mime_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sort_order INTEGER DEFAULT 0
      )
    `);

    // 点赞记录表
    await client.query(`
      CREATE TABLE IF NOT EXISTS artwork_likes (
        id SERIAL PRIMARY KEY,
        collection_id INTEGER REFERENCES artwork_collections(id) ON DELETE CASCADE,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(collection_id, ip_address)
      )
    `);

    // 创建博客相关表
    console.log("📝 创建博客表...");

    // 博客文章表
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP,
        views_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0
      )
    `);

    // 博客标签表
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 博客文章标签关联表
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_post_tags (
        post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES blog_tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      )
    `);

    // 博客评论表
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
        author_name VARCHAR(100) NOT NULL,
        author_email VARCHAR(255),
        content TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建索引
    console.log("🔍 创建数据库索引...");
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_artwork_collections_created_at ON artwork_collections(created_at)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_artwork_collections_tags ON artwork_collections USING GIN(tags)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_artwork_images_collection_id ON artwork_images(collection_id)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post_id ON blog_post_tags(post_id)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag_id ON blog_post_tags(tag_id)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status)`,
    );

    // 创建更新时间触发器
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await client.query(
      `CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
    );
    await client.query(
      `CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON blog_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
    );

    console.log("✅ 所有表结构创建完成");
  } catch (error) {
    console.error("❌ 创建表结构失败:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// 运行设置
setupDatabase().catch(console.error);
