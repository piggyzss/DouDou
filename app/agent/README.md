# Agent 模块

## 概述

Agent 模块是一个 AI 资讯获取工具，提供类似开发者控制台的交互界面，用户可以通过命令行方式与 AI Agent 交互，获取最新的 AI 领域资讯。

## 功能特性

### 🎨 界面设计

- **Terminal 风格界面**: 模仿开发者控制台/终端的经典界面
- **智能主题切换**: 默认浅色主题，自动适配整站主题
- **响应式设计**: 支持桌面端、平板和移动端
- **打字机效果**: 实时显示 Agent 响应，提升交互体验

### 🤖 AI Agent 功能

- **最新资讯**: 获取 AI 领域的最新新闻和发展动态
- **趋势分析**: 显示当前热门的 AI 话题和趋势
- **深度分析**: 对 AI 发展进行深入分析和见解
- **分类浏览**: 按不同 AI 领域分类浏览资讯
- **智能搜索**: 根据关键词搜索相关资讯

### 💻 交互功能

- **命令历史**: 支持上下箭头浏览历史命令
- **自动补全**: 智能命令补全功能
- **快捷命令**: 侧边栏提供常用命令快速访问
- **状态显示**: 实时显示 Agent 工作状态

## 支持的命令

| 命令                | 描述                       |
| ------------------- | -------------------------- |
| `/help`             | 显示帮助信息和所有可用命令 |
| `/latest`           | 获取最新 AI 资讯           |
| `/search <keyword>` | 搜索特定关键词的相关资讯   |
| `/categories`       | 显示新闻分类和文章数量     |
| `/trending`         | 显示当前热门趋势话题       |
| `/deepdive`         | 进行深度分析和见解         |
| `/history`          | 显示命令历史记录           |
| `/clear`            | 清空终端屏幕               |
| `/status`           | 显示 Agent 当前状态        |
| `/config`           | 配置设置                   |

## 使用方法

### 1. 访问 Agent 页面

导航到 `/agent` 路由或点击导航栏中的 "Agent" 按钮。

### 2. 基本交互

```bash
# 获取最新资讯
user@agent:~$ /latest

# 搜索特定话题
user@agent:~$ /search GPT-4

# 查看趋势
user@agent:~$ /trending

# 深度分析
user@agent:~$ /deepdive
```

### 3. 快捷操作

- 使用侧边栏的快捷按钮快速输入命令
- 使用 ↑/↓ 箭头键浏览命令历史
- 点击最小化按钮将终端最小化到右下角

## 技术实现

### 前端组件

- `AgentTerminal.tsx`: 主要的终端界面组件
- `useAgent.ts`: Agent 逻辑和状态管理钩子
- `useTerminalTheme.ts`: 主题适配钩子

### 样式系统

- CSS 变量系统支持浅色/深色主题自动切换
- Terminal 专用的颜色方案和样式类
- 平滑的主题过渡动画

### Mock 数据

当前版本使用 Mock 数据模拟 AI 资讯内容，包括：

- 最新新闻文章
- 趋势话题分析
- 新闻分类统计
- 深度分析报告

## 未来规划

### 后端集成

- Python FastAPI 后端服务
- LangChain Agent 框架
- 真实数据源集成（RSS、API、爬虫）
- WebSocket 实时通信

### 功能扩展

- 个性化推荐
- 历史记录持久化
- 多语言支持
- 导出功能

## 开发说明

### 本地开发

```bash
npm run dev
```

访问 `http://localhost:3000/agent` 查看 Agent 模块。

### 文件结构

```
app/agent/
├── components/
│   └── AgentTerminal.tsx     # 主要终端组件
├── hooks/
│   ├── useAgent.ts           # Agent 逻辑钩子
│   └── useTerminalTheme.ts   # 主题适配钩子
├── page.tsx                  # Agent 页面路由
└── README.md                 # 本文档
```

### 主题定制

Terminal 主题变量定义在 `app/globals.css` 中，可以通过修改 CSS 变量来自定义颜色方案：

```css
:root {
  --terminal-bg: #ffffff;
  --terminal-text: #24292f;
  --terminal-green: #53b88f;
  --terminal-blue: #3388ff;
  --terminal-accent: #6747ce;
  /* ... 更多变量 */
}
```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进 Agent 模块的功能和体验。
