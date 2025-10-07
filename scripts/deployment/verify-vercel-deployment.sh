#!/bin/bash

# Vercel 容器化部署验证脚本
# 用于验证后端服务在Vercel上的容器化部署状态

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查参数
if [ $# -eq 0 ]; then
    log_error "请提供后端服务URL"
    echo "用法: $0 <backend_url>"
    echo "示例: $0 https://doudou-backend.vercel.app"
    exit 1
fi

BACKEND_URL="$1"
MAX_RETRIES=10
RETRY_INTERVAL=15

log_info "开始验证Vercel容器化部署..."
log_info "后端URL: $BACKEND_URL"

# 健康检查函数
check_health() {
    local url="$1"
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        log_info "执行健康检查 (第 $((retry_count + 1)) 次)..."
        
        if curl -f "$url/health" --max-time 30 --silent --show-error; then
            log_success "健康检查通过"
            return 0
        else
            log_warning "健康检查失败，等待 $RETRY_INTERVAL 秒后重试..."
            sleep $RETRY_INTERVAL
            retry_count=$((retry_count + 1))
        fi
    done
    
    log_error "健康检查失败，已达到最大重试次数"
    return 1
}

# 性能测试函数
performance_test() {
    local url="$1"
    log_info "执行性能测试..."
    
    # 测试响应时间
    response_time=$(curl -w "%{time_total}" -o /dev/null -s "$url/health")
    log_info "响应时间: ${response_time}s"
    
    # 测试并发请求
    log_info "测试并发请求..."
    for i in {1..5}; do
        curl -f "$url/health" --max-time 10 --silent &
    done
    wait
    
    log_success "性能测试完成"
}

# 容器信息检查
check_container_info() {
    local url="$1"
    log_info "检查容器信息..."
    
    # 检查环境变量
    if curl -f "$url/health" --max-time 10 --silent | grep -q "environment"; then
        log_success "容器环境信息正常"
    else
        log_warning "无法获取容器环境信息"
    fi
}

# 主验证流程
main() {
    log_info "🚀 开始Vercel容器化部署验证"
    
    # 1. 健康检查
    if ! check_health "$BACKEND_URL"; then
        log_error "部署验证失败：健康检查未通过"
        exit 1
    fi
    
    # 2. 性能测试
    performance_test "$BACKEND_URL"
    
    # 3. 容器信息检查
    check_container_info "$BACKEND_URL"
    
    log_success "🎉 Vercel容器化部署验证完成"
    log_success "后端服务已成功部署并运行在: $BACKEND_URL"
}

# 执行主函数
main "$@"
