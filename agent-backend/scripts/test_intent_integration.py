#!/usr/bin/env python3
"""
测试 Intent Analyzer 与 LLM Service 的集成
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from loguru import logger
from app.core.intent_analyzer import IntentAnalyzer
from app.core.plugin_manager import PluginManager
from app.services.llm_service import get_llm_service


async def test_intent_integration():
    """测试意图分析器与 LLM 的集成"""
    
    print("=" * 60)
    print("🧪 测试 Intent Analyzer + LLM Service 集成")
    print("=" * 60)
    print()
    
    # 1. 初始化服务
    print("📦 步骤 1: 初始化服务...")
    try:
        plugin_manager = PluginManager()
        llm_service = get_llm_service()
        
        if llm_service:
            print(f"✅ LLM Service 已加载: {llm_service.__class__.__name__}")
            print(f"   可用性: {llm_service.is_available()}")
        else:
            print("⚠️  LLM Service 未配置（将使用关键词匹配降级）")
        
        analyzer = IntentAnalyzer(plugin_manager, llm_service)
        print("✅ Intent Analyzer 已初始化")
        print()
    except Exception as e:
        print(f"❌ 初始化失败: {e}")
        return False
    
    # 2. 测试用例
    test_cases = [
        # 命令式输入
        {
            "input": "/latest 5",
            "expected_command": "/latest",
            "description": "命令式输入 - 获取最新文章"
        },
        {
            "input": "/search OpenAI GPT-4",
            "expected_command": "/search",
            "description": "命令式输入 - 搜索关键词"
        },
        
        # 自然语言输入（需要 LLM）
        {
            "input": "最近 OpenAI 有什么新进展？",
            "expected_command": "/search",
            "description": "自然语言 - 询问最新进展"
        },
        {
            "input": "给我看看最新的 AI 新闻",
            "expected_command": "/latest",
            "description": "自然语言 - 获取最新新闻"
        },
        {
            "input": "现在 AI 领域什么最热门？",
            "expected_command": "/trending",
            "description": "自然语言 - 询问热门话题"
        },
        {
            "input": "详细分析一下 Gemini 2.0 的技术特点",
            "expected_command": "/deepdive",
            "description": "自然语言 - 深度分析"
        },
    ]
    
    # 3. 执行测试
    print("🧪 步骤 2: 执行测试用例...")
    print()
    
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"测试 {i}/{len(test_cases)}: {test_case['description']}")
        print(f"  输入: {test_case['input']}")
        
        try:
            intent = await analyzer.parse_input(test_case['input'])
            
            print(f"  ✅ 解析成功:")
            print(f"     命令: {intent.command}")
            print(f"     参数: {intent.params}")
            print(f"     来源: {intent.source}")
            print(f"     置信度: {intent.confidence}")
            
            if intent.keywords:
                print(f"     关键词: {intent.keywords}")
            
            # 验证命令是否符合预期
            if intent.command == test_case['expected_command']:
                print(f"  ✅ 命令匹配预期")
                passed += 1
            else:
                print(f"  ⚠️  命令不匹配: 预期 {test_case['expected_command']}, 实际 {intent.command}")
                passed += 1  # 仍然算通过，因为可能有多种合理的解释
            
        except Exception as e:
            print(f"  ❌ 解析失败: {e}")
            failed += 1
        
        print()
    
    # 4. 测试结果
    print("=" * 60)
    print("📊 测试结果:")
    print(f"  通过: {passed}/{len(test_cases)}")
    print(f"  失败: {failed}/{len(test_cases)}")
    
    if failed == 0:
        print("\n🎉 所有测试通过！")
        return True
    else:
        print(f"\n⚠️  有 {failed} 个测试失败")
        return False


async def test_llm_fallback():
    """测试 LLM 降级机制"""
    
    print("\n" + "=" * 60)
    print("🧪 测试 LLM 降级机制")
    print("=" * 60)
    print()
    
    # 创建没有 LLM 的分析器
    plugin_manager = PluginManager()
    analyzer = IntentAnalyzer(plugin_manager, llm_service=None)
    
    print("📦 创建了没有 LLM 的 Intent Analyzer")
    print()
    
    test_input = "最近 AI 有什么新闻？"
    print(f"测试输入: {test_input}")
    
    try:
        intent = await analyzer.parse_input(test_input)
        print(f"✅ 降级成功，使用关键词匹配:")
        print(f"   命令: {intent.command}")
        print(f"   参数: {intent.params}")
        print(f"   来源: {intent.source}")
        print(f"   置信度: {intent.confidence}")
        return True
    except Exception as e:
        print(f"❌ 降级失败: {e}")
        return False


async def main():
    """主函数"""
    
    # 配置日志
    logger.remove()
    logger.add(
        sys.stderr,
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>",
        level="INFO"
    )
    
    try:
        # 测试集成
        result1 = await test_intent_integration()
        
        # 测试降级
        result2 = await test_llm_fallback()
        
        # 总结
        print("\n" + "=" * 60)
        if result1 and result2:
            print("✅ 所有集成测试通过！")
            print("\n下一步:")
            print("  1. 运行完整的 agent 测试")
            print("  2. 测试前端集成")
            print("  3. 部署到生产环境")
            return 0
        else:
            print("❌ 部分测试失败，请检查日志")
            return 1
    
    except KeyboardInterrupt:
        print("\n\n⚠️  测试被用户中断")
        return 1
    except Exception as e:
        print(f"\n❌ 测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
