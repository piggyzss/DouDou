# ReAct Agent Backend

基于 FastAPI 的智能 ReAct (Reasoning + Acting) Agent 后端服务，采用插件化架构设计，支持多步推理、任务规划、工具编排和会话记忆。

---

## 📋 目录

- [系统概述](#-系统概述)
- [核心特性](#-核心特性)
- [架构设计](#-架构设计)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [API 端点](#-api端点)
- [ReAct 工作流程](#-react工作流程)
- [核心组件](#-核心组件)
- [数据模型](#-数据模型)
- [开发指南](#-开发指南)
- [故障排除](#-故障排除)

---

## 🎯 系统概述

ReAct Agent 是一个完整的智能 Agent 系统，实现了 ReAct (Reasoning + Acting) 框架，能够：

- **自主推理**：通过多步思考分析复杂问题
- **智能行动**：自动选择和执行合适的工具
- **持续学习**：从执行历史中学习和改进
- **会话记忆**：维护跨轮次的对话上下文
- **任务规划**：将复杂查询分解为可执行步骤
- **质量评估**：自我反思和输出质量评估
- **双模式支持**：同时支持命令模式和自然语言模式

### 双模式交互

系统支持两种输入模式，为用户提供灵活的交互方式：

**1. 命令模式（快速精确）**
- 传统命令式输入：`/latest`, `/trending`, `deepdive`
- 快速响应（< 2 秒）
- 精确控制
- 向后兼容旧版 API

**2. 自然语言模式（智能灵活）**
- 自然对话：`"我想了解最近的 Gemini 发展情况"`
- 多步推理（最多 5 次迭代）
- 智能工具选择
- 上下文理解

### 与传统 Agent 的区别

| 特性 | 传统 Agent | ReAct Agent |
|------|-----------|-------------|
| 执行模式 | 单次工具调用 | 多步推理循环 |
| 任务处理 | 简单命令映射 | 复杂任务分解 |
| 上下文管理 | 无状态 | 会话记忆 |
| 错误处理 | 直接失败 | 自适应调整 |
| 输出质量 | 无评估 | 自我反思 |

---

## ✨ 核心特性

### 1. ReAct 推理循环

```
用户查询 → 思考 (Thought) → 行动 (Action) → 观察 (Observation) → 反思 → 继续/完成
```

- 最多 5 次迭代
- 每次迭代包含完整的思考-行动-观察循环
- 自动判断任务完成条件

### 2. 智能任务规划

- **复杂度分类**：自动识别查询复杂度（简单/中等/复杂）
- **任务分解**：将复杂查询分解为多个子任务
- **依赖管理**：处理任务间的依赖关系
- **动态调整**：根据执行结果调整计划

### 3. 会话记忆管理

- **持久化存储**：PostgreSQL 数据库存储对话历史
- **上下文压缩**：长对话自动摘要
- **会话隔离**：多用户会话独立管理
- **自动清理**：过期会话自动清理

### 4. 工具编排

- **工具链执行**：支持多工具顺序执行
- **参数解析**：自动解析工具间的参数引用
- **结果缓存**：避免重复执行相同工具
- **错误恢复**：工具失败时的重试和降级策略

### 5. 质量评估与反思

- **完整性评分**：评估响应是否完整回答问题
- **质量评分**：评估响应的准确性和格式
- **缺失信息识别**：识别需要补充的信息
- **改进建议**：提供优化建议

---

## 🏗️ 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ AgentTerminal    │  │ StepVisualization│                │
│  │ Component        │  │ Component        │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/SSE
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /api/agent/execute (POST) - Execute Agent Query      │  │
│  │ /api/agent/stream (GET) - Stream ReAct Steps (SSE)   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Agent Core Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ ReactAgent   │  │ TaskPlanner  │  │ Reflection   │     │
│  │ Executor     │  │              │  │ Engine       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Tool         │  │ Conversation │  │ Tool         │     │
│  │ Orchestrator │  │ Memory       │  │ Registry     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ LLM Service  │  │ PostgreSQL   │  │ Plugin       │     │
│  │ (Gemini)     │  │ Database     │  │ Manager      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 核心工作流程

```
1. 用户输入查询
   ↓
2. ReactAgent.execute()
   ├─ 加载会话历史 (ConversationMemory)
   ├─ 创建执行计划 (TaskPlanner)
   └─ 进入 ReAct 循环
   ↓
3. ReAct 循环迭代 (最多 5 次)
   ├─ Thought: LLM 生成推理
   ├─ Action: 选择工具和参数
   ├─ Execute: ToolOrchestrator 执行工具
   ├─ Observation: 记录执行结果
   └─ Reflect: 判断是否继续
   ↓
4. 任务完成
   ├─ 合成最终响应
   ├─ 评估输出质量
   ├─ 保存到会话历史
   └─ 返回完整响应
```

---

## 📁 项目结构

```
agent-backend/
├── app/
│   ├── core/                    # 核心组件
│   │   ├── react_agent.py       # ReAct Agent 执行器
│   │   ├── task_planner.py      # 任务规划器
│   │   ├── tool_orchestrator.py # 工具编排器
│   │   ├── tool_registry.py     # 工具注册表
│   │   ├── conversation_memory.py # 会话记忆管理
│   │   └── plugin_manager.py    # 插件管理器
│   ├── models/                  # 数据模型
│   │   ├── react.py             # ReAct 相关模型
│   │   ├── tool.py              # 工具模型
│   │   └── base.py              # 基础模型
│   ├── services/                # 服务层
│   │   ├── llm_service.py       # LLM 服务抽象
│   │   └── news_collector.py   # 新闻收集服务
│   ├── plugins/                 # 插件
│   │   └── news_plugin.py       # 新闻插件
│   ├── prompts/                 # LLM 提示词
│   │   └── react_prompts.py     # ReAct 提示词模板
│   ├── api/routes/              # API 路由
│   │   └── agent.py             # Agent API 端点
│   ├── tasks/                   # 后台任务
│   │   └── cleanup_sessions.py  # 会话清理任务
│   ├── config.py                # 配置管理
│   └── main.py                  # 应用入口
├── tests/                       # 测试
│   ├── integration/             # 集成测试
│   └── test_*.py                # 单元测试
├── docker/                      # Docker 配置
│   ├── Dockerfile.dev           # 开发环境镜像
│   ├── docker-compose.dev.yml   # Docker Compose 配置
│   └── backend.sh               # 后端管理脚本
├── scripts/                     # 工具脚本
│   ├── test_llm_setup.py        # LLM 配置测试
│   └── quick_install.sh         # 快速安装脚本
├── requirements.txt             # Python 依赖
├── README.md                    # 本文档
├── DESIGN.md                    # 设计文档
└── GUIDE.md                     # 开发指南
```

---

## 🚀 快速开始

### 方法 1: Docker 混合模式（推荐）

**优势**：解决 Python 依赖问题，保持前端调试便利性

```bash
# 一键启动全栈开发环境
./scripts/startup/full-stack.sh start

# 服务地址：
# - 后端: http://localhost:8000
# - API文档: http://localhost:8000/docs
# - 前端: http://localhost:3000/agent
```

**工作原理**：
- Python 后端运行在 Docker 容器中（自动热重载）
- Next.js 前端运行在本地（保持 Cursor 调试功能）
- PostgreSQL 数据库运行在 Docker 容器中
- 一键启动/停止，环境隔离

### 方法 2: 传统本地开发

```bash
# 1. 安装依赖
cd agent-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和 LLM API

# 3. 初始化数据库
cd ../
npm run db:setup

# 4. 启动服务
cd agent-backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 环境变量配置

创建 `.env` 文件：

```bash
# 基础配置
DEBUG=true
HOST=0.0.0.0
PORT=8000

# LLM 配置
LLM_PROVIDER=google  # google | openai
GOOGLE_API_KEY=your_gemini_api_key_here
GOOGLE_MODEL=gemini-2.0-flash-exp  # 推荐使用 2.0 系列

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Agent 配置
MAX_REACT_ITERATIONS=5
ENABLE_CONVERSATION_MEMORY=true
ENABLE_TASK_PLANNING=true
```

### 访问服务

- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health
- **Agent 页面**: http://localhost:3000/agent（需要前端运行）

---

## 📡 API 端点

### Agent 相关

#### POST /api/agent/execute
执行 Agent 查询（支持命令模式和自然语言模式）

**双模式支持**：
- **命令模式**：传统命令式输入（如 `/latest`）- 快速、精确
- **自然语言模式**：智能对话（如 "我想了解最近的 Gemini 发展情况"）- 灵活、多步推理

**请求体**：
```json
{
  "input": "最近有什么 AI 新闻？",  // 支持命令或自然语言
  "session_id": "optional_session_id",
  "context": {}
}
```

**示例 1 - 命令模式**：
```json
{
  "input": "/latest",
  "session_id": "user_123"
}
```

**示例 2 - 自然语言模式**：
```json
{
  "input": "我想了解最近的 Gemini 发展情况及趋势",
  "session_id": "user_123"
}
```

**响应**：
```json
{
  "success": true,
  "response": "根据最新资讯...",
  "steps": [
    {
      "step_number": 1,
      "thought": "用户想了解最新的 AI 新闻...",
      "action": {
        "tool_name": "get_latest_news",
        "parameters": {"count": 5}
      },
      "observation": {
        "success": true,
        "data": "..."
      },
      "status": "completed"
    }
  ],
  "plan": {
    "complexity": "simple",
    "estimated_iterations": 1
  },
  "evaluation": {
    "completeness_score": 9,
    "quality_score": 8
  },
  "session_id": "session_abc123",
  "execution_time": 2.5
}
```

#### GET /api/agent/tools
获取所有可用工具

**响应**：
```json
{
  "tools": [
    {
      "name": "get_latest_news",
      "description": "获取最新 AI 资讯",
      "parameters": [...]
    }
  ]
}
```

#### GET /api/agent/history/{session_id}
获取会话历史

**响应**：
```json
{
  "session_id": "session_abc123",
  "history": [
    {
      "user_query": "...",
      "agent_response": "...",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### 系统相关

- `GET /` - 服务信息
- `GET /health` - 健康检查（包含 LLM 和数据库状态）

---

## 🔄 ReAct 工作流程

### 完整执行流程

```
用户查询: "分析最近 OpenAI 的技术进展"
    ↓
┌─────────────────────────────────────────────────────────┐
│ 1. 加载会话历史                                          │
│    - 从数据库加载最近 10 条对话                          │
│    - 如果对话过长，生成摘要                              │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. 创建执行计划 (TaskPlanner)                           │
│    - 复杂度: medium                                      │
│    - 步骤 1: 搜索 OpenAI 相关新闻                        │
│    - 步骤 2: 分析技术趋势                                │
│    - 预计迭代: 2 次                                      │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. ReAct 循环 - 迭代 1                                  │
│    Thought: "首先需要获取 OpenAI 的最新新闻..."         │
│    Action: search_news(query="OpenAI", count=10)        │
│    Observation: "找到 10 篇相关新闻..."                  │
│    Status: completed                                     │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. ReAct 循环 - 迭代 2                                  │
│    Thought: "现在需要分析这些新闻的技术趋势..."         │
│    Action: analyze_trends(articles=[...])               │
│    Observation: "识别出 3 个主要技术趋势..."             │
│    Status: completed                                     │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 5. 合成最终响应                                          │
│    - 使用 LLM 从执行历史生成自然语言响应                 │
│    - 包含所有关键信息和分析结果                          │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 6. 质量评估                                              │
│    - 完整性评分: 9/10                                    │
│    - 质量评分: 8/10                                      │
│    - 需要重试: false                                     │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 7. 保存到会话历史                                        │
│    - 存储到 PostgreSQL                                   │
│    - 更新会话摘要                                        │
└─────────────────────────────────────────────────────────┘
    ↓
返回完整响应给用户
```

---

## 🧩 核心组件

### 1. ReactAgent (执行器)

**文件**: `app/core/react_agent.py`

**职责**：
- 协调 ReAct 循环执行
- 管理迭代状态和历史
- 集成任务规划器、工具编排器和反思引擎
- 合成最终响应

**关键方法**：
```python
async def execute(query: str, session_id: str) -> ReactResponse
async def _react_iteration(plan, history) -> ReActStep
async def _synthesize_response(history, plan) -> str
```

### 2. TaskPlanner (任务规划器)

**文件**: `app/core/task_planner.py`

**职责**：
- 分析查询复杂度
- 将复杂查询分解为子任务
- 识别所需工具和执行顺序
- 根据执行反馈调整计划

**关键方法**：
```python
async def create_plan(query: str, history: List) -> ExecutionPlan
async def adjust_plan(plan: ExecutionPlan, observation: str) -> ExecutionPlan
```

### 3. ConversationMemory (会话记忆)

**文件**: `app/core/conversation_memory.py`

**职责**：
- 存储和检索对话历史
- 管理会话生命周期
- 压缩长对话（使用摘要）
- 处理会话过期

**关键方法**：
```python
async def get_history(session_id: str, limit: int) -> List[ConversationTurn]
async def save_interaction(session_id: str, query: str, response: ReactResponse)
async def get_context_summary(session_id: str) -> str
```

### 4. ToolOrchestrator (工具编排器)

**文件**: `app/core/tool_orchestrator.py`

**职责**：
- 执行工具链（处理依赖关系）
- 解析参数引用（如 `${step1.result}`）
- 处理工具失败（重试逻辑）
- 缓存工具结果

**关键方法**：
```python
async def execute_tool(tool_call: ToolCall, context: Dict) -> ToolResult
async def execute_chain(tools: List[ToolCall], context: Dict) -> List[ToolResult]
```

### 5. ToolRegistry (工具注册表)

**文件**: `app/core/tool_registry.py`

**职责**：
- 注册和管理所有可用工具
- 提供工具查询接口
- 将工具格式化为 LLM 可理解的格式

**关键方法**：
```python
def register_tool(tool: ToolDefinition)
def get_tool(tool_name: str) -> ToolDefinition
def format_for_llm() -> str
```

---

## 📊 数据模型

### ReActStep (ReAct 步骤)

```python
@dataclass
class ReActStep:
    step_number: int              # 步骤编号
    thought: str                  # Agent 的思考过程
    action: ToolCall              # 选择的工具调用
    observation: ToolResult       # 工具执行结果
    status: str                   # pending | running | completed | failed
    timestamp: datetime           # 时间戳
```

### ExecutionPlan (执行计划)

```python
@dataclass
class ExecutionPlan:
    query: str                    # 原始查询
    complexity: str               # simple | medium | complex
    steps: List[PlanStep]         # 计划步骤列表
    estimated_iterations: int     # 预计迭代次数
```

### ReactResponse (完整响应)

```python
@dataclass
class ReactResponse:
    success: bool                 # 执行是否成功
    response: str                 # 最终响应内容
    steps: List[ReActStep]        # 执行步骤列表
    plan: ExecutionPlan           # 执行计划
    evaluation: QualityEvaluation # 质量评估
    session_id: str               # 会话 ID
    execution_time: float         # 执行时间（秒）
```

### ConversationTurn (对话轮次)

```python
@dataclass
class ConversationTurn:
    id: int                       # 数据库 ID
    session_id: str               # 会话 ID
    user_query: str               # 用户查询
    agent_response: str           # Agent 响应
    steps: List[Dict]             # 执行步骤（JSON）
    created_at: datetime          # 创建时间
```

---

## 🛠️ 开发指南

### 添加新工具

1. 在插件中定义工具：

```python
# app/plugins/my_plugin.py
from app.models.tool import ToolDefinition, ToolParameter

def get_tools() -> List[ToolDefinition]:
    return [
        ToolDefinition(
            name="my_tool",
            description="我的工具描述",
            command="/mytool",
            parameters=[
                ToolParameter(
                    name="param1",
                    type="string",
                    description="参数描述",
                    required=True
                )
            ],
            plugin_id="my_plugin",
            category="utility"
        )
    ]

async def execute_tool(tool_call: ToolCall) -> ToolResult:
    # 实现工具逻辑
    return ToolResult(
        success=True,
        data="结果",
        tool_name="my_tool"
    )
```

2. 在 PluginManager 中注册插件

### 测试 ReAct Agent

```bash
# 使用 curl 测试
curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input": "分析最近的 AI 技术趋势",
    "session_id": "test_session"
  }'

# 查看会话历史
curl http://localhost:8000/api/agent/history/test_session
```

### 运行测试

```bash
# 运行所有测试
pytest

# 运行特定测试
pytest tests/test_react_agent.py

# 运行集成测试
pytest tests/integration/
```

---

## 🐛 故障排除

### 1. LLM 服务不可用

**现象**：`LLM service not available`

**解决方案**：
- 检查 `GOOGLE_API_KEY` 环境变量
- 确认 `LLM_PROVIDER=google` 在 `.env` 文件中
- 运行 `python scripts/test_llm_setup.py` 测试连接
- 确认使用 Gemini 2.0 系列模型（1.5 已淘汰）

### 2. 数据库连接失败

**现象**：`Database connection error`

**解决方案**：
- 检查 `DATABASE_URL` 配置
- 确认 PostgreSQL 服务运行中
- 运行数据库迁移：`npm run db:setup`
- 检查数据库权限

### 3. Docker 容器无法启动

**解决方案**：
```bash
# 查看日志
cd agent-backend/docker
./backend.sh logs

# 重新构建
./backend.sh build

# 检查端口占用
lsof -i :8000
```

### 4. 会话历史无法保存

**现象**：对话历史丢失

**解决方案**：
- 检查数据库连接
- 查看日志中的错误信息
- 系统会自动降级到内存存储（重启后丢失）

---

## 📚 相关文档

- **DESIGN.md** - 完整的架构设计文档
- **GUIDE.md** - 开发指南和最佳实践
- **docs/AGENT_FRAMEWORKS.md** - Agent 框架对比
- **docs/REAL_NEWS_IMPLEMENTATION.md** - 真实数据源实现

---

## 🎯 技术栈

- **框架**: FastAPI 0.104+
- **语言**: Python 3.11+
- **LLM**: Google Gemini 2.0 Flash
- **数据库**: PostgreSQL 14+
- **ORM**: 原生 SQL + psycopg2
- **日志**: Loguru
- **测试**: pytest + pytest-asyncio

---

## 📈 性能指标

- **简单查询响应**: < 2 秒
- **复杂查询响应**: < 10 秒
- **数据库查询**: < 100ms
- **LLM 调用**: < 3 秒
- **并发会话**: 100+

---

**版本**: 3.0.0 (ReAct Agent)  
**状态**: ✅ 生产就绪  
**最后更新**: 2024-01-01
