# 腾讯云COS CORS配置指南

## 什么是CORS？

CORS（Cross-Origin Resource Sharing，跨域资源共享）是一种Web安全机制，用于控制浏览器是否允许一个域名的网页访问另一个域名的资源。

### 为什么需要CORS？

当你的网站（如 `doudoulook.cn`）尝试访问腾讯云COS存储桶中的资源时，浏览器的同源策略会阻止这种跨域请求。CORS规则告诉浏览器："这个存储桶允许来自特定域名的访问"。

### 同源策略示例

```
❌ 被阻止的请求：
doudoulook.cn → cos.ap-nanjing.myqcloud.com

✅ 允许的请求（配置CORS后）：
doudoulook.cn → cos.ap-nanjing.myqcloud.com
```

## CORS配置步骤

### 1. 登录腾讯云控制台
1. 访问 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 登录你的账号

### 2. 进入对象存储COS服务
1. 在控制台搜索 "COS" 或 "对象存储"
2. 点击进入 **对象存储 COS** 服务

### 3. 选择存储桶
1. 在存储桶列表中，找到你的存储桶 `doudou-website-assets-1258558349`
2. 点击存储桶名称进入详情页

### 4. 配置CORS规则
1. 在左侧菜单中，点击 **安全管理** → **跨域访问CORS**
2. 点击 **添加规则** 按钮

### 5. 设置CORS规则参数

#### 推荐配置（生产环境）
```
规则名称: doudou-website-cors
来源Origin: https://doudoulook.cn, http://doudoulook.cn
允许的方法: GET, POST, PUT, DELETE, HEAD, OPTIONS
允许的头部: *
暴露的头部: ETag, x-cos-request-id, Content-Length, Content-Type
最大缓存时间: 3600
```

#### 开发环境配置
```
规则名称: doudou-dev-cors
来源Origin: http://localhost:3000, http://127.0.0.1:3000
允许的方法: GET, POST, PUT, DELETE, HEAD, OPTIONS
允许的头部: *
暴露的头部: ETag, x-cos-request-id, Content-Length, Content-Type
最大缓存时间: 3600
```

#### 通用配置（开发+生产）
```
规则名称: doudou-universal-cors
来源Origin: https://doudoulook.cn, http://doudoulook.cn, http://localhost:3000, http://127.0.0.1:3000
允许的方法: GET, POST, PUT, DELETE, HEAD, OPTIONS
允许的头部: *
暴露的头部: ETag, x-cos-request-id, Content-Length, Content-Type
最大缓存时间: 3600
```

### 6. 保存配置
点击 **确定** 保存CORS规则

## 参数说明

### 来源Origin
- **作用**：指定允许访问的域名
- **格式**：`协议://域名:端口`
- **示例**：`https://doudoulook.cn`, `http://localhost:3000`
- **安全建议**：生产环境使用具体域名，避免使用 `*`

### 允许的方法Methods
- **GET**：获取资源（显示图片、下载文件）
- **POST**：上传文件
- **PUT**：更新文件
- **DELETE**：删除文件
- **HEAD**：获取资源信息
- **OPTIONS**：预检请求（浏览器自动发送）

### 允许的头部Headers
- **作用**：指定允许的HTTP请求头
- **`*`**：允许所有请求头（开发环境）
- **具体头部**：`Content-Type, Authorization` 等（生产环境推荐）

### 暴露的头部Expose-Headers
- **作用**：指定浏览器可以访问的响应头
- **常用值**：`ETag, Content-Length, Content-Type`

### 最大缓存时间Max-Age
- **作用**：预检请求的缓存时间（秒）
- **推荐值**：`3600`（1小时）

## 验证CORS配置

### 1. 浏览器开发者工具验证
1. 打开你的网站
2. 按F12打开开发者工具
3. 查看 **Network** 标签页
4. 检查COS资源的请求状态：
   - ✅ 状态码200：成功
   - ❌ 状态码403/CORS错误：配置有问题

### 2. 命令行测试
```bash
# 测试预检请求
curl -H "Origin: https://doudoulook.cn" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://doudou-website-assets-1258558349.cos.ap-nanjing.myqcloud.com/

# 预期响应头包含：
# Access-Control-Allow-Origin: https://doudoulook.cn
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, HEAD, OPTIONS
```

## 常见问题解决

### 问题1：仍然出现CORS错误
**可能原因**：
- 域名不匹配（http vs https）
- 端口号不匹配
- 存储桶地域错误

**解决方案**：
- 检查Origin配置是否完全匹配
- 确认存储桶地域为 `ap-nanjing`
- 清除浏览器缓存重试

### 问题2：某些请求被阻止
**可能原因**：
- 请求方法不在允许列表中
- 请求头不被允许
- 预检请求失败

**解决方案**：
- 检查Methods配置
- 确认Headers配置
- 查看浏览器Network面板的OPTIONS请求

### 问题3：开发环境无法访问
**解决方案**：
- 添加 `http://localhost:3000` 到Origin列表
- 或者临时使用 `*` 进行开发

## 安全最佳实践

### 生产环境
1. **使用具体域名**：避免使用 `*` 通配符
2. **限制请求方法**：只允许必要的HTTP方法
3. **限制请求头**：只允许必要的请求头
4. **定期审查**：定期检查CORS规则是否合理

### 开发环境
1. **临时使用通配符**：开发时可以临时使用 `*`
2. **及时清理**：开发完成后移除不必要的规则
3. **本地测试**：确保本地开发环境正常工作

## 项目中的CORS应用

在你的项目中，CORS配置主要用于：

1. **图片显示**：AIGC模块中的作品集图片
2. **音频播放**：音乐模块中的音频文件
3. **视频播放**：视频模块中的视频文件
4. **文件上传**：用户上传的各类文件

配置完成后，你的网站就可以正常访问COS存储桶中的所有资源了！

## 总结

CORS配置是Web应用访问外部资源的关键步骤。通过正确配置CORS规则，你的网站可以安全地访问腾讯云COS存储桶中的资源，同时保持良好的安全性和性能。
