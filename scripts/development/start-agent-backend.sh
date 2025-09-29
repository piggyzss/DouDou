#!/bin/bash

# AI News Agent Backend 启动脚本

set -e

echo "🚀 Starting AI News Agent Backend..."

# 检查是否在项目根目录
if [ ! -d "agent-backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# 进入后端目录
cd agent-backend

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed"
    exit 1
fi

# 检查是否存在虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# 安装依赖
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "📝 Please edit .env file to configure your settings"
    else
        echo "⚠️  Warning: No .env.example found"
    fi
fi

# 创建日志目录
mkdir -p logs

# 启动服务
echo "🎯 Starting FastAPI server..."
echo "📍 Server will be available at: http://localhost:8000"
echo "📖 API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python -m app.main
