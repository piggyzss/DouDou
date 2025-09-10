# 变更日志使用指南

## 概述

本项目使用 `CHANGELOG.md` 文件来跟踪所有重要的功能变动、问题修复和更新。这有助于团队成员和用户了解项目的演进历程。

## 文件结构

```
CHANGELOG.md          # 主变更日志文件
scripts/
  update-changelog.ts # 变更日志更新工具
  git-hooks/
    pre-commit        # Git 提交前检查脚本
```

## 使用方法

### 1. 快速记录变更

使用 npm 脚本快速添加变更记录：

```bash
# 新增功能
npm run changelog -- --type=feat --message="新增视频播放器功能"

# 修复问题
npm run changelog -- --type=fix --message="修复音乐播放器状态同步问题"

# 功能变更
npm run changelog -- --type=change --message="优化首页加载性能"

# 移除功能
npm run changelog -- --type=remove --message="移除过时的 API 接口"

# 安全修复
npm run changelog -- --type=security --message="修复 XSS 安全漏洞"
```

### 2. 手动编辑

你也可以直接编辑 `CHANGELOG.md` 文件：

```markdown
## [未发布]

### 新增
- 新增视频播放器功能 (张三, 2024-01-10)

### 修复
- 修复音乐播放器状态同步问题 (李四, 2024-01-10)
```

### 3. 查看帮助

```bash
npm run changelog -- --help
```

## 变更类型说明

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新增功能 | 新增用户注册功能 |
| `fix` | 问题修复 | 修复登录页面样式问题 |
| `change` | 功能变更 | 优化数据库查询性能 |
| `remove` | 移除功能 | 移除过时的 API 接口 |
| `security` | 安全修复 | 修复 SQL 注入漏洞 |

## 版本发布流程

### 1. 开发阶段

在开发过程中，所有变更都记录在 `[未发布]` 部分：

```markdown
## [未发布]

### 新增
- 新增功能 A (作者, 日期)
- 新增功能 B (作者, 日期)

### 修复
- 修复问题 A (作者, 日期)
```

### 2. 版本发布

发布新版本时，将 `[未发布]` 改为具体版本号：

```markdown
## [1.1.0] - 2024-01-15

### 新增
- 新增功能 A (作者, 日期)
- 新增功能 B (作者, 日期)

### 修复
- 修复问题 A (作者, 日期)

## [未发布]

### 新增
- 待添加新功能

### 变更
- 待添加变更

### 修复
- 待添加修复
```

## Git Hook 集成

项目包含一个 pre-commit hook，会在提交前检查是否更新了变更日志：

```bash
# 安装 Git Hook
cp scripts/git-hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Hook 会：
- 检查是否有变更日志更新
- 如果没有更新，会提示并询问是否继续提交
- 提供变更记录的建议命令

## 最佳实践

### 1. 记录原则

- ✅ 只记录用户可见的变更
- ✅ 变更描述要简洁明了
- ✅ 重要功能要详细说明
- ❌ 不要记录内部重构或代码优化
- ❌ 不要记录未完成的实验性功能

### 2. 描述规范

```bash
# ✅ 好的描述
npm run changelog -- --type=feat --message="新增用户个人资料编辑功能"
npm run changelog -- --type=fix --message="修复移动端导航菜单显示问题"

# ❌ 不好的描述
npm run changelog -- --type=feat --message="添加新功能"
npm run changelog -- --type=fix --message="修复 bug"
```

### 3. 团队协作

- 每次提交前更新变更日志
- 定期回顾和整理变更记录
- 发布前确保所有变更都已记录
- 重要版本发布前进行变更日志审查

## 工具命令总结

```bash
# 记录变更
npm run changelog -- --type=<类型> --message="<描述>"

# 查看帮助
npm run changelog -- --help

# 安装 Git Hook
cp scripts/git-hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 示例工作流

```bash
# 1. 开发新功能
git checkout -b feature/new-video-player
# ... 开发代码 ...

# 2. 记录变更
npm run changelog -- --type=feat --message="新增视频播放器功能"

# 3. 提交代码
git add .
git commit -m "feat: 新增视频播放器功能"

# 4. 推送分支
git push origin feature/new-video-player
```

这样就能确保每次重要的变更都有完整的记录，便于项目管理和版本回溯！
