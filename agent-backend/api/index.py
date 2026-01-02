"""
Vercel Serverless Function Entry Point

This file is specifically for Vercel deployment.
For local development and Docker, use app/main.py instead.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import traceback

# 创建FastAPI应用
app = FastAPI(
    title="AI News Agent",
    version="1.0.0",
    description="AI News Agent Backend Service (Vercel Serverless)",
)

# 配置CORS - Vercel 部署使用宽松配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vercel 环境允许所有来源
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# 尝试导入和注册路由
try:
    from app.config import settings
    from app.api.routes import agent
    from app.api.middleware import setup_error_handlers
    
    # 配置错误处理中间件
    setup_error_handlers(app)
    
    # 注册路由
    app.include_router(agent.router, prefix="/api/agent", tags=["agent"])
    
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
        "deployment": "vercel-serverless",
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
        "deployment": "vercel-serverless",
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
            {"path": route.path, "methods": route.methods}
            for route in app.routes
        ],
    }
