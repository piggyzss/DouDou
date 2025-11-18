# Python 核心知识

> 本文档记录项目中使用的 Python 核心概念和最佳实践

## 目录

### 一、基础语法
- [变量与数据类型](#变量与数据类型) 🔜
- [控制流](#控制流) 🔜
- [函数](#函数) 🔜

### 二、面向对象编程
- [类与对象](#类与对象) 🔜
- [继承与多态](#继承与多态) 🔜
- [抽象基类（ABC）](#抽象基类abc) ✅
- [魔术方法](#魔术方法) 🔜

### 三、高级特性
- [装饰器](#装饰器) ✅
- [生成器与迭代器](#生成器与迭代器) 🔜
- [上下文管理器](#上下文管理器) ✅
- [元类](#元类) 🔜

### 四、类型系统
- [类型提示](#类型提示) ✅
- [泛型](#泛型) 🔜
- [协议（Protocol）](#协议protocol) 🔜

### 五、异步编程
- [async/await](#asyncawait) ✅
- [并发与并行](#并发与并行) 🔜
- [异步上下文管理器](#异步上下文管理器) 🔜

### 六、模块与包
- [模块导入](#模块导入) 🔜
- [包管理](#包管理) 🔜
- [虚拟环境](#虚拟环境) 🔜

### 七、常用标准库
- [collections](#collections) 🔜
- [itertools](#itertools) 🔜
- [functools](#functools) 🔜
- [dataclasses](#dataclasses) 🔜

### 八、最佳实践
- [代码风格（PEP 8）](#代码风格pep-8) 🔜
- [错误处理](#错误处理) 🔜
- [日志记录](#日志记录) 🔜
- [测试](#测试) 🔜

---

**图例**：
- ✅ 已完成
- 🔜 待添加
- 📝 进行中

---

## 二、面向对象编程

### 抽象基类（ABC）

### 基本概念

**ABC** = Abstract Base Class（抽象基类）

```python
from abc import ABC, abstractmethod

class Animal(ABC):  # 继承 ABC
    @abstractmethod  # 标记抽象方法
    def make_sound(self) -> str:
        pass
```

### 核心特性

| 特性 | 说明 |
|------|------|
| 不能实例化 | `Animal()` 会报错 |
| 强制实现 | 子类必须实现所有抽象方法 |
| 接口定义 | 定义类的契约 |
| 类型检查 | 提供 IDE 智能提示 |

### 使用示例

```python
from abc import ABC, abstractmethod

# 定义接口
class Analyzable(ABC):
    @abstractmethod
    async def analyze_intent(self, query: str) -> Intent:
        pass

# 实现接口
class GeminiService(Analyzable):
    async def analyze_intent(self, query: str) -> Intent:
        return Intent(...)  # 具体实现

# 使用
service = GeminiService()  # ✅ 可以实例化
result = await service.analyze_intent("query")
```

### 错误示例

```python
# ❌ 不能实例化抽象类
service = Analyzable()  
# TypeError: Can't instantiate abstract class

# ❌ 忘记实现抽象方法
class BadService(Analyzable):
    pass  # 没有实现 analyze_intent

service = BadService()  
# TypeError: Can't instantiate abstract class
```

### 项目中的使用

**位置**: `app/services/llm_service.py`

```python
# 定义小接口
class Analyzable(ABC):
    @abstractmethod
    async def analyze_intent(self, query: str) -> Intent:
        pass

class Generatable(ABC):
    @abstractmethod
    async def generate_text(self, prompt: str) -> str:
        pass

# 组合接口
class BaseLLMService(Analyzable, Generatable):
    pass

# 实现
class GeminiLLMService(BaseLLMService):
    async def analyze_intent(self, query: str) -> Intent:
        # 实现
        pass
    
    async def generate_text(self, prompt: str) -> str:
        # 实现
        pass
```

---

## 四、类型系统

### 类型提示

### 基本语法

```python
from typing import Optional, List, Dict, Any

# 函数参数和返回值
def greet(name: str) -> str:
    return f"Hello, {name}"

# 变量类型
age: int = 25
names: List[str] = ["Alice", "Bob"]
config: Dict[str, Any] = {"debug": True}

# 可选类型
def find_user(id: int) -> Optional[User]:
    return user or None
```

### 常用类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `str` | 字符串 | `name: str` |
| `int` | 整数 | `age: int` |
| `float` | 浮点数 | `price: float` |
| `bool` | 布尔值 | `is_active: bool` |
| `List[T]` | 列表 | `names: List[str]` |
| `Dict[K, V]` | 字典 | `config: Dict[str, int]` |
| `Optional[T]` | 可选 | `user: Optional[User]` |
| `Any` | 任意类型 | `data: Any` |

### 类型提示的好处

```python
# ✅ 有类型提示
def process(data: List[str]) -> int:
    return len(data)

result = process(["a", "b"])  # IDE 知道 result 是 int
result.upper()  # IDE 会警告：int 没有 upper 方法

# ❌ 没有类型提示
def process(data):
    return len(data)

result = process(["a", "b"])  # IDE 不知道 result 是什么类型
result.upper()  # 运行时才报错
```

### TYPE_CHECKING

避免循环导入：

```python
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..services.llm_service import Analyzable

class IntentAnalyzer:
    def __init__(self, llm_service: 'Analyzable'):  # 字符串形式
        self.llm_service = llm_service
```

---

## 三、高级特性

### 装饰器

### 基本概念

装饰器是修改函数或类行为的语法糖。

```python
# 定义装饰器
def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Finished {func.__name__}")
        return result
    return wrapper

# 使用装饰器
@log_calls
def greet(name: str) -> str:
    return f"Hello, {name}"

# 等价于
greet = log_calls(greet)
```

### 常用装饰器

#### @property

```python
class User:
    def __init__(self, first_name: str, last_name: str):
        self._first_name = first_name
        self._last_name = last_name
    
    @property
    def full_name(self) -> str:
        """像属性一样访问"""
        return f"{self._first_name} {self._last_name}"

user = User("John", "Doe")
print(user.full_name)  # 不需要括号
```

#### @staticmethod

```python
class MathUtils:
    @staticmethod
    def add(a: int, b: int) -> int:
        """不需要 self，可以直接调用"""
        return a + b

result = MathUtils.add(1, 2)  # 不需要实例化
```

#### @classmethod

```python
class User:
    count = 0
    
    def __init__(self, name: str):
        self.name = name
        User.count += 1
    
    @classmethod
    def get_count(cls) -> int:
        """访问类变量"""
        return cls.count

user1 = User("Alice")
user2 = User("Bob")
print(User.get_count())  # 2
```

#### @abstractmethod

```python
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def make_sound(self) -> str:
        """子类必须实现"""
        pass
```

### 项目中的使用

**位置**: `app/config.py`

```python
class Settings(BaseSettings):
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
```

---

## 五、异步编程

### async/await

```python
import asyncio

# 定义异步函数
async def fetch_data(url: str) -> dict:
    await asyncio.sleep(1)  # 模拟 IO 操作
    return {"data": "result"}

# 调用异步函数
async def main():
    result = await fetch_data("https://api.example.com")
    print(result)

# 运行
asyncio.run(main())
```

### 异步 vs 同步

```python
# 同步（阻塞）
def sync_function():
    time.sleep(1)  # 阻塞 1 秒
    return "done"

# 异步（非阻塞）
async def async_function():
    await asyncio.sleep(1)  # 不阻塞，可以做其他事
    return "done"
```

### 并发执行

```python
import asyncio

async def task1():
    await asyncio.sleep(1)
    return "Task 1"

async def task2():
    await asyncio.sleep(1)
    return "Task 2"

# 并发执行（总共 1 秒）
async def main():
    results = await asyncio.gather(
        task1(),
        task2()
    )
    print(results)  # ["Task 1", "Task 2"]

asyncio.run(main())
```

### 项目中的使用

**位置**: `app/services/llm_service.py`

```python
class GeminiLLMService:
    async def analyze_intent(self, query: str) -> Intent:
        """异步方法"""
        response = await self._call_gemini(query)
        return self._parse_response(response)
    
    async def _call_gemini(self, query: str) -> str:
        """异步 API 调用"""
        response = self.model.generate_content(query)
        return response.text
```

**位置**: `app/core/intent_analyzer.py`

```python
class IntentAnalyzer:
    async def parse_input(self, user_input: str) -> Intent:
        """异步解析"""
        if self.llm_service:
            return await self.llm_service.analyze_intent(user_input)
        return self._parse_keyword_matching(user_input)
```

### 上下文管理器

```python
# 使用 with 语句
with open("file.txt", "r") as f:
    content = f.read()
# 文件自动关闭

# 自定义上下文管理器
class DatabaseConnection:
    def __enter__(self):
        self.conn = connect_to_db()
        return self.conn
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()

with DatabaseConnection() as conn:
    conn.execute("SELECT * FROM users")
# 连接自动关闭
```

---

## 八、最佳实践

### 常用设计模式

#### 单例模式

```python
_instance = None

def get_instance():
    global _instance
    if _instance is None:
        _instance = MyClass()
    return _instance
```

**项目使用**: `app/services/llm_service.py`

```python
_llm_service: Optional[BaseLLMService] = None

def get_llm_service() -> Optional[BaseLLMService]:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMServiceFactory.create_service()
    return _llm_service
```

---

## 学习资源

### 官方文档

- [Python 官方文档](https://docs.python.org/3/)
- [typing 模块](https://docs.python.org/3/library/typing.html)
- [abc 模块](https://docs.python.org/3/library/abc.html)
- [asyncio 模块](https://docs.python.org/3/library/asyncio.html)

### 推荐阅读

- **《Fluent Python》** - Python 进阶
- **《Effective Python》** - 最佳实践
- **《Python Cookbook》** - 实用技巧

---

**最后更新**: 2024-11  
**维护者**: 开发团队
