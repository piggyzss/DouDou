from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from ...models.base import AgentRequest, AgentResponse
from ...core.plugin_manager import plugin_manager
from ...core.react_agent import ReactAgent, get_react_agent
from ...core.tool_registry import get_tool_registry
from ...services.llm_service import get_llm_service
from loguru import logger
from datetime import datetime
import traceback

router = APIRouter()


# 全局异常处理函数（将在 main.py 中注册）
async def global_exception_handler(request: Request, exc: Exception):
    """
    全局异常处理器
    
    捕获所有未处理的异常，返回结构化错误响应
    """
    # 记录完整错误信息
    logger.error(
        f"Unhandled exception in {request.method} {request.url.path}",
        exc_info=True
    )
    
    # 构建错误响应
    error_response = {
        "success": False,
        "error": str(exc),
        "type": "error",
        "plugin": "system",
        "command": "",
        "timestamp": datetime.now().isoformat(),
        "metadata": {
            "error_type": type(exc).__name__,
            "path": str(request.url.path),
            "method": request.method
        }
    }
    
    # 在开发环境中包含堆栈跟踪
    import os
    if os.getenv("ENVIRONMENT") == "development":
        error_response["metadata"]["traceback"] = traceback.format_exc()
    
    return JSONResponse(
        status_code=500,
        content=error_response
    )

# 初始化组件
llm_service = get_llm_service()
tool_registry = get_tool_registry()

# 更新 Plugin Manager 以使用 Tool Registry
plugin_manager.tool_registry = tool_registry

# 重新注册所有插件以注册工具
for plugin in list(plugin_manager.plugins.values()):
    plugin_manager.register_plugin(plugin)

# 初始化 React Agent
react_agent = get_react_agent(tool_registry, llm_service, plugin_manager)


@router.post("/execute", response_model=AgentResponse)
async def execute_command(request: AgentRequest):
    """
    执行自然语言查询
    
    使用 ReactAgent 处理用户的自然语言输入，通过 LLM 驱动的多步推理选择和执行合适的工具
    
    示例：
    - "获取最新的AI资讯"
    - "帮我查找关于 GPT-4 的新闻"
    - "最近有什么重要的技术动态？"
    """
    try:
        # 兼容旧版 API（使用 command 字段）
        user_input = request.input or request.command
        
        if not user_input:
            raise HTTPException(status_code=400, detail="Missing input field")
        
        if not user_input.strip():
            raise HTTPException(status_code=400, detail="Input cannot be empty")
        
        logger.info(f"Executing natural language query: {user_input[:100]}...")
        
        # 使用 ReactAgent 执行
        react_response = await react_agent.execute(
            query=user_input,
            session_id=request.session_id or "default",
            context=request.context or {}
        )
        
        # 将 ReactResponse 转换为 AgentResponse
        response = AgentResponse(
            success=react_response.success,
            data=react_response.response if react_response.success else None,
            error=react_response.error if react_response.error else "",
            type="text" if react_response.success else "error",
            plugin="react_agent",
            command="react",
            timestamp=react_response.timestamp,
            metadata={
                "steps": [step.to_dict() for step in react_response.steps],
                "plan": react_response.plan.to_dict(),
                "evaluation": react_response.evaluation.to_dict(),
                "execution_time": react_response.execution_time
            }
        )
        
        logger.info(f"Execution completed: success={response.success}")
        
        return response
        
    except HTTPException:
        # 重新抛出 HTTP 异常
        raise
    except ValueError as e:
        # 参数验证错误
        logger.warning(f"Validation error: {e}")
        return AgentResponse(
            success=False,
            error=f"Invalid input: {str(e)}",
            type="validation_error",
            plugin="system",
            command="",
            timestamp=datetime.now()
        )
    except Exception as e:
        # 其他未预期的错误
        logger.error(f"Execution failed: {e}", exc_info=True)
        return AgentResponse(
            success=False,
            error=f"Internal error: {str(e)}",
            type="error",
            plugin="system",
            command="",
            timestamp=datetime.now(),
            metadata={
                "error_type": type(e).__name__
            }
        )


@router.get("/plugins")
async def get_plugins():
    """获取所有可用插件"""
    plugins = plugin_manager.get_enabled_plugins()
    return {
        "plugins": [
            {
                "id": plugin.id,
                "name": plugin.name,
                "description": plugin.description,
                "enabled": plugin.enabled,
                "tools_count": len(plugin.tools) if hasattr(plugin, 'tools') else 0
            }
            for plugin in plugins
        ]
    }


@router.get("/tools")
async def get_tools():
    """获取所有可用工具（NEW）"""
    tools = tool_registry.get_all_tools()
    return {
        "tools": [tool.to_dict() for tool in tools],
        "summary": tool_registry.get_tool_summary()
    }


@router.post("/stream")
async def stream_execution(request: AgentRequest):
    """
    流式执行自然语言查询（Server-Sent Events）
    
    实时流式传输 ReActStep 更新，让用户看到 Agent 的思考过程
    """
    from fastapi.responses import StreamingResponse
    import json
    import asyncio
    
    try:
        # 兼容旧版 API
        user_input = request.input or request.command
        
        if not user_input:
            raise HTTPException(status_code=400, detail="Missing input field")
        
        if not user_input.strip():
            raise HTTPException(status_code=400, detail="Input cannot be empty")
        
        logger.info(f"Streaming request: {user_input[:100]}...")
        
        async def event_generator():
            """生成 SSE 事件流"""
            try:
                # 发送开始事件
                yield f"data: {json.dumps({'type': 'start', 'message': 'Starting execution...'})}\n\n"
                
                # 创建 ReactAgent 实例
                session_id = request.session_id or "default"
                
                # 注意：这里需要修改 ReactAgent 以支持流式输出
                # 当前实现是一个简化版本，实际需要在 ReactAgent 中添加回调机制
                
                # 临时实现：执行完整查询然后流式发送结果
                react_response = await react_agent.execute(
                    query=user_input,
                    session_id=session_id,
                    context=request.context or {}
                )
                
                # 流式发送每个步骤
                for i, step in enumerate(react_response.steps, 1):
                    step_data = {
                        'type': 'step',
                        'step_number': i,
                        'thought': step.thought,
                        'action': step.action.tool_name,
                        'status': step.status,
                        'observation': step.observation.data if step.observation.is_success() else step.observation.error
                    }
                    yield f"data: {json.dumps(step_data)}\n\n"
                    await asyncio.sleep(0.1)  # 模拟实时流式
                
                # 发送最终响应
                final_data = {
                    'type': 'complete',
                    'success': react_response.success,
                    'response': react_response.response,
                    'evaluation': {
                        'completeness_score': react_response.evaluation.completeness_score,
                        'quality_score': react_response.evaluation.quality_score
                    },
                    'execution_time': react_response.execution_time
                }
                yield f"data: {json.dumps(final_data)}\n\n"
                
            except Exception as e:
                logger.error(f"Streaming failed: {e}", exc_info=True)
                error_data = {
                    'type': 'error',
                    'error': str(e)
                }
                yield f"data: {json.dumps(error_data)}\n\n"
        
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # 禁用 Nginx 缓冲
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Stream setup failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "plugins_count": len(plugin_manager.get_enabled_plugins()),
        "tools_count": len(tool_registry.get_all_tools()),
        "llm_available": llm_service.is_available() if llm_service else False,
        "agent_type": "ReactAgent"
    }
