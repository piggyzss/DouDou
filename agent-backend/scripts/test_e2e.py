#!/usr/bin/env python3
"""
端到端测试 - 测试完整的 Agent 执行流程
从 API 请求到插件执行的完整链路
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from loguru import logger
from app.models.base import AgentRequest
from app.api.routes.agent import execute_command


async def test_command_execution():
    """测试命令式输入的完整执行流程"""
    
    print("=" * 60)
    print("🧪 测试 1: 命令式输入执行")
    print("=" * 60)
    print()
    
    test_cases = [
        {
            "input": "/help",
            "description": "帮助命令",
            "expected_success": True,
        },
        {
            "input": "/latest 5",
            "description": "获取最新文章",
            "expected_success": True,
        },
        {
            "input": "/invalid_command",
            "description": "无效命令",
            "expected_success": False,
        },
    ]
    
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"测试 {i}/{len(test_cases)}: {test_case['description']}")
        print(f"  输入: {test_case['input']}")
        
        try:
            request = AgentRequest(
                input=test_case['input'],
                session_id="test_session",
                context={}
            )
            
            response = await execute_command(request)
            
            print(f"  响应:")
            print(f"    成功: {response.success}")
            print(f"    类型: {response.type}")
            print(f"    插件: {response.plugin}")
            
            if response.data:
                print(f"    数据: {str(response.data)[:100]}...")
            if response.error:
                print(f"    错误: {response.error}")
            
            # 验证结果
            if response.success == test_case['expected_success']:
                print(f"  ✅ 测试通过")
                passed += 1
            else:
                print(f"  ❌ 测试失败: 预期 success={test_case['expected_success']}, 实际 success={response.success}")
                failed += 1
        
        except Exception as e:
            print(f"  ❌ 执行失败: {e}")
            failed += 1
        
        print()
    
    return passed, failed


async def test_natural_language_execution():
    """测试自然语言输入的完整执行流程"""
    
    print("=" * 60)
    print("🧪 测试 2: 自然语言输入执行")
    print("=" * 60)
    print()
    
    test_cases = [
        {
            "input": "最近 AI 有什么新闻？",
            "description": "询问最新新闻",
            "expected_success": True,
        },
        {
            "input": "给我看看最新的 5 篇文章",
            "description": "请求最新文章",
            "expected_success": True,
        },
        {
            "input": "帮助",
            "description": "请求帮助",
            "expected_success": True,
        },
    ]
    
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"测试 {i}/{len(test_cases)}: {test_case['description']}")
        print(f"  输入: {test_case['input']}")
        
        try:
            request = AgentRequest(
                input=test_case['input'],
                session_id="test_session",
                context={}
            )
            
            response = await execute_command(request)
            
            print(f"  响应:")
            print(f"    成功: {response.success}")
            print(f"    类型: {response.type}")
            print(f"    插件: {response.plugin}")
            print(f"    命令: {response.command}")
            
            if response.data:
                print(f"    数据: {str(response.data)[:100]}...")
            if response.error:
                print(f"    错误: {response.error}")
            
            # 验证结果
            if response.success == test_case['expected_success']:
                print(f"  ✅ 测试通过")
                passed += 1
            else:
                print(f"  ❌ 测试失败: 预期 success={test_case['expected_success']}, 实际 success={response.success}")
                failed += 1
        
        except Exception as e:
            print(f"  ❌ 执行失败: {e}")
            failed += 1
        
        print()
    
    return passed, failed


async def test_intent_to_execution_flow():
    """测试意图分析到执行的完整流程"""
    
    print("=" * 60)
    print("🧪 测试 3: 意图分析 → 执行流程")
    print("=" * 60)
    print()
    
    from app.core.intent_analyzer import IntentAnalyzer
    from app.core.plugin_manager import plugin_manager
    from app.services.llm_service import get_llm_service
    from app.api.routes.agent import execute_intent
    
    # 初始化
    llm_service = get_llm_service()
    analyzer = IntentAnalyzer(plugin_manager, llm_service)
    
    test_input = "最近 OpenAI 有什么新进展？"
    
    print(f"输入: {test_input}")
    print()
    
    try:
        # 步骤 1: 意图分析
        print("步骤 1: 意图分析")
        intent = await analyzer.parse_input(test_input)
        print(f"  ✅ 意图解析成功:")
        print(f"     命令: {intent.command}")
        print(f"     参数: {intent.params}")
        print(f"     来源: {intent.source}")
        print(f"     置信度: {intent.confidence}")
        print()
        
        # 步骤 2: 执行意图
        print("步骤 2: 执行意图")
        response = await execute_intent(intent)
        print(f"  ✅ 执行成功:")
        print(f"     成功: {response.success}")
        print(f"     类型: {response.type}")
        print(f"     插件: {response.plugin}")
        print()
        
        return True
    
    except Exception as e:
        print(f"  ❌ 流程失败: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_error_handling():
    """测试错误处理"""
    
    print("=" * 60)
    print("🧪 测试 4: 错误处理")
    print("=" * 60)
    print()
    
    test_cases = [
        {
            "input": "",
            "description": "空输入",
        },
        {
            "input": "/unknown_command",
            "description": "未知命令",
        },
    ]
    
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"测试 {i}/{len(test_cases)}: {test_case['description']}")
        print(f"  输入: '{test_case['input']}'")
        
        try:
            request = AgentRequest(
                input=test_case['input'],
                session_id="test_session",
                context={}
            )
            
            response = await execute_command(request)
            
            # 错误情况应该返回 success=False
            if not response.success:
                print(f"  ✅ 正确处理错误: {response.error}")
                passed += 1
            else:
                print(f"  ❌ 应该返回错误但返回了成功")
                failed += 1
        
        except Exception as e:
            # HTTP 异常也是正确的错误处理
            print(f"  ✅ 正确抛出异常: {e}")
            passed += 1
        
        print()
    
    return passed, failed


async def main():
    """主函数"""
    
    # 配置日志
    logger.remove()
    logger.add(
        sys.stderr,
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>",
        level="INFO"
    )
    
    print("\n" + "=" * 60)
    print("🚀 Agent 端到端测试")
    print("=" * 60)
    print()
    
    try:
        # 运行所有测试
        results = []
        
        # 测试 1: 命令式输入
        passed1, failed1 = await test_command_execution()
        results.append(("命令式输入", passed1, failed1))
        
        # 测试 2: 自然语言输入
        passed2, failed2 = await test_natural_language_execution()
        results.append(("自然语言输入", passed2, failed2))
        
        # 测试 3: 完整流程
        result3 = await test_intent_to_execution_flow()
        results.append(("完整流程", 1 if result3 else 0, 0 if result3 else 1))
        
        # 测试 4: 错误处理
        passed4, failed4 = await test_error_handling()
        results.append(("错误处理", passed4, failed4))
        
        # 总结
        print("=" * 60)
        print("📊 测试结果总结:")
        print("=" * 60)
        
        total_passed = 0
        total_failed = 0
        
        for name, passed, failed in results:
            total_passed += passed
            total_failed += failed
            status = "✅" if failed == 0 else "⚠️"
            print(f"  {status} {name}: {passed} 通过, {failed} 失败")
        
        print()
        print(f"总计: {total_passed} 通过, {total_failed} 失败")
        
        if total_failed == 0:
            print("\n🎉 所有端到端测试通过！")
            print("\n✅ 系统已准备好:")
            print("  1. 意图分析正常工作")
            print("  2. 插件执行正常工作")
            print("  3. 错误处理正常工作")
            print("  4. 完整流程正常工作")
            return 0
        else:
            print(f"\n⚠️  有 {total_failed} 个测试失败")
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
