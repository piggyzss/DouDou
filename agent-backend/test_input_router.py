"""
测试 Input Router 功能
"""
import asyncio
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.intent_analyzer import IntentAnalyzer
from app.core.plugin_manager import PluginManager


async def test_intent_analyzer():
    """测试意图分析器"""
    
    # 初始化
    plugin_manager = PluginManager()
    intent_analyzer = IntentAnalyzer(plugin_manager=plugin_manager, llm_service=None)
    
    print("=" * 60)
    print("测试 Intent Analyzer - 统一输入处理")
    print("=" * 60)
    
    # 测试用例
    test_cases = [
        # 命令式输入
        ("/latest", "命令式：获取最新资讯（默认数量）"),
        ("/latest 10", "命令式：获取最新资讯（指定数量）"),
        ("/trending", "命令式：获取趋势"),
        ("/deepdive GPT-4", "命令式：深度分析 GPT-4"),
        ("/help", "命令式：帮助"),
        
        # 自然语言输入
        ("最近有什么AI新闻？", "自然语言：询问最新新闻"),
        ("给我看看最新的5条AI资讯", "自然语言：指定数量的最新资讯"),
        ("现在AI领域有什么热点？", "自然语言：询问趋势"),
        ("深度分析一下OpenAI的最新进展", "自然语言：深度分析"),
        ("最近OpenAI有什么新进展？", "自然语言：搜索特定公司"),
        ("GPT-4有什么更新吗？", "自然语言：搜索特定技术"),
        
        # 边界情况
        ("/unknown", "无效命令"),
        ("", "空输入"),
    ]
    
    for user_input, description in test_cases:
        print(f"\n{'─' * 60}")
        print(f"📝 测试: {description}")
        print(f"输入: \"{user_input}\"")
        print()
        
        try:
            if not user_input:
                print("❌ 跳过空输入")
                continue
                
            intent = await intent_analyzer.parse_input(user_input)
            
            print(f"✅ 解析成功!")
            print(f"   命令: {intent.command}")
            print(f"   参数: {intent.params}")
            print(f"   来源: {intent.source}")
            print(f"   置信度: {intent.confidence}")
            
            if intent.keywords:
                print(f"   关键词: {intent.keywords}")
            if intent.time_range:
                print(f"   时间范围: {intent.time_range}")
            if intent.entities:
                print(f"   实体: {intent.entities}")
                
        except Exception as e:
            print(f"❌ 解析失败: {str(e)}")
    
    print(f"\n{'=' * 60}")
    print("测试完成!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_intent_analyzer())
