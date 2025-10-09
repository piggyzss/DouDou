"""Tests for app configuration."""

from app.config import Settings


def test_settings_creation():
    """Test that Settings can be created with default values."""
    settings = Settings()
    assert settings.APP_NAME == "AI News Agent"
    assert settings.APP_VERSION == "1.0.0"
    assert settings.DEBUG is False


def test_settings_environment():
    """Test that Settings respects environment variables."""
    settings = Settings()
    assert hasattr(settings, "LOG_LEVEL")
    assert hasattr(settings, "LOG_FILE")


def test_news_sources_config():
    """Test that news sources are properly configured."""
    settings = Settings()
    assert hasattr(settings, "NEWS_SOURCES")
    assert isinstance(settings.NEWS_SOURCES, dict)
    assert len(settings.NEWS_SOURCES) > 0
