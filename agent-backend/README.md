# AI News Agent Backend

基于 FastAPI 的 AI 新闻 Agent 后端服务，采用插件化架构设计，支持命令式和自然语言输入。

---

## 📋 目录

- [整体架构和工作流程](#-整体架构和工作流程)
- [功能特性](#功能特性)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [API 端点](#api端点)
- [支持的命令](#支持的命令)
- [插件开发](#插件开发)
- [真正的 AI Agent 应该具备什么](#-真正的ai-agent应该具备什么)
- [AI Agent 方案](#ai-agent的方案)
- [具体 AI Agent 功能设计](#具体ai-agent功能设计)
- [技术实现架构](#技术实现架构)
- [AI Agent 能力分级](#ai-agent-能力分级)
- [数据获取方案](#数据获取方案)
- [AI 能力实现方案对比](#ai能力实现方案对比)
- [推荐实施方案](#-推荐实施方案)
- [开发建议](#开发建议)

---

## 🏗️ 整体架构和工作流程

### 架构流程图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js UI   │────│  Next.js API   │────│  Python Agent  │
│   (Terminal)    │    │   (Wrapper)     │    │   (Core Logic)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
    WebSocket连接              HTTP调用                 插件系统
         │                       │                       │
    用户交互界面              中间件/缓存               AI资讯服务

详细工作流程：
用户请求 → FastAPI路由 → 意图分析器 → 插件管理器 → 具体插件 → 返回响应
    ↓           ↓            ↓            ↓           ↓         ↓
  输入      agent.py   intent_analyzer  plugin_manager  news_plugin  结构化响应
```

### 核心工作流程

1. **用户输入**: 在前端终端输入命令（如 `/latest`）或自然语言（如 "最近有什么AI新闻？"）
2. **请求路由**: 通过 `/api/agent/execute` 端点进入后端
3. **意图分析**: Intent Analyzer 解析输入，转换为统一的 Intent 模型
4. **插件执行**: Plugin Manager 根据 Intent 路由到对应插件
5. **响应返回**: 插件返回结构化响应给前端显示


## 功能特性

- 🔌 插件化架构，易于扩展
- 📰 AI 新闻资讯收集和分析
- 🤖 智能 Agent 能力（意图理解、上下文分析）
- 🧠 **LLM 集成**：支持 Gemini 1.5 Flash 自然语言理解（阶段 1 已完成）
- 🚀 异步处理，高性能
- 🔄 Redis 缓存支持
- 📝 完整的 API 文档
- 🛡️ CORS 和安全配置
- 🎯 统一输入处理（命令式 + 自然语言）

## 🗂️ 项目结构

```
agent-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI应用入口 - 配置CORS、注册路由
│   ├── config.py               # 配置管理 - 环境变量、Redis、API密钥配置
│   ├── models/
│   │   ├── base.py             # 基础模型 - 定义插件抽象类和数据模型
│   │   ├── intent.py           # Intent 模型 - 统一意图表示
│   │   └── news.py             # 新闻模型 - 新闻数据结构定义
│   ├── plugins/
│   │   └── news_plugin.py      # AI资讯插件 - 实现新闻获取和处理逻辑
│   ├── services/
│   │   └── news_collector.py   # 新闻收集服务 - 从各数据源收集新闻
│   ├── core/
│   │   ├── intent_analyzer.py  # 意图分析器 - 统一输入处理
│   │   └── plugin_manager.py   # 插件管理器 - 插件注册、命令分发、执行管理
│   └── api/
│       └── routes/
│           └── agent.py        # Agent API路由 - 处理HTTP请求和响应
├── docker/                     # Docker 配置
│   ├── Dockerfile.dev          # 开发环境镜像
│   ├── docker-compose.dev.yml  # Docker Compose 配置
│   └── backend.sh              # 后端管理脚本
├── tests/                      # 测试文件
├── requirements.txt            # Python依赖包列表
└── README.md                   # 项目文档
```

## 🚀 快速开始

### 方法 1: Docker 混合模式（推荐）

**优势**: 解决 Python 依赖问题，保持前端调试便利性

```bash
# 一键启动全栈开发环境（推荐）
./scripts/startup/full-stack.sh start

# 服务地址：
# - 后端: http://localhost:8000
# - API文档: http://localhost:8000/docs
# - 前端: http://localhost:3000/agent
```

**工作原理**:
- Python 后端运行在 Docker 容器中（自动热重载）
- Next.js 前端运行在本地（保持 Cursor 调试功能）
- 一键启动/停止，环境隔离

### 方法 2: 传统本地开发

```bash
# 1. 安装依赖
cd agent-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. 配置环境变量
cp .env.example .env  # 编辑相应配置

# 3. 启动服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 访问服务

- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health
- **Agent 页面**: http://localhost:3000/agent（需要前端运行）


## API 端点

### Agent 相关

- `POST /api/agent/execute` - 执行 Agent 命令或自然语言查询
- `GET /api/agent/plugins` - 获取所有插件
- `GET /api/agent/commands` - 获取所有命令
- `GET /api/agent/health` - 健康检查

### 系统相关

- `GET /` - 服务信息
- `GET /health` - 健康检查

## 支持的命令

### AI 资讯插件 (news)

- `/latest [count]` - 获取最新 AI 资讯
- `/trending [category]` - 获取热门趋势
- `/categories` - 显示资讯分类
- `/deepdive <topic>` - 深度分析特定主题
- `/help [command]` - 显示帮助信息

### 自然语言输入（当前支持基础关键词匹配）

- "最近有什么 AI 新闻？" → `/latest`
- "现在 AI 领域有什么热点？" → `/trending`
- "深度分析 OpenAI 的进展" → `/deepdive`

## 插件开发

要添加新的插件，请：

1. 继承 `BasePlugin` 类
2. 实现 `get_commands()` 和 `execute()` 方法
3. 在 `plugin_manager.py` 中注册插件

示例：

```python
from app.models.base import BasePlugin, AgentCommand, AgentRequest, AgentResponse

class MyPlugin(BasePlugin):
    def __init__(self):
        super().__init__(
            name="我的插件",
            plugin_id="my_plugin",
            description="插件描述"
        )

    def get_commands(self):
        return [
            AgentCommand(
                command="/mycommand",
                description="我的命令",
                usage="/mycommand [param]",
                examples=["/mycommand hello"]
            )
        ]

    async def execute(self, request: AgentRequest):
        # 处理逻辑
        return AgentResponse(
            success=True,
            data="响应数据",
            type="text",
            plugin=self.id,
            command=request.command
        )
```

---


## 🤖 真正的 AI Agent 应该具备什么？

### 核心能力要求

#### 1. 自主决策能力

- 根据用户查询意图选择合适的数据源
- 动态调整搜索策略
- 主动发现相关信息

#### 2. 上下文理解

- 理解用户的历史查询
- 记住对话上下文
- 个性化推荐

#### 3. 推理和分析

- 分析新闻之间的关联性
- 识别趋势和模式
- 提供洞察和预测

#### 4. 学习和适应

- 从用户反馈中学习
- 优化推荐算法
- 适应用户偏好

---

## AI Agent 的方案

### 智能新闻 Agent 架构

#### 第一层：数据获取层

```
RSS 聚合 + Reddit API + HackerNews API + GitHub API → 原始数据
```

#### 第二层：AI 理解层（LLM API）

```
用户查询 → 意图识别 → 查询理解 → 上下文分析 → 个性化过滤
```

#### 第三层：智能推理层（LLM API）

```
原始数据 → 内容分析 → 关联分析 → 重要性评分 → 趋势识别
```

#### 第四层：智能输出层（LLM API）

```
分析结果 → 个性化推荐 → 趋势分析 → 智能摘要 → 洞察生成
```

### 完整数据流程

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用户查询       │    │   AI理解层       │    │   数据获取层      │    │   智能推理层      │
│                 │    │   (LLM API)     │    │   (RSS+APIs)    │    │   (LLM API)     │
│ "最近GPT有什么   │───▶│ 意图识别          │───▶│ RSS聚合         │───▶│ 内容分析          │
│  新进展？"       │    │ 查询理解         │    │ Reddit API      │    │ 关联分析          │
│                 │    │ 上下文分析       │    │ HackerNews API  │    │ 重要性评分        │
│                 │    │ 个性化过滤       │    │ GitHub API      │    │ 趋势识别          │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用户交互       │     │   智能输出层     │    │   反馈学习       │
│   (前端界面)     │◀─── │   (LLM API)    │◀───│   (LLM API)     │
│                 │    │                 │    │                 │
│ 个性化推荐       │    │ 个性化推荐         │    │ 用户反馈分析     │
│ 趋势分析         │    │ 趋势分析          │    │ 偏好学习         │
│ 智能摘要         │    │ 智能摘要          │    │ 策略优化         │
│ 洞察生成         │    │ 洞察生成          │    │ 个性化调整       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 详细处理步骤

```
1. 用户输入查询 → 2. LLM理解意图 → 3. 筛选数据源 → 4. 获取原始数据
                                                           ↓
8. 用户查看结果 ← 7. 前端展示 ← 6. LLM生成输出 ← 5. LLM分析内容
     ↓
9. 用户反馈 → 10. LLM学习优化 → 11. 更新策略 → 12. 改进推荐
```


## 具体 AI Agent 功能设计

### 1. 智能查询理解

```python
# 用户输入："最近有什么关于GPT的重要进展？"
# Agent理解：
- 时间范围：最近（7天内）
- 关键词：GPT, 语言模型
- 重要性：高优先级
- 意图：技术进展查询
```

### 2. 上下文感知推荐

```python
# 基于用户历史：
- 之前关注过OpenAI → 优先推荐OpenAI相关
- 经常查看技术细节 → 提供更深入的技术分析
- 偏好简洁摘要 → 调整输出格式
```

### 3. 智能分析和洞察

```python
# 不只是返回新闻，还要分析：
- "这3条新闻都提到了多模态AI，说明这是当前热点趋势"
- "OpenAI和Google同时发布类似功能，竞争加剧"
- "基于历史数据，这类技术通常6个月后会有重大突破"
```

---

## 技术实现架构

### 核心 AI 组件

1. **Intent Analyzer**：理解用户查询意图（已实现基础版）
2. **知识图谱**：构建 AI 领域的实体关系（未来）
3. **推荐引擎**：个性化内容推荐（未来）
4. **趋势分析**：识别热点和趋势（未来）
5. **对话管理**：维护上下文状态（未来）

### LLM API 在四个关键环节的作用

1. **AI 理解层**：解析用户查询的真实需求，理解上下文和个性化偏好
2. **智能推理层**：分析数据间的关联性和重要性，识别趋势和模式
3. **智能输出层**：生成个性化推荐、趋势分析、智能摘要、洞察
4. **反馈学习层**：从用户交互中学习和优化，改进推荐策略（未来功能）

### 实现建议

#### 阶段 1：基础 Agent（当前阶段）

- ✅ 添加查询意图识别（已完成基础版）
- ✅ 实现简单的上下文记忆（Intent 模型）
- ⏳ 基础的关联分析（开发中）

#### 阶段 2：智能 Agent（下一阶段）

- ⏳ 集成 LLM 进行内容分析
- ⏳ 构建 AI 领域知识图谱
- ⏳ 实现个性化推荐

#### 阶段 3：学习 Agent（未来）

- 📋 添加用户反馈机制
- 📋 实现偏好学习
- 📋 主动发现和推送


## AI Agent 能力分级

### 🥉 基础智能 Agent（当前阶段）

**核心能力：**

- ✅ 查询意图识别和理解（基础关键词匹配）
- ✅ 简单的上下文分析（Intent 模型）
- ⏳ 基础的关联分析和洞察（开发中）
- ⏳ 智能内容过滤和排序（开发中）

**技术实现：**

- 意图识别：理解用户查询的真实需求（当前使用关键词匹配）
- 内容分析：使用 AI 分析新闻内容和关联性（计划中）
- 智能推荐：基于查询意图推荐相关内容（计划中）
- 洞察生成：提供简单的趋势分析和总结（计划中）

**当前状态：**
- ✅ Intent Analyzer 已实现
- ✅ 支持命令式和自然语言输入
- ✅ 统一的 Intent 模型
- ⏳ 等待 LLM 集成

### 🥈 高级智能 Agent（未来规划）

**核心能力：**

- 个性化推荐引擎
- 深度趋势分析和预测
- 多轮对话上下文管理
- 集成更多数据源

### 🥇 专家级 Agent（长远目标）

**核心能力：**

- 构建 AI 领域知识图谱
- 预测性分析和建议
- 自主学习和策略优化
- 添加多模态处理能力

---

## 数据获取方案

### 🎯 推荐方案：混合方案（RSS + 现有 API）

#### 组合策略

1. **RSS 聚合**：主要 AI 公司官方博客（核心数据源）
2. **Reddit API**：社区讨论和热点话题
3. **Hacker News API**：技术新闻补充
4. **GitHub API**：开源项目动态（可选）

#### RSS Feeds 配置

```python
RSS_FEEDS = {
    # AI 公司官方博客
    "openai": {
        "url": "https://openai.com/blog/rss.xml",
        "priority": "high",
        "category": "Company",
    },
    "anthropic": {
        "url": "https://www.anthropic.com/news/rss.xml",
        "priority": "high",
        "category": "Company",
    },
    "google_ai": {
        "url": "https://blog.google/technology/ai/rss/",
        "priority": "high",
        "category": "Company",
    },
    "meta_ai": {
        "url": "https://ai.meta.com/blog/rss/",
        "priority": "high",
        "category": "Company",
    },
    "deepmind": {
        "url": "https://deepmind.google/discover/blog/rss.xml",
        "priority": "high",
        "category": "Company",
    },
    
    # 科技媒体
    "techcrunch_ai": {
        "url": "https://techcrunch.com/category/artificial-intelligence/feed/",
        "priority": "medium",
        "category": "Media",
    },
    "mit_tech_review": {
        "url": "https://www.technologyreview.com/topic/artificial-intelligence/feed",
        "priority": "medium",
        "category": "Media",
    },
}
```

#### 缓存策略

- RSS Feed：30 分钟缓存
- HN API：15 分钟缓存
- LLM 结果：1 小时缓存（基于 prompt hash）


## AI 能力实现方案对比

### 方案 A：使用现有 LLM API（推荐）

#### 技术选择

- OpenAI GPT-4/GPT-3.5-turbo
- Anthropic Claude
- Google Gemini

#### 优势分析

- ✅ **开发成本低**：直接调用 API，无需训练模型
- ✅ **理解能力强**：先进的语言理解和推理能力
- ✅ **快速上线**：几天内可实现基础功能
- ✅ **持续优化**：模型持续更新，能力不断提升
- ✅ **多语言支持**：天然支持中英文混合处理

#### 成本分析

```
OpenAI GPT-3.5-turbo: $0.001/1K tokens (输入) + $0.002/1K tokens (输出)
OpenAI GPT-4: $0.03/1K tokens (输入) + $0.06/1K tokens (输出)
Anthropic Claude: $0.008/1K tokens (输入) + $0.024/1K tokens (输出)
Google Gemini 1.5 Flash: $0.075/1M tokens (输入) + $0.30/1M tokens (输出)
Google Gemini 1.5 Pro: $1.25/1M tokens (输入) + $5.00/1M tokens (输出)

预估月成本（3000 次查询）：
- GPT-3.5: ~$5-10
- GPT-4: ~$30-60
- Claude: ~$15-30
- Gemini Flash: ~$1-2 🏆 最便宜
- Gemini Pro: ~$10-15
```

**实现难度：** ⭐⭐ (简单)  
**理解准确度：** ⭐⭐⭐⭐⭐ (优秀)

### 方案 B：自建轻量级 NLP 模块

#### 技术选择

- spaCy + 预训练模型
- Transformers + BERT/RoBERTa
- 规则引擎 + 关键词匹配（当前使用）

#### 优势分析

- ✅ **运行成本低**：无 API 调用费用
- ✅ **数据隐私**：数据不离开本地
- ✅ **响应速度快**：本地处理，无网络延迟
- ✅ **可定制性强**：针对特定领域优化

#### 劣势分析

- ❌ **开发成本高**：需要大量开发和调试时间
- ❌ **理解能力有限**：难以处理复杂语义和推理
- ❌ **维护复杂**：需要持续优化和更新
- ❌ **多语言困难**：中英文混合处理复杂

**实现难度：** ⭐⭐⭐⭐ (困难)  
**理解准确度：** ⭐⭐⭐ (中等)

### LLM 技术选型对比

| 特性 | OpenAI GPT-3.5 | OpenAI GPT-4 | Google Gemini 1.5 Flash | Google Gemini 1.5 Pro | Anthropic Claude 3.5 Sonnet |
|------|----------------|--------------|------------------------|----------------------|------------------------------|
| **输入价格** | $0.50/1M tokens | $5.00/1M tokens | $0.075/1M tokens | $1.25/1M tokens | $3.00/1M tokens |
| **输出价格** | $1.50/1M tokens | $15.00/1M tokens | $0.30/1M tokens | $5.00/1M tokens | $15.00/1M tokens |
| **上下文窗口** | 16K tokens | 128K tokens | 1M tokens | 2M tokens | 200K tokens |
| **响应速度** | ⭐⭐⭐⭐⭐ 快 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 极快 | ⭐⭐⭐⭐ 快 | ⭐⭐⭐⭐ 快 |
| **理解能力** | ⭐⭐⭐⭐ 好 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 好 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐⭐ 优秀 |
| **中文支持** | ⭐⭐⭐⭐ 好 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 好 |
| **JSON 模式** | ✅ 支持 | ✅ 支持 | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| **免费额度** | ❌ 无 | ❌ 无 | ✅ 1500次/天 | ✅ 50次/天 | ❌ 无 |
| **SDK 成熟度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |



---

## 🔧 故障排除

1. **LLM 服务不可用**
   - 检查 `GOOGLE_API_KEY` 环境变量
   - 确认 `LLM_PROVIDER=google` 在 `.env` 文件中
   - 运行 `python scripts/test_llm_setup.py` 测试连接
   - 确认使用 Gemini 2.5 系列模型（1.5 已淘汰）

2. **Docker 容器无法启动**
   - 检查端口占用：`lsof -i :8000`
   - 查看日志：`docker-compose -f docker/docker-compose.dev.yml logs`
   - 重新构建：`docker-compose -f docker/docker-compose.dev.yml build --no-cache`

3. **依赖安装失败**
   - 升级 pip：`pip install --upgrade pip`
   - 清除缓存：`pip cache purge`
   - 使用国内镜像：`pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple`

---

## 📚 相关文档

- [GUIDE.md](./GUIDE.md) - 完整开发指南
- [DESIGN.md](./DESIGN.md) - 架构设计文档
