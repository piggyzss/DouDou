#!/usr/bin/env python3
"""
验证阶段 2 完成情况
检查 LLM 与 Intent Analyzer 的集成
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


def check_imports():
    """检查必要的导入"""
    print("📦 检查导入...")
    
    try:
        from app.core.intent_analyzer import IntentAnalyzer
        print("  ✅ IntentAnalyzer")
        
        from app.services.llm_service import get_llm_service, Analyzable
        print("  ✅ LLM Service")
        
        from app.core.plugin_manager import PluginManager
        print("  ✅ PluginManager")
        
        from app.models.intent import Intent
        print("  ✅ Intent Model")
        
        return True
    except ImportError as e:
        print(f"  ❌ 导入失败: {e}")
        return False


def check_intent_analyzer_integration():
    """检查 Intent Analyzer 的 LLM 集成"""
    print("\n🔍 检查 Intent Analyzer 集成...")
    
    try:
        from app.core.intent_analyzer import IntentAnalyzer
        from app.core.plugin_manager import PluginManager
        from app.services.llm_service import get_llm_service
        
        # 创建实例
        plugin_manager = PluginManager()
        llm_service = get_llm_service()
        analyzer = IntentAnalyzer(plugin_manager, llm_service)
        
        print("  ✅ Intent Analyzer 实例化成功")
        
        # 检查方法存在
        if hasattr(analyzer, '_parse_natural_language'):
            print("  ✅ _parse_natural_language 方法存在")
        else:
            print("  ❌ _parse_natural_language 方法不存在")
            return False
        
        if hasattr(analyzer, '_parse_keyword_matching'):
            print("  ✅ _parse_keyword_matching 降级方法存在")
        else:
            print("  ❌ _parse_keyword_matching 降级方法不存在")
            return False
        
        # 检查 LLM 服务注入
        if analyzer.llm_service is not None:
            print(f"  ✅ LLM Service 已注入: {analyzer.llm_service.__class__.__name__}")
        else:
            print("  ⚠️  LLM Service 未配置（将使用降级模式）")
        
        return True
    
    except Exception as e:
        print(f"  ❌ 集成检查失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def check_code_implementation():
    """检查代码实现细节"""
    print("\n📝 检查代码实现...")
    
    intent_analyzer_file = project_root / "app" / "core" / "intent_analyzer.py"
    
    if not intent_analyzer_file.exists():
        print("  ❌ intent_analyzer.py 文件不存在")
        return False
    
    content = intent_analyzer_file.read_text()
    
    checks = [
        ("LLM 服务调用", "await self.llm_service.analyze_intent"),
        ("降级机制", "self._parse_keyword_matching"),
        ("错误处理", "except Exception"),
        ("日志记录", "logger"),
        ("命令验证", "is_command_valid"),
    ]
    
    all_passed = True
    for check_name, check_pattern in checks:
        if check_pattern in content:
            print(f"  ✅ {check_name}")
        else:
            print(f"  ❌ {check_name} - 未找到: {check_pattern}")
            all_passed = False
    
    return all_passed


def check_test_files():
    """检查测试文件"""
    print("\n🧪 检查测试文件...")
    
    test_file = project_root / "scripts" / "test_intent_integration.py"
    
    if test_file.exists():
        print(f"  ✅ 集成测试文件存在: {test_file.name}")
        return True
    else:
        print(f"  ❌ 集成测试文件不存在: {test_file}")
        return False


def main():
    """主函数"""
    print("=" * 60)
    print("🔍 验证阶段 2: LLM 与 Intent Analyzer 集成")
    print("=" * 60)
    print()
    
    results = []
    
    # 执行检查
    results.append(("导入检查", check_imports()))
    results.append(("集成检查", check_intent_analyzer_integration()))
    results.append(("代码实现", check_code_implementation()))
    results.append(("测试文件", check_test_files()))
    
    # 总结
    print("\n" + "=" * 60)
    print("📊 验证结果:")
    print("=" * 60)
    
    for name, passed in results:
        status = "✅ 通过" if passed else "❌ 失败"
        print(f"  {status} - {name}")
    
    all_passed = all(passed for _, passed in results)
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 阶段 2 验证通过！")
        print("\n✅ 已完成:")
        print("  1. LLM Service 集成到 Intent Analyzer")
        print("  2. 实现 _parse_natural_language 方法")
        print("  3. 添加降级机制（关键词匹配）")
        print("  4. 错误处理和日志记录")
        print("  5. 创建集成测试")
        print("\n📝 下一步:")
        print("  1. 运行集成测试: python scripts/test_intent_integration.py")
        print("  2. 测试实际场景")
        print("  3. 继续阶段 3: 端到端测试")
        return 0
    else:
        print("❌ 阶段 2 验证失败")
        print("\n请检查失败的项目并修复")
        return 1


if __name__ == "__main__":
    sys.exit(main())
