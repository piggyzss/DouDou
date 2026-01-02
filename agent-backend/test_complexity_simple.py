#!/usr/bin/env python3
"""
简化的复杂度分类测试（无需依赖）
"""

def classify_complexity(query: str) -> str:
    """
    简化版的复杂度分类函数（从 task_planner.py 提取）
    """
    query_length = len(query)
    query_lower = query.lower()
    
    # 检查是否有多个问题或请求
    has_multiple_intents = any(
        marker in query_lower
        for marker in ["然后", "接着", "还有", "另外", "同时", "以及", "and then", "also", "additionally"]
    )
    
    # 检查是否需要上下文
    needs_context = any(
        marker in query_lower
        for marker in ["继续", "上次", "之前", "刚才", "那个", "这个", "continue", "previous", "last"]
    )
    
    # 检查是否需要深度分析
    needs_analysis = any(
        marker in query_lower
        for marker in [
            "分析", "analyze", "analysis", "深入", "详细", "详尽", "深度",
            "比较", "compare", "对比", "总结", "summarize", "归纳",
            "趋势", "trend", "发展", "进展", "progress", "演变", "evolution",
            "评估", "evaluate", "研究", "research", "调查", "investigate"
        ]
    )
    
    # 检查是否需要搜索和整合信息
    needs_search = any(
        marker in query_lower
        for marker in [
            "最近", "recent", "latest", "新闻", "news", "动态", "updates",
            "搜索", "search", "查找", "find", "寻找", "look for"
        ]
    )
    
    # 分类逻辑
    if needs_analysis or needs_search:
        if (needs_analysis and needs_search) or has_multiple_intents or needs_context:
            return "complex"
        else:
            return "medium"
    
    # 原有的长度判断逻辑
    SIMPLE_QUERY_MAX_LENGTH = 50
    MEDIUM_QUERY_MAX_LENGTH = 150
    
    if query_length <= SIMPLE_QUERY_MAX_LENGTH and not has_multiple_intents and not needs_context:
        return "simple"
    elif query_length <= MEDIUM_QUERY_MAX_LENGTH or has_multiple_intents:
        return "medium"
    else:
        return "complex"


def main():
    """测试复杂度分类"""
    
    # 测试用例
    test_cases = [
        # Simple queries
        ("你好", "simple"),
        ("今天天气怎么样", "simple"),
        ("帮我搜索一下", "medium"),  # 包含"搜索"关键词
        
        # Medium queries (需要分析或搜索)
        ("分析最近 OpenAI 的技术进展", "complex"),  # 分析 + 最近
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
        actual_complexity = classify_complexity(query)
        
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
    
    # 重点测试用户的查询
    print("\n" + "="*80)
    print("用户查询测试")
    print("="*80 + "\n")
    
    user_query = "分析最近 OpenAI 的技术进展"
    complexity = classify_complexity(user_query)
    
    print(f"查询: {user_query}")
    print(f"复杂度: {complexity}")
    print(f"\n分析:")
    print(f"  - 包含'分析'关键词: ✅")
    print(f"  - 包含'最近'关键词: ✅")
    print(f"  - 需要搜索: ✅")
    print(f"  - 需要分析: ✅")
    print(f"  - 应该拆分为多个步骤: ✅")
    print(f"\n预期行为:")
    print(f"  1. Step 1: 搜索最近 OpenAI 的新闻和动态")
    print(f"  2. Step 2: 分析搜索结果，提取关键技术进展")
    print(f"  3. Step 3: 总结和归纳主要趋势")
    print("="*80 + "\n")
    
    return failed == 0


if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
