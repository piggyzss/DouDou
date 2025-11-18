#!/usr/bin/env python3
"""
阶段 1 验证脚本
快速检查阶段 1 是否完成
"""
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def check_files():
    """检查必需文件是否存在"""
    print("检查文件...")
    
    required_files = [
        "requirements.txt",
        ".env.example",
        "app/services/llm_service.py",
        "scripts/test_llm_setup.py",
        "QUICKSTART_LLM.md",
        "STAGE1_SUMMARY.md",
    ]
    
    missing = []
    for file in required_files:
        if os.path.exists(file):
            print(f"  ✓ {file}")
        else:
            print(f"  ✗ {file} (缺失)")
            missing.append(file)
    
    return len(missing) == 0


def check_dependencies():
    """检查依赖是否安装"""
    print("\n检查依赖...")
    
    try:
        import google.generativeai
        print("  ✓ google-generativeai")
        return True
    except ImportError:
        print("  ✗ google-generativeai (未安装)")
        return False


def check_env():
    """检查环境变量"""
    print("\n检查环境变量...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    checks = []
    
    # 检查 .env 文件
    if os.path.exists(".env"):
        print("  ✓ .env 文件存在")
        checks.append(True)
    else:
        print("  ✗ .env 文件不存在")
        checks.append(False)
    
    # 检查 API Key
    api_key = os.getenv("GOOGLE_API_KEY", "")
    if api_key and api_key != "your_google_api_key_here":
        print(f"  ✓ GOOGLE_API_KEY 已配置")
        checks.append(True)
    else:
        print("  ✗ GOOGLE_API_KEY 未配置")
        checks.append(False)
    
    # 检查 LLM Provider
    provider = os.getenv("LLM_PROVIDER", "")
    if provider == "google":
        print("  ✓ LLM_PROVIDER=google")
        checks.append(True)
    else:
        print(f"  ✗ LLM_PROVIDER={provider} (应该是 google)")
        checks.append(False)
    
    return all(checks)


def check_service():
    """检查 LLM 服务"""
    print("\n检查 LLM 服务...")
    
    try:
        from app.services.llm_service import get_llm_service
        
        service = get_llm_service()
        
        if service is None:
            print("  ✗ LLM 服务未启用")
            return False
        
        print(f"  ✓ LLM 服务已创建: {service.__class__.__name__}")
        
        if service.is_available():
            print("  ✓ LLM 服务可用")
            return True
        else:
            print("  ✗ LLM 服务不可用")
            return False
    
    except Exception as e:
        print(f"  ✗ 错误: {e}")
        return False


def main():
    """主函数"""
    print("=" * 60)
    print("阶段 1 验证")
    print("=" * 60)
    print()
    
    results = []
    
    # 1. 检查文件
    results.append(("文件", check_files()))
    
    # 2. 检查依赖
    results.append(("依赖", check_dependencies()))
    
    # 3. 检查环境变量
    results.append(("环境变量", check_env()))
    
    # 4. 检查服务
    results.append(("LLM 服务", check_service()))
    
    # 总结
    print("\n" + "=" * 60)
    print("验证结果")
    print("=" * 60)
    
    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{name}: {status}")
    
    all_passed = all(result for _, result in results)
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ 阶段 1 验证通过！")
        print("\n准备好继续阶段 2 了！")
        print("\n下一步:")
        print("1. 回复 '继续阶段 2' 或 '阶段 1 完成'")
        print("2. 查看 STAGE1_SUMMARY.md 了解详情")
    else:
        print("❌ 阶段 1 验证失败")
        print("\n请执行:")
        print("1. 运行 'bash scripts/setup_llm.sh' 重新设置")
        print("2. 或查看 QUICKSTART_LLM.md 手动设置")
    print("=" * 60)
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
