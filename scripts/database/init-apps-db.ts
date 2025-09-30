import { query } from '../../lib/database'

async function initAppsDatabase() {
  try {
    console.log('开始初始化Apps数据库表...')

    // 创建apps表
    await query(`
      CREATE TABLE IF NOT EXISTS apps (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        type VARCHAR(20) DEFAULT 'app' CHECK (type IN ('app', 'miniprogram', 'game')),
        platform VARCHAR(20) DEFAULT 'web' CHECK (platform IN ('web', 'mobile', 'wechat')),
        status VARCHAR(20) DEFAULT 'development' CHECK (status IN ('development', 'beta', 'online')),
        
        -- 体验相关
        experience_method VARCHAR(20) DEFAULT 'download' CHECK (experience_method IN ('download', 'qrcode')),
        download_url TEXT,
        qr_code_url TEXT,
        
        -- 媒体文件
        cover_image_url TEXT,
        video_url TEXT,
        
        -- 统计数据
        dau INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        trend VARCHAR(10) DEFAULT '+0%',
        
        -- 时间戳
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP
      )
    `)

    // 创建app_daily_stats表
    await query(`
      CREATE TABLE IF NOT EXISTS app_daily_stats (
        id SERIAL PRIMARY KEY,
        app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        dau INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(app_id, date)
      )
    `)

    // 创建app_likes表
    await query(`
      CREATE TABLE IF NOT EXISTS app_likes (
        id SERIAL PRIMARY KEY,
        app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
        ip_address INET NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(app_id, ip_address)
      )
    `)

    // 创建app_tags表
    await query(`
      CREATE TABLE IF NOT EXISTS app_tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#6B7280',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 创建索引
    await query('CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug)')
    await query('CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status)')
    await query('CREATE INDEX IF NOT EXISTS idx_apps_type ON apps(type)')
    await query('CREATE INDEX IF NOT EXISTS idx_apps_platform ON apps(platform)')
    await query('CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps(created_at)')
    await query('CREATE INDEX IF NOT EXISTS idx_apps_published_at ON apps(published_at)')
    await query('CREATE INDEX IF NOT EXISTS idx_app_daily_stats_app_id ON app_daily_stats(app_id)')
    await query('CREATE INDEX IF NOT EXISTS idx_app_daily_stats_date ON app_daily_stats(date)')
    await query('CREATE INDEX IF NOT EXISTS idx_app_likes_app_id ON app_likes(app_id)')
    await query('CREATE INDEX IF NOT EXISTS idx_app_tags_slug ON app_tags(slug)')

    // 创建更新时间触发器
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `)

    await query(`
      CREATE TRIGGER update_apps_updated_at 
      BEFORE UPDATE ON apps 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `)

    console.log('✅ Apps数据库表初始化完成!')
    
    // 插入一些测试数据
    console.log('插入测试数据...')
    
    // 插入测试应用
    await query(`
      INSERT INTO apps (name, slug, description, tags, type, platform, status, experience_method, download_url, cover_image_url, video_url, dau, downloads, likes_count, trend, published_at)
      VALUES 
        ('AI聊天助手', 'ai-chat-assistant', '基于OpenAI API的智能聊天应用，支持多轮对话、语音输入和图片识别功能，让AI成为你的智能助手。', ARRAY['AI', '聊天', '智能'], 'app', 'web', 'online', 'download', 'https://ai-chat-demo.com', 'https://example.com/cover1.jpg', 'https://example.com/video1.mp4', 1234, 5678, 128, '+12%', CURRENT_TIMESTAMP),
        ('智能记账本', 'smart-expense-tracker', '简洁易用的记账应用，支持多账户管理、分类统计、预算提醒，让理财变得简单高效。', ARRAY['记账', '理财', '工具'], 'app', 'mobile', 'online', 'download', 'https://play.google.com/expense-tracker', 'https://example.com/cover2.jpg', 'https://example.com/video2.mp4', 856, 2345, 89, '+8%', CURRENT_TIMESTAMP),
        ('像素冒险', 'pixel-adventure', '复古风格的像素冒险游戏，探索神秘世界，收集道具，挑战各种关卡，体验经典游戏乐趣。', ARRAY['游戏', '像素', '冒险'], 'game', 'web', 'online', 'qrcode', NULL, 'https://example.com/cover3.jpg', 'https://example.com/video3.mp4', 2341, 8901, 256, '+15%', CURRENT_TIMESTAMP)
      ON CONFLICT (slug) DO NOTHING
    `)

    // 插入测试标签
    await query(`
      INSERT INTO app_tags (name, slug, description, color)
      VALUES 
        ('AI', 'ai', '人工智能相关应用', '#FF6B6B'),
        ('聊天', 'chat', '聊天通讯类应用', '#4ECDC4'),
        ('智能', 'smart', '智能工具类应用', '#45B7D1'),
        ('记账', 'expense', '记账理财类应用', '#96CEB4'),
        ('理财', 'finance', '财务管理类应用', '#FFEAA7'),
        ('工具', 'tool', '实用工具类应用', '#DDA0DD'),
        ('游戏', 'game', '游戏娱乐类应用', '#98D8C8'),
        ('像素', 'pixel', '像素风格应用', '#F7DC6F'),
        ('冒险', 'adventure', '冒险类游戏', '#BB8FCE')
      ON CONFLICT (slug) DO NOTHING
    `)

    // 插入测试统计数据
    await query(`
      INSERT INTO app_daily_stats (app_id, date, dau, downloads)
      VALUES 
        (1, CURRENT_DATE - INTERVAL '6 days', 1200, 100),
        (1, CURRENT_DATE - INTERVAL '5 days', 1250, 120),
        (1, CURRENT_DATE - INTERVAL '4 days', 1180, 90),
        (1, CURRENT_DATE - INTERVAL '3 days', 1300, 150),
        (1, CURRENT_DATE - INTERVAL '2 days', 1280, 110),
        (1, CURRENT_DATE - INTERVAL '1 day', 1240, 95),
        (1, CURRENT_DATE, 1234, 85),
        (2, CURRENT_DATE - INTERVAL '6 days', 800, 50),
        (2, CURRENT_DATE - INTERVAL '5 days', 820, 60),
        (2, CURRENT_DATE - INTERVAL '4 days', 850, 70),
        (2, CURRENT_DATE - INTERVAL '3 days', 880, 80),
        (2, CURRENT_DATE - INTERVAL '2 days', 870, 75),
        (2, CURRENT_DATE - INTERVAL '1 day', 860, 65),
        (2, CURRENT_DATE, 856, 55),
        (3, CURRENT_DATE - INTERVAL '6 days', 2200, 200),
        (3, CURRENT_DATE - INTERVAL '5 days', 2250, 220),
        (3, CURRENT_DATE - INTERVAL '4 days', 2300, 250),
        (3, CURRENT_DATE - INTERVAL '3 days', 2400, 300),
        (3, CURRENT_DATE - INTERVAL '2 days', 2350, 280),
        (3, CURRENT_DATE - INTERVAL '1 day', 2320, 260),
        (3, CURRENT_DATE, 2341, 240)
      ON CONFLICT (app_id, date) DO NOTHING
    `)

    console.log('✅ 测试数据插入完成!')
    
  } catch (error) {
    console.error('❌ 初始化Apps数据库失败:', error)
    throw error
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initAppsDatabase()
    .then(() => {
      console.log('🎉 Apps数据库初始化完成!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Apps数据库初始化失败:', error)
      process.exit(1)
    })
}

export { initAppsDatabase }
