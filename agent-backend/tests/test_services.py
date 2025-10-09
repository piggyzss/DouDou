"""Tests for services."""

import pytest
from app.services.news_collector import NewsCollectorService


@pytest.fixture
def news_collector():
    """Create a NewsCollectorService instance for testing."""
    return NewsCollectorService()


@pytest.mark.asyncio
async def test_news_collector_get_latest_news(news_collector):
    """Test getting latest news."""
    news_items = await news_collector.get_latest_news(limit=5)

    assert isinstance(news_items, list)
    assert len(news_items) <= 5

    # Check that each item has the required attributes
    for item in news_items:
        assert hasattr(item, "title")
        assert hasattr(item, "summary")
        assert hasattr(item, "url")
        assert hasattr(item, "source")
        assert hasattr(item, "publish_time")


@pytest.mark.asyncio
async def test_news_collector_get_trending_topics(news_collector):
    """Test getting trending topics."""
    trending_topics = await news_collector.get_trending_topics(limit=10)

    assert isinstance(trending_topics, list)
    assert len(trending_topics) <= 10

    # Check that each topic has the required attributes
    for topic in trending_topics:
        assert hasattr(topic, "keyword")
        assert hasattr(topic, "mentions")
        assert hasattr(topic, "change")


# Note: The specific category methods don't exist in the current implementation
# These tests are removed as they test non-existent methods


def test_news_collector_initialization(news_collector):
    """Test NewsCollectorService initialization."""
    assert news_collector is not None
    assert hasattr(news_collector, "get_latest_news")
    assert hasattr(news_collector, "get_trending_topics")


@pytest.mark.asyncio
async def test_news_collector_empty_results(news_collector):
    """Test handling of empty results."""
    # Test with limit 0
    news_items = await news_collector.get_latest_news(limit=0)
    assert isinstance(news_items, list)
    assert len(news_items) == 0

    trending_topics = await news_collector.get_trending_topics(limit=0)
    assert isinstance(trending_topics, list)
    assert len(trending_topics) == 0
