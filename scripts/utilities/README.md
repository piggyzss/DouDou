# Utilities Scripts

工具类脚本，包含各种实用工具和辅助脚本。

## 📋 脚本列表

### 🖼️ 资源管理

#### `update-avatar.sh`

- **用途**: 更新头像脚本
- **功能**:
  - 批量更新用户头像
  - 处理头像格式转换
  - 优化头像尺寸
- **使用场景**: 头像资源更新维护
- **命令**: `./scripts/utilities/update-avatar.sh`

### 📝 文档管理

#### `update-changelog.ts` ⭐ **常用**

- **用途**: 更新变更日志工具
- **功能**:
  - 自动生成变更日志条目
  - 支持多种变更类型
  - 格式化日志输出
  - 按时间排序
- **使用场景**: 版本发布前更新CHANGELOG
- **命令**: `npx tsx scripts/utilities/update-changelog.ts`

**使用示例**:

```bash
# 添加新功能
npm run changelog -- --type=feat --message="新增视频播放器功能"

# 修复问题
npm run changelog -- --type=fix --message="修复音乐播放器状态同步问题"

# 性能优化
npm run changelog -- --type=change --message="优化首页加载性能"
```

### 🔧 Git工具

#### `git-hooks/pre-commit`

- **用途**: Git提交前钩子
- **功能**:
  - 代码格式检查
  - 语法检查
  - 测试运行
  - 提交信息验证
- **使用场景**: 自动化代码质量检查
- **安装**:
  ```bash
  cp scripts/utilities/git-hooks/pre-commit .git/hooks/
  chmod +x .git/hooks/pre-commit
  ```

## 🛠️ 工具使用指南

### 变更日志管理

#### 支持的变更类型

- `feat` - 新功能
- `fix` - 问题修复
- `change` - 功能改进
- `remove` - 功能移除
- `security` - 安全相关

#### 使用流程

```bash
# 1. 开发完成后，添加变更记录
npm run changelog -- --type=feat --message="新增用户管理功能"

# 2. 查看生成的CHANGELOG.md
cat CHANGELOG.md

# 3. 提交变更
git add CHANGELOG.md
git commit -m "docs: update changelog"
```

#### 批量添加变更

```bash
# 可以连续添加多个变更
npm run changelog -- --type=feat --message="新增搜索功能"
npm run changelog -- --type=fix --message="修复分页问题"
npm run changelog -- --type=change --message="优化界面响应速度"
```

### Git钩子配置

#### 安装预提交钩子

```bash
# 复制钩子文件
cp scripts/utilities/git-hooks/pre-commit .git/hooks/

# 设置执行权限
chmod +x .git/hooks/pre-commit
```

#### 钩子功能

- **代码格式化**: 自动运行 Prettier
- **语法检查**: 运行 ESLint 检查
- **类型检查**: 运行 TypeScript 编译检查
- **测试**: 运行单元测试（可选）

#### 跳过钩子

```bash
# 紧急情况下跳过钩子
git commit --no-verify -m "emergency fix"
```

### 头像管理

#### 更新头像

```bash
# 运行头像更新脚本
./scripts/utilities/update-avatar.sh

# 指定头像文件
./scripts/utilities/update-avatar.sh /path/to/new-avatar.png
```

#### 支持格式

- PNG (推荐)
- JPG/JPEG
- WebP
- SVG

## 🔧 配置说明

### update-changelog.ts 配置

脚本会读取以下配置：

- 变更日志文件路径: `CHANGELOG.md`
- 日期格式: `YYYY-MM-DD`
- 版本格式: 自动递增

### Git钩子配置

可以在 `.git/hooks/pre-commit` 中自定义：

```bash
#!/bin/sh
# 自定义预提交检查
npm run lint
npm run type-check
npm run test:unit
```

## 📝 维护指南

### 定期维护任务

#### 每周

- 检查并更新变更日志
- 清理临时文件
- 更新工具脚本

#### 每月

- 检查Git钩子是否正常工作
- 更新工具依赖
- 清理过期的工具脚本

#### 版本发布前

- 整理变更日志
- 检查所有工具脚本
- 更新版本信息

### 添加新工具

#### 创建新脚本

1. 在 `scripts/utilities/` 目录创建脚本
2. 添加适当的文档注释
3. 设置执行权限
4. 更新README文档

#### 脚本模板

```typescript
#!/usr/bin/env ts-node

/**
 * 工具名称
 * 用途说明
 * 使用方法：npx tsx scripts/utilities/your-tool.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  try {
    console.log("🚀 工具启动...");

    // 工具逻辑

    console.log("✅ 工具执行完成");
  } catch (error) {
    console.error("❌ 工具执行失败:", error);
    process.exit(1);
  }
}

main();
```

## ⚠️ 注意事项

1. **权限**: 某些工具可能需要文件系统权限
2. **备份**: 运行修改文件的工具前请备份
3. **测试**: 新工具要在测试环境验证
4. **文档**: 及时更新工具文档

## 🔗 相关文档

- [开发指南](../../docs/development-guide.md)
- [Git工作流](../../docs/git-workflow.md)
- [变更日志指南](../../docs/changelog-guide.md)
