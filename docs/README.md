# DouDou 项目文档

## 📚 文档目录

### 🏗️ 数据库相关文档

#### 📋 综合指南
- **[数据库综合指南](./database-comprehensive-guide.md)** ⭐ 
  - 完整的数据库使用指南，包含架构、环境配置、管理工具等
  - 推荐首先阅读此文档

#### 🔧 技术细节
- **[数据库架构设计](./database-schema.md)**
  - 详细的表结构设计和关系说明
  
- **[数据库内容架构](./database-content-architecture.md)**
  - AIGC 内容的组织方式和设计理念
  
- **[点赞系统设计](./likes-system-design.md)**
  - 点赞系统的混合架构设计分析

#### 🌍 环境配置
- **[数据库环境识别指南](./database-environment-guide.md)**
  - 如何识别和切换不同的数据库环境
  
- **[Vercel 数据库配置](./vercel-database-setup.md)**
  - Vercel Postgres 的配置和使用指南

#### 📋 操作参考
- **[数据库命令参考](./database-commands.md)**
  - 所有数据库管理命令的详细说明

### 🚀 部署相关文档

- **[部署指南](./deployment-guide.md)**
  - 项目部署的完整流程
  
- **[后端配置](./backend-setup.md)**
  - 后端服务的配置说明

### ☁️ 云服务配置

- **[腾讯云 COS 配置](./cos-setup.md)**
  - 腾讯云对象存储的配置指南

### 🤖 AIGC 功能

- **[AIGC 完整指南](./aigc-guide.md)** ⭐
  - AIGC 功能的完整使用指南，包含快速开始、配置说明、API 接口等

### 📝 开发规范

- **[更新日志指南](./changelog-guide.md)**
  - 如何维护项目更新日志

---

## 🎯 快速导航

### 新用户推荐阅读顺序

1. **[数据库综合指南](./database-comprehensive-guide.md)** - 了解整体架构
2. **[数据库环境识别指南](./database-environment-guide.md)** - 配置开发环境
3. **[AIGC 完整指南](./aigc-guide.md)** - 开始使用 AIGC 功能
4. **[部署指南](./deployment-guide.md)** - 部署到生产环境

### 常见问题快速查找

#### 🔍 "我不知道连接的是哪个数据库"
→ [数据库环境识别指南](./database-environment-guide.md)

#### 🛠️ "如何管理 AIGC 内容数据"
→ [数据库综合指南](./database-comprehensive-guide.md#管理工具使用)

#### ⚙️ "如何配置 Vercel 数据库"
→ [Vercel 数据库配置](./vercel-database-setup.md)

#### 🏗️ "数据库表结构是什么样的"
→ [数据库架构设计](./database-schema.md)

#### 👍 "点赞系统是如何设计的"
→ [点赞系统设计](./likes-system-design.md)

#### 🚀 "如何部署项目"
→ [部署指南](./deployment-guide.md)

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
2. 检查 [数据库综合指南](./database-comprehensive-guide.md) 中的故障排除部分
3. 使用 `npm run db:info` 检查当前环境状态
4. 查看项目的 issue 和 changelog
