# 真实新闻数据获取实现

## ✅ 已完成

NewsCollectorService 现在支持从真实 RSS 源获取新闻数据！

---

## 🙋 什么是RSS？
RSS 是一种公认的国际标准协议！
- 标准名称：RSS 2.0（2002 年发布）、Atom 1.0（另一个类似标准）
- 标准文档：https://www.rssboard.org/rss-specification

RSS 就像是：
📮 一个自动更新的邮箱
📡 一个新闻广播站
🔔 一个内容订阅服务

核心概念：
- 网站发布 RSS 源（XML 文件）
- 你的程序定期读取这个文件
- 获取最新内容，无需访问网站

### **原理**


## ✨ 流程示例

假设用户输入："最新的 AI 新闻"

### 第1步：**理解用户意图（LLM 的作用）**

```
用户输入："最新的 AI 新闻"
    ↓
┌─────────────────────────────────────┐
│  步骤 1: 工具选择 (使用 LLM)        │
│  --------------------------------   │
│  AgentExecutor（执行器）             │
│    ↓                                │
│  使用 LLM 选择工具: "这是什么意思？" ← 这里用到 Gemini API│
│    ↓                                │
│  识别出意图: /latest 命令             │
│    ↓                                │
│  返回: {                            │
│    command: "/latest",              │
│    params: {count: 5}               │
│  }                                  │
└─────────────────────────────────────┘
```
LLM 的作用：把自然语言翻译成系统能理解的命令
- 输入："最新的 AI 新闻"（人类语言）
- 输出：/latest 命令（机器指令）

### 第2步：**获取新闻数据（RSS 的作用）**
```
┌─────────────────────────────────────┐
│  步骤 2: 执行命令 (使用 RSS)        │
│  --------------------------------   │
│  NewsCollectorService（新闻收集器）   │
│    ↓                                │
│  从 RSS 源获取数据 ← 这里用到 RSS      │
│    ↓                                │
│  解析 XML 数据                       │
│    ↓                                │
│  返回新闻列表: [                      │
│    {title: "...", summary: "..."},  │
│    {title: "...", summary: "..."},  │
│    ...                              │
│  ]                                  │
└─────────────────────────────────────┘
```
RSS 的作用：从各大科技网站获取真实的新闻数据
- TechCrunch AI: https://techcrunch.com/feed/
- MIT Tech Review: https://www.technologyreview.com/feed/
- arXiv AI: http://export.arxiv.org/rss/cs.AI

### 第3步：**格式化输出**
```
    ↓
┌─────────────────────────────────────┐
│  步骤 3: 格式化输出                 │
│  --------------------------------   │
│  NewsPlugin                         │
│    ↓                                │
│  格式化成用户友好的文本             │
│    ↓                                │
│  返回给用户                         │
└─────────────────────────────────────┘
```

### 第4步：**深度分析（LLM 再次登场）**
如果用户使用 /deepdive 命令：
```
用户输入: "/deepdive OpenAI"
    ↓
┌─────────────────────────────────────┐
│              深度分析                │
│  --------------------------------   │
│  NewsCollectorService（新闻收集器）   │
│    ↓                                │
│  从 RSS 获取 OpenAI 相关新闻          │
│    ↓                                │
│  [LLM 分析] ← Gemini 再次出场         │
│  对新闻进行深度分析、总结趋势            │
│    ↓                                │
│  返回分析报告                         │
└─────────────────────────────────────┘
```

**Key Points**
- 需要配置 RSS 源
- 读取 RSS 的时机：不是定期自动读取，而是按需读取
```
用户请求 → 检查缓存 → 如果过期则读取 RSS → 返回结果
```


完整的请求流程
```
# 用户请求："最新的 AI 新闻"

# 1. 前端发送请求
POST /api/agent/execute
{
  "input": "最新的 AI 新闻"
}

# 2. 后端处理（agent.py）
async def execute_agent(request):
    # 解析意图 → /latest
    intent = await analyzer.parse_input("最新的 AI 新闻")
    
    # 调用新闻插件
    result = await news_plugin.execute(intent)

# 3. 新闻插件（news_plugin.py）
async def _handle_latest(self, params):
    # 调用新闻收集器
    news_items = await self.news_service.get_latest_news(limit=5)

# 4. 新闻收集器（news_collector.py）
async def get_latest_news(self, limit=5):
    # 获取所有新闻
    all_news = await self._fetch_all_news()
    
    # 返回前 5 条
    return all_news[:limit]

# 5. _fetch_all_news 的执行
async def _fetch_all_news(self):
    # 检查缓存
    if 缓存有效:
        return self._news_cache  # 直接返回，不访问 RSS
    
    # 缓存过期，访问所有 RSS 源
    # 并发访问 11 个 RSS URL
    tasks = [
        访问 TechCrunch RSS,
        访问 OpenAI RSS,
        访问 MIT RSS,
        ... 共 11 个
    ]
    
    # 等待所有完成（大约 2-3 秒）
    results = await asyncio.gather(*tasks)
    
    # 合并结果（约 200 条新闻）
    all_news = 合并所有结果
    
    # 保存到内存缓存
    self._news_cache = all_news
    self._cache_time = 现在时间
    
    return all_news

# 6. 返回给用户
返回 5 条最新新闻
```

## 🎯 核心功能

### 1. 多源 RSS 数据获取

**支持的数据源：**
- **AI 公司官方博客**
  - OpenAI Blog
  - Google AI Blog
  - DeepMind Blog
  - Meta AI
  - Anthropic

- **科技新闻媒体**
  - TechCrunch AI
  - VentureBeat AI
  - MIT Technology Review AI
  - The Verge AI

- **学术资源**
  - arXiv AI (cs.AI)
  - arXiv ML (cs.LG)

### 2. 智能功能

- ✅ **自动关键词提取**: 从标题和摘要中提取 AI 相关关键词
- ✅ **热门话题分析**: 基于关键词统计生成热门话题
- ✅ **相关性搜索**: 支持按标题、摘要、标签搜索
- ✅ **缓存机制**: 15 分钟缓存，减少网络请求
- ✅ **降级保障**: 网络失败时自动降级到 Mock 数据

### 3. 数据结构

```python
NewsItem(
    title="文章标题",
    summary="文章摘要（自动清理 HTML）",
    url="原文链接",
    source="来源名称",
    publish_time="2024-11-19 10:30:00",
    category="分类",
    tags=["关键词1", "关键词2"]
)
```

---

## 🚀 使用方法

### 启用真实数据（默认）

```python
from app.services.news_collector import NewsCollectorService

# 使用真实数据
service = NewsCollectorService(use_real_data=True)

# 获取最新新闻
news = await service.get_latest_news(limit=10)

# 搜索新闻
results = await service.search_news("OpenAI", limit=5)

# 获取热门话题
trending = await service.get_trending_topics(limit=10)
```

### 使用 Mock 数据（测试）

```python
# 使用 Mock 数据（不需要网络）
service = NewsCollectorService(use_real_data=False)
news = await service.get_latest_news(limit=10)
```

---

## 🧪 测试

### 测试真实新闻获取

```bash
cd agent-backend

# 启动服务
uvicorn app.main:app --reload

# 在另一个终端测试 API
curl -X POST http://localhost:8000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"input": "/latest 5", "session_id": "test"}'
```

**验证内容：**
1. 从 RSS 源获取真实新闻
2. 热门话题分析
3. 新闻搜索功能
4. 缓存机制

---

## 📊 性能

### 响应时间

| 操作 | 首次（网络） | 缓存 | 说明 |
|------|------------|------|------|
| 获取最新新闻 | 10-30s | < 0.1s | 并发获取所有 RSS 源 |
| 搜索新闻 | 10-30s | < 0.1s | 使用缓存数据搜索 |
| 热门话题 | 10-30s | < 0.1s | 基于缓存数据分析 |

### 缓存策略

- **缓存时长**: 15 分钟
- **缓存内容**: 所有 RSS 源的新闻
- **更新策略**: 缓存过期后自动重新获取
- **清除缓存**: `service.clear_cache()`

---

## 🔧 配置

### 添加新的 RSS 源

编辑 `app/services/news_collector.py`:

```python
def _init_rss_feeds(self):
    self.rss_feeds = {
        # 添加新源
        "新源名称": "https://example.com/rss.xml",
        
        # 现有源...
        "OpenAI Blog": "https://openai.com/blog/rss.xml",
        # ...
    }
```

### 调整缓存时长

```python
def _init_rss_feeds(self):
    # ...
    self._cache_duration = timedelta(minutes=30)  # 改为 30 分钟
```

---

## 🐛 故障排除

### 问题 1: 依赖未安装

**错误：**
```
ModuleNotFoundError: No module named 'feedparser'
```

**解决：**
```bash
pip install -r requirements.txt
```

### 问题 2: 网络连接失败

**现象：** 获取新闻时超时或失败

**解决：**
- 检查网络连接
- 系统会自动降级到 Mock 数据
- 查看日志了解具体失败的源

### 问题 3: RSS 源不可用

**现象：** 某些源返回空数据

**解决：**
- RSS 源可能临时不可用
- 系统会跳过失败的源，使用其他源的数据
- 可以在日志中看到警告信息

---

## 📈 数据质量

### 新闻来源可靠性

- ✅ **官方博客**: OpenAI、Google、Meta 等官方来源
- ✅ **权威媒体**: TechCrunch、MIT Technology Review
- ✅ **学术资源**: arXiv 论文

### 数据更新频率

- **官方博客**: 每周 1-3 次
- **科技媒体**: 每天 5-20 次
- **学术资源**: 每天 10-50 次

### 预期数据量

- **总计**: 每次获取 100-200 条新闻
- **去重**: 自动按时间排序
- **过滤**: 只保留 AI 相关内容

---

## 🔄 降级机制

### 三层保障

```
1. 真实 RSS 数据（优先）
   ↓ 网络失败
2. 缓存数据（15 分钟内）
   ↓ 缓存过期
3. Mock 数据（保底）
```

### 降级触发条件

1. **网络连接失败**: 无法访问 RSS 源
2. **RSS 解析失败**: RSS 格式错误
3. **超时**: 单个源超过 10 秒
4. **所有源失败**: 所有 RSS 源都不可用

---

## 📚 相关文档

- **阶段 3 总结**: [STAGE3_SUMMARY.md](STAGE3_SUMMARY.md)
- **系统设计**: [DESIGN.md](DESIGN.md)
- **API 文档**: [README.md](README.md)

---

## ✨ 总结

真实新闻数据获取功能已完全实现！

**特性：**
- ✅ 从 11+ RSS 源获取真实新闻
- ✅ 智能关键词提取和分类
- ✅ 热门话题自动分析
- ✅ 15 分钟缓存机制
- ✅ 自动降级保障
- ✅ 完整的测试覆盖

**下一步：**
1. 启动服务: `uvicorn app.main:app --reload`
2. 测试 API: `curl -X POST http://localhost:8000/api/agent/execute ...`
3. 使用前端查看真实新闻

---

**创建时间**: 2024-11-19
**状态**: ✅ 完成
