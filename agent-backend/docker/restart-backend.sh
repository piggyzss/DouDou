#!/bin/bash
# 重启后端服务

set -e

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.dev.yml"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🔄 重启后端服务...${NC}"
echo ""

echo -e "${BLUE}📦 重启 Docker 容器...${NC}"
docker-compose -f "$COMPOSE_FILE" restart

echo ""
echo -e "${BLUE}⏳ 等待服务启动...${NC}"
sleep 5

echo ""
echo -e "${BLUE}📊 检查容器状态...${NC}"
docker-compose -f "$COMPOSE_FILE" ps

echo ""
echo -e "${BLUE}📝 查看最近日志...${NC}"
docker-compose -f "$COMPOSE_FILE" logs --tail=20

echo ""
echo -e "${GREEN}✅ 重启完成！${NC}"
echo ""
echo "测试服务:"
echo -e "  ${YELLOW}curl http://localhost:8000/api/agent/health${NC}"
