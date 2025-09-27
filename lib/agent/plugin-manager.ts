import { AgentPlugin, AgentRequest, AgentResponse } from './types'

export class AgentPluginManager {
  private plugins: Map<string, AgentPlugin> = new Map()
  private commandMap: Map<string, string> = new Map()

  constructor() {
    this.initializePlugins()
  }

  private initializePlugins() {
    // 注册AI资讯插件
    this.registerPlugin({
      name: 'AI资讯',
      id: 'news',
      description: '获取最新的AI和科技资讯',
      icon: 'Newspaper',
      enabled: true,
      commands: [
        {
          command: '/latest',
          description: '获取最新AI资讯',
          usage: '/latest [count]',
          examples: ['/latest', '/latest 5']
        },
        {
          command: '/trending',
          description: '获取热门趋势',
          usage: '/trending [category]',
          examples: ['/trending', '/trending ai']
        },
        {
          command: '/categories',
          description: '显示资讯分类',
          usage: '/categories',
          examples: ['/categories']
        },
        {
          command: '/deepdive',
          description: '深度分析特定主题',
          usage: '/deepdive <topic>',
          examples: ['/deepdive GPT-4', '/deepdive 机器学习']
        },
        {
          command: '/help',
          description: '显示帮助信息',
          usage: '/help [command]',
          examples: ['/help', '/help /latest']
        }
      ]
    })
  }

  registerPlugin(plugin: AgentPlugin) {
    this.plugins.set(plugin.id, plugin)
    
    // 注册命令映射
    plugin.commands.forEach(cmd => {
      this.commandMap.set(cmd.command, plugin.id)
    })
  }

  getPlugin(pluginId: string): AgentPlugin | undefined {
    return this.plugins.get(pluginId)
  }

  getAllPlugins(): AgentPlugin[] {
    return Array.from(this.plugins.values())
  }

  getEnabledPlugins(): AgentPlugin[] {
    return Array.from(this.plugins.values()).filter(plugin => plugin.enabled)
  }

  getPluginForCommand(command: string): string | undefined {
    return this.commandMap.get(command)
  }

  getAllCommands(): string[] {
    return Array.from(this.commandMap.keys())
  }

  validateCommand(command: string): boolean {
    return this.commandMap.has(command)
  }

  async executeCommand(request: AgentRequest): Promise<AgentResponse> {
    const pluginId = this.getPluginForCommand(request.command)
    
    if (!pluginId) {
      return {
        success: false,
        error: `Unknown command: ${request.command}. Type /help for available commands.`,
        type: 'error',
        plugin: 'system',
        command: request.command,
        timestamp: Date.now()
      }
    }

    const plugin = this.getPlugin(pluginId)
    if (!plugin || !plugin.enabled) {
      return {
        success: false,
        error: `Plugin ${pluginId} is not available.`,
        type: 'error',
        plugin: pluginId,
        command: request.command,
        timestamp: Date.now()
      }
    }

    // 转发到后端API处理
    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plugin: pluginId,
          command: request.command,
          params: request.params || {},
          sessionId: request.sessionId || 'default'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result.data,
        type: result.type || 'text',
        plugin: pluginId,
        command: request.command,
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error',
        plugin: pluginId,
        command: request.command,
        timestamp: Date.now()
      }
    }
  }
}

// 单例模式
export const agentPluginManager = new AgentPluginManager()
