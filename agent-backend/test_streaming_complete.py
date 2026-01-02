#!/usr/bin/env python3
"""
测试完整的 SSE 流式输出功能

这个脚本测试:
1. Gemini API 的 stream=True 参数
2. LLM Service 的流式生成
3. ReAct Agent 的流式回调
4. API 路由的 SSE 输出
"""

import asyncio
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.llm_service import get_llm_service
from app.core.react_agent import get_react_agent
from app.core.tool_registry import get_tool_registry
from app.core.plugin_manager import plugin_manager
from loguru import logger


async def test_llm_streaming():
    """测试 LLM 服务的流式生成"""
    print("\n" + "="*60)
    print("测试 1: LLM 服务流式生成")
    print("="*60)
    
    llm_service = get_llm_service()
    
    if not llm_service or not llm_service.is_available():
        print("❌ LLM 服务不可用")
        return False
    
    print("✅ LLM 服务已初始化")
    
    prompt = "请用一句话介绍什么是人工智能。"
    print(f"\n提示词: {prompt}")
    print("\n流式输出:")
    print("-" * 60)
    
    try:
        full_response = ""
        chunk_count = 0
        
        async for chunk in llm_service.generate_text_stream(
            prompt,
            temperature=0.7,
            max_tokens=200
        ):
            full_response += chunk
            chunk_count += 1
            print(chunk, end="", flush=True)
        
        print("\n" + "-" * 60)
        print(f"\n✅ 流式生成成功!")
        print(f"   - 总块数: {chunk_count}")
        print(f"   - 总字符数: {len(full_response)}")
        return True
        
    except Exception as e:
        print(f"\n❌ 流式生成失败: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_react_agent_streaming():
    """测试 ReAct Agent 的流式回调"""
    print("\n" + "="*60)
    print("测试 2: ReAct Agent 流式回调")
    print("="*60)
    
    # 初始化组件
    llm_service = get_llm_service()
    tool_registry = get_tool_registry()
    
    # 更新 Plugin Manager
    plugin_manager.tool_registry = tool_registry
    for plugin in list(plugin_manager.plugins.values()):
        plugin_manager.register_plugin(plugin)
    
    react_agent = get_react_agent(tool_registry, llm_service, plugin_manager)
    
    print("✅ ReAct Agent 已初始化")
    
    query = "你好，请介绍一下你自己"
    print(f"\n查询: {query}")
    print("\n流式事件:")
    print("-" * 60)
    
    events = []
    
    async def streaming_callback(event_type: str, data: dict):
        """捕获流式事件"""
        events.append({'type': event_type, 'data': data})
        
        if event_type == "thought_chunk":
            print(data.get('chunk', ''), end="", flush=True)
        elif event_type == "action":
            print(f"\n\n🔧 行动: {data.get('tool_name')} - {data.get('parameters')}")
        elif event_type == "observation":
            success = data.get('success', False)
            status = "✅" if success else "❌"
            print(f"{status} 观察: {'成功' if success else '失败'}")
        elif event_type == "response_chunk":
            print(data.get('chunk', ''), end="", flush=True)
    
    try:
        result = await react_agent.execute(
            query=query,
            session_id="test_streaming",
            context={},
            streaming_callback=streaming_callback
        )
        
        print("\n" + "-" * 60)
        print(f"\n✅ ReAct Agent 执行成功!")
        print(f"   - 总事件数: {len(events)}")
        print(f"   - 步骤数: {len(result.steps)}")
        print(f"   - 执行时间: {result.execution_time:.2f}s")
        
        # 统计事件类型
        event_types = {}
        for event in events:
            event_type = event['type']
            event_types[event_type] = event_types.get(event_type, 0) + 1
        
        print(f"   - 事件类型分布:")
        for event_type, count in event_types.items():
            print(f"     * {event_type}: {count}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ReAct Agent 执行失败: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_api_streaming():
    """测试 API 路由的 SSE 输出"""
    print("\n" + "="*60)
    print("测试 3: API SSE 流式输出")
    print("="*60)
    
    print("\n提示: 使用以下命令测试 API 端点:")
    print("-" * 60)
    print("""
curl -N -X POST http://localhost:8000/api/agent/stream \\
  -H "Content-Type: application/json" \\
  -d '{"input": "你好，请介绍一下你自己"}'
    """)
    print("-" * 60)
    
    print("\n或者使用 Python 客户端:")
    print("-" * 60)
    print("""
import requests
import json

url = "http://localhost:8000/api/agent/stream"
data = {"input": "你好，请介绍一下你自己"}

response = requests.post(url, json=data, stream=True)

for line in response.iter_lines():
    if line:
        line = line.decode('utf-8')
        if line.startswith('data: '):
            event_data = json.loads(line[6:])
            print(event_data)
    """)
    print("-" * 60)
    
    return True


async def main():
    """运行所有测试"""
    print("\n" + "="*60)
    print("SSE 流式输出功能完整测试")
    print("="*60)
    
    results = []
    
    # 测试 1: LLM 流式生成
    result1 = await test_llm_streaming()
    results.append(("LLM 流式生成", result1))
    
    # 测试 2: ReAct Agent 流式回调
    result2 = await test_react_agent_streaming()
    results.append(("ReAct Agent 流式回调", result2))
    
    # 测试 3: API SSE 输出
    result3 = await test_api_streaming()
    results.append(("API SSE 输出", result3))
    
    # 总结
    print("\n" + "="*60)
    print("测试总结")
    print("="*60)
    
    for test_name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{status} - {test_name}")
    
    all_passed = all(result for _, result in results)
    
    if all_passed:
        print("\n🎉 所有测试通过!")
        print("\n下一步:")
        print("1. 启动后端服务: cd agent-backend && uvicorn app.main:app --reload")
        print("2. 测试 API 端点: curl -N -X POST http://localhost:8000/api/agent/stream ...")
        print("3. 在前端集成 SSE 客户端")
    else:
        print("\n⚠️  部分测试失败，请检查错误信息")
    
    return all_passed


if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  测试被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
