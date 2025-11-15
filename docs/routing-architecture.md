# 路由架构：Next.js + FastAPI 完整数据流

## 一、架构概览

```
浏览器 (React)
    ↓ fetch
Next.js API Route (Node.js)
    ↓ fetch
FastAPI Backend (Python)
    ↓ 返回
Next.js API Route
    ↓ 返回
浏览器 (React)
```


## 二、完整请求流程

```
浏览器          主机 - Next.js (3000端口)              Docker 容器 - Python 后端 (8000端口)
  │                      │                                        │
  │                      │                                        │
  ├─ 1. 访问前端 ────────►                                         │
  │  localhost:3000      │                                        │
  │                      │                                        │
  │  ◄─────────────── Next.js 前端服务 ────────────────────────────┤
  │     返回 HTML/CSS/JS  (监听 3000 端口)                          │
  │                      │                                        │
  │                      │                                        │
  ├─ 2. 点击按钮 ────────►                                         │
  │  触发 API 请求        │                                        │
  │  fetch('/api/agent/execute')                                  │
  │  (相对路径)           │                                        │
  │                      │                                        │
  │                 app/api/agent/execute/route.ts                │
  │                 (Next.js API Route)                           │
  │                      │                                        │
  │                      ├─ 3. 转发到后端 ────────────────────────►
  │                      │  fetch('http://localhost:8000/...')   │
  │                      │                                        │
  │                      │                                   uvicorn 后端服务
  │                      │                                   (监听容器内 8000)
  │                      │                                        │
  │                      │                                   处理请求、AI 逻辑
  │                      │                                        │
  │                      │ ◄─ 4. 返回响应 ────────────────────────┤
  │                      │   JSON 数据                            │
  │                      │                                        │
  │                 处理/转换数据                                 │
  │                 (可选)                                        │
  │                      │                                        │
  │  ◄─ 5. 返回给前端 ────┤                                        │
  │     最终响应          │                                        │
  │                      │                                        │
```

## 三、环境配置

### Next.js 环境变量

```bash
# .env.local
PYTHON_BACKEND_URL=http://localhost:8000
```

### FastAPI 配置

```python
# agent-backend/app/config.py
class Settings(BaseSettings):
    APP_NAME: str = "AI News Agent Backend"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
```

## 四、启动命令

```bash
# 启动 Next.js (端口 3000)
npm run dev

# 启动 FastAPI (端口 8000)
cd agent-backend
python -m app.main
# 或
uvicorn app.main:app --reload --port 8000
```

## 六、调试技巧

### 1. 查看 Next.js API 日志

```typescript
// app/api/agent/execute/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log("📤 Forwarding to Python:", body);
  
  const response = await fetch(...);
  const data = await response.json();
  console.log("📥 Received from Python:", data);
  
  return NextResponse.json(data);
}
```

### 2. 查看 FastAPI 日志

```python
# agent-backend/app/api/routes/agent.py
@router.post("/execute")
async def execute_command(request: AgentRequest):
    print(f"📥 Received: {request.input}")
    
    response = await execute_intent(intent)
    print(f"📤 Returning: {response.dict()}")
    
    return response
```

### 3. 测试 API 端点

```bash
# 测试 Next.js API
curl -X POST http://localhost:3000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"input": "查询最新博客", "session_id": "test"}'

# 测试 FastAPI 直接
curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"input": "查询最新博客", "session_id": "test"}'
```

## 七、错误处理

### 浏览器层错误

```typescript
// 网络错误、超时
catch (error) {
  return {
    success: false,
    error: "网络连接失败",
    type: "error"
  };
}
```

### Next.js 层错误

```typescript
// Python 后端不可用
catch (error) {
  return NextResponse.json(
    { success: false, error: "服务暂时不可用" },
    { status: 503 }
  );
}
```

### FastAPI 层错误

```python
# 业务逻辑错误
except InvalidCommandError as e:
    return AgentResponse(
        success=False,
        error=str(e),
        type="error",
        plugin="system"
    )
```

## 八、性能优化

### 1. Next.js 侧

```typescript
// 添加超时控制
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

const response = await fetch(url, {
  signal: controller.signal
});
```

### 2. FastAPI 侧

```python
# 使用异步操作
async def execute_command(request: AgentRequest):
    # 并发执行多个插件
    results = await asyncio.gather(
        plugin1.execute(request),
        plugin2.execute(request)
    )
```

## 九、安全考虑

### 1. 隐藏后端 URL

✅ 通过 Next.js API 路由代理，后端 URL 不暴露给浏览器

### 2. 添加认证

```typescript
// Next.js 侧
const response = await fetch(backendUrl, {
  headers: {
    "X-Internal-Auth": process.env.INTERNAL_SECRET
  }
});
```

```python
# FastAPI 侧
@router.post("/execute")
async def execute_command(
    request: AgentRequest,
    auth: str = Header(None, alias="X-Internal-Auth")
):
    if auth != settings.INTERNAL_SECRET:
        raise HTTPException(status_code=401)
```

### 3. 限流

```python
# FastAPI 侧使用 slowapi
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@router.post("/execute")
@limiter.limit("10/minute")
async def execute_command(request: AgentRequest):
    ...
```
