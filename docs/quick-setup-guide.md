# Vercel容器化部署快速配置指南

## 🚀 5分钟快速配置

### 第一步：GitHub Secrets配置

1. **进入GitHub仓库设置**
   - 点击 `Settings` → `Secrets and variables` → `Actions`

2. **添加必需的Secrets**
   ```
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_org_id
   VERCEL_PROJECT_ID=your_frontend_project_id
   VERCEL_BACKEND_PROJECT_ID=your_backend_project_id
   VERCEL_BACKEND_DEV_PROJECT_ID=your_dev_backend_project_id
   ```

### 第二步：Vercel项目创建

1. **创建前端项目**
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 `New Project` → `Import Git Repository`
   - 选择仓库，配置：
     - Framework: Next.js
     - Root Directory: `./`

2. **创建后端项目**
   - 再次点击 `New Project`
   - 选择同一仓库，配置：
     - Root Directory: `./agent-backend`
     - Framework: **Other** (重要：不要选择FastAPI)
     - Build Command: **留空** (让Vercel使用Dockerfile)
     - Output Directory: **留空**

### 第三步：环境变量配置

**后端环境变量：**

```
DEBUG=false
APP_NAME=AI News Agent
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**前端环境变量：**

```
PYTHON_BACKEND_URL=https://your-backend-project.vercel.app
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production
```

### 第四步：验证部署

```bash
# 推送代码触发部署
git add .
git commit -m "feat: 配置Vercel容器化部署"
git push origin main

# 检查部署状态
curl https://your-frontend-project.vercel.app
curl https://your-backend-project.vercel.app/health
```

## 🔧 获取配置信息

### 获取Vercel Token

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击头像 → `Settings` → `Tokens`
3. 点击 `Create Token`
4. 复制生成的token

### 获取Vercel Org ID

1. Vercel Dashboard → `Settings` → `General`
2. 复制 `Team ID` 或 `Personal Account ID`

### 获取Project ID

1. 选择项目 → `Settings` → `General`
2. 复制 `Project ID`

## ✅ 配置检查清单

- [ ] GitHub Secrets配置完成
- [ ] Vercel前端项目创建
- [ ] Vercel后端项目创建
- [ ] 环境变量配置完成
- [ ] 代码推送到main分支
- [ ] GitHub Actions运行成功
- [ ] 前端部署验证通过
- [ ] 后端部署验证通过

## 🚨 常见问题快速解决

### Vercel后端项目配置问题

**问题1：Framework Preset自动选择FastAPI**

- **解决方案**：手动选择 `Other`，不要选择 `FastAPI`
- **原因**：Vercel检测到Python项目自动选择FastAPI，但我们需要Docker部署

**问题2：Build Command置灰且内容为npm命令**

- **解决方案**：将Build Command留空，让Vercel使用Dockerfile
- **原因**：Vercel误认为这是Node.js项目

**问题3：部署报错**

- **解决方案**：
  1. 确保vercel.json配置正确（已更新）
  2. 确保Dockerfile在agent-backend目录下
  3. 重新部署项目

**正确的后端项目配置：**

```
Root Directory: ./agent-backend
Framework: Other
Build Command: (留空)
Output Directory: (留空)
```

### 其他常见问题

**GitHub Actions失败**

- 检查Secrets是否正确配置
- 确认Vercel Token有效性

**Vercel部署失败**

- 检查vercel.json配置
- 确认Dockerfile路径

**服务无响应**

```bash
# 检查服务状态
vercel ls
vercel logs --follow
```

## 📚 详细文档

- [完整部署指南](./deployment-guide.md) - 详细配置步骤
- [CI/CD指南](./cicd-guide.md) - 自动化流程配置
- [后端架构](./backend-setup.md) - 技术架构详解

---

**预计配置时间**: 5-10分钟  
**难度等级**: ⭐⭐ (简单)  
**成功率**: 95%+
