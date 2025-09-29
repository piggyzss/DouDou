#!/bin/bash

# 简单构建脚本 - 完全绕过构建追踪问题

echo "🔧 简单构建模式启动..."

# 设置基础环境变量
export NEXT_TELEMETRY_DISABLED=1
export NODE_ENV=production
export GIT_CONFIG_NOSYSTEM=1
export GIT_CONFIG_GLOBAL=/dev/null

# 禁用所有可能导致 micromatch 问题的功能
export NEXT_BUILD_TRACE=false
export DISABLE_COLLECT_BUILD_TRACES=true
export NEXT_DISABLE_SOURCEMAPS=true
export NEXT_DISABLE_STATIC_IMAGES=false

# 设置内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

echo "🧹 清理缓存..."
rm -rf .next
rm -rf node_modules/.cache

echo "🚀 开始构建..."

# 使用标准构建命令
npx next build

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ 构建成功完成"
else
    echo "❌ 构建失败，退出码: $BUILD_EXIT_CODE"
    exit $BUILD_EXIT_CODE
fi
