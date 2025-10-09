"""Tests for plugins."""

import pytest
from unittest.mock import AsyncMock, patch
from app.plugins.news_plugin import NewsPlugin
from app.models.base import AgentRequest


@pytest.fixture
def news_plugin():
    """Create a NewsPlugin instance for testing."""
    return NewsPlugin()


@pytest.fixture
def sample_request():
    """Create a sample AgentRequest for testing."""
    return AgentRequest(command="/latest", params={}, user_id="test_user")


def test_news_plugin_initialization(news_plugin):
    """Test NewsPlugin initialization."""
    assert news_plugin.name == "AI资讯"
    assert news_plugin.id == "news"
    assert news_plugin.description == "获取最新的AI和科技资讯"
    assert len(news_plugin.commands) > 0


def test_news_plugin_commands(news_plugin):
    """Test NewsPlugin commands are properly registered."""
    command_names = [cmd.command for cmd in news_plugin.commands]
    assert "/latest" in command_names
    assert "/trending" in command_names
    assert "/deepdive" in command_names


@pytest.mark.asyncio
async def test_news_plugin_latest_command(news_plugin, sample_request):
    """Test the /latest command."""
    with patch.object(
        news_plugin.news_service, "get_latest_news", new_callable=AsyncMock
    ) as mock_get_news:
        # Mock the news collector to return sample data
        mock_get_news.return_value = [
            type(
                "NewsItem",
                (),
                {
                    "title": "Test News 1",
                    "summary": "Test summary 1",
                    "url": "https://example.com/1",
                    "source": "Test Source",
                    "publish_time": "2024-01-01 12:00:00",
                },
            )(),
            type(
                "NewsItem",
                (),
                {
                    "title": "Test News 2",
                    "summary": "Test summary 2",
                    "url": "https://example.com/2",
                    "source": "Test Source",
                    "publish_time": "2024-01-01 13:00:00",
                },
            )(),
        ]

        response = await news_plugin.execute(sample_request)

        assert response.success is True
        assert response.type == "text"
        assert response.plugin == "news"
        assert response.command == "/latest"
        assert "Test News 1" in response.data
        assert "Test News 2" in response.data


@pytest.mark.asyncio
async def test_news_plugin_trending_command(news_plugin):
    """Test the /trending command."""
    request = AgentRequest(command="/trending", params={}, user_id="test_user")

    with patch.object(
        news_plugin.news_service, "get_trending_topics", new_callable=AsyncMock
    ) as mock_get_trending:
        # Mock the trending topics
        mock_get_trending.return_value = [
            type(
                "TrendingTopic",
                (),
                {"keyword": "AI", "mentions": 100, "change": "+15%"},
            )(),
            type(
                "TrendingTopic",
                (),
                {"keyword": "Machine Learning", "mentions": 85, "change": "+8%"},
            )(),
        ]

        response = await news_plugin.execute(request)

        assert response.success is True
        assert response.type == "text"
        assert response.plugin == "news"
        assert response.command == "/trending"
        assert "AI" in response.data
        assert "Machine Learning" in response.data


@pytest.mark.asyncio
async def test_news_plugin_deepdive_command(news_plugin):
    """Test the /deepdive command."""
    request = AgentRequest(
        command="/deepdive", params={"topic": "AI developments"}, user_id="test_user"
    )

    response = await news_plugin.execute(request)

    assert response.success is True
    assert response.type == "text"
    assert response.plugin == "news"
    assert response.command == "/deepdive"
    assert "AI developments" in response.data


@pytest.mark.asyncio
async def test_news_plugin_invalid_command(news_plugin):
    """Test handling of invalid commands."""
    request = AgentRequest(command="/invalid", params={}, user_id="test_user")

    response = await news_plugin.execute(request)

    assert response.success is False
    assert response.type == "error"
    assert "Unknown command" in response.error


@pytest.mark.asyncio
async def test_news_plugin_error_handling(news_plugin, sample_request):
    """Test error handling in news plugin."""
    with patch.object(
        news_plugin.news_service, "get_latest_news", new_callable=AsyncMock
    ) as mock_get_news:
        # Mock the news collector to raise an exception
        mock_get_news.side_effect = Exception("Network error")

        response = await news_plugin.execute(sample_request)

        assert response.success is False
        assert response.type == "error"
        assert "Network error" in response.error
