# Agent Backend Scripts

这个目录包含用于开发、测试和维护 Agent 后端的实用脚本。

## 📋 脚本列表

### 🧪 测试脚本

#### `quick_test.sh`
快速测试脚本，用于验证 Agent 后端的基本功能。

**用途**：
- 测试 API 端点可用性
- 验证 ReactAgent 执行
- 检查工具和插件列表

**使用方法**：
```bash
cd agent-backend
./scripts/quick_test.sh
```

#### `verify-database.sh`
数据库验证脚本，用于检查 Agent 数据库表和数据。

**用途**：
- 验证数据库连接
- 检查表结构
- 查看会话和对话数据
- 测试数据存储功能

**使用方法**：
```bash
cd agent-backend
./scripts/verify-database.sh
```

**输出内容**：
- 数据库连接信息
- agent_sessions 表数据
- agent_conversations 表数据
- 会话统计信息

---

### 🔧 设置脚本

#### `setup_llm.sh`
LLM 服务设置脚本，用于配置和测试 LLM 连接。

**用途**：
- 配置 Google Gemini API
- 测试 API 连接
- 验证模型可用性

**使用方法**：
```bash
cd agent-backend
./scripts/setup_llm.sh
```

#### `quick_install.sh`
快速安装脚本，用于设置开发环境。

**用途**：
- 安装 Python 依赖
- 配置环境变量
- 初始化数据库

**使用方法**：
```bash
cd agent-backend
./scripts/quick_install.sh
```

---

### 🐍 Python 测试脚本

#### `test_llm_setup.py`
LLM 设置测试脚本，用于验证 LLM 服务配置。

**用途**：
- 测试 API Key 有效性
- 验证模型响应
- 检查配置正确性

**使用方法**：
```bash
cd agent-backend
python scripts/test_llm_setup.py
```

#### `test_gemini_models.py`
Gemini 模型测试脚本，用于测试不同的 Gemini 模型。

**用途**：
- 测试多个 Gemini 模型
- 比较模型性能
- 验证模型可用性

**使用方法**：
```bash
cd agent-backend
python scripts/test_gemini_models.py
```

---

## 🚀 常用工作流

### 初次设置
```bash
# 1. 安装依赖和配置环境
./scripts/quick_install.sh

# 2. 设置 LLM 服务
./scripts/setup_llm.sh

# 3. 验证数据库
./scripts/verify-database.sh

# 4. 运行快速测试
./scripts/quick_test.sh
```

### 日常开发
```bash
# 快速测试功能
./scripts/quick_test.sh

# 检查数据库状态
./scripts/verify-database.sh

# 测试 LLM 连接
python scripts/test_llm_setup.py
```

### 故障排查
```bash
# 1. 验证数据库连接
./scripts/verify-database.sh

# 2. 测试 LLM 服务
python scripts/test_llm_setup.py

# 3. 运行完整测试
./scripts/quick_test.sh
```

---

## 📝 注意事项

1. **执行权限**：确保脚本有执行权限
   ```bash
   chmod +x scripts/*.sh
   ```

2. **工作目录**：大多数脚本需要在 `agent-backend` 目录下执行

3. **环境变量**：确保 `.env` 文件配置正确，特别是：
   - `DATABASE_URL` 或 `POSTGRES_URL`
   - `GOOGLE_API_KEY`

4. **Docker 环境**：某些脚本可能需要 Docker 服务运行

---

## 🔗 相关文档

- [Agent Backend README](../README.md) - 主要文档
- [Database Setup Guide](../DATABASE_SETUP.md) - 数据库设置指南
- [Docker Guide](../../docs/docker-guide.md) - Docker 使用指南
