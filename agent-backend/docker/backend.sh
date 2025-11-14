#!/bin/bash

# DouDou Agent 后端 Docker 服务管理脚本
# 专注于后端容器管理，前后端混合模式请使用 scripts/startup/full-stack.sh

set -e

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.dev.yml"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_msg() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"
}

print_info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO:${NC} $1"
}

# 检查 Docker 是否运行
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker 未运行！"
        echo "请先启动 Docker Desktop，然后重试。"
        exit 1
    fi
}

# 检查端口占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

# 等待服务启动
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    print_info "⏳ 等待 $name 启动..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_msg "✅ $name 启动成功"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "$name 启动超时"
            return 1
        fi
        
        sleep 2
        ((attempt++))
    done
}

case "$1" in
  start)
    check_docker
    print_msg "🚀 启动后端 Docker 服务..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    if [ $? -eq 0 ]; then
        if wait_for_service "http://localhost:8000/health" "后端服务"; then
            echo ""
            print_msg "✅ 后端服务已启动"
            echo "📍 后端 API: http://localhost:8000"
            echo "📍 API 文档: http://localhost:8000/docs"
            echo "📍 Redis: localhost:6379"
            echo ""
            print_info "查看日志: ./backend.sh logs"
            print_info "启动前端: ../../scripts/startup/full-stack.sh start"
        else
            print_error "后端启动失败，查看日志: ./backend.sh logs"
            exit 1
        fi
    else
        print_error "Docker 启动失败"
        exit 1
    fi
    ;;
    
  stop)
    check_docker
    print_msg "🛑 停止后端 Docker 服务..."
    docker-compose -f "$COMPOSE_FILE" down
    print_msg "✅ 后端服务已停止"
    ;;
    
  restart)
    check_docker
    echo "🔄 重启 Docker 开发环境..."
    docker-compose -f "$COMPOSE_FILE" restart
    echo "✅ 服务已重启"
    ;;
    
  logs)
    check_docker
    echo "📋 查看日志..."
    docker-compose -f "$COMPOSE_FILE" logs -f agent-backend
    ;;
    
  shell)
    check_docker
    echo "🐚 进入容器 shell..."
    docker-compose -f "$COMPOSE_FILE" exec agent-backend /bin/bash
    ;;
    
  test)
    check_docker
    echo "🧪 运行测试..."
    docker-compose -f "$COMPOSE_FILE" exec agent-backend python test_input_router.py
    ;;
    
  build)
    check_docker
    echo "🔨 重新构建镜像..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    echo "✅ 镜像构建完成"
    ;;
    
  ps)
    check_docker
    echo "📊 查看容器状态..."
    docker-compose -f "$COMPOSE_FILE" ps
    ;;
    
  status)
    check_docker
    echo "📊 Docker 服务状态："
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    echo "🔍 端口占用情况："
    echo -n "  后端 (8000): "
    if check_port 8000; then
        echo -e "${GREEN}运行中${NC}"
    else
        echo -e "${RED}未运行${NC}"
    fi
    echo -n "  Redis (6379): "
    if check_port 6379; then
        echo -e "${GREEN}运行中${NC}"
    else
        echo -e "${RED}未运行${NC}"
    fi
    ;;
    
  *)
    echo -e "${GREEN}DouDou Agent 后端 Docker 管理工具${NC}"
    echo ""
    echo "用法: ./backend.sh [命令]"
    echo ""
    echo -e "${YELLOW}可用命令:${NC}"
    echo "  start       - 启动后端服务 (Docker)"
    echo "  stop        - 停止后端服务"
    echo "  restart     - 重启后端服务"
    echo "  logs        - 查看后端日志"
    echo "  shell       - 进入后端容器"
    echo "  test        - 运行测试"
    echo "  build       - 重新构建镜像"
    echo "  ps          - 查看容器状态"
    echo "  status      - 查看服务状态"
    echo ""
    echo -e "${BLUE}💡 提示:${NC}"
    echo "  启动完整环境（前端+后端）请使用:"
    echo "  ${YELLOW}../../scripts/startup/full-stack.sh start${NC}"
    echo ""
    echo "示例:"
    echo "  ./backend.sh start          # 启动后端"
    echo "  ./backend.sh logs           # 查看日志"
    echo "  ./backend.sh shell          # 进入容器"
    ;;
esac
