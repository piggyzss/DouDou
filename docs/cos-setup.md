# 腾讯云COS配置完成指南

## 🎉 配置已完成！

您的腾讯云COS存储服务已经成功集成到项目中。以下是接下来的步骤：

## 📝 环境变量配置

请在项目根目录创建 `.env.local` 文件，并填入您的腾讯云COS配置信息：

```env
# 腾讯云COS配置
TENCENT_COS_SECRET_ID=your_secret_id_here
TENCENT_COS_SECRET_KEY=your_secret_key_here
TENCENT_COS_BUCKET=your_bucket_name_here
TENCENT_COS_REGION=ap-beijing
TENCENT_COS_APP_ID=your_app_id_here

# 应用配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
```

## 🔧 获取配置信息

### 1. SecretId 和 SecretKey

- 登录腾讯云控制台
- 进入访问管理CAM：https://console.cloud.tencent.com/cam
- 在用户列表中找到您创建的子用户
- 点击"管理" → "API密钥"
- 复制SecretId和SecretKey

### 2. 存储桶信息

- 进入对象存储COS：https://console.cloud.tencent.com/cos
- 在存储桶列表中找到您的存储桶
- 记录存储桶名称和地域信息

### 3. AppId

- 在存储桶概览页面查看AppId

## 🧪 测试连接

运行测试脚本验证配置：

```bash
npx tsx scripts/test-cos.ts
```

如果看到以下输出，说明配置成功：

```
🧪 Testing Tencent Cloud COS connection...

📤 Testing file upload...
✅ Upload successful!
   URL: https://your-bucket.cos.ap-beijing.myqcloud.com/test/xxx.txt
   Filename: test/xxx.txt
   File size: 32 bytes

🗑️  Testing file deletion...
✅ Delete successful!

📋 Testing file listing...
✅ Found 0 files in bucket

🎉 All tests completed!
```

## 📁 文件存储结构

上传的文件将按以下结构存储：

```
your-bucket/
├── blog/          # 博客相关文件
├── aigc/          # AIGC作品文件
│   ├── images/    # 图片作品
│   ├── videos/    # 视频作品
│   └── music/     # 音频作品
├── uploads/       # 通用上传文件
└── test/          # 测试文件
```

## 🚀 使用方式

### 1. 在组件中使用文件上传

```tsx
import { FileUpload } from "@/app/components/FileUpload";

export default function MyComponent() {
  const handleUpload = (url: string) => {
    console.log("File uploaded:", url);
  };

  return (
    <FileUpload
      onUpload={handleUpload}
      folder="blog"
      accept="image/*"
      multiple={true}
    />
  );
}
```

### 2. 在API中使用文件上传

```typescript
import { uploadFile } from "@/lib/tencent-cos";

// 上传单个文件
const result = await uploadFile(fileBuffer, "image.jpg", "image/jpeg", "blog");

if (result.success) {
  console.log("File URL:", result.url);
}
```

## 🔒 安全配置

### 1. 存储桶权限设置

- 在COS控制台中设置存储桶权限
- 配置防盗链规则
- 设置跨域访问规则

### 2. 密钥安全

- 不要将密钥提交到代码仓库
- 定期轮换密钥
- 使用最小权限原则

## 📊 监控和日志

### 1. 访问日志

- 在COS控制台查看访问日志
- 监控文件上传和下载情况

### 2. 错误处理

- 检查控制台错误日志
- 监控API响应状态

## 🛠️ 故障排除

### 常见问题

1. **权限错误**
   - 检查SecretId和SecretKey是否正确
   - 确认子用户是否有COS访问权限

2. **网络错误**
   - 检查网络连接
   - 确认防火墙设置

3. **文件上传失败**
   - 检查文件大小限制
   - 确认文件类型是否允许

### 获取帮助

如果遇到问题，请检查：

1. 环境变量配置是否正确
2. 网络连接是否正常
3. 腾讯云控制台中的配置

## 🎯 下一步

现在您可以：

1. 启动开发服务器：`npm run dev`
2. 测试文件上传功能
3. 在博客和AIGC页面中使用文件上传
4. 根据需要调整文件大小和类型限制

恭喜！您的腾讯云COS存储服务已经配置完成并可以使用了！ 🎉
