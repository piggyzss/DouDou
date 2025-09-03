# AIGC功能配置说明

## 概述

AIGC页面已经集成了完整的数据库存储和腾讯云COS文件上传功能。当用户在"新建作品集"弹窗中提交表单时，系统会：

1. 将图片文件上传到腾讯云COS
2. 将作品集信息保存到PostgreSQL数据库
3. 更新前端界面显示新创建的作品集

## 环境变量配置

在项目根目录创建 `.env.local` 文件，并配置以下环境变量：

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

## 数据库表结构

系统使用以下数据库表：

### artwork_collections (作品集表)
- `id`: 主键
- `title`: 作品集标题
- `description`: 描述（可选）
- `tags`: 标签数组
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `likes_count`: 点赞数
- `views_count`: 浏览数
- `status`: 状态（active/draft/archived）
- `cover_image_url`: 封面图片URL

### artwork_images (图片资源表)
- `id`: 主键
- `collection_id`: 关联的作品集ID
- `filename`: 文件名
- `original_name`: 原始文件名
- `file_url`: 文件URL
- `thumbnail_url`: 缩略图URL（可选）
- `file_size`: 文件大小
- `width`: 图片宽度（可选）
- `height`: 图片高度（可选）
- `mime_type`: MIME类型
- `created_at`: 创建时间
- `sort_order`: 排序顺序

## API接口

### POST /api/aigc/artworks
创建新的作品集

**请求参数：**
- `title`: 作品集标题（必需）
- `tags`: 标签，逗号分隔
- `files`: 图片文件数组

**响应：**
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

### GET /api/aigc/artworks
获取作品集列表

**查询参数：**
- `page`: 页码（默认1）
- `limit`: 每页数量（默认10）

## 文件上传流程

1. 用户选择图片文件
2. 前端创建FormData对象
3. 调用 `/api/aigc/artworks` 接口
4. 后端验证文件类型和大小
5. 将文件上传到腾讯云COS
6. 保存作品集信息到数据库
7. 返回上传结果给前端
8. 前端更新界面显示新作品集

## 腾讯云COS配置

确保腾讯云COS已正确配置：

1. 创建存储桶
2. 获取SecretId和SecretKey
3. 配置跨域访问规则
4. 设置适当的访问权限

## 开发模式

在开发模式下，AIGC页面会显示"新建作品集"、"新建音乐"、"新建视频"按钮，方便测试功能。

## 注意事项

1. 确保数据库已正确初始化
2. 腾讯云COS配置必须正确
3. 文件上传有大小限制（默认10MB）
4. 支持的文件类型：JPG, PNG, GIF, WebP
5. 建议在生产环境中配置CDN加速
