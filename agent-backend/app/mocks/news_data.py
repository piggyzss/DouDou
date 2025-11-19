"""
Mock 新闻数据
用于测试和降级场景
"""
from datetime import datetime, timedelta
from ..models.news import NewsItem, TrendingTopic


def get_mock_news() -> list:
    """获取 Mock 新闻数据"""
    now = datetime.now()
    
    return [
        NewsItem(
            title="OpenAI releases GPT-4.5 with enhanced reasoning",
            summary="New model shows 40% improvement in complex reasoning tasks and mathematical problem solving.",
            url="https://openai.com/blog/gpt-4-5-enhanced-reasoning",
            source="OpenAI Official Blog",
            publish_time=(now - timedelta(hours=2, minutes=15)).strftime("%Y-%m-%d %H:%M:%S"),
            category="Machine Learning",
            tags=["GPT", "OpenAI", "LLM"],
        ),
        NewsItem(
            title="Gemini Robotics 1.5 brings AI agents into the physical world",
            summary="RT-2 model enables robots to perform complex manipulation tasks with human-level dexterity.",
            url="https://deepmind.google/discover/blog/gemini-robotics-15-brings-ai-agents-into-the-physical-world/",
            source="Google DeepMind",
            publish_time=(now - timedelta(hours=4, minutes=32)).strftime("%Y-%m-%d %H:%M:%S"),
            category="Robotics",
            tags=["Google", "DeepMind", "Robotics"],
        ),
        NewsItem(
            title="Meta unveils Llama 3 with multimodal capabilities",
            summary="New open-source model supports text, image, and video understanding with competitive performance.",
            url="https://ai.meta.com/blog/llama-3-multimodal-capabilities",
            source="Meta AI",
            publish_time=(now - timedelta(hours=6, minutes=45)).strftime("%Y-%m-%d %H:%M:%S"),
            category="Computer Vision",
            tags=["Meta", "Llama", "Multimodal"],
        ),
        NewsItem(
            title="Anthropic introduces Constitutional AI 2.0",
            summary="Enhanced safety measures and improved alignment through constitutional training methods.",
            url="https://www.anthropic.com/news",
            source="Anthropic",
            publish_time=(now - timedelta(hours=8, minutes=12)).strftime("%Y-%m-%d %H:%M:%S"),
            category="AI Safety",
            tags=["Anthropic", "Safety", "Constitutional AI"],
        ),
        NewsItem(
            title="Microsoft Copilot integrates with Azure AI Studio",
            summary="Developers can now build custom AI agents using enterprise-grade tools and infrastructure.",
            url="https://azure.microsoft.com/blog",
            source="Microsoft Azure",
            publish_time=(now - timedelta(hours=10, minutes=28)).strftime("%Y-%m-%d %H:%M:%S"),
            category="Enterprise AI",
            tags=["Microsoft", "Copilot", "Azure"],
        ),
        NewsItem(
            title="NVIDIA announces H200 AI accelerator with 4x performance boost",
            summary="New data center GPU delivers unprecedented AI training and inference capabilities for large language models.",
            url="https://nvidia.com/newsroom",
            source="NVIDIA Newsroom",
            publish_time=(now - timedelta(hours=12, minutes=5)).strftime("%Y-%m-%d %H:%M:%S"),
            category="Hardware",
            tags=["NVIDIA", "GPU", "AI Hardware"],
        ),
        NewsItem(
            title="Tesla FSD v12 achieves 99.7% safety record in beta testing",
            summary="Latest full self-driving software shows significant improvement in urban driving scenarios.",
            url="https://tesla.com/ai",
            source="Tesla",
            publish_time=(now - timedelta(hours=14, minutes=18)).strftime("%Y-%m-%d %H:%M:%S"),
            category="Autonomous Vehicles",
            tags=["Tesla", "FSD", "Autonomous Driving"],
        ),
        NewsItem(
            title="Stability AI releases Stable Diffusion 3.5 with improved text rendering",
            summary="Latest image generation model features enhanced prompt understanding and higher resolution outputs.",
            url="https://stability.ai/news",
            source="Stability AI",
            publish_time=(now - timedelta(hours=16, minutes=42)).strftime("%Y-%m-%d %H:%M:%S"),
            category="Computer Vision",
            tags=["Stability AI", "Diffusion", "Image Generation"],
        ),
    ]


def get_mock_trending() -> list:
    """获取 Mock 热门话题数据"""
    return [
        TrendingTopic(
            keyword="GPT-4.5",
            mentions=1247,
            change="↑ 23%",
            description="Latest OpenAI model",
        ),
        TrendingTopic(
            keyword="Multimodal AI",
            mentions=892,
            change="↑ 15%",
            description="Multi-format AI systems",
        ),
        TrendingTopic(
            keyword="AI Safety",
            mentions=567,
            change="↑ 8%",
            description="AI safety research",
        ),
        TrendingTopic(
            keyword="Open Source LLM",
            mentions=445,
            change="↑ 12%",
            description="Open source language models",
        ),
        TrendingTopic(
            keyword="AI Robotics",
            mentions=334,
            change="↑ 18%",
            description="AI in robotics applications",
        ),
    ]
