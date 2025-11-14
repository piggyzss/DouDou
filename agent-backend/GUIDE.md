# AI News Agent - 开发指南

## 🚀 快速开始（使用 Docker）

### 方式1：只启动后端（推荐用于后端开发）

```bash
cd agent-backend/docker

# 启动后端
./backend.sh start

# 查看日志
./backend.sh logs

# 停止后端
./backend.sh stop
```

### 方式2：启动全栈（前端 + 后端）

```bash
cd agent-backend/docker

# 启动前端和后端
./scripts/startup/full-stack.sh start

# 查看状态
./scripts/startup/full-stack.sh status

# 停止所有服务
./scripts/startup/full-stack.sh stop
```

### Docker 服务说明

启动后会自动：
- ✅ 构建 Docker 镜像（使用国内镜像源加速）
- ✅ 安装所有 Python 依赖
- ✅ 启动 Python 后端服务
- ✅ 启动 Redis 服务（如果需要）
- ✅ 支持代码热重载（修改代码自动重启）

**服务地址**：
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

### 2. 常用 Docker 命令

```bash
cd agent-backend

# 查看所有可用命令
./docker-dev.sh

# 启动服务
./docker-dev.sh start

# 停止服务
./docker-dev.sh stop

# 重启服务
./docker-dev.sh restart

# 查看实时日志
./docker-dev.sh logs

# 进入容器 shell
./docker-dev.sh shell

# 运行测试
./docker-dev.sh test

# 重新构建镜像
./docker-dev.sh build

# 查看容器状态
./docker-dev.sh ps
```

### 3. 测试功能

#### 测试意图分析器

```bash
# 使用快捷命令
cd agent-backend
./docker-dev.sh test

# 或手动执行
docker-compose -f agent-backend/docker/docker-compose.dev.yml exec agent-backend python test_input_router.py
```

#### 测试 API

```bash
# 命令式输入
curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"input": "/latest 5"}'

# 自然语言输入
curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"input": "最近有什么AI新闻？"}'
```

#### 前端测试

```bash
# 在项目根目录（前端在本地运行）
npm run dev
# 访问 http://localhost:3000/agent
```

**混合模式**：后端在 Docker 中，前端在本地，这样可以：
- ✅ 后端环境隔离，无依赖问题
- ✅ 前端本地运行，调试方便
- ✅ 两者通过 HTTP 通信

---

## 📊 架构说明

### 核心流程

```
用户输入 → Intent Analyzer → Intent → Plugin Manager → Plugin → 响应
```

### Intent 模型

所有输入（命令式/自然语言）都转换为统一的 Intent：

```python
{
  "command": "/latest",           # 映射到的命令
  "params": {"count": 5},         # 参数
  "source": "command",            # 来源：command | natural_language
  "confidence": 1.0,              # 置信度 0-1
  "original_input": "/latest 5",  # 原始输入
  "keywords": [],                 # 关键词（自然语言）
  "time_range": null,             # 时间范围（自然语言）
  "importance": "all"             # 重要性（自然语言）
}
```

### 支持的输入

#### 命令式

| 命令 | 说明 | 示例 |
|------|------|------|
| `/latest [count]` | 获取最新资讯 | `/latest 5` |
| `/trending` | 获取趋势 | `/trending` |
| `/deepdive <topic>` | 深度分析 | `/deepdive GPT-4` |
| `/help` | 帮助 | `/help` |

#### 自然语言（基础版）

当前使用关键词匹配，未来将集成 LLM：

| 输入 | 映射命令 |
|------|---------|
| "最近有什么AI新闻？" | `/latest` |
| "现在AI领域有什么热点？" | `/trending` |
| "深度分析OpenAI的进展" | `/deepdive` |

---

## 🏗️ 项目结构

```
agent-backend/
├── app/
│   ├── api/routes/          # API 路由（HTTP 层）
│   │   └── agent.py         # Agent API 端点
│   ├── core/                # 核心业务逻辑
│   │   ├── intent_analyzer.py  # 意图分析器
│   │   └── plugin_manager.py   # 插件管理器
│   ├── models/              # 数据模型
│   │   ├── intent.py        # Intent 模型
│   │   ├── base.py          # 基础模型
│   │   └── news.py          # 新闻模型
│   ├── plugins/             # 插件
│   │   └── news_plugin.py   # 新闻插件
│   ├── services/            # 服务层
│   │   └── news_collector.py  # 新闻收集服务
│   ├── config.py            # 配置
│   └── main.py              # 应用入口
└── requirements.txt         # 依赖
```

---

## ⚙️ 配置

创建 `.env` 文件：

```bash
# 基础配置
DEBUG=true
HOST=0.0.0.0
PORT=8000

# LLM 配置（可选，未来功能）
LLM_PROVIDER=none  # none | google | openai
GOOGLE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here

# Agent 配置
ENABLE_INTENT_ANALYSIS=false
ENABLE_CONTENT_ANALYSIS=false

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## ✅ 已完成的功能

### 核心架构

- ✅ **Intent 模型**：统一的意图表示
- ✅ **Intent Analyzer**：智能输入分析器
  - 自动识别命令式输入
  - 基础自然语言解析（关键词匹配）
  - 为 LLM 集成预留接口
- ✅ **统一 API**：支持命令式和自然语言输入
- ✅ **向后兼容**：保持现有功能不变

### 代码优化

- ✅ 前端代码减少 ~95 行（-27%）
- ✅ 清晰的职责分离
- ✅ 更好的类型安全
- ✅ 完善的错误处理

---

## 🚧 下一步开发

### Phase 1: LLM 集成（优先级：高）

**目标**：实现真正的自然语言理解

**任务**：
1. 创建 `LLMService` 类（`app/services/llm_service.py`）
   - 支持 Google Gemini 1.5 Flash
   - 支持 OpenAI GPT-3.5（备选）
2. 更新 `IntentAnalyzer` 集成 LLM
3. 测试和优化 Prompt

### Phase 2: RSS 数据源（优先级：中）

**目标**：获取真实的 AI 新闻

**任务**：
1. 创建 `RSSAggregator`（`app/services/rss_aggregator.py`）
2. 配置 10+ RSS 源
3. 实现缓存机制
4. 替换 mock 数据

### Phase 3: 内容分析（优先级：中）

**目标**：智能分析和洞察生成

**任务**：
1. 创建 `ContentAnalyzer`（`app/services/content_analyzer.py`）
2. 创建 `InsightGenerator`（`app/services/insight_generator.py`）
3. 实现相关性评分和趋势识别

### Phase 4: 上下文管理（优先级：低）

**目标**：支持多轮对话

**任务**：
1. 创建 `ContextManager`（`app/services/context_manager.py`）
2. 管理会话状态
3. 跟踪用户偏好

---

## 🐛 故障排除

### 问题1：执行 start 后容器显示暂停

**现象**：执行 `./docker-dev.sh start` 后，Docker Desktop 中容器显示为暂停状态

**原因**：执行脚本时 Docker Desktop 还没有完全启动

**解决方案**：
1. 确保 Docker Desktop 完全启动（菜单栏图标显示绿色）
2. 在 Docker Desktop 中手动点击容器的启动按钮
3. 或者重新执行：`./docker-dev.sh start`

**预防措施**：
- 先启动 Docker Desktop，等待完全就绪
- 再执行 `./docker-dev.sh start`
- 使用 `./docker-dev.sh status` 检查状态

### 问题2：Docker 容器启动失败

```bash
cd agent-backend/docker
./backend.sh logs
```

**常见原因**：
- 端口 8000 被占用
- Docker 服务未启动
- 镜像构建失败

### 问题2：端口占用

```bash
ERROR: port is already allocated
```

**解决方案**：
```bash
# 查看占用端口的容器
docker ps

# 停止所有相关容器
./scripts/startup/full-stack.sh stop

# 或手动停止
cd agent-backend/docker && ./backend.sh stop
```

### 问题3：代码修改不生效

**解决方案**：检查代码挂载
```bash
# 重启容器
cd agent-backend/docker && ./backend.sh restart
```

### 问题4：查看容器日志

```bash
# 实时查看日志
cd agent-backend/docker && ./backend.sh logs

# 或使用 docker-compose
docker-compose -f agent-backend/docker/docker-compose.dev.yml logs -f agent-backend
```

### 问题5：进入容器调试

```bash
# 进入容器 shell
cd agent-backend/docker && ./backend.sh shell

# 在容器内运行命令
python test_input_router.py
python -m pytest
```

---

## 📚 相关文档

- **DESIGN.md** - 完整的设计文档和技术选型
- **README.md** - 项目说明和功能介绍
- **本文档** - 开发指南和快速开始

---

## 🎯 重构成果

### 架构改进

**重构前**：
```
用户输入 → 前端验证 → API → 后端处理
         ↓
    重复的插件管理逻辑
```

**重构后**：
```
用户输入 → 前端转发 → API → Intent Analyzer → Intent → 后端处理
                                    ↓
                              统一的意图模型
```

### 关键改进

1. **统一输入处理**：支持命令式和自然语言
2. **职责清晰**：前端只负责 UI，后端负责业务逻辑
3. **代码简洁**：删除了冗余代码
4. **易于维护**：单一数据源，无需同步
5. **可扩展性强**：为 LLM 集成预留了清晰的接口

### 技术债务

- ⚠️ 当前自然语言解析使用简单的关键词匹配
- ⚠️ 需要集成 LLM 实现真正的自然语言理解
- ⚠️ 仍在使用 mock 数据，需要集成真实数据源

---

**版本**：2.0.0  
**状态**：✅ 重构完成，准备进入下一阶段开发
