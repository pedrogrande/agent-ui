export const APIRoutes = {
  GetAgents: (agentOSUrl: string) => `${agentOSUrl}/agents`,
  AgentRun: (agentOSUrl: string) => `${agentOSUrl}/agents/{agent_id}/runs`,
  Status: (agentOSUrl: string) => `${agentOSUrl}/health`,

  // Sessions
  GetSessions: (agentOSUrl: string) => `${agentOSUrl}/sessions`,
  GetSession: (agentOSUrl: string, sessionId: string) =>
    `${agentOSUrl}/sessions/${sessionId}/runs`,
  GetSessionDetail: (agentOSUrl: string, sessionId: string) =>
    `${agentOSUrl}/sessions/${sessionId}`,
  DeleteSession: (agentOSUrl: string, sessionId: string) =>
    `${agentOSUrl}/sessions/${sessionId}`,
  RenameSession: (agentOSUrl: string, sessionId: string) =>
    `${agentOSUrl}/sessions/${sessionId}/rename`,
  DeleteSessions: (agentOSUrl: string) => `${agentOSUrl}/sessions`,

  // Teams
  GetTeams: (agentOSUrl: string) => `${agentOSUrl}/teams`,
  TeamRun: (agentOSUrl: string, teamId: string) =>
    `${agentOSUrl}/teams/${teamId}/runs`,
  DeleteTeamSession: (agentOSUrl: string, teamId: string, sessionId: string) =>
    `${agentOSUrl}/teams/${teamId}/sessions/${sessionId}`,

  // Memory
  GetMemories: (agentOSUrl: string) => `${agentOSUrl}/memories`,
  CreateMemory: (agentOSUrl: string) => `${agentOSUrl}/memories`,
  GetMemory: (agentOSUrl: string, memoryId: string) =>
    `${agentOSUrl}/memories/${memoryId}`,
  UpdateMemory: (agentOSUrl: string, memoryId: string) =>
    `${agentOSUrl}/memories/${memoryId}`,
  DeleteMemory: (agentOSUrl: string, memoryId: string) =>
    `${agentOSUrl}/memories/${memoryId}`,
  DeleteMemories: (agentOSUrl: string) => `${agentOSUrl}/memories`,
  GetMemoryTopics: (agentOSUrl: string) => `${agentOSUrl}/memory_topics`,
  GetUserMemoryStats: (agentOSUrl: string) => `${agentOSUrl}/user_memory_stats`,
  OptimizeMemories: (agentOSUrl: string) => `${agentOSUrl}/optimize-memories`,

  // Knowledge
  GetKnowledgeContent: (agentOSUrl: string) => `${agentOSUrl}/knowledge/content`,
  UploadContent: (agentOSUrl: string) => `${agentOSUrl}/knowledge/content`,
  DeleteAllContent: (agentOSUrl: string) => `${agentOSUrl}/knowledge/content`,
  DeleteContent: (agentOSUrl: string, contentId: string) =>
    `${agentOSUrl}/knowledge/content/${contentId}`,
  GetContentStatus: (agentOSUrl: string, contentId: string) =>
    `${agentOSUrl}/knowledge/content/${contentId}/status`,
  SearchKnowledge: (agentOSUrl: string) => `${agentOSUrl}/knowledge/search`
}
