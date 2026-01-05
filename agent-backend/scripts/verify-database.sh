#!/bin/bash

# Agent 数据库存储验证脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Agent 数据库存储功能验证 ===${NC}\n"

# 步骤 1: 检查 Docker 容器状态
echo -e "${YELLOW}步骤 1: 检查 Docker 容器状态${NC}"
if docker ps | grep -q "doudou-agent-backend-dev"; then
    echo -e "${GREEN}✓ Docker 容器正在运行${NC}\n"
else
    echo -e "${RED}✗ Docker 容器未运行${NC}"
    echo "请先启动容器: cd agent-backend/docker && ./backend.sh start"
    exit 1
fi

# 步骤 2: 检查健康状态
echo -e "${YELLOW}步骤 2: 检查服务健康状态${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:8000/api/agent/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✓ 服务健康检查通过${NC}"
    echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
    echo ""
else
    echo -e "${RED}✗ 服务健康检查失败${NC}"
    exit 1
fi

# 步骤 3: 检查数据库连接日志
echo -e "${YELLOW}步骤 3: 检查数据库连接日志${NC}"
if docker logs doudou-agent-backend-dev 2>&1 | grep -q "Database connection pool initialized successfully"; then
    echo -e "${GREEN}✓ 数据库连接池初始化成功${NC}\n"
else
    echo -e "${RED}✗ 数据库连接失败${NC}"
    echo "查看完整日志: docker logs doudou-agent-backend-dev"
    exit 1
fi

# 步骤 4: 发送测试请求
echo -e "${YELLOW}步骤 4: 发送测试请求${NC}"
SESSION_ID="verify-$(date +%s)"
echo "Session ID: $SESSION_ID"

RESPONSE=$(curl -s -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d "{
    \"input\": \"测试数据库存储功能 - $(date)\",
    \"session_id\": \"$SESSION_ID\"
  }")

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Agent 请求执行成功${NC}\n"
else
    echo -e "${RED}✗ Agent 请求失败${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

# 步骤 5: 提示验证数据库
echo -e "${YELLOW}步骤 5: 验证数据库存储${NC}"
echo "请在项目根目录运行以下命令查看存储的对话："
echo -e "${BLUE}npm run db:manage-agent${NC}"
echo ""
echo "选择 'View all conversations' 查找 session_id: $SESSION_ID"
echo ""

echo -e "${GREEN}=== 验证完成 ===${NC}"
echo ""
echo "如果在数据库中看到了对话记录，说明数据库存储功能正常工作！"
