# Development Scripts

开发环境相关脚本，用于本地开发和调试。

## 📋 脚本列表

### 🔍 环境检查

#### `preflight.ts` ⭐ **重要**
- **用途**: 启动前环境检查
- **功能**: 
  - 检查数据库连接
  - 验证腾讯云COS配置
  - 检查必要的环境变量
  - 验证文件存在性
- **使用场景**: 开发环境启动前的健康检查
- **命令**: `npx tsx scripts/development/preflight.ts`

### 🔨 构建脚本

#### `simple-build.sh`
- **用途**: 简单构建脚本
- **功能**: 
  - 快速构建应用
  - 跳过某些检查以加快构建速度
  - 适用于开发环境
- **使用场景**: 开发过程中的快速构建
- **命令**: `./scripts/development/simple-build.sh`

### 🚀 服务启动

#### `start-agent-backend.sh`
- **用途**: 启动Agent后端服务
- **功能**: 
  - 启动Python Agent后端
  - 配置开发环境参数
  - 支持热重载
- **使用场景**: 本地开发Agent功能
- **命令**: `./scripts/development/start-agent-backend.sh`

**注意**: Docker相关脚本已移至 `scripts/docker/` 目录，详见 [Docker脚本文档](../docker/README.md)

## 🚀 开发工作流

### Docker混合模式开发 ⭐ **推荐**
```bash
# 1. 一键启动Docker开发环境
./scripts/docker/start-dev-docker.sh

# 服务将自动启动：
# - Python Agent后端: http://localhost:8000
# - Redis缓存: localhost:6379
# - Next.js前端: http://localhost:3000
```

### 传统本地开发
```bash
# 1. 环境检查
npx tsx scripts/development/preflight.ts

# 2. 启动Agent后端（如需要）
./scripts/development/start-agent-backend.sh

# 3. 启动Next.js开发服务器
npm run dev
```

### 快速构建测试
```bash
# 快速构建
./scripts/development/simple-build.sh

# 或使用标准构建
npm run build
```

## 🔧 配置说明

### preflight.ts 检查项目
- **数据库连接**: 验证数据库是否可访问
- **COS配置**: 检查腾讯云对象存储配置
- **环境变量**: 验证必要的环境变量
- **文件完整性**: 检查关键文件是否存在

### 环境变量要求
开发环境需要配置的主要环境变量：
```env
# 数据库
DATABASE_URL=postgresql://...
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doudou_db
DB_USER=doudou_user
DB_PASSWORD=doudou_password

# 腾讯云COS
TENCENT_COS_SECRET_ID=your_secret_id
TENCENT_COS_SECRET_KEY=your_secret_key
TENCENT_COS_REGION=ap-beijing
TENCENT_COS_BUCKET=your_bucket_name

# Agent后端（如使用）
PYTHON_BACKEND_URL=http://localhost:8000
```

## 🐛 调试技巧

### 环境问题排查
```bash
# 1. 运行预检查
npx tsx scripts/development/preflight.ts

# 2. 检查数据库连接
npx tsx scripts/database/test-database-connection.ts

# 3. 测试COS访问
npx tsx scripts/testing/test-cos-access.ts
```

### 常见问题解决

#### 数据库连接失败
1. 检查数据库服务是否启动
2. 验证连接字符串格式
3. 确认数据库权限设置

#### COS配置错误
1. 验证SecretId和SecretKey
2. 检查Bucket名称和地域
3. 确认访问权限

#### Agent后端启动失败
1. 检查Python环境和依赖
2. 验证端口是否被占用
3. 查看Agent后端日志

## 📝 开发最佳实践

### 启动流程
1. **每日开发开始前**
   ```bash
   npx tsx scripts/development/preflight.ts
   ```

2. **代码修改后**
   ```bash
   npm run dev  # 热重载开发
   ```

3. **提交前检查**
   ```bash
   npm run build  # 确保构建成功
   npm run test   # 运行测试
   ```

### 性能优化
- 使用 `simple-build.sh` 进行快速构建
- 利用热重载减少重启次数
- 定期清理开发环境缓存

## ⚠️ 注意事项

1. **环境隔离**: 开发环境数据不要影响生产环境
2. **端口冲突**: 确保开发服务端口不冲突
3. **数据备份**: 开发过程中定期备份重要数据
4. **版本一致**: 保持Node.js和Python版本与生产环境一致

## 🔗 相关文档

- [本地开发指南](../../docs/local-development-guide.md)
- [Agent模块设计](../../docs/agent-module-design.md)
- [后端设置指南](../../docs/backend-setup.md)
