# AI Agent 框架对比与原理

## 目录

- [Agent 基本原理](#agent-基本原理)
- [主流框架对比](#主流框架对比)
- [扩展方式详解](#扩展方式详解)
- [框架背后的公司](#框架背后的公司)
- [我们的选择](#我们的选择)

---

## Agent 基本原理

### 什么是 AI Agent？

AI Agent = LLM（大脑）+ Tools（手脚）+ Memory（记忆）+ Planning（规划）

```
用户输入
    ↓
LLM 理解意图
    ↓
选择合适的 Tool
    ↓
执行 Tool 获取结果
    ↓
LLM 整合结果
    ↓
返回给用户
```

### 核心组件

1. **LLM（语言模型）** - 理解和生成文本
2. **Tools（工具）** - 执行具体任务（搜索、计算、API 调用）
3. **Memory（记忆）** - 保存对话历史和上下文
4. **Planning（规划）** - 分解复杂任务，制定执行计划

### 工作流程

```python
# 简化的 Agent 循环
while not task_completed:
    # 1. LLM 分析当前状态
    thought = llm.think(current_state)
    
    # 2. 决定下一步行动
    action = llm.decide_action(thought, available_tools)
    
    # 3. 执行工具
    result = execute_tool(action)
    
    # 4. 更新状态
    current_state.update(result)
    
    # 5. 判断是否完成
    if llm.is_task_done(current_state):
        break

return final_result
```

---

## 主流框架对比

### 1. LangChain - 最流行的框架

**公司**: LangChain Inc. (创业公司)  
**融资**: $35M+ (红杉资本领投)  
**GitHub**: 80K+ stars

#### 使用方式

```python
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain_openai import ChatOpenAI

# 定义工具
tools = [
    Tool(
        name="News",
        func=get_news,
        description="获取最新 AI 新闻"
    ),
    Tool(
        name="Search",
        func=search_news,
        description="搜索特定主题的新闻"
    )
]

# 创建 Agent
llm = ChatOpenAI(model="gpt-4")
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

# 执行
result = agent_executor.invoke({"input": "最近有什么 AI 新闻？"})
```

#### 原理

```
用户: "最近有什么 AI 新闻？"
    ↓
LLM: 思考 → 需要调用 News 工具
    ↓
执行: get_news() → 返回新闻列表
    ↓
LLM: 整理结果 → 生成回复
    ↓
返回: "这是最近的 5 条 AI 新闻..."
```

#### 优势
- ✅ 生态最丰富，预制工具多
- ✅ 文档完善，社区活跃
- ✅ 支持多种 LLM（OpenAI、Anthropic、Google）

#### 劣势
- ❌ 抽象层多，学习曲线陡
- ❌ 版本更新快，API 变化大

---

### 2. AutoGPT - 自主 Agent 先驱

**组织**: Significant Gravitas (开源社区)  
**类型**: 开源项目  
**GitHub**: 160K+ stars (最火)

#### 使用方式

```python
# plugins/news_plugin.py
class NewsPlugin:
    """新闻插件"""
    
    def __init__(self):
        self._name = "NewsPlugin"
        self._version = "1.0"
    
    @command(
        name="get_news",
        description="获取 AI 新闻",
        parameters={
            "count": {"type": "integer", "description": "数量"}
        }
    )
    def get_news(self, count: int = 5) -> str:
        """获取最新新闻"""
        return fetch_news(count)
    
    @command(name="search_news")
    def search_news(self, query: str) -> str:
        """搜索新闻"""
        return search(query)

# 自动发现并加载插件
```

#### 原理

```
目标: "收集本周最重要的 AI 新闻并总结"
    ↓
Agent 自主规划:
  1. 调用 get_news 获取新闻
  2. 分析每条新闻的重要性
  3. 筛选最重要的 5 条
  4. 生成总结报告
    ↓
自动执行所有步骤
    ↓
返回最终报告
```

#### 优势
- ✅ 真正的自主 Agent，无需人工干预
- ✅ 插件系统简单易用
- ✅ 开源免费

#### 劣势
- ❌ 可能陷入循环，消耗大量 token
- ❌ 不够稳定，需要监控

---

### 3. OpenAI Assistants API - 官方方案

**公司**: OpenAI  
**投资**: 微软 $13B  
**发布**: 2023年11月

#### 使用方式

```python
from openai import OpenAI

client = OpenAI()

# 定义函数
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_news",
            "description": "获取最新 AI 新闻",
            "parameters": {
                "type": "object",
                "properties": {
                    "count": {"type": "integer"}
                },
                "required": ["count"]
            }
        }
    }
]

# 创建 Assistant
assistant = client.beta.assistants.create(
    model="gpt-4-turbo",
    tools=tools,
    instructions="你是一个 AI 新闻助手"
)

# 创建对话
thread = client.beta.threads.create()
message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="最近有什么 AI 新闻？"
)

# 运行
run = client.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=assistant.id
)

# 处理 function call
if run.status == "requires_action":
    tool_call = run.required_action.submit_tool_outputs.tool_calls[0]
    if tool_call.function.name == "get_news":
        result = get_news(count=5)
        # 提交结果
        client.beta.threads.runs.submit_tool_outputs(...)
```

#### 原理

```
用户: "最近有什么 AI 新闻？"
    ↓
GPT-4: 分析 → 需要调用 get_news 函数
    ↓
返回: function_call { name: "get_news", arguments: {count: 5} }
    ↓
你的代码: 执行 get_news(5) → 获取结果
    ↓
提交结果给 GPT-4
    ↓
GPT-4: 整理结果 → 生成回复
```

#### 优势
- ✅ 官方支持，稳定可靠
- ✅ 自动管理对话历史
- ✅ 支持文件上传、代码解释器

#### 劣势
- ❌ 只支持 OpenAI 模型
- ❌ 需要处理异步状态
- ❌ 成本较高

---

### 4. LlamaIndex - RAG 专家

**公司**: LlamaIndex Inc. (创业公司)  
**融资**: $8.5M (Greylock Partners)  
**GitHub**: 30K+ stars

#### 使用方式

```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core.tools import QueryEngineTool, FunctionTool
from llama_index.agent.openai import OpenAIAgent

# 1. 创建知识库
documents = SimpleDirectoryReader("./news_data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

# 2. 知识库作为工具
query_tool = QueryEngineTool.from_defaults(
    query_engine=query_engine,
    name="news_database",
    description="搜索新闻数据库"
)

# 3. 函数作为工具
def get_latest_news(count: int = 5) -> str:
    """获取最新新闻"""
    return fetch_news(count)

news_tool = FunctionTool.from_defaults(fn=get_latest_news)

# 4. 创建 Agent
agent = OpenAIAgent.from_tools(
    [query_tool, news_tool],
    verbose=True
)

# 5. 查询
response = agent.chat("OpenAI 最近有什么动态？")
```

#### 原理

```
用户: "OpenAI 最近有什么动态？"
    ↓
Agent: 分析 → 需要搜索知识库
    ↓
调用: query_engine.query("OpenAI 动态")
    ↓
向量检索: 找到相关文档
    ↓
LLM: 基于检索结果生成回答
    ↓
返回: "根据数据库，OpenAI 最近..."
```

#### 优势
- ✅ 专注数据检索和 RAG
- ✅ 向量数据库集成完善
- ✅ 适合知识密集型应用

#### 劣势
- ❌ 学习曲线较陡
- ❌ 主要适用于检索场景

---

### 5. Semantic Kernel - 微软方案

**公司**: Microsoft  
**类型**: 企业级框架  
**GitHub**: 20K+ stars

#### 使用方式

```python
import semantic_kernel as sk
from semantic_kernel.functions import kernel_function

# 创建 Kernel
kernel = sk.Kernel()

# 方式 1: 装饰器定义函数
@kernel_function(
    name="GetNews",
    description="获取 AI 新闻"
)
def get_news(count: int = 5) -> str:
    """获取最新新闻"""
    return fetch_news(count)

# 方式 2: Plugin 类
class NewsPlugin:
    @kernel_function(
        name="search",
        description="搜索新闻"
    )
    def search(self, query: str) -> str:
        return search_news(query)
    
    @kernel_function(name="analyze")
    def analyze(self, news: str) -> str:
        return analyze_news(news)

# 导入插件
kernel.import_plugin_from_object(NewsPlugin(), "news")

# 调用
result = await kernel.invoke("news", "search", query="AI")
```

#### 原理

```
用户: "搜索 AI 相关新闻"
    ↓
Kernel: 解析 → 调用 news.search
    ↓
执行: NewsPlugin.search("AI")
    ↓
返回: 搜索结果
    ↓
Kernel: 可选的后处理
    ↓
返回给用户
```

#### 优势
- ✅ 微软官方支持
- ✅ 支持多语言（C#、Python、Java）
- ✅ 企业级设计，稳定可靠

#### 劣势
- ❌ 社区相对较小
- ❌ 文档不如 LangChain 丰富

---

### 6. CrewAI - 多 Agent 协作

**公司**: CrewAI Inc. (创业公司)  
**融资**: $18M (A16Z 领投)  
**GitHub**: 15K+ stars

#### 使用方式

```python
from crewai import Agent, Task, Crew, Tool

# 定义工具
news_tool = Tool(
    name="News Search",
    func=search_news,
    description="搜索 AI 新闻"
)

analysis_tool = Tool(
    name="News Analysis",
    func=analyze_news,
    description="分析新闻重要性"
)

# 定义 Agent（带角色）
researcher = Agent(
    role="AI 研究员",
    goal="收集最新 AI 资讯",
    tools=[news_tool],
    backstory="专注 AI 领域的资深研究员",
    verbose=True
)

analyst = Agent(
    role="数据分析师",
    goal="分析新闻的重要性和影响",
    tools=[analysis_tool],
    backstory="擅长数据分析和趋势预测"
)

writer = Agent(
    role="内容编辑",
    goal="撰写专业的新闻摘要",
    backstory="资深科技媒体编辑"
)

# 定义任务
task1 = Task(
    description="收集本周最重要的 5 条 AI 新闻",
    agent=researcher,
    expected_output="新闻列表"
)

task2 = Task(
    description="分析每条新闻的重要性和影响",
    agent=analyst,
    expected_output="分析报告"
)

task3 = Task(
    description="撰写一份专业的新闻摘要",
    agent=writer,
    expected_output="新闻摘要"
)

# 创建团队
crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[task1, task2, task3],
    verbose=True
)

# 执行
result = crew.kickoff()
```

#### 原理

```
任务: "生成本周 AI 新闻报告"
    ↓
Researcher Agent:
  - 搜索新闻
  - 收集 5 条重要新闻
    ↓
Analyst Agent:
  - 接收新闻列表
  - 分析每条新闻
  - 评估重要性
    ↓
Writer Agent:
  - 接收分析结果
  - 撰写专业摘要
  - 生成最终报告
    ↓
返回: 完整的新闻报告
```

#### 优势
- ✅ 多 Agent 协作，适合复杂任务
- ✅ 角色扮演，输出质量高
- ✅ 任务分解清晰

#### 劣势
- ❌ 成本较高（多次 LLM 调用）
- ❌ 执行时间较长

---

## 扩展方式对比

| 框架 | 扩展方式 | 代码示例 | 复杂度 |
|------|---------|---------|--------|
| **LangChain** | Tools | `Tool(name, func, description)` | ⭐⭐⭐ |
| **AutoGPT** | Plugins | `@command` 装饰器 | ⭐⭐ |
| **OpenAI** | Functions | JSON Schema 定义 | ⭐⭐ |
| **LlamaIndex** | Tools/Engines | `FunctionTool.from_defaults()` | ⭐⭐⭐ |
| **Semantic Kernel** | Plugins/Skills | `@kernel_function` | ⭐⭐⭐ |
| **CrewAI** | Tools + Roles | `Tool(name, func)` + Agent | ⭐⭐⭐⭐ |

---

## 框架背后的公司

### 创业公司

| 公司 | 框架 | 融资 | 投资方 | 估值 |
|------|------|------|--------|------|
| **LangChain Inc.** | LangChain | $35M+ | 红杉资本、Benchmark | $200M+ |
| **LlamaIndex Inc.** | LlamaIndex | $8.5M | Greylock Partners | 未公开 |
| **CrewAI Inc.** | CrewAI | $18M | A16Z | 未公开 |

### 科技巨头

| 公司 | 框架 | 优势 |
|------|------|------|
| **OpenAI** | Assistants API | GPT-4、资源雄厚 |
| **Microsoft** | Semantic Kernel | 企业客户、Azure 集成 |
| **Google** | Agent Development Kit | Gemini、搜索生态 |

### 开源社区

| 项目 | Stars | 特点 |
|------|-------|------|
| **AutoGPT** | 160K+ | 最火的 Agent 项目 |

---

## 我们的选择：自建 Agent 系统

### 架构设计

```python
# 我们的系统
LLM API (google.generativeai)
    ↓
LLM Service (llm_service.py)
    ↓
Intent Analyzer (intent_analyzer.py)
    ↓
Plugin Manager (plugin_manager.py)
    ↓
Plugins (news_plugin.py, ...)
```

### 为什么自建？

#### 1. 灵活性
- ✅ 完全控制 Agent 行为
- ✅ 可以随时调整逻辑
- ✅ 不受框架限制

#### 2. 适配性
- ✅ 完美适配现有插件系统
- ✅ 保持代码简洁
- ✅ 易于维护

#### 3. 学习价值
- ✅ 理解 Agent 工作原理
- ✅ 掌握核心技术
- ✅ 可以借鉴其他框架

#### 4. 成本控制
- ✅ 只用需要的功能
- ✅ 减少不必要的 LLM 调用
- ✅ 优化 token 使用

### 我们的实现

```python
# 1. LLM Service - 封装 Gemini API
class GeminiLLMService:
    def __init__(self, api_key: str):
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    async def analyze_intent(self, query: str) -> Intent:
        """使用 LLM 分析用户意图"""
        prompt = self._build_intent_prompt(query)
        response = self.model.generate_content(prompt)
        return self._parse_intent_response(response.text)

# 2. Intent Analyzer - 统一输入处理
class IntentAnalyzer:
    def __init__(self, llm_service):
        self.llm_service = llm_service
    
    async def parse_input(self, user_input: str) -> Intent:
        """将任何输入转换为 Intent"""
        if user_input.startswith('/'):
            # 命令式：直接解析
            return self._parse_command(user_input)
        else:
            # 自然语言：使用 LLM
            return await self.llm_service.analyze_intent(user_input)

# 3. Plugin Manager - 执行 Intent
class PluginManager:
    def execute(self, intent: Intent):
        """根据 Intent 执行对应插件"""
        plugin = self.get_plugin(intent.command)
        return plugin.execute(intent)
```

### 对比框架方案

| 特性 | 框架方案 | 我们的方案 |
|------|---------|-----------|
| **学习曲线** | 需要学习框架 | 直接理解原理 |
| **灵活性** | 受框架限制 | 完全自由 |
| **代码量** | 框架代码多 | 代码简洁 |
| **维护性** | 依赖框架更新 | 自己控制 |
| **性能** | 框架开销 | 最优性能 |
| **成本** | 可能有冗余调用 | 精确控制 |

---

## 总结

### 框架选择建议

| 场景 | 推荐框架 | 原因 |
|------|---------|------|
| **快速原型** | LangChain | 生态丰富，上手快 |
| **企业应用** | Semantic Kernel | 微软支持，稳定 |
| **数据检索** | LlamaIndex | RAG 专家 |
| **多 Agent** | CrewAI | 协作能力强 |
| **自主 Agent** | AutoGPT | 真正的自主性 |
| **官方方案** | OpenAI Assistants | 稳定可靠 |
| **深度定制** | 自建（我们） | 完全控制 |

### 市场趋势

1. **Function Calling 成为标准** - 所有主流 LLM 都支持
2. **多 Agent 协作兴起** - CrewAI 获 $18M 融资
3. **框架整合** - LangChain 整合各种工具
4. **巨头入场** - OpenAI、Google、Microsoft 都推出官方方案
5. **开源力量** - AutoGPT 证明社区创新力

### 我们的优势

✅ **轻量级** - 只依赖 Gemini SDK  
✅ **灵活** - 完全控制逻辑  
✅ **高效** - 精确的 token 使用  
✅ **可扩展** - 插件系统易于扩展  
✅ **可学习** - 理解 Agent 原理  

---

## 参考资源

- [LangChain 文档](https://python.langchain.com/)
- [AutoGPT GitHub](https://github.com/Significant-Gravitas/AutoGPT)
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview)
- [LlamaIndex 文档](https://docs.llamaindex.ai/)
- [Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/)
- [CrewAI 文档](https://docs.crewai.com/)

---

**最后更新**: 2024-11
