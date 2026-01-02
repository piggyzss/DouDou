"""
Error Handling Middleware - 错误处理中间件

提供统一的错误处理和响应格式化
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from loguru import logger
from datetime import datetime
import traceback
import os


class ErrorResponse:
    """标准化错误响应格式"""
    
    @staticmethod
    def create(
        error_message: str,
        error_type: str = "error",
        status_code: int = 500,
        details: dict = None,
        include_traceback: bool = False
    ) -> dict:
        """
        创建标准化错误响应
        
        Args:
            error_message: 错误消息
            error_type: 错误类型
            status_code: HTTP 状态码
            details: 额外的错误详情
            include_traceback: 是否包含堆栈跟踪
        
        Returns:
            dict: 标准化错误响应
        """
        response = {
            "success": False,
            "error": error_message,
            "type": error_type,
            "plugin": "system",
            "command": "",
            "timestamp": datetime.now().isoformat(),
            "metadata": details or {}
        }
        
        # 在开发环境中包含堆栈跟踪
        if include_traceback and os.getenv("ENVIRONMENT") == "development":
            response["metadata"]["traceback"] = traceback.format_exc()
        
        return response


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    处理 HTTP 异常
    
    Args:
        request: FastAPI 请求对象
        exc: HTTP 异常
    
    Returns:
        JSONResponse: 标准化错误响应
    """
    logger.warning(
        f"HTTP {exc.status_code} error in {request.method} {request.url.path}: {exc.detail}"
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse.create(
            error_message=str(exc.detail),
            error_type="http_error",
            status_code=exc.status_code,
            details={
                "path": str(request.url.path),
                "method": request.method
            }
        )
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    处理请求验证异常
    
    Args:
        request: FastAPI 请求对象
        exc: 验证异常
    
    Returns:
        JSONResponse: 标准化错误响应
    """
    logger.warning(
        f"Validation error in {request.method} {request.url.path}: {exc.errors()}"
    )
    
    # 提取验证错误详情
    validation_errors = []
    for error in exc.errors():
        validation_errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse.create(
            error_message="Request validation failed",
            error_type="validation_error",
            status_code=422,
            details={
                "validation_errors": validation_errors,
                "path": str(request.url.path),
                "method": request.method
            }
        )
    )


async def general_exception_handler(request: Request, exc: Exception):
    """
    处理所有未捕获的异常
    
    Args:
        request: FastAPI 请求对象
        exc: 异常对象
    
    Returns:
        JSONResponse: 标准化错误响应
    """
    # 记录完整错误信息
    logger.error(
        f"Unhandled exception in {request.method} {request.url.path}",
        exc_info=True
    )
    
    # 根据异常类型提供更友好的错误消息
    error_message = _get_friendly_error_message(exc)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse.create(
            error_message=error_message,
            error_type=type(exc).__name__,
            status_code=500,
            details={
                "path": str(request.url.path),
                "method": request.method,
                "original_error": str(exc)
            },
            include_traceback=True
        )
    )


def _get_friendly_error_message(exc: Exception) -> str:
    """
    将技术性错误转换为用户友好的消息
    
    Args:
        exc: 异常对象
    
    Returns:
        str: 用户友好的错误消息
    """
    error_str = str(exc).lower()
    
    # LLM 服务错误
    if "user location is not supported" in error_str:
        return "LLM service is not available in your region. Please check your VPN settings or use a different LLM provider."
    
    if "api key" in error_str or "authentication" in error_str:
        return "API authentication failed. Please check your API key configuration."
    
    if "quota" in error_str or "rate limit" in error_str:
        return "API quota exceeded or rate limit reached. Please try again later."
    
    # 数据库错误
    if "database" in error_str or "connection" in error_str:
        return "Database connection error. The system is using fallback storage."
    
    # 工具执行错误
    if "tool not found" in error_str:
        return "The requested tool is not available. Please try a different approach."
    
    if "timeout" in error_str:
        return "The operation timed out. Please try again with a simpler query."
    
    # 默认消息
    return f"An unexpected error occurred: {str(exc)}"


# 错误处理中间件配置函数
def setup_error_handlers(app):
    """
    为 FastAPI 应用配置错误处理器
    
    Args:
        app: FastAPI 应用实例
    """
    from fastapi.exceptions import RequestValidationError
    from starlette.exceptions import HTTPException as StarletteHTTPException
    
    # 注册异常处理器
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    logger.info("Error handlers configured")
