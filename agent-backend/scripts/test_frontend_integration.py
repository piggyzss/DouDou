#!/usr/bin/env python3
"""
前后端集成测试
测试 Next.js 前端 → Python 后端的完整链路
"""
import asyncio
import sys
import httpx
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


async def test_backend_health():
    """测试后端健康检查"""
    
    print("=" * 60)
    print("🧪 测试 1: 后端健康检查")
    print("=" * 60)
    print()
    
    backend_url = "http://localhost:8000"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{backend_url}/api/agent/health")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ 后端健康检查通过")
                print(f"     状态: {data.get('status')}")
                print(f"     插件数: {data.get('plugins_count')}")
                print(f"     命令数: {data.get('commands_count')}")
                return True
            else:
                print(f"  ❌ 后端健康检查失败: {response.status_code}")
                return False
    
    except Exception as e:
        print(f"  ❌ 无法连接到后端: {e}")
        print(f"     请确保后端服务正在运行: uvicorn app.main:app --reload")
        return False


async def test_backend_api():
    """测试后端 API"""
    
    print("\n" + "=" * 60)
    print("🧪 测试 2: 后端 API 调用")
    print("=" * 60)
    print()
    
    backend_url = "http://localhost:8000"
    
    test_cases = [
        {
            "input": "/help",
            "description": "帮助命令",
        },
        {
            "input": "最近 AI 有什么新闻？",
            "description": "自然语言查询",
        },
    ]
    
    passed = 0
    failed = 0
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            for i, test_case in enumerate(test_cases, 1):
                print(f"测试 {i}/{len(test_cases)}: {test_case['description']}")
                print(f"  输入: {test_case['input']}")
                
                try:
                    response = await client.post(
                        f"{backend_url}/api/agent/execute",
                        json={
                            "input": test_case['input'],
                            "session_id": "test_session",
                            "context": {}
                        }
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        print(f"  ✅ API 调用成功")
                        print(f"     成功: {data.get('success')}")
                        print(f"     类型: {data.get('type')}")
                        print(f"     插件: {data.get('plugin')}")
                        passed += 1
                    else:
                        print(f"  ❌ API 调用失败: {response.status_code}")
                        print(f"     响应: {response.text}")
                        failed += 1
                
                except Exception as e:
                    print(f"  ❌ 请求失败: {e}")
                    failed += 1
                
                print()
    
    except Exception as e:
        print(f"  ❌ 无法连接到后端: {e}")
        return 0, len(test_cases)
    
    return passed, failed


async def test_frontend_proxy():
    """测试前端代理"""
    
    print("=" * 60)
    print("🧪 测试 3: 前端代理 API")
    print("=" * 60)
    print()
    
    frontend_url = "http://localhost:3000"
    
    print("检查前端代理状态...")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 测试 GET 请求
            response = await client.get(f"{frontend_url}/api/agent/execute")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ 前端代理正常运行")
                print(f"     状态: {data.get('status')}")
                print(f"     后端: {data.get('backend')}")
                return True
            else:
                print(f"  ❌ 前端代理响应异常: {response.status_code}")
                return False
    
    except Exception as e:
        print(f"  ❌ 无法连接到前端: {e}")
        print(f"     请确保前端服务正在运行: npm run dev")
        return False


async def test_full_stack():
    """测试完整的前后端链路"""
    
    print("\n" + "=" * 60)
    print("🧪 测试 4: 完整前后端链路")
    print("=" * 60)
    print()
    
    frontend_url = "http://localhost:3000"
    
    test_input = "最近 AI 有什么新闻？"
    
    print(f"通过前端代理发送请求: {test_input}")
    print()
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{frontend_url}/api/agent/execute",
                json={
                    "input": test_input,
                    "session_id": "test_session",
                    "context": {}
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ 完整链路测试成功")
                print(f"     前端 → 后端 → 插件 → 响应")
                print(f"     成功: {data.get('success')}")
                print(f"     类型: {data.get('type')}")
                print(f"     插件: {data.get('plugin')}")
                print(f"     命令: {data.get('command')}")
                return True
            else:
                print(f"  ❌ 完整链路测试失败: {response.status_code}")
                print(f"     响应: {response.text}")
                return False
    
    except Exception as e:
        print(f"  ❌ 完整链路测试失败: {e}")
        return False


async def main():
    """主函数"""
    
    print("\n" + "=" * 60)
    print("🚀 前后端集成测试")
    print("=" * 60)
    print()
    
    print("⚠️  注意: 此测试需要前后端服务都在运行")
    print("  - 后端: uvicorn app.main:app --reload (端口 8000)")
    print("  - 前端: npm run dev (端口 3000)")
    print()
    
    try:
        # 测试 1: 后端健康检查
        backend_healthy = await test_backend_health()
        
        if not backend_healthy:
            print("\n❌ 后端服务未运行，跳过后续测试")
            print("\n启动后端服务:")
            print("  cd agent-backend")
            print("  uvicorn app.main:app --reload")
            return 1
        
        # 测试 2: 后端 API
        passed2, failed2 = await test_backend_api()
        
        # 测试 3: 前端代理
        frontend_healthy = await test_frontend_proxy()
        
        # 测试 4: 完整链路（仅在前后端都健康时）
        full_stack_passed = False
        if backend_healthy and frontend_healthy:
            full_stack_passed = await test_full_stack()
        
        # 总结
        print("\n" + "=" * 60)
        print("📊 测试结果总结:")
        print("=" * 60)
        
        print(f"  {'✅' if backend_healthy else '❌'} 后端健康检查")
        print(f"  {'✅' if failed2 == 0 else '⚠️'} 后端 API: {passed2} 通过, {failed2} 失败")
        print(f"  {'✅' if frontend_healthy else '❌'} 前端代理")
        print(f"  {'✅' if full_stack_passed else '❌'} 完整链路")
        
        if backend_healthy and frontend_healthy and failed2 == 0 and full_stack_passed:
            print("\n🎉 所有集成测试通过！")
            print("\n✅ 系统已准备好:")
            print("  1. 后端服务正常运行")
            print("  2. 前端代理正常工作")
            print("  3. 完整链路正常工作")
            print("  4. 可以开始使用 Agent 功能")
            return 0
        else:
            print("\n⚠️  部分测试失败")
            
            if not backend_healthy:
                print("\n启动后端:")
                print("  cd agent-backend")
                print("  uvicorn app.main:app --reload")
            
            if not frontend_healthy:
                print("\n启动前端:")
                print("  npm run dev")
            
            return 1
    
    except KeyboardInterrupt:
        print("\n\n⚠️  测试被用户中断")
        return 1
    except Exception as e:
        print(f"\n❌ 测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
