#!/usr/bin/env python3
"""
测试任务复杂度分类

验证 TaskPlanner 能否正确识别不同复杂度的查询
"""

import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.core.task_planner import TaskPlanner
from loguru import logger

# 配置日志
logger.remove()
logger.add(sys.stdout, level="INFO")


async def test_complexity_classification():
    """测试复杂度分类"""
    
    planner = TaskPlanner()
    
    # 测试用例
    test_cases = [
        # Simple queries
        ("你好", "simple"),
        ("今天天气怎么样", "simple"),
        ("帮我搜索一下", "simple"),
        
        # Medium queries (需要分析或搜索)
        ("分析最近 OpenAI 的技术进展", "medium"),
        ("搜索最新的 AI 新闻", "medium"),
        ("总结一下今天的科技动态", "medium"),
        ("比较 GPT-4 和 Claude 的性能", "medium"),
        
        # Complex queries (需要分析+搜索，或多个意图)
        ("分析最近 OpenAI 的技术进展，然后总结主要趋势", "complex"),
        ("搜索最新的 AI 新闻并进行深度分析", "complex"),
        ("调查 Google 的最新研究，同时比较与 OpenAI 的差异", "complex"),
    ]
    
    print("\n" + "="*80)
    print("测试任务复杂度分类")
    print("="*80 + "\n")
    
    passed = 0
    failed = 0
    
    for query, expected_complexity in test_cases:
        actual_complexity = planner._classify_complexity(query, [])
        
        status = "✅ PASS" if actual_complexity == expected_complexity else "❌ FAIL"
        
        print(f"{status}")
        print(f"  查询: {query}")
        print(f"  期望: {expected_complexity}")
        print(f"  实际: {actual_complexity}")
        print()
        
        if actual_complexity == expected_complexity:
            passed += 1
        else:
            failed += 1
    
    print("="*80)
    print(f"测试结果: {passed} 通过, {failed} 失败")
    print("="*80 + "\n")
    
    return failed == 0


async def test_plan_creation():
    """测试计划创建"""
    
    planner = TaskPlanner()
    
    print("\n" + "="*80)
    print("测试执行计划创建")
    print("="*80 + "\n")
    
    # 测试查询
    query = "分析最近 OpenAI 的技术进展"
    
    print(f"查询: {query}\n")
    
    try:
        plan = await planner.create_plan(query)
        
        print(f"复杂度: {plan.complexity}")
        print(f"步骤数: {len(plan.steps)}")
        print(f"预估迭代: {plan.estimated_iterations}")
        print(f"\n执行步骤:")
        
        for step in plan.steps:
            print(f"  {step.step_number}. {step.description}")
            print(f"     工具: {step.tool_name}")
            print(f"     参数: {step.parameters}")
            print()
        
        print("✅ 计划创建成功")
        return True
        
    except Exception as e:
        print(f"❌ 计划创建失败: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """主函数"""
    
    print("\n" + "="*80)
    print("TaskPlanner 测试套件")
    print("="*80)
    
    # 测试 1: 复杂度分类
    test1_passed = await test_complexity_classification()
    
    # 测试 2: 计划创建
    test2_passed = await test_plan_creation()
    
    # 总结
    print("\n" + "="*80)
    print("测试总结")
    print("="*80)
    print(f"复杂度分类: {'✅ 通过' if test1_passed else '❌ 失败'}")
    print(f"计划创建: {'✅ 通过' if test2_passed else '❌ 失败'}")
    print("="*80 + "\n")
    
    return test1_passed and test2_passed


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
