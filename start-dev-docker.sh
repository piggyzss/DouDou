#!/bin/bash

# DouDou Agent 混合模式开发环境启动脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
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

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker未安装，请先安装Docker"
        print_info "安装指南: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker未运行，请启动Docker Desktop"
        exit 1
    fi
    
    print_msg "✅ Docker环境检查通过"
}

# 检查Docker Compose
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose未安装"
        exit 1
    fi
    print_msg "✅ Docker Compose检查通过"
}

# 检查端口占用
check_ports() {
    local ports=("3000" "8000" "6379")
    local occupied_ports=()
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            occupied_ports+=($port)
        fi
    done
    
    if [ ${#occupied_ports[@]} -gt 0 ]; then
        print_warn "以下端口被占用: ${occupied_ports[*]}"
        print_info "如果是旧的开发服务，请先停止它们"
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 配置环境变量
setup_env() {
    print_msg "🔧 配置环境变量..."
    
    # 检查.env.local文件
    if [ ! -f ".env.local" ]; then
        print_warn ".env.local文件不存在，创建默认配置"
        touch .env.local
    fi
    
    # 确保PYTHON_BACKEND_URL正确配置
    if ! grep -q "PYTHON_BACKEND_URL" .env.local; then
        echo "PYTHON_BACKEND_URL=http://localhost:8000" >> .env.local
        print_msg "已添加PYTHON_BACKEND_URL配置"
    else
        # 更新为localhost地址
        sed -i.bak 's|PYTHON_BACKEND_URL=.*|PYTHON_BACKEND_URL=http://localhost:8000|' .env.local
        print_msg "已更新PYTHON_BACKEND_URL配置"
    fi
}

# 启动后端容器
start_backend() {
    print_msg "🐳 启动Python Agent后端容器..."
    
    # 构建并启动后端容器
    docker-compose -f docker-compose.dev.yml up -d agent-backend
    
    # 等待服务启动
    print_info "⏳ 等待后端服务启动..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            print_msg "✅ Python后端服务启动成功"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "后端服务启动超时"
            print_info "查看日志: docker-compose -f docker-compose.dev.yml logs agent-backend"
            exit 1
        fi
        
        sleep 2
        ((attempt++))
    done
}

# 启动Redis（可选）
start_redis() {
    print_msg "📦 启动Redis缓存服务..."
    docker-compose -f docker-compose.dev.yml up -d redis
    
    # 等待Redis启动
    sleep 3
    if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
        print_msg "✅ Redis服务启动成功"
    else
        print_warn "Redis服务启动可能有问题，但不影响基本功能"
    fi
}

# 检查Node.js环境
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm未安装，请先安装npm"
        exit 1
    fi
    
    print_msg "✅ Node.js环境检查通过"
}

# 安装前端依赖
install_frontend_deps() {
    print_msg "📦 检查前端依赖..."
    
    if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
        print_info "安装前端依赖..."
        npm install
    else
        print_msg "前端依赖已安装"
    fi
}

# 启动前端
start_frontend() {
    print_msg "🌐 启动Next.js前端服务..."
    print_info "前端将在新终端窗口中启动"
    
    # 检测操作系统并在新终端中启动前端
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && npm run dev\""
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - 尝试不同的终端
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd $(pwd) && npm run dev; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -e "cd $(pwd) && npm run dev; bash" &
        else
            print_warn "无法自动启动新终端，请手动运行: npm run dev"
        fi
    else
        print_warn "无法自动启动新终端，请手动运行: npm run dev"
    fi
}

# 显示服务信息
show_info() {
    echo
    print_msg "🎉 开发环境启动完成！"
    echo
    echo -e "${GREEN}📋 服务信息:${NC}"
    echo -e "  🐳 Python后端: ${BLUE}http://localhost:8000${NC}"
    echo -e "  📚 API文档:    ${BLUE}http://localhost:8000/docs${NC}"
    echo -e "  🌐 前端应用:   ${BLUE}http://localhost:3000${NC}"
    echo -e "  🤖 Agent页面:  ${BLUE}http://localhost:3000/agent${NC}"
    echo -e "  📦 Redis:      ${BLUE}localhost:6379${NC}"
    echo
    echo -e "${GREEN}🛠️ 开发工具:${NC}"
    echo -e "  查看后端日志: ${YELLOW}docker-compose -f docker-compose.dev.yml logs -f agent-backend${NC}"
    echo -e "  查看所有服务: ${YELLOW}docker-compose -f docker-compose.dev.yml ps${NC}"
    echo -e "  停止所有服务: ${YELLOW}./stop-dev-docker.sh${NC} 或 ${YELLOW}docker-compose -f docker-compose.dev.yml down${NC}"
    echo
    echo -e "${GREEN}🧪 测试命令:${NC}"
    echo -e "  后端健康检查: ${YELLOW}curl http://localhost:8000/health${NC}"
    echo -e "  Agent命令测试: 在Agent页面输入 ${YELLOW}/help${NC}"
    echo
}

# 主函数
main() {
    clear
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    DouDou Agent 开发环境                     ║"
    echo "║                      混合模式启动脚本                         ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    print_msg "🚀 开始启动DouDou Agent混合开发环境..."
    
    # 执行检查和启动步骤
    check_docker
    check_docker_compose
    check_nodejs
    check_ports
    setup_env
    install_frontend_deps
    start_backend
    start_redis
    start_frontend
    show_info
    
    print_msg "开发环境准备就绪！Happy coding! 🎯"
}

# 错误处理
trap 'print_error "脚本执行中断"; exit 1' INT

# 运行主函数
main
