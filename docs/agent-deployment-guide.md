# Agent模块部署指南

## 概述

AI News Agent采用插件化架构，包含以下组件：
- **前端**: Next.js React应用 (控制台UI)
- **API包装层**: Next.js API Routes (中间层)
- **后端服务**: Python FastAPI (核心逻辑)

## 架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js UI   │────│  Next.js API   │────│  Python Agent  │
│   (Terminal)    │    │   (Wrapper)     │    │   (Core Logic)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
    WebSocket连接              HTTP调用                 插件系统
         │                       │                       │
    用户交互界面              中间件/缓存               AI资讯服务
```

## 部署步骤

### 1. 启动Python后端服务

```bash
# 方法1: 使用启动脚本 (推荐)
./scripts/start-agent-backend.sh

# 方法2: 手动启动
cd agent-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.main
```

后端服务将在 `http://localhost:8000` 启动

### 2. 配置Next.js环境变量

在项目根目录创建或更新 `.env.local`:

```bash
# Python后端服务地址
PYTHON_BACKEND_URL=http://localhost:8000
```

### 3. 启动Next.js应用

```bash
npm run dev
# 或
yarn dev
```

Next.js应用将在 `http://localhost:3000` 启动

### 4. 验证部署

1. 访问 `http://localhost:3000/agent` - 前端控制台界面
2. 访问 `http://localhost:8000/docs` - 后端API文档
3. 在控制台中输入 `/help` 测试功能

## 环境配置

### Python后端环境变量

在 `agent-backend/.env` 中配置：

```bash
# 应用配置
DEBUG=true
APP_NAME=AI News Agent
APP_VERSION=1.0.0

# 服务器配置
HOST=0.0.0.0
PORT=8000

# Redis配置 (可选)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# API Keys (可选)
OPENAI_API_KEY=your_openai_api_key_here
```

### Next.js环境变量

在项目根目录 `.env.local` 中配置：

```bash
# Python后端服务地址
PYTHON_BACKEND_URL=http://localhost:8000

# 其他配置...
```

## Docker部署

### 构建和运行Python后端

```bash
cd agent-backend

# 构建镜像
docker build -t ai-news-agent-backend .

# 运行容器
docker run -d \
  --name agent-backend \
  -p 8000:8000 \
  -e DEBUG=false \
  -e REDIS_HOST=redis \
  ai-news-agent-backend
```

### 使用Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'
services:
  agent-backend:
    build: ./agent-backend
    ports:
      - "8000:8000"
    environment:
      - DEBUG=false
      - REDIS_HOST=redis
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PYTHON_BACKEND_URL=http://agent-backend:8000
    depends_on:
      - agent-backend
```

启动所有服务：

```bash
docker-compose up -d
```

## 生产环境部署

### 1. Python后端生产配置

使用Gunicorn + Uvicorn:

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 2. Next.js生产构建

```bash
npm run build
npm start
```

### 3. 反向代理配置 (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Python后端API
    location /api/agent/ {
        proxy_pass http://localhost:8000/api/agent/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 故障排除

### 常见问题

1. **Python后端连接失败**
   - 检查后端服务是否启动: `curl http://localhost:8000/health`
   - 检查防火墙设置
   - 查看后端日志: `tail -f agent-backend/logs/agent.log`

2. **CORS错误**
   - 确认 `agent-backend/app/config.py` 中的 `ALLOWED_ORIGINS` 包含前端地址
   - 检查前端请求的URL是否正确

3. **命令无响应**
   - 检查浏览器开发者工具中的网络请求
   - 查看后端API文档: `http://localhost:8000/docs`
   - 测试后端API: `curl -X POST http://localhost:8000/api/agent/execute -H "Content-Type: application/json" -d '{"command":"/help","params":{}}'`

### 日志位置

- Python后端日志: `agent-backend/logs/agent.log`
- Next.js日志: 控制台输出
- Nginx日志: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`

## 监控和维护

### 健康检查端点

- 后端健康检查: `GET http://localhost:8000/health`
- 前端健康检查: `GET http://localhost:3000/api/health` (需要创建)

### 性能监控

建议使用以下工具监控服务状态：
- **后端**: Prometheus + Grafana
- **前端**: Next.js内置分析
- **系统**: htop, iostat, netstat

### 备份策略

- 配置文件备份: `.env`, `config.py`
- 日志轮转: 使用logrotate管理日志文件
- 数据库备份: 如果使用数据库存储数据

## 扩展指南

### 添加新插件

1. 在 `agent-backend/app/plugins/` 创建新插件文件
2. 继承 `BasePlugin` 类并实现必要方法
3. 在 `plugin_manager.py` 中注册插件
4. 重启后端服务

### 前端扩展

1. 更新 `lib/agent/plugin-manager.ts` 中的插件配置
2. 在 `formatStructuredResponse` 中添加新的响应格式处理
3. 更新UI组件支持新功能

## 安全考虑

1. **API安全**: 添加认证和授权机制
2. **输入验证**: 验证所有用户输入
3. **HTTPS**: 生产环境使用HTTPS
4. **环境变量**: 不要在代码中硬编码敏感信息
5. **日志安全**: 避免在日志中记录敏感信息

## 许可证

MIT License
