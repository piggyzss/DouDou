#!/bin/bash

# Vercel 构建脚本 - 处理 Git 警告和构建优化

echo "🔧 Vercel 构建环境初始化..."

# 设置 Git 环境变量，避免 Git 相关警告
export GIT_CONFIG_NOSYSTEM=1
export GIT_CONFIG_GLOBAL=/dev/null
export GIT_AUTHOR_NAME="Vercel Build"
export GIT_AUTHOR_EMAIL="build@vercel.com"
export GIT_COMMITTER_NAME="Vercel Build"
export GIT_COMMITTER_EMAIL="build@vercel.com"

# 禁用 Git 配置查找
export HOME=/tmp

# 创建临时 Git 配置以避免警告
mkdir -p /tmp/.git
cat > /tmp/.gitconfig << 'EOF'
[core]
    fileMode = false
    autocrlf = false
    safecrlf = false
[diff]
    noprefix = false
    renames = false
[apply]
    whitespace = nowarn
[advice]
    detachedHead = false
    statusHints = false
EOF

echo "✅ Git 环境配置完成"

# 设置构建环境变量
export NEXT_TELEMETRY_DISABLED=1
export NODE_ENV=production

echo "🚀 开始构建..."

# 执行构建
npm run build

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ 构建成功完成"
else
    echo "❌ 构建失败，退出码: $BUILD_EXIT_CODE"
    exit $BUILD_EXIT_CODE
fi
