# Docker Scripts

Docker相关脚本和配置文件，用于容器化开发环境管理。

## 📋 文件列表

### 🐳 Docker Compose配置

#### `docker-compose.dev.yml` ⭐ **核心配置**

- **用途**: 开发环境Docker Compose配置文件
- **功能**:
  - 定义Agent后端容器配置
  - 配置Redis缓存服务
  - 设置开发环境变量
  - 配置卷挂载和网络
- **服务**:
  - `agent-backend`: Python FastAPI后端服务
  - `redis`: Redis缓存服务

### 🚀 启动脚本

#### `start-dev-docker.sh` ⭐ **推荐使用**

- **用途**: 一键启动Docker混合开发环境
- **功能**:
  - 环境检查（Docker、Node.js等）
  - 端口冲突检测
  - 自动配置环境变量
  - 启动后端容器和Redis
  - 启动前端开发服务器
  - 显示服务信息和使用指南
- **命令**: `./scripts/docker/start-dev-docker.sh`
- **特点**:
  - 全自动化启动流程
  - 智能错误处理
  - 彩色输出和进度提示
  - 跨平台支持（macOS/Linux）

#### `stop-dev-docker.sh`

- **用途**: 停止Docker开发环境
- **功能**:
  - 停止并移除Docker容器
  - 可选清理Docker资源
  - 提醒手动停止前端服务
- **命令**: `./scripts/docker/stop-dev-docker.sh`

## 🚀 快速开始

### 一键启动开发环境

```bash
# 从项目根目录运行
./scripts/docker/start-dev-docker.sh
```

### 手动启动（高级用户）

```bash
# 1. 启动后端服务
docker-compose -f scripts/docker/docker-compose.dev.yml up -d agent-backend

# 2. 启动Redis（可选）
docker-compose -f scripts/docker/docker-compose.dev.yml up -d redis

# 3. 启动前端
npm run dev
```

### 停止环境

```bash
# 一键停止
./scripts/docker/stop-dev-docker.sh

# 或手动停止
docker-compose -f scripts/docker/docker-compose.dev.yml down
```

## 🔧 配置说明

### Docker Compose服务配置

#### Agent Backend服务

- **镜像**: 基于 `agent-backend/Dockerfile.dev` 构建
- **端口**: `8000:8000`
- **卷挂载**:
  - 代码目录: `./agent-backend:/app:cached`
  - 日志目录: `./agent-backend/logs:/app/logs`
- **环境变量**:
  - `DEBUG=true`
  - `HOST=0.0.0.0`
  - `PORT=8000`
  - `LOG_LEVEL=debug`
  - `REDIS_HOST=redis`
  - `REDIS_PORT=6379`
- **特性**:
  - 热重载支持
  - 健康检查
  - 自动重启

#### Redis服务

- **镜像**: `redis:7-alpine`
- **端口**: `6379:6379`
- **数据持久化**: `redis_data` 卷
- **用途**: 缓存和会话存储

### 网络配置

- **网络名**: `doudou-dev`
- **类型**: bridge
- **服务间通信**: 通过服务名访问

## 🛠️ 开发工作流

### 日常开发

1. **启动环境**

   ```bash
   ./scripts/docker/start-dev-docker.sh
   ```

2. **开发调试**
   - 后端: 代码自动热重载
   - 前端: 在IDE中正常调试
   - 日志: `docker-compose -f scripts/docker/docker-compose.dev.yml logs -f agent-backend`

3. **停止环境**
   ```bash
   ./scripts/docker/stop-dev-docker.sh
   ```

### 服务管理

```bash
# 查看服务状态
docker-compose -f scripts/docker/docker-compose.dev.yml ps

# 查看日志
docker-compose -f scripts/docker/docker-compose.dev.yml logs agent-backend
docker-compose -f scripts/docker/docker-compose.dev.yml logs redis

# 重启服务
docker-compose -f scripts/docker/docker-compose.dev.yml restart agent-backend

# 进入容器
docker-compose -f scripts/docker/docker-compose.dev.yml exec agent-backend bash
```

### 调试技巧

```bash
# 测试后端健康状态
curl http://localhost:8000/health

# 测试Redis连接
docker-compose -f scripts/docker/docker-compose.dev.yml exec redis redis-cli ping

# 查看容器资源使用
docker stats

# 清理未使用的资源
docker system prune
```

## 🌐 服务地址

启动成功后可访问以下服务：

| 服务          | 地址                        | 说明            |
| ------------- | --------------------------- | --------------- |
| 🐳 Python后端 | http://localhost:8000       | FastAPI后端服务 |
| 📚 API文档    | http://localhost:8000/docs  | Swagger API文档 |
| 🌐 前端应用   | http://localhost:3000       | Next.js应用     |
| 🤖 Agent页面  | http://localhost:3000/agent | Agent功能页面   |
| 📦 Redis      | localhost:6379              | Redis缓存服务   |

## ⚠️ 注意事项

### 端口占用

确保以下端口未被占用：

- `3000`: Next.js前端
- `8000`: Python后端
- `6379`: Redis

### 环境变量

脚本会自动配置 `.env.local` 文件中的 `PYTHON_BACKEND_URL`

### 数据持久化

- Redis数据存储在Docker卷中
- 代码修改实时同步到容器

### 系统要求

- Docker Desktop
- Node.js 16+
- 至少4GB可用内存

## 🐛 故障排查

### 常见问题

#### 1. Docker启动失败

```bash
# 检查Docker状态
docker info

# 重启Docker Desktop
# macOS: 重启Docker Desktop应用
# Linux: sudo systemctl restart docker
```

#### 2. 端口被占用

```bash
# 查看端口占用
lsof -i :8000
lsof -i :3000
lsof -i :6379

# 停止占用进程
kill -9 <PID>
```

#### 3. 容器启动失败

```bash
# 查看详细日志
docker-compose -f scripts/docker/docker-compose.dev.yml logs agent-backend

# 重新构建镜像
docker-compose -f scripts/docker/docker-compose.dev.yml build --no-cache agent-backend
```

#### 4. 前端连接后端失败

```bash
# 检查环境变量
cat .env.local | grep PYTHON_BACKEND_URL

# 测试后端连接
curl http://localhost:8000/health
```

### 重置环境

```bash
# 完全重置Docker环境
docker-compose -f scripts/docker/docker-compose.dev.yml down -v
docker system prune -a
./scripts/docker/start-dev-docker.sh
```

## 🔗 相关文档

- [Agent模块设计](../../docs/agent-module-design.md)
- [后端设置指南](../../docs/backend-setup.md)
- [本地开发指南](../../docs/local-development-guide.md)
- [Docker开发指南](../../docs/docker-development-guide.md)
