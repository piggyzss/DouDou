"""
调试路由 - 用于诊断生产环境问题
"""
from fastapi import APIRouter
import os
import sys
from datetime import datetime

router = APIRouter()


@router.get("/env")
async def check_environment():
    """检查环境变量配置"""
    return {
        "timestamp": datetime.now().isoformat(),
        "environment": {
            "ENVIRONMENT": os.getenv("ENVIRONMENT", "not_set"),
            "LLM_PROVIDER": os.getenv("LLM_PROVIDER", "not_set"),
            "GOOGLE_API_KEY_SET": bool(os.getenv("GOOGLE_API_KEY")),
            "GOOGLE_API_KEY_LENGTH": len(os.getenv("GOOGLE_API_KEY", "")),
            "DEBUG": os.getenv("DEBUG", "not_set"),
            "LOG_LEVEL": os.getenv("LOG_LEVEL", "not_set"),
        },
        "python": {
            "version": sys.version,
            "platform": sys.platform,
        }
    }


@router.get("/dependencies")
async def check_dependencies():
    """检查依赖包是否安装"""
    dependencies = {}
    
    # 检查 google-generativeai
    try:
        import google.generativeai as genai
        dependencies["google-generativeai"] = {
            "installed": True,
            "version": getattr(genai, "__version__", "unknown")
        }
    except ImportError as e:
        dependencies["google-generativeai"] = {
            "installed": False,
            "error": str(e)
        }
    
    # 检查 fastapi
    try:
        import fastapi
        dependencies["fastapi"] = {
            "installed": True,
            "version": fastapi.__version__
        }
    except ImportError as e:
        dependencies["fastapi"] = {
            "installed": False,
            "error": str(e)
        }
    
    # 检查 loguru
    try:
        import loguru
        dependencies["loguru"] = {
            "installed": True,
            "version": getattr(loguru, "__version__", "unknown")
        }
    except ImportError as e:
        dependencies["loguru"] = {
            "installed": False,
            "error": str(e)
        }
    
    return {
        "timestamp": datetime.now().isoformat(),
        "dependencies": dependencies
    }


@router.get("/llm-test")
async def test_llm_service():
    """测试 LLM 服务初始化"""
    from ...services.llm_service import get_llm_service, LLMServiceError
    
    result = {
        "timestamp": datetime.now().isoformat(),
        "llm_provider": os.getenv("LLM_PROVIDER", "not_set"),
        "api_key_configured": bool(os.getenv("GOOGLE_API_KEY")),
    }
    
    try:
        llm_service = get_llm_service()
        
        if llm_service is None:
            result["status"] = "disabled"
            result["message"] = "LLM service is disabled (provider=none or not configured)"
        else:
            result["status"] = "initialized"
            result["available"] = llm_service.is_available()
            result["model_name"] = getattr(llm_service, "model_name", "unknown")
            
            # 尝试简单的文本生成
            try:
                response = await llm_service.generate_text(
                    "Say 'Hello' in one word",
                    temperature=0.1,
                    max_tokens=10
                )
                result["test_generation"] = {
                    "success": True,
                    "response": response[:50]  # 只返回前50个字符
                }
            except Exception as gen_error:
                result["test_generation"] = {
                    "success": False,
                    "error": str(gen_error),
                    "error_type": type(gen_error).__name__
                }
    
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        result["error_type"] = type(e).__name__
        
        # 提供更详细的错误信息
        import traceback
        result["traceback"] = traceback.format_exc()
    
    return result


@router.get("/plugin-test")
async def test_plugins():
    """测试插件系统"""
    from ...core.plugin_manager import plugin_manager
    from ...core.tool_registry import get_tool_registry
    
    result = {
        "timestamp": datetime.now().isoformat(),
    }
    
    try:
        # 获取插件列表
        plugins = plugin_manager.get_enabled_plugins()
        result["plugins"] = {
            "count": len(plugins),
            "list": [
                {
                    "id": p.id,
                    "name": p.name,
                    "enabled": p.enabled,
                    "has_tools": hasattr(p, "tools")
                }
                for p in plugins
            ]
        }
        
        # 获取工具列表
        tool_registry = get_tool_registry()
        tools = tool_registry.get_all_tools()
        result["tools"] = {
            "count": len(tools),
            "list": [
                {
                    "name": t.name,
                    "plugin_id": t.plugin_id,
                    "description": t.description[:50] if t.description else ""
                }
                for t in tools
            ]
        }
        
        result["status"] = "success"
    
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        result["error_type"] = type(e).__name__
    
    return result


@router.get("/full-diagnostic")
async def full_diagnostic():
    """完整诊断"""
    env_check = await check_environment()
    dep_check = await check_dependencies()
    llm_check = await test_llm_service()
    plugin_check = await test_plugins()
    
    return {
        "timestamp": datetime.now().isoformat(),
        "environment": env_check,
        "dependencies": dep_check,
        "llm_service": llm_check,
        "plugins": plugin_check,
        "summary": {
            "all_dependencies_installed": all(
                dep.get("installed", False) 
                for dep in dep_check.get("dependencies", {}).values()
            ),
            "llm_available": llm_check.get("available", False),
            "plugins_loaded": plugin_check.get("plugins", {}).get("count", 0) > 0,
        }
    }
