from fastapi import APIRouter, HTTPException
from ...models.base import AgentRequest, AgentResponse
from ...core.plugin_manager import plugin_manager

router = APIRouter()


@router.post("/execute", response_model=AgentResponse)
async def execute_command(request: AgentRequest):
    """执行Agent命令"""
    try:
        response = await plugin_manager.execute_command(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
