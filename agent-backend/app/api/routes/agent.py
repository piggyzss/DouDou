from fastapi import APIRouter, HTTPException
from ...models.base import AgentRequest, AgentResponse
from ...models.intent import Intent, InvalidCommandError
from ...core.plugin_manager import plugin_manager
from ...core.intent_analyzer import IntentAnalyzer

router = APIRouter()

# 初始化 Intent Analyzer
intent_analyzer = IntentAnalyzer(plugin_manager=plugin_manager, llm_service=None)


@router.post("/execute", response_model=AgentResponse)
async def execute_command(request: AgentRequest):
    """
    执行 Agent 命令或自然语言查询
    
    支持两种输入方式：
    1. 命令式：request.input = "/latest 5"
    2. 自然语言：request.input = "最近 OpenAI 有什么新进展？"
    """
    try:
        # 兼容旧版 API（使用 command 字段）
        user_input = request.input or request.command
        
        if not user_input:
            raise HTTPException(status_code=400, detail="Missing input or command field")
        
        # 1. 将输入转换为 Intent
        intent = await intent_analyzer.parse_input(user_input, request.context)
        
        # 2. 执行 Intent
        response = await execute_intent(intent)
        
        return response
        
    except InvalidCommandError as e:
        return AgentResponse(
            success=False,
            error=str(e),
            type="error",
            plugin="system",
            command=user_input,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def execute_intent(intent: Intent) -> AgentResponse:
    """
    执行意图 - 统一的执行逻辑
    无论输入来源如何，都使用相同的执行路径
    """
    # 根据 command 找到对应的插件
    plugin_id = plugin_manager.get_plugin_for_command(intent.command)
    
    if not plugin_id:
        return AgentResponse(
            success=False,
            error=f"No plugin found for command: {intent.command}",
            type="error",
            plugin="system",
            command=intent.command,
        )
    
    plugin = plugin_manager.get_plugin(plugin_id)
    
    if not plugin or not plugin.enabled:
        return AgentResponse(
            success=False,
            error=f"Plugin {plugin_id} is not available",
            type="error",
            plugin=plugin_id,
            command=intent.command,
        )
    
    # 构造旧版 AgentRequest 以兼容现有插件
    legacy_request = AgentRequest(
        input=intent.original_input,
        command=intent.command,
        params=intent.params,
        session_id="default",
        context={}
    )
    
    # 执行插件
    response = await plugin.execute(legacy_request)
    
    # 如果是自然语言输入，可以在这里添加 LLM 增强
    # TODO: 实现 LLM 增强输出
    
    return response


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
                "commands": [
                    {
                        "command": cmd.command,
                        "description": cmd.description,
                        "usage": cmd.usage,
                        "examples": cmd.examples,
                    }
                    for cmd in plugin.commands
                ],
            }
            for plugin in plugins
        ]
    }


@router.get("/commands")
async def get_commands():
    """获取所有可用命令"""
    commands = plugin_manager.get_all_commands()
    return {"commands": commands}


@router.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "plugins_count": len(plugin_manager.get_enabled_plugins()),
        "commands_count": len(plugin_manager.get_all_commands()),
    }
