from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api.routes import agent
from .api.middleware import setup_error_handlers
from .db import get_db_pool, close_db_pool
import uvicorn
from loguru import logger

# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI News Agent Backend Service with ReAct Agent",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# 配置错误处理中间件
setup_error_handlers(app)

# 注册路由
app.include_router(agent.router, prefix="/api/agent", tags=["agent"])


# 应用启动事件
@app.on_event("startup")
async def startup_event():
    """应用启动时初始化数据库连接池"""
    logger.info("Application starting up...")
    await get_db_pool()


# 应用关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时清理数据库连接池"""
    logger.info("Application shutting down...")
    await close_db_pool()


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs" if settings.DEBUG else "disabled",
    }


@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "healthy", "service": "agent-backend"}


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
