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

### 1. 浏览器层 (Client-Side)

**文件**: `app/agent/hooks/useAgent.ts`

```typescript
// 用户输入 "查询最新博客"
const processCommand = async (command: string) => {
  const request: AgentRequest = {
    command: "查询最新博客",
    params: {},
    sessionId: "default"
  };
  
  // 调用插件管理器
  const response = await agentPluginManager.executeCommand(request);
};
```

### 2. 前端 API 层 (Client-Side)

**文件**: `lib/agent/plugin-manager.ts`

```typescript
async executeCommand(request: AgentRequest): Promise<AgentResponse> {
  // 发起 HTTP 请求到 Next.js API
  const response = await fetch("/api/agent/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: request.command,
      session_id: request.sessionId,
      context: request.params
    })
  });
  
  return await response.json();
}
```

**请求体**:
```json
{
  "input": "查询最新博客",
  "session_id": "default",
  "context": {}
}
```

### 3. Next.js API 路由层 (Server-Side)

**文件**: `app/api/agent/execute/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // 读取环境变量（浏览器无法访问）
  const backendUrl = process.env.PYTHON_BACKEND_URL;
  // 开发环境: http://localhost:8000
  // 生产环境: http://internal-agent-service:8000
  
  // 转发到 Python 后端
  const response = await fetch(
    `${backendUrl}/api/agent/execute`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

**转发的请求**:
```
POST http://localhost:8000/api/agent/execute
Content-Type: application/json

{
  "input": "查询最新博客",
  "session_id": "default",
  "context": {}
}
```

### 4. FastAPI 应用层 (Python Backend)

**文件**: `agent-backend/app/main.py`

```python
app = FastAPI(title="AI News Agent Backend")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
)

# 注册路由
app.include_router(agent.router, prefix="/api/agent")
```

**路由匹配**: `/api/agent/execute` → `agent.router`

### 5. FastAPI 路由处理 (Python Backend)

**文件**: `agent-backend/app/api/routes/agent.py`

```python
@router.post("/execute", response_model=AgentResponse)
async def execute_command(request: AgentRequest):
    """
    执行 Agent 命令或自然语言查询
    """
    # 1. 解析用户输入
    user_input = request.input  # "查询最新博客"
    
    # 2. 意图识别
    intent = await intent_analyzer.parse_input(user_input, request.context)
    # intent.command = "/latest"
    # intent.params = {"count": 5}
    
    # 3. 执行意图
    response = await execute_intent(intent)
    
    return response
```

### 6. 插件执行 (Python Backend)

```python
async def execute_intent(intent: Intent) -> AgentResponse:
    # 1. 找到对应插件
    plugin_id = plugin_manager.get_plugin_for_command(intent.command)
    # plugin_id = "blog"
    
    # 2. 获取插件实例
    plugin = plugin_manager.get_plugin(plugin_id)
    
    # 3. 执行插件
    response = await plugin.execute(legacy_request)
    
    return response
```

### 7. 返回响应

**FastAPI 返回**:
```json
{
  "success": true,
  "data": [
    {"title": "博客1", "date": "2024-01-01"},
    {"title": "博客2", "date": "2024-01-02"}
  ],
  "type": "blog_list",
  "plugin": "blog",
  "command": "/latest",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Next.js 转发** → **浏览器接收** → **UI 更新**

## 三、关键数据模型

### Next.js 侧 (TypeScript)

```typescript
// lib/agent/types.ts
interface AgentRequest {
  command: string;      // 用户输入
  params?: any;         // 参数
  sessionId?: string;   // 会话 ID
}

interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  type: string;         // text, structured, error
  plugin: string;
  command: string;
  timestamp: number;
}
```

### FastAPI 侧 (Python)

```python
# agent-backend/app/models/base.py
class AgentRequest(BaseModel):
    input: str                      # 用户输入
    session_id: str = "default"
    context: Dict[str, Any] = {}
    
class AgentResponse(BaseModel):
    success: bool
    data: Any = None
    error: str = ""
    type: str = "text"
    plugin: str
    command: str
    timestamp: datetime
```

## 四、环境配置

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

## 五、启动命令

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
