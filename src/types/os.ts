export interface ToolCall {
  role: 'user' | 'tool' | 'system' | 'assistant'
  content: string | null
  tool_call_id: string
  tool_name: string
  tool_args: Record<string, string>
  tool_call_error: boolean
  metrics: {
    time: number
  }
  created_at: number
}

export interface ReasoningSteps {
  title: string
  action?: string
  result: string
  reasoning: string
  confidence?: number
  next_action?: string
}
export interface ReasoningStepProps {
  index: number
  stepTitle: string
}
export interface ReasoningProps {
  reasoning: ReasoningSteps[]
}

export type ToolCallProps = {
  tools: ToolCall
}
interface ModelMessage {
  content: string | null
  context?: MessageContext[]
  created_at: number
  metrics?: {
    time: number
    prompt_tokens: number
    input_tokens: number
    completion_tokens: number
    output_tokens: number
  }
  name: string | null
  role: string
  tool_args?: unknown
  tool_call_id: string | null
  tool_calls: Array<{
    function: {
      arguments: string
      name: string
    }
    id: string
    type: string
  }> | null
}

export interface Model {
  name: string
  model: string
  provider: string
}

export interface Agent {
  agent_id: string
  name: string
  description: string
  model: Model
  storage?: boolean
}

export interface Team {
  team_id: string
  name: string
  description: string
  model: Model
  storage?: boolean
}

interface MessageContext {
  query: string
  docs?: Array<Record<string, object>>
  time?: number
}

export enum RunEvent {
  RunStarted = 'RunStarted',
  RunContent = 'RunContent',
  RunCompleted = 'RunCompleted',
  RunError = 'RunError',
  RunOutput = 'RunOutput',
  UpdatingMemory = 'UpdatingMemory',
  ToolCallStarted = 'ToolCallStarted',
  ToolCallCompleted = 'ToolCallCompleted',
  MemoryUpdateStarted = 'MemoryUpdateStarted',
  MemoryUpdateCompleted = 'MemoryUpdateCompleted',
  ReasoningStarted = 'ReasoningStarted',
  ReasoningStep = 'ReasoningStep',
  ReasoningCompleted = 'ReasoningCompleted',
  RunCancelled = 'RunCancelled',
  RunPaused = 'RunPaused',
  RunContinued = 'RunContinued',
  // Team Events
  TeamRunStarted = 'TeamRunStarted',
  TeamRunContent = 'TeamRunContent',
  TeamRunCompleted = 'TeamRunCompleted',
  TeamRunError = 'TeamRunError',
  TeamRunCancelled = 'TeamRunCancelled',
  TeamToolCallStarted = 'TeamToolCallStarted',
  TeamToolCallCompleted = 'TeamToolCallCompleted',
  TeamReasoningStarted = 'TeamReasoningStarted',
  TeamReasoningStep = 'TeamReasoningStep',
  TeamReasoningCompleted = 'TeamReasoningCompleted',
  TeamMemoryUpdateStarted = 'TeamMemoryUpdateStarted',
  TeamMemoryUpdateCompleted = 'TeamMemoryUpdateCompleted'
}

export interface ResponseAudio {
  id?: string
  content?: string
  transcript?: string
  channels?: number
  sample_rate?: number
}

export interface NewRunResponse {
  status: 'RUNNING' | 'PAUSED' | 'CANCELLED'
}

export interface RunResponseContent {
  content?: string | object
  content_type: string
  context?: MessageContext[]
  event: RunEvent
  event_data?: object
  messages?: ModelMessage[]
  metrics?: object
  model?: string
  run_id?: string
  agent_id?: string
  session_id?: string
  tool?: ToolCall
  tools?: Array<ToolCall>
  created_at: number
  extra_data?: AgentExtraData
  images?: ImageData[]
  videos?: VideoData[]
  audio?: AudioData[]
  response_audio?: ResponseAudio
}

export interface RunResponse {
  content?: string | object
  content_type: string
  context?: MessageContext[]
  event: RunEvent
  event_data?: object
  messages?: ModelMessage[]
  metrics?: object
  model?: string
  run_id?: string
  agent_id?: string
  session_id?: string
  tool?: ToolCall
  tools?: Array<ToolCall>
  created_at: number
  extra_data?: AgentExtraData
  images?: ImageData[]
  videos?: VideoData[]
  audio?: AudioData[]
  response_audio?: ResponseAudio
}

export interface AgentExtraData {
  reasoning_steps?: ReasoningSteps[]
  reasoning_messages?: ReasoningMessage[]
  references?: ReferenceData[]
}

export interface AgentExtraData {
  reasoning_messages?: ReasoningMessage[]
  references?: ReferenceData[]
}

export interface ReasoningMessage {
  role: 'user' | 'tool' | 'system' | 'assistant'
  content: string | null
  tool_call_id?: string
  tool_name?: string
  tool_args?: Record<string, string>
  tool_call_error?: boolean
  metrics?: {
    time: number
  }
  created_at?: number
}
export interface ChatMessage {
  role: 'user' | 'agent' | 'system' | 'tool'
  content: string
  streamingError?: boolean
  created_at: number
  tool_calls?: ToolCall[]
  extra_data?: {
    reasoning_steps?: ReasoningSteps[]
    reasoning_messages?: ReasoningMessage[]
    references?: ReferenceData[]
  }
  images?: ImageData[]
  videos?: VideoData[]
  audio?: AudioData[]
  response_audio?: ResponseAudio
}

export interface AgentDetails {
  id: string
  name?: string
  db_id?: string
  // Model
  model?: Model
}

export interface TeamDetails {
  id: string
  name?: string
  db_id?: string

  // Model
  model?: Model
}

export interface ImageData {
  revised_prompt: string
  url: string
}

export interface VideoData {
  id: number
  eta: number
  url: string
}

export interface AudioData {
  base64_audio?: string
  mime_type?: string
  url?: string
  id?: string
  content?: string
  channels?: number
  sample_rate?: number
}

export interface ReferenceData {
  query: string
  references: Reference[]
  time?: number
}

export interface Reference {
  content: string
  meta_data: {
    chunk: number
    chunk_size: number
  }
  name: string
}

export interface SessionEntry {
  session_id: string
  session_name: string
  created_at: string | number
  updated_at?: string | number
  session_type?: string
  agent_id?: string | null
  team_id?: string | null
  workflow_id?: string | null
  user_id?: string | null
  total_tokens?: number | null
}

export interface Pagination {
  page: number
  limit: number
  total_pages: number
  total_count: number
  search_time_ms?: number
}

export interface Sessions extends SessionEntry {
  data: SessionEntry[]
  meta: Pagination
}

// ---------------------------------------------------------------------------
// Session Detail types (GET /sessions/{id})
// ---------------------------------------------------------------------------

export interface AgentSessionDetail {
  user_id: string | null
  agent_session_id: string
  session_id: string
  session_name: string
  session_summary: Record<string, any> | null
  session_state: Record<string, any> | null
  agent_id: string | null
  total_tokens: number | null
  agent_data: Record<string, any> | null
  metrics: Record<string, any> | null
  metadata: Record<string, any> | null
  chat_history: Record<string, any>[] | null
  created_at: string | null
  updated_at: string | null
}

export interface TeamSessionDetail {
  session_id: string
  session_name: string
  user_id: string | null
  team_id: string | null
  session_summary: Record<string, any> | null
  session_state: Record<string, any> | null
  metrics: Record<string, any> | null
  team_data: Record<string, any> | null
  metadata: Record<string, any> | null
  chat_history: Record<string, any>[] | null
  created_at: string | null
  updated_at: string | null
  total_tokens: number | null
}

export interface WorkflowSessionDetail {
  user_id: string | null
  workflow_id: string | null
  workflow_name: string | null
  session_id: string
  session_name: string
  session_data: Record<string, any> | null
  session_state: Record<string, any> | null
  workflow_data: Record<string, any> | null
  metadata: Record<string, any> | null
  created_at: string | null
  updated_at: string | null
}

export type SessionDetail = AgentSessionDetail | TeamSessionDetail | WorkflowSessionDetail

export interface DeleteSessionsRequest {
  session_ids: string[]
  session_types: string[]
}

// ---------------------------------------------------------------------------
// Memory types
// ---------------------------------------------------------------------------

export interface UserMemory {
  memory_id: string
  memory: string
  topics: string[] | null
  agent_id: string | null
  team_id: string | null
  user_id: string | null
  updated_at: string | null
}

export interface UserMemoryCreate {
  memory: string
  user_id?: string
  topics?: string[]
}

export interface DeleteMemoriesRequest {
  memory_ids: string[]
  user_id?: string
}

export interface UserStats {
  user_id: string
  total_memories: number
  last_memory_updated_at: string | null
}

export interface OptimizeMemoriesRequest {
  user_id: string
  model?: string
  apply: boolean
}

export interface OptimizeMemoriesResponse {
  memories: UserMemory[]
  memories_before: number
  memories_after: number
  tokens_before: number
  tokens_after: number
  tokens_saved: number
  reduction_percentage: number
}

// ---------------------------------------------------------------------------
// Knowledge types
// ---------------------------------------------------------------------------

export type ContentStatus = 'processing' | 'completed' | 'failed'

export interface ContentResponse {
  id: string
  name: string | null
  description: string | null
  type: string | null
  size: string | null
  linked_to: string | null
  metadata: Record<string, any> | null
  access_count: number | null
  status: ContentStatus | null
  status_message: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ContentStatusResponse {
  id: string | null
  status: ContentStatus
  status_message: string
}

export interface VectorSearchRequest {
  query: string
  db_id?: string
  knowledge_id?: string
  vector_db_ids?: string[]
  search_type?: string
  max_results?: number
  filters?: Record<string, any>
  meta?: {
    limit?: number
    page?: number
  }
}

export interface VectorSearchResult {
  id: string
  content: string
  name: string | null
  meta_data: Record<string, any> | null
  usage: Record<string, any> | null
  reranking_score: number | null
  content_id: string | null
  content_origin: string | null
  size: number | null
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: Pagination
}

export interface ChatEntry {
  message: {
    role: 'user' | 'system' | 'tool' | 'assistant'
    content: string
    created_at: number
  }
  response: {
    content: string
    tools?: ToolCall[]
    extra_data?: {
      reasoning_steps?: ReasoningSteps[]
      reasoning_messages?: ReasoningMessage[]
      references?: ReferenceData[]
    }
    images?: ImageData[]
    videos?: VideoData[]
    audio?: AudioData[]
    response_audio?: {
      transcript?: string
    }
    created_at: number
  }
}
