#!/bin/bash

# DouDou 全栈开发环境管理脚本（前端 + 后端）

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/agent-backend/docker/docker-compose.dev.yml"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_msg() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 检查 Docker
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker 未运行！请先启动 Docker Desktop"
        exit 1
    fi
}

# 检查 Node.js
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装"
        exit 1
    fi
}

# 启动后端
start_backend() {
    print_info "启动后端服务..."
    docker-compose -f "$COMPOSE_FILE" up -d agent-backend
    
    # 等待后端启动
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            print_msg "后端服务已启动"
            return 0
        fi
        sleep 1
        ((attempt++))
    done
    
    print_error "后端服务启动超时"
    return 1
}

# 启动前端
start_frontend() {
    print_info "启动前端服务..."
    cd "$PROJECT_ROOT"
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        print_info "安装前端依赖..."
        npm install
    fi
    
    # 启动前端
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warn "端口 3000 已被占用，前端可能已在运行"
    else
        nohup npm run dev > "$PROJECT_ROOT/frontend.log" 2>&1 &
        echo $! > "$PROJECT_ROOT/.frontend.pid"
        
        # 等待前端启动
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -s http://localhost:3000 > /dev/null 2>&1; then
                print_msg "前端服务已启动"
                return 0
            fi
            sleep 1
            ((attempt++))
        done
        
        print_error "前端服务启动超时"
        return 1
    fi
}

# 停止所有服务
stop_all() {
    print_info "停止所有服务..."
    
    # 停止后端
    docker-compose -f "$COMPOSE_FILE" stop agent-backend
    
    # 停止前端
    if [ -f "$PROJECT_ROOT/.frontend.pid" ]; then
        local pid=$(cat "$PROJECT_ROOT/.frontend.pid")
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            rm "$PROJECT_ROOT/.frontend.pid"
        fi
    fi
    
    print_msg "所有服务已停止"
}

# 显示状态
show_status() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  DouDou 开发环境状态"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 后端状态
    echo "🐳 后端服务:"
    docker-compose -f "$COMPOSE_FILE" ps agent-backend
    echo ""
    
    # 前端状态
    echo "🌐 前端服务:"
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  ✓ 运行中 (http://localhost:3000)"
    else
        echo "  ✗ 未运行"
    fi
    echo ""
}

# 显示服务信息
show_info() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  🎉 开发环境已启动"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 服务地址:"
    echo "  🐳 后端 API:    http://localhost:8000"
    echo "  📚 API 文档:    http://localhost:8000/docs"
    echo "  🌐 前端应用:    http://localhost:3000"
    echo "  🤖 Agent 页面:  http://localhost:3000/agent"
    echo ""
    echo "🛠️  常用命令:"
    echo "  查看状态:      ./scripts/startup/full-stack.sh status"
    echo "  查看后端日志:  ./scripts/startup/full-stack.sh logs"
    echo "  停止所有服务:  ./scripts/startup/full-stack.sh stop"
    echo ""
}

case "$1" in
  start)
    check_docker
    check_nodejs
    echo ""
    echo "🚀 启动 DouDou 全栈开发环境..."
    echo ""
    
    start_backend
    start_frontend
    show_info
    ;;
    
  stop)
    stop_all
    ;;
    
  restart)
    stop_all
    sleep 2
    $0 start
    ;;
    
  status)
    check_docker
    show_status
    ;;
    
  logs)
    check_docker
    echo "📋 后端日志 (Ctrl+C 退出):"
    docker-compose -f "$COMPOSE_FILE" logs -f agent-backend
    ;;
    
  frontend-logs)
    if [ -f "$PROJECT_ROOT/frontend.log" ]; then
        tail -f "$PROJECT_ROOT/frontend.log"
    else
        print_error "前端日志文件不存在"
    fi
    ;;
    
  *)
    echo "DouDou 全栈开发环境管理工具"
    echo ""
    echo "用法: ./scripts/startup/full-stack.sh [命令]"
    echo ""
    echo "命令:"
    echo "  start          - 启动前端和后端"
    echo "  stop           - 停止所有服务"
    echo "  restart        - 重启所有服务"
    echo "  status         - 查看服务状态"
    echo "  logs           - 查看后端日志"
    echo "  frontend-logs  - 查看前端日志"
    echo ""
    echo "示例:"
    echo "  ./scripts/startup/full-stack.sh start"
    echo "  ./scripts/startup/full-stack.sh status"
    echo "  ./scripts/startup/full-stack.sh logs"
    ;;
esac
