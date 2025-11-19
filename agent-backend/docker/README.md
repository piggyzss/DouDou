# Docker 配置目录

## Docker 简介

Docker 是一个开源的容器化平台，它允许开发者将应用程序及其依赖项打包到轻量级、可移植的容器中。容器提供了一致的运行环境，确保应用在不同环境（开发、测试、生产）中的行为一致。

### Docker 核心概念

- **镜像 (Image)**: 只读模板，包含运行应用所需的代码、运行时、库和依赖
- **容器 (Container)**: 镜像的运行实例，是应用的实际运行环境
- **Dockerfile**: 定义如何构建镜像的文本文件
- **Docker Compose**: 用于定义和运行多容器应用的工具

┌─────────────────────────────────────────────┐
│ 1. Dockerfile（设计图纸）                    │
│    - 指定工作目录                            │
│    - 安装依赖                                │
│    - 复制代码                                │
│    - 定义启动命令                            │
└─────────────────────────────────────────────┘
                    ↓ docker build
┌─────────────────────────────────────────────┐
│ 2. 镜像 Image（预制模块/模板）               │
│    - 静态的、只读的                          │
│    - 包含完整的运行环境                      │
│    - 可以复制使用                            │
└─────────────────────────────────────────────┘
                    ↓ docker run（可以多次）
┌─────────────────────────────────────────────┐
│ 3. 容器 Container（运行实例）                │
│    - 动态的、可读写的                        │
│    - 服务实际运行的地方                      │
│    - 一个镜像 → 多个容器 ✅                  │
│    - 一个容器 ← 一个镜像 ✅                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 4. Docker Compose（小区管理）                │
│    - 管理多个容器                            │
│    - 定义容器配置（端口、卷、网络）          │
│    - 编排容器启动顺序和依赖                  │
│    - 一键启动/停止所有容器                   │
└─────────────────────────────────────────────┘

✅ Dockerfile = 设计图纸（指定工作目录、安装依赖、复制代码等）
✅ docker build = 根据图纸构建镜像（模板）
✅ 镜像 = 静态模板，可以创建多个容器
✅ docker run = 运行镜像，创建容器
✅ 容器 = 镜像的运行实例
- 一个镜像 → 可以创建多个容器 ⭐
- 一个容器 ← 只能从一个镜像创建
✅ docker-compose.yml = 多容器编排管理
- 管理多个容器
- 定义容器配置
- 编排启动顺序
- 管理容器间通信

## 目录结构

```
docker/
├── README.md                    # 本文档
├── .dockerignore               # Docker 构建忽略文件
├── Dockerfile                  # 生产环境镜像定义
├── Dockerfile.dev              # 开发环境镜像定义
├── docker-compose.dev.yml      # 开发环境服务编排
└── backend.sh                  # 后端服务管理脚本
```

## 文件依赖关系

### 核心配置文件

#### 1. Dockerfile (生产环境)
**用途**: 定义生产环境的 Python 后端镜像

**特点**:
- 多阶段构建优化镜像大小
- 使用非 root 用户提高安全性
- 集成 Gunicorn 作为生产服务器
- 包含健康检查配置

**依赖**:
- `../requirements.txt` - Python 依赖列表
- `.dockerignore` - 构建时排除的文件

**被调用**: Vercel 部署时使用

---

#### 2. Dockerfile.dev (开发环境)
**用途**: 定义开发环境的 Python 后端镜像

**特点**:
- 包含开发工具 (vim, curl)
- 使用清华镜像源加速依赖安装
- 支持热重载 (uvicorn --reload)
- 包含额外的开发依赖

**依赖**:
- `../requirements.txt` - Python 依赖列表
- `.dockerignore` - 构建时排除的文件

**被调用**: `docker-compose.dev.yml` 构建开发容器

---

#### 3. docker-compose.dev.yml (服务编排)
**用途**: 定义和管理开发环境的多个服务

**服务定义**:
- `agent-backend`: Python 后端服务
  - 端口: 8000
  - 热重载: 挂载代码目录
  - 健康检查: `/health` 端点
  
- `redis`: 缓存服务 (可选)
  - 端口: 6379
  - 数据持久化: redis_data 卷

**依赖**:
- `Dockerfile.dev` - 构建后端镜像
- `backend.sh` - 通过脚本调用

**被调用**: 
- 开发者直接调用

---

### 管理脚本

#### 4. backend.sh (后端服务管理)
**用途**: 专注于后端 Docker 容器的管理

**可用命令**:
```bash
./backend.sh start    # 启动后端服务 (Docker)
./backend.sh stop     # 停止后端服务
./backend.sh restart  # 重启后端服务
./backend.sh logs     # 查看后端日志
./backend.sh shell    # 进入后端容器
./backend.sh test     # 运行测试
./backend.sh build    # 重新构建镜像
./backend.sh ps       # 查看容器状态
./backend.sh status   # 查看服务状态
```

**功能特性**:
- 专注于后端 Docker 服务管理
- 自动环境检查（Docker）
- 服务健康检查和等待
- 彩色输出和友好提示

**依赖**:
- `docker-compose.dev.yml` - 服务配置
- Docker 和 Docker Compose 环境

**注意**: 如需启动完整环境（前端+后端），请使用 `../../scripts/startup/full-stack.sh`

---

#### 5. .dockerignore
**用途**: 指定 Docker 构建时忽略的文件和目录

**排除内容**:
- Python 缓存和编译文件
- IDE 配置文件
- 测试和覆盖报告
- 日志文件
- 环境变量文件
- Git 仓库

**作用**: 减小镜像大小，加快构建速度

---

## 调用关系图

```
开发者
  │
  ├─→ scripts/startup/full-stack.sh (完整环境 - 推荐)
  │     ├─→ docker-compose.dev.yml (启动后端)
  │     │     └─→ Dockerfile.dev
  │     └─→ npm run dev (启动前端)
  │
  ├─→ backend.sh start (仅启动后端)
  │     └─→ docker-compose.dev.yml
  │           └─→ Dockerfile.dev
  │
  ├─→ backend.sh stop (停止后端)
  │     └─→ docker-compose.dev.yml
  │
  └─→ backend.sh [其他命令]
        └─→ docker-compose.dev.yml

生产部署
  │
  └─→ Dockerfile (Vercel 构建)
        └─→ requirements.txt
```

## 使用场景

### 场景 1: 启动完整开发环境（推荐）
```bash
# 使用全栈启动脚本（前端 + 后端）
./scripts/startup/full-stack.sh start

# 访问服务
# 前端: http://localhost:3000
# 后端: http://localhost:8000
# API 文档: http://localhost:8000/docs
```

### 场景 2: 仅启动后端服务
```bash
cd agent-backend/docker
./backend.sh start

# 查看日志
./backend.sh logs

# 进入容器调试
./backend.sh shell
```

### 场景 3: 查看服务状态
```bash
# 查看所有服务状态
./scripts/startup/full-stack.sh status

# 或仅查看后端状态
cd agent-backend/docker
./backend.sh status

```

### 场景 4: 停止服务
```bash
# 停止所有服务（前端 + 后端）
./scripts/startup/full-stack.sh stop

# 或仅停止后端
cd agent-backend/docker
./backend.sh stop
```

### 场景 5: 重新构建镜像
```bash
cd agent-backend/docker
./backend.sh build
./backend.sh start
```

### 场景 6: 重启后端服务

#### 使用重启脚本
```bash
cd agent-backend/docker
./restart-backend.sh
```

#### 手动重启方法

```bash
cd agent-backend/docker
docker-compose -f docker-compose.dev.yml restart
```

## 环境变量配置

### 开发环境 (docker-compose.dev.yml)
- `DEBUG=true` - 启用调试模式
- `APP_NAME=AI News Agent (Dev)` - 应用名称
- `HOST=0.0.0.0` - 监听地址
- `PORT=8000` - 服务端口
- `LOG_LEVEL=debug` - 日志级别
- `REDIS_HOST=redis` - Redis 主机
- `REDIS_PORT=6379` - Redis 端口

### 生产环境 (Dockerfile)
- `PYTHONUNBUFFERED=1` - 禁用 Python 输出缓冲
- `PYTHONDONTWRITEBYTECODE=1` - 禁止生成 .pyc 文件
- `PORT=8000` - 服务端口（Vercel 动态分配）
- `PYTHONPATH=/app` - Python 模块搜索路径

## 端口映射

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|---------|---------|------|
| agent-backend | 8000 | 8000 | Python 后端 API |
| redis | 6379 | 6379 | Redis 缓存服务 |
| frontend | 3000 | 3000 | Next.js 前端 (非容器) |

## 数据持久化

### 开发环境卷挂载
- `..:/app:cached` - 代码目录（支持热重载）
- `../logs:/app/logs` - 日志目录
- `redis_data:/data` - Redis 数据持久化

## 健康检查

### 后端服务
- **检查命令**: `curl -f http://localhost:8000/health`
- **检查间隔**: 30 秒
- **超时时间**: 10 秒
- **重试次数**: 3 次
- **启动等待**: 40 秒

### Redis 服务
- **检查命令**: `redis-cli ping`
- **检查间隔**: 30 秒
- **超时时间**: 10 秒
- **重试次数**: 3 次

## 故障排查

### 问题 1: Docker 未运行
```bash
# 错误: Cannot connect to the Docker daemon
# 解决: 启动 Docker Desktop
```

### 问题 2: 端口被占用
```bash
# 查看端口占用
lsof -i :8000
lsof -i :3000

# 停止占用进程
kill <PID>
```

### 问题 3: 容器启动失败
```bash
# 查看容器日志
cd agent-backend/docker
./backend.sh logs

# 查看容器状态
./backend.sh ps

# 重新构建镜像
./backend.sh build
```

### 问题 4: 热重载不工作
```bash
# 检查卷挂载
docker inspect doudou-agent-backend-dev | grep Mounts -A 20

# 重启容器
./backend.sh restart
```

## 性能优化

### 镜像优化
- 使用多阶段构建减小镜像大小
- 使用 `.dockerignore` 排除不必要文件
- 使用 Alpine 基础镜像（生产环境考虑）

### 构建优化
- 使用国内镜像源加速依赖安装
- 利用 Docker 层缓存机制
- 分离依赖安装和代码复制步骤

### 运行优化
- 使用 Gunicorn 多进程模式（生产环境）
- 配置合理的 worker 数量和超时时间
- 启用健康检查确保服务可用性

## 安全最佳实践

1. **非 root 用户**: 生产镜像使用 `appuser` 运行
2. **最小权限**: 只暴露必要的端口
3. **环境变量**: 敏感信息通过环境变量传递
4. **镜像扫描**: 定期扫描镜像漏洞
5. **网络隔离**: 使用 Docker 网络隔离服务

## 相关文档

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [后端设置指南](../../docs/backend-setup.md)
- [Agent 设计文档](../DESIGN.md)
- [Agent 使用指南](../GUIDE.md)
