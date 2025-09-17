# Apps API 使用指南

## 概述

Apps API 提供了完整的应用管理功能，包括应用的增删改查、点赞、统计等功能。

## API 端点

### 1. 获取应用列表

**GET** `/api/apps`

**查询参数：**
- `page` (可选): 页码，默认为 1
- `limit` (可选): 每页数量，默认为 10
- `status` (可选): 应用状态，默认为 'online'
- `type` (可选): 应用类型 ('app', 'miniprogram', 'game')
- `platform` (可选): 平台 ('web', 'mobile', 'wechat')
- `tag` (可选): 标签名称

**示例：**
```bash
GET /api/apps?page=1&limit=10&type=app&platform=web
```

**响应：**
```json
{
  "apps": [
    {
      "id": 1,
      "name": "AI聊天助手",
      "slug": "ai-chat-assistant",
      "description": "基于OpenAI API的智能聊天应用...",
      "tags": ["AI", "聊天", "智能"],
      "type": "app",
      "platform": "web",
      "status": "online",
      "experience_method": "download",
      "download_url": "https://ai-chat-demo.com",
      "cover_image_url": "https://example.com/cover1.jpg",
      "video_url": "https://example.com/video1.mp4",
      "dau": 1234,
      "downloads": 5678,
      "likes_count": 128,
      "trend": "+12%",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "published_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "totalPages": 1,
  "currentPage": 1
}
```

### 2. 创建新应用

**POST** `/api/apps`

**请求体 (FormData)：**
- `name` (必填): 应用名称
- `description` (必填): 应用描述
- `tags` (可选): 标签，逗号分隔，最多5个
- `type` (必填): 应用类型
- `platform` (必填): 平台
- `status` (必填): 状态
- `experience_method` (必填): 体验方式
- `download_url` (可选): 下载链接
- `cover_image` (可选): 封面图片文件
- `video` (可选): 演示视频文件
- `qr_code_image` (可选): 二维码图片文件

**示例：**
```javascript
const formData = new FormData()
formData.append('name', '我的新应用')
formData.append('description', '这是一个很棒的应用')
formData.append('tags', 'AI,工具,智能')
formData.append('type', 'app')
formData.append('platform', 'web')
formData.append('status', 'development')
formData.append('experience_method', 'download')
formData.append('download_url', 'https://my-app.com')

fetch('/api/apps', {
  method: 'POST',
  body: formData
})
```

### 3. 获取单个应用

**GET** `/api/apps/[id]`

**示例：**
```bash
GET /api/apps/1
```

### 4. 更新应用

**PUT** `/api/apps/[id]`

**请求体 (FormData)：** 与创建应用相同，所有字段都是可选的

### 5. 删除应用

**DELETE** `/api/apps/[id]`

**示例：**
```bash
DELETE /api/apps/1
```

### 6. 点赞应用

**POST** `/api/apps/[id]/like`

**示例：**
```javascript
fetch('/api/apps/1/like', {
  method: 'POST'
})
```

### 7. 检查点赞状态

**GET** `/api/apps/[id]/like`

**响应：**
```json
{
  "liked": true
}
```

### 8. 获取应用统计

**GET** `/api/apps/[id]/stats?days=7`

**查询参数：**
- `days` (可选): 统计天数，默认为 7

### 9. 更新应用统计

**POST** `/api/apps/[id]/stats`

**请求体：**
```json
{
  "date": "2024-01-15",
  "dau": 100,
  "downloads": 50
}
```

### 10. 获取标签列表

**GET** `/api/apps/tags`

**响应：**
```json
[
  {
    "id": 1,
    "name": "AI",
    "slug": "ai",
    "description": "人工智能相关应用",
    "color": "#FF6B6B",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

### 11. 创建标签

**POST** `/api/apps/tags`

**请求体：**
```json
{
  "name": "新标签",
  "description": "标签描述",
  "color": "#FF6B6B"
}
```

### 12. 搜索应用

**GET** `/api/apps/search?q=关键词&page=1&limit=10&type=app&platform=web`

**查询参数：**
- `q` (必填): 搜索关键词
- `page` (可选): 页码
- `limit` (可选): 每页数量
- `type` (可选): 应用类型筛选
- `platform` (可选): 平台筛选

## 数据验证规则

- **name**: 必填，1-255字符
- **description**: 必填，最少10字符
- **tags**: 最多5个标签，每个标签最多20字符
- **download_url**: 如果experience_method为'download'则必填，必须是有效URL
- **qr_code_url**: 如果experience_method为'qrcode'则必填
- **cover_image_url**: 可选，必须是有效图片URL
- **video_url**: 可选，必须是有效视频URL

## 错误处理

所有API都会返回标准的HTTP状态码：

- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

错误响应格式：
```json
{
  "error": "错误描述"
}
```

## 文件上传

支持的文件类型：
- 封面图片：JPG, PNG, GIF
- 演示视频：MP4, WebM
- 二维码图片：JPG, PNG

所有文件都会上传到腾讯云COS进行存储。

## 使用示例

### 前端组件中使用

```typescript
// 获取应用列表
const fetchApps = async () => {
  const response = await fetch('/api/apps?page=1&limit=10')
  const data = await response.json()
  return data.apps
}

// 创建新应用
const createApp = async (appData: FormData) => {
  const response = await fetch('/api/apps', {
    method: 'POST',
    body: appData
  })
  return response.json()
}

// 点赞应用
const likeApp = async (appId: number) => {
  const response = await fetch(`/api/apps/${appId}/like`, {
    method: 'POST'
  })
  return response.json()
}
```

## 注意事项

1. 所有文件上传都会自动处理，无需手动处理文件存储
2. 点赞功能基于IP地址，同一IP只能点赞一次
3. 统计数据按天记录，支持历史数据查询
4. 搜索功能支持应用名称和描述的模糊匹配
5. 所有时间字段都使用ISO 8601格式
