#!/usr/bin/env python3
"""
测试 Gemini API 的 stream=True 参数

这个脚本直接测试 Gemini API 的流式输出功能
"""

import asyncio
import os
import sys

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 尝试加载 .env 文件
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️  未安装 python-dotenv，将使用系统环境变量")
    pass

async def test_gemini_stream_basic():
    """测试基本的 Gemini 流式输出"""
    print("\n" + "="*60)
    print("测试: Gemini API stream=True 参数")
    print("="*60)
    
    try:
        import google.generativeai as genai
        
        # 配置 API
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("❌ 未找到 GOOGLE_API_KEY 环境变量")
            return False
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        print("✅ Gemini API 已配置")
        
        prompt = "请用一句话介绍什么是人工智能。"
        print(f"\n提示词: {prompt}")
        print("\n流式输出 (stream=True):")
        print("-" * 60)
        
        # 使用 stream=True
        response_stream = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 200,
            },
            stream=True  # 关键参数
        )
        
        full_text = ""
        chunk_count = 0
        
        for chunk in response_stream:
            if chunk.text:
                full_text += chunk.text
                chunk_count += 1
                print(chunk.text, end="", flush=True)
                # 模拟延迟
                await asyncio.sleep(0.05)
        
        print("\n" + "-" * 60)
        print(f"\n✅ 流式输出成功!")
        print(f"   - 总块数: {chunk_count}")
        print(f"   - 总字符数: {len(full_text)}")
        print(f"\n完整响应:\n{full_text}")
        
        return True
        
    except ImportError:
        print("❌ 未安装 google-generativeai 包")
        print("   请运行: pip install google-generativeai")
        return False
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_gemini_stream_vs_non_stream():
    """对比流式和非流式输出"""
    print("\n" + "="*60)
    print("对比测试: stream=True vs stream=False")
    print("="*60)
    
    try:
        import google.generativeai as genai
        import time
        
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("❌ 未找到 GOOGLE_API_KEY 环境变量")
            return False
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = "请列举5个编程语言的名称。"
        
        # 测试非流式
        print("\n1. 非流式输出 (stream=False):")
        print("-" * 60)
        start_time = time.time()
        
        response = model.generate_content(
            prompt,
            generation_config={"temperature": 0.7, "max_output_tokens": 200},
            stream=False
        )
        
        non_stream_time = time.time() - start_time
        print(response.text)
        print("-" * 60)
        print(f"耗时: {non_stream_time:.2f}s")
        
        # 测试流式
        print("\n2. 流式输出 (stream=True):")
        print("-" * 60)
        start_time = time.time()
        
        response_stream = model.generate_content(
            prompt,
            generation_config={"temperature": 0.7, "max_output_tokens": 200},
            stream=True
        )
        
        first_chunk_time = None
        chunk_count = 0
        
        for chunk in response_stream:
            if chunk.text:
                if first_chunk_time is None:
                    first_chunk_time = time.time() - start_time
                chunk_count += 1
                print(chunk.text, end="", flush=True)
                await asyncio.sleep(0.05)
        
        stream_time = time.time() - start_time
        print("\n" + "-" * 60)
        print(f"首块耗时: {first_chunk_time:.2f}s")
        print(f"总耗时: {stream_time:.2f}s")
        print(f"总块数: {chunk_count}")
        
        # 对比
        print("\n" + "="*60)
        print("对比结果:")
        print(f"  非流式总耗时: {non_stream_time:.2f}s")
        print(f"  流式首块耗时: {first_chunk_time:.2f}s (用户感知延迟)")
        print(f"  流式总耗时: {stream_time:.2f}s")
        print(f"  用户体验提升: {((non_stream_time - first_chunk_time) / non_stream_time * 100):.1f}%")
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """运行所有测试"""
    print("\n" + "="*60)
    print("Gemini API 流式输出测试")
    print("="*60)
    
    # 测试 1: 基本流式输出
    result1 = await test_gemini_stream_basic()
    
    if result1:
        # 测试 2: 对比测试
        result2 = await test_gemini_stream_vs_non_stream()
    else:
        result2 = False
    
    # 总结
    print("\n" + "="*60)
    print("测试总结")
    print("="*60)
    
    if result1 and result2:
        print("✅ 所有测试通过!")
        print("\n✨ Gemini API 的 stream=True 参数工作正常")
        print("   - 可以实现真正的流式输出")
        print("   - 显著提升用户体验")
        print("   - 减少首次响应延迟")
    else:
        print("❌ 部分测试失败")
        if not result1:
            print("   - 基本流式输出测试失败")
        if not result2:
            print("   - 对比测试失败")
    
    return result1 and result2


if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  测试被用户中断")
        exit(1)
    except Exception as e:
        print(f"\n\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
