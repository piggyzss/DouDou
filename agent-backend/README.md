# AI News Agent Backend

基于FastAPI的AI新闻Agent后端服务，采用插件化架构设计。

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
用户请求 → FastAPI路由 → 插件管理器 → 具体插件 → 返回响应
    ↓           ↓            ↓           ↓         ↓
  /latest    agent.py   plugin_manager  news_plugin  结构化响应
```

### 核心工作流程
1. **用户输入**: 在前端终端输入命令（如 `/latest`）
2. **请求路由**: 通过 `/api/agent/execute` 端点进入后端
3. **命令解析**: 插件管理器解析命令，找到对应插件
4. **插件执行**: 调用插件的 `execute()` 方法处理请求
5. **响应返回**: 插件返回结构化响应给前端显示

## 功能特性

- 🔌 插件化架构，易于扩展
- 📰 AI新闻资讯收集和分析
- 🤖 智能Agent能力（意图理解、上下文分析）
- 🚀 异步处理，高性能
- 🔄 Redis缓存支持
- 📝 完整的API文档
- 🛡️ CORS和安全配置

## 🗂️ 项目结构

```
agent-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI应用入口 - 配置CORS、注册路由
│   ├── config.py               # 配置管理 - 环境变量、Redis、API密钥配置
│   ├── models/
│   │   ├── base.py             # 基础模型 - 定义插件抽象类和数据模型
│   │   └── news.py             # 新闻模型 - 新闻数据结构定义
│   ├── plugins/
│   │   └── news_plugin.py      # AI资讯插件 - 实现新闻获取和处理逻辑
│   ├── services/
│   │   └── news_collector.py   # 新闻收集服务 - 从各数据源收集新闻
│   ├── core/
│   │   └── plugin_manager.py   # 插件管理器 - 插件注册、命令分发、执行管理
│   └── api/
│       └── routes/
│           └── agent.py        # Agent API路由 - 处理HTTP请求和响应
├── requirements.txt            # Python依赖包列表
├── Dockerfile                  # Docker容器化配置
└── README.md                   # 项目文档
```

## 🚀 快速开始

### 方法1: Docker混合模式（推荐）

**优势**: 解决Python依赖问题，保持前端调试便利性

```bash
# 一键启动开发环境（项目根目录）
./scripts/docker/start-dev-docker.sh

# 服务地址：
# - 后端: http://localhost:8000
# - API文档: http://localhost:8000/docs
# - 前端: http://localhost:3000/agent
```

**工作原理**:
- Python后端运行在Docker容器中（自动热重载）
- Next.js前端运行在本地（保持Cursor调试功能）
- 一键启动/停止，环境隔离

### 方法2: 传统本地开发

```bash
# 1. 安装依赖
cd agent-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. 配置环境变量
cp .env.example .env  # 编辑相应配置

# 3. 启动服务
python -m app.main
# 或使用uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. 访问服务

- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health
- **Agent页面**: http://localhost:3000/agent（需要前端运行）

## API端点

### Agent相关
- `POST /api/agent/execute` - 执行Agent命令
- `GET /api/agent/plugins` - 获取所有插件
- `GET /api/agent/commands` - 获取所有命令
- `GET /api/agent/health` - 健康检查

### 系统相关
- `GET /` - 服务信息
- `GET /health` - 健康检查

## 支持的命令

### AI资讯插件 (news)
- `/latest [count]` - 获取最新AI资讯
- `/trending [category]` - 获取热门趋势
- `/categories` - 显示资讯分类
- `/deepdive <topic>` - 深度分析特定主题
- `/help [command]` - 显示帮助信息

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

## 🐳 Docker开发环境

### 混合模式架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   本地前端      │────│   Docker后端    │    │   Docker Redis  │
│   Next.js       │    │   Python Agent  │    │   缓存服务      │
│   (热重载)      │    │   (容器化)      │    │   (可选)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
    Cursor调试              自动重载                  数据缓存
    端口: 3000              端口: 8000              端口: 6379
```

### 为什么选择混合模式？

**解决的核心问题：**
- ✅ **Python依赖地狱**: 容器化隔离，不再有版本冲突
- ✅ **环境一致性**: 开发环境与生产环境完全一致
- ✅ **保持调试便利**: 前端本地运行，Cursor调试功能完全可用
- ✅ **简化启动**: 一键启动，无需复杂的环境配置

**Docker配置文件：**
- `Dockerfile.dev` - 开发专用镜像（支持热重载）
- `docker-compose.dev.yml` - 完整开发环境编排
- `scripts/docker/start-dev-docker.sh` - 一键启动脚本

## 🛠️ 开发指南

### 常用命令

```bash
# 启动开发环境
./scripts/docker/start-dev-docker.sh

# 停止开发环境  
./scripts/docker/stop-dev-docker.sh

# 查看后端日志
docker-compose -f scripts/docker/docker-compose.dev.yml logs -f agent-backend

# 查看服务状态
docker-compose -f scripts/docker/docker-compose.dev.yml ps

# 重启后端服务
docker-compose -f scripts/docker/docker-compose.dev.yml restart agent-backend
```

### 测试验证

```bash
# 健康检查
curl http://localhost:8000/health

# 测试Agent命令
curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"command":"/help","params":{}}'

# 在浏览器中测试
# 访问 http://localhost:3000/agent
# 输入命令: /help, /latest
```

### 故障排除

**常见问题：**
- **容器启动失败**: `docker-compose -f scripts/docker/docker-compose.dev.yml logs agent-backend`
- **端口占用**: `lsof -i :8000` 查看端口使用
- **CORS错误**: 检查环境变量 `ALLOWED_ORIGINS`
- **热重载不工作**: 检查代码挂载 `docker-compose -f scripts/docker/docker-compose.dev.yml exec agent-backend ls -la /app`

**生产环境部署请参考**: [部署指南](../docs/deployment-guide.md)

## 🤖 AI Agent 升级方案

### 真正的AI Agent应该具备什么？

#### 核心能力要求

**1. 自主决策能力**
- 根据用户查询意图选择合适的数据源
- 动态调整搜索策略
- 主动发现相关信息

**2. 上下文理解**
- 理解用户的历史查询
- 记住对话上下文
- 个性化推荐

**3. 推理和分析**
- 分析新闻之间的关联性
- 识别趋势和模式
- 提供洞察和预测

**4. 学习和适应**
- 从用户反馈中学习
- 优化推荐算法
- 适应用户偏好

### AI Agent的方案

#### 智能新闻Agent架构


**第一层：数据获取层**
```
RSS聚合 + Reddit API + HackerNews API + GitHub API → 原始数据
```

**第二层：AI理解层（LLM API）**
```
用户查询 → 意图识别 → 查询理解 → 上下文分析 → 个性化过滤
```

**第三层：智能推理层（LLM API）**
```
原始数据 → 内容分析 → 关联分析 → 重要性评分 → 趋势识别
```

**第四层：智能输出层（LLM API）**
```
分析结果 → 个性化推荐 → 趋势分析 → 智能摘要 → 洞察生成
```

**完整数据流程：**
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

**详细处理步骤：**
```
1. 用户输入查询 → 2. LLM理解意图 → 3. 筛选数据源 → 4. 获取原始数据
                                                           ↓
8. 用户查看结果 ← 7. 前端展示 ← 6. LLM生成输出 ← 5. LLM分析内容
     ↓
9. 用户反馈 → 10. LLM学习优化 → 11. 更新策略 → 12. 改进推荐
```

### 具体AI Agent功能设计

#### 1. 智能查询理解
```python
# 用户输入："最近有什么关于GPT的重要进展？"
# Agent理解：
- 时间范围：最近（7天内）
- 关键词：GPT, 语言模型
- 重要性：高优先级
- 意图：技术进展查询
```

#### 2. 上下文感知推荐
```python
# 基于用户历史：
- 之前关注过OpenAI → 优先推荐OpenAI相关
- 经常查看技术细节 → 提供更深入的技术分析
- 偏好简洁摘要 → 调整输出格式
```

#### 3. 智能分析和洞察
```python
# 不只是返回新闻，还要分析：
- "这3条新闻都提到了多模态AI，说明这是当前热点趋势"
- "OpenAI和Google同时发布类似功能，竞争加剧"
- "基于历史数据，这类技术通常6个月后会有重大突破"
```


### 技术实现架构

#### 核心AI组件
1. **NLP模块**：理解用户查询意图
2. **知识图谱**：构建AI领域的实体关系
3. **推荐引擎**：个性化内容推荐
4. **趋势分析**：识别热点和趋势
5. **对话管理**：维护上下文状态

#### 数据流程
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用户查询      │    │   AI理解层      │    │   数据获取层    │    │   智能推理层    │
│                 │    │   (LLM API)     │    │   (RSS+APIs)    │    │   (LLM API)     │
│ 自然语言输入    │───▶│ 意图识别        │───▶│ RSS聚合         │───▶│ 内容分析        │
│                 │    │ 查询理解        │    │ Reddit API      │    │ 关联分析        │
│                 │    │ 上下文分析      │    │ HackerNews API  │    │ 重要性评分      │
│                 │    │ 个性化过滤      │    │ GitHub API      │    │ 趋势识别        │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用户交互      │    │   智能输出层    │    │   反馈学习      │
│   (前端界面)    │◀───│   (LLM API)     │◀───│   (LLM API)     │
│                 │    │                 │    │                 │
│ 个性化推荐      │    │ 个性化推荐      │    │ 用户反馈分析    │
│ 趋势分析        │    │ 趋势分析        │    │ 偏好学习        │
│ 智能摘要        │    │ 智能摘要        │    │ 策略优化        │
│ 洞察生成        │    │ 洞察生成        │    │ 个性化调整      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**LLM API在四个关键环节的作用：**
1. **AI理解层**：解析用户查询的真实需求，理解上下文和个性化偏好
2. **智能推理层**：分析数据间的关联性和重要性，识别趋势和模式
3. **智能输出层**：生成个性化推荐、趋势分析、智能摘要、洞察
4. **反馈学习层**：从用户交互中学习和优化，改进推荐策略（未来功能）

#### 实现建议

**阶段1：基础Agent（在现有基础上）**
- 添加查询意图识别
- 实现简单的上下文记忆
- 基础的关联分析

**阶段2：智能Agent**
- 集成LLM进行内容分析
- 构建AI领域知识图谱
- 实现个性化推荐

**阶段3：学习Agent**
- 添加用户反馈机制
- 实现偏好学习
- 主动发现和推送

### AI Agent 能力分级

#### 🥉 基础智能Agent
**核心能力：**
- ✅ 查询意图识别和理解
- ✅ 简单的上下文分析
- ✅ 基础的关联分析和洞察
- ✅ 智能内容过滤和排序

**技术实现：**
- 意图识别：理解用户查询的真实需求
- 内容分析：使用AI分析新闻内容和关联性
- 智能推荐：基于查询意图推荐相关内容
- 洞察生成：提供简单的趋势分析和总结

#### 🥈 高级智能Agent（未来规划）
**核心能力：**
- 个性化推荐引擎
- 深度趋势分析和预测
- 多轮对话上下文管理
- 集成更多数据源

#### 🥇 专家级Agent（长远目标）
**核心能力：**
- 构建AI领域知识图谱
- 预测性分析和建议
- 自主学习和策略优化
- 添加多模态处理能力

### 数据获取方案

#### 🎯 推荐方案：混合方案（RSS + 现有API）
**组合策略：**
1. **RSS聚合**：主要AI公司官方博客（核心数据源）
2. **Reddit API**：社区讨论和热点话题
3. **Hacker News API**：技术新闻补充
4. **GitHub API**：开源项目动态（可选）

### AI能力实现方案对比

#### 方案A：使用现有LLM API（推荐）

**技术选择：**
- OpenAI GPT-4/GPT-3.5-turbo
- Anthropic Claude
- Google Gemini

**优势分析：**
- ✅ **开发成本低**：直接调用API，无需训练模型
- ✅ **理解能力强**：先进的语言理解和推理能力
- ✅ **快速上线**：几天内可实现基础功能
- ✅ **持续优化**：模型持续更新，能力不断提升
- ✅ **多语言支持**：天然支持中英文混合处理

**成本分析：**
```
OpenAI GPT-3.5-turbo: $0.001/1K tokens (输入) + $0.002/1K tokens (输出)
OpenAI GPT-4: $0.03/1K tokens (输入) + $0.06/1K tokens (输出)
Anthropic Claude: $0.008/1K tokens (输入) + $0.024/1K tokens (输出)

预估月成本（1000次查询）：
- GPT-3.5: ~$5-10
- GPT-4: ~$30-60
- Claude: ~$15-30
```

**实现难度：** ⭐⭐ (简单)
**理解准确度：** ⭐⭐⭐⭐⭐ (优秀)

#### 方案B：自建轻量级NLP模块 ⭐⭐⭐

**技术选择：**
- spaCy + 预训练模型
- Transformers + BERT/RoBERTa
- 规则引擎 + 关键词匹配

**优势分析：**
- ✅ **运行成本低**：无API调用费用
- ✅ **数据隐私**：数据不离开本地
- ✅ **响应速度快**：本地处理，无网络延迟
- ✅ **可定制性强**：针对特定领域优化

**劣势分析：**
- ❌ **开发成本高**：需要大量开发和调试时间
- ❌ **理解能力有限**：难以处理复杂语义和推理
- ❌ **维护复杂**：需要持续优化和更新
- ❌ **多语言困难**：中英文混合处理复杂

**实现难度：** ⭐⭐⭐⭐ (困难)
**理解准确度：** ⭐⭐⭐ (中等)

### 🎯 推荐实施方案

#### 阶段1：基础智能Agent（使用LLM API）

**推荐选择：OpenAI GPT-3.5-turbo**
- 成本适中，性能优秀
- 开发周期短（1-2周）
- 快速验证AI Agent概念

**核心功能实现：**
1. **意图识别**：理解用户查询的真实需求
2. **内容分析**：分析新闻间的关联性和重要性
3. **智能摘要**：生成个性化的内容摘要
4. **趋势洞察**：识别热点话题和发展趋势

#### 技术架构升级

**新增AI处理层：**
```
用户查询 → 意图理解(LLM) → 数据检索(RSS+API) → 内容分析(LLM) → 智能输出
```

**实现步骤：**
1. **Week 1**: 集成OpenAI API，实现基础意图识别
2. **Week 2**: 实现RSS聚合器，替换mock数据
3. **Week 3**: 添加内容分析和关联推理
4. **Week 4**: 优化输出格式，添加洞察生成

#### 未来升级路径

**阶段2：高级功能（2-3个月后）**
- 添加用户偏好学习（可选存储）
- 实现多轮对话上下文
- 集成更多数据源

**阶段3：专家级能力（6个月后）**
- 构建AI领域知识图谱
- 实现预测性分析
- 添加多模态处理能力

### 开发建议

**立即开始：**
1. 集成OpenAI API进行意图识别
2. 实现RSS聚合器获取真实数据
3. 添加基础的内容分析能力

**技术债务管理：**
- 保持现有插件架构不变
- 渐进式升级，确保向后兼容
- 充分测试每个升级阶段

这个方案既能快速实现AI Agent能力，又能控制成本和复杂度，是当前最优的选择。

## 许可证

MIT License

