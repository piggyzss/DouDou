# DouDou 项目 CI/CD 指南

## 📋 目录
1. [CI/CD 概念介绍](#🚀-cicd-概念介绍)
2. [工作流程设计](#🔄-工作流程设计)
3. [实施方案](#🛠️-实施方案)
4. [配置指南](#⚙️-配置指南)
5. [监控与优化](#📊-监控与优化)
6. [故障排除](#🚨-故障排除)
7. [最佳实践](#💡-最佳实践)

---

## 🚀 CI/CD 概念介绍

### 持续集成 (Continuous Integration, CI)

持续集成是一种开发实践，要求开发人员频繁地将代码变更集成到共享仓库中。每次集成都通过自动化构建进行验证，以尽早发现集成错误。

**核心要素：**
- 🔄 频繁的代码提交
- 🤖 自动化构建与测试
- 📊 快速反馈机制
- 🛠️ 代码质量检查

### 持续部署 (Continuous Deployment, CD)

持续部署是持续集成的延伸，指代码通过所有测试后自动部署到生产环境，无需人工干预。

**核心要素：**
- 🚀 自动化部署流程
- 🔧 环境一致性管理
- 📈 部署监控与回滚
- 🛡️ 安全与权限控制

### CI/CD 的价值

| 方面 | 传统方式 | CI/CD 方式 | 提升效果 |
|------|----------|------------|----------|
| **部署频率** | 每月1-2次 | 每日多次 | 🚀 10x+ |
| **问题发现** | 生产环境 | 开发阶段 | 🛡️ 85%+ |
| **部署时间** | 2-4小时 | 5-10分钟 | ⚡ 20x+ |
| **回滚时间** | 1-2小时 | 2-5分钟 | 🔄 15x+ |

---

## 🔄 工作流程设计

### 标准 CI/CD 流程

```mermaid
graph LR
    A[开发者提交代码] --> B[触发 CI 流程]
    --> C[代码质量检查]
    --> D[运行测试套件]
    --> E[构建应用]
    --> F[部署到测试环境]
    --> G[集成测试]
    --> H[部署到生产环境]
    --> I[监控与告警]
```

### 详细工作流程阶段


1、源码管理阶段 (Code Stage)
- 代码提交到版本控制系统
- 分支策略管理
- 代码审查 (Code Review)
2、构建阶段 (Build Stage)
- 依赖安装
- 代码编译/转译
- 静态资源处理
- 生成构建产物
3、测试阶段 (Test Stage)
- 单元测试
- 集成测试
- 端到端测试
- 代码覆盖率分析
4、质量检查阶段
- 代码规范检查 (Linting)
- 安全漏洞扫描
- 代码复杂度分析
- 性能检查
5、部署阶段 (Deploy Stage)
- 构建 Docker 镜像
- 部署到目标环境
- 数据库迁移
- 配置更新
6、监控阶段 (Monitor Stage)
- 应用健康检查
- 性能监控
- 错误日志收集
- 用户体验监控

#### 前端工作流程 (Next.js)
```yaml
代码提交 → ESLint检查 → TypeScript编译 → Jest测试 → 构建验证 → Vercel部署
```

#### 后端工作流程 (FastAPI)
```yaml
代码提交 → Black格式化 → Flake8检查 → Pytest测试 → Docker构建 → Vercel容器化部署
```

### 分支策略

| 分支 | 用途 | CI/CD 行为 |
|------|------|------------|
| **main** | 生产分支 | 完整测试 + 生产部署 |
| **develop** | 开发分支 | 完整测试 + 测试环境部署 |
| **feature/** | 功能分支 | 仅运行测试 |
| **hotfix/** | 紧急修复 | 快速测试 + 生产部署 |

---

## 🛠️ 实施方案

### 技术选型

| 组件 | 选择 | 理由 |
|------|------|------|
| **CI/CD 平台** | GitHub Actions | 免费、集成度高、生态丰富 |
| **前端部署** | Vercel | 专为Next.js优化 |
| **后端部署** | Vercel容器化 | 统一平台、支持Docker |
| **监控** | GitHub + Vercel | 原生集成 |

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Frontend      │    │    Backend      │                │
│  │   (Next.js)     │    │   (FastAPI)     │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                           │
                    ┌─────────────┐
                    │ GitHub      │
                    │ Actions     │
                    └─────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌─────────┐      ┌─────────────┐      ┌─────────┐
   │ ESLint  │      │    Jest     │      │  Build  │
   │ Check   │      │   Tests     │      │ & Deploy│
   └─────────┘      └─────────────┘      └─────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌─────────┐         ┌─────────┐       ┌─────────┐
   │ Vercel  │         │Vercel   │       │Monitor  │
   │Deploy   │         │Container│       │& Alert  │
   │(Frontend)│        │(Backend)│       │         │
   └─────────┘         └─────────┘       └─────────┘
```

---

## ⚙️ 配置指南

### GitHub Actions 工作流

#### 主工作流 (`.github/workflows/ci-cd.yml`)

触发条件：
- 推送到 `main` 或 `develop` 分支
- 创建 Pull Request 到 `main` 分支

工作阶段：
1. **并行测试** - 前端和后端同时进行
2. **质量检查** - 代码规范、安全扫描
3. **构建验证** - 确保应用可以正常构建
4. **部署执行** - 仅在主分支自动部署

### 前端 CI/CD 配置

#### 测试矩阵
```yaml
strategy:
  matrix:
    node-version: [18, 20]
    # 确保在多个Node.js版本上正常运行
```

#### 测试流程
1. **代码检出** - `actions/checkout@v4`
2. **环境设置** - Node.js + npm缓存
3. **依赖安装** - `npm ci` + preflight检查
4. **代码质量** - ESLint检查
5. **测试执行** - Jest完整测试套件
6. **覆盖率上传** - Codecov集成
7. **构建验证** - Next.js生产构建

#### 部署流程
- **条件部署** - 仅在main分支
- **Vercel集成** - 使用官方Action
- **环境变量** - 安全的secrets管理

### 后端 CI/CD 配置

#### 测试矩阵
```yaml
strategy:
  matrix:
    python-version: [3.9, 3.10, 3.11]
    # 确保Python版本兼容性
```

#### 测试流程
1. **代码检出** - `actions/checkout@v4`
2. **环境设置** - Python + pip缓存
3. **依赖安装** - requirements.txt + 开发依赖
4. **代码质量** - Black + Flake8 + MyPy
5. **测试执行** - Pytest + 覆盖率
6. **Docker构建** - 多阶段构建验证

#### 部署流程
- **条件部署** - 仅在main分支
- **Vercel容器化集成** - 使用Vercel Docker部署
- **健康检查** - 部署后验证

### 必需的环境变量

#### GitHub Secrets 配置

```bash
# Vercel 部署配置
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id  
VERCEL_PROJECT_ID=your_project_id
VERCEL_BACKEND_PROJECT_ID=your_backend_project_id
VERCEL_BACKEND_DEV_PROJECT_ID=your_dev_project_id

# 数据库配置
DATABASE_URL=your_database_connection_string

# 应用配置
NEXT_PUBLIC_API_URL=your_api_endpoint
TENCENT_COS_SECRET_ID=your_cos_secret_id
TENCENT_COS_SECRET_KEY=your_cos_secret_key

# 监控配置 (可选)
SLACK_WEBHOOK=your_slack_webhook_url
DISCORD_WEBHOOK=your_discord_webhook_url
```

#### 环境变量设置步骤

1. **访问仓库设置**
   ```
   GitHub Repository → Settings → Secrets and variables → Actions
   ```

2. **添加必需的Secrets**
   - 点击 "New repository secret"
   - 输入名称和值
   - 点击 "Add secret"

3. **验证配置**
   ```bash
   # 在工作流中验证
   - name: 验证环境变量
     run: |
       echo "Vercel项目ID: ${{ secrets.VERCEL_PROJECT_ID != '' }}"
       echo "Railway令牌: ${{ secrets.RAILWAY_TOKEN != '' }}"
   ```

---

## 📊 监控与优化

### 性能指标

#### 构建性能
- **目标构建时间**: 5-8分钟
- **并行优化**: 前后端同时构建
- **缓存策略**: 依赖和构建产物缓存

#### 测试覆盖率
- **当前覆盖率**: 67%
- **目标覆盖率**: 80%+
- **质量门槛**: 70%最低要求

#### 部署频率
- **开发环境**: 每次push自动部署
- **生产环境**: main分支合并时自动部署
- **回滚时间**: < 5分钟

### 监控配置

#### 健康检查
```yaml
- name: 前端健康检查
  run: |
    echo "等待Vercel部署完成..."
    sleep 30
    curl -f ${{ secrets.VERCEL_URL }}/api/health || exit 1

- name: 后端健康检查  
  run: |
    echo "等待Vercel容器化部署完成..."
    sleep 90
    curl -f ${{ secrets.VERCEL_BACKEND_URL }}/health || exit 1
```

#### 通知集成
```yaml
- name: Slack通知
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    channel: '#deployments'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    message: |
      部署状态: ${{ job.status }}
      分支: ${{ github.ref }}
      提交: ${{ github.sha }}
```

### 日志与分析

#### 构建日志
- GitHub Actions自动收集
- 分类存储：构建、测试、部署
- 保留期：90天

#### 应用日志
- **前端**: Vercel Analytics
- **后端**: Vercel容器化日志系统
- **错误跟踪**: 集成Sentry (可选)

---

## 🚨 故障排除

### 常见问题及解决方案

#### 1. 构建失败

**症状**: GitHub Actions构建失败
```yaml
Error: Process completed with exit code 1
```

**诊断步骤**:
```bash
# 1. 检查依赖安装
npm ci --verbose

# 2. 检查测试输出
npm run test:ci -- --verbose

# 3. 检查构建日志
npm run build -- --debug
```

**解决方案**:
- 检查package.json版本兼容性
- 验证环境变量配置
- 清理node_modules缓存

#### 2. 测试超时

**症状**: Jest测试超时
```
Timeout - Async callback was not invoked within the 10000ms timeout
```

**解决方案**:
```yaml
# 增加测试超时时间
- name: 运行测试
  run: npm run test:ci
  timeout-minutes: 15
```

#### 3. 部署失败

**症状**: Vercel部署失败

**诊断步骤**:
```bash
# 检查环境变量
echo "VERCEL_TOKEN存在: ${{ secrets.VERCEL_TOKEN != '' }}"

# 检查构建产物
ls -la .next/

# 检查部署日志
vercel --debug
```

**解决方案**:
- 验证部署令牌有效性
- 检查构建产物完整性
- 确认环境变量配置

#### 4. 缓存问题

**症状**: 依赖缓存不生效

**解决方案**:
```yaml
- name: 缓存Node.js模块
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 调试技巧

#### 1. 启用详细日志
```yaml
- name: 调试信息
  run: |
    echo "Node版本: $(node --version)"
    echo "NPM版本: $(npm --version)"
    echo "当前目录: $(pwd)"
    echo "文件列表: $(ls -la)"
    env | grep -E "(NODE|NPM|VERCEL)" | sort
```

#### 2. 条件调试
```yaml
- name: 调试模式
  if: runner.debug == '1'
  run: |
    npm run test -- --verbose --no-coverage
    npm run build -- --debug
```

#### 3. 分步测试
```yaml
# 分离测试步骤以定位问题
- name: 单元测试
  run: npm run test:unit

- name: 组件测试  
  run: npm run test:components

- name: 集成测试
  run: npm run test:integration
```

---

## 💡 最佳实践

### 代码质量

#### 1. 预提交检查
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:ci"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
```

#### 2. 测试策略
```javascript
// 测试金字塔
// 70% 单元测试 - 快速、稳定
// 20% 集成测试 - 组件协作
// 10% 端到端测试 - 用户流程
```

#### 3. 分支保护
```yaml
# .github/branch-protection.yml
main:
  required_status_checks:
    strict: true
    contexts:
      - "Frontend Tests"
      - "Backend Tests"
  enforce_admins: true
  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
```

### 部署策略

#### 1. 蓝绿部署
```yaml
# 零停机部署策略
- name: 蓝绿部署
  run: |
    # 部署到新环境
    vercel --prod --name=app-green
    
    # 健康检查
    ./scripts/health-check.sh app-green
    
    # 切换流量
    vercel alias set app-green.vercel.app app.vercel.app
    
    # 清理旧环境
    vercel remove app-blue --yes
```

#### 2. 渐进式部署
```yaml
- name: 金丝雀部署
  run: |
    # 10% 流量到新版本
    ./scripts/canary-deploy.sh --traffic=10
    
    # 监控指标
    ./scripts/monitor-metrics.sh --duration=300
    
    # 全量部署
    ./scripts/canary-deploy.sh --traffic=100
```

### 安全实践

#### 1. 依赖扫描
```yaml
- name: 安全审计
  run: |
    npm audit --audit-level=moderate
    cd agent-backend && pip-audit
```

#### 2. 代码扫描
```yaml
- name: CodeQL分析
  uses: github/codeql-action/analyze@v2
  with:
    languages: javascript, python
    queries: security-and-quality
```

#### 3. 密钥管理
```yaml
# 永远不要在代码中硬编码密钥
- name: 检查密钥泄露
  run: |
    git-secrets --scan
    truffleHog --regex --entropy=False .
```

### 性能优化

#### 1. 构建优化
```yaml
# 并行构建
jobs:
  frontend-test:
    runs-on: ubuntu-latest
  backend-test:
    runs-on: ubuntu-latest
  # 同时执行以节省时间
```

#### 2. 缓存策略
```yaml
# 多层缓存
- name: 缓存策略
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.cache/pip
      node_modules
      .next/cache
    key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json', '**/requirements.txt') }}
```

#### 3. 资源优化
```yaml
# 适当的资源分配
runs-on: ubuntu-latest  # 通常足够
# runs-on: ubuntu-latest-4-cores  # 大型项目
```

---

## 📚 相关文档

- **[GitHub Actions 文档](https://docs.github.com/en/actions)**
- **[Vercel 部署指南](https://vercel.com/docs/deployments/overview)**
- **[Vercel 容器化部署文档](https://vercel.com/docs/functions/serverless-functions/runtimes/python)**
- **[Jest 测试指南](../testing-guide.md)**
- **[部署指南](../deployment-guide.md)**

---

## 🎯 实施检查清单

### 准备阶段
- [ ] 确认GitHub仓库权限
- [ ] 准备Vercel部署令牌
- [ ] 准备Vercel后端项目ID
- [ ] 配置必要的环境变量

### 配置阶段
- [ ] 创建GitHub Actions工作流文件
- [ ] 配置GitHub Secrets
- [ ] 测试工作流触发
- [ ] 验证构建过程

### 验证阶段
- [ ] 提交测试代码触发CI
- [ ] 验证测试执行成功
- [ ] 确认部署过程正常
- [ ] 检查健康检查结果

### 优化阶段
- [ ] 监控构建时间
- [ ] 优化缓存策略
- [ ] 配置通知机制
- [ ] 建立监控面板

---

## 📞 支持与反馈

如果在实施过程中遇到问题，可以：

1. **查看构建日志** - GitHub Actions提供详细日志
2. **检查环境配置** - 确认所有secrets正确设置
3. **参考故障排除** - 本文档故障排除章节
4. **社区支持** - GitHub Actions社区论坛

**最后更新**: 2025年10月3日
**文档版本**: v1.0.0
