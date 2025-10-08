# Deployment Scripts

部署相关脚本，用于生产环境的部署和验证。

## 📋 脚本列表

### 🚀 部署脚本

#### `deploy-init.ts` ⭐ **重要**

- **用途**: 生产环境数据库初始化
- **功能**:
  - 在生产环境中初始化数据库表结构
  - 读取并执行SQL schema文件
  - 支持Vercel Postgres等云数据库
- **使用场景**: 首次部署或重置生产数据库
- **命令**: `npx tsx scripts/deployment/deploy-init.ts`
- **环境变量**: 需要配置 `DATABASE_URL` 或 `DB_URL`

#### `vercel-build.sh`

- **用途**: Vercel构建脚本
- **功能**:
  - 自定义Vercel构建流程
  - 处理构建前的准备工作
  - 环境特定的构建配置
- **使用场景**: Vercel部署时的自定义构建
- **命令**: `./scripts/deployment/vercel-build.sh`

### ✅ 验证脚本

#### `verify-deployment.ts`

- **用途**: 部署验证脚本
- **功能**:
  - 验证部署后的应用状态
  - 检查数据库连接
  - 验证关键功能
  - 检查环境变量配置
- **使用场景**: 部署完成后的健康检查
- **命令**: `npx tsx scripts/deployment/verify-deployment.ts`

## 🚀 使用流程

### 首次部署

```bash
# 1. 初始化生产数据库
npx tsx scripts/deployment/deploy-init.ts

# 2. 验证部署状态
npx tsx scripts/deployment/verify-deployment.ts
```

### Vercel部署

```bash
# 使用自定义构建脚本
./scripts/deployment/vercel-build.sh
```

## 📋 部署清单

### 部署前检查

- [ ] 环境变量配置完整
- [ ] 数据库连接字符串正确
- [ ] 腾讯云COS配置正确
- [ ] 域名和SSL证书配置

### 部署步骤

1. **数据库初始化**

   ```bash
   npx tsx scripts/deployment/deploy-init.ts
   ```

2. **应用部署**
   - Vercel: 推送代码到主分支
   - 其他平台: 按平台要求部署

3. **部署验证**
   ```bash
   npx tsx scripts/deployment/verify-deployment.ts
   ```

### 部署后检查

- [ ] 应用可正常访问
- [ ] 数据库连接正常
- [ ] 静态资源加载正常
- [ ] API接口响应正常
- [ ] 关键功能测试通过

## ⚠️ 注意事项

### 环境变量

确保以下环境变量在生产环境中正确配置：

- `DATABASE_URL` - 数据库连接字符串
- `TENCENT_COS_*` - 腾讯云COS配置
- `NEXT_PUBLIC_*` - 前端环境变量

### 数据库

- **备份**: 生产数据库操作前务必备份
- **权限**: 确保数据库用户有足够权限
- **网络**: 确保部署环境能访问数据库

### 安全

- **敏感信息**: 不要在代码中硬编码敏感信息
- **HTTPS**: 生产环境必须使用HTTPS
- **CORS**: 正确配置跨域访问

## 🔍 故障排查

### 数据库连接失败

```bash
# 检查数据库连接
npx tsx scripts/database/test-database-connection.ts

# 查看数据库信息
npx tsx scripts/database/show-database-info.ts
```

### 部署验证失败

```bash
# 重新运行验证
npx tsx scripts/deployment/verify-deployment.ts

# 检查应用日志
# (根据部署平台查看相应日志)
```

### 环境配置问题

1. 检查环境变量是否正确设置
2. 确认数据库连接字符串格式
3. 验证第三方服务配置

## 🔗 相关文档

- [部署指南](../../docs/deployment-guide.md)
- [数据库设置](../../docs/database-guide.md)
- [Vercel部署配置](../../docs/vercel-database-setup.md)
