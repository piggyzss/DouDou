#!/bin/bash

# DouDou Agent 开发环境停止脚本

set -e

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 项目根目录 (脚本在 agent-backend/docker/ 下，所以根目录是 ../../)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 切换到项目根目录
cd "$PROJECT_ROOT"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_msg() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"
}

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                 停止DouDou Agent开发环境                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_msg "🛑 停止所有服务..."

# 停止前端服务
if [ -f ".frontend.pid" ]; then
    frontend_pid=$(cat .frontend.pid)
    if kill -0 $frontend_pid 2>/dev/null; then
        print_msg "停止前端服务 (PID: $frontend_pid)..."
        kill $frontend_pid
        rm .frontend.pid
        print_msg "✅ 前端服务已停止"
    else
        print_warn "前端服务进程不存在"
        rm .frontend.pid
    fi
else
    # 尝试通过端口停止前端服务
    frontend_pid=$(lsof -ti :3000 2>/dev/null || true)
    if [ ! -z "$frontend_pid" ]; then
        print_msg "停止端口3000上的服务 (PID: $frontend_pid)..."
        kill $frontend_pid
        print_msg "✅ 前端服务已停止"
    else
        print_warn "未找到运行在端口3000的服务"
    fi
fi

# 停止Docker容器
print_msg "停止Docker容器..."
cd "$PROJECT_ROOT/agent-backend/docker"
if ./backend.sh stop; then
    print_msg "✅ Docker容器已停止"
else
    print_warn "Docker容器可能已经停止或不存在"
fi
cd "$PROJECT_ROOT"

# 清理日志文件
if [ -f "frontend.log" ]; then
    rm frontend.log
    print_msg "✅ 清理日志文件"
fi

# 可选：清理未使用的镜像和卷
if [ -t 0 ]; then
    read -p "是否清理未使用的Docker资源？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_msg "🧹 清理Docker资源..."
        docker system prune -f
        print_msg "✅ Docker资源清理完成"
    fi
else
    print_msg "跳过Docker资源清理（非交互模式）"
fi

print_msg "🎉 开发环境已完全停止"
exit 0
