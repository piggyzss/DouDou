# AIGC功能快速启动指南

## 🚀 快速开始

### 1. 环境配置

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

### 2. 数据库初始化

```bash
# 初始化数据库表
npm run db:init
```

### 3. 配置测试

```bash
# 测试所有配置
npm run db:test
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 访问AIGC页面

打开浏览器访问：`http://localhost:3000/aigc`

## 📝 使用说明

### 创建作品集

1. 在AIGC页面点击"新建作品集"按钮
2. 填写作品集名称和标签
3. 上传图片文件（支持多选）
4. 点击"完成"按钮
5. 系统会自动：
   - 将图片上传到腾讯云COS
   - 保存作品集信息到数据库
   - 更新页面显示新作品集

### 功能特性

- ✅ 多图片上传
- ✅ 图片预览和删除
- ✅ 实时上传进度
- ✅ 错误处理和提示
- ✅ 响应式设计
- ✅ 暗色模式支持

## 🔧 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证数据库配置信息
   - 确保数据库用户有足够权限

2. **腾讯云COS上传失败**
   - 检查SecretId和SecretKey是否正确
   - 验证存储桶名称和区域
   - 确认存储桶访问权限设置

3. **文件上传失败**
   - 检查文件大小是否超过限制（10MB）
   - 确认文件类型是否支持
   - 验证网络连接

### 调试命令

```bash
# 查看详细错误信息
npm run db:test

# 检查数据库连接
psql -h localhost -U doudou_user -d doudou

# 查看环境变量
echo $DB_HOST
echo $TENCENT_COS_BUCKET
```

## 📚 相关文档

- [AIGC功能配置说明](./aigc-setup.md)
- [数据库架构文档](../database-schema.md)
- [API接口文档](./api-docs.md)

## 🆘 获取帮助

如果遇到问题，请：

1. 查看控制台错误信息
2. 运行配置测试脚本
3. 检查环境变量配置
4. 参考相关文档
