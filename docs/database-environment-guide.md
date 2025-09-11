# 数据库环境识别指南

## 🎯 问题背景

当你有多个数据库环境时（本地数据库 + Vercel 云数据库），需要清楚地知道当前连接的是哪个数据库，避免在错误的环境中进行操作。

## 🔍 如何检查当前数据库连接

### 方法1: 使用专用检查工具

```bash
npm run db:info
```

**输出示例**：
```
🔍 数据库连接信息检查工具
============================================================
🔍 检查数据库环境变量...
DATABASE_URL: ✅ 已设置
POSTGRES_URL: ❌ 未设置
DB_HOST: localhost
DB_NAME: doudou_db
DB_USER: doudou_user

📊 当前数据库连接信息:
============================================================
🏷️  环境类型: ☁️ Prisma Cloud Database (云数据库)
🏠 主机地址: unknown
🔌 端口号: 5432
💾 数据库名: postgres
👤 用户名: prisma_migration
🕐 服务器时间: 9/11/2025, 6:05:24 PM
📝 PostgreSQL版本: PostgreSQL 17.2 on x86_64-pc-linux-musl
🔗 连接字符串: postgres://****@db.prisma.io:5432/postgres
============================================================
💡 提示: 你当前连接的是云数据库
   - 请确认这是否是你预期的环境
   - 进行操作前请谨慎确认
```

### 方法2: 在管理工具中查看

所有的 AIGC 管理工具都会在启动时显示数据库连接信息：

```bash
npm run db:manage-aigc-video
```

**输出示例**：
```
🎬 AIGC 视频管理工具
连接数据库中...
📊 当前连接: ☁️ Prisma Cloud Database
--------------------------------------------------
```

## 🏷️ 数据库环境类型识别

### ☁️ Vercel Postgres
- **标识**: 连接字符串包含 `vercel-storage.com`
- **特点**: Vercel 官方托管的 PostgreSQL
- **用途**: 生产环境数据库

### ☁️ Prisma Cloud Database  
- **标识**: 连接字符串包含 `db.prisma.io`
- **特点**: Prisma 提供的云数据库服务
- **用途**: 开发/测试环境

### 💻 本地数据库
- **标识**: 主机地址为 `localhost`、`127.0.0.1` 或使用单独的环境变量
- **特点**: 运行在本地的 PostgreSQL
- **用途**: 本地开发环境

### ☁️ 其他云数据库
- Supabase: 包含 `supabase`
- Railway: 包含 `railway`  
- Neon: 包含 `neon`
- PlanetScale: 包含 `planetscale`

## 🔧 如何切换数据库环境

### 切换到本地数据库

编辑 `.env.local` 文件：

```env
# 注释掉或删除云数据库连接
# DATABASE_URL="postgres://****@db.prisma.io:5432/postgres"

# 使用本地数据库配置
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="doudou_db"  
DB_USER="doudou_user"
DB_PASSWORD="doudou_password"
```

### 切换到 Vercel 数据库

编辑 `.env.local` 文件：

```env
# 使用 Vercel Postgres 连接字符串
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb"

# 注释掉本地数据库配置
# DB_HOST="localhost"
# DB_PORT="5432"
# DB_NAME="doudou_db"
# DB_USER="doudou_user"
# DB_PASSWORD="doudou_password"
```

### 切换到 Prisma Cloud Database

编辑 `.env.local` 文件：

```env
# 使用 Prisma 云数据库连接字符串
DATABASE_URL="postgres://****@db.prisma.io:5432/postgres"

# 注释掉本地数据库配置
# DB_HOST="localhost"
# DB_PORT="5432"
# DB_NAME="doudou_db"
# DB_USER="doudou_user"
# DB_PASSWORD="doudou_password"
```

## ⚠️ 安全提示

### 生产环境操作
- ✅ 确认连接的是正确的数据库
- ✅ 谨慎进行删除操作
- ✅ 重要操作前先备份

### 开发环境操作
- ✅ 可以安全地进行测试
- ✅ 可以随意创建/删除数据
- ✅ 适合功能验证

## 📋 常用命令总结

```bash
# 检查当前数据库连接信息
npm run db:info

# 测试数据库连接
npm run test:db

# 管理 AIGC 图片
npm run db:manage-aigc-image

# 管理 AIGC 音乐  
npm run db:manage-aigc-music

# 管理 AIGC 视频
npm run db:manage-aigc-video

# AIGC 统一管理工具
npm run db:manage-aigc-master

# 管理博客文章
npm run db:manage-blog
```

## 🔍 故障排除

### 连接失败
1. 检查 `.env.local` 文件是否存在
2. 确认环境变量格式正确
3. 验证数据库服务是否运行
4. 检查网络连接

### 环境混淆
1. 运行 `npm run db:info` 确认当前环境
2. 检查 `.env.local` 中的配置
3. 确认 `DATABASE_URL` 的优先级高于单独的环境变量

### 权限问题
1. 确认数据库用户有足够权限
2. 检查连接字符串中的用户名和密码
3. 验证数据库是否允许外部连接（云数据库）
