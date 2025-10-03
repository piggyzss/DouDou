## 一、项目概述
目标：搭建可爱有趣的个人网站，包含首页、博客（Markdown支持）、开发作品、AICG作品、Agent等核心板块。
技术栈：

框架：Next.js 14（App Router模式）

样式：Tailwind CSS + Framer Motion（交互动效）

内容管理：Markdown文件 + remark/rehype解析

部署：Vercel

## 二、核心功能模块
### 1、首页（Landing Page）

导航栏（首页、博客、开发作品、AICG作品）

个人简介（姓名、介绍）

技能标签云（hover跳动效果）

最新博客/作品预览（滚动卡片）

社交媒体链接（GitHub/Twitter/LinkedIn）

### 2、博客系统（Blog）

Markdown文件解析（支持代码高亮/LaTeX公式）

文章列表页（创建时间/标签/喜欢）

文章详情页（目录导航、阅读进度条）

### 3、开发作品（Projects）

卡片式项目展示（标题/描述/技术栈/预览图）

项目详情页（Demo链接/GitHub仓库）

### 4、AIGC作品（AIGC Gallery）

#### 图片

横向瀑布流图片墙（响应式布局）

图片灯箱查看（全屏模式）

#### 视频

视频墙（响应式布局）

视频播放画布

#### 音乐

音乐列表

音乐播放器

### 5、Agent
- 智能助手
获取最新的 AI 资讯，通过控制台 AI Agent 进行交互

### 6、全局组件

导航栏（Sticky Header，滚动高亮）

页脚（动态版权年份 + 联系方式）

返回顶部按钮（滚动阈值触发）

## 三、项目结构

### 应用目录结构

```
app/
├── page.tsx                    # 首页入口
├── layout.tsx                  # 全局布局配置
├── middleware.ts               # Next.js中间件（匿名用户ID管理）
├── providers.tsx               # 全局状态管理（主题等）
├── fonts.ts                    # 字体配置
├── globals.css                 # 全局样式
├── assets/                     # 静态资源
│   ├── fonts/                  # 字体文件
│   │   ├── fzm-Old.Typewriter.ttf
│   │   └── ZenKakuGothicNew-Medium.ttf
│   ├── icon/                   # 图标文件
│   │   ├── hand.svg            # 自定义鼠标指针
│   │   └── icon.svg            # 网站图标
│   └── images/                 # 图片资源
│       └── avatar.png          # 用户头像
├── home/                       # 首页模块
│   ├── Hero.tsx                # 首页英雄区域
│   ├── About.tsx               # 个人简介
│   ├── Skills.tsx              # 技能展示
│   └── LatestContent.tsx       # 最新内容预览
├── blog/                       # 博客模块
│   ├── page.tsx                # 博客列表页
│   ├── new/                    # 新建博客
│   │   └── page.tsx
│   ├── [slug]/                 # 博客详情页（动态路由）
│   │   ├── page.tsx            # 博客详情
│   │   ├── edit/               # 编辑博客
│   │   │   └── page.tsx
│   │   ├── ClientBackToTop.tsx # 返回顶部组件
│   │   ├── ClientCodeBlock.tsx # 代码块组件
│   │   ├── ClientFadeIn.tsx    # 淡入动画组件
│   │   ├── ClientLike.tsx      # 点赞组件
│   │   ├── ClientLikesHeader.tsx # 点赞头部组件
│   │   └── toc.tsx             # 目录组件
│   └── components/             # 博客专用组件
│       ├── ClientListLikeCount.tsx # 列表点赞数
│       ├── EmptyState.tsx      # 空状态组件
│       └── PostDeleteButton.tsx # 删除按钮
├── projects/                   # 项目展示模块
│   └── page.tsx                # 项目列表页
├── aigc/                       # AIGC作品模块
│   ├── page.tsx                # AIGC主页
│   ├── components/             # AIGC组件
│   │   ├── AddImageModal.tsx   # 添加图片弹窗
│   │   ├── ConfirmModal.tsx    # 确认弹窗
│   │   ├── CreateArtworkModal.tsx # 创建作品集弹窗
│   │   ├── CreateMusicModal.tsx # 创建音乐弹窗
│   │   ├── CreateVideoModal.tsx # 创建视频弹窗
│   │   ├── FloatingPlayerBar.tsx # 浮动播放器
│   │   ├── ImagePreview.tsx    # 图片预览
│   │   └── MusicPlayer.tsx     # 音乐播放器
│   └── sections/               # AIGC页面区块
│       ├── ImagesSection.tsx   # 图片作品集区块
│       ├── MusicSection.tsx    # 音乐作品区块
│       └── VideosSection.tsx   # 视频作品区块
├── components/                 # 全局共享组件
│   ├── CodeCopyButton.tsx      # 代码复制按钮
│   ├── ConfirmModal.tsx        # 全局确认弹窗
│   ├── FileUpload.tsx          # 文件上传组件
│   ├── Footer.tsx              # 页脚组件
│   ├── LikeToggle.tsx          # 点赞切换组件
│   ├── Navigation.tsx          # 导航栏组件
│   └── icons/                  # 自定义图标
│       └── FilePenLine.tsx     # 编辑图标
└── api/                        # API路由
    ├── blog/                   # 博客相关API
    │   ├── route.ts            # 博客CRUD
    │   └── [slug]/route.ts     # 博客详情API
    ├── aigc/                   # AIGC相关API
    │   ├── artworks/           # 作品集API
    │   ├── music/              # 音乐API
    │   ├── videos/             # 视频API
    │   ├── proxy-image/        # 图片代理API
    │   └── proxy-audio/        # 音频代理API
    ├── likes/                  # 点赞相关API
    │   ├── status/route.ts     # 点赞状态查询
    │   └── toggle/route.ts     # 点赞切换
    └── upload/route.ts         # 文件上传API
```

### 工具库目录结构

```
lib/                            # 工具库
├── blog.ts                     # 博客相关工具函数
├── database.ts                 # 数据库连接和查询
├── tencent-cos.ts              # 腾讯云COS操作
├── tencent-cos-config.ts       # 腾讯云COS配置
└── models/                     # 数据模型定义
    ├── artwork.ts              # 作品集模型
    ├── blog.ts                 # 博客模型
    ├── likes.ts                # 点赞模型
    ├── music.ts                # 音乐模型
    └── video.ts                # 视频模型
```

### 脚本目录结构

```
scripts/                        # 脚本工具
├── git-hooks/                  # Git钩子
│   └── pre-commit              # 提交前检查
├── init-database.ts            # 数据库初始化
├── init-aigc-db.ts             # AIGC数据库初始化
├── manage-blog-db.ts           # 博客数据库管理
├── manage-aigc-*.ts            # AIGC数据管理脚本
├── test-*.ts                   # 测试脚本
├── update-avatar.sh            # 头像更新脚本
└── update-changelog.ts         # 变更日志更新脚本
```

## 四、详细功能页面设计

### 1. 首页（Landing Page）详细设计

**页面结构：**
- **Hero区域**：
  - 问候语、姓名
  - 简短的个人标语（Typewriter效果）

- **个人简介区域**：
  - 详细自我介绍
  - 头像
  - 个人成就/经历时间轴
  - 个人技能

- **技能展示区域**：
  - 技能标签云
  - 技能分类：前端、后端、AI/ML、设计工具
  - 技术栈图标墙

- **最新内容预览**：
  - 最新博客文章（1篇，卡片式）
  - 最新项目作品（1个，缩略图+描述）
  - 最新AIGC作品（1张，瀑布流布局）
  - 滚动动画效果

- **社交媒体区域**：
  - 社交媒体图标（悬停放大效果）

### 2. 博客系统详细设计

**博客列表页：**
- **筛选功能**：
  - 标签筛选（多选）（todo）
  - 时间轴筛选（年/月）
  - 搜索功能（标题+内容）

- **文章卡片**：
  - 标题、封面、摘要、发布时间
  - 阅读时间估算（todo）
  - 标签列表

- **分页/无限滚动**：
  - 每页显示10篇文章
  - 分页

**博客详情页：**
- **文章头部**：
  - 标题、作者、发布时间
  - 阅读时间、字数统计
  - 标签列表
  - 分享按钮

- **文章内容**：
  - Markdown渲染
  - 代码高亮（Prism.js）
  - LaTeX公式支持（KaTeX）
  - 图片懒加载
  - 表格响应式设计

- **侧边栏功能**：
  - 目录导航（自动生成）
  - 阅读进度条
  - 相关文章推荐
  - 作者信息卡片

- **交互功能**：
  - 代码块复制按钮
  - 图片点击放大
  - 目录跳转高亮
  - 返回顶部按钮

### 3. 开发作品页面详细设计

**作品列表页：**

- **项目卡片**：
  - 项目预览图（GIF/视频）
  - 项目标题和描述
  - 技术栈标签
  - 项目状态徽章
  - 链接按钮（Demo、GitHub）

- **布局选项**：
  - 网格布局（默认）
  - 列表布局
  - 瀑布流布局

**项目详情页：**
- **项目头部**：
  - 项目标题和描述
  - 技术栈列表
  - 项目状态和时间
  - 项目链接

- **项目内容**：
  - 项目截图轮播
  - 功能特性列表
  - 技术实现说明
  - 开发过程记录
  - 遇到的问题和解决方案

- **相关项目推荐**：
  - 基于技术栈推荐
  - 基于项目类型推荐

### 4. AIGC作品画廊详细设计

**画廊主页：**
- **筛选功能**：
  - 作品类型筛选（AI绘画、AI视频、AI音乐等）

- **作品展示**：
  - 瀑布流布局（Masonry）
  - 图片懒加载
  - 悬停效果（放大+信息显示）
  - 点击灯箱查看

- **作品信息**：
  - 作品标题和描述
  - 生成工具和参数
  - 创作时间
  - 标签分类

**作品详情页：**
- **作品展示**：
  - 大图查看
  - 图片缩放功能
  - 全屏模式
  - 下载按钮

- **作品信息**：
  - 详细描述
  - 生成参数
  - 创作过程记录
  - AI生成的描述摘要

- **相关作品推荐**：
  - 同系列作品
  - 相似风格作品

### 5. Agent详细设计
模仿开发者控制台或终端界面，给用户一种"操控AI信息流"的沉浸感
- **终端命令行**：
  - Header：类似terminal的header设计，右上角实时显示当前Agent执行状态
  - 展示面板：右侧可折叠的快捷命令面板，用于快速选中执行命令
  - 展示面板：命令执行结果
  - 输入框：用于输入命令

## 五、性能优化策略

**图片优化：**
- WebP格式支持
- 响应式图片
- 懒加载实现
- 图片压缩

**代码优化：**
- 组件懒加载
- 代码分割
- 缓存策略
- SEO优化

**用户体验：**
- 骨架屏加载
- 错误边界处理
- 离线支持
- 访问统计

## 六、技术实现细节

### 1. 数据管理方案

**内容管理：**
- Markdown文件存储在 `content/` 目录
- 图片资源存储在 `app/assets/images/`
- 元数据使用Front Matter格式
- 自动生成sitemap和RSS

**状态管理：**
- 主题状态：React Context
- 搜索状态：URL参数
- 筛选状态：本地状态
- 用户偏好：localStorage

这个完善后的设计文档涵盖了个人网站的所有核心功能，包括详细的页面结构、UI设计规范、交互效果和技术实现方案。你可以根据这个规划逐步实现各个功能模块。

## 七、样式规范说明

**注意**：详细的样式规范、设计原则、字体系统、组件样式等已迁移至 `style.md` 文档中，请参考该文档获取完整的样式规范信息。

主要包含：
- 色彩系统与CSS变量定义
- 字体系统与使用规范
- 组件样式规范（按钮、弹窗、时间信息、标签等）
- 动画与交互规范
- 响应式设计规范
- 主题系统设计
- 应用位置对照
