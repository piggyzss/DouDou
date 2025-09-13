# 项目样式风格规范

本文档记录了整个项目的样式风格规范、设计原则和具体实现细节。

## 一、设计原则与风格参考

### 风格参考
- 参考网站：piggyzss.github.io
- 整体风格：可爱有趣、现代简洁

### 核心设计原则
- 响应式设计优先
- 用户体验至上
- 一致性设计语言
- 可访问性考虑

## 二、色彩系统

### 主色调
- **主色**：`#6747ce` + `#eeb8b8`
- **辅色**：`#fed336`
- **文字色**：`#34495e` + `#3c4858`

### CSS 变量定义
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
  --text-primary: #000C2A;
  --text-secondary: #444A6E;
  --text-muted: #6c757d;
  --text-light: #c6c6c6;
  
  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
}
```

### 颜色使用规范
- **主色**：用于主要按钮、链接、重要元素
- **辅色**：用于强调、警告、特殊状态
- **文字色**：根据层级使用不同深度的文字色
- **背景色**：提供层次感和视觉分离

## 三、字体系统

### 字体文件
- **标题字体**：`ZenKakuGothicNew-Medium.ttf`
- **英文字体**：`fzm-Old.Typewriter.ttf`
- **正文字体**：`'PingFang SC', 'YouYuan', 'Microsoft Yahei', sans-serif`

### 字体变量定义
```css
:root {
  /* 标题字体 */
  --font-zen-kaku: 'ZenKakuGothicNew-Medium', sans-serif;
  
  /* 英文字体 */
  --font-typewriter: 'fzm-Old.Typewriter', monospace;
  
  /* 正文字体 */
  --font-body: 'PingFang SC', 'YouYuan', 'Microsoft Yahei', sans-serif;
}
```

### 字体使用规范

#### 标题字体变量
- **变量名**：`--font-zen-kaku`
- **字体来源**：`ZenKakuGothicNew-Medium.ttf`
- **字重**：`500`
- **颜色**：`var(--text-primary)`（类名：`text-text-primary`）
- **使用类名**：`font-heading`
- **应用场景**：页面标题、区块标题

#### 副标题/英文字体变量
- **变量名**：`--font-typewriter`
- **字体来源**：`fzm-Old.Typewriter.ttf`
- **字重**：`400`
- **颜色**：`var(--text-secondary)`（类名：`text-text-secondary`）
- **使用类名**：`font-english`
- **应用场景**：副标题、英文内容、特殊标识

#### 正文字体变量
- **变量名**：`--font-body`
- **字体栈**：`'PingFang SC', 'YouYuan', 'Microsoft Yahei', sans-serif`
- **字重**：`400`（正文段落在 `.blog-content` 内部为 300）
- **颜色**：`var(--text-primary)`（类名：`text-text-primary`）
- **使用类名**：`font-body` 或 `blog-body-text`
- **应用场景**：正文内容、描述文字、一般文本

## 四、组件样式规范

### 1. 全局确认弹窗样式规范

**组件位置**：`app/components/ConfirmModal.tsx`

**交互规范**：
- 打开时背景使用 `bg-black bg-opacity-50` 遮罩
- 内容弹入动画（opacity + scale）
- 关闭/确认均可关闭弹窗，确认按钮触发回调

**尺寸规范**：
- 最大宽度：`max-w-md`
- 左右留白：`mx-4`

**样式规范**：
- **容器**：白底（深色为 `dark:bg-gray-800`），圆角 `rounded-lg`，内边距 `p-6`，细边框并按类型变化（`danger/warning/info`）
- **文案**：标题 `text-lg font-semibold`；正文 `text-sm`，采用 `font-body`
- **图标**：左侧类型图标（danger=AlertTriangle 红色，warning=AlertCircle 黄色，info=Info 蓝色）
- **按钮**：
  - 取消：灰色系 `bg-gray-100 hover:bg-gray-200`（深色 `dark:bg-gray-700 dark:hover:bg-gray-600`）
  - 确认：按类型着色（danger=红，warning=黄，info=蓝），hover 加深

**使用场景**：AIGC 作品删除、Blog 文章删除、其他危险操作二次确认

### 2. 按钮风格统一规范

#### 主按钮（如"新建博客""保存"）
```css
.inline-flex.items-center.px-4.py-2.rounded-md.bg-primary.text-white.hover:bg-primary-dark.disabled:opacity-60.transition-colors.font-blog.text-sm.shadow-sm
```

#### 次按钮（如"取消""普通操作"）
```css
.inline-flex.items-center.px-4.py-2.rounded-md.border.border-gray-200.dark:border-gray-700.bg-white.dark:bg-gray-800.text-text-secondary.hover:text-primary.transition-colors.font-blog.text-sm.shadow-sm
```

#### 图标按钮（如编辑/删除）
```css
.p-1.5.bg-gray-100.dark:bg-gray-700.text-gray-700.dark:text-gray-300.rounded-full.hover:bg-gray-200.dark:hover:bg-gray-600.transition-colors
```

**要求**：页面内所有操作按钮遵守以上规范，保持颜色、阴影、字号、字体、hover、padding、高度一致

### 3. 时间信息样式规范

**容器**：`flex items-center gap-2`
**字体**：`text-sm text-text-muted`
**位置**：标题下方一行展示，元素之间用 `·` 分隔

### 4. 标签信息样式规范

**标签 pill**：`px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog`
**行容器**：`flex flex-wrap gap-2`
**适用位置**：Blog 列表与详情、AIGC 标签行

## 五、动画与交互规范

### 1. 详情页进入动画规范

**组件位置**：`app/blog/[slug]/ClientFadeIn.tsx`

**动画参数**：
- 初始：`opacity: 0, y: 12`
- 目标：`opacity: 1, y: 0`
- 时长：`~0.28s`

**使用场景**：在详情页主内容外层包裹，提升新建/编辑完成后跳转的进入体验

### 2. 页面切换动画

**动画类型**：
- 淡入淡出效果
- 滑动切换效果
- 页面加载进度条

### 3. 组件动画

**动画效果**：
- 卡片悬停效果（阴影+缩放）
- 按钮点击反馈
- 表单输入焦点效果
- 滚动触发动画

### 4. 微交互

**交互效果**：
- 鼠标跟随效果
- 滚动视差效果
- 技能标签跳动

## 六、响应式设计规范

### 断点设置
- **移动端**：< 768px
- **平板端**：768px - 1024px
- **桌面端**：> 1024px
- **大屏端**：> 1440px

### 布局适配
- **移动端**：单列布局，简化导航
- **平板端**：双列布局，保留主要功能
- **桌面端**：多列布局，完整功能展示

## 七、主题系统设计

### 明暗主题
- 自动检测系统主题
- 手动切换按钮
- 主题持久化存储
- 平滑过渡动画

### 深色模式适配
所有组件都需要考虑深色模式适配，使用 `dark:` 前缀类名：
- 背景色：`bg-white dark:bg-gray-800`
- 文字色：`text-gray-900 dark:text-gray-100`
- 边框色：`border-gray-200 dark:border-gray-700`

## 八、性能优化策略

### 图片优化
- WebP格式支持
- 响应式图片
- 懒加载实现
- 图片压缩

### 代码优化
- 组件懒加载
- 代码分割
- 缓存策略
- SEO优化

### 用户体验
- 骨架屏加载
- 错误边界处理
- 离线支持
- 访问统计

## 九、应用位置对照

### 字体应用位置
- **标题与副标题**：`app/blog/page.tsx` 顶部区域
- **正文容器**：`app/blog/[slug]/page.tsx` 中 `.blog-content` 外层容器类名
- **首页 About/Experience**：`app/components/About.tsx` 描述文案
- **首页 Hero 副标语**：可选（若需要与正文完全一致）

### 组件应用位置
- **确认弹窗**：AIGC 作品删除、Blog 文章删除
- **按钮样式**：所有页面的操作按钮
- **时间信息**：Blog 列表与详情页
- **标签信息**：Blog 和 AIGC 模块

## 十、维护与更新

### 样式更新原则
1. 保持向后兼容性
2. 统一更新相关组件
3. 更新文档说明
4. 测试响应式效果

### 新增样式规范
1. 遵循现有设计语言
2. 考虑深色模式适配
3. 确保可访问性
4. 更新本文档

---

*本文档随项目发展持续更新，确保样式规范的一致性和完整性。*
