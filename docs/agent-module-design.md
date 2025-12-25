# ReAct Agent 模块设计方案

## 项目概述

为个人网站增加一个基于 ReAct (Reasoning + Acting) 框架的智能 Agent 模块，通过多步推理和行动解决复杂任务。采用终端/控制台风格的交互界面，集成 Python ReAct Agent 后端和 Next.js 前端包装。

**核心特性**：
- 🧠 多步推理循环（最多 5 次迭代）
- 📋 智能任务规划和分解
- 💾 会话记忆管理（PostgreSQL 持久化）
- 🔧 工具编排系统（支持工具链执行）
- 🎯 质量评估和自我反思
- 🔄 实时步骤可视化

## 技术架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (Next.js)                  │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ AgentTerminal    │  │ StepVisualization│                │
│  │ Component        │  │ Component        │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/SSE
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Layer (Proxy)                 │
│  /api/agent/execute - Execute Agent Query                   │
│  /api/agent/stream - Stream ReAct Steps (SSE)               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Python Backend (FastAPI)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ReactAgent (ReAct 执行器)                            │  │
│  │  - 协调 ReAct 循环执行（最多 5 次迭代）                │  │
│  │  - 管理迭代状态和历史                                  │  │
│  │  - 合成最终响应                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TaskPlanner (任务规划器)                             │  │
│  │  - 分析查询复杂度（简单/中等/复杂）                    │  │
│  │  - 分解复杂查询为子任务                                │  │
│  │  - 估计迭代次数                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ToolOrchestrator (工具编排器)                        │  │
│  │  - 执行工具链                                          │  │
│  │  - 解析参数引用（${step1.result}）                     │  │
│  │  - 缓存工具结果（5 分钟 TTL）                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ConversationMemory (会话记忆)                        │  │
│  │  - PostgreSQL 持久化存储                              │  │
│  │  - 对话历史检索（最近 10 条）                          │  │
│  │  - 长对话自动摘要                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  LLM Service (LLM 服务层)                             │  │
│  │  - Google Gemini 2.0 Flash (推理生成、响应合成)        │  │
│  │  - 任务规划、ReAct 迭代、质量评估                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PostgreSQL   │  │ Plugin       │  │ Tool         │     │
│  │ Database     │  │ Manager      │  │ Registry     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 1. 导航和路由设计

### 1.1 导航栏更新

在现有导航项中添加 Agent 选项：

```typescript
const navItems = [
  { name: "Hi", href: "/", icon: Carrot },
  { name: "Blog", href: "/blog", icon: PenSquare },
  { name: "App", href: "/apps", icon: Code },
  { name: "AIGC", href: "/aigc", icon: Palette },
  { name: "Agent", href: "/agent", icon: Bot }, // 新增
];
```

### 1.2 路由结构

```
app/
├── agent/
│   ├── page.tsx                 # Agent 主页面
│   ├── components/
│   │   ├── Terminal.tsx         # 终端界面组件
│   │   ├── CommandInput.tsx     # 命令输入组件
│   │   ├── OutputDisplay.tsx    # 输出显示组件
│   │   ├── StatusBar.tsx        # 状态栏组件
│   │   └── NewsCard.tsx         # 新闻卡片组件
│   └── hooks/
│       ├── useWebSocket.ts      # WebSocket 连接钩子
│       └── useTerminal.ts       # 终端逻辑钩子
└── api/
    └── agent/
        ├── chat/
        │   └── route.ts         # 聊天接口
        ├── news/
        │   └── route.ts         # 获取新闻接口
        └── status/
            └── route.ts         # Agent 状态接口
```

## 2. 前端界面设计

### 2.1 Terminal 风格界面

#### 设计理念

- 模仿开发者控制台/终端界面
- 默认浅色主题，自动适配整站主题切换
- 绿色/蓝色字体突出显示
- 打字机效果的文字输出
- 命令历史记录功能

#### 界面布局

**浅色主题（默认）**

```
┌─────────────────────────────────────────────────────────────┐
│ AI News Agent v1.0                                     [×]  │
├─────────────────────────────────────────────────────────────┤
│ Status: ● Online  |  Last Update: 2024-01-20 14:30:25     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ > Welcome to AI News Agent                                  │
│ > Type '/help' for available commands                       │
│ > Type '/trending' for display trends                       │
│ > Type 'deepdive' for depth analysis                        │
│                                                             │
│ user@agent:~$ ./ai_news_agent --start                       │
│ [INFO] Fetching latest AI news...                           │
│ [SUCCESS] Found 15 new articles                             │
│ [2024-01-20 14:30] Processing complete                      │
│                                                             │
│ ┌─ Latest AI News ────────────────────────────────────────┐ │
│ │ 1. OpenAI releases GPT-4.5 with enhanced reasoning      │ │
│ │    Source: TechCrunch | 2 hours ago                     │ │
│ │                                                         │ │
│ │ 2. Google DeepMind announces breakthrough in robotics   │ │
│ │    Source: Nature | 4 hours ago                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ user@agent:~$ █                                             │
└─────────────────────────────────────────────────────────────┘
```

**深色主题（自动适配）**

```
┌─────────────────────────────────────────────────────────────┐
│ AI News Agent v1.0                                     [×]  │
├─────────────────────────────────────────────────────────────┤
│ Status: ● Online  |  Last Update: 2024-01-20 14:30:25     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ > Welcome to AI News Agent                                  │
│ > Type '/help' for available commands                       │
│ > Type '/trending' for display trends                       │
│ > Type 'deepdive' for depth analysis                        │
│                                                             │
│ user@agent:~$ ./ai_news_agent --start                       │
│ [INFO] Fetching latest AI news...                           │
│ [SUCCESS] Found 15 new articles                             │
│ [2024-01-20 14:30] Processing complete                      │
│                                                             │
│ ┌─ Latest AI News ────────────────────────────────────────┐ │
│ │ 1. OpenAI releases GPT-4.5 with enhanced reasoning      │ │
│ │    Source: TechCrunch | 2 hours ago                     │ │
│ │                                                         │ │
│ │ 2. Google DeepMind announces breakthrough in robotics   │ │
│ │    Source: Nature | 4 hours ago                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ user@agent:~$ █                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 颜色方案

```css
/* 浅色主题（默认） */
:root {
  --terminal-bg: #ffffff;
  --terminal-text: #24292f;
  --terminal-green: #53b88f;
  --terminal-blue: #3388ff;
  --terminal-yellow: #ffd33d;
  --terminal-red: #d73a49;
  --terminal-border: #d0d7de;
  --terminal-accent: #6747ce;
  --terminal-muted: #656d76;
}

/* 深色主题适配 */
[data-theme="dark"] .terminal-container,
.dark .terminal-container {
  --terminal-bg: #0d1117;
  --terminal-text: #c9d1d9;
  --terminal-green: #8ccc79;
  --terminal-blue: #84a5f4;
  --terminal-yellow: #f9e2af;
  --terminal-red: #ff7b72;
  --terminal-border: #30363d;
  --terminal-accent: #8a6fd8;
  --terminal-muted: #8b949e;
}

/* 系统主题适配 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .terminal-container {
    --terminal-bg: #0d1117;
    --terminal-text: #c9d1d9;
    --terminal-green: #7c3aed;
    --terminal-blue: #58a6ff;
    --terminal-yellow: #f9e2af;
    --terminal-red: #ff7b72;
    --terminal-border: #30363d;
    --terminal-accent: #a5a5f5;
    --terminal-muted: #8b949e;
  }
}
```

### 2.2 交互功能

#### 支持的命令

```bash
/help                   # 显示帮助信息
latest                  # 获取最新 AI 资讯
search <keyword>        # 搜索特定关键词
categories              # 显示新闻分类
/trending               # 显示新闻趋势
deepdive                # 进行深度分析
history                 # 显示命令历史
clear                   # 清屏
status                  # 显示 Agent 状态
config                  # 配置设置
```

#### 特殊功能

- 命令自动补全
- 上下箭头浏览历史命令
- Ctrl+C 中断当前操作
- 支持多行输入
- 实时状态更新

### 2.3 主题适配实现

#### 主题检测和切换

```typescript
// hooks/useTheme.ts
import { useEffect, useState } from "react";
import { useTheme } from "@/app/providers";

export function useTerminalTheme() {
  const { theme } = useTheme();
  const [terminalTheme, setTerminalTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // 根据整站主题自动切换终端主题
    if (theme === "dark") {
      setTerminalTheme("dark");
      document.documentElement.setAttribute("data-terminal-theme", "dark");
    } else if (theme === "light") {
      setTerminalTheme("light");
      document.documentElement.setAttribute("data-terminal-theme", "light");
    } else {
      // 系统主题
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTerminalTheme(isDarkMode ? "dark" : "light");
      document.documentElement.setAttribute(
        "data-terminal-theme",
        isDarkMode ? "dark" : "light",
      );
    }
  }, [theme]);

  return terminalTheme;
}
```

#### 终端组件主题适配

```typescript
// components/Terminal.tsx
import { useTerminalTheme } from '@/hooks/useTheme'

export default function Terminal() {
  const terminalTheme = useTerminalTheme()

  return (
    <div
      className={`terminal-container ${terminalTheme}`}
      style={{
        backgroundColor: 'var(--terminal-bg)',
        color: 'var(--terminal-text)',
        borderColor: 'var(--terminal-border)'
      }}
    >
      {/* 终端内容 */}
    </div>
  )
}
```

#### CSS 变量动态切换

```css
/* 终端主题样式 */
.terminal-container {
  background-color: var(--terminal-bg);
  color: var(--terminal-text);
  border: 1px solid var(--terminal-border);
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

.terminal-container.light {
  /* 浅色主题特定样式 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.terminal-container.dark {
  /* 深色主题特定样式 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 命令提示符样式 */
.command-prompt {
  color: var(--terminal-accent);
}

.command-output.success {
  color: var(--terminal-green);
}

.command-output.error {
  color: var(--terminal-red);
}

.command-output.info {
  color: var(--terminal-blue);
}

.command-output.warning {
  color: var(--terminal-yellow);
}

.command-output.muted {
  color: var(--terminal-muted);
}
```

### 2.4 响应式设计

#### 桌面端 (≥1024px)

- 全屏终端界面
- 侧边栏显示快捷命令
- 多窗口支持

#### 平板端 (768px-1023px)

- 适配触摸操作
- 虚拟键盘友好
- 简化侧边栏

#### 移动端 (≤767px)

- 全屏模式
- 触摸优化的输入框
- 滑动手势支持

## 3. 后端技术栈

### 3.1 Python ReAct Agent 核心

#### 技术选型

```python
# 核心框架
fastapi              # Web API 框架
pydantic            # 数据验证和模型定义
uvicorn             # ASGI 服务器

# LLM 集成
google-generativeai # Google Gemini API
# 不使用 langchain，自研 ReAct 实现

# 数据库
psycopg2            # PostgreSQL 驱动
# 不使用 ORM，使用原生 SQL

# 异步和并发
asyncio             # 异步编程
aiohttp             # 异步 HTTP 客户端

# 监控和日志
loguru              # 结构化日志

# 工具和实用
python-dotenv       # 环境变量管理
```

**设计理念**：
- 轻量级依赖，避免过度抽象
- 自研 ReAct 实现，完全可控
- 原生 SQL，性能更好
- 异步优先，提升并发能力

#### 项目结构

```
agent-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 应用入口
│   ├── config.py               # 配置管理
│   ├── core/                   # 核心组件
│   │   ├── __init__.py
│   │   ├── react_agent.py      # ReAct Agent 执行器
│   │   ├── task_planner.py     # 任务规划器
│   │   ├── tool_orchestrator.py # 工具编排器
│   │   ├── tool_registry.py    # 工具注册表
│   │   ├── conversation_memory.py # 会话记忆管理
│   │   └── plugin_manager.py   # 插件管理器
│   ├── models/                 # 数据模型
│   │   ├── __init__.py
│   │   ├── react.py            # ReAct 相关模型
│   │   ├── tool.py             # 工具模型
│   │   └── base.py             # 基础模型
│   ├── services/               # 服务层
│   │   ├── __init__.py
│   │   ├── llm_service.py      # LLM 服务抽象
│   │   └── news_collector.py  # 新闻收集服务
│   ├── plugins/                # 插件
│   │   ├── __init__.py
│   │   └── news_plugin.py      # 新闻插件
│   ├── prompts/                # LLM 提示词
│   │   ├── __init__.py
│   │   └── react_prompts.py    # ReAct 提示词模板
│   ├── api/routes/             # API 路由
│   │   ├── __init__.py
│   │   └── agent.py            # Agent API 端点
│   ├── tasks/                  # 后台任务
│   │   ├── __init__.py
│   │   └── cleanup_sessions.py # 会话清理任务
│   └── utils/                  # 工具函数
│       ├── __init__.py
│       ├── search_utils.py     # 搜索工具
│       ├── rss_utils.py        # RSS 工具
│       └── text_utils.py       # 文本处理工具
├── tests/                      # 测试
│   ├── integration/            # 集成测试
│   └── test_*.py               # 单元测试
├── docker/                     # Docker 配置
│   ├── Dockerfile.dev          # 开发环境镜像
│   ├── docker-compose.dev.yml  # Docker Compose 配置
│   └── backend.sh              # 后端管理脚本
├── scripts/                    # 工具脚本
│   ├── test_llm_setup.py       # LLM 配置测试
│   └── quick_install.sh        # 快速安装脚本
├── requirements.txt            # Python 依赖
├── README.md                   # 文档
├── DESIGN.md                   # 设计文档
└── GUIDE.md                    # 开发指南
```

### 3.2 Next.js API 包装层

#### API 路由设计

```typescript
// app/api/agent/chat/route.ts
export async function POST(request: NextRequest) {
  // 转发聊天请求到 Python Agent
  // 处理流式响应
  // 错误处理和重试逻辑
}

// app/api/agent/news/route.ts
export async function GET(request: NextRequest) {
  // 获取新闻数据
  // 缓存处理
  // 数据格式化
}

// app/api/agent/status/route.ts
export async function GET() {
  // 检查 Agent 服务状态
  // 返回系统信息
}
```

#### WebSocket 支持

```typescript
// lib/websocket-server.ts
import { Server } from "socket.io";

export function initWebSocketServer() {
  // 初始化 WebSocket 服务器
  // 处理实时通信
  // 连接管理
}
```

## 4. 信息源设计

### 4.1 数据源分类

#### 技术新闻源

```python
TECH_NEWS_SOURCES = {
    'techcrunch': {
        'url': 'https://techcrunch.com/category/artificial-intelligence/',
        'selector': '.post-block',
        'fields': ['title', 'summary', 'url', 'publish_time']
    },
    'venturebeat': {
        'url': 'https://venturebeat.com/ai/',
        'selector': '.ArticleListing',
        'fields': ['title', 'summary', 'url', 'publish_time']
    },
    'mit_tech_review': {
        'url': 'https://www.technologyreview.com/topic/artificial-intelligence/',
        'selector': '.teaserItem',
        'fields': ['title', 'summary', 'url', 'publish_time']
    }
}
```

#### 学术资源

```python
ACADEMIC_SOURCES = {
    'arxiv': {
        'url': 'https://arxiv.org/list/cs.AI/recent',
        'api': 'http://export.arxiv.org/api/query',
        'fields': ['title', 'authors', 'abstract', 'url', 'publish_date']
    },
    'papers_with_code': {
        'url': 'https://paperswithcode.com/latest',
        'selector': '.paper-card',
        'fields': ['title', 'abstract', 'code_url', 'paper_url']
    }
}
```

#### 社交媒体

```python
SOCIAL_SOURCES = {
    'reddit': {
        'subreddits': ['MachineLearning', 'artificial', 'OpenAI'],
        'api': 'https://www.reddit.com/r/{}/hot.json'
    },
    'hacker_news': {
        'url': 'https://hacker-news.firebaseio.com/v0/topstories.json',
        'api': 'https://hacker-news.firebaseio.com/v0/item/{}.json'
    }
}
```

### 4.2 数据处理流程

#### 数据收集

```python
class NewsCollector:
    async def collect_from_source(self, source_config):
        """从单个数据源收集新闻"""
        pass

    async def collect_all_sources(self):
        """并发收集所有数据源"""
        pass

    def deduplicate(self, news_list):
        """去重处理"""
        pass

    def classify_news(self, news_item):
        """新闻分类"""
        pass
```

#### 数据存储

```python
class NewsStorage:
    def save_news(self, news_data):
        """保存新闻到数据库"""
        pass

    def get_latest_news(self, limit=10):
        """获取最新新闻"""
        pass

    def search_news(self, keyword, limit=10):
        """搜索新闻"""
        pass
```

### 4.3 更新策略

#### 定时任务

```python
# 使用 Celery 定时任务
from celery import Celery
from celery.schedules import crontab

app = Celery('agent')

@app.task
def collect_hourly_news():
    """每小时收集新闻"""
    pass

@app.task
def collect_daily_summary():
    """每日新闻摘要"""
    pass

# 定时配置
app.conf.beat_schedule = {
    'collect-news-every-hour': {
        'task': 'collect_hourly_news',
        'schedule': crontab(minute=0),
    },
    'daily-summary': {
        'task': 'collect_daily_summary',
        'schedule': crontab(hour=8, minute=0),
    },
}
```

## 5. ReAct Agent 交互设计

### 5.1 ReAct 执行流程

#### ReactAgent 核心逻辑

```python
class ReactAgent:
    def __init__(self):
        self.task_planner = TaskPlanner()
        self.tool_orchestrator = ToolOrchestrator()
        self.conversation_memory = ConversationMemory()
        self.llm_service = LLMService()
        self.max_iterations = 5
    
    async def execute(
        self, 
        query: str, 
        session_id: str,
        context: Optional[Dict] = None
    ) -> ReactResponse:
        """执行用户查询，使用 ReAct 循环"""
        
        # 1. 加载会话历史
        history = await self.conversation_memory.get_history(session_id)
        
        # 2. 创建执行计划
        plan = await self.task_planner.create_plan(query, history, context)
        
        # 3. 执行 ReAct 循环
        steps = await self._react_loop(query, plan, context)
        
        # 4. 合成最终响应
        response = await self._synthesize_response(query, steps, plan)
        
        # 5. 质量评估
        evaluation = await self._evaluate_quality(query, response, steps)
        
        # 6. 保存到会话历史
        await self.conversation_memory.save_interaction(
            session_id, query, response, steps, evaluation
        )
        
        return ReactResponse(
            success=True,
            response=response,
            steps=steps,
            plan=plan,
            evaluation=evaluation,
            session_id=session_id
        )
    
    async def _react_loop(
        self, 
        query: str, 
        plan: ExecutionPlan,
        context: Dict
    ) -> List[ReActStep]:
        """执行 ReAct 循环（最多 5 次迭代）"""
        steps = []
        
        for iteration in range(1, self.max_iterations + 1):
            # 执行单次迭代
            step = await self._react_iteration(
                query, plan, steps, context, iteration
            )
            steps.append(step)
            
            # 判断是否继续
            if self._should_terminate(steps, plan):
                break
        
        return steps
    
    async def _react_iteration(
        self,
        query: str,
        plan: ExecutionPlan,
        history: List[ReActStep],
        context: Dict,
        iteration: int
    ) -> ReActStep:
        """执行单次 ReAct 迭代"""
        
        # 1. Thought: LLM 生成推理
        thought = await self.llm_service.generate_thought(
            query, plan, history, context
        )
        
        # 2. Action: 选择工具和参数
        action = await self.llm_service.select_action(
            thought, self.tool_orchestrator.get_available_tools()
        )
        
        # 3. Execute: 执行工具
        observation = await self.tool_orchestrator.execute_tool(action)
        
        # 4. Record: 记录步骤
        return ReActStep(
            step_number=iteration,
            thought=thought,
            action=action,
            observation=observation,
            status="completed" if observation.success else "failed",
            timestamp=datetime.now()
        )
```

#### 任务规划

```python
class TaskPlanner:
    async def create_plan(
        self,
        query: str,
        conversation_history: List[ConversationTurn],
        context: Dict
    ) -> ExecutionPlan:
        """创建执行计划"""
        
        # 1. 分析查询复杂度
        complexity = self._classify_complexity(query)
        
        # 2. 分解为子任务
        steps = await self._decompose_query(query, complexity, context)
        
        # 3. 估计迭代次数
        estimated_iterations = self._estimate_iterations(complexity, steps)
        
        return ExecutionPlan(
            query=query,
            complexity=complexity,
            steps=steps,
            estimated_iterations=estimated_iterations,
            created_at=datetime.now()
        )
    
    def _classify_complexity(self, query: str) -> str:
        """分类查询复杂度"""
        # 简单：单一工具调用
        # 中等：2-3 个工具调用
        # 复杂：3+ 个工具调用或复杂推理
        pass
```

### 5.2 会话记忆管理

#### ConversationMemory 实现

```python
class ConversationMemory:
    def __init__(self, db_connection):
        self.db = db_connection
    
    async def get_history(
        self,
        session_id: str,
        limit: int = 10
    ) -> List[ConversationTurn]:
        """检索对话历史"""
        
        # 查询最近 N 条对话
        query = """
            SELECT * FROM agent_conversations
            WHERE session_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        """
        rows = await self.db.fetch(query, session_id, limit)
        
        # 如果对话过长，生成摘要
        if len(rows) >= limit:
            summary = await self.get_context_summary(session_id)
            return [summary] + rows[:limit-1]
        
        return rows
    
    async def save_interaction(
        self,
        session_id: str,
        query: str,
        response: str,
        steps: List[ReActStep],
        evaluation: QualityEvaluation,
        user_id: Optional[str] = None
    ) -> bool:
        """保存对话轮次"""
        
        query_sql = """
            INSERT INTO agent_conversations 
            (session_id, user_query, agent_response, steps, evaluation, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
        """
        
        await self.db.execute(
            query_sql,
            session_id,
            query,
            response,
            json.dumps([step.to_dict() for step in steps]),
            json.dumps(evaluation.to_dict()),
            user_id
        )
        
        # 更新会话最后活动时间
        await self._update_session_activity(session_id)
        
        return True
    
    async def get_context_summary(self, session_id: str) -> str:
        """获取长对话的压缩摘要"""
        
        # 获取所有对话
        all_conversations = await self._get_all_conversations(session_id)
        
        # 使用 LLM 生成摘要
        summary = await self.llm_service.generate_summary(all_conversations)
        
        # 缓存摘要
        await self._cache_summary(session_id, summary)
        
        return summary
    
    async def cleanup_expired_sessions(self, hours: int = 24) -> int:
        """清理过期会话"""
        
        query = """
            DELETE FROM agent_sessions
            WHERE last_active < NOW() - INTERVAL '$1 hours'
        """
        
        result = await self.db.execute(query, hours)
        return result.rowcount
```

### 5.3 工具编排系统

#### ToolOrchestrator 实现

```python
class ToolOrchestrator:
    def __init__(self):
        self.tool_registry = ToolRegistry()
        self.cache = {}  # 工具结果缓存
        self.cache_ttl = 300  # 5 分钟
    
    async def execute_tool(
        self,
        tool_call: ToolCall,
        context: Dict = None,
        use_cache: bool = True
    ) -> ToolResult:
        """执行单个工具"""
        
        # 1. 检查缓存
        if use_cache:
            cached_result = self._get_cached_result(tool_call)
            if cached_result:
                return cached_result
        
        # 2. 获取工具定义
        tool = self.tool_registry.get_tool(tool_call.tool_name)
        if not tool:
            return ToolResult(
                success=False,
                error=f"Tool {tool_call.tool_name} not found"
            )
        
        # 3. 验证参数
        validation_error = self._validate_parameters(tool, tool_call.parameters)
        if validation_error:
            return ToolResult(success=False, error=validation_error)
        
        # 4. 执行工具
        try:
            result = await tool.execute(tool_call.parameters, context)
            
            # 5. 缓存结果
            if use_cache and result.success:
                self._cache_result(tool_call, result)
            
            return result
        except Exception as e:
            logger.error(f"Tool execution failed: {e}")
            return ToolResult(success=False, error=str(e))
    
    async def execute_chain(
        self,
        tools: List[ToolCall],
        context: Dict = None
    ) -> List[ToolResult]:
        """执行工具链"""
        
        results = []
        execution_context = context or {}
        
        for i, tool_call in enumerate(tools):
            # 解析参数引用（如 ${step1.result}）
            resolved_params = self.resolve_parameters(
                tool_call.parameters,
                results
            )
            
            # 执行工具
            result = await self.execute_tool(
                ToolCall(
                    tool_name=tool_call.tool_name,
                    parameters=resolved_params
                ),
                execution_context
            )
            
            results.append(result)
            
            # 如果必需工具失败，终止执行
            if not result.success and tool_call.required:
                break
        
        return results
    
    def resolve_parameters(
        self,
        parameters: Dict[str, Any],
        previous_results: List[ToolResult]
    ) -> Dict[str, Any]:
        """解析参数引用"""
        
        resolved = {}
        for key, value in parameters.items():
            if isinstance(value, str) and value.startswith('${'):
                # 提取引用：${step1.result} → step=1, field=result
                step_num, field = self._parse_reference(value)
                if step_num <= len(previous_results):
                    resolved[key] = previous_results[step_num-1].data.get(field)
                else:
                    resolved[key] = value
            else:
                resolved[key] = value
        
        return resolved
```

## 6. 性能优化

### 6.1 缓存策略

#### Redis 缓存

```python
class CacheService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host='localhost',
            port=6379,
            decode_responses=True
        )

    def cache_news(self, key: str, news_data: dict, ttl: int = 3600):
        """缓存新闻数据"""
        pass

    def get_cached_news(self, key: str) -> dict:
        """获取缓存的新闻"""
        pass
```

#### 前端缓存

```typescript
// 使用 SWR 进行数据缓存
import useSWR from "swr";

export function useNews() {
  const { data, error } = useSWR("/api/agent/news", fetcher, {
    refreshInterval: 300000, // 5分钟刷新一次
    revalidateOnFocus: false,
  });

  return { news: data, isLoading: !error && !data, error };
}
```

### 6.2 并发处理

#### 异步数据收集

```python
import asyncio
import aiohttp

class AsyncNewsCollector:
    async def collect_concurrent(self, sources: List[str]):
        """并发收集多个数据源"""
        async with aiohttp.ClientSession() as session:
            tasks = [
                self.collect_from_source(session, source)
                for source in sources
            ]
            results = await asyncio.gather(*tasks)
        return results
```

## 7. 监控和日志

### 7.1 系统监控

#### 性能指标

```python
from prometheus_client import Counter, Histogram, Gauge

# 定义监控指标
REQUEST_COUNT = Counter('agent_requests_total', 'Total requests')
REQUEST_DURATION = Histogram('agent_request_duration_seconds', 'Request duration')
ACTIVE_CONNECTIONS = Gauge('agent_active_connections', 'Active WebSocket connections')
NEWS_COUNT = Gauge('agent_news_count', 'Total news count')
```

#### 健康检查

```python
@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "database": await check_database(),
            "redis": await check_redis(),
            "news_sources": await check_news_sources()
        }
    }
```

### 7.2 日志系统

#### 结构化日志

```python
from loguru import logger

logger.add(
    "logs/agent.log",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}",
    level="INFO",
    rotation="1 day",
    retention="30 days"
)

# 使用示例
logger.info("Collecting news from {source}", source=source_name)
logger.error("Failed to fetch news: {error}", error=str(e))
```

## 8. 部署方案

### 8.1 Docker 混合模式部署

#### 开发环境架构

```
┌─────────────────────────────────────────────────────────┐
│ 开发环境                                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Next.js      │  │ Python       │  │ PostgreSQL   │ │
│  │ Frontend     │  │ Backend      │  │ Database     │ │
│  │ (本地)       │  │ (Docker)     │  │ (Docker)     │ │
│  │ :3000        │  │ :8000        │  │ :5432        │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
│                    localhost 网络                        │
└─────────────────────────────────────────────────────────┘
```

#### Docker Compose 配置

```yaml
version: "3.8"

services:
  agent-backend:
    build:
      context: ./agent-backend
      dockerfile: docker/Dockerfile.dev
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/agent_db
      - LLM_PROVIDER=google
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - DEBUG=true
    volumes:
      - ./agent-backend:/app
    depends_on:
      - postgres
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

  postgres:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=agent_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
```

#### 一键启动脚本

```bash
#!/bin/bash
# scripts/startup/full-stack.sh

case "$1" in
  start)
    echo "🚀 Starting full-stack development environment..."
    
    # 1. 启动 Docker 服务
    cd agent-backend/docker
    docker-compose -f docker-compose.dev.yml up -d
    
    # 2. 等待数据库就绪
    echo "⏳ Waiting for database..."
    sleep 5
    
    # 3. 运行数据库迁移
    cd ../../
    npm run db:setup
    
    # 4. 启动前端
    echo "🎨 Starting frontend..."
    npm run dev
    ;;
    
  stop)
    echo "🛑 Stopping full-stack environment..."
    cd agent-backend/docker
    docker-compose -f docker-compose.dev.yml down
    ;;
    
  status)
    echo "📊 Checking service status..."
    cd agent-backend/docker
    docker-compose -f docker-compose.dev.yml ps
    ;;
    
  *)
    echo "Usage: $0 {start|stop|status}"
    exit 1
    ;;
esac
```

### 8.2 生产环境部署

#### Vercel 部署架构

```
┌─────────────────────────────────────────────────────────┐
│ 生产环境 (Vercel)                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Next.js      │  │ Python       │  │ Vercel       │ │
│  │ Frontend     │  │ Serverless   │  │ Postgres     │ │
│  │ (CDN)        │  │ Functions    │  │ (256MB)      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
│                    Vercel 网络                           │
└─────────────────────────────────────────────────────────┘
```

#### Vercel 配置

```json
{
  "version": 2,
  "builds": [
    {
      "src": "agent-backend/api/index.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/agent/(.*)",
      "dest": "agent-backend/api/index.py"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "GOOGLE_API_KEY": "@google_api_key",
    "LLM_PROVIDER": "google"
  }
}
```

### 8.3 CI/CD 流程

#### 自动部署流程

```
Git Push → GitHub → Vercel 自动部署
    ↓
1. 检测代码变更
2. 运行测试
3. 构建前端和后端
4. 部署到 Vercel
5. 运行数据库迁移
6. 健康检查
7. 部署完成
```

**部署优势**：
- 零配置部署
- 自动扩展
- 全球 CDN
- 免费 SSL
- 自动回滚

## 9. 安全考虑

### 9.1 API 安全

#### 认证授权

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """验证 JWT Token"""
    try:
        # Token 验证逻辑
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
```

#### 请求限制

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/news")
@limiter.limit("10/minute")
async def get_news(request: Request):
    """限制每分钟10次请求"""
    pass
```

### 9.2 数据安全

#### 敏感信息处理

```python
import os
from cryptography.fernet import Fernet

class SecurityManager:
    def __init__(self):
        self.cipher = Fernet(os.environ.get('ENCRYPTION_KEY'))

    def encrypt_data(self, data: str) -> str:
        """加密敏感数据"""
        return self.cipher.encrypt(data.encode()).decode()

    def decrypt_data(self, encrypted_data: str) -> str:
        """解密数据"""
        return self.cipher.decrypt(encrypted_data.encode()).decode()
```

## 10. 测试策略

### 10.1 单元测试

#### Python 后端测试

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.react_agent import ReactAgent
from app.core.task_planner import TaskPlanner
from app.models.react import ReActStep, ExecutionPlan

client = TestClient(app)

def test_agent_execute_endpoint():
    """测试 Agent 执行端点"""
    response = client.post(
        "/api/agent/execute",
        json={
            "input": "最近有什么 AI 新闻？",
            "session_id": "test_session"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "response" in data
    assert "steps" in data
    assert len(data["steps"]) > 0

@pytest.mark.asyncio
async def test_react_agent_execution():
    """测试 ReAct Agent 执行"""
    agent = ReactAgent()
    response = await agent.execute(
        query="获取最新 AI 新闻",
        session_id="test_session"
    )
    
    assert response.success is True
    assert len(response.steps) > 0
    assert response.steps[0].thought is not None
    assert response.steps[0].action is not None
    assert response.steps[0].observation is not None

@pytest.mark.asyncio
async def test_task_planner():
    """测试任务规划器"""
    planner = TaskPlanner()
    
    # 简单查询
    plan = await planner.create_plan("最新新闻", [], {})
    assert plan.complexity == "simple"
    assert plan.estimated_iterations == 1
    
    # 复杂查询
    plan = await planner.create_plan(
        "分析最近 OpenAI 和 Anthropic 的技术进展并对比",
        [],
        {}
    )
    assert plan.complexity == "complex"
    assert plan.estimated_iterations >= 3

@pytest.mark.asyncio
async def test_conversation_memory():
    """测试会话记忆"""
    memory = ConversationMemory()
    session_id = "test_session_123"
    
    # 保存对话
    await memory.save_interaction(
        session_id=session_id,
        query="测试查询",
        response="测试响应",
        steps=[],
        evaluation={}
    )
    
    # 检索历史
    history = await memory.get_history(session_id, limit=10)
    assert len(history) > 0
    assert history[0].user_query == "测试查询"

@pytest.mark.asyncio
async def test_tool_orchestrator():
    """测试工具编排器"""
    orchestrator = ToolOrchestrator()
    
    # 执行单个工具
    result = await orchestrator.execute_tool(
        ToolCall(
            tool_name="get_latest_news",
            parameters={"count": 5}
        )
    )
    assert result.success is True
    assert result.data is not None
    
    # 测试缓存
    result2 = await orchestrator.execute_tool(
        ToolCall(
            tool_name="get_latest_news",
            parameters={"count": 5}
        )
    )
    assert result2.success is True
    # 应该从缓存返回
```

#### 前端组件测试

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AgentTerminal from '@/app/agent/components/AgentTerminal'
import StepVisualization from '@/app/agent/components/StepVisualization'

describe('AgentTerminal Component', () => {
  it('renders terminal interface', () => {
    render(<AgentTerminal />)
    expect(screen.getByText(/user@agent/)).toBeInTheDocument()
  })

  it('handles query submission', async () => {
    const user = userEvent.setup()
    render(<AgentTerminal />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, '最近有什么 AI 新闻？')
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(screen.getByText(/思考中/)).toBeInTheDocument()
    })
  })

  it('displays ReAct steps', async () => {
    const mockSteps = [
      {
        step_number: 1,
        thought: '需要获取最新新闻',
        action: { tool_name: 'get_latest_news' },
        observation: { success: true, data: '...' },
        status: 'completed'
      }
    ]
    
    render(<StepVisualization steps={mockSteps} />)
    expect(screen.getByText('需要获取最新新闻')).toBeInTheDocument()
  })
})
```

### 10.2 集成测试

#### ReAct 循环集成测试

```python
@pytest.mark.asyncio
async def test_react_loop_integration():
    """测试完整的 ReAct 循环"""
    agent = ReactAgent()
    
    # 执行复杂查询
    response = await agent.execute(
        query="分析最近 OpenAI 的技术进展",
        session_id="integration_test"
    )
    
    # 验证响应结构
    assert response.success is True
    assert len(response.steps) >= 2  # 至少 2 次迭代
    
    # 验证每个步骤
    for step in response.steps:
        assert step.thought is not None
        assert step.action is not None
        assert step.observation is not None
        assert step.status in ["completed", "failed"]
    
    # 验证最终响应
    assert response.response is not None
    assert len(response.response) > 0
    
    # 验证质量评估
    assert response.evaluation is not None
    assert response.evaluation.completeness_score > 0
    assert response.evaluation.quality_score > 0

@pytest.mark.asyncio
async def test_conversation_memory_integration():
    """测试会话记忆集成"""
    agent = ReactAgent()
    session_id = "memory_test"
    
    # 第一轮对话
    response1 = await agent.execute(
        query="OpenAI 最近有什么新闻？",
        session_id=session_id
    )
    assert response1.success is True
    
    # 第二轮对话（依赖上下文）
    response2 = await agent.execute(
        query="详细分析一下",
        session_id=session_id
    )
    assert response2.success is True
    
    # 验证会话历史
    memory = ConversationMemory()
    history = await memory.get_history(session_id)
    assert len(history) >= 2

@pytest.mark.asyncio
async def test_backward_compatibility():
    """测试向后兼容性"""
    # 测试旧版 API 格式
    response = client.post(
        "/api/agent/chat",
        json={"message": "latest news"}
    )
    assert response.status_code == 200
    
    # 验证返回格式兼容
    data = response.json()
    assert "response" in data
```

### 10.3 性能测试

```python
import time
import asyncio

@pytest.mark.asyncio
async def test_response_time():
    """测试响应时间"""
    agent = ReactAgent()
    
    # 简单查询应该 < 2 秒
    start = time.time()
    response = await agent.execute(
        query="最新新闻",
        session_id="perf_test"
    )
    duration = time.time() - start
    
    assert response.success is True
    assert duration < 2.0
    
    # 复杂查询应该 < 10 秒
    start = time.time()
    response = await agent.execute(
        query="分析最近 OpenAI 和 Anthropic 的技术进展并对比",
        session_id="perf_test"
    )
    duration = time.time() - start
    
    assert response.success is True
    assert duration < 10.0

@pytest.mark.asyncio
async def test_concurrent_requests():
    """测试并发请求"""
    agent = ReactAgent()
    
    # 10 个并发请求
    tasks = [
        agent.execute(
            query=f"查询 {i}",
            session_id=f"concurrent_{i}"
        )
        for i in range(10)
    ]
    
    start = time.time()
    responses = await asyncio.gather(*tasks)
    duration = time.time() - start
    
    # 所有请求都应该成功
    assert all(r.success for r in responses)
    
    # 并发处理应该比串行快
    assert duration < 20.0  # 10 个请求，每个 < 2 秒
```

## 11. 项目时间线

### Phase 1: 基础架构 (Week 1-2) ✅ 已完成

- [x] 创建 Agent 页面路由和基础组件
- [x] 设计终端界面 UI（AgentTerminal）
- [x] 搭建 Python FastAPI 后端框架
- [x] 配置 PostgreSQL 数据库

### Phase 2: ReAct 核心实现 (Week 3-4) ✅ 已完成

- [x] 实现 ReactAgent 执行器
- [x] 实现 TaskPlanner 任务规划器
- [x] 实现 ToolOrchestrator 工具编排器
- [x] 实现 ConversationMemory 会话记忆
- [x] 集成 Google Gemini 2.0 Flash

### Phase 3: 工具和插件 (Week 5-6) ✅ 已完成

- [x] 实现 ToolRegistry 工具注册表
- [x] 开发新闻插件（3 个核心工具）
- [x] 实现工具结果缓存
- [x] 实现参数引用解析

### Phase 4: 前端集成 (Week 7-8) ✅ 已完成

- [x] 实现 StepVisualization 步骤可视化
- [x] 实现实时状态更新
- [x] 集成前后端 API
- [x] 实现错误处理和重试

### Phase 5: 测试和优化 (Week 9-10) ✅ 已完成

- [x] 编写单元测试（> 80% 覆盖率）
- [x] 编写集成测试
- [x] 性能优化（响应时间 < 10s）
- [x] 成本优化（月成本 < $5）

### Phase 6: 部署上线 (Week 11-12) ✅ 已完成

- [x] Docker 混合模式部署
- [x] 一键启动脚本
- [x] 数据库迁移脚本
- [x] 生产环境部署（Vercel）

### Phase 7: 文档和维护 (Week 13+) 🔄 进行中

- [x] 编写 README.md
- [x] 编写 DESIGN.md
- [x] 编写面试指南
- [x] 编写模块设计文档
- [ ] 监控和日志系统
- [ ] 用户反馈收集
- [ ] 持续优化和改进

## 12. 预期效果与成果

### 用户体验

- ✅ 提供直观的终端界面，符合开发者习惯
- ✅ 实时显示 ReAct 推理过程，透明可追溯
- ✅ 支持复杂任务的多步推理和执行
- ✅ 响应速度快（简单查询 < 2s，复杂查询 < 10s）
- ✅ 支持会话记忆，多轮对话理解上下文

### 技术价值

- ✅ **ReAct 框架实现**：完整的多步推理循环
- ✅ **任务规划能力**：自动分解复杂查询
- ✅ **工具编排系统**：支持工具链和参数引用
- ✅ **会话记忆管理**：PostgreSQL 持久化存储
- ✅ **质量评估反思**：自我评估和改进
- ✅ **成本优化**：月成本 < $5（Gemini 2.0 Flash）
- ✅ **可扩展架构**：插件化设计，易于添加新工具

### 量化成果

| 指标 | 目标 | 实际 | 状态 |
|------|------|------|------|
| 响应时间（简单） | < 2s | < 2s | ✅ |
| 响应时间（复杂） | < 10s | < 10s | ✅ |
| 最大迭代次数 | 5 | 5 | ✅ |
| 会话记忆 | 10 条 | 10 条 | ✅ |
| 测试覆盖率 | > 80% | > 80% | ✅ |
| 月度成本 | < $5 | $2-3 | ✅ |
| 并发会话 | 100+ | 100+ | ✅ |

### 技术亮点

1. **完整的 ReAct 实现**：不依赖 LangChain，自研实现，完全可控
2. **智能任务规划**：自动分析复杂度，分解为可执行步骤
3. **工具编排系统**：支持工具链、参数引用、结果缓存
4. **会话记忆管理**：持久化存储，自动摘要，智能压缩
5. **成本优化**：Gemini 2.0 Flash，月成本仅 $2-3
6. **向后兼容**：支持旧版 API，平滑迁移

### 商业价值

- ✅ 提升个人品牌影响力（展示 AI Agent 开发能力）
- ✅ 展示技术实力和创新能力（ReAct 框架实现）
- ✅ 为后续项目积累技术经验（多步推理、工具编排）
- ✅ 建立技术社区影响力（开源文档和设计）

### 未来展望

**短期（1-2 个月）**：
- 流式响应（SSE）
- 更多工具（代码分析、文档搜索）
- 监控和日志系统

**中期（3-6 个月）**：
- 多 Agent 协作
- 知识图谱
- 个性化推荐
- 自主学习

**长期（6-12 个月）**：
- 多模态处理
- 移动端适配
- 开放 API
- Agent 市场

---

_本设计方案为 ReAct Agent 模块的完整技术规划，涵盖了从前端界面到后端架构的完整解决方案。项目已成功实现并部署，所有核心功能均已完成。_

**版本**: 3.0.0 (ReAct Agent)  
**状态**: ✅ 生产就绪  
**最后更新**: 2024-12-18
