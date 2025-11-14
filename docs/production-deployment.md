# 生产环境部署架构详解

## 📊 整体架构图
```
GitHub Repository
       ↓
   [Push to main]
       ↓
GitHub Actions CI/CD Pipeline
       ↓
   ┌─────────────────────────────────┐
   │   CI 阶段 (run-ci job)          │
   │   - ESLint 代码检查             │
   │   - Jest 单元测试               │
   │   - Next.js 构建验证            │
   └─────────────────────────────────┘
       ↓ (CI 通过)
   ┌─────────────────────────────────┐
   │ 生产部署 (deploy-production)    │
   │   ├─ 前端部署到 Vercel          │
   │   └─ 后端部署到 Vercel          │
   └─────────────────────────────────┘
       ↓
   ┌──────────────┬──────────────┐
   │              │              │
Vercel 前端    Vercel 后端    PostgreSQL
(Next.js)      (Python)       (数据库)
   │              │              │
   └──────────────┴──────────────┘
            │
      用户访问网站
```

## 一、GitHub CI/CD 流程

### 触发条件

```shell
on:
  push:
    branches: [main, develop]  # 推送到主分支或开发分支
  workflow_dispatch:           # 手动触发
```

### CI 阶段 (run-ci job)

执行步骤:
1. 检出代码: 从 GitHub 拉取最新代码
2. 设置 Node.js: 安装 Node.js 20 环境
3. 安装依赖: npm ci (使用 package-lock.json 确保版本一致)
4. 运行预检: npm run preflight (检查数据库连接等)
5. 代码检查: npm run lint (ESLint 检查)
6. 运行测试: npm run test:ci (Jest 单元测试)
7. 构建验证: npm run build (验证 Next.js 能否成功构建)

环境变量:
```shell
NEXT_TELEMETRY_DISABLED=1           # 禁用遥测
NODE_OPTIONS='--max-old-space-size=4096'  # 增加内存限制
```

输出:
```shell
ci-passed=true/false - CI 是否通过
branch=main/develop - 当前分支名
```

### 生产部署阶段 (deploy-production job)

触发条件:
- CI 通过 (ci-passed == 'true')
- 分支为 main

部署流程:
#### 1. 前端部署到 Vercel
```shell
# 安装 Vercel CLI
npm install -g vercel@latest

# 非交互式部署（三重保险）
echo "y" | vercel --prod --token "$VERCEL_TOKEN" --confirm || \
vercel --prod --token "$VERCEL_TOKEN" --force --yes 2>/dev/null || \
vercel --prod --token "$VERCEL_TOKEN" < /dev/null
```

前端构建配置 (vercel.json):
```json
{
  "buildCommand": "npm run vercel-build-no-lint",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30  // API 路由最大执行时间 30 秒
    }
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1",
      "NODE_OPTIONS": "--max-old-space-size=4096"
    }
  }
}
```
构建命令:
```shell
# vercel-build-no-lint 脚本
rm -rf .next && \
rm -rf node_modules/.cache && \
NEXT_TELEMETRY_DISABLED=1 \
GIT_CONFIG_NOSYSTEM=1 \
GIT_CONFIG_GLOBAL=/dev/null \
NEXT_BUILD_TRACE=false \
DISABLE_COLLECT_BUILD_TRACES=true \
NODE_OPTIONS='--max-old-space-size=4096' \
npx next build
```

优化点:
- 清理缓存避免构建问题
- 禁用构建追踪避免内存溢出
- 跳过 ESLint (CI 阶段已检查)
- 增加内存限制到 4GB

#### 2. 后端部署到 Vercel
```shell
cd agent-backend

# 非交互式部署
echo "y" | vercel --prod --token "$VERCEL_TOKEN" --confirm || \
vercel --prod --token "$VERCEL_TOKEN" --force --yes 2>/dev/null || \
vercel --prod --token "$VERCEL_TOKEN" < /dev/null
```
后端部署方式: Vercel 使用 Serverless Functions (不是 Docker 容器)

后端配置 (agent-backend/vercel.json):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"  // 使用 Python Serverless 运行时
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"  // 所有请求路由到 FastAPI 应用
    }
  ],
  "env": {
    "PYTHON_VERSION": "3.11",
    "ENVIRONMENT": "production"
  }
}
```
重要: Vercel 后端使用 Serverless Functions，不是 Docker 容器！

#### 3. 部署后验证
```shell
# 等待服务启动
sleep 90

# 健康检查（当前跳过，因为使用直接 CLI 部署）
# 实际生产中应该检查：
# - 前端: https://your-domain.vercel.app
# - 后端: https://your-backend.vercel.app/health
```

## 二、Vercel 部署详解

### 前端部署 (Next.js)
部署类型: Vercel 原生 Next.js 部署

架构:
```
Vercel Edge Network (CDN)
    ↓
Next.js 应用
    ├─ 静态页面 (SSG) → 直接从 CDN 提供
    ├─ 服务端渲染 (SSR) → Serverless Functions
    └─ API 路由 → Serverless Functions
```

特点:
- 自动 CDN 分发
- 全球边缘节点
- 自动 HTTPS
- 零配置部署

环境变量 (在 Vercel Dashboard 配置):
```shell
DATABASE_URL=postgresql://...        # PostgreSQL 连接
POSTGRES_URL=postgresql://...        # 备用连接
COS_SECRET_ID=xxx                   # 腾讯云 COS
COS_SECRET_KEY=xxx
COS_REGION=xxx
COS_BUCKET=xxx
NEXT_PUBLIC_SITE_URL=https://...    # 网站 URL
```

### 后端部署 (Python FastAPI)
部署类型: `Vercel Serverless Functions (Python)`

架构:
```
Vercel 请求
    ↓
@vercel/python 运行时
    ↓
FastAPI 应用 (api/index.py)
    ↓
插件系统 (Plugin Manager)
    ↓
外部 API / 数据库
```

Serverless vs Docker 对比:

| 特性 | Serverless (Vercel 生产) | Docker (本地开发) | |------|-------------------------|-------------------| | 启动方式 | 按需冷启动 | 持续运行 | | 扩展性 | 自动扩展 | 手动扩展 | | 成本 | 按使用付费 | 固定成本 | | 状态 | 无状态 | 可有状态 | | 适用场景 | 生产环境 | 开发/测试 |


重要:
- 生产环境使用 Serverless Functions
- 本地开发使用 Docker 容器
- 两者代码相同，运行环境不同

### Docker 在项目中的角色

#### Docker 仅用于本地开发环境
```
# 本地开发 - 使用 Docker
./scripts/startup/full-stack.sh start
# → 后端在 Docker 容器中运行
# → 前端在本地 Node.js 运行

# 生产部署 - 不使用 Docker
vercel --prod
# → 前端: Vercel Next.js 平台
# → 后端: Vercel Serverless Functions
```

#### 为什么本地用 Docker？

1. 解决 Python 环境依赖问题
2. 与生产环境保持一致的代码
3. 支持热重载，方便开发
4. 隔离开发环境

#### 为什么生产不用 Docker？

1. Vercel 原生支持 Serverless
2. 自动扩展，无需管理容器
3. 成本更低（按需付费）
4. 更快的冷启动时间

## 三、服务启动流程

### 前端启动 (Vercel)
```
1. Vercel 接收部署请求
   ↓
2. 拉取 GitHub 代码
   ↓
3. 执行构建命令: npm run vercel-build-no-lint
   ↓
4. Next.js 构建
   ├─ 生成静态页面
   ├─ 编译 API 路由
   └─ 优化资源
   ↓
5. 部署到 Vercel 平台
   ├─ 静态文件 → CDN
   ├─ SSR 页面 → Serverless Functions
   └─ API 路由 → Serverless Functions
   ↓
6. 分配域名和 HTTPS 证书
   ↓
7. 服务上线
```

### 后端启动 (Vercel Serverless)
```
1. Vercel 接收部署请求
   ↓
2. 拉取 agent-backend 代码
   ↓
3. 检测 vercel.json 配置
   ↓
4. 使用 @vercel/python 构建
   ├─ 安装 requirements.txt 依赖
   ├─ 打包 FastAPI 应用
   └─ 创建 Serverless Function
   ↓
5. 部署到 Vercel 平台
   ↓
6. 首次请求时冷启动
   ├─ 初始化 Python 运行时
   ├─ 加载 FastAPI 应用
   ├─ 初始化插件系统
   └─ 处理请求
   ↓
7. 后续请求使用热实例（如果可用）
```

冷启动优化:
```python
# api/index.py
app = FastAPI(...)  # 应用在模块级别初始化

# 插件系统延迟加载
@app.on_event("startup")
async def startup():
    # 初始化插件管理器
    pass
```

## 四、数据库连接
PostgreSQL 配置
连接方式:
```typescript
// lib/database.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});
```
环境变量:
```
# Vercel 环境变量
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
POSTGRES_URL=postgresql://...  # 备用
```

连接池管理:
- 前端 API 路由: 每个请求创建连接
- 后端 Serverless: 复用连接池（如果实例热启动）

## 五、文件存储 (腾讯云 COS)

### 配置:
```
// lib/tencent-cos-config.ts
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});
```

### 使用场景:
- 博客图片上传
- AIGC 作品存储
- 用户头像

优势:
- 独立于 Vercel，避免存储限制
- CDN 加速
- 成本可控

## 六、环境变量管理
本地开发 (.env.local)
```shell
DATABASE_URL=postgresql://localhost:5432/doudou
COS_SECRET_ID=xxx
COS_SECRET_KEY=xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Vercel 生产环境
在 Vercel Dashboard → Settings → Environment Variables 配置：
- DATABASE_URL - 生产数据库
- COS_* - 腾讯云配置
- NEXT_PUBLIC_SITE_URL - 生产域名

安全性:
- 敏感信息不提交到 Git
- 使用 Vercel 加密存储
- 前端只能访问 NEXT_PUBLIC_* 变量

## 七、监控和日志

### Vercel 日志查看
```
# 实时查看日志
vercel logs --follow

# 查看特定部署
vercel logs [deployment-url]

# 查看函数日志
vercel logs --output=raw
```

### GitHub Actions 日志
在 GitHub → Actions → 选择工作流运行 → 查看详细日志

## 八、回滚和版本管理

### 快速回滚
```
# 在 Vercel Dashboard
1. 进入 Deployments
2. 找到之前的成功部署
3. 点击 "Promote to Production"

# 或使用 CLI
vercel rollback [deployment-url]
```

### Git 版本管理
```
# 回滚代码
git revert <commit-hash>
git push origin main

# 自动触发新的部署
```

## 九、性能优化

### 前端优化
- 图片优化: Next.js Image 组件 + WebP/AVIF
- 代码分割: 动态导入 + 路由级别分割
- CDN 缓存: Vercel Edge Network
- 构建优化: 禁用不必要的追踪

### 后端优化
- 冷启动优化: 减少依赖，延迟加载
- 连接池: 复用数据库连接
- 缓存策略: Redis (可选)
- 超时设置: 30 秒函数超时

## 十、故障排查

常见问题
1. 构建失败
```
# 查看构建日志
vercel logs --output=raw

# 本地复现
npm run vercel-build-no-lint
```

2. 环境变量未生效

- 检查 Vercel Dashboard 配置
- 确认变量名拼写
- 重新部署触发更新

3. 数据库连接失败
```
# 测试连接
npm run db:test

# 检查 SSL 配置
ssl: { rejectUnauthorized: false }
```

4. API 超时

- 检查函数执行时间 (< 30 秒)
- 优化数据库查询
- 增加超时配置

## 📝 总结
关键要点
1. CI/CD: GitHub Actions 自动化部署
2. 前端: Vercel Next.js 平台 (SSG + SSR + API Routes)
3.后端: Vercel Serverless Functions (Python FastAPI)
4. 数据库: PostgreSQL (独立托管)
5. 存储: 腾讯云 COS
6. Docker: 仅用于本地开发，生产不使用

部署流程
代码推送 → CI 检查 → 构建验证 → Vercel 部署 → 服务上线
环境对比
| 环境 | 前端 | 后端 | 数据库 | |------|------|------|--------| | 本地开发 | Node.js | Docker | PostgreSQL | | 生产环境 | Vercel | Vercel Serverless | PostgreSQL |

这个架构充分利用了 Vercel 的 Serverless 优势，同时通过 Docker 简化了本地开发环境，是一个现代化的全栈部署方案！