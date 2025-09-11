# 数据库使用指南

## 📋 目录
1. [数据库架构](#🏗️-数据库架构)
2. [环境管理](#🔍-环境管理)
3. [表结构](#📊-表结构)
4. [管理工具](#🛠️-管理工具)
5. [常用命令](#📋-常用命令)
6. [故障排除](#🚨-故障排除)

---

## 🏗️ 数据库架构

### 整体设计
```
DouDou 数据库系统
├── 🎨 AIGC 内容模块
│   ├── artwork_collections + artwork_images (图片集合)
│   ├── music_tracks (音乐独立)
│   └── videos (视频独立)
├── 📝 博客模块
│   └── blog_posts (文章)
├── 👍 点赞系统
│   └── likes (统一点赞表)
```

### 设计理念
- **图片**: 集合模式 (1:N) - 批量展示
- **音乐/视频**: 独立模式 (1:1) - 单独播放
- **点赞**: 混合设计 - 性能与功能平衡

---

## 🔍 环境管理

### 支持的环境

| 环境类型 | 连接方式 | 用途 |
|---------|----------|------|
| 🏠 **本地数据库** | `DB_HOST=localhost` | 开发测试 |
| ☁️ **Vercel Postgres** | `DATABASE_URL=postgresql://...vercel-storage.com...` | 生产环境 |
| ☁️ **Prisma Cloud** | `DATABASE_URL=postgres://...db.prisma.io...` | 开发/测试 |

### 环境识别与切换

#### 🔍 检查当前环境
```bash
npm run db:info
```

**输出示例**:
```
📊 当前数据库连接信息:
🏷️  环境类型: ☁️ Prisma Cloud Database
🏠 主机地址: db.prisma.io
💾 数据库名: postgres
👤 用户名: prisma_migration
```

#### 🔄 切换环境
编辑 `.env.local` 文件：

```env
# 云数据库 (优先级最高)
DATABASE_URL="postgres://user:pass@host:5432/db"

# 本地数据库 (DATABASE_URL 未设置时使用)
DB_HOST="localhost"
DB_NAME="doudou_db"
DB_USER="doudou_user"
DB_PASSWORD="your_password"
```

---

## 📊 表结构schema

### AIGC 内容表

#### 作品集表
```sql
CREATE TABLE artwork_collections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 图片资源表
```sql
CREATE TABLE artwork_images (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES artwork_collections(id),
    filename VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 音乐/视频表
```sql
CREATE TABLE music_tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tags TEXT[],
    audio_url VARCHAR(500) NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tags TEXT[],
    video_url VARCHAR(500) NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 博客表

#### 文章表
```sql
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 点赞系统表

#### 统一点赞表
```sql
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    target_type VARCHAR(20) NOT NULL,  -- 'blog', 'artwork', 'music', 'video'
    target_id INTEGER NOT NULL,
    anon_id VARCHAR(64),               -- 匿名用户标识
    status VARCHAR(10) DEFAULT 'liked',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛠️ 管理工具命令command

### AIGC 内容管理
```bash
npm run db:manage-aigc-image    # 图片作品集管理
npm run db:manage-aigc-music    # 音乐管理
npm run db:manage-aigc-video    # 视频管理
npm run db:manage-aigc-master   # 统一管理工具
```

**功能包括**:
- 查看所有内容
- 查看详情信息
- 删除内容
- 更新信息
- 数据统计
- 按标签/状态筛选

### 博客管理
```bash
npm run db:manage-blog          # 博客文章管理
```

**功能包括**:
- 文章管理 (查看/删除)
- 标签管理
- 评论管理
- 数据统计

---

## 📋 常用命令

### 环境检查
```bash
npm run db:info                 # 检查数据库连接
npm run test:db                 # 测试连接
npm run preflight               # 启动前检查
```

### 数据库初始化
```bash
npm run db:init                 # 初始化 AIGC 表
npm run db:setup                # 完整数据库设置
```

### 数据修复
```bash
npm run preflight:fix-missing-images  # 清理无效图片记录
```

---

## 🚨 故障排除

### 连接问题

#### 问题: 数据库连接失败
**解决方案**:
1. 检查 `.env.local` 文件是否存在
2. 运行 `npm run db:info` 确认环境
3. 验证网络连接和数据库服务状态

#### 问题: 环境混淆
**解决方案**:
1. 运行 `npm run db:info` 确认当前环境
2. 检查环境变量优先级 (`DATABASE_URL` > 单独变量)
3. 重启应用使配置生效

### 权限问题

#### 问题: 表操作权限不足
**解决方案**:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO doudou_user;
ALTER TABLE <table_name> OWNER TO doudou_user;
```

### 性能问题

#### 问题: 查询速度慢
**解决方案**:
1. 检查索引是否存在
2. 分析查询计划
3. 优化查询语句

---

## 📚 相关文档

- **[数据库内容架构](./database-content-architecture.md)** - 详细的内容架构设计和点赞系统分析
- **[Vercel 数据库配置](./vercel-database-setup.md)** - Vercel Postgres 配置
- **[腾讯云 COS 配置](./cos-setup.md)** - 文件存储配置
- **[部署指南](./deployment-guide.md)** - 生产环境部署

---

## 💡 快速参考

### 环境识别速查
- **本地**: `localhost` 或单独环境变量
- **Vercel**: 包含 `vercel-storage.com`
- **Prisma**: 包含 `db.prisma.io`

### 管理工具速查
- **图片**: `npm run db:manage-aigc-image`
- **音乐**: `npm run db:manage-aigc-music`  
- **视频**: `npm run db:manage-aigc-video`
- **博客**: `npm run db:manage-blog`
- **环境**: `npm run db:info`

### 安全提示
- ⚠️ 生产环境操作前请确认数据库连接
- ⚠️ 重要操作前建议备份数据
- ⚠️ 删除操作不可恢复，请谨慎确认
