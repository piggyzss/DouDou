#!/bin/bash

# Docker 开发环境快捷命令

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.dev.yml"

echo "📂 使用配置: $COMPOSE_FILE"

# 检查 Docker 是否运行
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker 未运行！"
        echo "请先启动 Docker Desktop，然后重试。"
        exit 1
    fi
}

case "$1" in
  start)
    check_docker
    echo "🚀 启动 Docker 开发环境..."
    echo "📂 使用配置: $COMPOSE_FILE"
    docker-compose -f "$COMPOSE_FILE" up -d
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ 服务已启动"
        echo "📍 后端: http://localhost:8000"
        echo "📍 API 文档: http://localhost:8000/docs"
        echo ""
        echo "💡 提示: 使用 './docker-dev.sh logs' 查看日志"
    else
        echo "❌ 启动失败，请检查日志"
        exit 1
    fi
    ;;
    
  stop)
    check_docker
    echo "🛑 停止 Docker 开发环境..."
    docker-compose -f "$COMPOSE_FILE" down
    echo "✅ 服务已停止"
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
    echo "📊 服务状态："
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    echo "🔍 检查端口："
    lsof -i :8000 2>/dev/null || echo "端口 8000 未被占用"
    ;;
    
  *)
    echo "Docker 开发环境管理工具"
    echo ""
    echo "用法: ./docker-dev.sh [命令]"
    echo ""
    echo "命令:"
    echo "  start    - 启动服务"
    echo "  stop     - 停止服务"
    echo "  restart  - 重启服务"
    echo "  logs     - 查看日志"
    echo "  shell    - 进入容器"
    echo "  test     - 运行测试"
    echo "  build    - 重新构建镜像"
    echo "  ps       - 查看容器状态"
    echo "  status   - 查看详细状态"
    echo ""
    echo "示例:"
    echo "  ./docker-dev.sh start"
    echo "  ./docker-dev.sh logs"
    echo "  ./docker-dev.sh shell"
    ;;
esac
