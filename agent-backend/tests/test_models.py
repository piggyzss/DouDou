"""Tests for data models."""

from datetime import datetime
from app.models.base import AgentRequest, AgentResponse
from app.models.news import NewsItem, TrendingTopic


def test_agent_request_creation():
    """Test AgentRequest model creation."""
    request = AgentRequest(
        command="/test", params={"key": "value"}, user_id="test_user"
    )
    assert request.command == "/test"
    assert request.params == {"key": "value"}
    assert request.user_id == "test_user"


def test_agent_response_creation():
    """Test AgentResponse model creation."""
    response = AgentResponse(
        success=True,
        data="test data",
        type="text",
        plugin="test_plugin",
        command="/test",
    )
    assert response.success is True
    assert response.data == "test data"
    assert response.type == "text"
    assert response.plugin == "test_plugin"
    assert response.command == "/test"
    assert isinstance(response.timestamp, datetime)


def test_news_item_creation():
    """Test NewsItem model creation."""
    news_item = NewsItem(
        title="Test News",
        summary="Test summary",
        url="https://example.com",
        source="Test Source",
        publish_time="2024-01-01 12:00:00",
    )
    assert news_item.title == "Test News"
    assert news_item.summary == "Test summary"
    assert news_item.url == "https://example.com"
    assert news_item.source == "Test Source"
    assert news_item.publish_time == "2024-01-01 12:00:00"


def test_trending_topic_creation():
    """Test TrendingTopic model creation."""
    topic = TrendingTopic(keyword="AI", mentions=100, change="+15%")
    assert topic.keyword == "AI"
    assert topic.mentions == 100
    assert topic.change == "+15%"
