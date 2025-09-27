# AI News Agent Backend

基于FastAPI的AI新闻Agent后端服务，采用插件化架构设计。

## 功能特性

- 🔌 插件化架构，易于扩展
- 📰 AI新闻资讯收集和分析
- 🚀 异步处理，高性能
- 🔄 Redis缓存支持
- 📝 完整的API文档
- 🛡️ CORS和安全配置

## 项目结构

```
agent-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI应用入口
│   ├── config.py               # 配置管理
│   ├── models/
│   │   ├── base.py             # 基础模型
│   │   └── news.py             # 新闻模型
│   ├── plugins/
│   │   └── news_plugin.py      # AI资讯插件
│   ├── services/
│   │   └── news_collector.py   # 新闻收集服务
│   ├── core/
│   │   └── plugin_manager.py   # 插件管理器
│   └── api/
│       └── routes/
│           └── agent.py        # Agent API路由
├── requirements.txt
└── README.md
```

## 安装和运行

### 1. 安装依赖

```bash
cd agent-backend
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置相应的环境变量。

### 3. 运行服务

```bash
# 开发模式
python -m app.main

# 或使用uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. 访问API文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

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

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t ai-news-agent-backend .

# 运行容器
docker run -d -p 8000:8000 --name agent-backend ai-news-agent-backend
```

### 生产环境

建议使用 Gunicorn + Uvicorn 部署：

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 许可证

MIT License
