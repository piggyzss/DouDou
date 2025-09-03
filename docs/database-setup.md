# 数据库配置指南

## 🗄️ 数据库选择方案

### 方案一：本地PostgreSQL（推荐开发环境）

#### 1. 安装PostgreSQL
```bash
# macOS (使用Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. 创建数据库和用户
```bash
# 连接到PostgreSQL
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE doudou;
CREATE USER doudou_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE doudou TO doudou_user;
\q
```

#### 3. 配置环境变量
在 `.env.local` 文件中添加：
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doudou
DB_USER=doudou_user
DB_PASSWORD=your_password
```

### 方案二：腾讯云PostgreSQL（推荐生产环境）

#### 1. 购买腾讯云PostgreSQL实例
- 登录腾讯云控制台
- 进入数据库PostgreSQL
- 创建实例，选择合适的配置

#### 2. 配置安全组
- 开放5432端口
- 配置IP白名单

#### 3. 获取连接信息
- 实例ID
- 内网地址/外网地址
- 端口号
- 用户名和密码

#### 4. 配置环境变量
```env
DB_HOST=your_postgresql_host
DB_PORT=5432
DB_NAME=doudou
DB_USER=your_username
DB_PASSWORD=your_password
```

## 🚀 初始化数据库

### 1. 安装依赖
```bash
npm install pg @types/pg
```

### 2. 运行初始化脚本
```bash
npx tsx scripts/init-database.ts
```

### 3. 验证数据库连接
```bash
npx tsx scripts/test-database.ts
```

## 📊 数据结构说明

### AIGC图片模块

#### 作品集表 (artwork_collections)
- `id`: 主键
- `title`: 作品集标题
- `description`: 描述
- `tags`: 标签数组
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `likes_count`: 点赞数
- `views_count`: 浏览数
- `status`: 状态（active/draft/archived）
- `cover_image_url`: 封面图片URL

#### 图片资源表 (artwork_images)
- `id`: 主键
- `collection_id`: 作品集ID（外键）
- `filename`: 文件名
- `original_name`: 原始文件名
- `file_url`: 文件URL
- `thumbnail_url`: 缩略图URL
- `file_size`: 文件大小
- `width`: 图片宽度
- `height`: 图片高度
- `mime_type`: MIME类型
- `sort_order`: 排序

#### 点赞记录表 (artwork_likes)
- `id`: 主键
- `collection_id`: 作品集ID（外键）
- `ip_address`: IP地址
- `user_agent`: 用户代理
- `created_at`: 点赞时间

### 博客模块

#### 博客文章表 (blog_posts)
- `id`: 主键
- `slug`: 文章别名
- `title`: 标题
- `content`: 内容
- `excerpt`: 摘要
- `tags`: 标签数组
- `status`: 状态
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `views_count`: 浏览数
- `likes_count`: 点赞数

## 🔧 数据库操作

### 1. 创建作品集
```typescript
import { ArtworkModel } from '@/lib/models/artwork'

const collection = await ArtworkModel.create({
  title: '我的作品集',
  description: '这是一个测试作品集',
  tags: ['AI', '艺术'],
  cover_image_url: 'https://example.com/cover.jpg'
})
```

### 2. 获取作品集列表
```typescript
const result = await ArtworkModel.findAll(1, 10)
console.log(result.collections)
```

### 3. 记录点赞
```typescript
await ArtworkModel.recordLike(collectionId, ipAddress)
```

## 📈 性能优化

### 1. 索引优化
- 为常用查询字段创建索引
- 使用GIN索引优化数组查询

### 2. 连接池配置
- 设置合适的连接池大小
- 配置连接超时时间

### 3. 查询优化
- 使用分页查询
- 避免N+1查询问题
- 合理使用JOIN

## 🔒 安全配置

### 1. 数据库安全
- 使用强密码
- 限制数据库访问IP
- 定期备份数据

### 2. 应用安全
- 使用参数化查询防止SQL注入
- 验证输入数据
- 记录操作日志

## 🛠️ 故障排除

### 常见问题

1. **连接失败**
   - 检查数据库服务是否启动
   - 验证连接参数是否正确
   - 确认网络连接

2. **权限错误**
   - 检查用户权限
   - 确认数据库名称

3. **表不存在**
   - 运行初始化脚本
   - 检查SQL语法

### 获取帮助

如果遇到问题，请检查：
1. 数据库服务状态
2. 环境变量配置
3. 网络连接
4. 错误日志

## 🎯 下一步

配置完成后，您可以：
1. 启动应用并测试数据库连接
2. 创建作品集和上传图片
3. 测试点赞和浏览功能
4. 根据需要调整数据库配置
