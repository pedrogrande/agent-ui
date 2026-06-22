import { toast } from 'sonner'

import { APIRoutes } from './routes'

import {
  AgentDetails,
  ContentResponse,
  ContentStatusResponse,
  DeleteMemoriesRequest,
  DeleteSessionsRequest,
  OptimizeMemoriesRequest,
  OptimizeMemoriesResponse,
  PaginatedResponse,
  SessionDetail,
  SessionEntry,
  Sessions,
  TeamDetails,
  UserMemory,
  UserMemoryCreate,
  UserStats,
  VectorSearchRequest,
  VectorSearchResult
} from '@/types/os'

// Helper function to create headers with optional auth token
const createHeaders = (authToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  return headers
}

export const getAgentsAPI = async (
  endpoint: string,
  authToken?: string
): Promise<AgentDetails[]> => {
  const url = APIRoutes.GetAgents(endpoint)
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Failed to fetch  agents: ${response.statusText}`)
      return []
    }
    const data = await response.json()
    return data
  } catch {
    toast.error('Error fetching  agents')
    return []
  }
}

export const getStatusAPI = async (
  base: string,
  authToken?: string
): Promise<number> => {
  const response = await fetch(APIRoutes.Status(base), {
    method: 'GET',
    headers: createHeaders(authToken)
  })
  return response.status
}

export const getAllSessionsAPI = async (
  base: string,
  type: 'agent' | 'team',
  componentId: string,
  dbId: string,
  authToken?: string
): Promise<Sessions | { data: [] }> => {
  try {
    const url = new URL(APIRoutes.GetSessions(base))
    url.searchParams.set('type', type)
    url.searchParams.set('component_id', componentId)
    url.searchParams.set('db_id', dbId)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: createHeaders(authToken)
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { data: [] }
      }
      throw new Error(`Failed to fetch sessions: ${response.statusText}`)
    }
    return response.json()
  } catch {
    return { data: [] }
  }
}

export const getSessionAPI = async (
  base: string,
  type: 'agent' | 'team',
  sessionId: string,
  dbId?: string,
  authToken?: string
) => {
  // build query string
  const queryParams = new URLSearchParams({ type })
  if (dbId) queryParams.append('db_id', dbId)

  const response = await fetch(
    `${APIRoutes.GetSession(base, sessionId)}?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: createHeaders(authToken)
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch session: ${response.statusText}`)
  }

  return response.json()
}

export const deleteSessionAPI = async (
  base: string,
  dbId: string,
  sessionId: string,
  authToken?: string
) => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  const response = await fetch(
    `${APIRoutes.DeleteSession(base, sessionId)}?${queryParams.toString()}`,
    {
      method: 'DELETE',
      headers: createHeaders(authToken)
    }
  )
  return response
}

export const getTeamsAPI = async (
  endpoint: string,
  authToken?: string
): Promise<TeamDetails[]> => {
  const url = APIRoutes.GetTeams(endpoint)
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Failed to fetch  teams: ${response.statusText}`)
      return []
    }
    const data = await response.json()

    return data
  } catch {
    toast.error('Error fetching  teams')
    return []
  }
}

export const deleteTeamSessionAPI = async (
  base: string,
  teamId: string,
  sessionId: string,
  authToken?: string
) => {
  const response = await fetch(
    APIRoutes.DeleteTeamSession(base, teamId, sessionId),
    {
      method: 'DELETE',
      headers: createHeaders(authToken)
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to delete team session: ${response.statusText}`)
  }
  return response
}

// ---------------------------------------------------------------------------
// Session Management API
// ---------------------------------------------------------------------------

export const getAllSessionsPaginatedAPI = async (
  base: string,
  params?: {
    type?: string
    component_id?: string
    user_id?: string
    session_name?: string
    limit?: number
    page?: number
    sort_by?: string
    sort_order?: string
    db_id?: string
  },
  authToken?: string
): Promise<PaginatedResponse<SessionEntry>> => {
  try {
    const url = new URL(APIRoutes.GetSessions(base))
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })
    }
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      if (response.status === 404) return { data: [], meta: { page: 0, limit: 20, total_pages: 0, total_count: 0 } }
      throw new Error(`Failed to fetch sessions: ${response.statusText}`)
    }
    return response.json()
  } catch {
    return { data: [], meta: { page: 0, limit: 20, total_pages: 0, total_count: 0 } }
  }
}

export const getSessionDetailAPI = async (
  base: string,
  sessionId: string,
  type?: string,
  dbId?: string,
  authToken?: string
): Promise<SessionDetail> => {
  const queryParams = new URLSearchParams()
  if (type) queryParams.set('type', type)
  if (dbId) queryParams.append('db_id', dbId)
  const response = await fetch(
    `${APIRoutes.GetSessionDetail(base, sessionId)}?${queryParams.toString()}`,
    { method: 'GET', headers: createHeaders(authToken) }
  )
  if (!response.ok) throw new Error(`Failed to fetch session detail: ${response.statusText}`)
  return response.json()
}

export const renameSessionAPI = async (
  base: string,
  sessionId: string,
  sessionName: string,
  type?: string,
  dbId?: string,
  authToken?: string
) => {
  const queryParams = new URLSearchParams()
  if (type) queryParams.set('type', type)
  if (dbId) queryParams.append('db_id', dbId)
  const response = await fetch(
    `${APIRoutes.RenameSession(base, sessionId)}?${queryParams.toString()}`,
    {
      method: 'POST',
      headers: createHeaders(authToken),
      body: JSON.stringify({ session_name: sessionName })
    }
  )
  if (!response.ok) throw new Error(`Failed to rename session: ${response.statusText}`)
  return response.json()
}

export const deleteMultipleSessionsAPI = async (
  base: string,
  request: DeleteSessionsRequest,
  dbId?: string,
  authToken?: string
) => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  const response = await fetch(
    `${APIRoutes.DeleteSessions(base)}?${queryParams.toString()}`,
    {
      method: 'DELETE',
      headers: createHeaders(authToken),
      body: JSON.stringify(request)
    }
  )
  if (!response.ok) throw new Error(`Failed to delete sessions: ${response.statusText}`)
  return response
}

// ---------------------------------------------------------------------------
// Memory API
// ---------------------------------------------------------------------------

export const getMemoriesAPI = async (
  base: string,
  params?: {
    user_id?: string
    agent_id?: string
    team_id?: string
    search_content?: string
    limit?: number
    page?: number
    sort_by?: string
    sort_order?: string
    topics?: string
    db_id?: string
  },
  authToken?: string
): Promise<PaginatedResponse<UserMemory>> => {
  try {
    const url = new URL(APIRoutes.GetMemories(base))
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })
    }
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) return { data: [], meta: { page: 0, limit: 20, total_pages: 0, total_count: 0 } }
    return response.json()
  } catch {
    return { data: [], meta: { page: 0, limit: 20, total_pages: 0, total_count: 0 } }
  }
}

export const createMemoryAPI = async (
  base: string,
  memory: UserMemoryCreate,
  dbId?: string,
  authToken?: string
): Promise<UserMemory> => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  const response = await fetch(
    `${APIRoutes.CreateMemory(base)}?${queryParams.toString()}`,
    {
      method: 'POST',
      headers: createHeaders(authToken),
      body: JSON.stringify(memory)
    }
  )
  if (!response.ok) throw new Error(`Failed to create memory: ${response.statusText}`)
  return response.json()
}

export const updateMemoryAPI = async (
  base: string,
  memoryId: string,
  memory: UserMemoryCreate,
  dbId?: string,
  authToken?: string
): Promise<UserMemory> => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  const response = await fetch(
    `${APIRoutes.UpdateMemory(base, memoryId)}?${queryParams.toString()}`,
    {
      method: 'PATCH',
      headers: createHeaders(authToken),
      body: JSON.stringify(memory)
    }
  )
  if (!response.ok) throw new Error(`Failed to update memory: ${response.statusText}`)
  return response.json()
}

export const deleteMemoryAPI = async (
  base: string,
  memoryId: string,
  dbId?: string,
  authToken?: string
) => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  const response = await fetch(
    `${APIRoutes.DeleteMemory(base, memoryId)}?${queryParams.toString()}`,
    { method: 'DELETE', headers: createHeaders(authToken) }
  )
  if (!response.ok) throw new Error(`Failed to delete memory: ${response.statusText}`)
  return response
}

export const deleteMultipleMemoriesAPI = async (
  base: string,
  request: DeleteMemoriesRequest,
  dbId?: string,
  authToken?: string
) => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  const response = await fetch(
    `${APIRoutes.DeleteMemories(base)}?${queryParams.toString()}`,
    {
      method: 'DELETE',
      headers: createHeaders(authToken),
      body: JSON.stringify(request)
    }
  )
  if (!response.ok) throw new Error(`Failed to delete memories: ${response.statusText}`)
  return response
}

export const getMemoryTopicsAPI = async (
  base: string,
  dbId?: string,
  authToken?: string
): Promise<string[]> => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  const response = await fetch(
    `${APIRoutes.GetMemoryTopics(base)}?${queryParams.toString()}`,
    { method: 'GET', headers: createHeaders(authToken) }
  )
  if (!response.ok) return []
  return response.json()
}

export const getUserMemoryStatsAPI = async (
  base: string,
  dbId?: string,
  authToken?: string
): Promise<UserStats[]> => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  const response = await fetch(
    `${APIRoutes.GetUserMemoryStats(base)}?${queryParams.toString()}`,
    { method: 'GET', headers: createHeaders(authToken) }
  )
  if (!response.ok) return []
  return response.json()
}

export const optimizeMemoriesAPI = async (
  base: string,
  request: OptimizeMemoriesRequest,
  dbId?: string,
  authToken?: string
): Promise<OptimizeMemoriesResponse> => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  const response = await fetch(
    `${APIRoutes.OptimizeMemories(base)}?${queryParams.toString()}`,
    {
      method: 'POST',
      headers: createHeaders(authToken),
      body: JSON.stringify(request)
    }
  )
  if (!response.ok) throw new Error(`Failed to optimize memories: ${response.statusText}`)
  return response.json()
}

// ---------------------------------------------------------------------------
// Knowledge API
// ---------------------------------------------------------------------------

export const getKnowledgeContentAPI = async (
  base: string,
  params?: {
    limit?: number
    page?: number
    sort_by?: string
    sort_order?: string
    db_id?: string
    knowledge_id?: string
  },
  authToken?: string
): Promise<PaginatedResponse<ContentResponse>> => {
  try {
    const url = new URL(APIRoutes.GetKnowledgeContent(base))
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })
    }
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) return { data: [], meta: { page: 0, limit: 20, total_pages: 0, total_count: 0 } }
    return response.json()
  } catch {
    return { data: [], meta: { page: 0, limit: 20, total_pages: 0, total_count: 0 } }
  }
}

export const uploadContentAPI = async (
  base: string,
  formData: FormData,
  dbId?: string,
  knowledgeId?: string,
  authToken?: string
) => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  if (knowledgeId) queryParams.append('knowledge_id', knowledgeId)
  // Do NOT use createHeaders — FormData needs the browser to set Content-Type with boundary
  const headers: HeadersInit = {}
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`
  const response = await fetch(
    `${APIRoutes.UploadContent(base)}?${queryParams.toString()}`,
    { method: 'POST', headers, body: formData }
  )
  if (!response.ok) throw new Error(`Failed to upload content: ${response.statusText}`)
  return response.json()
}

export const deleteContentAPI = async (
  base: string,
  contentId: string,
  dbId?: string,
  knowledgeId?: string,
  authToken?: string
) => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  if (knowledgeId) queryParams.append('knowledge_id', knowledgeId)
  const response = await fetch(
    `${APIRoutes.DeleteContent(base, contentId)}?${queryParams.toString()}`,
    { method: 'DELETE', headers: createHeaders(authToken) }
  )
  if (!response.ok) throw new Error(`Failed to delete content: ${response.statusText}`)
  return response
}

export const deleteAllContentAPI = async (
  base: string,
  dbId?: string,
  knowledgeId?: string,
  authToken?: string
) => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  if (knowledgeId) queryParams.append('knowledge_id', knowledgeId)
  const response = await fetch(
    `${APIRoutes.DeleteAllContent(base)}?${queryParams.toString()}`,
    { method: 'DELETE', headers: createHeaders(authToken) }
  )
  if (!response.ok) throw new Error(`Failed to delete all content: ${response.statusText}`)
  return response
}

export const getContentStatusAPI = async (
  base: string,
  contentId: string,
  dbId?: string,
  knowledgeId?: string,
  authToken?: string
): Promise<ContentStatusResponse> => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  if (knowledgeId) queryParams.append('knowledge_id', knowledgeId)
  const response = await fetch(
    `${APIRoutes.GetContentStatus(base, contentId)}?${queryParams.toString()}`,
    { method: 'GET', headers: createHeaders(authToken) }
  )
  if (!response.ok) throw new Error(`Failed to get content status: ${response.statusText}`)
  return response.json()
}

export const searchKnowledgeAPI = async (
  base: string,
  request: VectorSearchRequest,
  authToken?: string
): Promise<{ data: VectorSearchResult[]; meta: any }> => {
  const response = await fetch(APIRoutes.SearchKnowledge(base), {
    method: 'POST',
    headers: createHeaders(authToken),
    body: JSON.stringify(request)
  })
  if (!response.ok) throw new Error(`Failed to search knowledge: ${response.statusText}`)
  return response.json()
}
