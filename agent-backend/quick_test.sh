#!/bin/bash

# 快速测试脚本 - 验证 ReactAgent 集成

echo "=========================================="
echo "ReactAgent 快速测试"
echo "=========================================="

# 检查后端是否运行
echo ""
echo "1. 检查后端服务..."
if curl -s http://localhost:8000/api/agent/health > /dev/null 2>&1; then
    echo "✓ 后端服务正在运行"
else
    echo "✗ 后端服务未运行"
    echo ""
    echo "请先启动后端服务："
    echo "  cd agent-backend"
    echo "  docker-compose -f docker/docker-compose.dev.yml up"
    echo "  或"
    echo "  uvicorn app.main:app --reload"
    exit 1
fi

# 测试健康检查
echo ""
echo "2. 测试健康检查..."
HEALTH=$(curl -s http://localhost:8000/api/agent/health)
echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"

# 测试工具列表
echo ""
echo "3. 测试工具列表..."
TOOLS=$(curl -s http://localhost:8000/api/agent/tools)
TOOL_COUNT=$(echo "$TOOLS" | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('tools', [])))" 2>/dev/null || echo "0")
echo "✓ 发现 $TOOL_COUNT 个工具"

# 测试自然语言输入（ReactAgent）
echo ""
echo "4. 测试自然语言输入（ReactAgent）..."
NL_RESPONSE=$(curl -s -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"input": "获取最新的AI资讯", "session_id": "test_nl"}')

NL_SUCCESS=$(echo "$NL_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "false")
NL_PLUGIN=$(echo "$NL_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('plugin', ''))" 2>/dev/null || echo "")

if [ "$NL_SUCCESS" = "True" ] && [ "$NL_PLUGIN" = "react_agent" ]; then
    echo "✓ 自然语言输入测试通过（使用 ReactAgent）"
    
    # 检查 metadata
    HAS_METADATA=$(echo "$NL_RESPONSE" | python3 -c "import sys, json; print('metadata' in json.load(sys.stdin))" 2>/dev/null || echo "False")
    if [ "$HAS_METADATA" = "True" ]; then
        echo "✓ 响应包含 ReactAgent metadata（steps, plan, evaluation）"
    fi
else
    echo "✗ 自然语言输入测试失败"
    echo "$NL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$NL_RESPONSE"
fi

echo ""
echo "=========================================="
echo "测试完成"
echo "=========================================="
echo ""
echo "详细响应示例："
echo "$NL_RESPONSE" | python3 -m json.tool 2>/dev/null | head -30
