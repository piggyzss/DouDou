# Vercel 数据库配置指南

## 🎯 在 Vercel 中配置 DATABASE_URL

### 方法: 使用 Vercel Postgres（推荐）

这是最简单和推荐的方式：

#### 步骤 1: 创建 Vercel Postgres 数据库
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 "Storage" 标签
4. 点击 "Create Database"
5. 选择 "Postgres"
6. 输入数据库名称（例如：`doudou-db`）
7. 选择地区（推荐选择离你用户最近的地区）
8. 点击 "Create"

#### 步骤 2: 连接到项目
1. 创建完成后，点击 "Connect Project"
2. 选择你的项目
3. 选择环境（Production, Preview, Development）
4. 点击 "Connect"

#### 步骤 3: 获取环境变量
Vercel 会自动添加以下环境变量到你的项目：
```
POSTGRES_URL="postgresql://username:password@host:5432/database"
POSTGRES_PRISMA_URL="postgresql://username:password@host:5432/database?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgresql://username:password@host:5432/database"
POSTGRES_USER="username"
POSTGRES_HOST="host"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database"
```


## 🔧 数据库连接字符串格式

### PostgreSQL 格式
```
postgresql://[username]:[password]@[host]:[port]/[database]?[parameters]
```

### 示例
```
# 基本格式
postgresql://myuser:mypassword@localhost:5432/mydatabase

# 带 SSL（生产环境推荐）
postgresql://myuser:mypassword@host.com:5432/mydatabase?sslmode=require

# Vercel Postgres 示例
postgresql://username:password@ep-cool-darkness-123456.us-east-1.postgres.vercel-storage.com:5432/verceldb
```

## 🚀 本地开发配置

### .env.local 文件
在项目根目录创建 `.env.local` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://doudou_user:doudou_password@localhost:5432/doudou_db"

# 或者使用单独的变量（作为备用）
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="doudou_db"
DB_USER="doudou_user"
DB_PASSWORD="doudou_password"

# 其他环境变量...
```

## 📋 环境变量检查清单

### 必需的数据库环境变量
- [ ] `DATABASE_URL` 或 `POSTGRES_URL`
- [ ] 数据库连接字符串格式正确
- [ ] 数据库服务器可访问
- [ ] 用户权限正确

### Vercel 部署检查
- [ ] 环境变量已在 Vercel Dashboard 中设置
- [ ] 环境变量应用到正确的环境（Production/Preview/Development）
- [ ] 数据库表已创建
- [ ] SSL 配置正确（生产环境）

## 🔍 故障排除

### 常见问题

#### 1. 连接被拒绝
```
Error: connect ECONNREFUSED
```
**解决方案**：
- 检查数据库服务器是否运行
- 检查主机名和端口是否正确
- 检查防火墙设置

#### 2. 认证失败
```
Error: password authentication failed
```
**解决方案**：
- 检查用户名和密码是否正确
- 检查用户是否有数据库访问权限

#### 3. SSL 错误
```
Error: self signed certificate
```
**解决方案**：
- 在连接字符串中添加 `?sslmode=require`
- 或在代码中设置 `ssl: { rejectUnauthorized: false }`

#### 4. 数据库不存在
```
Error: database "xxx" does not exist
```
**解决方案**：
- 确保数据库已创建
- 检查数据库名称是否正确

## 🧪 测试数据库连接

使用项目中的测试脚本：

```bash
# 测试 Vercel 数据库连接
npm run test:vercel-db

# 或直接运行
npx ts-node scripts/test-vercel-db.ts
```

## 📚 相关文档

- [Vercel Postgres 文档](https://vercel.com/docs/storage/vercel-postgres)
- [PostgreSQL 连接字符串文档](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Node.js pg 库文档](https://node-postgres.com/)
