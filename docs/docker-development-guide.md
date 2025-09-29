# Docker混合模式开发指南

## 📋 概述

本指南介绍如何使用Docker混合模式进行DouDou Agent开发，解决Python依赖管理问题的同时保持前端开发的便利性。

## 🏗️ 架构设计

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

### 核心优势

- ✅ **解决依赖问题**: Python环境完全容器化，不再有版本冲突
- ✅ **保持调试体验**: 前端运行在本地，Cursor调试功能完全可用
- ✅ **热重载支持**: 代码修改后自动重启，开发效率高
- ✅ **环境一致性**: 开发环境与生产环境保持一致
- ✅ **一键启动**: 简化的启动流程，降低学习成本

---

## 🚀 快速开始

### 前置要求

- **Docker Desktop**: 已安装并运行
- **Node.js**: 18+ 版本
- **Git**: 版本控制

### 一键启动开发环境

```bash
# 1. 启动混合开发环境
./scripts/docker/start-dev-docker.sh

# 2. 等待启动完成，访问服务
# - 前端: http://localhost:3000
# - 后端: http://localhost:8000
# - Agent: http://localhost:3000/agent
```

### 停止开发环境

```bash
# 停止Docker容器
./scripts/docker/stop-dev-docker.sh

# 手动停止前端服务（在前端终端中按 Ctrl+C）
```

---

## 📁 文件结构

```
DouDou/
├── scripts/
│   └── docker/
│       ├── start-dev-docker.sh     # 一键启动脚本
│       ├── stop-dev-docker.sh      # 停止脚本
│       └── docker-compose.dev.yml  # 开发环境Docker编排
├── agent-backend/
│   ├── Dockerfile.dev               # 开发专用镜像
│   ├── .dockerignore               # Docker忽略文件
│   └── ...                         # Python源码
└── app/                            # Next.js前端（本地运行）
    └── ...
```

---

## 🔧 详细配置说明

### Docker Compose服务

#### agent-backend服务
```yaml
agent-backend:
  build:
    context: ./agent-backend
    dockerfile: Dockerfile.dev      # 使用开发专用Dockerfile
  ports:
    - "8000:8000"                   # 映射端口
  volumes:
    - ./agent-backend:/app:cached   # 代码热重载
  environment:
    - DEBUG=true                    # 开发模式
    - ALLOWED_ORIGINS=http://localhost:3000  # CORS配置
```

#### redis服务（可选）
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"                   # Redis端口
  volumes:
    - redis_data:/data              # 数据持久化
```

### 环境变量配置

开发环境会自动配置以下环境变量：

**Python后端环境变量:**
- `DEBUG=true` - 开发模式
- `LOG_LEVEL=debug` - 详细日志
- `ALLOWED_ORIGINS=http://localhost:3000` - CORS配置

**前端环境变量 (.env.local):**
- `PYTHON_BACKEND_URL=http://localhost:8000` - 后端服务地址

---

## 🛠️ 开发工作流

### 日常开发流程

1. **启动开发环境**
   ```bash
   ./scripts/docker/start-dev-docker.sh
   ```

2. **代码开发**
   - **前端代码**: 直接在Cursor中编辑，支持热重载和断点调试
   - **后端代码**: 编辑后容器自动重启，无需手动操作

3. **测试验证**
   ```bash
   # 测试后端API
   curl http://localhost:8000/health
   
   # 测试Agent功能
   # 访问 http://localhost:3000/agent
   # 输入命令如: /help, /latest
   ```

4. **查看日志**
   ```bash
   # 查看后端日志
   docker-compose -f scripts/docker/docker-compose.dev.yml logs -f agent-backend
   
   # 查看所有服务状态
   docker-compose -f scripts/docker/docker-compose.dev.yml ps
   ```

### 代码热重载机制

#### 前端热重载
- **机制**: Next.js内置热重载
- **触发**: 保存TypeScript/React文件
- **效果**: 浏览器自动刷新，状态保持

#### 后端热重载
- **机制**: uvicorn `--reload` 参数 + Docker volumes
- **触发**: 保存Python文件
- **效果**: 容器内服务自动重启

### 调试指南

#### 前端调试（Cursor）
```typescript
// 在Cursor中设置断点正常工作
export default function AgentPage() {
  const [command, setCommand] = useState('')
  
  const handleSubmit = async () => {
    debugger; // 断点会正常触发
    // ... 调试代码
  }
}
```

#### 后端调试（日志）
```python
# Python代码中使用日志调试
from loguru import logger

async def execute_command(request: AgentRequest):
    logger.debug(f"Executing command: {request.command}")
    # ... 处理逻辑
    logger.info(f"Command result: {result}")
```

---

## 🧪 测试和验证

### 服务健康检查

```bash
# 1. 检查所有服务状态
docker-compose -f scripts/docker/docker-compose.dev.yml ps

# 2. 测试后端健康
curl http://localhost:8000/health

# 3. 测试前端访问
curl http://localhost:3000

# 4. 测试Agent API
curl -X POST http://localhost:3000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "/help", "params": {}}'
```

### 功能测试

在浏览器中访问 `http://localhost:3000/agent` 并测试：

```bash
# 基础命令测试
/help                    # 查看帮助
/plugins                 # 查看插件
/latest                  # 获取资讯（如果实现）

# 错误处理测试
/nonexistent            # 测试错误处理
```

---

## 🚨 故障排除

### 常见问题及解决方案

#### 1. Docker容器启动失败

**问题**: 容器无法启动或立即退出
```bash
# 查看详细错误日志
docker-compose -f scripts/docker/docker-compose.dev.yml logs agent-backend

# 检查Dockerfile语法
docker build -f agent-backend/Dockerfile.dev agent-backend/

# 重新构建镜像
docker-compose -f scripts/docker/docker-compose.dev.yml build --no-cache
```

#### 2. 端口占用问题

**问题**: 端口8000或3000被占用
```bash
# 查看端口占用
lsof -i :8000
lsof -i :3000

# 杀死占用进程
kill -9 $(lsof -ti:8000)

# 或修改端口配置
# 在docker-compose.dev.yml中修改端口映射
```

#### 3. 热重载不工作

**问题**: 代码修改后没有自动重启

**后端热重载问题:**
```bash
# 检查volumes挂载
docker-compose -f scripts/docker/docker-compose.dev.yml exec agent-backend ls -la /app

# 重启服务
docker-compose -f scripts/docker/docker-compose.dev.yml restart agent-backend
```

**前端热重载问题:**
```bash
# 清理Next.js缓存
rm -rf .next
npm run dev
```

#### 4. CORS跨域错误

**问题**: 前端无法访问后端API

```bash
# 检查后端CORS配置
docker-compose -f scripts/docker/docker-compose.dev.yml exec agent-backend env | grep ALLOWED_ORIGINS

# 测试CORS预检请求
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8000/api/agent/execute
```

#### 5. 依赖安装失败

**问题**: Python依赖无法安装

```bash
# 进入容器手动安装
docker-compose -f scripts/docker/docker-compose.dev.yml exec agent-backend bash
pip install -r requirements.txt

# 重新构建镜像
docker-compose -f scripts/docker/docker-compose.dev.yml build --no-cache agent-backend
```

### 日志查看命令

```bash
# 查看所有服务日志
docker-compose -f scripts/docker/docker-compose.dev.yml logs

# 查看特定服务日志
docker-compose -f scripts/docker/docker-compose.dev.yml logs -f agent-backend
docker-compose -f scripts/docker/docker-compose.dev.yml logs -f redis

# 查看最近的日志
docker-compose -f scripts/docker/docker-compose.dev.yml logs --tail 50 agent-backend
```

---

## 🔄 版本管理和更新

### 依赖更新

#### 前端依赖更新
```bash
# 在本地更新
npm update
npm audit fix

# 重启前端服务
npm run dev
```

#### 后端依赖更新
```bash
# 更新requirements.txt后重新构建
docker-compose -f scripts/docker/docker-compose.dev.yml build --no-cache agent-backend
docker-compose -f scripts/docker/docker-compose.dev.yml up -d agent-backend
```

### 镜像管理

```bash
# 查看镜像大小
docker images | grep doudou

# 清理旧镜像
docker image prune -f

# 重新构建所有镜像
docker-compose -f scripts/docker/docker-compose.dev.yml build --no-cache
```

---

## 📊 性能优化

### Docker性能优化

#### 1. 使用缓存优化构建
```dockerfile
# 在Dockerfile.dev中，依赖安装放在前面
COPY requirements.txt .
RUN pip install -r requirements.txt
# 代码复制放在后面
COPY . .
```

#### 2. 优化volumes挂载
```yaml
# 使用cached选项（macOS）
volumes:
  - ./agent-backend:/app:cached
```

#### 3. 减少镜像大小
```bash
# 查看镜像分层
docker history doudou-agent-backend-dev

# 清理不必要的文件
# 在.dockerignore中添加更多排除项
```

### 监控资源使用

```bash
# 查看容器资源使用
docker stats

# 查看Docker磁盘使用
docker system df

# 定期清理
docker system prune -a
```

---

## 🔗 与生产环境对接

### 环境一致性

开发环境和生产环境使用相同的：
- **Docker基础镜像**: python:3.11-slim
- **Python依赖**: requirements.txt
- **环境变量结构**: 相同的配置项

### 生产部署准备

```bash
# 测试生产版本构建
docker build -f agent-backend/Dockerfile agent-backend/

# 验证生产环境配置
docker run -e DEBUG=false -p 8000:8000 your-production-image
```

---

## 📚 扩展资料

### 相关文档
- **[本地开发指南](./local-development-guide.md)** - 传统开发环境
- **[后端技术架构](./backend-setup.md)** - 技术栈详解
- **[部署指南](./deployment-guide.md)** - 生产环境部署

### 有用的Docker命令

```bash
# 进入容器
docker-compose -f scripts/docker/docker-compose.dev.yml exec agent-backend bash

# 查看容器详情
docker inspect doudou-agent-backend-dev

# 复制文件到容器
docker cp file.txt doudou-agent-backend-dev:/app/

# 从容器复制文件
docker cp doudou-agent-backend-dev:/app/logs ./logs
```

---

## 💡 最佳实践

1. **定期更新**: 保持Docker镜像和依赖的最新版本
2. **日志管理**: 合理配置日志级别，避免日志过多
3. **资源清理**: 定期清理未使用的镜像和容器
4. **备份重要数据**: 如Redis数据和日志文件
5. **团队协作**: 将Docker配置文件加入版本控制

使用这个混合模式开发环境，你将享受到容器化的便利和本地开发的效率！🚀
