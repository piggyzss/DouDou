# AIGC 功能完整指南

## 📋 目录
1. [快速开始](#🚀-快速开始)
2. [环境配置](#⚙️-环境配置)
3. [数据库架构](#🏗️-数据库架构)
4. [API 接口](#🔌-api-接口)
5. [使用说明](#📝-使用说明)
6. [故障排除](#🔧-故障排除)

---

## 🚀 快速开始

### 1️⃣ 环境配置
在项目根目录创建 `.env.local` 文件：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doudou
DB_USER=doudou_user
DB_PASSWORD=your_password

# 腾讯云COS配置
TENCENT_COS_SECRET_ID=your_secret_id
TENCENT_COS_SECRET_KEY=your_secret_key
TENCENT_COS_BUCKET=your_bucket_name
TENCENT_COS_REGION=ap-beijing
TENCENT_COS_APP_ID=your_app_id
TENCENT_COS_DOMAIN=https://your_bucket_name.cos.ap-beijing.myqcloud.com
```

### 2️⃣ 数据库初始化
```bash
# 初始化数据库表
npm run db:init

# 测试数据库连接
npm run test:db
```

### 3️⃣ 配置验证
```bash
# 测试所有配置
npm run db:test

# 测试腾讯云 COS 连接
npm run test:cos
```

### 4️⃣ 启动服务
```bash
# 启动开发服务器
npm run dev

# 访问 AIGC 页面
# http://localhost:3000/aigc
```

---

## ⚙️ 环境配置

### 🗄️ 数据库配置

#### PostgreSQL 设置
1. 安装 PostgreSQL
2. 创建数据库和用户：
```sql
CREATE DATABASE doudou;
CREATE USER doudou_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE doudou TO doudou_user;
```

3. 运行数据库初始化：
```bash
npm run db:init
```

### ☁️ 腾讯云 COS 配置

#### 1. 创建存储桶
- 登录腾讯云控制台
- 创建 COS 存储桶
- 记录存储桶名称和区域

#### 2. 获取访问密钥
- 访问 [API 密钥管理](https://console.cloud.tencent.com/cam/capi)
- 创建或获取 SecretId 和 SecretKey

#### 3. 配置跨域规则
在 COS 控制台设置跨域访问规则：
```json
{
  "AllowedOrigin": ["*"],
  "AllowedMethod": ["GET", "POST", "PUT", "DELETE", "HEAD"],
  "AllowedHeader": ["*"],
  "ExposeHeader": ["ETag"],
  "MaxAgeSeconds": 3600
}
```

#### 4. 设置访问权限
- 配置存储桶为公有读私有写
- 或设置适当的访问策略

---

## 🏗️ 数据库架构

### 📊 表结构设计

#### artwork_collections (作品集表)
```sql
CREATE TABLE artwork_collections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    cover_image_url VARCHAR(500)
);
```

#### artwork_images (图片资源表)
```sql
CREATE TABLE artwork_images (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES artwork_collections(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sort_order INTEGER DEFAULT 0
);
```

#### music_tracks (音乐表)
```sql
CREATE TABLE music_tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tags TEXT[],
    audio_url VARCHAR(500) NOT NULL,
    cover_url VARCHAR(500),
    duration INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);
```

#### videos (视频表)
```sql
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tags TEXT[],
    video_url VARCHAR(500) NOT NULL,
    cover_url VARCHAR(500),
    duration INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);
```

---

## 🔌 API 接口

### 🎨 图片作品集 API

#### POST /api/aigc/artworks
创建新的作品集

**请求参数：**
- `title`: 作品集标题（必需）
- `tags`: 标签，逗号分隔
- `files`: 图片文件数组

**响应示例：**
```json
{
  "success": true,
  "collection": {
    "id": 1,
    "title": "作品集标题",
    "tags": ["标签1", "标签2"],
    "created_at": "2024-01-15T10:30:00Z"
  },
  "uploadedFiles": [
    "https://your-bucket.cos.ap-beijing.myqcloud.com/aigc/images/123456.jpg"
  ]
}
```

#### GET /api/aigc/artworks
获取作品集列表

**查询参数：**
- `page`: 页码（默认1）
- `limit`: 每页数量（默认10）

### 🎵 音乐 API

#### POST /api/aigc/music
创建音乐记录

#### GET /api/aigc/music
获取音乐列表

### 🎬 视频 API

#### POST /api/aigc/videos
创建视频记录

#### GET /api/aigc/videos
获取视频列表

---

## 📝 使用说明

### 🎨 创建图片作品集

1. **访问 AIGC 页面**
   - 打开浏览器访问：`http://localhost:3000/aigc`

2. **新建作品集**
   - 点击"新建作品集"按钮
   - 填写作品集名称和标签
   - 选择图片文件（支持多选）
   - 点击"完成"按钮

3. **系统处理流程**
   - 将图片上传到腾讯云 COS
   - 保存作品集信息到数据库
   - 更新页面显示新作品集

### 🎵 创建音乐记录

1. 点击"新建音乐"按钮
2. 填写音乐标题和标签
3. 上传音频文件和封面图
4. 系统自动处理并保存

### 🎬 创建视频记录

1. 点击"新建视频"按钮
2. 填写视频标题和标签
3. 上传视频文件和封面图
4. 系统自动处理并保存

### ✨ 功能特性

- ✅ **多文件上传** - 支持同时上传多个文件
- ✅ **实时预览** - 上传前可预览文件
- ✅ **进度显示** - 实时显示上传进度
- ✅ **错误处理** - 完善的错误提示和处理
- ✅ **响应式设计** - 适配各种设备屏幕
- ✅ **暗色模式** - 支持深色主题
- ✅ **标签管理** - 灵活的标签分类系统
- ✅ **状态管理** - 支持草稿、发布、归档状态

---

## 🔧 故障排除

### 🚨 常见问题

#### 1. 数据库连接失败
**症状**：`Connection refused` 或 `Connection timeout`

**解决方案**：
```bash
# 检查数据库服务状态
sudo systemctl status postgresql

# 检查数据库连接
npm run test:db

# 验证配置
psql -h localhost -U doudou_user -d doudou
```

#### 2. 腾讯云 COS 上传失败
**症状**：`NoSuchBucket` 或 `Access Denied`

**解决方案**：
- 检查 SecretId 和 SecretKey 是否正确
- 验证存储桶名称和区域配置
- 确认存储桶访问权限设置
- 检查跨域配置是否正确

#### 3. 文件上传失败
**症状**：文件上传中断或失败

**解决方案**：
- 检查文件大小（默认限制 10MB）
- 确认文件类型是否支持
- 验证网络连接稳定性
- 检查服务器磁盘空间

#### 4. 权限问题
**症状**：`Permission denied` 或 `Access forbidden`

**解决方案**：
```sql
-- 数据库权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO doudou_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO doudou_user;
```

### 🛠️ 调试工具

#### 检查环境配置
```bash
# 查看环境变量
echo $DB_HOST
echo $TENCENT_COS_BUCKET

# 测试数据库连接
npm run test:db

# 测试 COS 连接
npm run test:cos

# 查看详细日志
npm run dev -- --verbose
```

#### 数据库管理命令
```bash
# 查看 AIGC 数据
npm run db:manage-aigc-image    # 管理图片作品集
npm run db:manage-aigc-music    # 管理音乐
npm run db:manage-aigc-video    # 管理视频

# 数据库统计
npm run db:info
```

#### 日志查看
```bash
# 查看应用日志
tail -f .next/server.log

# 查看数据库日志
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### ⚠️ 注意事项

1. **文件限制**
   - 图片：JPG, PNG, GIF, WebP
   - 音频：MP3, WAV, FLAC
   - 视频：MP4, WebM, MOV
   - 单文件最大 10MB

2. **性能优化**
   - 生产环境建议配置 CDN 加速
   - 定期清理无效的文件记录
   - 监控存储空间使用情况

3. **安全考虑**
   - 不要在客户端暴露 COS 密钥
   - 设置合适的文件访问权限
   - 定期轮换访问密钥

4. **备份策略**
   - 定期备份数据库
   - COS 文件建议启用版本控制
   - 重要数据建议异地备份

---

## 📚 相关文档

- **[数据库内容架构](./database-content-architecture.md)** - 完整的内容架构设计
- **[数据库综合指南](./database-comprehensive-guide.md)** - 数据库使用指南
- **[腾讯云 COS 配置](./cos-setup.md)** - COS 详细配置说明
- **[部署指南](./deployment-guide.md)** - 生产环境部署

---

## 🆘 获取帮助

如果遇到问题，请按以下步骤排查：

1. **查看错误信息** - 检查控制台和日志文件
2. **运行诊断命令** - 使用 `npm run test:db` 等命令
3. **检查配置文件** - 确认 `.env.local` 配置正确
4. **参考文档** - 查看相关技术文档
5. **查看数据库状态** - 使用 `npm run db:info` 检查连接

### 📞 技术支持

- 📖 查阅项目文档
- 🐛 提交 Issue 报告问题  
- 💬 参与社区讨论
- 📧 联系技术支持团队
