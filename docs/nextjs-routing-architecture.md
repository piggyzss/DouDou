# Next.js 路由机制与架构流程

## 🏗️ 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DouDou 应用架构                              │
├─────────────────┬─────────────────┬─────────────────┬─────────────────┤
│   用户界面层     │   API路由层      │   业务逻辑层     │   数据访问层     │
│  (Frontend)     │  (API Routes)   │  (Business)     │  (Database)     │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │                 │
│  React 组件     │  route.ts 文件  │  Model 类       │  PostgreSQL     │
│  ├ page.tsx     │  ├ GET()        │  ├ BlogModel    │  ├ blog_posts   │
│  ├ useState     │  ├ POST()       │  ├ AppModel     │  ├ blog_tags    │
│  └ useEffect    │  └ PUT()        │  └ query()      │  └ apps         │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
        ↕                   ↕                   ↕                   ↕
    HTTP 请求           路由映射           手动调用           SQL 查询
```

## 🛣️ Next.js App Router 文件系统路由

### 路由映射规则

```
文件路径                     →    URL路径                →    处理函数
─────────────────────────────────────────────────────────────────────────
app/api/blog/route.ts        →    GET /api/blog         →    export function GET()
app/api/blog/[slug]/route.ts →    GET /api/blog/hello   →    export function GET()
app/api/apps/route.ts        →    POST /api/apps        →    export function POST()
app/blog/page.tsx            →    GET /blog             →    export default function()
```

### HTTP 方法映射

```
HTTP 请求方法    →    导出函数名
─────────────────────────────────
GET             →    export async function GET()
POST            →    export async function POST()
PUT             →    export async function PUT()
DELETE          →    export async function DELETE()
PATCH           →    export async function PATCH()
```

## 🔄 完整请求流程图

```
┌─────────────┐    ①HTTP请求     ┌─────────────┐    ②路径匹配     ┌─────────────┐
│   浏览器     │ ───────────────→ │  Next.js    │ ───────────────→ │  路由系统   │
│            │                 │   框架      │                 │            │
└─────────────┘                 └─────────────┘                 └─────────────┘
      ↑                                                                ↓
      │                                                                │ ③文件定位
      │                                                                ↓
┌─────────────┐    ⑧JSON响应     ┌─────────────┐    ④方法匹配     ┌─────────────┐
│  前端组件   │ ←─────────────── │ API Route   │ ←─────────────── │ route.ts    │
│   更新UI    │                 │  处理函数    │                 │   文件      │
└─────────────┘                 └─────────────┘                 └─────────────┘
                                       ↓                               
                                       │ ⑤手动调用                      
                                       ↓                               
                                ┌─────────────┐    ⑥SQL查询     ┌─────────────┐
                                │ 业务逻辑层   │ ───────────────→ │  数据库层   │
                                │  (Model)    │ ←─────────────── │(PostgreSQL) │
                                └─────────────┘    ⑦返回结果     └─────────────┘
```

## 📋 详细调用链路

### 1. 前端发起请求
```
用户操作 → React组件 → fetch('/api/blog') → HTTP GET请求
```

### 2. Next.js路由处理
```
HTTP请求 → 路由系统扫描 → 匹配文件路径 → 定位到 app/api/blog/route.ts
```

### 3. 方法分发
```
GET请求 → 查找导出函数 → 执行 export async function GET()
```

### 4. 业务逻辑调用 (手动)
```
API函数 → import BlogModel → 调用 BlogModel.findAllPublished()
```

### 5. 数据库查询 (手动)
```
Model方法 → import query → 执行 query('SELECT * FROM...')
```

### 6. 响应返回
```
数据库结果 → Model处理 → API格式化 → NextResponse.json() → 前端接收
```

## 🔍 关键机制说明

### 自动化部分 ✅
- **文件路径映射**: `app/api/blog/route.ts` 自动映射到 `/api/blog`
- **HTTP方法路由**: GET请求自动调用 `GET()` 函数
- **参数解析**: `NextRequest` 对象自动包含请求信息
- **响应处理**: `NextResponse` 自动处理HTTP响应

### 手动编码部分 📝
- **业务逻辑调用**: 需要手动 `import` 和调用 Model
- **数据库操作**: 需要手动调用查询函数
- **错误处理**: 需要手动编写 try-catch
- **数据转换**: 需要手动处理数据格式

## 🏛️ 分层架构详解

### 第一层：用户界面层 (Frontend)
```
职责: 用户交互、状态管理、UI渲染
技术: React、TypeScript、Tailwind CSS
文件: app/blog/page.tsx, app/components/
```

### 第二层：API路由层 (API Routes)
```
职责: HTTP协议处理、请求响应、参数验证
技术: Next.js App Router、NextRequest/NextResponse
文件: app/api/*/route.ts
```

### 第三层：业务逻辑层 (Business Logic)
```
职责: 核心业务逻辑、数据处理、业务规则
技术: TypeScript类和函数
文件: lib/models/, lib/*.ts
```

### 第四层：数据访问层 (Data Access)
```
职责: 数据库连接、SQL执行、连接池管理
技术: PostgreSQL、pg库
文件: lib/database.ts
```

## 📊 数据流向图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            请求数据流                                    │
└─────────────────────────────────────────────────────────────────────────┘

用户点击 → React状态 → fetch请求 → Next.js路由 → API函数 → Model类 → 数据库
   ↓         ↑          ↑           ↑          ↑        ↑       ↑
  UI交互   状态更新   HTTP请求   自动路由   手动调用  手动调用  SQL查询

┌─────────────────────────────────────────────────────────────────────────┐
│                            响应数据流                                    │
└─────────────────────────────────────────────────────────────────────────┘

数据库结果 → Model处理 → API格式化 → HTTP响应 → fetch解析 → React状态 → UI更新
    ↓          ↓          ↓          ↓         ↓         ↓         ↓
  原始数据   业务处理    JSON格式   HTTP协议   JS对象    状态变化   页面渲染
```

## 🔧 实际示例：Blog列表获取

### 调用时序图
```
前端组件          API路由           业务逻辑          数据库
   │                │                 │               │
   │──fetch()──────→│                 │               │
   │                │──findAll()────→│               │
   │                │                 │──query()────→│
   │                │                 │←──结果集─────│
   │                │←──处理后数据────│               │
   │←──JSON响应─────│                 │               │
   │                │                 │               │
```

### 文件协作关系
```
app/blog/page.tsx
    ↓ fetch('/api/blog')
app/api/blog/route.ts
    ↓ import BlogModel
lib/models/blog.ts
    ↓ import { query }
lib/database.ts
    ↓ pool.query()
PostgreSQL 数据库
```

## 🎯 架构优势

### 🔄 职责分离
- **前端**: 专注用户体验和交互
- **API**: 专注协议转换和路由
- **业务**: 专注核心逻辑和数据处理
- **数据**: 专注存储和查询优化

### 🧪 可测试性
- 每层可以独立测试
- Mock不同层次的依赖
- 单元测试和集成测试分离

### 🔧 可维护性
- 清晰的文件组织结构
- 明确的依赖关系
- 易于定位和修改问题

### 📈 可扩展性
- 新增API端点只需添加route.ts
- 新增业务逻辑只需扩展Model
- 数据库变更影响范围可控

## 💡 最佳实践

### API路由层
- ✅ 只处理HTTP相关逻辑
- ✅ 参数验证和错误处理
- ❌ 避免直接写业务逻辑

### 业务逻辑层
- ✅ 封装核心业务规则
- ✅ 提供清晰的接口
- ❌ 避免直接处理HTTP

### 数据访问层
- ✅ 统一数据库连接管理
- ✅ SQL查询优化
- ❌ 避免业务逻辑混入

这种架构确保了代码的清晰性、可维护性和可扩展性，是现代Web应用的标准实践！🚀
