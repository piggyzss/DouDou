# Next.js 核心知识与路由架构

## 一、Next.js 14 App Router 基础

### 1. 文件系统路由

```
app/
├── page.tsx              → /
├── about/page.tsx        → /about
├── blog/
│   ├── page.tsx         → /blog
│   └── [slug]/page.tsx  → /blog/hello-world
└── api/
    └── users/route.ts   → /api/users
```

### 2. 特殊文件

| 文件 | 用途 | 示例 |
|------|------|------|
| `page.tsx` | 页面组件 | 可访问的路由 |
| `layout.tsx` | 布局组件 | 包裹子页面 |
| `route.ts` | API 路由 | 后端接口 |
| `loading.tsx` | 加载状态 | Suspense 边界 |
| `error.tsx` | 错误处理 | Error Boundary |
| `not-found.tsx` | 404 页面 | 未找到页面 |

### 3. 路由组件类型

```typescript
// 服务端组件 (默认)
export default async function Page() {
  // 可以直接访问数据库
  const data = await db.query();
  return <div>{data}</div>;
}

// 客户端组件
"use client";
export default function Page() {
  // 可以使用 useState, useEffect
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

## 二、完整架构：Next.js + FastAPI

### 1. 架构概览

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

### 2. 完整请求流程图

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

### 3. 环境配置

**Next.js 环境变量：**
```bash
# .env.local
PYTHON_BACKEND_URL=http://localhost:8000
```

**FastAPI 配置：**
```python
# agent-backend/app/config.py
class Settings(BaseSettings):
    APP_NAME: str = "AI News Agent Backend"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
```

### 4. 启动命令

```bash
# 启动 Next.js (端口 3000)
npm run dev

# 启动 FastAPI (端口 8000)
cd agent-backend
uvicorn app.main:app --reload --port 8000

# 或使用 Docker
./agent-backend/docker/backend.sh start
```

---

## 三、API Routes (服务端)

### 1. 基本结构

```typescript
// app/api/hello/route.ts
import { NextRequest, NextResponse } from "next/server";

// GET /api/hello
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Hello" });
}

// POST /api/hello
export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

### 2. 动态路由

```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  return NextResponse.json({ userId });
}
```

### 3. 请求处理

```typescript
export async function POST(request: NextRequest) {
  // 1. 读取 JSON 数据
  const body = await request.json();
  
  // 2. 读取查询参数
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  
  // 3. 读取请求头
  const auth = request.headers.get("authorization");
  
  // 4. 访问环境变量
  const secret = process.env.SECRET_KEY;
  
  // 5. 返回响应
  return NextResponse.json(
    { success: true },
    { 
      status: 200,
      headers: { "X-Custom": "value" }
    }
  );
}
```

### 4. 错误处理

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 四、环境变量

### 1. 类型区分

```bash
# .env.local

# 服务端变量（API Routes 可访问）
DATABASE_URL=postgresql://...
SECRET_KEY=abc123
PYTHON_BACKEND_URL=http://localhost:8000

# 客户端变量（浏览器可访问，必须以 NEXT_PUBLIC_ 开头）
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_NAME=My Site
```

### 2. 使用方式

```typescript
// ✅ API Route (服务端)
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;  // ✅ 可以访问
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;  // ✅ 也可以访问
  return NextResponse.json({ dbUrl, apiUrl });
}

// ❌ 客户端组件
"use client";
export default function Page() {
  const dbUrl = process.env.DATABASE_URL;  // ❌ undefined
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;  // ✅ 可以访问
}
```

---

## 五、数据获取模式

### 1. 服务端组件 (推荐)

```typescript
// app/blog/page.tsx
async function getBlogPosts() {
  const res = await fetch("https://api.example.com/posts", {
    cache: "no-store"  // 不缓存，每次都重新获取
  });
  return res.json();
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <div>{posts.map(post => ...)}</div>;
}
```

### 2. 客户端组件

```typescript
"use client";
import { useState, useEffect } from "react";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);
  
  return <div>{posts.map(post => ...)}</div>;
}
```

### 3. API Route 作为代理层

```typescript
// app/api/agent/execute/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // 转发到 Python 后端
  const response = await fetch(
    `${process.env.PYTHON_BACKEND_URL}/api/agent/execute`,
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

---

## 六、常见模式

### 1. API 代理模式

```typescript
// app/api/proxy/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // 转发到外部服务
  const response = await fetch(process.env.EXTERNAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.API_KEY}`  // 隐藏 API Key
    },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

### 2. 数据库查询模式

```typescript
// app/api/users/route.ts
import { db } from "@/lib/database";

export async function GET() {
  try {
    const users = await db.query("SELECT * FROM users");
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}
```

### 3. 文件上传模式

```typescript
// app/api/upload/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  
  if (!file) {
    return NextResponse.json(
      { error: "No file uploaded" },
      { status: 400 }
    );
  }
  
  // 处理文件
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // 保存到云存储或本地
  // ...
  
  return NextResponse.json({ success: true });
}
```

---

## 七、中间件 (Middleware)

### 1. 基本用法

```typescript
// middleware.ts (项目根目录)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. 检查认证
  const token = request.cookies.get("token");
  
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // 2. 添加自定义请求头
  const response = NextResponse.next();
  response.headers.set("X-Custom-Header", "value");
  
  return response;
}

// 配置匹配路径
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"]
};
```

---

## 八、缓存策略

### 1. Fetch 缓存

```typescript
// 强制不缓存
fetch(url, { cache: "no-store" });

// 缓存 60 秒
fetch(url, { next: { revalidate: 60 } });

// 永久缓存
fetch(url, { cache: "force-cache" });
```

### 2. 路由段配置

```typescript
// app/blog/page.tsx
export const dynamic = "force-dynamic";  // 总是动态渲染
export const revalidate = 60;  // 每 60 秒重新验证
```

---

## 九、性能优化

### 1. 图片优化

```typescript
import Image from "next/image";

export default function Page() {
  return (
    <Image
      src="/photo.jpg"
      alt="Photo"
      width={500}
      height={300}
      priority  // 优先加载
    />
  );
}
```

### 2. 动态导入

```typescript
import dynamic from "next/dynamic";

// 懒加载组件
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <p>Loading...</p>,
  ssr: false  // 禁用服务端渲染
});
```

### 3. 路由预取

```typescript
import Link from "next/link";

export default function Page() {
  return (
    <Link href="/about" prefetch={true}>
      About
    </Link>
  );
}
```

### 4. API 超时控制

```typescript
// Next.js 侧
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

const response = await fetch(url, {
  signal: controller.signal
});
```

---

## 十、调试技巧

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

### 4. 查看构建输出

```bash
npm run build
# 查看哪些页面是静态的，哪些是动态的
```

### 5. 错误边界

```typescript
// app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

## 十一、错误处理

### 1. 浏览器层错误

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

### 2. Next.js 层错误

```typescript
// Python 后端不可用
catch (error) {
  return NextResponse.json(
    { success: false, error: "服务暂时不可用" },
    { status: 503 }
  );
}
```

### 3. FastAPI 层错误

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

---

## 十二、安全考虑

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

---

## 十三、TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]  // 路径别名
    }
  }
}
```

---

## 十四、部署配置

### 1. Vercel 部署

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "DATABASE_URL": "@database-url",
    "API_KEY": "@api-key"
  }
}
```

### 2. 自定义服务器

```javascript
// server.js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000);
});
```
