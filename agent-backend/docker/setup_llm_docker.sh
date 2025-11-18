#!/bin/bash
# Docker 方式安装 LLM 集成

set -e

echo "=================================="
echo "LLM 集成 - Docker 安装"
echo "=================================="
echo ""

# 检查是否在 agent-backend 目录
if [ ! -f "requirements.txt" ]; then
    echo "❌ 错误: 请在 agent-backend 目录下运行"
    echo "   cd agent-backend && bash docker/setup_llm_docker.sh"
    exit 1
fi

# 1. 配置环境变量
echo "步骤 1/3: 配置环境变量..."
echo "--------------------------------"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ 已创建 .env 文件"
    else
        echo "❌ 错误: .env.example 文件不存在"
        exit 1
    fi
else
    echo "✅ .env 文件已存在"
fi

# 检查 API Key
if ! grep -q "GOOGLE_API_KEY=" .env 2>/dev/null || grep -q "your_google_api_key_here" .env 2>/dev/null; then
    echo ""
    echo "⚠️  需要配置 Google Gemini API Key"
    echo ""
    echo "请按照以下步骤操作："
    echo "1. 访问: https://makersuite.google.com/app/apikey"
    echo "2. 登录 Google 账号"
    echo "3. 点击 'Create API Key'"
    echo "4. 复制生成的 API Key"
    echo ""
    read -p "请输入你的 Gemini API Key (或按 Enter 跳过): " api_key
    
    if [ ! -z "$api_key" ]; then
        # 更新 .env 文件
        if grep -q "GOOGLE_API_KEY=" .env; then
            sed -i.bak "s/GOOGLE_API_KEY=.*/GOOGLE_API_KEY=$api_key/" .env
        else
            echo "GOOGLE_API_KEY=$api_key" >> .env
        fi
        echo "✅ API Key 已配置"
    else
        echo "⚠️  跳过 API Key 配置，请稍后手动编辑 .env 文件"
    fi
else
    echo "✅ API Key 已配置"
fi

# 确保 LLM 配置正确
if ! grep -q "LLM_PROVIDER=google" .env 2>/dev/null; then
    if grep -q "LLM_PROVIDER=" .env; then
        sed -i.bak "s/LLM_PROVIDER=.*/LLM_PROVIDER=google/" .env
    else
        echo "LLM_PROVIDER=google" >> .env
    fi
fi

if ! grep -q "ENABLE_INTENT_ANALYSIS=true" .env 2>/dev/null; then
    if grep -q "ENABLE_INTENT_ANALYSIS=" .env; then
        sed -i.bak "s/ENABLE_INTENT_ANALYSIS=.*/ENABLE_INTENT_ANALYSIS=true/" .env
    else
        echo "ENABLE_INTENT_ANALYSIS=true" >> .env
    fi
fi

echo ""

# 2. 构建 Docker 镜像
echo "步骤 2/3: 构建 Docker 镜像..."
echo "--------------------------------"
docker compose -f docker/docker-compose.dev.yml build agent-backend
echo "✅ Docker 镜像构建完成"
echo ""

# 3. 启动服务
echo "步骤 3/3: 启动服务..."
echo "--------------------------------"
docker compose -f docker/docker-compose.dev.yml up -d agent-backend
echo "✅ 服务已启动"
echo ""

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 4. 测试
echo "=================================="
echo "测试 LLM 集成"
echo "=================================="
echo ""

# 检查服务健康状态
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端服务运行正常"
else
    echo "⚠️  后端服务可能未完全启动，请稍等片刻"
fi

# 运行测试脚本
echo ""
echo "运行 LLM 测试..."
docker compose -f docker/docker-compose.dev.yml exec agent-backend python scripts/verify_stage1.py

echo ""
echo "=================================="
echo "安装完成！"
echo "=================================="
echo ""
echo "服务地址:"
echo "  - 后端 API: http://localhost:8000"
echo "  - API 文档: http://localhost:8000/docs"
echo ""
echo "常用命令:"
echo "  - 查看日志: docker compose -f docker/docker-compose.dev.yml logs -f agent-backend"
echo "  - 停止服务: docker compose -f docker/docker-compose.dev.yml down"
echo "  - 重启服务: docker compose -f docker/docker-compose.dev.yml restart agent-backend"
echo "  - 进入容器: docker compose -f docker/docker-compose.dev.yml exec agent-backend bash"
echo ""
echo "测试 LLM:"
echo "  docker compose -f docker/docker-compose.dev.yml exec agent-backend python scripts/test_llm_setup.py"
echo ""
