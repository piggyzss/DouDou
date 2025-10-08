# Testing Scripts

测试相关脚本，用于功能测试和配置验证。

## 📋 脚本列表

### 🌐 API测试

#### `test-apps-api.ts`

- **用途**: 测试应用API接口
- **功能**:
  - 测试应用列表API
  - 验证应用详情API
  - 检查API响应格式
  - 测试筛选和分页功能
- **命令**: `npx tsx scripts/testing/test-apps-api.ts`

#### `test-apps-page.ts`

- **用途**: 测试应用页面数据
- **功能**:
  - 测试页面数据获取
  - 验证数据完整性
  - 检查应用状态
  - 测试筛选功能
- **命令**: `npx tsx scripts/testing/test-apps-page.ts`

### ☁️ 存储测试

#### `test-cos-access.ts`

- **用途**: 测试腾讯云COS访问
- **功能**:
  - 测试COS连接
  - 验证文件上传下载
  - 检查权限配置
  - 测试CDN访问
- **命令**: `npx tsx scripts/testing/test-cos-access.ts`

#### `test-cos.ts`

- **用途**: 测试COS配置
- **功能**:
  - 验证COS配置参数
  - 测试基本操作
  - 检查存储桶访问
- **命令**: `npx tsx scripts/testing/test-cos.ts`

### 🤖 AIGC测试

#### `test-aigc-config.ts`

- **用途**: 测试AIGC配置
- **功能**:
  - 验证数据库连接
  - 测试COS配置
  - 检查AIGC相关表
  - 验证图片链接有效性
- **命令**: `npx tsx scripts/testing/test-aigc-config.ts`

## 🧪 测试分类

### 🔍 功能测试

测试应用的核心功能是否正常工作：

```bash
# 测试应用功能
npx tsx scripts/testing/test-apps-api.ts
npx tsx scripts/testing/test-apps-page.ts

# 测试AIGC功能
npx tsx scripts/testing/test-aigc-config.ts
```

### 🌐 连接测试

测试外部服务和资源的连接：

```bash
# 测试存储服务
npx tsx scripts/testing/test-cos-access.ts
npx tsx scripts/testing/test-cos.ts

# 测试数据库连接
npx tsx scripts/database/test-database-connection.ts
```

### ⚡ 性能测试

检查应用性能和响应时间：

```bash
# 可以结合其他工具进行性能测试
# 例如：使用 lighthouse, k6 等工具
```

## 🚀 测试流程

### 开发环境测试

```bash
# 1. 基础连接测试
npx tsx scripts/database/test-database-connection.ts
npx tsx scripts/testing/test-cos-access.ts

# 2. 功能测试
npx tsx scripts/testing/test-apps-api.ts
npx tsx scripts/testing/test-aigc-config.ts

# 3. 页面数据测试
npx tsx scripts/testing/test-apps-page.ts
```

### 部署前测试

```bash
# 1. 环境检查
npx tsx scripts/development/preflight.ts

# 2. 全面功能测试
npx tsx scripts/testing/test-apps-api.ts
npx tsx scripts/testing/test-cos-access.ts
npx tsx scripts/testing/test-aigc-config.ts

# 3. 构建测试
npm run build
```

### 部署后验证

```bash
# 部署验证脚本
npx tsx scripts/deployment/verify-deployment.ts

# 功能回归测试
npx tsx scripts/testing/test-apps-api.ts
```

## 📊 测试报告

### 测试结果解读

- ✅ **成功**: 功能正常，测试通过
- ⚠️ **警告**: 功能可用但有潜在问题
- ❌ **失败**: 功能异常，需要修复

### 常见测试结果

#### 数据库测试

```
✅ 数据库连接成功
✅ 表结构完整
⚠️ 某些索引缺失
❌ 连接超时
```

#### COS测试

```
✅ COS配置正确
✅ 文件上传成功
⚠️ CDN缓存延迟
❌ 权限不足
```

#### API测试

```
✅ API响应正常
✅ 数据格式正确
⚠️ 响应时间较长
❌ 接口返回错误
```

## 🔧 测试配置

### 环境变量

测试脚本需要的环境变量：

```env
# 数据库
DATABASE_URL=postgresql://...

# 腾讯云COS
TENCENT_COS_SECRET_ID=your_secret_id
TENCENT_COS_SECRET_KEY=your_secret_key
TENCENT_COS_REGION=ap-beijing
TENCENT_COS_BUCKET=your_bucket_name

# 测试配置
NODE_ENV=test
TEST_TIMEOUT=30000
```

### 测试数据

- 使用测试专用的数据库
- 准备标准测试数据集
- 避免影响生产数据

## 🐛 故障排查

### 测试失败处理

1. **检查环境配置**

   ```bash
   npx tsx scripts/development/preflight.ts
   ```

2. **查看详细错误**
   - 检查控制台输出
   - 查看错误堆栈
   - 分析失败原因

3. **逐步排查**
   - 先运行基础连接测试
   - 再运行功能测试
   - 最后进行集成测试

### 常见问题

#### 连接超时

- 检查网络连接
- 验证服务器状态
- 调整超时配置

#### 权限错误

- 检查访问凭证
- 验证权限配置
- 确认资源访问权限

#### 数据不一致

- 检查数据同步状态
- 验证数据完整性
- 重新初始化测试数据

## 📝 最佳实践

1. **定期测试**: 每次代码变更后运行测试
2. **自动化**: 集成到CI/CD流程中
3. **覆盖全面**: 测试所有关键功能
4. **环境隔离**: 使用独立的测试环境
5. **数据清理**: 测试后清理临时数据

## 🔗 相关文档

- [测试指南](../../docs/testing-guide.md)
- [API文档](../../docs/api-documentation.md)
- [部署验证](../../docs/deployment-guide.md)
