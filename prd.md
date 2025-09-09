一、项目概述
目标：搭建可爱有趣的个人网站，包含首页、博客（Markdown支持）、开发作品、AICG作品等核心板块。
技术栈：

框架：Next.js 14（App Router模式）

样式：Tailwind CSS + Framer Motion（交互动效）

内容管理：Markdown文件 + remark/rehype解析

部署：Vercel

二、核心功能模块
1、首页（Landing Page）

导航栏（首页、博客、开发作品、AICG作品）

个人简介（姓名、介绍）

技能标签云（hover跳动效果）

最新博客/作品预览（滚动卡片）

社交媒体链接（GitHub/Twitter/LinkedIn）

2、博客系统（Blog）

Markdown文件解析（支持代码高亮/LaTeX公式）

文章列表页（分类/标签/时间轴筛选）

文章详情页（目录导航、阅读进度条）

暗黑模式切换（持久化存储）

3、开发作品（Projects）

卡片式项目展示（标题/描述/技术栈/预览图）

项目详情页（Demo链接/GitHub仓库）

4、AIGC作品（AIGC Gallery）

瀑布流图片墙（响应式布局）

图片灯箱查看（全屏模式）

作品描述生成（调用OpenAI API摘要）

5、全局组件

导航栏（Sticky Header，滚动高亮）

页脚（动态版权年份 + 联系方式）

返回顶部按钮（滚动阈值触发）

三、UI/UX设计规范
风格参考：piggyzss.github.io
核心设计原则：

色彩：
主色： #6747ce + #eeb8b8
辅色： #fed336
文字： #34495e + #3c4858

字体：
标题：ZenKakuGothicNew-Medium
英文：fzm-Old.Typewriter
正文：'PingFang SC YouYuan Microsoft Yahei'

页面结构：

bash
app/
├── (main)/
│   ├── page.tsx        # 首页
│   ├── blog/
│   │   ├── page.tsx    # 博客列表
│   │   └── [slug]      # 博客详情（动态路由）
│   ├── projects/       # 开发作品
│   ├── aigc/           # AIGC画廊
│   └── components/     # 私有组件
├── layout.tsx          # 全局布局
└── providers.tsx       # 主题/状态管理

## 四、详细功能页面设计

### 1. 首页（Landing Page）详细设计

**页面结构：**
- **Hero区域**：
  - 问候语、姓名和标题
  - 简短的个人标语（Typewriter效果）

- **个人简介区域**：
  - 详细自我介绍
  - 头像
  - 个人成就/经历时间轴
  - 联系方式卡片

- **技能展示区域**：
  - 技能标签云
  - 技能分类：前端、后端、AI/ML、设计工具
  - 技术栈图标墙

- **最新内容预览**：
  - 最新博客文章（3篇，卡片式）
  - 最新项目作品（3个，缩略图+描述）
  - 最新AIGC作品（3张，瀑布流布局）
  - 滚动动画效果

- **社交媒体区域**：
  - 社交媒体图标（悬停放大效果）
  - 关注者数量显示

### 2. 博客系统详细设计

**博客列表页：**
- **筛选功能**：
  - 分类筛选（技术、生活、思考等）
  - 标签筛选（多选）
  - 时间轴筛选（年/月）
  - 搜索功能（标题+内容）

- **文章卡片**：
  - 标题、摘要、发布时间
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
  - 作品类型筛选（AI绘画、AI写作、AI音乐等）

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

## 五、UI/UX设计完善

### 1. 响应式设计规范

**断点设置：**
- 移动端：< 768px
- 平板端：768px - 1024px
- 桌面端：> 1024px
- 大屏端：> 1440px

**布局适配：**
- 移动端：单列布局，简化导航
- 平板端：双列布局，保留主要功能
- 桌面端：多列布局，完整功能展示

### 2. 交互动效设计

**页面切换动画：**
- 淡入淡出效果
- 滑动切换效果
- 页面加载进度条

**组件动画：**
- 卡片悬停效果（阴影+缩放）
- 按钮点击反馈
- 表单输入焦点效果
- 滚动触发动画

**微交互：**
- 鼠标跟随效果
- 滚动视差效果
- 技能标签跳动

### 3. 主题系统设计

**明暗主题：**
- 自动检测系统主题
- 手动切换按钮
- 主题持久化存储
- 平滑过渡动画

**色彩变量：**
```css
:root {
  /* 主色调 */
  --primary: #6747ce;
  --primary-light: #8a6fd8;
  --primary-dark: #4f35a0;
  
  /* 辅助色 */
  --secondary: #eeb8b8;
  --accent: #fed336;
  
  /* 文字色 */
  --text-primary: #34495e;
  --text-secondary: #3c4858;
  --text-muted: #6c757d;
  --text-light: #c6c6c6;
  
  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
}
```

### 4. 性能优化策略

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

### 1. 项目结构完善

```
<code_block_to_apply_changes_from>
app/
├── (main)/
│   ├── page.tsx                    # 首页
│   ├── blog/
│   │   ├── page.tsx               # 博客列表
│   │   ├── [slug]/
│   │   │   └── page.tsx           # 博客详情
│   │   └── components/            # 博客组件
│   ├── projects/
│   │   ├── page.tsx               # 项目列表
│   │   ├── [slug]/
│   │   │   └── page.tsx           # 项目详情
│   │   └── components/            # 项目组件
│   ├── aigc/
│   │   ├── page.tsx               # AIGC画廊
│   │   └── components/            # AIGC组件
│   └── components/                # 全局组件
├── layout.tsx                     # 全局布局
├── providers.tsx                  # 主题/状态管理
├── globals.css                    # 全局样式
└── lib/                          # 工具函数
    ├── markdown.ts               # Markdown处理
    ├── utils.ts                  # 通用工具
    └── constants.ts              # 常量定义
```

### 2. 数据管理方案

**内容管理：**
- Markdown文件存储在 `content/` 目录
- 图片资源存储在 `public/images/`
- 元数据使用Front Matter格式
- 自动生成sitemap和RSS

**状态管理：**
- 主题状态：React Context
- 搜索状态：URL参数
- 筛选状态：本地状态
- 用户偏好：localStorage

这个完善后的设计文档涵盖了个人网站的所有核心功能，包括详细的页面结构、UI设计规范、交互效果和技术实现方案。你可以根据这个规划逐步实现各个功能模块。


## 七、技术实现细节

### 1.全局确认弹窗样式规范

- 组件：`app/components/ConfirmModal.tsx`
- 交互：
  - 打开时背景使用 `bg-black bg-opacity-50` 遮罩，内容弹入动画（opacity + scale）
  - 关闭/确认均可关闭弹窗，确认按钮触发回调
- 尺寸：
  - 最大宽度 `max-w-md`，左右留白 `mx-4`
- 样式：
  - 容器：白底（深色为 `dark:bg-gray-800`），圆角 `rounded-lg`，内边距 `p-6`，细边框并按类型变化（`danger/warning/info`）
  - 文案：标题 `text-lg font-semibold`；正文 `text-sm`，采用 `font-body`
  - 图标：左侧类型图标（danger=AlertTriangle 红色，warning=AlertCircle 黄色，info=Info 蓝色）
  - 按钮：
    - 取消：灰色系 `bg-gray-100 hover:bg-gray-200`（深色 `dark:bg-gray-700 dark:hover:bg-gray-600`）
    - 确认：按类型着色（danger=红，warning=黄，info=蓝），hover 加深
- 使用场景：AIGC 作品删除、Blog 文章删除、其他危险操作二次确认

### 2.按钮风格统一规范（Blog）

- 统一主按钮（如“新建博客”“保存”）：
  - 类名：`inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark disabled:opacity-60 transition-colors font-blog text-sm shadow-sm`
- 统一次按钮（如“取消”“普通操作”）：
  - 类名：`inline-flex items-center px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-secondary hover:text-primary transition-colors font-blog text-sm shadow-sm`
- 图标按钮（如编辑/删除）：
  - 灰色圆形：`p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`
- 要求：页面内所有操作按钮遵守以上规范，保持颜色、阴影、字号、字体、hover、padding、高度一致

### 3.详情页进入动画规范（Blog）

- 组件：`app/blog/[slug]/ClientFadeIn.tsx`
- 动画：
  - 初始：`opacity: 0, y: 12`
  - 目标：`opacity: 1, y: 0`
  - 时长：`~0.28s`
- 使用：在详情页主内容外层包裹，提升新建/编辑完成后跳转的进入体验

### 4.字体样式规范

#### 时间信息样式规范

- 容器：`flex items-center gap-2`
- 字体：`text-sm text-text-muted`
- 位置：标题下方一行展示，元素之间用 `·` 分隔

#### 标签信息样式规范

- 标签 pill：`px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog`
- 行容器：`flex flex-wrap gap-2`
- 适用位置：Blog 列表与详情、AIGC 标签行

#### 字体变量定义与绑定（同步）

- 标题字体变量（博客标题“博客文章”等）
  - 变量名：`--font-zen-kaku`
  - 字体来源：`ZenKakuGothicNew-Medium.ttf`
  - 字重：`500`
  - 颜色：`var(--text-primary)`（类名：`text-text-primary`）
  - 使用类名：`font-heading`

- 副标题/英文变量（副标题“分享技术心得和生活感悟”等）
  - 变量名：`--font-typewriter`
  - 字体来源：`fzm-Old.Typewriter.ttf`
  - 字重：`400`
  - 颜色：`var(--text-secondary)`（类名：`text-text-secondary`）
  - 使用类名：`font-english`

- 正文字体（博客正文内容）
  - 变量名：`--font-body`
  - 字体栈：`'PingFang SC', 'YouYuan', 'Microsoft Yahei', sans-serif`
  - 字重：`400`（正文段落在 `.blog-content` 内部为 300）
  - 颜色：`var(--text-primary)`（类名：`text-text-primary`）
  - 使用类名：`font-body`（已绑定 `var(--font-body)`）或复用变量类：`blog-body-text`

应用位置：
- 首页 About/Experience 描述文案（`app/components/About.tsx`）
- 首页 Hero 副标语可选（若需要与正文完全一致）

对照代码位置：
- 标题与副标题：`app/blog/page.tsx` 顶部区域
- 正文容器：`app/blog/[slug]/page.tsx` 中 `.blog-content` 外层容器类名
