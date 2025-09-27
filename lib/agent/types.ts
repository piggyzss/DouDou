// Agent插件系统类型定义
export interface AgentCommand {
  command: string
  description: string
  usage: string
  examples: string[]
}

export interface AgentPlugin {
  name: string
  id: string
  description: string
  icon: string
  enabled: boolean
  commands: AgentCommand[]
}

export interface AgentRequest {
  command: string
  params?: Record<string, any>
  sessionId?: string
}

export interface AgentResponse {
  success: boolean
  data?: any
  error?: string
  type: 'text' | 'structured' | 'error' | 'loading'
  plugin: string
  command: string
  timestamp: number
}

export interface PluginExecutionContext {
  sessionId: string
  userId?: string
  timestamp: number
  previousCommands: string[]
}
