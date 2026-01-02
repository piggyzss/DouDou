#!/bin/bash
# 清理 agent-backend 目录下的重复和过时的测试脚本

echo "=========================================="
echo "清理 agent-backend 测试脚本"
echo "=========================================="
echo ""

# 定义要删除的文件
FILES_TO_DELETE=(
    "test_streaming.py"
    "test_streaming_simple.py"
    "test_news_format.py"
    "test_parsing_fix.py"
    "SSE_STREAMING_SUMMARY.md"
    "STREAMING_VERIFICATION.md"
    "QUICK_REFERENCE.md"
    "SSE_STREAMING_README.md"
)

# 定义要保留的文件
FILES_TO_KEEP=(
    "test_gemini_stream.py"
    "test_streaming_complete.py"
    "test_reflection_engine.py"
    "docs/SSE_STREAMING_GUIDE.md"
)

echo "将要删除的文件:"
echo "-------------------"
for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  - $file (不存在)"
    fi
done

echo ""
echo "将要保留的文件:"
echo "-------------------"
for file in "${FILES_TO_KEEP[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  - $file (不存在)"
    fi
done

echo ""
read -p "确认删除以上文件? (y/N): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    echo ""
    echo "开始清理..."
    
    for file in "${FILES_TO_DELETE[@]}"; do
        if [ -f "$file" ]; then
            rm "$file"
            echo "  ✓ 已删除: $file"
        fi
    done
    
    echo ""
    echo "=========================================="
    echo "清理完成!"
    echo "=========================================="
    echo ""
    echo "保留的测试脚本:"
    echo "  - test_gemini_stream.py (测试 Gemini API 流式输出)"
    echo "  - test_streaming_complete.py (测试完整流式链路)"
    echo "  - test_reflection_engine.py (测试反思引擎)"
    echo ""
    echo "保留的文档:"
    echo "  - docs/SSE_STREAMING_GUIDE.md (SSE 流式输出完整指南)"
    echo "  - README.md (项目主文档)"
    echo "  - DESIGN.md (系统设计文档)"
    echo "  - DEPLOYMENT.md (部署说明)"
    echo ""
else
    echo ""
    echo "取消清理操作"
fi
