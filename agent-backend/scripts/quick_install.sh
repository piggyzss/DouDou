#!/bin/bash
# LLM 快速安装脚本（自动创建虚拟环境）

set -e

echo "=================================="
echo "LLM 快速安装"
echo "=================================="
echo ""

# 检查是否在 agent-backend 目录
if [ ! -f "requirements.txt" ]; then
    echo "❌ 错误: 请在 agent-backend 目录下运行"
    echo "   cd agent-backend && bash scripts/quick_install.sh"
    exit 1
fi

# 1. 创建虚拟环境
if [ ! -d "venv" ]; then
    echo "步骤 1/3: 创建虚拟环境..."
    python3 -m venv venv
    echo "✅ 虚拟环境已创建"
else
    echo "步骤 1/3: 虚拟环境已存在"
fi
echo ""

# 2. 激活虚拟环境并安装依赖
echo "步骤 2/3: 安装依赖..."
source venv/bin/activate
pip install -q --upgrade pip
pip install -r requirements.txt
echo "✅ 依赖安装完成"
echo ""

# 3. 配置环境变量
echo "步骤 3/3: 配置环境..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ 已创建 .env 文件"
    fi
else
    echo "✅ .env 文件已存在"
fi
echo ""

# 检查 API Key
if ! grep -q "GOOGLE_API_KEY=" .env 2>/dev/null || grep -q "your_google_api_key_here" .env 2>/dev/null; then
    echo "⚠️  需要配置 Google Gemini API Key"
    echo ""
    echo "获取 API Key:"
    echo "  https://makersuite.google.com/app/apikey"
    echo ""
    echo "配置方法:"
    echo "  编辑 .env 文件，设置 GOOGLE_API_KEY=你的key"
    echo ""
fi

echo "=================================="
echo "安装完成！"
echo "=================================="
echo ""
echo "下一步:"
echo "1. 激活虚拟环境: source venv/bin/activate"
echo "2. 配置 API Key: 编辑 .env 文件"
echo "3. 运行测试: python scripts/verify_stage1.py"
echo ""
