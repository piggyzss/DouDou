# Scripts 目录说明

本目录包含项目的各种脚本工具，按功能分类整理。

## 📁 目录结构

### 🗄️ database/
数据库相关脚本，用于数据库的初始化、管理和维护。

**主要脚本：**
- `init-database.ts` - 数据库初始化（推荐使用）
- `setup-database.ts` - 完整数据库设置（包含用户创建）
- `show-database-info.ts` - 显示数据库连接信息
- `test-database-connection.ts` - 测试数据库连接
- `test-vercel-db.ts` - 测试Vercel数据库连接

**数据管理脚本：**
- `manage-apps.ts` - 应用数据管理工具
- `manage-blog-db.ts` - 博客数据管理工具
- `manage-aigc-*.ts` - AIGC内容管理工具
- `repair-aigc-images.ts` - 修复AIGC图片链接

**初始化脚本：**
- `init-apps-db.ts` - 初始化应用数据库
- `init-aigc-db.ts` - 初始化AIGC数据库

### 🚀 deployment/
部署相关脚本，用于生产环境的部署和验证。

**主要脚本：**
- `deploy-init.ts` - 生产环境数据库初始化
- `verify-deployment.ts` - 部署验证脚本
- `vercel-build.sh` - Vercel构建脚本

### 🐳 docker/
Docker相关脚本和配置文件，用于容器化开发环境管理。

**主要文件：**
- `docker-compose.dev.yml` - 开发环境Docker Compose配置
- `start-dev-docker.sh` - 一键启动Docker混合开发环境
- `stop-dev-docker.sh` - 停止Docker开发环境

### 💻 development/
开发环境相关脚本，用于本地开发和调试。

**主要脚本：**
- `preflight.ts` - 启动前环境检查
- `simple-build.sh` - 简单构建脚本
- `start-agent-backend.sh` - 启动Agent后端服务

### 🧪 testing/
测试相关脚本，用于功能测试和配置验证。

**主要脚本：**
- `test-apps-api.ts` - 测试应用API
- `test-apps-page.ts` - 测试应用页面
- `test-cos-access.ts` - 测试腾讯云COS访问
- `test-cos.ts` - 测试COS配置
- `test-aigc-config.ts` - 测试AIGC配置

### 🛠️ utilities/
工具类脚本，包含各种实用工具和辅助脚本。

**主要脚本：**
- `update-avatar.sh` - 更新头像脚本
- `update-changelog.ts` - 更新变更日志工具

**Git工具：**
- `git-hooks/pre-commit` - Git提交前钩子

### 🗂️ maintenance/
维护相关脚本目录（预留，用于定期维护任务）

**总计目录**: 7个分类目录，便于脚本管理和维护

## 🚀 使用方法

### 运行TypeScript脚本
```bash
# 使用ts-node直接运行
npx ts-node scripts/database/init-database.ts

# 或者使用tsx（更快）
npx tsx scripts/database/init-database.ts
```

### 运行Shell脚本
```bash
# 给脚本执行权限
chmod +x scripts/deployment/vercel-build.sh

# 运行脚本
./scripts/deployment/vercel-build.sh
```

## ⚠️ 注意事项

1. **环境变量**: 大部分脚本需要正确配置 `.env.local` 文件
2. **数据库连接**: 确保数据库连接信息正确
3. **权限**: 某些脚本可能需要管理员权限
4. **备份**: 运行数据库相关脚本前建议备份数据

## 🔧 常用命令

### Docker开发环境（推荐）
```bash
# 一键启动Docker混合开发环境
./scripts/docker/start-dev-docker.sh

# 停止Docker开发环境
./scripts/docker/stop-dev-docker.sh
```

### 数据库初始化
```bash
# 本地开发环境
npx tsx scripts/database/init-database.ts

# 生产环境部署
npx tsx scripts/deployment/deploy-init.ts
```

### 环境检查
```bash
# 启动前检查
npx tsx scripts/development/preflight.ts

# 数据库连接测试
npx tsx scripts/database/test-database-connection.ts
```

### 数据管理
```bash
# 应用管理
npx tsx scripts/database/manage-apps.ts

# 博客管理
npx tsx scripts/database/manage-blog-db.ts
```

## 📝 维护说明

- 定期清理不再使用的脚本
- 更新脚本文档和使用说明
- 确保脚本的兼容性和安全性
- 添加新脚本时请分类放置并更新文档
