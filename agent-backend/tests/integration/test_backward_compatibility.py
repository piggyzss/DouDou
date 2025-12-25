"""
向后兼容性集成测试

验证：
1. 旧版 API 请求格式仍然支持
2. 现有插件无需修改即可工作
3. 响应格式保持兼容
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.base import AgentRequest, AgentResponse
from app.core.plugin_manager import plugin_manager
from app.core.tool_registry import get_tool_registry


client = TestClient(app)


class TestBackwardCompatibility:
    """向后兼容性测试套件"""
    
    def test_legacy_command_field_support(self):
        """测试旧版 command 字段仍然支持"""
        # 使用旧版 command 字段而不是 input 字段
        response = client.post(
            "/api/agent/execute",
            json={
                "command": "获取最新资讯",  # 旧版字段名
                "session_id": "test_legacy"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # 验证响应格式
        assert "success" in data
        assert "data" in data or "error" in data
        assert "type" in data
        assert "plugin" in data
        assert "timestamp" in data
    
    def test_legacy_response_format(self):
        """测试响应格式保持兼容"""
        response = client.post(
            "/api/agent/execute",
            json={
                "input": "测试查询",
                "session_id": "test_format"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # 验证所有必需字段存在
        required_fields = ["success", "type", "plugin", "command", "timestamp"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # 验证 metadata 字段（新增但可选）
        if "metadata" in data:
            assert isinstance(data["metadata"], dict)
    
    def test_existing_plugins_work(self):
        """测试现有插件无需修改即可工作"""
        # 获取所有已注册的插件
        plugins = plugin_manager.get_enabled_plugins()
        
        assert len(plugins) > 0, "No plugins registered"
        
        # 验证每个插件都有必需的属性
        for plugin in plugins:
            assert hasattr(plugin, "id")
            assert hasattr(plugin, "name")
            assert hasattr(plugin, "description")
            assert hasattr(plugin, "enabled")
            assert hasattr(plugin, "execute_tool")
    
    def test_tool_registry_integration(self):
        """测试工具注册表集成"""
        tool_registry = get_tool_registry()
        tools = tool_registry.get_all_tools()
        
        # 验证工具已注册
        assert len(tools) > 0, "No tools registered"
        
        # 验证每个工具都有必需的属性
        for tool in tools:
            assert hasattr(tool, "name")
            assert hasattr(tool, "description")
            assert hasattr(tool, "plugin_id")
            assert hasattr(tool, "parameters")
    
    def test_plugins_endpoint(self):
        """测试插件列表端点"""
        response = client.get("/api/agent/plugins")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "plugins" in data
        assert isinstance(data["plugins"], list)
        
        # 验证插件信息格式
        if len(data["plugins"]) > 0:
            plugin = data["plugins"][0]
            assert "id" in plugin
            assert "name" in plugin
            assert "description" in plugin
            assert "enabled" in plugin
    
    def test_tools_endpoint(self):
        """测试工具列表端点"""
        response = client.get("/api/agent/tools")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "tools" in data
        assert "summary" in data
        assert isinstance(data["tools"], list)
        assert isinstance(data["summary"], dict)
    
    def test_health_endpoint(self):
        """测试健康检查端点"""
        response = client.get("/api/agent/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "timestamp" in data
        assert "plugins_count" in data
        assert "tools_count" in data
        assert "agent_type" in data
        
        assert data["agent_type"] == "ReactAgent"
    
    def test_empty_input_validation(self):
        """测试空输入验证"""
        response = client.post(
            "/api/agent/execute",
            json={
                "input": "",
                "session_id": "test_empty"
            }
        )
        
        assert response.status_code == 400
    
    def test_missing_input_validation(self):
        """测试缺失输入验证"""
        response = client.post(
            "/api/agent/execute",
            json={
                "session_id": "test_missing"
            }
        )
        
        assert response.status_code == 400
    
    def test_session_id_optional(self):
        """测试 session_id 是可选的"""
        response = client.post(
            "/api/agent/execute",
            json={
                "input": "测试查询"
                # 不提供 session_id
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # 应该自动生成 session_id
        if "metadata" in data:
            # session_id 可能在 metadata 中
            pass
    
    def test_context_parameter_support(self):
        """测试 context 参数支持"""
        response = client.post(
            "/api/agent/execute",
            json={
                "input": "测试查询",
                "session_id": "test_context",
                "context": {
                    "user_id": "test_user",
                    "preferences": {"language": "zh"}
                }
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
    
    def test_error_response_format(self):
        """测试错误响应格式"""
        # 触发一个错误（例如，非常长的输入）
        response = client.post(
            "/api/agent/execute",
            json={
                "input": "x" * 10000,  # 非常长的输入
                "session_id": "test_error"
            }
        )
        
        # 即使出错，也应该返回结构化响应
        data = response.json()
        
        assert "success" in data
        assert "type" in data
        assert "timestamp" in data
        
        # 如果失败，应该有错误信息
        if not data.get("success", True):
            assert "error" in data or data.get("data") is None


class TestReactAgentIntegration:
    """ReactAgent 集成测试"""
    
    def test_natural_language_processing(self):
        """测试自然语言处理"""
        response = client.post(
            "/api/agent/execute",
            json={
                "input": "你好，请介绍一下你自己",
                "session_id": "test_nl"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # 验证使用了 ReactAgent
        assert data.get("plugin") == "react_agent"
        assert data.get("command") == "react"
        
        # 验证有 metadata
        if "metadata" in data:
            metadata = data["metadata"]
            assert "steps" in metadata
            assert "plan" in metadata
            assert "evaluation" in metadata
            assert "execution_time" in metadata
    
    def test_multi_step_execution(self):
        """测试多步执行"""
        response = client.post(
            "/api/agent/execute",
            json={
                "input": "获取最新的AI资讯并总结",
                "session_id": "test_multi_step"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # 验证执行了多个步骤
        if "metadata" in data and "steps" in data["metadata"]:
            steps = data["metadata"]["steps"]
            assert isinstance(steps, list)
            # 可能有多个步骤
            assert len(steps) >= 1
    
    def test_execution_plan_included(self):
        """测试执行计划包含在响应中"""
        response = client.post(
            "/api/agent/execute",
            json={
                "input": "测试查询",
                "session_id": "test_plan"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if "metadata" in data:
            metadata = data["metadata"]
            assert "plan" in metadata
            
            plan = metadata["plan"]
            assert "query" in plan
            assert "complexity" in plan
            assert "steps" in plan
            assert "estimated_iterations" in plan
    
    def test_quality_evaluation_included(self):
        """测试质量评估包含在响应中"""
        response = client.post(
            "/api/agent/execute",
            json={
                "input": "测试查询",
                "session_id": "test_eval"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if "metadata" in data:
            metadata = data["metadata"]
            assert "evaluation" in metadata
            
            evaluation = metadata["evaluation"]
            assert "completeness_score" in evaluation
            assert "quality_score" in evaluation
            assert "needs_retry" in evaluation


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
