# SSE 流式输出完整指南

## 概述

本项目已实现完整的 Server-Sent Events (SSE) 流式输出功能,从 Gemini API 到前端的完整链路都支持流式传输。

## 架构层次

```
┌─────────────────────────────────────────────────────────────┐
│                         前端 (React)                         │
│  - EventSource API 接收 SSE 事件                             │
│  - 实时更新 UI (思考过程、行动、观察、最终响应)                │
└─────────────────────────────────────────────────────────────┘
                              ↑
                              │ SSE Events
                              │
┌─────────────────────────────────────────────────────────────┐
│                    API 路由 (FastAPI)                        │
│  - /api/agent/stream 端点                                    │
│  - StreamingResponse 生成 SSE 事件流                         │
│  - 异步队列管理事件                                           │
└─────────────────────────────────────────────────────────────┘
                              ↑
                              │ Callback Events
                              │
┌─────────────────────────────────────────────────────────────┐
│                    ReAct Agent                               │
│  - streaming_callback 参数                                   │
│  - 发送事件: thought_chunk, action, observation, response_chunk│
└─────────────────────────────────────────────────────────────┘
                              ↑
                              │ Stream Chunks
                              │
┌─────────────────────────────────────────────────────────────┐
│                    LLM Service                               │
│  - generate_text_stream() 异步生成器                         │
│  - 逐块返回 LLM 响应                                          │
└─────────────────────────────────────────────────────────────┘
                              ↑
                              │ stream=True
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Gemini API                                │
│  - stream=True 参数开启流式输出                               │
│  - 逐块生成响应内容                                           │
└─────────────────────────────────────────────────────────────┘
```

## 关键代码位置

### 1. Gemini API 流式调用

**文件**: `agent-backend/app/services/llm_service.py`

```python
async def _call_gemini_stream(
    self,
    prompt: str,
    temperature: float = 0.7,
    max_tokens: int = 1000,
    response_format: str = "text",
    max_retries: int = 3,
    timeout: float = 30.0
):
    """流式调用 Gemini API"""
    # 使用 stream=True 开启流式输出
    response_stream = self.model.generate_content(
        prompt_with_format,
        generation_config=generation_config,
        stream=True  # 关键参数
    )
    
    # 流式处理响应
    for chunk in response_stream:
        if chunk.text:
            yield chunk.text
            await asyncio.sleep(0.05)  # 50ms 延迟
```

### 2. LLM Service 流式接口

**文件**: `agent-backend/app/services/llm_service.py`

```python
async def generate_text_stream(self, prompt: str, **kwargs):
    """流式生成文本（异步生成器）"""
    if not self.is_available():
        raise LLMServiceError("Gemini service not available")
    
    try:
        async for chunk in self._call_gemini_stream(prompt, **kwargs):
            yield chunk
    except Exception as e:
        logger.error(f"Streaming text generation failed: {e}")
        raise LLMServiceError(f"Streaming text generation failed: {e}")
```

### 3. ReAct Agent 流式回调

**文件**: `agent-backend/app/core/react_agent.py`

```python
async def _generate_thought_and_action(
    self,
    query: str,
    plan: ExecutionPlan,
    history: List[ReActStep],
    context: Dict[str, Any],
    iteration: int,
    streaming_callback: Optional[Any] = None
) -> tuple[str, ToolCall]:
    """使用 LLM 生成思考和选择行动"""
    
    # 如果有流式回调，使用流式生成
    if streaming_callback:
        response = ""
        async for chunk in self.llm_service.generate_text_stream(
            prompt,
            temperature=0.7,
            max_tokens=500
        ):
            response += chunk
            # 实时发送思考块
            await streaming_callback("thought_chunk", {
                "step_number": iteration,
                "chunk": chunk
            })
    else:
        # 非流式调用
        response = await self.llm_service.generate_text(
            prompt,
            temperature=0.7,
            max_tokens=500
        )
```

### 4. API 路由 SSE 端点

**文件**: `agent-backend/app/api/routes/agent.py`

```python
@router.post("/stream")
async def stream_execution(request: AgentRequest):
    """流式执行自然语言查询（Server-Sent Events）"""
    
    async def event_generator():
        """生成 SSE 事件流"""
        # 创建流式回调队列
        event_queue = asyncio.Queue()
        
        # 定义流式回调函数
        async def streaming_callback(event_type: str, data: dict):
            """接收来自 Agent 的流式事件"""
            await event_queue.put({
                'type': event_type,
                **data
            })
        
        # 执行 Agent
        result = await react_agent.execute(
            query=user_input,
            session_id=session_id,
            context=request.context or {},
            streaming_callback=streaming_callback
        )
        
        # 流式发送事件
        while True:
            event = await event_queue.get()
            if event is None:
                break
            yield f"data: {json.dumps(event)}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
```

## SSE 事件类型

### 1. `start`
执行开始
```json
{
  "type": "start",
  "message": "Starting execution..."
}
```

### 2. `thought_chunk`
思考过程的文本块（实时流式）
```json
{
  "type": "thought_chunk",
  "step_number": 1,
  "chunk": "我需要..."
}
```

### 3. `action`
选择的行动
```json
{
  "type": "action",
  "step_number": 1,
  "tool_name": "get_news",
  "parameters": {"category": "AI"},
  "thought": "完整的思考内容"
}
```

### 4. `observation`
工具执行结果
```json
{
  "type": "observation",
  "step_number": 1,
  "success": true,
  "data": {...}
}
```

### 5. `response_chunk`
最终响应的文本块（实时流式）
```json
{
  "type": "response_chunk",
  "chunk": "根据..."
}
```

### 6. `complete`
执行完成
```json
{
  "type": "complete",
  "success": true,
  "evaluation": {
    "completeness_score": 9,
    "quality_score": 8,
    "missing_info": []
  },
  "execution_time": 3.45
}
```

### 7. `error`
执行错误
```json
{
  "type": "error",
  "error": "错误信息"
}
```

## 测试方法

### 1. 测试 Gemini API 流式输出

```bash
cd agent-backend
python test_gemini_stream.py
```

这个测试会:
- 验证 `stream=True` 参数是否工作
- 对比流式和非流式的性能差异
- 显示首块响应时间

### 2. 测试完整流式链路

```bash
cd agent-backend
python test_streaming_complete.py
```

这个测试会:
- 测试 LLM Service 的流式生成
- 测试 ReAct Agent 的流式回调
- 提供 API 测试命令

### 3. 测试 API 端点

使用 curl:
```bash
curl -N -X POST http://localhost:8000/api/agent/stream \
  -H "Content-Type: application/json" \
  -d '{"input": "你好，请介绍一下你自己"}'
```

使用 Python:
```python
import requests
import json

url = "http://localhost:8000/api/agent/stream"
data = {"input": "你好，请介绍一下你自己"}

response = requests.post(url, json=data, stream=True)

for line in response.iter_lines():
    if line:
        line = line.decode('utf-8')
        if line.startswith('data: '):
            event_data = json.loads(line[6:])
            print(event_data)
```

## 前端集成

### React 示例

```typescript
const useAgentStream = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const executeStream = async (input: string) => {
    setIsStreaming(true);
    setEvents([]);

    const eventSource = new EventSource(
      `/api/agent/stream?input=${encodeURIComponent(input)}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      setEvents((prev) => [...prev, data]);

      // 处理不同类型的事件
      switch (data.type) {
        case 'thought_chunk':
          // 实时显示思考过程
          updateThought(data.step_number, data.chunk);
          break;
        case 'action':
          // 显示选择的行动
          showAction(data.tool_name, data.parameters);
          break;
        case 'observation':
          // 显示执行结果
          showObservation(data.success, data.data);
          break;
        case 'response_chunk':
          // 实时显示最终响应
          appendResponse(data.chunk);
          break;
        case 'complete':
          // 执行完成
          setIsStreaming(false);
          eventSource.close();
          break;
        case 'error':
          // 处理错误
          showError(data.error);
          setIsStreaming(false);
          eventSource.close();
          break;
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setIsStreaming(false);
      eventSource.close();
    };
  };

  return { events, isStreaming, executeStream };
};
```

## 性能优化

### 1. 延迟控制

在 `llm_service.py` 中调整延迟:
```python
# 思考过程：50ms 延迟（更慢，让用户看清推理过程）
await asyncio.sleep(0.05)

# 最终响应：30ms 延迟（稍快，但仍有打字机效果）
await asyncio.sleep(0.03)
```

### 2. 缓冲控制

在 API 响应头中禁用缓冲:
```python
headers={
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"  # 禁用 Nginx 缓冲
}
```

### 3. 队列管理

使用异步队列管理事件:
```python
event_queue = asyncio.Queue()

# 生产者
await event_queue.put(event)

# 消费者
event = await event_queue.get()
```

## 故障排查

### 问题 1: 流式输出不工作

**检查点**:
1. Gemini API 是否支持 `stream=True`
2. LLM Service 是否正确实现 `generate_text_stream()`
3. ReAct Agent 是否传递 `streaming_callback`
4. API 路由是否返回 `StreamingResponse`

**解决方法**:
```bash
# 运行测试脚本
python test_gemini_stream.py
python test_streaming_complete.py
```

### 问题 2: 前端收不到事件

**检查点**:
1. 是否使用 `EventSource` API
2. URL 是否正确
3. CORS 配置是否正确
4. 浏览器是否支持 SSE

**解决方法**:
```javascript
// 检查浏览器支持
if (typeof EventSource !== 'undefined') {
  // 支持 SSE
} else {
  // 不支持，使用轮询
}
```

### 问题 3: 延迟太高

**检查点**:
1. 网络延迟
2. Gemini API 响应速度
3. 代码中的 `asyncio.sleep()` 延迟

**解决方法**:
```python
# 减少延迟
await asyncio.sleep(0.01)  # 从 50ms 减少到 10ms
```

## 最佳实践

1. **错误处理**: 始终处理流式传输中的错误
2. **超时控制**: 设置合理的超时时间
3. **资源清理**: 确保 EventSource 正确关闭
4. **用户反馈**: 显示加载状态和进度
5. **降级方案**: 提供非流式的备选方案

## 下一步

1. ✅ Gemini API `stream=True` 已实现
2. ✅ LLM Service 流式接口已实现
3. ✅ ReAct Agent 流式回调已实现
4. ✅ API 路由 SSE 端点已实现
5. ⏳ 前端 EventSource 集成 (待实现)
6. ⏳ UI 实时更新组件 (待实现)

## 参考资料

- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [FastAPI StreamingResponse](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse)
- [Gemini API Streaming](https://ai.google.dev/gemini-api/docs/text-generation?lang=python#generate-a-text-stream)
