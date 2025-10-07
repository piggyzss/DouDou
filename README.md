# DouDou - AI驱动的个人网站

一个现代化的全栈个人网站，集成了AI Agent、博客系统、作品展示等功能，采用Next.js + FastAPI + Vercel容器化部署。

## 🚀 项目特色

- **🤖 AI Agent系统**: 智能新闻收集和分析，支持自然语言交互
- **📝 博客系统**: 支持Markdown写作，自动生成SEO优化
- **🎨 作品展示**: 多媒体内容管理，支持图片、视频、音乐
- **🔧 现代化技术栈**: Next.js 14 + TypeScript + Tailwind CSS
- **🐳 容器化部署**: Vercel前端 + Vercel容器化后端
- **🔄 完整CI/CD**: GitHub Actions自动化测试和部署

## 🏗️ 技术架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Vercel        │    │   腾讯云COS     │
│   (Next.js前端)  │────│   (Python后端)   │    │   (文件存储)     │
│   • 静态页面     │    │   • Agent服务    │    │   • 图片资源     │
│   • API包装层    │    │   • 插件系统     │    │   • 文件上传     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
    用户访问                  后端逻辑                   资源存储
        │                        │                        │
   域名DNS解析              Vercel容器化              COS CDN加速
```

## 📁 项目结构

```
DouDou/
├── app/                          # Next.js 14 应用目录
│   ├── agent/                    # AI Agent 前端界面
│   ├── aigc/                     # AI生成内容管理
│   ├── blog/                     # 博客系统
│   ├── apps/                     # 作品展示
│   └── api/                      # API路由
├── agent-backend/                # Python FastAPI 后端
│   ├── app/                      # 应用核心代码
│   ├── Dockerfile                # 容器化配置
│   ├── vercel.json               # Vercel部署配置
│   └── requirements.txt          # Python依赖
├── docs/                         # 项目文档
├── scripts/                      # 工具脚本
└── .github/workflows/            # CI/CD配置
```

## 🚀 快速开始

### 开发环境

**推荐方式：Docker混合模式**
```bash
# 一键启动开发环境
./scripts/docker/start-dev-docker.sh

# 访问地址：
# - 前端: http://localhost:3000
# - 后端: http://localhost:8000
# - API文档: http://localhost:8000/docs
```

**传统方式：本地开发**
```bash
# 前端
npm install
npm run dev

# 后端
cd agent-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 生产环境部署

**自动化部署（推荐）**
```bash
# 推送代码到main分支即可自动部署
git push origin main
```

**手动部署**
```bash
# 前端部署到Vercel
vercel --prod

# 后端容器化部署到Vercel
cd agent-backend
vercel --prod
```

## 🎯 核心功能

### 1. AI Agent系统
- **智能新闻收集**: 自动获取最新AI资讯
- **自然语言交互**: 支持自然语言查询
- **插件化架构**: 易于扩展新功能
- **实时分析**: 智能内容分析和趋势识别

### 2. 博客系统
- **Markdown支持**: 完整的Markdown写作体验
- **SEO优化**: 自动生成meta标签和结构化数据
- **分类标签**: 灵活的内容组织方式
- **搜索功能**: 全文搜索支持

### 3. 作品展示
- **多媒体支持**: 图片、视频、音乐展示
- **分类管理**: 按类型组织作品
- **响应式设计**: 适配各种设备
- **懒加载优化**: 提升页面性能

## 🛠️ 技术栈

### 前端
- **Next.js 14**: React全栈框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 原子化CSS
- **Framer Motion**: 动画效果
- **React Query**: 数据获取和缓存

### 后端
- **FastAPI**: 现代Python Web框架
- **Pydantic**: 数据验证
- **Uvicorn**: ASGI服务器
- **Gunicorn**: WSGI服务器
- **Redis**: 缓存和会话存储

### 部署
- **Vercel**: 前端和容器化后端部署
- **Docker**: 容器化技术
- **GitHub Actions**: CI/CD自动化
- **腾讯云COS**: 文件存储

## 📚 文档

- [快速配置指南](./docs/quick-setup-guide.md) - 5分钟快速配置Vercel部署
- [部署指南](./docs/deployment-guide.md) - 完整的部署配置指南
- [CI/CD指南](./docs/cicd-guide.md) - 自动化流程配置
- [后端架构](./docs/backend-setup.md) - 后端技术架构详解
- [Vercel容器化指南](./docs/deployment-guide.md#-vercel容器化技术详解) - 容器化部署详解
- [开发指南](./docs/local-development-guide.md) - 本地开发环境配置

## 🔧 开发

### 环境要求
- Node.js 18+
- Python 3.11+
- Docker (可选)
- Git

### 安装依赖
```bash
# 前端依赖
npm install

# 后端依赖
cd agent-backend
pip install -r requirements.txt
```

### 运行测试
```bash
# 前端测试
npm run test

# 后端测试
cd agent-backend
pytest
```

### 代码质量
```bash
# 前端代码检查
npm run lint
npm run type-check

# 后端代码检查
cd agent-backend
black .
flake8 .
mypy .
```

## 🚀 部署

### 环境变量配置

**GitHub Secrets (CI/CD)**
```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
VERCEL_BACKEND_PROJECT_ID=your_backend_project_id
```

**Vercel环境变量**
```bash
# 数据库
DATABASE_URL=your_database_url

# 腾讯云COS
COS_SECRET_ID=your_cos_secret_id
COS_SECRET_KEY=your_cos_secret_key
COS_BUCKET=your_bucket_name

# 应用配置
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 部署流程

1. **配置GitHub Secrets**
2. **推送代码到main分支**
3. **GitHub Actions自动构建和部署**
4. **验证部署结果**

## 📊 性能优化

- **图片优化**: Next.js Image组件 + WebP格式
- **代码分割**: 动态导入和懒加载
- **缓存策略**: Redis缓存 + CDN加速
- **容器优化**: 多阶段Docker构建
- **监控告警**: 实时性能监控

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React全栈框架
- [FastAPI](https://fastapi.tiangolo.com/) - 现代Python Web框架
- [Vercel](https://vercel.com/) - 部署平台
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架

---

**最后更新**: 2025年1月
**版本**: v2.0.0
**状态**: ✅ 生产就绪
