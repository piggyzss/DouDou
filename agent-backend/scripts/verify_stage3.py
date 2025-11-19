#!/usr/bin/env python3
"""
验证阶段 3 完成情况
检查端到端测试和前后端集成
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
        from app.api.routes.agent import execute_command, execute_intent
        print("  ✅ Agent API 路由")
        
        from app.services.llm_service import get_llm_service
        print("  ✅ LLM Service")
        
        from app.core.intent_analyzer import IntentAnalyzer
        print("  ✅ Intent Analyzer")
        
        return True
    except ImportError as e:
        print(f"  ❌ 导入失败: {e}")
        return False


def check_llm_integration():
    """检查 LLM 集成到 API 路由"""
    print("\n🔍 检查 LLM 集成...")
    
    agent_file = project_root / "app" / "api" / "routes" / "agent.py"
    
    if not agent_file.exists():
        print("  ❌ agent.py 文件不存在")
        return False
    
    content = agent_file.read_text()
    
    checks = [
        ("导入 LLM Service", "from ...services.llm_service import get_llm_service"),
        ("获取 LLM Service", "llm_service = get_llm_service()"),
        ("传递给 Intent Analyzer", "llm_service=llm_service"),
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
    
    test_files = [
        ("scripts/test_e2e.py", "端到端测试"),
        ("scripts/test_frontend_integration.py", "前后端集成测试"),
        ("scripts/verify_stage3.py", "阶段验证脚本"),
    ]
    
    all_exist = True
    for file_path, description in test_files:
        full_path = project_root / file_path
        if full_path.exists():
            print(f"  ✅ {description}: {file_path}")
        else:
            print(f"  ❌ {description}: {file_path} - 不存在")
            all_exist = False
    
    return all_exist


def check_api_structure():
    """检查 API 结构"""
    print("\n📝 检查 API 结构...")
    
    agent_file = project_root / "app" / "api" / "routes" / "agent.py"
    
    if not agent_file.exists():
        print("  ❌ agent.py 文件不存在")
        return False
    
    content = agent_file.read_text()
    
    checks = [
        ("execute_command 函数", "async def execute_command"),
        ("execute_intent 函数", "async def execute_intent"),
        ("意图分析", "intent = await intent_analyzer.parse_input"),
        ("意图执行", "response = await execute_intent(intent)"),
        ("插件路由", "/plugins"),
        ("命令路由", "/commands"),
        ("健康检查", "/health"),
    ]
    
    all_passed = True
    for check_name, check_pattern in checks:
        if check_pattern in content:
            print(f"  ✅ {check_name}")
        else:
            print(f"  ❌ {check_name} - 未找到")
            all_passed = False
    
    return all_passed


def main():
    """主函数"""
    print("=" * 60)
    print("🔍 验证阶段 3: 端到端测试和前后端集成")
    print("=" * 60)
    print()
    
    results = []
    
    # 执行检查
    results.append(("导入检查", check_imports()))
    results.append(("LLM 集成", check_llm_integration()))
    results.append(("测试文件", check_test_files()))
    results.append(("API 结构", check_api_structure()))
    
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
        print("🎉 阶段 3 验证通过！")
        print("\n✅ 已完成:")
        print("  1. LLM Service 集成到 API 路由")
        print("  2. 完整的意图分析 → 执行流程")
        print("  3. 端到端测试脚本")
        print("  4. 前后端集成测试脚本")
        print("\n📝 下一步:")
        print("  1. 运行端到端测试: python scripts/test_e2e.py")
        print("  2. 启动后端服务: uvicorn app.main:app --reload")
        print("  3. 启动前端服务: npm run dev")
        print("  4. 运行集成测试: python scripts/test_frontend_integration.py")
        return 0
    else:
        print("❌ 阶段 3 验证失败")
        print("\n请检查失败的项目并修复")
        return 1


if __name__ == "__main__":
    sys.exit(main())
