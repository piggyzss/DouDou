# 数据库综合指南

## 📋 目录
1. [数据库架构概览](#数据库架构概览)
2. [环境配置与识别](#环境配置与识别)
3. [表结构设计](#表结构设计)
4. [管理工具使用](#管理工具使用)
5. [常用命令参考](#常用命令参考)
6. [故障排除](#故障排除)

---

## 🏗️ 数据库架构概览

### 整体架构
```
DouDou 数据库系统
├── 🎨 AIGC 内容模块
│   ├── 图片内容 (集合模式)
│   │   ├── artwork_collections (作品集表)
│   │   └── artwork_images (图片资源表)
│   ├── 音乐内容 (独立模式)
│   │   └── music_tracks (音乐表)
│   └── 视频内容 (独立模式)
│       └── videos (视频表)
├── 📝 博客模块
│   └── blog_posts (博客文章表)
├── 👍 点赞系统 (混合设计)
│   ├── likes (统一点赞记录表)
│   └── 各业务表的 likes_count 字段
└── 🔧 系统表
    └── artwork_likes (旧版兼容表)
```

### 设计理念

#### 🎨 图片：集合模式
- **原因**: AIGC 图片通常批量生成，需要作为主题集合展示
- **优势**: 减少冗余信息，便于批量管理
- **应用**: 一个作品集包含多张相关图片

#### 🎵🎬 音乐/视频：独立模式  
- **原因**: 每个都是完整的独立作品
- **优势**: 结构简单，查询高效
- **应用**: 每个实体独立播放和管理

#### 👍 点赞：混合设计
- **统一表**: `likes` 表处理所有类型的点赞逻辑
- **冗余字段**: 各业务表的 `likes_count` 提供快速查询
- **优势**: 性能与功能的完美平衡

---

## 🔍 环境配置与识别

### 支持的数据库环境

#### ☁️ Vercel Postgres (生产环境)
```env
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb"
```

#### ☁️ Prisma Cloud Database (开发/测试)
```env
DATABASE_URL="postgres://****@db.prisma.io:5432/postgres"
```

#### 💻 本地数据库 (开发环境)
```env
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="doudou_db"
DB_USER="doudou_user"
DB_PASSWORD="doudou_password"
```

### 环境识别工具

#### 检查当前连接的数据库
```bash
npm run db:info
```

**输出示例**：
```
🔍 数据库连接信息检查工具
============================================================
📊 当前数据库连接信息:
🏷️  环境类型: ☁️ Prisma Cloud Database (云数据库)
🏠 主机地址: unknown
🔌 端口号: 5432
💾 数据库名: postgres
👤 用户名: prisma_migration
🕐 服务器时间: 9/11/2025, 6:05:24 PM
📝 PostgreSQL版本: PostgreSQL 17.2
🔗 连接字符串: postgres://****@db.prisma.io:5432/postgres
============================================================
💡 提示: 你当前连接的是云数据库
   - 请确认这是否是你预期的环境
   - 进行操作前请谨慎确认
```

### 环境切换方法

#### 切换到本地数据库
1. 编辑 `.env.local` 文件
2. 注释掉 `DATABASE_URL`
3. 启用本地数据库配置：
```env
# DATABASE_URL="postgres://****@db.prisma.io:5432/postgres"
DB_HOST="localhost"
DB_NAME="doudou_db"
DB_USER="doudou_user"
DB_PASSWORD="doudou_password"
```

#### 切换到云数据库
1. 编辑 `.env.local` 文件
2. 设置 `DATABASE_URL`
3. 注释掉本地配置：
```env
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb"
# DB_HOST="localhost"
# DB_NAME="doudou_db"
```

---

## 📊 表结构设计

### AIGC 内容表

#### 作品集表 (artwork_collections)
```sql
CREATE TABLE artwork_collections (
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
);
```

#### 图片资源表 (artwork_images)
```sql
CREATE TABLE artwork_images (
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
);
```

#### 音乐表 (music_tracks)
```sql
CREATE TABLE music_tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tags TEXT[],
    audio_url VARCHAR(500) NOT NULL,
    cover_url VARCHAR(500),
    duration INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);
```

#### 视频表 (videos)
```sql
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tags TEXT[],
    video_url VARCHAR(500) NOT NULL,
    cover_url VARCHAR(500),
    duration INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);
```

### 博客模块表

#### 博客文章表 (blog_posts)
```sql
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_url VARCHAR(500),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0
);
```

### 点赞系统表

#### 统一点赞表 (likes)
```sql
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    target_type VARCHAR(20) NOT NULL,  -- 'blog', 'artwork', 'music', 'video'
    target_id INTEGER NOT NULL,
    anon_id VARCHAR(64),               -- 匿名用户ID
    ip_hash VARCHAR(128),              -- IP哈希
    ua_hash VARCHAR(128),              -- User Agent哈希
    status VARCHAR(10) DEFAULT 'liked', -- 'liked' or 'unliked'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE UNIQUE INDEX idx_likes_unique_anon ON likes(target_type, target_id, anon_id) WHERE anon_id IS NOT NULL;
CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE UNIQUE INDEX idx_likes_unique_all ON likes(target_type, target_id, anon_id);
CREATE UNIQUE INDEX idx_likes_unique_ipua ON likes(target_type, target_id, ip_hash, ua_hash);
```

### 点赞系统设计优势

#### 混合设计的好处
1. **性能优化**: 列表查询直接读取 `likes_count` 字段
2. **功能完整**: 独立表提供防重复、历史记录
3. **架构统一**: 一套系统处理所有内容类型
4. **易于维护**: 新增内容类型无需修改表结构

#### 防重复机制
- **匿名用户**: 基于 `anon_id` 防重复
- **IP + UA**: 基于 `ip_hash` + `ua_hash` 防重复
- **软删除**: 支持取消点赞 (`status = 'unliked'`)

---

## 🛠️ 管理工具使用

### AIGC 内容管理

#### 图片管理工具
```bash
npm run db:manage-aigc-image
```
功能：
- 查看所有作品集
- 查看作品集详情和图片
- 删除作品集
- 更新作品集信息
- 数据库统计
- 按标签筛选

#### 音乐管理工具  
```bash
npm run db:manage-aigc-music
```
功能：
- 查看所有音乐
- 查看音乐详情
- 删除音乐
- 更新音乐信息
- 时长统计
- 按标签/状态筛选

#### 视频管理工具
```bash
npm run db:manage-aigc-video
```
功能：
- 查看所有视频
- 查看视频详情
- 删除视频
- 更新视频信息
- 数据库统计信息
- 按标签/状态筛选

**使用示例**：
```
🎬 AIGC视频数据库管理工具
==================================================
1. 查看所有视频
2. 查看视频详情
3. 删除视频
4. 更新视频信息
5. 数据库统计信息
6. 按标签筛选视频
7. 按状态筛选视频
0. 退出
==================================================
请选择操作 (0-7): 
```

#### 统一管理工具
```bash
npm run db:manage-aigc-master
```
功能：
- 统一管理所有 AIGC 内容
- 跨类型数据统计
- 批量操作

### 博客管理
```bash
npm run db:manage-blog
```

### 数据库维护

#### 数据库初始化
```bash
npm run db:init        # 初始化 AIGC 相关表
npm run db:setup       # 完整数据库设置
```

#### 连接测试
```bash
npm run test:db        # 测试数据库连接
npm run db:info        # 查看数据库信息
npm run preflight      # 启动前环境检查
```

#### 数据修复
```bash
npm run preflight:fix-missing-images  # 清理无效图片记录
```

---

## 📋 常用命令参考

### 环境检查
```bash
npm run db:info                    # 检查当前数据库连接
npm run test:db                    # 测试数据库连接
npm run preflight                  # 启动前环境检查
```

### 数据库初始化
```bash
npm run db:setup                   # 完整数据库设置
npm run db:init                    # 初始化 AIGC 表
```

### AIGC 内容管理
```bash
npm run db:manage-aigc-image       # 管理图片作品集
npm run db:manage-aigc-music       # 管理音乐
npm run db:manage-aigc-video       # 管理视频
npm run db:manage-aigc-master      # 统一管理工具
```

### 博客管理
```bash
npm run db:manage-blog             # 管理博客文章
```

### 数据修复
```bash
npm run preflight:fix-missing-images  # 清理无效图片
```

### 部署相关
```bash
npm run deploy:init               # 部署初始化
npm run deploy:verify             # 验证部署
```

---

## 🚨 故障排除

### 连接问题

#### 问题: 数据库连接失败
**症状**: `Connection terminated due to connection timeout`

**解决方案**:
1. 检查网络连接
2. 确认数据库服务运行状态
3. 验证连接字符串格式
4. 检查防火墙设置

#### 问题: 环境变量未生效
**症状**: 使用了错误的数据库

**解决方案**:
1. 运行 `npm run db:info` 确认当前环境
2. 检查 `.env.local` 文件是否存在
3. 确认环境变量优先级 (`DATABASE_URL` > 单独变量)
4. 重启应用使环境变量生效

### 权限问题

#### 问题: 表操作权限不足
**症状**: `must be owner of table`

**解决方案**:
```sql
-- 以管理员身份执行
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO doudou_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO doudou_user;
ALTER TABLE <table_name> OWNER TO doudou_user;
```

### 数据一致性

#### 问题: 点赞计数不准确
**症状**: `likes_count` 与实际点赞数不符

**解决方案**:
```sql
-- 重新计算点赞数
UPDATE artwork_collections 
SET likes_count = (
    SELECT COUNT(*) FROM likes 
    WHERE target_type = 'artwork' 
    AND target_id = artwork_collections.id 
    AND status = 'liked'
);
```

### 性能问题

#### 问题: 查询速度慢
**症状**: 管理工具响应缓慢

**解决方案**:
1. 检查索引是否存在
2. 分析查询计划 (`EXPLAIN ANALYZE`)
3. 考虑添加合适的索引
4. 优化查询语句

---

## 📚 相关文档

- [数据库架构设计](./database-schema.md)
- [AIGC 内容架构](./aigc-content-architecture.md)
- [点赞系统设计](./likes-system-design.md)
- [数据库环境识别](./database-environment-guide.md)
- [Vercel 数据库配置](./vercel-database-setup.md)
- [数据库命令参考](./database-commands.md)

---

## 🔄 更新日志

### 2025-09-11
- ✅ 添加数据库环境识别工具
- ✅ 创建视频管理脚本
- ✅ 完善点赞系统设计文档
- ✅ 整合数据库综合指南

### 历史更新
- 初始化数据库表结构
- 创建 AIGC 管理工具
- 实现点赞系统
- 添加博客管理功能
