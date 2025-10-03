# DouDou 项目文档

## 📚 文档目录

### 🏗️ 数据库相关文档

#### 📋 核心指南
- **[数据库使用指南](./database-guide.md)** ⭐ 
  - 简洁的数据库使用指南，包含架构、环境管理、表结构、管理工具
  - 推荐首先阅读此文档

#### 🔧 详细设计
- **[数据库内容架构](./database-content-architecture.md)**
  - 详细的内容架构设计和理念分析
  

- **[数据库架构设计](./database-schema.md)**
  - 完整的表结构设计和关系说明
  
- **[Vercel 数据库配置](./vercel-database-setup.md)**
  - Vercel Postgres 的配置和使用指南


### 🚀 部署相关文档

- **[部署指南](./deployment-guide.md)**
  - 项目部署的完整流程
  
- **[后端配置](./backend-setup.md)**
  - 后端服务的配置说明

- **[CI/CD 指南](./cicd-guide.md)** ⭐
  - 持续集成和持续部署的完整指南
  - GitHub Actions 工作流配置
  - 代码质量和安全扫描

### ☁️ 云服务配置

- **[腾讯云 COS 配置](./cos-setup.md)**
  - 腾讯云对象存储的配置指南

### 📝 开发规范

- **[更新日志指南](./changelog-guide.md)**
  - 如何维护项目更新日志

- **[测试指南](./testing-guide.md)**
  - 项目测试框架和最佳实践

---

## 🎯 快速导航

### 新用户推荐阅读顺序

1. **[数据库使用指南](./database-guide.md)** - 了解整体架构、环境管理和 AIGC 功能
2. **[腾讯云 COS 配置](./cos-setup.md)** - 配置文件存储服务
3. **[CI/CD 指南](./cicd-guide.md)** - 了解自动化部署流程
4. **[部署指南](./deployment-guide.md)** - 部署到生产环境
5. **[数据库内容架构](./database-content-architecture.md)** - 深入了解内容设计理念

### 常见问题快速查找

#### 🔍 "我不知道连接的是哪个数据库"
→ [数据库使用指南](./database-guide.md#🔍-环境管理)

#### 🛠️ "如何管理 AIGC 内容数据"
→ [数据库使用指南](./database-guide.md#🛠️-管理工具)

#### 🎨 "AIGC 功能如何配置和使用"
→ [数据库使用指南](./database-guide.md) + [腾讯云 COS 配置](./cos-setup.md)

#### ⚙️ "如何配置 Vercel 数据库"
→ [Vercel 数据库配置](./vercel-database-setup.md)

#### 🏗️ "数据库表结构是什么样的"
→ [数据库架构设计](./database-schema.md)

#### 👍 "点赞系统是如何设计的"
→ [数据库内容架构](./database-content-architecture.md#👍-点赞系统架构设计)

#### 🚀 "如何部署项目"
→ [部署指南](./deployment-guide.md)

#### 🔄 "如何设置 CI/CD 自动化部署"
→ [CI/CD 指南](./cicd-guide.md)

#### 🧪 "如何运行和编写测试"
→ [测试指南](./testing-guide.md)

---

## 📊 文档状态

| 文档 | 状态 | 最后更新 | 说明 |
|------|------|----------|------|
| 数据库综合指南 | ✅ 完整 | 2025-09-11 | 新创建的综合指南 |
| 数据库环境识别 | ✅ 完整 | 2025-09-11 | 环境识别工具文档 |
| AIGC 内容架构 | ✅ 完整 | 2025-09-11 | 内容组织架构说明 |
| 点赞系统设计 | ✅ 完整 | 2025-09-11 | 设计理念分析 |
| 数据库架构设计 | ✅ 完整 | - | 表结构详细说明 |
| Vercel 数据库配置 | ✅ 完整 | 2025-09-11 | Vercel Postgres 配置 |
| 数据库命令参考 | ✅ 完整 | - | 命令使用说明 |
| 部署指南 | ✅ 完整 | - | 部署流程说明 |
| 其他文档 | ✅ 完整 | - | 各种配置指南 |

---

## 🔄 文档维护

### 贡献指南
- 发现文档错误或需要更新时，请及时修改
- 新增功能时，请同步更新相关文档
- 保持文档的准确性和时效性

### 文档规范
- 使用 Markdown 格式
- 包含适当的表情符号和格式
- 提供清晰的代码示例
- 包含故障排除信息

---

## 📞 获取帮助

如果在使用过程中遇到问题：

1. 首先查阅相关文档
2. 检查 [数据库使用指南](./database-guide.md) 中的故障排除部分
3. 使用 `npm run db:info` 检查当前环境状态
4. 查看项目的 issue 和 changelog
5. 在终端窗口测试
curl http://localhost:8000/health
# 预期响应:
# {"status":"healthy","service":"agent-backend"}
6. 查看API文档
open http://localhost:8000/docs