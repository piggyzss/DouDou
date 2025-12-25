#!/usr/bin/env python3
"""
测试 LLM 设置脚本
验证 Gemini API 配置是否正确
"""
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from loguru import logger

# 加载环境变量
load_dotenv()


def test_environment():
    """测试环境变量配置"""
    print("=" * 60)
    print("1. 测试环境变量配置")
    print("=" * 60)
    
    google_api_key = os.getenv("GOOGLE_API_KEY", "")
    llm_provider = os.getenv("LLM_PROVIDER", "none")
    enable_intent = os.getenv("ENABLE_INTENT_ANALYSIS", "false")
    
    print(f"✓ LLM_PROVIDER: {llm_provider}")
    print(f"✓ GOOGLE_API_KEY: {'已配置 (' + google_api_key[:10] + '...)' if google_api_key else '未配置'}")
    print(f"✓ ENABLE_INTENT_ANALYSIS: {enable_intent}")
    
    if not google_api_key:
        print("\n⚠️  警告: GOOGLE_API_KEY 未配置")
        print("   请在 .env 文件中设置 GOOGLE_API_KEY")
        return False
    
    if llm_provider != "google":
        print(f"\n⚠️  警告: LLM_PROVIDER 设置为 '{llm_provider}'，应该是 'google'")
        return False
    
    print("\n✅ 环境变量配置正确\n")
    return True


def test_dependencies():
    """测试依赖包安装"""
    print("=" * 60)
    print("2. 测试依赖包安装")
    print("=" * 60)
    
    try:
        import google.generativeai as genai
        print("✓ google-generativeai 已安装")
        print(f"  版本: {genai.__version__ if hasattr(genai, '__version__') else '未知'}")
    except ImportError:
        print("✗ google-generativeai 未安装")
        print("  请运行: pip install google-generativeai")
        return False
    
    try:
        import tiktoken
        print("✓ tiktoken 已安装")
    except ImportError:
        print("⚠️  tiktoken 未安装（可选）")
    
    print("\n✅ 依赖包安装正确\n")
    return True


def test_llm_service():
    """测试 LLM 服务初始化"""
    print("=" * 60)
    print("3. 测试 LLM 服务初始化")
    print("=" * 60)
    
    try:
        from app.services.llm_service import get_llm_service
        
        service = get_llm_service()
        
        if service is None:
            print("✗ LLM 服务未启用")
            print("  请检查环境变量配置")
            return False
        
        print(f"✓ LLM 服务已创建: {service.__class__.__name__}")
        
        if service.is_available():
            print("✓ LLM 服务可用")
        else:
            print("✗ LLM 服务不可用")
            return False
        
        print("\n✅ LLM 服务初始化成功\n")
        return True
    
    except Exception as e:
        print(f"✗ LLM 服务初始化失败: {e}")
        return False


async def test_api_call():
    """测试 API 调用"""
    print("=" * 60)
    print("4. 测试 Gemini API 调用")
    print("=" * 60)
    
    try:
        from app.services.llm_service import get_llm_service
        
        service = get_llm_service()
        if not service:
            print("✗ LLM 服务不可用，跳过 API 测试")
            return False
        
        print("正在调用 Gemini API...")
        
        # 测试简单的文本生成
        response = await service.generate_text(
            "Say 'Hello, I am Gemini!' in one sentence.",
            temperature=0.7,
            max_tokens=50
        )
        
        print(f"✓ API 响应: {response}")
        
        print("\n✅ Gemini API 调用成功\n")
        return True
    
    except Exception as e:
        print(f"✗ API 调用失败: {e}")
        print("\n可能的原因:")
        print("  1. API Key 无效")
        print("  2. 网络连接问题")
        print("  3. API 配额已用完")
        return False


async def test_tool_selection():
    """测试工具选择"""
    print("=" * 60)
    print("5. 测试工具选择功能")
    print("=" * 60)
    
    try:
        from app.services.llm_service import get_llm_service
        
        service = get_llm_service()
        if not service:
            print("✗ LLM 服务不可用，跳过工具选择测试")
            return False
        
        test_query = "最近 OpenAI 有什么新进展？"
        print(f"测试查询: {test_query}")
        print("正在选择工具...")
        
        # 模拟工具描述
        tools_description = """Available tools:
1. get_latest_news - Get the latest AI news articles
   Parameters: count (int, optional), keywords (list, optional)
2. search_news - Search for specific topics
   Parameters: query (str, required), count (int, optional)
"""
        
        tool_call = await service.select_tool(test_query, tools_description)
        
        print(f"\n✓ 工具选择结果:")
        print(f"  工具: {tool_call.tool_name}")
        print(f"  参数: {tool_call.parameters}")
        print(f"  置信度: {tool_call.confidence}")
        print(f"  推理: {tool_call.reasoning}")
        
        print("\n✅ 工具选择功能正常\n")
        return True
    
    except Exception as e:
        print(f"✗ 工具选择失败: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """主测试流程"""
    print("\n" + "=" * 60)
    print("LLM 设置测试")
    print("=" * 60 + "\n")
    
    results = []
    
    # 1. 测试环境变量
    results.append(("环境变量", test_environment()))
    
    # 2. 测试依赖
    results.append(("依赖包", test_dependencies()))
    
    # 3. 测试服务初始化
    results.append(("服务初始化", test_llm_service()))
    
    # 4. 测试 API 调用
    results.append(("API 调用", await test_api_call()))
    
    # 5. 测试工具选择
    results.append(("工具选择", await test_tool_selection()))
    
    # 总结
    print("=" * 60)
    print("测试总结")
    print("=" * 60)
    
    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{name}: {status}")
    
    all_passed = all(result for _, result in results)
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 所有测试通过！LLM 集成配置正确。")
    else:
        print("⚠️  部分测试失败，请检查上述错误信息。")
    print("=" * 60 + "\n")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    import asyncio
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
