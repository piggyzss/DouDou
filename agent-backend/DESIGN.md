AI News Agent 完整设计文档
📋 目录
1. [系统概述](#一系统概述) 
2. [输入处理架构](#二输入处理架构)
3. [LLM技术选型对比](#三LLM技术选型对比)
4. [Agent架构设计](#四Agent架构设计)
5. [工作流程设计](#五工作流程设计)
6. [数据源设计](#六数据源设计)
7. [技术实现细节](#七技术实现细节)
8. [部署和成本](#八部署和成本)

## 一、系统概述

### 核心功能

用户可以通过两种方式与 AI News Agent 交互：

1. **命令式输入**：`/latest`、`/trending`、`/deepdive GPT-4` 等结构化命令
2. **自然语言输入**：`"最近 OpenAI 有什么新进展？"`、`"我想了解本周的 AI 热点"`

系统智能识别输入类型，并提供统一的处理流程。

### 后端流程架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户输入                                   │
│              "/latest 5" 或 "最近有什么AI新闻？"                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Frontend (React)                               │
│                   AgentTerminal Component                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js API Proxy                              │
│                   /api/agent/execute                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP
┌─────────────────────────────────────────────────────────────────┐
│                   Python Backend (FastAPI)                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. API Route (/api/agent/execute)                         │ │
│  │     - 接收 AgentRequest                                     │ │
│  │     - 提取 user_input                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  2. Intent Analyzer (app/core/intent_analyzer.py)          │ │
│  │     - 识别输入类型                                          │ │
│  │     - 转换为统一的 Intent 模型                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│         ↓ 命令式                              ↓ 自然语言          │
│  ┌──────────────────┐              ┌──────────────────────────┐ │
│  │ _parse_command() │              │ _fallback_parse()        │ │
│  │ 直接解析          │              │ 关键词匹配（基础版）      │ │
│  │ 置信度: 1.0       │              │ 置信度: 0.6-0.7          │ │
│  └──────────────────┘              │                          │ │
│                                     │ _parse_natural_language()│ │
│                                     │ LLM 分析（未来）          │ │
│                                     │ 置信度: 0.9+             │ │
│                                     └──────────────────────────┘ │
│                              ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  3. 统一 Intent 模型                                        │ │
│  │     {                                                       │ │
│  │       command: "/latest",                                  │ │
│  │       params: {count: 5},                                  │ │
│  │       source: "command" | "natural_language",              │ │
│  │       confidence: 0.6-1.0                                  │ │
│  │     }                                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  4. Plugin Manager (app/core/plugin_manager.py)            │ │
│  │     - 根据 Intent.command 路由到对应插件                    │ │
│  │     - 验证插件可用性                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  5. News Plugin (app/plugins/news_plugin.py)               │ │
│  │     - 处理 /latest, /trending, /deepdive 等命令            │ │
│  │     - 调用 News Collector Service                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  6. News Collector Service                                 │ │
│  │     (app/services/news_collector.py)                       │ │
│  │     - 当前：返回 mock 数据                                  │ │
│  │     - 未来：RSS Aggregator + HN API                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  7. 格式化响应                                              │ │
│  │     AgentResponse {                                        │ │
│  │       success: true,                                       │ │
│  │       data: "formatted news",                              │ │
│  │       type: "text",                                        │ │
│  │       plugin: "news",                                      │ │
│  │       command: "/latest"                                   │ │
│  │     }                                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Frontend 显示结果                              │
└─────────────────────────────────────────────────────────────────┘
```

### 关键特性

1. **统一入口**：所有输入都通过 Intent Analyzer 处理
2. **统一模型**：命令式和自然语言都转换为 Intent
3. **统一执行**：Plugin Manager 不关心输入来源
4. **渐进增强**：当前使用关键词匹配，未来集成 LLM
 
## 二、输入处理架构

### Intent Analyzer（意图分析器）

```python
# agent-backend/app/core/intent_analyzer.py
class IntentAnalyzer:
    """意图分析器 - 将所有输入转换为统一的 Intent 模型"""
    
    def __init__(self, plugin_manager: PluginManager, llm_service=None):
        self.plugin_manager = plugin_manager
        self.llm_service = llm_service
    
    async def parse_input(self, user_input: str, context: Optional[Dict[str, Any]] = None) -> Intent:
        """
        统一入口：将任何输入转换为 Intent
        
        Args:
            user_input: 用户输入（命令或自然语言）
            context: 上下文信息（会话历史等）
        
        Returns:
            Intent: 统一的意图模型
        
        Raises:
            InvalidCommandError: 无效命令
        """
        if context is None:
            context = {}
        
        # 1. 命令式输入：直接解析
        if user_input.strip().startswith('/'):
            return self._parse_command(user_input)
        
        # 2. 自然语言：使用 LLM 转换（如果可用）
        if self.llm_service:
            return await self._parse_natural_language(user_input, context)
        else:
            # LLM 不可用时，尝试简单的关键词匹配
            return self._fallback_parse(user_input)
    
    def _parse_command(self, command: str) -> Intent:
        """解析命令式输入"""
        parts = command.strip().split()
        cmd = parts[0]
        
        # 验证命令
        if not self.plugin_manager.is_command_valid(cmd):
            raise InvalidCommandError(f"Unknown command: {cmd}. Type /help for available commands.")
        
        # 解析参数
        params = self._parse_params(parts[1:], cmd)
        
        return Intent(
            command=cmd,
            params=params,
            source="command",
            confidence=1.0,
            original_input=command
        )
    
    async def _parse_natural_language(self, query: str, context: Dict[str, Any]) -> Intent:
        """使用 LLM 解析自然语言"""
        # TODO: 实现 LLM 调用
        # 这里先返回一个基本的 Intent，后续会实现完整的 LLM 集成
        
        # 临时实现：使用简单的关键词匹配
        return self._fallback_parse(query)
    
    def _fallback_parse(self, query: str) -> Intent:
        """
        降级解析：当 LLM 不可用时使用简单的关键词匹配
        """
        query_lower = query.lower()
        
        # 检测意图
        if any(keyword in query_lower for keyword in ["最新", "latest", "new", "recent"]):
            # 映射到 /latest
            count = 5
            # 尝试提取数字
            import re
            numbers = re.findall(r'\d+', query)
            if numbers:
                count = int(numbers[0])
            
            return Intent(
                command="/latest",
                params={"count": min(count, 20)},
                source="natural_language",
                confidence=0.7,
                original_input=query,
                keywords=self._extract_keywords(query)
            )
        
        elif any(keyword in query_lower for keyword in ["趋势", "热门", "trending", "hot", "popular"]):
            # 映射到 /trending
            return Intent(
                command="/trending",
                params={},
                source="natural_language",
                confidence=0.7,
                original_input=query,
                keywords=self._extract_keywords(query)
            )
        
        elif any(keyword in query_lower for keyword in ["深度", "分析", "deepdive", "analysis", "详细"]):
            # 映射到 /deepdive
            keywords = self._extract_keywords(query)
            topic = " ".join(keywords) if keywords else "AI developments"
            
            return Intent(
                command="/deepdive",
                params={"topic": topic},
                source="natural_language",
                confidence=0.7,
                original_input=query,
                keywords=keywords
            )
        
        else:
            # 默认映射到搜索
            keywords = self._extract_keywords(query)
            
            return Intent(
                command="/search" if keywords else "/latest",
                params={
                    "keywords": keywords,
                    "count": 10
                } if keywords else {"count": 5},
                source="natural_language",
                confidence=0.6,
                original_input=query,
                keywords=keywords
            )
```
### 数据模型

#### 核心设计理念：统一意图模型

无论用户输入的是命令式（如 `/latest 5`）还是自然语言（如 `"最近 OpenAI 有什么新进展？"`），最终都会被转换为**统一的 Intent 模型**，然后由相同的执行流程处理。

```
命令式输入 ──┐
             ├──> 统一 Intent 模型 ──> 统一执行引擎 ──> 结果
自然语言输入 ──┘
```

#### Intent 模型（唯一的数据模型）

```python
# agent-backend/app/models/intent.py

class Intent(BaseModel):
    """统一的用户意图模型"""
    
    # 核心字段（必需）
    command: str                    # 映射到的命令，如 /latest, /search, /trending
    params: Dict[str, Any]          # 命令参数
    
    # 元数据字段（用于日志、分析、可选增强）
    source: str = "command"         # "command" | "natural_language"
    confidence: float = 1.0         # 置信度 0-1（命令式为 1.0）
    original_input: str = ""        # 原始用户输入
    
    # 自然语言增强字段（可选，仅自然语言输入时填充）
    keywords: List[str] = []        # 提取的关键词，如 ["OpenAI", "GPT"]
    time_range: Optional[str] = None  # 时间范围，如 "last 7 days", "this week"
    importance: str = "all"         # 重要性过滤：high, medium, all
    entities: Dict[str, List[str]] = {}  # 实体识别：{"companies": ["OpenAI"], "topics": ["GPT-4"]}
```

**关键点：**
- `source` 字段只是元数据，**不影响执行流程**
- 所有输入最终都转换为相同的 Intent 结构
- 命令式和自然语言走**完全相同的执行路径**
- 自然语言可以选择性地在输出时用 LLM 增强

#### 示例对比

**命令式输入：`/latest 5`**
```python
Intent(
    command="/latest",
    params={"count": 5},
    source="command",
    confidence=1.0,
    original_input="/latest 5"
)
```

**自然语言输入：`"最近 OpenAI 有什么新进展？"`**
```python
Intent(
    command="/search",  # LLM 映射到搜索命令
    params={
        "count": 10,
        "keywords": ["OpenAI"],
        "time_range": "last 7 days",
        "importance": "high"
    },
    source="natural_language",
    confidence=0.95,
    original_input="最近 OpenAI 有什么新进展？",
    keywords=["OpenAI"],
    time_range="last 7 days",
    importance="high",
    entities={"companies": ["OpenAI"]}
)
```

**执行结果：** 两者都调用相同的搜索逻辑，只是参数不同。

### 前端输入处理更新
```typescript
// app/agent/hooks/useAgent.ts

const processCommand = useCallback(async (userInput: string) => {
    const trimmedInput = userInput.trim();
    
    // 添加用户消息
    const userMessage: AgentMessage = {
        id: Date.now().toString(),
        type: "user",
        content: trimmedInput.startsWith('/') 
            ? `user@agent:~$ ${userInput}` //@shanshan
            : userInput,  // 自然语言直接显示
        timestamp: new Date(),
        status: "success",
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setAgentState((prev) => ({ ...prev, status: "processing" }));
    
    try {
        // 统一发送到后端，由 IntentAnalyzer 处理
        const request: AgentRequest = {
            command: trimmedInput,  // 用户输入（命令或自然语言）
            params: {},
            sessionId: "default"
        };
        
        const response = await agentPluginManager.executeCommand(request);
        
        // 处理响应...
    } catch (error) {
        // 错误处理...
    }
}, []);
```

## 三、LLM技术选型对比
### 方案对比表
| 特性 | OpenAI GPT-3.5 | OpenAI GPT-4 | Google Gemini 1.5 Flash | Google Gemini 1.5 Pro | Anthropic Claude 3.5 Sonnet | |------|----------------|--------------|------------------------|----------------------|---------------------------| | 输入价格 | 
0.50/1Mtokens∣5.00/1M tokens | 
0.075/1Mtokens∣1.25/1M tokens | 
3.00/1Mtokens∣∣∗∗输出价格∗∗∣1.50/1M tokens | 
15.00/1Mtokens∣0.30/1M tokens | 
5.00/1Mtokens∣15.00/1M tokens | | 上下文窗口 | 16K tokens | 128K tokens | 1M tokens | 2M tokens | 200K tokens | | 响应速度 | ⭐⭐⭐⭐⭐ 快 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 极快 | ⭐⭐⭐⭐ 快 | ⭐⭐⭐⭐ 快 | | 理解能力 | ⭐⭐⭐⭐ 好 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 好 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐⭐ 优秀 | | 中文支持 | ⭐⭐⭐⭐ 好 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐ 好 | | JSON 模式 | ✅ 支持 | ✅ 支持 | ✅ 支持 | ✅ 支持 | ✅ 支持 | | 免费额度 | ❌ 无 | ❌ 无 | ✅ 1500次/天 | ✅ 50次/天 | ❌ 无 | | SDK 成熟度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

成本对比（月度 3000 次查询）
假设每次查询：

意图分析：500 tokens 输入 + 200 tokens 输出
内容分析：2000 tokens 输入 + 500 tokens 输出
总计：2500 tokens 输入 + 700 tokens 输出 = 3200 tokens/查询
| LLM 方案 | 月度成本 | 备注 | |---------|---------|------| | OpenAI GPT-3.5 | 
5.40∣基础方案∣∣∗∗OpenAIGPT−4∗∗∣44.00 | 高级方案 | | Gemini 1.5 Flash | **
1.01∗∗∣🏆∗∗最便宜∗∗∣∣∗∗Gemini1.5Pro∗∗∣11.63 | 平衡方案 | | Claude 3.5 Sonnet | $17.85 | 高质量方案 |

### 推荐方案
🥇 方案一：Gemini 1.5 Flash（推荐）

优势：
✅ 成本最低：仅 $1.01/月，是 GPT-3.5 的 1/5
✅ 速度最快：响应时间 < 1 秒
✅ 免费额度：1500 次/天，足够开发测试
✅ 超大上下文：1M tokens，可以处理大量文章
✅ 中文优秀：Google 对中文支持很好

劣势：
⚠️ 理解能力略逊于 GPT-4/Claude
⚠️ SDK 相对较新

适用场景：
- 意图分析（快速响应）
- 内容过滤和排序
- 基础摘要生成

代码示例：
```python
import google.generativeai as genai

genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

response = model.generate_content(
    prompt,
    generation_config={
        "temperature": 0.7,
        "max_output_tokens": 1000,
    }
)
```
🥈 方案二：混合方案（最优性价比）
架构：
Gemini 1.5 Flash：意图分析、内容过滤（90% 请求）
Gemini 1.5 Pro：深度分析、趋势洞察（10% 请求）
成本：
月度成本：约 $2-3
性能：快速响应 + 高质量分析
实现：
```python
class LLMService:
    def __init__(self):
        self.flash_model = genai.GenerativeModel('gemini-1.5-flash')
        self.pro_model = genai.GenerativeModel('gemini-1.5-pro')
    
    async def analyze_intent(self, query: str) -> Intent:
        """使用 Flash 快速分析意图"""
        return await self._call_model(self.flash_model, query)
    
    async def deep_analysis(self, articles: List[NewsItem]) -> Analysis:
        """使用 Pro 进行深度分析"""
        return await self._call_model(self.pro_model, articles)
```
🥉 方案三：OpenAI GPT-3.5（备选）
优势：
✅ SDK 最成熟
✅ 社区资源丰富
✅ 文档完善

劣势：
❌ 成本是 Gemini Flash 的 5 倍
❌ 无免费额度

适用场景：
- 需要最稳定的 API
- 团队熟悉 OpenAI 生态

最终推荐
🎯 推荐使用：Gemini 1.5 Flash + Gemini 1.5 Pro 混合方案

理由：
- 成本极低：月度 $2-3，是 GPT-3.5 的一半
- 性能优秀：Flash 速度快，Pro 质量高
- 免费开发：1500 次/天免费额度足够开发测试
- 中文友好：Google 对中文支持优秀
- 可扩展：未来可以无缝切换到其他模型

## 四、Agent架构设计

### 整体架构图
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AgentTerminal Component                                  │  │
│  │  - 接收用户输入（命令 / 自然语言）                             │  │
│  │  - 显示格式化响应                                           │  │
│  │  - 管理会话状态                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/WebSocket
┌──────────────────────────────────────────────────────────────────────┐
│                    Next.js API Layer (Proxy)                         │
│lib/agent/plugin-manager.ts-/api/agent/execute - 转发请求到 Python 后端 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ HTTP
┌─────────────────────────────────────────────────────────────────┐
│                   Python Backend (FastAPI)                      │
|            /agent-backend/app/api/routes/agent.py               |
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Intent Analyzer (意图分析器) agent-backend/app/core    │  │
│  │  - 识别输入类型（命令 vs 自然语言）                        │  │
│  │  - 转换为统一的 Intent 模型                               │  │
│  │  - 支持 LLM 增强（可选）                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│                        统一 Intent 模型                          │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Plugin Manager (插件管理器)                              │  │
│  │  - 根据 Intent.command 路由到对应插件                     │  │
│  │  - 管理插件注册和生命周期                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│           ↓                              ↓                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  News Plugin (统一数据层)                                 │  │
│  │  - 处理所有新闻相关请求                                    │  │
│  │  - 调用 News Collector Service                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│           ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  News Collector Service                                   │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐ │  │
│  │  │ RSS Aggregator │  │ HN API Client  │  │ Cache Layer │ │  │
│  │  └────────────────┘  └────────────────┘  └─────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│           ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LLM Service (抽象层)                                      │  │
│  │  - Gemini 1.5 Flash (意图分析、快速处理)                   │  │
│  │  - Gemini 1.5 Pro (深度分析、洞察生成)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│           ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Context Manager                                          │  │
│  │  - 会话状态管理                                            │  │
│  │  - 用户偏好跟踪                                            │  │
│  │  - 历史记录                                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ RSS Feeds│  │ HN API   │  │ Redis    │  │ Gemini   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
### 核心组件详解

#### 1. Intent Analyzer（意图分析器）

**位置：** `app/core/intent_analyzer.py`

**职责：**
- 统一入口，接收所有用户输入
- 识别输入类型（命令 vs 自然语言）
- 转换为统一的 Intent 模型

**关键方法：**
```python
async def parse_input(user_input: str, context: dict) -> Intent
def _parse_command(command: str) -> Intent
async def _parse_natural_language(query: str, context: dict) -> Intent
def _fallback_parse(query: str) -> Intent
```

**处理流程：**
1. 检查输入是否以 `/` 开头
2. 如果是命令：直接解析为 Intent（置信度 1.0）
3. 如果是自然语言：
   - 优先使用 LLM 分析（如果可用）
   - 降级使用关键词匹配（置信度 0.6-0.7）

#### 2. LLM Service（LLM 服务层）

**位置：** `app/services/llm_service.py`（未来实现）

**职责：**
- 提供统一的 LLM 调用接口
- 支持多个 LLM 提供商（Gemini, OpenAI）
- 处理意图分析、内容分析、洞察生成

**子功能：**
- **Intent Analysis**：分析用户意图，提取参数
- **Content Analysis**：分析文章相关性和重要性
- **Insight Generation**：生成智能摘要和洞察

#### 3. Plugin Manager（插件管理器）
职责：
- 管理所有插件
- 验证和路由命令
- 保持向后兼容
- 保持不变：现有的插件系统继续工作

#### 4. News Collector Service（新闻收集服务）
职责：
- 从多个数据源获取新闻
- 缓存管理
- 数据清洗和标准化

数据源：
RSS Feeds（主要）
Hacker News API（补充）

#### 5. LLM Service（LLM 服务抽象层）
职责：
- 统一 LLM 调用接口
- 支持多个 LLM 提供商
- 错误处理和重试

支持的模型：
- Gemini 1.5 Flash（默认）
- Gemini 1.5 Pro（高级）
- OpenAI GPT-3.5/4（备选）

#### 6. Context Manager（上下文管理器）
职责：
- 管理用户会话
- 跟踪交互历史
- 个性化推荐基础

## 五、工作流程设计
### 流程 1：命令式输入处理

```
用户输入: "/latest 5"
    ↓
Frontend: AgentTerminal
    ↓
Next.js API: /api/agent/execute
    ↓
Python Backend: Intent Analyzer
    ↓
识别: 命令式输入（以 / 开头）
    ↓
解析为 Intent: {
    command: "/latest",
    params: {count: 5},
    source: "command",
    confidence: 1.0
}
    ↓
Plugin Manager
    ↓
根据 Intent.command 找到 News Plugin
    ↓
News Plugin.execute(Intent)
    ↓
News Collector Service
    ↓
RSS Aggregator (检查缓存)
    ↓
返回: 5 篇最新文章
    ↓
格式化输出
    ↓
Frontend: 显示结果
```

**时间：** < 500ms（缓存命中）

### 流程 2：自然语言输入处理（基础版）

```
用户输入: "最近 OpenAI 有什么新进展？"
    ↓
Frontend: AgentTerminal
    ↓
Next.js API: /api/agent/execute
    ↓
Python Backend: Intent Analyzer
    ↓
识别: 自然语言输入（不以 / 开头）
    ↓
LLM 不可用 → 使用关键词匹配
    ↓
解析为 Intent: {
    command: "/search",
    params: {
        keywords: ["openai"],
        count: 10
    },
    source: "natural_language",
    confidence: 0.7,
    keywords: ["openai"]
}
    ↓
Plugin Manager
    ↓
根据 Intent.command 找到 News Plugin
    ↓
News Plugin.execute(Intent)
    ↓
News Collector Service
    ↓
根据 keywords 过滤文章
    ↓
返回: 10 篇相关文章
    ↓
格式化输出
    ↓
Frontend: 显示结果
```

**时间：** < 1 秒（基础版，无 LLM）

### 流程 3：自然语言输入处理（LLM 增强版 - 未来）

```
用户输入: "最近 OpenAI 有什么新进展？"
    ↓
Frontend: AgentTerminal
    ↓
Next.js API: /api/agent/execute
    ↓
Python Backend: Intent Analyzer
    ↓
识别: 自然语言输入
    ↓
调用 LLM Service (Gemini 1.5 Flash)
    ↓
LLM 分析意图: {
    command: "/search",
    params: {
        keywords: ["OpenAI"],
        time_range: "last 7 days",
        importance: "high"
    },
    source: "natural_language",
    confidence: 0.95,
    entities: {"companies": ["OpenAI"]}
}
    ↓
Plugin Manager → News Plugin
    ↓
News Collector Service
    ↓
获取所有文章（缓存）
    ↓
Content Analyzer (Gemini 1.5 Flash) - 可选
    ↓
过滤和排序:
- 匹配关键词 "OpenAI"
- 时间范围: 最近 7 天
- 重要性评分 > 7
    ↓
返回: 10 篇相关文章
    ↓
Insight Generator (Gemini 1.5 Flash) - 可选
    ↓
生成摘要:
"本周 OpenAI 发布了 GPT-4.5，主要改进包括..."
    ↓
格式化输出
    ↓
Frontend: 显示结果
```

**时间：** 2-3 秒（包含 LLM 调用）

### 流程 4：深度分析（/deepdive）

```
用户输入: "/deepdive GPT-4" 或 "深度分析 GPT-4 的最新进展"
    ↓
Intent Analyzer → 识别意图
    ↓
解析为 Intent: {
    command: "/deepdive",
    params: {topic: "GPT-4"},
    source: "command" | "natural_language"
}
    ↓
Plugin Manager → News Plugin
    ↓
News Collector Service
    ↓
获取相关文章（50+ 篇）
    ↓
Content Analyzer (Gemini 1.5 Pro) ← 使用高级模型（未来）
    ↓
深度分析:
- 提取关键信息
- 识别趋势
- 对比分析
- 预测影响
    ↓
Insight Generator (Gemini 1.5 Pro)
    ↓
生成深度报告:
- 技术突破点
- 行业影响
- 竞争态势
- 未来趋势
    ↓
Frontend: 显示详细报告
```

**时间：** 5-8 秒（深度分析，包含 LLM）

## 六、数据源设计
RSS Feeds 配置
```python
# agent-backend/app/config.py

RSS_FEEDS = {
    # AI 公司官方博客
    "openai": {
        "url": "https://openai.com/blog/rss.xml",
        "priority": "high",
        "category": "Company",
    },
    "anthropic": {
        "url": "https://www.anthropic.com/news/rss.xml",
        "priority": "high",
        "category": "Company",
    },
    "google_ai": {
        "url": "https://blog.google/technology/ai/rss/",
        "priority": "high",
        "category": "Company",
    },
    "meta_ai": {
        "url": "https://ai.meta.com/blog/rss/",
        "priority": "high",
        "category": "Company",
    },
    "deepmind": {
        "url": "https://deepmind.google/discover/blog/rss.xml",
        "priority": "high",
        "category": "Company",
    },
    "microsoft_ai": {
        "url": "https://blogs.microsoft.com/ai/feed/",
        "priority": "high",
        "category": "Company",
    },
    
    # 科技媒体
    "techcrunch_ai": {
        "url": "https://techcrunch.com/category/artificial-intelligence/feed/",
        "priority": "medium",
        "category": "Media",
    },
    "mit_tech_review": {
        "url": "https://www.technologyreview.com/topic/artificial-intelligence/feed",
        "priority": "medium",
        "category": "Media",
    },
    "venturebeat_ai": {
        "url": "https://venturebeat.com/category/ai/feed/",
        "priority": "medium",
        "category": "Media",
    },
    "the_verge_ai": {
        "url": "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
        "priority": "medium",
        "category": "Media",
    },
    "ars_technica_ai": {
        "url": "https://arstechnica.com/tag/artificial-intelligence/feed/",
        "priority": "medium",
        "category": "Media",
    },
}
```
Hacker News API 集成
```python
# agent-backend/app/services/hn_client.py

class HackerNewsClient:
    """Hacker News API 客户端"""
    
    BASE_URL = "https://hacker-news.firebaseio.com/v0"
    
    async def get_top_ai_stories(self, limit: int = 20) -> List[NewsItem]:
        """获取 AI 相关的热门故事"""
        # 1. 获取 top stories
        top_stories = await self._fetch_top_stories()
        
        # 2. 过滤 AI 相关
        ai_stories = []
        for story_id in top_stories[:100]:  # 检查前 100 个
            story = await self._fetch_story(story_id)
            if self._is_ai_related(story):
                ai_stories.append(self._convert_to_news_item(story))
            
            if len(ai_stories) >= limit:
                break
        
        return ai_stories
    
    def _is_ai_related(self, story: dict) -> bool:
        """判断是否 AI 相关"""
        ai_keywords = [
            "ai", "artificial intelligence", "machine learning", "ml",
            "deep learning", "neural network", "gpt", "llm", "chatgpt",
            "openai", "anthropic", "google ai", "deepmind"
        ]
        
        title = story.get("title", "").lower()
        return any(keyword in title for keyword in ai_keywords)
```
缓存策略
```python
# agent-backend/app/utils/cache.py

class CacheManager:
    """缓存管理器"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
    
    async def get_rss_feed(self, feed_url: str) -> Optional[List[NewsItem]]:
        """获取缓存的 RSS feed"""
        key = f"rss:{feed_url}"
        cached = await self.redis.get(key)
        if cached:
            return json.loads(cached)
        return None
    
    async def set_rss_feed(self, feed_url: str, articles: List[NewsItem], ttl: int = 1800):
        """缓存 RSS feed（30 分钟）"""
        key = f"rss:{feed_url}"
        await self.redis.setex(
            key,
            ttl,
            json.dumps([article.dict() for article in articles])
        )
    
    async def get_llm_result(self, prompt_hash: str) -> Optional[dict]:
        """获取缓存的 LLM 结果"""
        key = f"
```