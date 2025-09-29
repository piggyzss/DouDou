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

## 许可证

MIT License
