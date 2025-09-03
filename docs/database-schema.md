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

## 🚀 部署方案

### 方案一：本地PostgreSQL（开发环境）
- 安装PostgreSQL
- 创建数据库和用户
- 运行SQL脚本创建表

### 方案二：腾讯云PostgreSQL（生产环境）
- 购买腾讯云PostgreSQL实例
- 配置安全组和网络
- 连接并创建表结构
