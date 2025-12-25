#!/usr/bin/env python3
"""
测试 LLM 响应解析修复
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.prompts.react_prompts import ReActIterationPrompt

# 测试用例
test_cases = [
    # 正常的 JSON
    ('{"thought": "test", "tool_name": "get_latest_news", "parameters": {}, "reasoning": "test"}', True),
    
    # Markdown 代码块包裹的 JSON
    ('```json\n{"thought": "test", "tool_name": "get_latest_news", "parameters": {}, "reasoning": "test"}\n```', True),
    
    # 带额外文本的 JSON
    ('Here is my response:\n{"thought": "test", "tool_name": "get_latest_news", "parameters": {}, "reasoning": "test"}', True),
    
    # 完全无效的响应
    ('This is not JSON at all', False),
    
    # 空响应
    ('', False),
]

print("=" * 80)
print("测试 LLM 响应解析修复")
print("=" * 80)
print()

for i, (response, should_succeed) in enumerate(test_cases, 1):
    print(f"测试用例 {i}:")
    print(f"  输入: {response[:60]}...")
    
    result = ReActIterationPrompt.parse_response(response)
    
    is_error = result.get('tool_name') == '_parsing_error'
    
    if should_succeed and not is_error:
        print(f"  ✓ 成功解析")
        print(f"    tool_name: {result.get('tool_name')}")
    elif not should_succeed and is_error:
        print(f"  ✓ 正确识别为解析错误")
    else:
        print(f"  ✗ 测试失败")
        print(f"    预期: {'成功' if should_succeed else '失败'}")
        print(f"    实际: {'成功' if not is_error else '失败'}")
    
    print()

print("=" * 80)
print("测试完成")
print("=" * 80)
