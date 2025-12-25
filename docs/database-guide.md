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
├── 📱 应用展示模块
│   └── apps (应用独立)
├── 📝 博客模块
│   └── blog_posts (文章)
├── 🤖 Agent 系统模块
│   ├── agent_conversations (对话记录)
│   └── agent_sessions (会话管理)
├── 👍 点赞系统
│   └── likes (统一点赞表)
```

### 设计理念

- **图片**: 集合模式 (1:N) - 批量展示
- **音乐/视频**: 独立模式 (1:1) - 单独播放
- **应用**: 产品展示模式 (1:1) - 完整信息展示
- **点赞**: 混合设计 - 性能与功能平衡

---

## 🔍 环境管理

### 支持的环境

| 环境类型               | 连接方式                                             | 用途      |
| ---------------------- | ---------------------------------------------------- | --------- |
| 🏠 **本地数据库**      | `DB_HOST=localhost`                                  | 开发测试  |
| ☁️ **Vercel Postgres** | `DATABASE_URL=postgresql://...vercel-storage.com...` | 生产环境  |
| ☁️ **Prisma Cloud**    | `DATABASE_URL=postgres://...db.prisma.io...`         | 开发/测试 |

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

### 应用表

```sql
CREATE TABLE apps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[],
    type VARCHAR(20) NOT NULL, -- 'app', 'miniprogram', 'game'
    platform VARCHAR(20) NOT NULL, -- 'web', 'mobile', 'wechat'
    status VARCHAR(20) DEFAULT 'development',
    experience_method VARCHAR(20) NOT NULL, -- 'download', 'qrcode'
    download_url VARCHAR(500),
    qr_code_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    video_url VARCHAR(500),
    dau INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    trend VARCHAR(20) DEFAULT 'stable',
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

### Agent 系统表

#### 对话记录表

```sql
CREATE TABLE agent_conversations (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_query TEXT NOT NULL,
    agent_response TEXT NOT NULL,
    steps JSONB,                       -- ReAct execution steps
    plan JSONB,                        -- Execution plan
    evaluation JSONB,                  -- Quality evaluation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**索引**:
- `idx_agent_conversations_session_id` - 按会话查询
- `idx_agent_conversations_created_at` - 按时间排序
- `idx_agent_conversations_session_time` - 复合索引优化

#### 会话管理表

```sql
CREATE TABLE agent_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),              -- Optional user identifier
    context JSONB,                     -- Session context
    summary TEXT,                      -- Compressed conversation summary
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**索引**:
- `idx_agent_sessions_last_active` - 会话过期清理

### 点赞系统表

#### 统一点赞表

```sql
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    target_type VARCHAR(20) NOT NULL,  -- 'blog', 'artwork', 'music', 'video', 'app'
    target_id INTEGER NOT NULL,
    anon_id VARCHAR(64),               -- 匿名用户标识
    status VARCHAR(10) DEFAULT 'liked',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛠️ 管理工具

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

### 应用管理

```bash
npm run db:manage-apps          # 应用管理
```

**功能包括**:

- 应用管理 (查看/删除/更新)
- 按状态/类型/平台筛选应用
- 应用搜索功能
- 统计数据分析
- 数据库表结构查看

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

## 📋 常用命令command

### 环境检查

```bash
npm run db:info                 # 检查数据库连接
npm run test:db                 # 测试连接
npm run preflight               # 启动前检查
```

### 数据库初始化

```bash
npm run db:init                 # 初始化 AIGC 表
npm run db:setup                # 完整数据库设置 (包含 Agent 表)
```

**注意**: `npm run db:setup` 会自动运行 Agent 系统的数据库迁移，创建 `agent_conversations` 和 `agent_sessions` 表。

### 数据修复

```bash
npm run preflight:fix-missing-images  # 清理无效图片记录
```

---

## ❓ 常见问题 Q&A

### Q: 如何切换到本地数据库？

**A**: 编辑 `.env.local` 文件：

```env
# 注释云数据库URL
# DATABASE_URL="postgres://..."

# 启用本地配置
DB_HOST="localhost"
DB_NAME="doudou_db"
DB_USER="doudou_user"
DB_PASSWORD="your_password"
```

然后重启应用并运行 `npm run db:info` 确认。

### Q: 如何切换到云数据库？

**A**: 在 `.env.local` 文件中设置：

```env
DATABASE_URL="postgres://user:pass@host:5432/db"
```

`DATABASE_URL` 优先级最高，会覆盖本地配置。

### Q: 数据库连接失败怎么办？

**A**: 按顺序检查：

1. 运行 `npm run db:info` 确认当前环境
2. 检查 `.env.local` 文件是否存在和格式正确
3. 确认数据库服务是否运行
4. 验证网络连接

### Q: 我不知道连接的是哪个数据库？

**A**: 运行 `npm run db:info` 查看详细信息：

- **本地**: 显示 `localhost`
- **Vercel**: 显示 `vercel-storage.com`
- **Prisma**: 显示 `db.prisma.io`

### Q: 表操作提示权限不足？

**A**: 以管理员身份执行：

```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO doudou_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO doudou_user;
```

### Q: 查询速度很慢怎么优化？

**A**:

1. 检查是否有合适的索引
2. 使用 `EXPLAIN ANALYZE` 分析查询计划
3. 优化查询语句，避免全表扫描

### Q: 修改环境变量后没有生效？

**A**:

1. 重启开发服务器 (`Ctrl+C` 然后 `npm run dev`)
2. 运行 `npm run db:info` 确认环境变量已更新
3. 检查环境变量优先级：`DATABASE_URL` > `POSTGRES_URL` > 单独变量

### Q: 数据库表不存在？

**A**: 运行初始化命令：

```bash
npm run db:init     # 初始化 AIGC 表
npm run db:setup    # 完整数据库设置
```

### Q: Agent 系统表是做什么的？

**A**: Agent 系统表用于支持 ReAct Agent 的对话功能：

- **agent_conversations**: 存储每次对话的完整记录，包括用户查询、Agent 响应、执行步骤和质量评估
- **agent_sessions**: 管理会话状态，支持多轮对话和上下文记忆

这些表在运行 `npm run db:setup` 时会自动创建。

### Q: 如何清理过期的 Agent 会话？

**A**: Agent 系统会自动标记 24 小时未活动的会话为过期。可以通过后端 API 或直接 SQL 清理：

```sql
DELETE FROM agent_sessions WHERE last_active < NOW() - INTERVAL '24 hours';
```

---

## 📚 相关文档

- **[数据库内容架构](./database-content-architecture.md)** - 详细的内容架构设计和点赞系统分析
- **[应用管理指南](./apps-management-guide.md)** - 应用数据库管理工具使用指南
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
- **应用**: `npm run db:manage-apps`
- **博客**: `npm run db:manage-blog`
- **环境**: `npm run db:info`

### 安全提示

- ⚠️ 生产环境操作前请确认数据库连接
- ⚠️ 重要操作前建议备份数据
- ⚠️ 删除操作不可恢复，请谨慎确认
