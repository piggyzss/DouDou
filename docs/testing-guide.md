# DouDou 项目测试指南

## 📋 目录
1. [测试框架概览](#🎯-测试框架概览)
2. [测试架构设计](#🏗️-测试架构设计)
3. [测试类型说明](#📊-测试类型说明)
4. [测试执行指南](#🚀-测试执行指南)
5. [测试最佳实践](#💡-测试最佳实践)
6. [故障排除](#🚨-故障排除)
7. [测试覆盖率现状](#📈-测试覆盖率现状)

---

## 🎯 测试框架概览

### 主要测试框架

| 框架 | 用途 | 测试类型 |
|------|------|----------|
| **Jest** | 单元测试、API测试、组件测试 | 逻辑测试、函数测试 |
| **React Testing Library** | 集成测试、用户交互测试 | 组件协作、用户行为 |
| **MSW (Mock Service Worker)** | API模拟 | 网络请求模拟 |
| **Supertest** | API路由测试 | HTTP接口测试 |

### 测试环境配置

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/components/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/api/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

---

## 🏗️ 测试架构设计

### 测试文件结构

```
tests/
├── __mocks__/                 # Mock 文件
│   ├── next.js.js
│   ├── framer-motion.js
│   └── tencent-cos.js
├── setup/                     # 测试配置
│   ├── jest.setup.js          # Jest 全局配置
│   ├── integration-setup.ts   # RTL 集成测试配置
│   └── msw-handlers.js        # API Mock 配置
├── unit/                      # Jest 单元测试
│   ├── lib/
│   │   ├── database.test.ts
│   │   ├── models/
│   │   │   ├── app.test.ts
│   │   │   ├── blog.test.ts
│   │   │   └── likes.test.ts
│   │   └── tencent-cos.test.ts
│   └── utils/
├── components/                # Jest + RTL 组件测试
│   ├── common/
│   │   ├── Navigation.test.tsx
│   │   ├── LikeToggle.test.tsx
│   │   └── FileUpload.test.tsx
│   ├── apps/
│   │   ├── AppCard.test.tsx
│   │   └── CreateAppModal.test.tsx
│   └── pages/
│       ├── Home.test.tsx
│       └── Apps.test.tsx
├── api/                       # Jest API 路由测试
│   ├── apps.test.ts
│   ├── blog.test.ts
│   ├── aigc.test.ts
│   └── likes.test.ts
└── integration/               # RTL 集成测试
    ├── app-creation.test.tsx
    ├── app-browsing.test.tsx
    ├── like-system.test.tsx
    └── file-upload.test.tsx
```

### 测试分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                    测试金字塔                                │
├─────────────────────────────────────────────────────────────┤
│  🔺 集成测试 (Integration Tests)                            │
│     - 用户流程测试                                          │
│     - 组件协作测试                                          │
│     - API 集成测试                                          │
├─────────────────────────────────────────────────────────────┤
│  🔺 组件测试 (Component Tests)                              │
│     - 单个组件功能测试                                      │
│     - 用户交互测试                                          │
│     - 状态管理测试                                          │
├─────────────────────────────────────────────────────────────┤
│  🔺 API 测试 (API Route Tests)                             │
│     - HTTP 接口测试                                         │
│     - 请求响应测试                                          │
│     - 错误处理测试                                          │
├─────────────────────────────────────────────────────────────┤
│  🔺 单元测试 (Unit Tests)                                   │
│     - 数据模型测试                                          │
│     - 工具函数测试                                          │
│     - 业务逻辑测试                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 测试类型说明

### 1. 单元测试 (Unit Tests)

**框架**: Jest  
**目标**: 测试独立的函数、类、模块

#### 示例：AppModel 单元测试

```typescript
// tests/unit/lib/models/app.test.ts
describe('AppModel', () => {
  describe('create', () => {
    it('should create a new app with valid data', async () => {
      const appData = {
        name: 'Test App',
        description: 'Test Description',
        tags: ['React', 'TypeScript'],
        type: 'app',
        platform: 'web',
        status: 'online',
        experience_method: 'download'
      }
      
      const app = await AppModel.create(appData)
      
      expect(app).toBeDefined()
      expect(app.name).toBe(appData.name)
      expect(app.slug).toBe('test-app')
    })
  })
})
```

#### 覆盖范围
- ✅ 数据模型 CRUD 操作
- ✅ 工具函数逻辑
- ✅ 数据验证和转换
- ✅ 错误处理逻辑

### 2. 组件测试 (Component Tests)

**框架**: Jest + React Testing Library  
**目标**: 测试单个组件的渲染和交互

#### 示例：AppCard 组件测试

```typescript
// tests/components/apps/AppCard.test.tsx
describe('AppCard', () => {
  it('should render app information correctly', () => {
    const mockApp = {
      id: 1,
      name: 'Test App',
      description: 'Test Description'
    }
    
    render(<AppCard app={mockApp} />)
    
    expect(screen.getByText('Test App')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })
})
```

#### 覆盖范围
- ✅ 组件渲染
- ✅ 用户交互
- ✅ 状态变化
- ✅ 事件处理

### 3. API 路由测试 (API Route Tests)

**框架**: Jest + node-mocks-http  
**目标**: 测试 API 路由的请求处理

#### 示例：应用 API 测试

```typescript
// tests/api/apps.test.ts
describe('/api/apps', () => {
  it('should return apps list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/apps?page=1&limit=10'
    })
    
    await GET(req, res)
    
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toHaveProperty('apps')
  })
})
```

#### 覆盖范围
- ✅ HTTP 请求处理
- ✅ 参数验证
- ✅ 响应格式
- ✅ 错误状态码

### 4. 集成测试 (Integration Tests)

**框架**: React Testing Library + MSW  
**目标**: 测试多个组件和服务的协作

#### 示例：应用创建流程集成测试

```typescript
// tests/integration/app-creation.test.tsx
describe('App Creation Integration', () => {
  it('should create app with form submission', async () => {
    const user = userEvent.setup()
    
    render(<CreateAppModal isOpen={true} onClose={mockOnClose} />)
    
    // 填写表单
    await user.type(screen.getByLabelText(/应用名称/i), 'New App')
    await user.type(screen.getByLabelText(/描述/i), 'New Description')
    
    // 提交表单
    await user.click(screen.getByRole('button', { name: /创建/i }))
    
    // 验证结果
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
```

#### 覆盖范围
- ✅ 用户完整流程
- ✅ 组件间数据传递
- ✅ API 集成
- ✅ 状态同步

---

## 🚀 测试执行指南

### 测试命令

```bash
# 运行所有测试
npm run test

# 运行特定类型的测试
npm run test:unit          # 单元测试
npm run test:components    # 组件测试
npm run test:api          # API 测试
npm run test:integration  # 集成测试

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# CI 环境测试
npm run test:ci
```

### 测试覆盖率目标

| 测试类型 | 覆盖率目标 | 当前状态 |
|---------|-----------|----------|
| 单元测试 | ≥ 80% | 🟡 进行中 |
| 组件测试 | ≥ 70% | 🟡 进行中 |
| API 测试 | ≥ 90% | 🟡 进行中 |
| 集成测试 | ≥ 60% | 🟡 进行中 |

### 测试执行策略

#### 开发阶段
```bash
# 快速反馈 - 运行相关测试
npm run test:unit -- --testPathPattern="app"
npm run test:components -- --testPathPattern="AppCard"
```

#### 提交前
```bash
# 运行所有测试
npm run test:all
```

#### CI/CD 流程
```bash
# 完整测试套件
npm run test:ci
```

---

## 💡 测试最佳实践

### 1. 测试命名规范

```typescript
// ✅ 好的测试命名
describe('AppModel', () => {
  describe('create', () => {
    it('should create a new app with valid data', () => {})
    it('should throw error when required fields are missing', () => {})
  })
})

// ❌ 避免的测试命名
describe('AppModel', () => {
  it('test create', () => {})
  it('should work', () => {})
})
```

### 2. 测试结构 (AAA 模式)

```typescript
it('should handle user login', async () => {
  // Arrange - 准备测试数据
  const user = userEvent.setup()
  const mockUser = { email: 'test@example.com', password: 'password' }
  
  // Act - 执行测试操作
  render(<LoginForm />)
  await user.type(screen.getByLabelText(/邮箱/i), mockUser.email)
  await user.type(screen.getByLabelText(/密码/i), mockUser.password)
  await user.click(screen.getByRole('button', { name: /登录/i }))
  
  // Assert - 验证结果
  await waitFor(() => {
    expect(screen.getByText(/登录成功/i)).toBeInTheDocument()
  })
})
```

### 3. Mock 使用原则

```typescript
// ✅ 好的 Mock 使用
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
  getRow: jest.fn()
}))

// ✅ 测试中重置 Mock
beforeEach(() => {
  jest.clearAllMocks()
})

// ❌ 避免过度 Mock
// 不要 Mock 所有依赖，只 Mock 外部依赖
```

### 4. 异步测试处理

```typescript
// ✅ 使用 waitFor 等待异步操作
await waitFor(() => {
  expect(screen.getByText('加载完成')).toBeInTheDocument()
})

// ✅ 使用 userEvent 处理用户交互
const user = userEvent.setup()
await user.click(button)

// ❌ 避免使用 setTimeout
setTimeout(() => {
  expect(something).toBe(true)
}, 1000)
```

### 5. 测试数据管理

```typescript
// ✅ 使用工厂函数创建测试数据
const createMockApp = (overrides = {}) => ({
  id: 1,
  name: 'Test App',
  description: 'Test Description',
  ...overrides
})

// ✅ 在测试中复用数据
const mockApp = createMockApp({ name: 'Custom App' })
```

---

## 🚨 故障排除

### 常见问题及解决方案

#### 1. 测试环境配置问题

**问题**: `ReferenceError: document is not defined`

**解决方案**:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom'  // 确保使用 jsdom 环境
}
```

#### 2. 模块导入问题

**问题**: `Cannot resolve module '@/lib/database'`

**解决方案**:
```javascript
// jest.config.js
module.exports = {
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'  // 确保路径映射正确
  }
}
```

#### 3. 异步测试超时

**问题**: `Timeout - Async callback was not invoked within the 5000ms timeout`

**解决方案**:
```typescript
// 增加超时时间
it('should handle slow API', async () => {
  // 测试代码
}, 10000)  // 10秒超时

// 或使用 waitFor
await waitFor(() => {
  expect(something).toBe(true)
}, { timeout: 10000 })
```

#### 4. Mock 不生效

**问题**: Mock 函数没有被调用

**解决方案**:
```typescript
// 确保 Mock 在正确的位置
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn()
}))

// 在测试中验证 Mock 调用
expect(mockFetchData).toHaveBeenCalledWith(expectedParams)
```

#### 5. 组件渲染错误

**问题**: `TypeError: Cannot read property 'map' of undefined`

**解决方案**:
```typescript
// 提供完整的测试数据
const mockData = {
  items: [],  // 确保数组存在
  loading: false,
  error: null
}

render(<Component data={mockData} />)
```

### 调试技巧

#### 1. 使用 `screen.debug()`

```typescript
it('should render correctly', () => {
  render(<Component />)
  screen.debug()  // 打印 DOM 结构
})
```

#### 2. 使用 `console.log` 调试

```typescript
it('should handle click', async () => {
  const user = userEvent.setup()
  render(<Component />)
  
  const button = screen.getByRole('button')
  console.log('Button found:', button)  // 调试信息
  
  await user.click(button)
})
```

#### 3. 使用 `--verbose` 模式

```bash
npm run test -- --verbose
```

---

## 📚 相关文档

- **[Jest 官方文档](https://jestjs.io/docs/getting-started)**
- **[React Testing Library 文档](https://testing-library.com/docs/react-testing-library/intro/)**
- **[MSW 文档](https://mswjs.io/docs/)**
- **[测试最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)**

---

## 💡 快速参考

### 测试命令速查
```bash
npm run test                 # 运行所有测试
npm run test:watch          # 监听模式
npm run test:coverage       # 覆盖率报告
npm run test:unit           # 单元测试
npm run test:components     # 组件测试
npm run test:api           # API 测试
npm run test:integration   # 集成测试
```

### 常用断言
```typescript
// 元素存在
expect(screen.getByText('Hello')).toBeInTheDocument()

// 元素不存在
expect(screen.queryByText('Error')).not.toBeInTheDocument()

// 元素可见
expect(screen.getByRole('button')).toBeVisible()

// 元素禁用
expect(screen.getByRole('button')).toBeDisabled()

// 类名检查
expect(element).toHaveClass('active')

// 属性检查
expect(element).toHaveAttribute('href', '/home')
```

### Mock 速查
```typescript
// Mock 函数
const mockFn = jest.fn()
mockFn.mockReturnValue('value')
mockFn.mockResolvedValue('async value')

// Mock 模块
jest.mock('module', () => ({
  function: jest.fn()
}))

// 验证调用
expect(mockFn).toHaveBeenCalledWith('arg')
expect(mockFn).toHaveBeenCalledTimes(1)
```

---

## 📈 测试覆盖率现状

### 当前测试状态

#### ✅ 已完成的测试

**组件测试 (Components)**
- ✅ `AppCard` - 应用卡片组件 (27个测试通过)
- ✅ `LikeToggle` - 点赞切换组件 (所有测试通过)
- ✅ `Navigation` - 导航组件 (新增)
- ✅ `Footer` - 页脚组件 (新增)
- ✅ `BackToTop` - 返回顶部按钮 (新增)
- ✅ `CodeCopyButton` - 代码复制按钮 (新增)
- ✅ `FileUpload` - 文件上传组件 (新增)
- ✅ `ConfirmModal` - 确认模态框 (新增)

**API测试 (API Routes)**
- ✅ `/api/apps` - 应用相关API
- ✅ `/api/likes` - 点赞相关API

**集成测试 (Integration)**
- ✅ `app-creation` - 应用创建流程
- ✅ `like-system` - 点赞系统集成

#### 🔄 需要完善的测试

**组件测试**
- ⚠️ `CreateAppModal` - 创建应用模态框
- ⚠️ `FilterBar` - 过滤栏组件
- ⚠️ `VideoModal` - 视频模态框

**页面集成测试**
- ⚠️ `blog` 页面相关测试
- ⚠️ `aigc` 页面相关测试

**单元测试**
- ⚠️ `lib/models` - 数据模型测试

### 测试统计

| 测试类型 | 已完成 | 总数 | 覆盖率 |
|---------|--------|------|--------|
| 组件测试 | 8 | 11 | 73% |
| API测试 | 2 | 2 | 100% |
| 集成测试 | 2 | 4 | 50% |
| 单元测试 | 0 | 1 | 0% |
| **总计** | **12** | **18** | **67%** |

### 测试质量指标

- **测试通过率**: 95%+ (组件测试)
- **代码覆盖率**: 70%+ (目标)
- **测试稳定性**: 高 (已修复MSW兼容性问题)

### 最近修复的问题

1. **MSW v2兼容性** - 更新了所有MSW处理器使用新的API
2. **Response mock** - 添加了`clone`方法支持
3. **NextResponse mock** - 完善了Next.js API响应模拟
4. **FormData mock** - 添加了完整的FormData实现
5. **BroadcastChannel mock** - 添加了浏览器API模拟
6. **AppCard组件** - 修复了`formatNumber`函数的undefined处理

### 下一步计划

1. **完善剩余组件测试** - 为`CreateAppModal`、`FilterBar`、`VideoModal`添加测试
2. **添加页面集成测试** - 为blog和aigc页面添加完整的集成测试
3. **添加数据模型测试** - 为`lib/models`添加单元测试
4. **提高测试覆盖率** - 目标达到80%+的代码覆盖率
5. **性能测试** - 添加关键组件的性能测试

### 运行测试命令

```bash
# 运行所有测试
npm test

# 运行组件测试
npm test -- --testPathPatterns=components

# 运行API测试
npm test -- --testPathPatterns=api

# 运行集成测试
npm test -- --testPathPatterns=integration

# 生成覆盖率报告
npm test -- --coverage
```
