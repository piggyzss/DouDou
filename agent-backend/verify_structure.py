"""
验证项目结构和文件
"""
import os
import sys

def check_file(filepath, description):
    """检查文件是否存在"""
    if os.path.exists(filepath):
        size = os.path.getsize(filepath)
        print(f"✅ {description}")
        print(f"   文件: {filepath}")
        print(f"   大小: {size} bytes")
        return True
    else:
        print(f"❌ {description}")
        print(f"   文件不存在: {filepath}")
        return False

def main():
    print("=" * 60)
    print("验证 Agent Backend 项目结构")
    print("=" * 60)
    print()
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    files_to_check = [
        # 核心模型
        ("app/models/intent.py", "Intent 模型"),
        ("app/models/base.py", "基础模型"),
        
        # 核心组件
        ("app/core/intent_analyzer.py", "Intent Analyzer"),
        ("app/core/plugin_manager.py", "Plugin Manager"),
        
        # API 路由
        ("app/api/routes/agent.py", "Agent API 路由"),
        
        # 配置
        ("app/config.py", "配置文件"),
        ("app/main.py", "主应用"),
        
        # 文档
        ("DESIGN.md", "设计文档"),
        ("GUIDE.md", "开发指南"),
        
        # 测试
        ("test_input_router.py", "测试脚本"),
        
        # 依赖
        ("requirements.txt", "依赖列表"),
    ]
    
    success_count = 0
    total_count = len(files_to_check)
    
    for filepath, description in files_to_check:
        full_path = os.path.join(base_dir, filepath)
        if check_file(full_path, description):
            success_count += 1
        print()
    
    print("=" * 60)
    print(f"验证完成: {success_count}/{total_count} 文件存在")
    print("=" * 60)
    print()
    
    if success_count == total_count:
        print("🎉 所有文件都已创建！")
        print()
        print("下一步:")
        print("1. 安装依赖: pip install -r requirements.txt")
        print("2. 运行测试: python test_input_router.py")
        print("3. 启动服务: python -m app.main")
        print("4. 查看文档: cat GUIDE.md")
        return 0
    else:
        print("⚠️  有些文件缺失，请检查")
        return 1

if __name__ == "__main__":
    sys.exit(main())
