@echo off
REM LLM 集成快速设置脚本 (Windows)

echo ==================================
echo LLM 集成设置向导
echo ==================================
echo.

REM 检查是否在正确的目录
if not exist "requirements.txt" (
    echo ❌ 错误: 请在 agent-backend 目录下运行此脚本
    echo    cd agent-backend ^&^& scripts\setup_llm.bat
    exit /b 1
)

REM 步骤 1: 安装依赖
echo 步骤 1/4: 安装依赖包...
echo --------------------------------
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ 依赖安装失败
    exit /b 1
)
echo ✅ 依赖安装完成
echo.

REM 步骤 2: 配置环境变量
echo 步骤 2/4: 配置环境变量...
echo --------------------------------

if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo ✅ 已创建 .env 文件
    ) else (
        echo ❌ 错误: .env.example 文件不存在
        exit /b 1
    )
) else (
    echo ⚠️  .env 文件已存在，跳过创建
)

echo.
echo ⚠️  请手动编辑 .env 文件，配置 GOOGLE_API_KEY
echo.
echo 步骤:
echo 1. 访问: https://makersuite.google.com/app/apikey
echo 2. 登录 Google 账号
echo 3. 点击 'Create API Key'
echo 4. 复制生成的 API Key
echo 5. 编辑 .env 文件，设置 GOOGLE_API_KEY=你的key
echo.
pause

REM 步骤 3: 验证安装
echo.
echo 步骤 3/4: 验证安装...
echo --------------------------------

python -c "import google.generativeai" 2>nul
if errorlevel 1 (
    echo ❌ google-generativeai 未安装
    exit /b 1
) else (
    echo ✅ google-generativeai 已安装
)

python -c "import os; from dotenv import load_dotenv; load_dotenv(); exit(0 if os.getenv('GOOGLE_API_KEY') else 1)" 2>nul
if errorlevel 1 (
    echo ⚠️  GOOGLE_API_KEY 未配置或为空
    echo    请编辑 .env 文件添加你的 API Key
) else (
    echo ✅ GOOGLE_API_KEY 已配置
)

echo.

REM 步骤 4: 运行测试
echo 步骤 4/4: 运行测试...
echo --------------------------------

if exist "scripts\test_llm_setup.py" (
    echo 正在运行测试脚本...
    echo.
    python scripts\test_llm_setup.py
) else (
    echo ⚠️  测试脚本不存在，跳过测试
)

echo.
echo ==================================
echo 设置完成！
echo ==================================
echo.
echo 下一步:
echo 1. 如果测试失败，请检查 .env 文件中的 GOOGLE_API_KEY
echo 2. 运行 'python scripts\test_llm_setup.py' 重新测试
echo 3. 查看 QUICKSTART_LLM.md 了解更多信息
echo.
pause
