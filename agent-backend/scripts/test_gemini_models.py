#!/usr/bin/env python3
"""测试 Gemini 可用模型"""
import os
import sys

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import google.generativeai as genai

# 从环境变量获取 API Key
api_key = os.getenv("GOOGLE_API_KEY", "AIzaSyDDaxw5iTXzDX3N2z3CbYsCBECT9xqiXHI")
genai.configure(api_key=api_key)

print("=== 可用的 Gemini 模型 ===\n")

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"模型名称: {model.name}")
        print(f"支持的方法: {model.supported_generation_methods}")
        print(f"描述: {model.description}")
        print("-" * 60)

print("\n=== 测试模型调用 ===\n")

# 测试不同的模型名称格式
test_models = [
    "gemini-1.5-flash",
    "models/gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "models/gemini-1.5-flash-latest",
]

for model_name in test_models:
    try:
        print(f"测试模型: {model_name}")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say hello")
        print(f"✓ 成功: {response.text[:50]}...")
        print()
    except Exception as e:
        print(f"✗ 失败: {e}")
        print()
