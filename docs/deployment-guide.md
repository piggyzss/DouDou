# 项目部署指南

## 1、申请域名

### 1.1 选择域名注册商
推荐使用以下服务商：
腾讯云域名注册（推荐，与你的腾讯云服务集成）
阿里云万网
GoDaddy
Namecheap

### 1.2 域名选择建议

主域名：建议选择 `.com` 或 `.cn` 域名，yourname.com 或 yourname.cn
备选方案：yourname.dev、yourname.site、yourname.tech
价格范围：.com 域名约 60-100元/年，.cn 域名约 30-50元/年

### 1.3 腾讯云域名注册步骤
1、登录 腾讯云控制台
2、进入 域名注册 服务
3、搜索你想要的域名
4、选择合适的后缀和年限
5、完成实名认证（国内域名必需）
6、支付费用

## 2、部署到 Vercel（推荐）
### 2.1 准备项目
首先确保项目可以正常构建：构建成功！

### 2.2 部署到 Vercel
注册Vercel账号，访问 vercel.com
使用 GitHub 账号登录（推荐）
连接 GitHub 仓库
在 Vercel 控制台点击 "New Project"
选择你的 GitHub 仓库
导入项目

配置部署设置
Framework Preset: Next.js
Root Directory: ./ (默认)
Build Command: npm run build
Output Directory: .next (默认)
Install Command: npm install

### 2.3 配置环境变量
在 Vercel 项目设置中添加以下环境变量：
让我检查项目中的环境变量配置：
基于代码分析，我来为你创建环境变量配置指南：
让我创建一个部署配置文档：deployment-guide.md


## 3、配置 DNS 解析

###3.1 获取 Vercel 域名信息
在 Vercel 项目设置中找到 "Domains" 选项
添加你的自定义域名（如：yourname.com）
Vercel 会提供 DNS 配置信息

### 3.2 在腾讯云配置 DNS
登录腾讯云控制台
进入 云解析 DNS 服务
找到你的域名，点击 "解析"
添加以下记录：
```
类型: A
主机记录: @
记录值: 76.76.19.61 (Vercel 的 IP)
TTL: 600

类型: CNAME  
主机记录: www
记录值: cname.vercel-dns.com
TTL: 600
```

## 4、设置生产数据库

## 4.1 选择数据库服务
推荐选项：
Vercel Postgres（与 Vercel 集成，简单）
腾讯云 PostgreSQL（与现有服务集成）
Supabase（免费额度大）

## 4.2 使用 Vercel Postgres（推荐）
在 Vercel 项目中选择 "Storage" 标签
创建 Postgres 数据库
获取连接字符串
在环境变量中配置：
```
   DATABASE_URL=postgresql://username:password@host:port/database
```

## 4.3 数据库初始化
部署后需要运行数据库初始化脚本：deploy-init.ts

## 5、配置腾讯云 COS

### 5.1 创建存储桶
1、登录腾讯云控制台
2、进入 对象存储 COS 服务
3、创建存储桶：
名称：yourname-website-assets
地域：选择离用户最近的地域
访问权限：公有读私有写

### 5.2 配置 CORS 策略
在存储桶设置中添加 CORS 规则：
```
[
  {
    "AllowedOrigins": ["https://yourdomain.com", "https://www.yourdomain.com"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 5.3 获取 API 密钥
进入 访问管理 > API 密钥管理
创建密钥，获取 SecretId 和 SecretKey
在 Vercel 环境变量中配置

## 6、部署和验证

### 6.1 提交代码到 GitHub
```
git add .
git commit -m "feat: 准备生产环境部署"
git push origin main
```

### 6.2 在 Vercel 中部署
1、Vercel 会自动检测到代码更新
2、开始自动部署
3、等待部署完成

### 6.3 配置自定义域名
在 Vercel 项目设置中添加域名
按照提示配置 DNS
等待 SSL 证书自动配置

## 7、生产环境验证
运行验证脚本：npm run deploy:verify

## 8、添加部署脚本到 package.json



## 9、预估成本
域名：60-100元/年（.com 域名）
Vercel：免费（个人项目）
Vercel Postgres：免费（1GB 存储）
腾讯云 COS：约 10-20元/月（根据使用量）
总计：约 200-300元/年

🛠️ 新增的工具脚本
npm run deploy:init - 生产环境数据库初始化
npm run deploy:verify - 部署验证检查
docs/deployment-guide.md - 详细部署文档

⚡ 快速开始
立即申请域名：选择你喜欢的域名并注册
部署到 Vercel：连接 GitHub 仓库开始部署
配置环境变量：按照文档配置所有必要的环境变量
验证部署：使用提供的脚本验证所有服务




## Q&A

### 一、怎样在 Vercel 项目设置中添加环境变量？

🔧 在 Vercel 中添加环境变量的详细步骤

#### 方法一：通过 Vercel 控制台（推荐）
1. 登录并进入项目
访问 vercel.com 并登录
在 Dashboard 中找到你的项目
点击项目名称进入项目详情页
2. 进入设置页面
点击项目页面顶部的 "Settings" 标签
在左侧菜单中找到 "Environment Variables" 选项
点击进入环境变量配置页面
3. 添加环境变量
点击 "Add New" 按钮
填写环境变量信息：
Name: 变量名（如：DATABASE_URL）
Value: 变量值（如：postgresql://username:password@host:port/database）
Environment: 选择环境（Production、Preview、Development）
4. 批量添加环境变量
对于你的项目，需要添加以下环境变量：
网站配置

#### 方法二：通过 Vercel CLI
1. 安装 Vercel CLI
vercel
2. 登录 Vercel
login
3. 添加环境变量
production

#### 方法三：通过 .env 文件（开发环境）
1. 创建环境变量文件
在项目根目录创建 .env.local 文件：
📋 环境变量配置清单
必需的环境变量
变量名	描述	示例值
DATABASE_URL	数据库连接字符串	postgresql://user:pass@host:5432/db
COS_SECRET_ID	腾讯云COS密钥ID	AKIDxxxxxxxxxxxxxxxxxxxx
COS_SECRET_KEY	腾讯云COS密钥	xxxxxxxxxxxxxxxxxxxxxxxx
COS_BUCKET	COS存储桶名称	yourname-website-assets-1234567890
COS_REGION	COS地域	ap-beijing
COS_APP_ID	COS应用ID	1234567890
COS_DOMAIN	COS域名	https://bucket.cos.ap-beijing.myqcloud.com
NEXT_PUBLIC_SITE_URL	网站URL	https://yourdomain.com
NODE_ENV	环境标识	production



环境变量获取方法
1. 数据库连接字符串
Vercel Postgres: 在 Vercel 项目 Storage 中创建数据库后自动生成
腾讯云 PostgreSQL: 在腾讯云控制台获取连接信息
2. 腾讯云 COS 配置
登录腾讯云控制台
进入 对象存储 COS 服务
创建存储桶，记录名称和地域
进入 访问管理 > API 密钥管理
创建密钥，获取 SecretId 和 SecretKey

验证环境变量配置
1. 在 Vercel 中检查
进入项目 Settings > Environment Variables
确认所有变量都已添加
检查变量值是否正确
2. 通过代码验证
创建一个简单的 API 路由来验证环境变量：

部署后验证步骤
1. 检查健康状态
部署完成后，访问：https://yourdomain.com/api/health
应该看到类似这样的响应：
}
2. 常见问题排查
问题1：环境变量未生效
确保在正确的环境（Production）中添加变量
重新部署项目
检查变量名拼写是否正确
问题2：数据库连接失败
检查 DATABASE_URL 格式是否正确
确认数据库服务是否正常运行
检查网络连接和防火墙设置
问题3：COS 配置错误
验证 COS_SECRET_ID 和 COS_SECRET_KEY 是否正确
检查存储桶名称和地域是否匹配
确认存储桶权限设置

快速操作指南
立即开始：
登录 Vercel → 选择项目 → Settings → Environment Variables
逐个添加 上面列出的环境变量
重新部署 项目
访问 /api/health 验证配置
需要帮助？
如果遇到问题，可以：
查看 Vercel 部署日志
使用健康检查 API 诊断问题
检查环境变量是否正确设置
现在你可以按照这些步骤在 Vercel 中配置环境变量了！


在 Vercel 项目设置中添加以下环境变量：
### 数据库配置
```
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=doudou_db
DB_USER=doudou_user
DB_PASSWORD=your_database_password
```

### 腾讯云COS配置
```
COS_SECRET_ID=your_cos_secret_id
COS_SECRET_KEY=your_cos_secret_key
COS_BUCKET=your_bucket_name
COS_REGION=ap-beijing
COS_APP_ID=your_cos_app_id
COS_DOMAIN=https://your_bucket.cos.ap-beijing.myqcloud.com
```

### 网站配置
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production
```












## 部署步骤



### 2. Vercel 部署
1. 注册 Vercel 账号
2. 连接 GitHub 仓库
3. 配置环境变量
4. 部署项目

### 3. 域名配置
1. 在 Vercel 中添加自定义域名
2. 配置 DNS 解析
3. 等待 SSL 证书自动配置

### 4. 数据库设置
- 使用腾讯云 PostgreSQL 或 Vercel Postgres
- 配置连接参数
- 运行数据库初始化脚本

### 5. 腾讯云COS配置
- 创建存储桶
- 配置访问权限
- 获取 API 密钥

## 注意事项

1. 确保所有环境变量正确配置
2. 数据库连接需要支持外网访问
3. COS 存储桶需要配置正确的 CORS 策略
4. 域名解析可能需要 24-48 小时生效
