# Agent Backend 测试指南

## 📋 测试脚本索引

### 可用的测试脚本

| 脚本 | 说明 | 用途 |
|-----|------|------|
| `test_gemini_stream.py` | Gemini API 流式输出测试 | 验证 `stream=True` 参数是否工作 |
| `test_streaming_complete.py` | 完整流式链路测试 | 测试从 LLM 到 API 的完整流式输出 |
| `test_reflection_engine.py` | 反思引擎测试 | 测试 ReflectionEngine 的评估功能 |

### 测试脚本说明

#### 1. test_gemini_stream.py

**功能**: 测试 Gemini API 的 `stream=True` 参数

**运行方式**:
```bash
cd agent-backend
python test_gemini_stream.py
```

**测试内容**:
- 基本流式输出
- 流式 vs 非流式性能对比
- 首块响应时间测量

**预期输出**:
```
============================================================
测试: Gemini API stream=True 参数
============================================================
✅ Gemini API 已配置

提示词: 请用一句话介绍什么是人工智能。

流式输出 (stream=True):
------------------------------------------------------------
人工智能是...（逐字显示）
------------------------------------------------------------

✅ 流式输出成功!
   - 总块数: 15
   - 总字符数: 120
```

#### 2. test_streaming_complete.py

**功能**: 测试完整的 SSE 流式链路

**运行方式**:
```bash
cd agent-backend
python test_streaming_complete.py
```

**测试内容**:
- LLM Service 流式生成
- ReAct Agent 流式回调
- 事件类型验证

**预期输出**:
```
============================================================
测试 2: ReAct Agent 流式回调
============================================================
✅ ReAct Agent 已初始化

查询: 你好，请介绍一下你自己

流式事件:
------------------------------------------------------------
（实时显示思考过程）

🔧 行动: echo - {...}
✅ 观察: 成功

（实时显示最终响应）
------------------------------------------------------------

✅ ReAct Agent 执行成功!
   - 总事件数: 25
   - 步骤数: 1
   - 执行时间: 3.45s
```

#### 3. test_reflection_engine.py

**功能**: 测试反思引擎的评估功能

**运行方式**:
```bash
cd agent-backend
python test_reflection_engine.py
```

**测试内容**:
- 输出质量评估
- 完整性评分
- 改进建议生成

## 🧪 测试场景

### 场景 1: 验证流式输出功能

```bash
# 1. 测试 Gemini API
python test_gemini_stream.py

# 2. 测试完整链路
python test_streaming_complete.py
```

### 场景 2: 测试 API 端点

```bash
# 1. 启动服务
uvicorn app.main:app --reload --port 8000

# 2. 测试 SSE 端点
curl -N -X POST http://localhost:8000/api/agent/stream \
  -H "Content-Type: application/json" \
  -d '{"input": "你好"}'
```

### 场景 3: 测试反思引擎

```bash
python test_reflection_engine.py
```

## 📊 测试结果解读

### 成功标准

**test_gemini_stream.py**:
- ✅ 能接收到多个文本块（> 1）
- ✅ 首块响应时间 < 1秒
- ✅ 流式比非流式快 80%+

**test_streaming_complete.py**:
- ✅ 接收到所有事件类型
- ✅ 思考过程实时显示
- ✅ 最终响应完整

**test_reflection_engine.py**:
- ✅ 评分合理（0-10）
- ✅ 能识别缺失信息
- ✅ 提供改进建议

### 常见问题

#### 问题 1: "LLM 服务不可用"

**原因**: 未设置 GOOGLE_API_KEY

**解决**:
```bash
export GOOGLE_API_KEY=your_api_key
```

#### 问题 2: "只接收到1个块"

**原因**: 流式输出未正确实现

**检查**:
- `llm_service.py` 中的 `stream=True` 参数
- `_call_gemini_stream()` 方法实现

#### 问题 3: "API 连接失败"

**原因**: 后端服务未启动

**解决**:
```bash
cd agent-backend
uvicorn app.main:app --reload --port 8000
```

## 🔧 开发测试

### 添加新测试

1. 在 `agent-backend/` 目录下创建 `test_*.py` 文件
2. 遵循现有测试的结构
3. 添加清晰的文档字符串
4. 更新本文档

### 测试最佳实践

1. **独立性**: 每个测试应该独立运行
2. **清晰性**: 输出应该清晰易懂
3. **完整性**: 包含成功和失败场景
4. **文档化**: 添加注释和说明

## 📚 相关文档

- [SSE 流式输出指南](docs/SSE_STREAMING_GUIDE.md) - 完整的流式输出实现指南
- [系统设计文档](DESIGN.md) - ReAct Agent 系统设计
- [部署说明](DEPLOYMENT.md) - 部署和运维指南
- [项目 README](README.md) - 项目概述和快速开始

## 🚀 快速开始

```bash
# 1. 安装依赖
pip install -r requirements.txt

# 2. 设置环境变量
export GOOGLE_API_KEY=your_api_key

# 3. 运行测试
python test_gemini_stream.py
python test_streaming_complete.py

# 4. 启动服务
uvicorn app.main:app --reload --port 8000

# 5. 测试 API
curl -N -X POST http://localhost:8000/api/agent/stream \
  -H "Content-Type: application/json" \
  -d '{"input": "你好"}'
```

---

**最后更新**: 2025-01-02  
**维护者**: Agent Backend Team
