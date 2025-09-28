# 本地开发环境启动指南

## 📋 概述

本指南将帮助你在本地环境中完整测试Agent功能，包括Python后端服务和Next.js前端的启动、配置和测试。

---

## 🔧 前置条件检查

### 环境要求

在开始之前，请确认你的开发环境满足以下要求：

```bash
# 检查Node.js版本（需要18+）
node --version

# 检查Python版本（需要3.11+）
python3 --version

# 检查npm和项目依赖
npm --version
npm list --depth=0
```

### 必需的工具

- **Node.js** 18+ 
- **Python** 3.11+
- **Git**
- **终端/命令行工具**

### 可选工具

- **Redis** (用于缓存功能测试)
- **curl** (用于API测试)

---

## 🚀 快速启动（推荐）

### 使用现有启动脚本

项目已提供了便捷的启动脚本：

```bash
# 启动Python后端服务
./scripts/start-agent-backend.sh
```

这个脚本会自动：
- 创建Python虚拟环境
- 安装依赖包
- 配置环境变量
- 启动后端服务

### 启动前端服务

在新的终端窗口中：

```bash
# 确保在项目根目录
cd /DouDou

# 启动Next.js前端服务
npm run dev
```





---

## 📝 详细步骤说明

### 1️⃣ Python Agent后端服务启动

#### 步骤1: 进入后端目录
```bash
cd agent-backend
```

#### 步骤2: 创建Python虚拟环境
```bash
# 创建虚拟环境（首次运行）
python3 -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate

# Windows:
# venv\Scripts\activate

# 验证虚拟环境
which python  # 应该显示虚拟环境中的python路径
```

#### 步骤3: 安装Python依赖
```bash
# 安装所有依赖包
pip install -r requirements.txt

# 验证安装
pip list
```

#### 步骤4: 配置环境变量（可选）
```bash
# 创建环境配置文件
cat > .env << EOF
# 应用配置
DEBUG=true
APP_NAME=AI News Agent
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=debug

# CORS配置
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# 可选配置
# OPENAI_API_KEY=your_openai_key_here
# REDIS_HOST=localhost
# REDIS_PORT=6379
EOF
```

#### 步骤5: 启动后端服务
```bash
# 方法1: 直接启动（推荐开发环境）
python -m app.main

# 方法2: 使用uvicorn（带热重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 方法3: 使用启动脚本
# cd .. && ./scripts/start-agent-backend.sh
```

#### 步骤6: 验证后端服务
```bash
# 在新终端窗口测试健康检查
curl http://localhost:8000/health

# 预期响应:
# {"status":"healthy","service":"agent-backend"}

# 查看API文档
open http://localhost:8000/docs

# 测试Agent执行接口
curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "/help", "params": {}}'
```

### 2️⃣ Next.js前端服务启动

#### 步骤1: 回到项目根目录
```bash
# 在新终端窗口
cd /DouDou
```

#### 步骤2: 配置前端环境变量
```bash
# 检查.env.local文件
cat .env.local

# 如果没有PYTHON_BACKEND_URL，添加它
echo "PYTHON_BACKEND_URL=http://localhost:8000" >> .env.local

# 验证配置
grep PYTHON_BACKEND_URL .env.local
```

#### 步骤3: 安装前端依赖（如果需要）
```bash
# 检查依赖是否完整
npm list

# 如果有缺失，重新安装
npm install
```

#### 步骤4: 启动前端服务
```bash
# 启动开发服务器
npm run dev

# 预期输出类似:
# ▲ Next.js 14.0.0
# - Local:        http://localhost:3000
# - Network:      http://192.168.1.100:3000
```

#### 步骤5: 验证前端服务
```bash
# 访问主页
open http://localhost:3000

# 访问Agent页面
open http://localhost:3000/agent

# 测试前端API包装层
curl -X GET http://localhost:3000/api/agent/execute
```

---

## 🧪 功能测试流程

### 基础功能测试

在浏览器中访问 `http://localhost:3000/agent`，测试以下功能：

#### 1. 终端界面测试
```bash
# 在Agent终端界面输入以下命令：

# 查看帮助信息
/help

# 查看可用插件
/plugins

# 查看所有命令
/commands

# 测试健康检查
/health
```

#### 2. 新闻插件测试（如果已实现）
```bash
# 获取最新AI资讯
/latest

# 搜索特定关键词
/search AI

# 查看新闻分类
/categories

# 获取热门趋势
/trending
```

#### 3. 交互功能测试
```bash
# 命令历史（使用上下箭头键）
↑ ↓

# 命令自动补全（使用Tab键）
/la[Tab]  # 应该补全为/latest

# 清屏功能
clear

# 多行输入测试
# 输入长命令测试换行
```

### API直接测试

#### 后端API测试
```bash
# 测试各种命令
curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "/help", "params": {}}'

curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "/latest", "params": {"count": 5}}'

# 测试插件列表
curl http://localhost:8000/api/agent/plugins

# 测试命令列表
curl http://localhost:8000/api/agent/commands
```

#### 前端API包装层测试
```bash
# 测试前端代理
curl -X POST http://localhost:3000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "/help", "params": {}}'

# 测试错误处理（当后端未启动时）
# 先停止Python后端，然后测试
curl -X POST http://localhost:3000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "/test", "params": {}}'
```

---
@shanshan
## 🔧 可选服务配置

### Redis缓存服务

如果你想测试完整的缓存功能：

#### macOS安装启动
```bash
# 安装Redis
brew install redis

# 启动Redis服务
brew services start redis

# 验证连接
redis-cli ping
# 预期响应: PONG

# 查看Redis状态
brew services list | grep redis
```

#### Ubuntu/Debian安装启动
```bash
# 安装Redis
sudo apt update
sudo apt install redis-server

# 启动Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 验证连接
redis-cli ping

# 查看状态
sudo systemctl status redis-server
```

#### Redis配置验证
```bash
# 测试缓存功能
redis-cli set test "Hello World"
redis-cli get test

# 查看Redis配置
redis-cli config get "*"

# 监控Redis操作
redis-cli monitor
```

---

## 🛠️ 一键启动脚本

### 创建完整启动脚本

```bash
# 创建自动化启动脚本
cat > start-agent-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 启动Agent开发环境..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查前置条件
echo "🔍 检查前置条件..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js未安装${NC}"
    exit 1
fi

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 前置条件检查通过${NC}"

# 启动Python后端服务
echo "📦 检查Python后端服务..."
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "🐍 启动Python后端服务..."
    cd agent-backend
    
    # 创建虚拟环境
    if [ ! -d "venv" ]; then
        echo "📥 创建Python虚拟环境..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 安装依赖
    echo "📦 安装Python依赖..."
    pip install -r requirements.txt > /dev/null 2>&1
    
    # 启动服务
    echo "🚀 启动Python服务..."
    python -m app.main &
    PYTHON_PID=$!
    cd ..
    
    # 等待服务启动
    echo -e "${YELLOW}⏳ 等待Python服务启动...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:8000/health > /dev/null; then
            echo -e "${GREEN}✅ Python服务启动成功${NC}"
            break
        fi
        sleep 1
    done
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Python服务启动超时${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Python服务已运行${NC}"
fi

# 检查前端环境变量
echo "🔧 检查前端配置..."
if ! grep -q "PYTHON_BACKEND_URL" .env.local 2>/dev/null; then
    echo "📝 配置前端环境变量..."
    echo "PYTHON_BACKEND_URL=http://localhost:8000" >> .env.local
fi

# 启动Next.js服务
echo "🌐 启动Next.js前端服务..."
echo -e "${YELLOW}📝 前端服务将在 http://localhost:3000 启动${NC}"
echo -e "${YELLOW}🤖 Agent页面: http://localhost:3000/agent${NC}"

npm run dev &
NEXTJS_PID=$!

# 清理函数
cleanup() {
    echo -e "\n${YELLOW}🧹 清理进程...${NC}"
    if [ ! -z "$PYTHON_PID" ]; then
        kill $PYTHON_PID 2>/dev/null
        echo "🐍 Python服务已停止"
    fi
    if [ ! -z "$NEXTJS_PID" ]; then
        kill $NEXTJS_PID 2>/dev/null
        echo "🌐 Next.js服务已停止"
    fi
    exit 0
}

# 设置信号处理
trap cleanup INT TERM

echo -e "${GREEN}🎉 开发环境启动完成！${NC}"
echo -e "${GREEN}🔗 Agent页面: http://localhost:3000/agent${NC}"
echo -e "${GREEN}📚 API文档: http://localhost:8000/docs${NC}"
echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"

# 等待用户中断
wait
EOF

# 使脚本可执行
chmod +x start-agent-dev.sh

echo "✅ 启动脚本创建完成: ./start-agent-dev.sh"
```

### 使用启动脚本

```bash
# 运行一键启动脚本
./start-agent-dev.sh

# 或者使用现有脚本
./scripts/start-agent-backend.sh
# 然后在新终端运行
npm run dev
```

---

## 🚨 故障排除

### 常见问题及解决方案

#### 1. 端口占用问题
```bash
# 检查端口占用
lsof -i :8000  # Python后端端口
lsof -i :3000  # Next.js前端端口

# 杀死占用进程
kill -9 $(lsof -ti:8000)
kill -9 $(lsof -ti:3000)

# 或者使用不同端口启动
python -m app.main --port 8001
npm run dev -- --port 3001
```

#### 2. Python依赖问题
```bash
# 清理并重新安装依赖
pip uninstall -r requirements.txt -y
pip install -r requirements.txt

# 升级pip
pip install --upgrade pip

# 查看安装的包
pip list
pip show fastapi
```

#### 3. Node.js依赖问题
```bash
# 清理node_modules并重新安装
rm -rf node_modules package-lock.json
npm install

# 检查Node.js版本兼容性
node --version
npm --version

# 更新依赖
npm update
```

#### 4. 环境变量问题
```bash
# 检查环境变量
echo $PYTHON_BACKEND_URL
cat .env.local

# 重新加载环境变量
source .env.local  # bash
set -a; source .env.local; set +a  # 确保导出
```

#### 5. CORS跨域问题
```bash
# 检查后端CORS配置
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8000/api/agent/execute

# 在agent-backend/.env中添加:
# ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 日志查看和调试

#### Python后端日志
```bash
# 查看实时日志（如果配置了日志文件）
tail -f agent-backend/logs/agent.log

# 或者在启动时查看控制台输出
cd agent-backend
source venv/bin/activate
python -m app.main

# 调试模式启动
DEBUG=true python -m app.main
```

#### Next.js前端日志
```bash
# Next.js日志会直接显示在控制台
npm run dev

# 查看网络请求（在浏览器中）
# 打开浏览器开发者工具 -> Network标签
# 发送Agent命令，观察请求和响应
```

#### 进程状态检查
```bash
# 查看运行的进程
ps aux | grep python
ps aux | grep node

# 查看端口监听状态
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000

# 查看系统资源使用
top
htop  # 如果安装了htop
```

---

## 📊 性能监控

### 服务状态监控

```bash
# 创建监控脚本
cat > monitor-services.sh << 'EOF'
#!/bin/bash

while true; do
    echo "=== $(date) ==="
    
    # 检查Python后端
    if curl -s http://localhost:8000/health > /dev/null; then
        echo "✅ Python Backend: Running"
    else
        echo "❌ Python Backend: Down"
    fi
    
    # 检查Next.js前端
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Next.js Frontend: Running"
    else
        echo "❌ Next.js Frontend: Down"
    fi
    
    # 检查Redis（如果启用）
    if redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis: Running"
    else
        echo "⚠️ Redis: Not available"
    fi
    
    echo "---"
    sleep 10
done
EOF

chmod +x monitor-services.sh
./monitor-services.sh
```

### 性能测试

```bash
# API响应时间测试
curl -w "@-" -s -o /dev/null http://localhost:8000/health << 'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF

# 并发测试（需要安装ab工具）
# 安装: brew install httpd (macOS) 或 sudo apt install apache2-utils (Ubuntu)
ab -n 100 -c 10 http://localhost:8000/health
```

---

## 🎯 测试完成验证

### 功能验证清单

完成启动后，请验证以下功能：

- [ ] ✅ Python后端服务正常启动 (`http://localhost:8000/health`)
- [ ] ✅ Next.js前端服务正常启动 (`http://localhost:3000`)
- [ ] ✅ Agent页面可以访问 (`http://localhost:3000/agent`)
- [ ] ✅ 终端界面正常显示
- [ ] ✅ `/help` 命令执行成功并返回帮助信息
- [ ] ✅ `/plugins` 命令显示可用插件
- [ ] ✅ API文档可以访问 (`http://localhost:8000/docs`)
- [ ] ✅ 前后端通信正常（无CORS错误）
- [ ] ✅ 命令历史功能正常（上下箭头键）
- [ ] ✅ 实时响应显示正常

### 清理和停止服务

```bash
# 停止所有服务
# 在各个运行的终端中按 Ctrl+C

# 或者使用进程ID停止
kill $PYTHON_PID
kill $NEXTJS_PID

# 停止Redis（如果启动了）
brew services stop redis  # macOS
sudo systemctl stop redis-server  # Ubuntu

# 退出Python虚拟环境
deactivate

# 查看是否还有残留进程
ps aux | grep -E "(python|node)" | grep -v grep
```

---

## 📚 相关文档

- **[Agent模块设计](./agent-module-design.md)** - Agent架构和设计理念
- **[后端技术架构](./backend-setup.md)** - Python后端技术栈详解
- **[部署指南](./deployment-guide.md)** - 生产环境部署
- **[测试指南](./testing-guide.md)** - 完整测试流程

---

## 💡 开发建议

### 提高开发效率

1. **使用IDE插件**: 安装Python和TypeScript相关插件
2. **配置代码格式化**: 设置自动格式化和linting
3. **使用Git Hooks**: 提交前自动检查代码质量
4. **监控文件变化**: 使用nodemon或类似工具自动重启服务

### 调试技巧

1. **使用浏览器开发者工具**: 监控网络请求和控制台输出
2. **Python调试**: 使用pdb或IDE断点调试
3. **日志分级**: 在开发环境启用详细日志
4. **API测试工具**: 使用Postman或类似工具测试API

这样，你就可以在本地环境中完整地开发和测试Agent功能了！
