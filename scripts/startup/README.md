# 启动脚本

全栈开发环境启动脚本，统一管理前端和后端服务。

## 🚀 快速开始

### 推荐方式：全栈启动

使用 `full-stack.sh` 一键启动前端和后端服务：

```bash
# 从项目根目录运行
./scripts/startup/full-stack.sh start
```

这将自动：
- ✅ 启动后端 Docker 容器（Python Agent）
- ✅ 启动前端开发服务器（Next.js）
- ✅ 检查服务健康状态
- ✅ 显示访问地址和常用命令

### NPM 快捷命令

在 package.json 中已配置快捷命令：

```bash
# 启动全栈环境
npm run dev:fullstack

# 停止全栈环境
npm run dev:fullstack:stop

# 查看状态
npm run dev:fullstack:status
```

## 📋 全栈管理命令

### `full-stack.sh` - 全栈环境管理

统一管理前端和后端服务的启动、停止和状态查看。

**支持的命令：**

```bash
# 启动所有服务
./scripts/startup/full-stack.sh start

# 查看服务状态
./scripts/startup/full-stack.sh status

# 查看后端日志
./scripts/startup/full-stack.sh logs

# 查看前端日志
./scripts/startup/full-stack.sh frontend-logs

# 停止所有服务
./scripts/startup/full-stack.sh stop

# 重启所有服务
./scripts/startup/full-stack.sh restart
```

**特点：**
- 全自动化启动流程
- 统一管理前后端服务
- 智能端口检测和服务健康检查
- 彩色输出和进度提示
- 跨平台支持（macOS/Linux）

## 📍 服务地址

启动成功后，可以访问：

| 服务          | 地址                        | 说明            |
| ------------- | --------------------------- | --------------- |
| 🌐 前端应用   | http://localhost:3000       | Next.js应用     |
| 🤖 Agent页面  | http://localhost:3000/agent | Agent功能页面   |
| 🐳 后端API    | http://localhost:8000       | FastAPI后端服务 |
| 📚 API文档    | http://localhost:8000/docs  | Swagger API文档 |

## 💡 使用提示

- 首次启动可能需要下载 Docker 镜像，请耐心等待
- 前端服务会在后台运行，日志保存在项目根目录的 `frontend.log`
- 后端容器支持热重载，修改代码会自动重启
- 使用 `Ctrl+C` 不会停止后台服务，请使用 `stop` 命令

## 🔧 后端独立管理

如果只需要管理后端服务，可以使用 `agent-backend/docker/` 目录下的脚本：

```bash
# 启动后端（包含前端）
./agent-backend/docker/start-dev-docker.sh

# 停止后端
./agent-backend/docker/stop-dev-docker.sh

# 后端服务管理
cd agent-backend/docker
./backend.sh start    # 启动后端容器
./backend.sh stop     # 停止后端容器
./backend.sh logs     # 查看日志
./backend.sh status   # 查看状态
```

## ⚠️ 注意事项

### 端口占用

确保以下端口未被占用：
- `3000`: Next.js前端
- `8000`: Python后端
- `6379`: Redis（如果使用）

### 系统要求

- Docker Desktop
- Node.js 18+
- 至少 4GB 可用内存

## 🐛 故障排查

### 服务启动失败

```bash
# 检查 Docker 状态
docker info

# 查看服务状态
./scripts/startup/full-stack.sh status

# 查看日志
./scripts/startup/full-stack.sh logs
```

### 端口被占用

```bash
# 查看端口占用
lsof -i :8000
lsof -i :3000

# 停止占用进程
kill -9 <PID>
```

### 重置环境

```bash
# 停止所有服务
./scripts/startup/full-stack.sh stop

# 清理 Docker 资源
docker system prune -a

# 重新启动
./scripts/startup/full-stack.sh start
```

## 🔗 相关文档

- [后端设置指南](../../docs/backend-setup.md)
- [Docker开发指南](../../docs/docker-development-guide.md)
- [Agent模块设计](../../agent-backend/DESIGN.md)
