# CI/CD 快速设置指南

## 🚀 5分钟快速配置

### 1. 检查前置条件

- [ ] GitHub 仓库已创建
- [ ] Vercel 账户已设置
- [ ] Railway 账户已设置
- [ ] 本地项目可以正常运行

### 2. 配置 GitHub Secrets

访问 GitHub 仓库 → Settings → Secrets and variables → Actions，添加以下 secrets：

#### 必需的 Secrets

```bash
# Vercel 部署
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# Railway 部署
RAILWAY_TOKEN=your_railway_token
RAILWAY_SERVICE_ID=your_service_id
RAILWAY_APP_URL=https://your-app.railway.app
```

#### 可选的 Secrets

```bash
# 通知 (可选)
SLACK_WEBHOOK=your_slack_webhook_url

# 其他环境变量
DATABASE_URL=your_production_database_url
TENCENT_COS_SECRET_ID=your_cos_secret_id
TENCENT_COS_SECRET_KEY=your_cos_secret_key
```

### 3. 获取必需的令牌

#### Vercel 令牌

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → Tokens → Create Token
3. 复制生成的令牌作为 `VERCEL_TOKEN`

#### Vercel 项目信息

```bash
# 在项目根目录运行
npx vercel
# 按提示配置，然后查看 .vercel/project.json
```

#### Railway 令牌

1. 访问 [Railway Dashboard](https://railway.app/dashboard)
2. Settings → Tokens → Create Token
3. 复制生成的令牌作为 `RAILWAY_TOKEN`

### 4. 验证配置

提交一个测试更改并检查：

- GitHub Actions 是否正常运行
- 测试是否通过
- 部署是否成功

### 5. 监控和维护

- 查看 Actions 页面监控构建状态
- 设置通知以获得部署状态更新
- 定期检查依赖更新 (Dependabot 已配置)

## 📋 故障排除检查清单

### 构建失败

- [ ] 检查环境变量是否正确设置
- [ ] 验证 secrets 中没有额外的空格
- [ ] 确认项目在本地可以正常构建
- [ ] 查看详细的错误日志

### 部署失败

- [ ] 验证部署令牌是否有效
- [ ] 检查目标服务是否正常运行
- [ ] 确认环境变量已正确配置
- [ ] 验证构建产物是否正确生成

### 测试失败

- [ ] 在本地运行测试确认问题
- [ ] 检查测试环境的依赖
- [ ] 验证模拟数据和 API 配置
- [ ] 查看测试覆盖率报告

## 🎯 下一步

配置完成后，你可以：

1. 创建 Pull Request 触发完整的 CI/CD 流程
2. 合并到 main 分支自动部署到生产环境
3. 查看代码质量和安全扫描报告
4. 根据需要调整工作流配置

## 📚 相关文档

- [完整 CI/CD 指南](./cicd-guide.md)
- [测试指南](./testing-guide.md)
- [部署指南](./deployment-guide.md)
