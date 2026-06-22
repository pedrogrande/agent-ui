import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import {
  AgentDetails,
  SessionEntry,
  TeamDetails,
  type ChatMessage
} from '@/types/os'

// Auto-detect the AgentOS API URL from the current browser URL.
// When accessed via Coder subdomain proxying, the Agent-UI is at:
//   agent-ui--<workspace>--<user>.coder.example.com
// The AgentOS API is at:
//   agentos--<workspace>--<user>.coder.example.com
// When accessed via localhost (SSH tunnel), the API is at localhost:8000.
function detectDefaultEndpoint(): string {
  if (typeof window === 'undefined') return 'http://localhost:8000'
  const hostname = window.location.hostname
  // Check if we're on a Coder subdomain (contains '--' segments)
  if (hostname.includes('--') && hostname.includes('agent-ui')) {
    const protocol = window.location.protocol
    const apiHostname = hostname.replace('agent-ui', 'agentos')
    return `${protocol}//${apiHostname}`
  }
  // Default for localhost / SSH tunnel access
  return 'http://localhost:8000'
}

interface Store {
  hydrated: boolean
  setHydrated: () => void
  streamingErrorMessage: string
  setStreamingErrorMessage: (streamingErrorMessage: string) => void
  endpoints: {
    endpoint: string
    id__endpoint: string
  }[]
  setEndpoints: (
    endpoints: {
      endpoint: string
      id__endpoint: string
    }[]
  ) => void
  isStreaming: boolean
  setIsStreaming: (isStreaming: boolean) => void
  isEndpointActive: boolean
  setIsEndpointActive: (isActive: boolean) => void
  isEndpointLoading: boolean
  setIsEndpointLoading: (isLoading: boolean) => void
  messages: ChatMessage[]
  setMessages: (
    messages: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[])
  ) => void
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>
  selectedEndpoint: string
  setSelectedEndpoint: (selectedEndpoint: string) => void
  authToken: string
  setAuthToken: (authToken: string) => void
  agents: AgentDetails[]
  setAgents: (agents: AgentDetails[]) => void
  teams: TeamDetails[]
  setTeams: (teams: TeamDetails[]) => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  mode: 'agent' | 'team'
  setMode: (mode: 'agent' | 'team') => void
  sessionsData: SessionEntry[] | null
  setSessionsData: (
    sessionsData:
      | SessionEntry[]
      | ((prevSessions: SessionEntry[] | null) => SessionEntry[] | null)
  ) => void
  isSessionsLoading: boolean
  setIsSessionsLoading: (isSessionsLoading: boolean) => void
  viewMode: 'chat' | 'sessions' | 'memory' | 'knowledge'
  setViewMode: (viewMode: 'chat' | 'sessions' | 'memory' | 'knowledge') => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      streamingErrorMessage: '',
      setStreamingErrorMessage: (streamingErrorMessage) =>
        set(() => ({ streamingErrorMessage })),
      endpoints: [],
      setEndpoints: (endpoints) => set(() => ({ endpoints })),
      isStreaming: false,
      setIsStreaming: (isStreaming) => set(() => ({ isStreaming })),
      isEndpointActive: false,
      setIsEndpointActive: (isActive) =>
        set(() => ({ isEndpointActive: isActive })),
      isEndpointLoading: true,
      setIsEndpointLoading: (isLoading) =>
        set(() => ({ isEndpointLoading: isLoading })),
      messages: [],
      setMessages: (messages) =>
        set((state) => ({
          messages:
            typeof messages === 'function' ? messages(state.messages) : messages
        })),
      chatInputRef: { current: null },
      selectedEndpoint: detectDefaultEndpoint(),
      setSelectedEndpoint: (selectedEndpoint) =>
        set(() => ({ selectedEndpoint })),
      authToken: '',
      setAuthToken: (authToken) => set(() => ({ authToken })),
      agents: [],
      setAgents: (agents) => set({ agents }),
      teams: [],
      setTeams: (teams) => set({ teams }),
      selectedModel: '',
      setSelectedModel: (selectedModel) => set(() => ({ selectedModel })),
      mode: 'agent',
      setMode: (mode) => set(() => ({ mode })),
      sessionsData: null,
      setSessionsData: (sessionsData) =>
        set((state) => ({
          sessionsData:
            typeof sessionsData === 'function'
              ? sessionsData(state.sessionsData)
              : sessionsData
        })),
      isSessionsLoading: false,
      setIsSessionsLoading: (isSessionsLoading) =>
        set(() => ({ isSessionsLoading })),
      viewMode: 'chat',
      setViewMode: (viewMode) => set(() => ({ viewMode }))
    }),
    {
      name: 'endpoint-storage',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedEndpoint: state.selectedEndpoint
      }),
      migrate: (persistedState: Record<string, unknown> | undefined, version: number) => {
        // If the persisted version is old, clear the endpoint so the new auto-detect default is used
        if (version < 2 && persistedState) {
          return { ...persistedState, selectedEndpoint: undefined }
        }
        return persistedState
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.()
      }
    }
  )
)
