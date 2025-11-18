# LLM 集成快速开始

## 快速安装

### Docker 方式（推荐）

```bash
cd agent-backend
bash docker/setup_llm_docker.sh
```

自动完成：配置环境 → 构建镜像 → 启动服务 → 运行测试

### 本地方式

```bash
cd agent-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env，添加 GOOGLE_API_KEY
python scripts/verify_stage1.py
```

## 配置 API Key

访问 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取免费 API Key（1500 次/天）

编辑 `.env` 文件：
```bash
GOOGLE_API_KEY=你的_API_Key
LLM_PROVIDER=google
ENABLE_INTENT_ANALYSIS=true
```



## 故障排除

| 问题 | 解决方案 |
|------|---------|
| `externally-managed-environment` | 使用虚拟环境：`python3 -m venv venv && source venv/bin/activate` |
| `ModuleNotFoundError: google.generativeai` | `pip install google-generativeai==0.3.2` |
| `LLM service not available` | 检查 `.env` 文件中的 `GOOGLE_API_KEY` 和 `LLM_PROVIDER=google` |
| API 调用失败 | 访问 [Google AI Studio](https://makersuite.google.com/app/apikey) 验证 Key |

## 验证

**Docker:**
```bash
docker compose -f docker/docker-compose.dev.yml exec agent-backend python scripts/verify_stage1.py
```

**本地:**
```bash
python scripts/verify_stage1.py
```

看到 "✅ 阶段 1 验证通过！" 即可继续阶段 2。

## 常用命令

**Docker:**
```bash
# 查看日志
docker compose -f docker/docker-compose.dev.yml logs -f agent-backend

# 停止/重启
docker compose -f docker/docker-compose.dev.yml down
docker compose -f docker/docker-compose.dev.yml restart agent-backend
```

**本地:**
```bash
# 启动服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
