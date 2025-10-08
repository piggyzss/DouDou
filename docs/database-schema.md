# 数据库表结构设计

## 🎯 AIGC图片模块数据结构

### 1. 作品集表 (artwork_collections)

```sql
CREATE TABLE artwork_collections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[], -- PostgreSQL数组类型
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, draft, archived
    user_id INTEGER, -- 预留用户系统
    cover_image_url VARCHAR(500), -- 封面图片
    is_public BOOLEAN DEFAULT true
);

-- 索引
CREATE INDEX idx_artwork_collections_created_at ON artwork_collections(created_at);
CREATE INDEX idx_artwork_collections_tags ON artwork_collections USING GIN(tags);
CREATE INDEX idx_artwork_collections_status ON artwork_collections(status);
```

### 2. 图片资源表 (artwork_images)

```sql
CREATE TABLE artwork_images (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES artwork_collections(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    file_size INTEGER, -- 文件大小（字节）
    width INTEGER, -- 图片宽度
    height INTEGER, -- 图片高度
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sort_order INTEGER DEFAULT 0, -- 排序
    is_cover BOOLEAN DEFAULT false -- 是否为封面
);

-- 索引
CREATE INDEX idx_artwork_images_collection_id ON artwork_images(collection_id);
CREATE INDEX idx_artwork_images_sort_order ON artwork_images(sort_order);
```

### 3. 点赞记录表 (artwork_likes)

```sql
CREATE TABLE artwork_likes (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES artwork_collections(id) ON DELETE CASCADE,
    user_id INTEGER, -- 预留用户系统
    ip_address INET, -- 记录IP地址
    user_agent TEXT, -- 用户代理
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, ip_address) -- 防止重复点赞
);

-- 索引
CREATE INDEX idx_artwork_likes_collection_id ON artwork_likes(collection_id);
CREATE INDEX idx_artwork_likes_created_at ON artwork_likes(created_at);
```

### 4. 浏览记录表 (artwork_views)

```sql
CREATE TABLE artwork_views (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES artwork_collections(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referer VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_artwork_views_collection_id ON artwork_views(collection_id);
CREATE INDEX idx_artwork_views_created_at ON artwork_views(created_at);
```

## 📝 博客模块数据结构

### 1. 博客文章表 (blog_posts)

```sql
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    author_id INTEGER, -- 预留作者系统
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    featured_image_url VARCHAR(500),
    meta_title VARCHAR(255),
    meta_description TEXT
);

-- 索引
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);
```

### 2. 博客文件表 (blog_files)

```sql
CREATE TABLE blog_files (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_blog_files_post_id ON blog_files(post_id);
```

## 📱 应用展示模块数据结构

### 1. 应用表 (apps)

```sql
CREATE TABLE apps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[], -- PostgreSQL数组类型，存储技术栈、功能分类等标签
    type VARCHAR(20) NOT NULL, -- 'app', 'miniprogram', 'game'
    platform VARCHAR(20) NOT NULL, -- 'web', 'mobile', 'wechat'
    status VARCHAR(20) DEFAULT 'development', -- 'development', 'beta', 'online'
    experience_method VARCHAR(20) NOT NULL, -- 'download', 'qrcode'
    download_url VARCHAR(500), -- 下载链接
    qr_code_url VARCHAR(500), -- 二维码图片链接
    cover_image_url VARCHAR(500), -- 封面图片
    video_url VARCHAR(500), -- 演示视频链接
    dau INTEGER DEFAULT 0, -- 日活跃用户数
    downloads INTEGER DEFAULT 0, -- 下载量
    likes_count INTEGER DEFAULT 0, -- 点赞数
    trend VARCHAR(20) DEFAULT 'stable', -- 'rising', 'stable', 'declining'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP -- 发布时间
);

-- 索引
CREATE INDEX idx_apps_slug ON apps(slug);
CREATE INDEX idx_apps_type ON apps(type);
CREATE INDEX idx_apps_platform ON apps(platform);
CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_apps_tags ON apps USING GIN(tags);
CREATE INDEX idx_apps_created_at ON apps(created_at);
CREATE INDEX idx_apps_likes_count ON apps(likes_count);
CREATE INDEX idx_apps_downloads ON apps(downloads);
```

### 2. 应用统计表 (app_stats) - 可选扩展

```sql
CREATE TABLE app_stats (
    id SERIAL PRIMARY KEY,
    app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(app_id, date)
);

-- 索引
CREATE INDEX idx_app_stats_app_id ON app_stats(app_id);
CREATE INDEX idx_app_stats_date ON app_stats(date);
```

## 🎵 其他模块数据结构

### 1. 视频作品表 (video_tracks)

```sql
CREATE TABLE video_tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[],
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    duration INTEGER, -- 视频时长（秒）
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active'
);

-- 索引
CREATE INDEX idx_video_tracks_created_at ON video_tracks(created_at);
CREATE INDEX idx_video_tracks_tags ON video_tracks USING GIN(tags);
```

### 2. 音频作品表 (audio_tracks)

```sql
CREATE TABLE audio_tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[],
    audio_url VARCHAR(500) NOT NULL,
    duration INTEGER, -- 音频时长（秒）
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0,
    plays_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active'
);

-- 索引
CREATE INDEX idx_audio_tracks_created_at ON audio_tracks(created_at);
CREATE INDEX idx_audio_tracks_tags ON audio_tracks USING GIN(tags);
```

## 🔄 触发器设计

### 1. 自动更新点赞数

```sql
CREATE OR REPLACE FUNCTION update_artwork_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE artwork_collections
        SET likes_count = likes_count + 1
        WHERE id = NEW.collection_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE artwork_collections
        SET likes_count = likes_count - 1
        WHERE id = OLD.collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_artwork_likes_count
    AFTER INSERT OR DELETE ON artwork_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_artwork_likes_count();
```

### 2. 自动更新时间戳

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_artwork_collections_updated_at
    BEFORE UPDATE ON artwork_collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 📊 数据统计视图

### 1. 作品集统计视图

```sql
CREATE VIEW artwork_collections_stats AS
SELECT
    ac.id,
    ac.title,
    ac.created_at,
    ac.likes_count,
    ac.views_count,
    COUNT(ai.id) as image_count,
    AVG(ai.file_size) as avg_image_size
FROM artwork_collections ac
LEFT JOIN artwork_images ai ON ac.id = ai.collection_id
WHERE ac.status = 'active'
GROUP BY ac.id, ac.title, ac.created_at, ac.likes_count, ac.views_count
ORDER BY ac.created_at DESC;
```

## 👍 点赞系统表结构

### 1. 统一点赞表 (likes)

```sql
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    target_type VARCHAR(20) NOT NULL,  -- 'blog', 'artwork', 'music', 'video'
    target_id INTEGER NOT NULL,
    anon_id VARCHAR(64),               -- 匿名用户标识
    ip_hash VARCHAR(128),              -- IP 地址哈希
    ua_hash VARCHAR(128),              -- User Agent 哈希
    status VARCHAR(10) DEFAULT 'liked', -- 'liked' 或 'unliked'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 唯一索引：防止重复点赞
CREATE UNIQUE INDEX idx_likes_unique_anon
ON likes(target_type, target_id, anon_id)
WHERE anon_id IS NOT NULL;

CREATE UNIQUE INDEX idx_likes_unique_ipua
ON likes(target_type, target_id, ip_hash, ua_hash)
WHERE anon_id IS NULL;

-- 查询索引
CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE INDEX idx_likes_created_at ON likes(created_at);
CREATE INDEX idx_likes_status ON likes(status);
```

### 2. 点赞计数同步触发器

```sql
-- 自动更新业务表的点赞计数
CREATE OR REPLACE FUNCTION sync_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- 计算当前有效点赞数
        DECLARE
            current_count INTEGER;
            table_name TEXT;
        BEGIN
            SELECT COUNT(*) INTO current_count
            FROM likes
            WHERE target_type = NEW.target_type
            AND target_id = NEW.target_id
            AND status = 'liked';

            -- 根据目标类型更新对应业务表
            CASE NEW.target_type
                WHEN 'artwork' THEN
                    UPDATE artwork_collections
                    SET likes_count = current_count
                    WHERE id = NEW.target_id;
                WHEN 'blog' THEN
                    UPDATE blog_posts
                    SET likes_count = current_count
                    WHERE id = NEW.target_id;
                WHEN 'music' THEN
                    UPDATE music_tracks
                    SET likes_count = current_count
                    WHERE id = NEW.target_id;
                WHEN 'video' THEN
                    UPDATE videos
                    SET likes_count = current_count
                    WHERE id = NEW.target_id;
                WHEN 'app' THEN
                    UPDATE apps
                    SET likes_count = current_count
                    WHERE id = NEW.target_id;
            END CASE;
        END;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 删除时同样需要更新计数
        DECLARE
            current_count INTEGER;
        BEGIN
            SELECT COUNT(*) INTO current_count
            FROM likes
            WHERE target_type = OLD.target_type
            AND target_id = OLD.target_id
            AND status = 'liked';

            CASE OLD.target_type
                WHEN 'artwork' THEN
                    UPDATE artwork_collections
                    SET likes_count = current_count
                    WHERE id = OLD.target_id;
                WHEN 'blog' THEN
                    UPDATE blog_posts
                    SET likes_count = current_count
                    WHERE id = OLD.target_id;
                WHEN 'music' THEN
                    UPDATE music_tracks
                    SET likes_count = current_count
                    WHERE id = OLD.target_id;
                WHEN 'video' THEN
                    UPDATE videos
                    SET likes_count = current_count
                    WHERE id = OLD.target_id;
                WHEN 'app' THEN
                    UPDATE apps
                    SET likes_count = current_count
                    WHERE id = OLD.target_id;
            END CASE;
        END;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_sync_likes_count
    AFTER INSERT OR UPDATE OR DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION sync_likes_count();
```

### 3. 点赞统计视图

```sql
-- 点赞排行榜视图
CREATE VIEW likes_ranking AS
SELECT
    target_type,
    target_id,
    COUNT(*) as likes_count,
    MAX(created_at) as last_liked_at
FROM likes
WHERE status = 'liked'
GROUP BY target_type, target_id
ORDER BY likes_count DESC, last_liked_at DESC;

-- 每日点赞统计视图
CREATE VIEW daily_likes_stats AS
SELECT
    DATE(created_at) as date,
    target_type,
    COUNT(*) as likes_count
FROM likes
WHERE status = 'liked'
GROUP BY DATE(created_at), target_type
ORDER BY date DESC, target_type;
```

### 4. 点赞数据维护

```sql
-- 修复点赞计数不一致的存储过程
CREATE OR REPLACE FUNCTION fix_likes_count()
RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    -- 修复 artwork_collections 表
    FOR r IN
        SELECT target_id, COUNT(*) as actual_count
        FROM likes
        WHERE target_type = 'artwork' AND status = 'liked'
        GROUP BY target_id
    LOOP
        UPDATE artwork_collections
        SET likes_count = r.actual_count
        WHERE id = r.target_id;
    END LOOP;

    -- 修复 blog_posts 表
    FOR r IN
        SELECT target_id, COUNT(*) as actual_count
        FROM likes
        WHERE target_type = 'blog' AND status = 'liked'
        GROUP BY target_id
    LOOP
        UPDATE blog_posts
        SET likes_count = r.actual_count
        WHERE id = r.target_id;
    END LOOP;

    -- 修复 music_tracks 表
    FOR r IN
        SELECT target_id, COUNT(*) as actual_count
        FROM likes
        WHERE target_type = 'music' AND status = 'liked'
        GROUP BY target_id
    LOOP
        UPDATE music_tracks
        SET likes_count = r.actual_count
        WHERE id = r.target_id;
    END LOOP;

    -- 修复 videos 表
    FOR r IN
        SELECT target_id, COUNT(*) as actual_count
        FROM likes
        WHERE target_type = 'video' AND status = 'liked'
        GROUP BY target_id
    LOOP
        UPDATE videos
        SET likes_count = r.actual_count
        WHERE id = r.target_id;
    END LOOP;

    -- 修复 apps 表
    FOR r IN
        SELECT target_id, COUNT(*) as actual_count
        FROM likes
        WHERE target_type = 'app' AND status = 'liked'
        GROUP BY target_id
    LOOP
        UPDATE apps
        SET likes_count = r.actual_count
        WHERE id = r.target_id;
    END LOOP;

    RAISE NOTICE '点赞计数修复完成';
END;
$$ LANGUAGE plpgsql;
```

## 🚀 部署方案

### 方案一：本地PostgreSQL（开发环境）

- 安装PostgreSQL
- 创建数据库和用户
- 运行SQL脚本创建表

### 方案二：腾讯云PostgreSQL（生产环境）

- 购买腾讯云PostgreSQL实例
- 配置安全组和网络
- 连接并创建表结构
