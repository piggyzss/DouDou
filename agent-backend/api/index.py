from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import traceback

# 创建FastAPI应用
app = FastAPI(
    title="AI News Agent",
    version="1.0.0",
    description="AI News Agent Backend Service",
)

# 配置CORS - 使用更宽松的配置以确保可以访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 临时允许所有来源，用于调试
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# 尝试导入和注册路由
try:
    from app.config import settings
    from app.api.routes import agent
    
    # 注册路由
    app.include_router(agent.router, prefix="/api/agent", tags=["agent"])
    
    # 注册调试路由
    try:
        from app.api.routes import debug
        app.include_router(debug.router, prefix="/api/debug", tags=["debug"])
    except Exception as debug_error:
        print(f"Warning: Could not load debug routes: {debug_error}")
    
    routes_loaded = True
    routes_error = None
except Exception as e:
    routes_loaded = False
    routes_error = str(e)
    traceback.print_exc()


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": "AI News Agent",
        "version": "1.0.0",
        "status": "running",
        "routes_loaded": routes_loaded,
        "routes_error": routes_error if not routes_loaded else None,
        "python_version": sys.version,
    }


@app.get("/health")
async def health():
    """健康检查"""
    return {
        "status": "healthy",
        "service": "agent-backend",
        "routes_loaded": routes_loaded,
    }


@app.get("/debug")
async def debug():
    """调试信息"""
    return {
        "routes_loaded": routes_loaded,
        "routes_error": routes_error,
        "python_version": sys.version,
        "sys_path": sys.path[:5],  # 只显示前5个路径
        "available_routes": [
            {"path": route.path, "methods": list(route.methods) if hasattr(route, 'methods') else []}
            for route in app.routes
        ],
    }


# Vercel 需要这个
handler = app
