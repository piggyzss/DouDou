#!/usr/bin/env python3
"""
测试 ReflectionEngine 实现

验证 Phase 5 的核心功能
"""

import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.reflection_engine import ReflectionEngine, get_reflection_engine
from app.models.react import ReActStep, ExecutionPlan, PlanStep, QualityEvaluation
from app.models.tool import ToolCall, ToolResult
from datetime import datetime


def test_reflection_engine_initialization():
    """测试 ReflectionEngine 初始化"""
    print("🧪 Testing ReflectionEngine initialization...")
    
    engine = get_reflection_engine()
    assert engine is not None, "ReflectionEngine should be initialized"
    assert engine.llm_service is not None, "LLM service should be available"
    
    print("✅ ReflectionEngine initialized successfully")


def test_should_continue():
    """测试 should_continue 方法"""
    print("\n🧪 Testing should_continue() method...")
    
    engine = get_reflection_engine()
    
    # 创建测试计划
    plan = ExecutionPlan(
        query='test query',
        complexity='simple',
        steps=[PlanStep(
            step_number=1,
            description='test',
            tool_name='test_tool',
            parameters={},
            required=True
        )],
        estimated_iterations=2
    )
    
    # 创建成功的步骤
    step = ReActStep(
        step_number=1,
        thought='test thought',
        action=ToolCall(
            tool_name='test_tool',
            parameters={},
            reasoning='test',
            confidence=0.8,
            source='test'
        ),
        observation=ToolResult(
            success=True,
            data='test result',
            execution_time=0.1,
            tool_name='test_tool'
        ),
        status='completed',
        timestamp=datetime.now()
    )
    
    # 测试 1: 第一步后应该继续
    should_continue = engine.should_continue([step], plan)
    assert should_continue == True, "Should continue after first successful step"
    print("✅ Test 1 passed: Continues after first step")
    
    # 测试 2: 达到估计迭代次数后应该停止
    step2 = ReActStep(
        step_number=2,
        thought='test thought 2',
        action=ToolCall(
            tool_name='test_tool',
            parameters={},
            reasoning='test',
            confidence=0.8,
            source='test'
        ),
        observation=ToolResult(
            success=True,
            data='test result 2',
            execution_time=0.1,
            tool_name='test_tool'
        ),
        status='completed',
        timestamp=datetime.now()
    )
    
    should_continue = engine.should_continue([step, step2], plan)
    assert should_continue == False, "Should stop after reaching estimated iterations"
    print("✅ Test 2 passed: Stops after reaching estimated iterations")
    
    # 测试 3: 失败步骤后应该停止
    failed_step = ReActStep(
        step_number=1,
        thought='test thought',
        action=ToolCall(
            tool_name='test_tool',
            parameters={},
            reasoning='test',
            confidence=0.8,
            source='test'
        ),
        observation=ToolResult(
            success=False,
            error='test error',
            execution_time=0.1,
            tool_name='test_tool'
        ),
        status='failed',
        timestamp=datetime.now()
    )
    
    should_continue = engine.should_continue([failed_step], plan)
    assert should_continue == False, "Should stop after failed step"
    print("✅ Test 3 passed: Stops after failed step")
    
    # 测试 4: 超过最大迭代次数应该停止
    many_steps = [step] * 5  # 5 个步骤
    should_continue = engine.should_continue(many_steps, plan)
    assert should_continue == False, "Should stop when exceeding max iterations"
    print("✅ Test 4 passed: Stops when exceeding max iterations")


def test_clamp_score():
    """测试评分限制方法"""
    print("\n🧪 Testing _clamp_score() method...")
    
    engine = get_reflection_engine()
    
    # 测试超出上限
    score = engine._clamp_score(15)
    assert score == 10, f"Score should be clamped to 10, got {score}"
    print("✅ Test 1 passed: Clamps high scores to 10")
    
    # 测试超出下限
    score = engine._clamp_score(-5)
    assert score == 0, f"Score should be clamped to 0, got {score}"
    print("✅ Test 2 passed: Clamps low scores to 0")
    
    # 测试正常范围
    score = engine._clamp_score(7)
    assert score == 7, f"Score should remain 7, got {score}"
    print("✅ Test 3 passed: Keeps valid scores unchanged")
    
    # 测试无效输入
    score = engine._clamp_score("invalid")
    assert score == 5, f"Invalid input should default to 5, got {score}"
    print("✅ Test 4 passed: Handles invalid input gracefully")


def test_fallback_evaluation():
    """测试降级评估方法"""
    print("\n🧪 Testing _fallback_evaluation() method...")
    
    engine = get_reflection_engine()
    
    # 测试空步骤列表
    evaluation = engine._fallback_evaluation("", [])
    assert evaluation.completeness_score == 0, "Empty steps should score 0"
    assert evaluation.needs_retry == True, "Empty steps should need retry"
    print("✅ Test 1 passed: Handles empty steps correctly")
    
    # 测试成功步骤
    step = ReActStep(
        step_number=1,
        thought='test thought',
        action=ToolCall(
            tool_name='test_tool',
            parameters={},
            reasoning='test',
            confidence=0.8,
            source='test'
        ),
        observation=ToolResult(
            success=True,
            data='test result',
            execution_time=0.1,
            tool_name='test_tool'
        ),
        status='completed',
        timestamp=datetime.now()
    )
    
    output = "This is a test output with sufficient length to be considered quality content."
    evaluation = engine._fallback_evaluation(output, [step])
    assert evaluation.completeness_score == 10, "All successful steps should score 10"
    assert evaluation.quality_score >= 8, "Good output should have high quality score"
    assert evaluation.needs_retry == False, "High score should not need retry"
    print("✅ Test 2 passed: Evaluates successful steps correctly")
    
    # 测试部分失败
    failed_step = ReActStep(
        step_number=2,
        thought='test thought',
        action=ToolCall(
            tool_name='test_tool',
            parameters={},
            reasoning='test',
            confidence=0.8,
            source='test'
        ),
        observation=ToolResult(
            success=False,
            error='test error',
            execution_time=0.1,
            tool_name='test_tool'
        ),
        status='failed',
        timestamp=datetime.now()
    )
    
    evaluation = engine._fallback_evaluation(output, [step, failed_step])
    assert evaluation.completeness_score == 5, "50% success rate should score 5"
    assert len(evaluation.missing_info) > 0, "Failed steps should be in missing_info"
    assert evaluation.needs_retry == True, "Low score should need retry"
    print("✅ Test 3 passed: Handles partial failures correctly")


def main():
    """运行所有测试"""
    print("=" * 60)
    print("ReflectionEngine Test Suite")
    print("=" * 60)
    
    try:
        test_reflection_engine_initialization()
        test_should_continue()
        test_clamp_score()
        test_fallback_evaluation()
        
        print("\n" + "=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)
        return 0
    
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
