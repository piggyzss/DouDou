#!/bin/bash
# LLM 集成快速设置脚本

set -e

echo "=================================="
echo "LLM 集成设置向导"
echo "=================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "requirements.txt" ]; then
    echo "❌ 错误: 请在 agent-backend 目录下运行此脚本"
    echo "   cd agent-backend && bash scripts/setup_llm.sh"
    exit 1
fi

# 步骤 1: 安装依赖
echo "步骤 1/4: 安装依赖包..."
echo "--------------------------------"

# 检查是否在虚拟环境中
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  未检测到虚拟环境"
    echo ""
    echo "推荐使用虚拟环境安装依赖："
    echo "  python3 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    echo ""
    read -p "是否继续使用系统 Python 安装？(y/N): " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "❌ 安装已取消"
        echo ""
        echo "请先创建并激活虚拟环境："
        echo "  python3 -m venv venv"
        echo "  source venv/bin/activate"
        echo "  bash scripts/setup_llm.sh"
        exit 1
    fi
    
    # 尝试使用 --break-system-packages（仅在必要时）
    echo "正在安装依赖..."
    if pip install -r requirements.txt 2>/dev/null; then
        echo "✅ 依赖安装完成"
    else
        echo "⚠️  标准安装失败，尝试使用 --break-system-packages..."
        pip install -r requirements.txt --break-system-packages
        echo "✅ 依赖安装完成"
    fi
else
    echo "✓ 检测到虚拟环境: $VIRTUAL_ENV"
    pip install -r requirements.txt
    echo "✅ 依赖安装完成"
fi
echo ""

# 步骤 2: 配置环境变量
echo "步骤 2/4: 配置环境变量..."
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
    echo "⚠️  .env 文件已存在，跳过创建"
fi

# 检查 API Key
if grep -q "your_google_api_key_here" .env 2>/dev/null || ! grep -q "GOOGLE_API_KEY=" .env 2>/dev/null; then
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

# 确保 LLM_PROVIDER 设置正确
if ! grep -q "LLM_PROVIDER=google" .env 2>/dev/null; then
    if grep -q "LLM_PROVIDER=" .env; then
        sed -i.bak "s/LLM_PROVIDER=.*/LLM_PROVIDER=google/" .env
    else
        echo "LLM_PROVIDER=google" >> .env
    fi
    echo "✅ LLM_PROVIDER 已设置为 google"
fi

# 确保 ENABLE_INTENT_ANALYSIS 开启
if ! grep -q "ENABLE_INTENT_ANALYSIS=true" .env 2>/dev/null; then
    if grep -q "ENABLE_INTENT_ANALYSIS=" .env; then
        sed -i.bak "s/ENABLE_INTENT_ANALYSIS=.*/ENABLE_INTENT_ANALYSIS=true/" .env
    else
        echo "ENABLE_INTENT_ANALYSIS=true" >> .env
    fi
    echo "✅ ENABLE_INTENT_ANALYSIS 已开启"
fi

echo ""

# 步骤 3: 验证安装
echo "步骤 3/4: 验证安装..."
echo "--------------------------------"

# 检查 Python 包
if python -c "import google.generativeai" 2>/dev/null; then
    echo "✅ google-generativeai 已安装"
else
    echo "❌ google-generativeai 未安装"
    exit 1
fi

# 检查环境变量
if python -c "import os; from dotenv import load_dotenv; load_dotenv(); exit(0 if os.getenv('GOOGLE_API_KEY') else 1)" 2>/dev/null; then
    echo "✅ GOOGLE_API_KEY 已配置"
else
    echo "⚠️  GOOGLE_API_KEY 未配置或为空"
    echo "   请编辑 .env 文件添加你的 API Key"
fi

echo ""

# 步骤 4: 运行测试
echo "步骤 4/4: 运行测试..."
echo "--------------------------------"

if [ -f "scripts/test_llm_setup.py" ]; then
    echo "正在运行测试脚本..."
    echo ""
    python scripts/test_llm_setup.py
else
    echo "⚠️  测试脚本不存在，跳过测试"
fi

echo ""
echo "=================================="
echo "设置完成！"
echo "=================================="
echo ""
echo "下一步："
echo "1. 如果测试失败，请检查 .env 文件中的 GOOGLE_API_KEY"
echo "2. 运行 'python scripts/test_llm_setup.py' 重新测试"
echo "3. 查看 QUICKSTART_LLM.md 了解更多信息"
echo ""
