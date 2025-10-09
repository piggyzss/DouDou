"""Tests for plugin manager."""
import pytest
from unittest.mock import AsyncMock, patch
from app.core.plugin_manager import PluginManager
from app.models.base import AgentRequest


@pytest.fixture
def plugin_manager():
    """Create a PluginManager instance for testing."""
    return PluginManager()


@pytest.fixture
def sample_request():
    """Create a sample AgentRequest for testing."""
    return AgentRequest(
        command="/latest",
        params={},
        user_id="test_user"
    )


def test_plugin_manager_initialization(plugin_manager):
    """Test PluginManager initialization."""
    assert plugin_manager is not None
    assert hasattr(plugin_manager, 'plugins')
    assert hasattr(plugin_manager, 'command_map')


def test_plugin_manager_register_plugins(plugin_manager):
    """Test plugin registration."""
    # Check that plugins are registered
    assert len(plugin_manager.plugins) > 0
    assert "news" in plugin_manager.plugins
    
    # Check that commands are mapped
    assert len(plugin_manager.command_map) > 0
    assert "/latest" in plugin_manager.command_map
    assert "/trending" in plugin_manager.command_map
    assert "/deepdive" in plugin_manager.command_map


def test_plugin_manager_get_plugin_for_command(plugin_manager):
    """Test getting plugin for command."""
    plugin_id = plugin_manager.get_plugin_for_command("/latest")
    assert plugin_id == "news"
    
    plugin_id = plugin_manager.get_plugin_for_command("/trending")
    assert plugin_id == "news"
    
    plugin_id = plugin_manager.get_plugin_for_command("/invalid")
    assert plugin_id is None


@pytest.mark.asyncio
async def test_plugin_manager_execute_command(plugin_manager, sample_request):
    """Test command execution through plugin manager."""
    with patch.object(plugin_manager.plugins["news"], 'execute', new_callable=AsyncMock) as mock_execute:
        # Mock the plugin execution
        mock_response = type('AgentResponse', (), {
            'success': True,
            'data': 'Test response',
            'type': 'text',
            'plugin': 'news',
            'command': '/latest'
        })()
        mock_execute.return_value = mock_response
        
        response = await plugin_manager.execute_command(sample_request)
        
        assert response.success is True
        assert response.data == 'Test response'
        assert response.plugin == 'news'
        assert response.command == '/latest'
        mock_execute.assert_called_once_with(sample_request)


@pytest.mark.asyncio
async def test_plugin_manager_execute_invalid_command(plugin_manager):
    """Test execution of invalid command."""
    invalid_request = AgentRequest(
        command="/invalid",
        params={},
        user_id="test_user"
    )
    
    response = await plugin_manager.execute_command(invalid_request)
    
    assert response.success is False
    assert response.type == "error"
    assert "Unknown command" in response.error
    assert response.plugin == "system"


@pytest.mark.asyncio
async def test_plugin_manager_help_command(plugin_manager):
    """Test help command."""
    help_request = AgentRequest(
        command="/help",
        params={},
        user_id="test_user"
    )
    
    response = await plugin_manager.execute_command(help_request)
    
    # /help is handled by the news plugin
    assert response.success is True
    assert response.type == "text"
    assert response.plugin == "news"
    assert "AI资讯插件" in response.data


def test_plugin_manager_list_plugins(plugin_manager):
    """Test listing available plugins."""
    plugins = plugin_manager.get_all_plugins()
    
    assert isinstance(plugins, list)
    assert len(plugins) > 0
    
    # Check that news plugin is in the list
    plugin_names = [plugin.name for plugin in plugins]
    assert "AI资讯" in plugin_names


def test_plugin_manager_get_all_commands(plugin_manager):
    """Test getting all available commands."""
    commands = plugin_manager.get_all_commands()
    
    assert isinstance(commands, list)
    assert len(commands) > 0
    assert "/latest" in commands
    assert "/trending" in commands
    assert "/deepdive" in commands


def test_plugin_manager_get_plugin(plugin_manager):
    """Test getting a specific plugin."""
    plugin = plugin_manager.get_plugin("news")
    assert plugin is not None
    assert plugin.name == "AI资讯"
    
    invalid_plugin = plugin_manager.get_plugin("invalid")
    assert invalid_plugin is None
