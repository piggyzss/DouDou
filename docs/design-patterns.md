# 设计模式学习文档

## 目录

- [设计原则](#设计原则)
- [项目中使用的设计模式](#项目中使用的设计模式)
- [常用设计模式速查](#常用设计模式速查)

---

## 设计原则

### SOLID 原则
- 单一职责原则：一个类只做一件事
- 开闭原则：对扩展开放，对修改关闭
- 里氏替换原则：子类可以扩展父类功能，但不能改变父类原有的功能
- 接口隔离原则：接口要小而专，不要大而全
- 依赖倒置原则：依赖接口，不依赖具体实现
- 


#### 1. 单一职责原则（Single Responsibility Principle, SRP）

**定义**：一个类应该只有一个引起它变化的原因。

**通俗理解**：一个类只做一件事。

**实际使用**：
- 工厂类：负责创建
- 服务类：负责业务逻辑
- 单例函数：负责实例管理

**项目示例**：

```python
# ✅ 好的设计：职责分离
class LLMService:
    """只负责 LLM 调用"""
    async def analyze_intent(self, query: str) -> Intent:
        pass

class IntentAnalyzer:
    """只负责意图分析逻辑"""
    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
    
    async def parse_input(self, user_input: str) -> Intent:
        pass

class PluginManager:
    """只负责插件管理"""
    def execute(self, intent: Intent):
        pass

# ❌ 不好的设计：职责混乱
class GodClass:
    """一个类做所有事情"""
    def analyze_intent(self):
        pass
    
    def call_llm(self):
        pass
    
    def manage_plugins(self):
        pass
    
    def handle_database(self):
        pass
```

**位置**：
- `app/services/llm_service.py` - LLM 调用
- `app/core/intent_analyzer.py` - 意图分析
- `app/core/plugin_manager.py` - 插件管理

---

#### 2. 开闭原则（Open-Closed Principle, OCP）

**定义**：软件实体应该对扩展开放，对修改关闭。

**通俗理解**：添加新功能时，不修改现有代码，而是扩展代码。

**项目示例**：

```python
# ✅ 好的设计：通过继承扩展
class BasePlugin(ABC):
    """插件基类"""
    @abstractmethod
    async def execute(self, request: AgentRequest) -> AgentResponse:
        pass

# 添加新插件：不修改现有代码，只需继承
class NewsPlugin(BasePlugin):
    async def execute(self, request: AgentRequest):
        # 新闻插件逻辑
        pass

class WeatherPlugin(BasePlugin):  # 新增插件
    async def execute(self, request: AgentRequest):
        # 天气插件逻辑
        pass

# ❌ 不好的设计：修改现有代码
def execute_command(command: str):
    if command == "/news":
        # 新闻逻辑
        pass
    elif command == "/weather":  # 每次添加都要修改这里
        # 天气逻辑
        pass
```

**位置**：
- `app/models/base.py` - BasePlugin 基类
- `app/plugins/news_plugin.py` - 具体插件实现

---

#### 3. 里氏替换原则（Liskov Substitution Principle, LSP）

**定义**：子类必须能够替换其基类。

**通俗理解**：子类可以扩展父类功能，但不能改变父类原有的功能。

**项目示例**：

```python
# ✅ 好的设计：子类可以替换父类
class BaseLLMService(ABC):
    @abstractmethod
    async def analyze_intent(self, query: str) -> Intent:
        """分析意图"""
        pass

class GeminiLLMService(BaseLLMService):
    async def analyze_intent(self, query: str) -> Intent:
        # Gemini 实现
        return Intent(...)

class OpenAILLMService(BaseLLMService):
    async def analyze_intent(self, query: str) -> Intent:
        # OpenAI 实现
        return Intent(...)

# 使用：可以随意替换
llm: BaseLLMService = GeminiLLMService()  # 或 OpenAILLMService()
result = await llm.analyze_intent("query")  # 都能正常工作

# ❌ 不好的设计：子类改变了父类行为
class BadLLMService(BaseLLMService):
    async def analyze_intent(self, query: str) -> str:  # 返回类型变了！
        return "string"  # 违反了父类约定
```

**位置**：
- `app/services/llm_service.py` - BaseLLMService 和实现类

---

#### 4. 接口隔离原则（Interface Segregation Principle, ISP）

**定义**：客户端不应该依赖它不需要的接口。

**通俗理解**：接口要小而专，不要大而全。

**项目示例**：

```python
# ✅ 好的设计：接口分离
class Analyzable(ABC):
    """只有分析功能"""
    @abstractmethod
    async def analyze_intent(self, query: str) -> Intent:
        pass

class Generatable(ABC):
    """只有生成功能"""
    @abstractmethod
    async def generate_text(self, prompt: str) -> str:
        pass

# 类可以实现多个小接口
class GeminiLLMService(Analyzable, Generatable):
    async def analyze_intent(self, query: str) -> Intent:
        pass
    
    async def generate_text(self, prompt: str) -> str:
        pass

# 使用者只依赖需要的接口
class IntentAnalyzer:
    def __init__(self, analyzer: Analyzable):  # 只需要分析功能
        self.analyzer = analyzer

# ❌ 不好的设计：大而全的接口
class LLMInterface(ABC):
    @abstractmethod
    async def analyze_intent(self):
        pass
    
    @abstractmethod
    async def generate_text(self):
        pass
    
    @abstractmethod
    async def translate(self):
        pass
    
    @abstractmethod
    async def summarize(self):
        pass
    # ... 20 个方法

# 使用者被迫依赖不需要的方法
```

---

#### 5. 依赖倒置原则（Dependency Inversion Principle, DIP）

**定义**：高层模块不应该依赖低层模块，两者都应该依赖抽象。

**通俗理解**：依赖接口，不依赖具体实现。

**项目示例**：

```python
# ✅ 好的设计：依赖抽象
class IntentAnalyzer:
    def __init__(self, llm_service: BaseLLMService):  # 依赖抽象
        self.llm_service = llm_service
    
    async def parse_input(self, query: str):
        if self.llm_service:
            return await self.llm_service.analyze_intent(query)

# 可以注入任何实现
analyzer1 = IntentAnalyzer(GeminiLLMService())
analyzer2 = IntentAnalyzer(OpenAILLMService())

# ❌ 不好的设计：依赖具体实现
class IntentAnalyzer:
    def __init__(self):
        self.llm_service = GeminiLLMService()  # 硬编码依赖
    
    async def parse_input(self, query: str):
        return await self.llm_service.analyze_intent(query)

# 无法替换为其他 LLM
```

**位置**：
- `app/core/intent_analyzer.py` - 依赖 BaseLLMService 抽象

---

### 其他重要原则

#### DRY 原则（Don't Repeat Yourself）

**定义**：创建逻辑只写一次，避免代码重复

**项目示例**：

```python
# ✅ 好的设计：工厂模式避免重复
class LLMServiceFactory:
    @staticmethod
    def create_service(provider: str):
        if provider == "google":
            return GeminiLLMService(...)
        elif provider == "openai":
            return OpenAILLMService(...)

# 所有地方统一使用
llm = LLMServiceFactory.create_service(settings.LLM_PROVIDER)

# ❌ 不好的设计：到处重复
# 在 10 个文件中都写：
if settings.LLM_PROVIDER == "google":
    llm = GeminiLLMService(...)
elif settings.LLM_PROVIDER == "openai":
    llm = OpenAILLMService(...)
```

---

## 项目中使用的设计模式

### 1. 工厂模式（Factory Pattern）

**目的**：封装对象创建逻辑，使创建过程与使用过程分离。

**使用场景**：根据配置创建不同的 LLM 服务。

**项目实现**：

```python
# app/services/llm_service.py

class LLMServiceFactory:
    """LLM 服务工厂"""
    
    @staticmethod
    def create_service(provider: Optional[str] = None) -> Optional[BaseLLMService]:
        """
        创建 LLM 服务实例
        
        Args:
            provider: LLM 提供商 ("google" | "openai" | None)
        
        Returns:
            BaseLLMService 实例或 None
        """
        if provider is None:
            provider = settings.LLM_PROVIDER
        
        if provider == "none" or not provider:
            return None
        
        if provider == "google":
            return GeminiLLMService(
                api_key=settings.GOOGLE_API_KEY,
                model=settings.GEMINI_MODEL_FLASH
            )
        
        elif provider == "openai":
            return OpenAILLMService(
                api_key=settings.OPENAI_API_KEY,
                model=settings.OPENAI_MODEL
            )
        
        else:
            logger.warning(f"Unknown LLM provider: {provider}")
            return None
```

**优势**：
- ✅ 集中管理创建逻辑
- ✅ 易于添加新的 LLM 提供商
- ✅ 使用者不需要知道具体实现
- ✅ 符合开闭原则

**使用示例**：

```python
# 简单使用
llm = LLMServiceFactory.create_service()

# 指定提供商
llm = LLMServiceFactory.create_service("google")
```

---

### 2. 单例模式（Singleton Pattern）

**目的**：确保一个类只有一个实例，并提供全局访问点。

**使用场景**：全局共享的 LLM 服务实例。

**项目实现**：

```python
# app/services/llm_service.py

# 全局 LLM 服务实例
_llm_service: Optional[BaseLLMService] = None

def get_llm_service() -> Optional[BaseLLMService]:
    """获取全局 LLM 服务实例（单例）"""
    global _llm_service
    
    if _llm_service is None:
        _llm_service = LLMServiceFactory.create_service()
    
    return _llm_service
```

**优势**：
- ✅ 节省资源（只创建一次）
- ✅ 避免重复初始化
- ✅ 全局状态一致
- ✅ 统一管理 API 调用

**使用示例**：

```python
# 在任何地方使用
from app.services.llm_service import get_llm_service

llm1 = get_llm_service()  # 第一次创建
llm2 = get_llm_service()  # 返回同一个实例
llm3 = get_llm_service()  # 返回同一个实例

assert llm1 is llm2 is llm3  # True
```

**位置**：`app/services/llm_service.py`

---

### 3. 策略模式（Strategy Pattern）

**目的**：定义一系列算法，把它们封装起来，并使它们可以互相替换。

**使用场景**：Intent Analyzer 根据输入类型选择不同的解析策略。

**项目实现**：

```python
# app/core/intent_analyzer.py

class IntentAnalyzer:
    """意图分析器 - 使用不同策略解析输入"""
    
    def __init__(self, plugin_manager: PluginManager, llm_service=None):
        self.plugin_manager = plugin_manager
        self.llm_service = llm_service
    
    async def parse_input(self, user_input: str, context=None) -> Intent:
        """根据输入类型选择策略"""
        
        # 策略 1: 命令式解析
        if user_input.strip().startswith('/'):
            return self._parse_command(user_input)
        
        # 策略 2: LLM 解析（如果可用）
        if self.llm_service:
            return await self._parse_natural_language(user_input, context)
        
        # 策略 3: 关键词匹配（降级）
        return self._parse_keyword_matching(user_input)
    
    def _parse_command(self, command: str) -> Intent:
        """策略 1: 直接解析命令"""
        pass
    
    async def _parse_natural_language(self, query: str, context) -> Intent:
        """策略 2: 使用 LLM 解析"""
        pass
    
    def _parse_keyword_matching(self, query: str) -> Intent:
        """策略 3: 关键词匹配"""
        pass
```

**优势**：
- ✅ 算法可以自由切换
- ✅ 易于添加新策略
- ✅ 避免大量 if-else
- ✅ 符合开闭原则

**位置**：`app/core/intent_analyzer.py`

---

### 4. 模板方法模式（Template Method Pattern）

**目的**：定义算法骨架，将某些步骤延迟到子类实现。

**使用场景**：插件基类定义执行流程，具体插件实现细节。

**关键点**：
- 策略选择逻辑（简单）
- 策略执行逻辑（复杂）

**项目实现**：

```python
# app/models/base.py

class BasePlugin(ABC):
    """插件基类 - 定义执行模板"""
    
    def __init__(self, name: str, plugin_id: str, description: str):
        self.name = name
        self.id = plugin_id
        self.description = description
    
    # 模板方法：定义执行流程
    async def execute_with_validation(self, request: AgentRequest) -> AgentResponse:
        """执行流程模板"""
        # 1. 验证请求
        if not self._validate_request(request):
            return AgentResponse(
                success=False,
                data="Invalid request",
                type="error"
            )
        
        # 2. 执行具体逻辑（子类实现）
        result = await self.execute(request)
        
        # 3. 后处理
        return self._post_process(result)
    
    def _validate_request(self, request: AgentRequest) -> bool:
        """验证请求（可被子类覆盖）"""
        return True
    
    @abstractmethod
    async def execute(self, request: AgentRequest) -> AgentResponse:
        """具体执行逻辑（子类必须实现）"""
        pass
    
    def _post_process(self, result: AgentResponse) -> AgentResponse:
        """后处理（可被子类覆盖）"""
        return result

# 具体插件
class NewsPlugin(BasePlugin):
    async def execute(self, request: AgentRequest) -> AgentResponse:
        """实现具体的新闻逻辑"""
        pass
```

**优势**：
- ✅ 复用公共代码
- ✅ 控制算法结构
- ✅ 子类只需实现特定步骤
- ✅ 符合开闭原则

**位置**：`app/models/base.py`

---

### 5. 观察者模式（Observer Pattern）

**目的**：定义对象间的一对多依赖，当一个对象状态改变时，所有依赖者都得到通知。

**使用场景**：插件注册和事件通知。

**项目实现**：

```python
# app/core/plugin_manager.py

class PluginManager:
    """插件管理器 - 观察者模式"""
    
    def __init__(self):
        self.plugins: Dict[str, BasePlugin] = {}
        self.observers: List[Callable] = []  # 观察者列表
    
    def register_plugin(self, plugin: BasePlugin):
        """注册插件（通知观察者）"""
        self.plugins[plugin.id] = plugin
        
        # 通知所有观察者
        self._notify_observers("plugin_registered", plugin)
    
    def add_observer(self, observer: Callable):
        """添加观察者"""
        self.observers.append(observer)
    
    def _notify_observers(self, event: str, data: Any):
        """通知所有观察者"""
        for observer in self.observers:
            observer(event, data)

# 使用示例
def on_plugin_event(event: str, data: Any):
    print(f"Event: {event}, Data: {data}")

plugin_manager = PluginManager()
plugin_manager.add_observer(on_plugin_event)
plugin_manager.register_plugin(NewsPlugin())  # 触发通知
```

**优势**：
- ✅ 松耦合
- ✅ 支持广播通信
- ✅ 易于添加新观察者
- ✅ 符合开闭原则

**位置**：`app/core/plugin_manager.py`

---

### 6. 适配器模式（Adapter Pattern）

**目的**：将一个类的接口转换成客户期望的另一个接口。

**使用场景**：统一不同 LLM 的接口。

**项目实现**：

```python
# app/services/llm_service.py
# 1. 定义统一LLM接口（我们想要的接口）
class BaseLLMService(ABC):
    """统一的 LLM 接口"""
    @abstractmethod
    async def analyze_intent(self, query: str) -> Intent:
        pass

# 2. Gemini 适配器（把 Gemini 的接口转换成统一接口）
class GeminiLLMService(BaseLLMService):
    """Gemini 适配器"""
    
    def __init__(self, api_key: str, model: str):
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model)  # Gemini 原生接口
    
    async def analyze_intent(self, query: str) -> Intent:
        """适配 Gemini 接口到统一接口"""
        # 调用 Gemini 原生方法
        response = self.model.generate_content(query)
        
        # 转换为统一的 Intent 格式
        return self._parse_response(response.text)

# 3. OpenAI 适配器（把 OpenAI 的接口转换成统一接口）
class OpenAILLMService(BaseLLMService):
    """OpenAI 适配器"""
    
    def __init__(self, api_key: str, model: str):
        from openai import OpenAI
        self.client = OpenAI(api_key=api_key)  # OpenAI 原生接口
        self.model = model
    
    async def analyze_intent(self, query: str) -> Intent:
        """适配 OpenAI 接口到统一接口"""
        # 调用 OpenAI 原生方法
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": query}]
        )
        
        # 转换为统一的 Intent 格式
        return self._parse_response(response.choices[0].message.content)

# 4. 使用者：不需要知道具体 LLM 的接口！
# app/core/intent_analyzer.py
class IntentAnalyzer:
    def __init__(self, llm_service: Analyzable):  # ← 只依赖统一接口
        self.llm_service = llm_service
    
    async def parse_input(self, query: str) -> Intent:
        if self.llm_service:
            # 统一调用，不需要知道是 Gemini 还是 OpenAI
            return await self.llm_service.analyze_intent(query)

# 5. 使用示例 
# 使用 Gemini
gemini_service = GeminiLLMService(api_key="...")
analyzer1 = IntentAnalyzer(gemini_service)
result1 = await analyzer1.parse_input("query")

# 使用 OpenAI（未来）
openai_service = OpenAILLMService(api_key="...")
analyzer2 = IntentAnalyzer(openai_service)
result2 = await analyzer2.parse_input("query")

# 两者用法完全一样！
```

**优势**：
- ✅ 统一不同接口
- ✅ 不修改原有代码
- ✅ 易于切换实现
- ✅ 符合开闭原则

**位置**：`app/services/llm_service.py`

---

## 常用设计模式速查

### 创建型模式

| 模式 | 目的 | 项目使用 | 位置 |
|------|------|---------|------|
| **工厂模式** | 封装对象创建 | ✅ LLM 服务创建 | `llm_service.py` |
| **单例模式** | 确保唯一实例 | ✅ 全局 LLM 实例 | `llm_service.py` |
| 抽象工厂 | 创建相关对象族 | ❌ 未使用 | - |
| 建造者模式 | 分步骤构建对象 | ❌ 未使用 | - |
| 原型模式 | 克隆对象 | ❌ 未使用 | - |

### 结构型模式

| 模式 | 目的 | 项目使用 | 位置 |
|------|------|---------|------|
| **适配器模式** | 接口转换 | ✅ LLM 接口统一 | `llm_service.py` |
| 桥接模式 | 抽象与实现分离 | ❌ 未使用 | - |
| 组合模式 | 树形结构 | ❌ 未使用 | - |
| 装饰器模式 | 动态添加功能 | ⏳ 可用于日志 | - |
| 外观模式 | 简化接口 | ⏳ 可用于 API | - |
| 享元模式 | 共享对象 | ❌ 未使用 | - |
| 代理模式 | 控制访问 | ❌ 未使用 | - |

### 行为型模式

| 模式 | 目的 | 项目使用 | 位置 |
|------|------|---------|------|
| **策略模式** | 算法可替换 | ✅ 意图解析策略 | `intent_analyzer.py` |
| **模板方法** | 定义算法骨架 | ✅ 插件执行流程 | `base.py` |
| **观察者模式** | 事件通知 | ✅ 插件事件 | `plugin_manager.py` |
| 责任链模式 | 请求传递 | ⏳ 可用于中间件 | - |
| 命令模式 | 请求封装 | ⏳ 可用于命令 | - |
| 迭代器模式 | 遍历集合 | ❌ 未使用 | - |
| 中介者模式 | 对象交互 | ❌ 未使用 | - |
| 备忘录模式 | 保存状态 | ❌ 未使用 | - |
| 状态模式 | 状态转换 | ❌ 未使用 | - |
| 访问者模式 | 操作分离 | ❌ 未使用 | - |

---

## 设计模式使用建议

### 何时使用设计模式？

✅ **应该使用**：
- 代码重复时 → 考虑工厂模式
- 需要全局唯一实例时 → 考虑单例模式
- 算法需要切换时 → 考虑策略模式
- 接口不兼容时 → 考虑适配器模式
- 需要扩展功能时 → 考虑装饰器模式

❌ **不应该使用**：
- 过度设计（YAGNI 原则）（You Aren't Gonna Need It 不要实现你现在不需要的功能）
- 简单问题复杂化
- 为了用而用

### 设计模式的权衡

| 优势 | 劣势 |
|------|------|
| ✅ 提高代码复用性 | ❌ 增加代码复杂度 |
| ✅ 提高可维护性 | ❌ 增加学习成本 |
| ✅ 提高可扩展性 | ❌ 可能过度设计 |
| ✅ 降低耦合度 | ❌ 增加类的数量 |

---

## 学习资源

### 书籍推荐

1. **《设计模式：可复用面向对象软件的基础》** - GoF 经典
2. **《Head First 设计模式》** - 入门友好
3. **《重构：改善既有代码的设计》** - 实践指南

### 在线资源

- [Refactoring.Guru](https://refactoring.guru/design-patterns) - 图文并茂
- [SourceMaking](https://sourcemaking.com/design_patterns) - 详细示例
- [Python Design Patterns](https://python-patterns.guide/) - Python 专用

---

## 更新日志

| 日期 | 模式 | 说明 | 位置 |
|------|------|------|------|
| 2024-11 | 工厂模式 | LLM 服务创建 | `llm_service.py` |
| 2024-11 | 单例模式 | 全局 LLM 实例 | `llm_service.py` |
| 2024-11 | 策略模式 | 意图解析策略 | `intent_analyzer.py` |
| 2024-11 | 适配器模式 | LLM 接口统一 | `llm_service.py` |
| 2024-11 | 模板方法 | 插件执行流程 | `base.py` |
| 2024-11 | 观察者模式 | 插件事件通知 | `plugin_manager.py` |

---

**最后更新**: 2024-11  
**维护者**: 开发团队  
**说明**: 本文档会随着项目发展持续更新
