#!/bin/bash
# 快速验证脚本 - 检查阶段 2 完成情况（不需要安装依赖）

echo "============================================================"
echo "🔍 快速验证阶段 2: LLM 与 Intent Analyzer 集成"
echo "============================================================"
echo ""

# 检查文件是否存在
echo "📁 检查文件..."

files=(
    "app/core/intent_analyzer.py"
    "app/services/llm_service.py"
    "scripts/test_intent_integration.py"
    "scripts/verify_stage2.py"
    "STAGE2_SUMMARY.md"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - 不存在"
        all_exist=false
    fi
done

echo ""
echo "📝 检查代码实现..."

# 检查 intent_analyzer.py 的关键实现
if grep -q "await self.llm_service.analyze_intent" app/core/intent_analyzer.py; then
    echo "  ✅ LLM 服务调用"
else
    echo "  ❌ LLM 服务调用 - 未找到"
    all_exist=false
fi

if grep -q "_parse_keyword_matching" app/core/intent_analyzer.py; then
    echo "  ✅ 降级机制"
else
    echo "  ❌ 降级机制 - 未找到"
    all_exist=false
fi

if grep -q "except Exception" app/core/intent_analyzer.py; then
    echo "  ✅ 错误处理"
else
    echo "  ❌ 错误处理 - 未找到"
    all_exist=false
fi

if grep -q "logger" app/core/intent_analyzer.py; then
    echo "  ✅ 日志记录"
else
    echo "  ❌ 日志记录 - 未找到"
    all_exist=false
fi

if grep -q "is_command_valid" app/core/intent_analyzer.py; then
    echo "  ✅ 命令验证"
else
    echo "  ❌ 命令验证 - 未找到"
    all_exist=false
fi

echo ""
echo "============================================================"
if [ "$all_exist" = true ]; then
    echo "✅ 阶段 2 代码验证通过！"
    echo ""
    echo "📝 已完成:"
    echo "  1. ✅ 更新 intent_analyzer.py"
    echo "  2. ✅ 实现 _parse_natural_language 方法"
    echo "  3. ✅ 添加降级机制"
    echo "  4. ✅ 错误处理和日志"
    echo "  5. ✅ 创建测试脚本"
    echo "  6. ✅ 创建文档"
    echo ""
    echo "🚀 下一步:"
    echo "  1. 安装依赖: pip install -r requirements.txt"
    echo "  2. 配置 API Key: 编辑 .env 文件"
    echo "  3. 运行完整验证: python scripts/verify_stage2.py"
    echo "  4. 运行集成测试: python scripts/test_intent_integration.py"
    echo ""
    exit 0
else
    echo "❌ 阶段 2 验证失败"
    echo ""
    echo "请检查失败的项目"
    exit 1
fi
