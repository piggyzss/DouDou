# Database Scripts

数据库相关脚本，用于数据库的初始化、管理和维护。

## 📋 脚本列表

### 🚀 初始化脚本

#### `init-database.ts` ⭐ **推荐**
- **用途**: 通用数据库初始化脚本
- **功能**: 调用 `lib/database` 中的初始化函数
- **使用场景**: 本地开发环境初始化
- **命令**: `npx tsx scripts/database/init-database.ts`

#### `setup-database.ts`
- **用途**: 完整的数据库设置脚本
- **功能**: 创建数据库、用户、表结构等
- **使用场景**: 从零开始设置数据库
- **命令**: `npx tsx scripts/database/setup-database.ts`

#### `init-apps-db.ts`
- **用途**: 初始化应用数据库表
- **功能**: 创建和初始化应用相关表结构
- **命令**: `npx tsx scripts/database/init-apps-db.ts`

#### `init-aigc-db.ts`
- **用途**: 初始化AIGC数据库表
- **功能**: 创建AIGC相关表结构
- **命令**: `npx tsx scripts/database/init-aigc-db.ts`

### 🔍 信息查看脚本

#### `show-database-info.ts`
- **用途**: 显示数据库连接信息和状态
- **功能**: 解析连接字符串，显示数据库详情
- **命令**: `npx tsx scripts/database/show-database-info.ts`

#### `test-database-connection.ts`
- **用途**: 测试数据库连接
- **功能**: 验证数据库连接是否正常
- **命令**: `npx tsx scripts/database/test-database-connection.ts`

#### `test-vercel-db.ts`
- **用途**: 测试Vercel数据库连接
- **功能**: 专门用于验证Vercel Postgres连接
- **命令**: `npx tsx scripts/database/test-vercel-db.ts`

### 🛠️ 管理脚本

#### `manage-apps.ts`
- **用途**: 应用数据管理工具
- **功能**: 
  - 查看所有应用
  - 按状态/类型筛选
  - 更新应用信息
  - 删除应用
- **命令**: `npx tsx scripts/database/manage-apps.ts`

#### `manage-blog-db.ts`
- **用途**: 博客数据管理工具
- **功能**: 
  - 查看博客文章
  - 管理文章状态
  - 批量操作
- **命令**: `npx tsx scripts/database/manage-blog-db.ts`

#### `manage-aigc-image.ts`
- **用途**: AIGC图片管理
- **功能**: 管理AI生成的图片数据
- **命令**: `npx tsx scripts/database/manage-aigc-image.ts`

#### `manage-aigc-master.ts`
- **用途**: AIGC主数据管理
- **功能**: 管理AIGC主要数据
- **命令**: `npx tsx scripts/database/manage-aigc-master.ts`

#### `manage-aigc-music.ts`
- **用途**: AIGC音乐管理
- **功能**: 管理AI生成的音乐数据
- **命令**: `npx tsx scripts/database/manage-aigc-music.ts`

#### `manage-aigc-video.ts`
- **用途**: AIGC视频管理
- **功能**: 管理AI生成的视频数据
- **命令**: `npx tsx scripts/database/manage-aigc-video.ts`

### 🔧 维护脚本

#### `repair-aigc-images.ts`
- **用途**: 修复AIGC图片链接
- **功能**: 检查和修复损坏的图片链接
- **命令**: `npx tsx scripts/database/repair-aigc-images.ts`

## 🚀 常用操作

### 快速开始
```bash
# 1. 初始化数据库（推荐）
npx tsx scripts/database/init-database.ts

# 2. 检查数据库连接
npx tsx scripts/database/test-database-connection.ts

# 3. 查看数据库信息
npx tsx scripts/database/show-database-info.ts
```

### 数据管理
```bash
# 管理应用数据
npx tsx scripts/database/manage-apps.ts

# 管理博客数据
npx tsx scripts/database/manage-blog-db.ts
```

### 问题排查
```bash
# 测试数据库连接
npx tsx scripts/database/test-database-connection.ts

# 修复图片链接
npx tsx scripts/database/repair-aigc-images.ts
```

## ⚠️ 注意事项

1. **环境变量**: 确保 `.env.local` 文件配置正确
2. **数据库权限**: 某些操作需要数据库管理员权限
3. **数据备份**: 运行修改数据的脚本前请备份数据
4. **网络连接**: 确保能够访问数据库服务器

## 🔗 相关文档

- [数据库设置指南](../../docs/database-guide.md)
- [Vercel数据库配置](../../docs/vercel-database-setup.md)
- [部署指南](../../docs/deployment-guide.md)
