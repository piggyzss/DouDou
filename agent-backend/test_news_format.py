#!/usr/bin/env python3
"""
测试新闻输出格式
验证新闻返回时是否包含完整的链接信息
"""

import asyncio
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.news_collector import NewsCollectorService
from app.plugins.news_plugin import NewsPlugin


async def test_news_format():
    """测试新闻输出格式"""
    print("=" * 80)
    print("测试新闻输出格式")
    print("=" * 80)
    print()
    
    # 使用 mock 数据进行测试（避免网络请求）
    print("[INFO] 初始化新闻插件（使用 mock 数据）...")
    plugin = NewsPlugin(use_real_data=False)
    
    # 测试获取最新新闻
    print("[INFO] 测试获取最新新闻...")
    print()
    
    response = await plugin._handle_latest({"count": 3})
    
    if response.success:
        print("[SUCCESS] 新闻获取成功！")
        print()
        print("输出格式：")
        print("-" * 80)
        print(response.data)
        print("-" * 80)
        print()
        
        # 验证是否包含必要的字段
        required_fields = ["Source:", "Abstract:", "Link:"]
        missing_fields = []
        
        for field in required_fields:
            if field not in response.data:
                missing_fields.append(field)
        
        if missing_fields:
            print(f"[WARNING] 缺少以下字段: {', '.join(missing_fields)}")
        else:
            print("[SUCCESS] 所有必要字段都已包含！")
            print("✓ Source (来源)")
            print("✓ Abstract (摘要)")
            print("✓ Link (链接)")
    else:
        print(f"[ERROR] 新闻获取失败: {response.error}")
    
    print()
    print("=" * 80)
    print("测试完成")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_news_format())
