# 数据库配置指南

## 问题说明

项目启动时出现数据库连接超时错误，这是因为缺少数据库配置。

## 解决方案

### 方案1：跳过数据库检查（推荐用于开发）

使用以下命令启动开发服务器，跳过数据库检查：

```bash
npm run dev:skip-preflight
```

### 方案2：配置数据库

1. 创建 `.env.local` 文件：

```bash
cp env-example.txt .env.local
```

2. 根据你的数据库配置修改 `.env.local` 文件：

#### 如果你使用 Vercel Postgres：
```env
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb"
```

#### 如果你使用本地 PostgreSQL：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

#### 或者使用单独的配置项：
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doudou_db
DB_USER=doudou_user
DB_PASSWORD=doudou_password
```

3. 重新启动开发服务器：

```bash
npm run dev
```

## 当前状态

✅ 项目已成功启动，运行在 http://localhost:3001

✅ Skills图片放大功能已实现，可以正常使用

⚠️ 数据库功能暂时不可用，需要配置数据库后才能使用博客、AIGC等功能

## 功能状态

- ✅ 首页展示（包括Skills图片放大）
- ✅ 导航和基础UI
- ❌ 博客功能（需要数据库）
- ❌ AIGC功能（需要数据库）
- ❌ 应用管理（需要数据库）

## 下一步

1. 如果需要完整功能，请配置数据库
2. 如果只是查看UI效果，当前状态已经足够
