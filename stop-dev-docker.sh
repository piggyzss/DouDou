#!/bin/bash

# DouDou Agent 开发环境停止脚本

set -e

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

print_msg "🛑 停止Docker容器..."

# 停止并移除容器
if docker-compose -f docker-compose.dev.yml down; then
    print_msg "✅ Docker容器已停止"
else
    print_error "停止Docker容器时出错"
fi

# 可选：清理未使用的镜像和卷
read -p "是否清理未使用的Docker资源？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_msg "🧹 清理Docker资源..."
    docker system prune -f
    print_msg "✅ Docker资源清理完成"
fi

print_msg "🎉 开发环境已停止"
echo
print_warn "注意: Next.js前端服务需要手动停止（Ctrl+C）"
