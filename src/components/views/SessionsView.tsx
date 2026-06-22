'use client'
import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import { getAllSessionsPaginatedAPI, getSessionDetailAPI, deleteSessionAPI, renameSessionAPI } from '@/api/os'
import { SessionEntry, AgentSessionDetail, TeamSessionDetail, WorkflowSessionDetail } from '@/types/os'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { Trash2, Edit3, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { constructEndpointUrl } from '@/lib/constructEndpointUrl'

const formatDate = (date: string | number | null | undefined) => {
  if (!date) return '—'
  return dayjs(typeof date === 'number' ? date * 1000 : date).format('DD MMM YYYY, HH:mm')
}

const SessionDetailPanel = ({ sessionId, type, onClose }: { sessionId: string; type: string; onClose: () => void }) => {
  const { selectedEndpoint, authToken } = useStore()
  const [detail, setDetail] = useState<AgentSessionDetail | TeamSessionDetail | WorkflowSessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')

  const fetchDetail = useCallback(async () => {
    setLoading(true)
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      const data = await getSessionDetailAPI(base, sessionId, type, undefined, authToken)
      setDetail(data)
      setEditName(data.session_name || '')
    } catch {
      toast.error('Failed to load session detail')
    } finally {
      setLoading(false)
    }
  }, [selectedEndpoint, sessionId, type, authToken])

  useEffect(() => { fetchDetail() }, [fetchDetail])

  const handleRename = async () => {
    if (!editName.trim()) return
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      await renameSessionAPI(base, sessionId, editName.trim(), type, undefined, authToken)
      toast.success('Session renamed')
      setIsEditing(false)
      fetchDetail()
    } catch {
      toast.error('Failed to rename session')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted">
        <p>Session not found</p>
      </div>
    )
  }

  const chatHistory = (detail as AgentSessionDetail).chat_history || (detail as TeamSessionDetail).chat_history || []
  const totalTokens = (detail as AgentSessionDetail).total_tokens

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-primary/10 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="rounded-lg border border-primary/20 bg-accent px-3 py-1.5 text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleRename}>Save</Button>
            </div>
          ) : (
            <h2 className="text-sm font-medium text-foreground">{detail.session_name}</h2>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
            <Edit3 size={14} />
          </Button>
        </div>
      </div>
      <div className="flex gap-4 border-b border-primary/10 px-4 py-2 text-xs text-muted">
        <span>Type: <span className="text-foreground">{type}</span></span>
        <span>Created: <span className="text-foreground">{formatDate(detail.created_at)}</span></span>
        {totalTokens !== undefined && totalTokens !== null && (
          <span>Tokens: <span className="text-foreground">{totalTokens}</span></span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {chatHistory.length === 0 ? (
          <p className="text-center text-muted">No chat history available</p>
        ) : (
          <div className="flex flex-col gap-4">
            {chatHistory.map((entry: { role?: string; content?: string; message?: { role?: string; content?: string } }, idx: number) => {
              const role = entry.role || (entry.message?.role) || 'unknown'
              const content = entry.content || entry.message?.content || ''
              const isUser = role === 'user'
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl p-3 text-sm ${isUser ? 'bg-primary/10 text-foreground' : 'bg-accent text-muted'}`}>
                    <div className="mb-1 text-xs font-medium uppercase opacity-60">{role}</div>
                    <div className="whitespace-pre-wrap break-words">{content}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const SessionsView = () => {
  const { selectedEndpoint, authToken, isEndpointActive } = useStore()
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedSession, setSelectedSession] = useState<{ id: string; type: string } | null>(null)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      const result = await getAllSessionsPaginatedAPI(base, {
        limit: 20,
        page,
        sort_by: 'created_at',
        sort_order: 'desc',
        session_name: search || undefined,
      }, authToken)
      setSessions(result.data)
      setTotalPages(result.meta.total_pages)
      setTotalCount(result.meta.total_count)
    } catch {
      toast.error('Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }, [selectedEndpoint, page, search, authToken])

  useEffect(() => {
    if (isEndpointActive) fetchSessions()
  }, [fetchSessions, isEndpointActive])

  const handleDelete = async (sessionId: string) => {
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      await deleteSessionAPI(base, '', sessionId, authToken)
      toast.success('Session deleted')
      fetchSessions()
    } catch {
      toast.error('Failed to delete session')
    }
  }

  if (!isEndpointActive) {
    return <div className="flex flex-1 items-center justify-center text-muted"><p>Connect to AgentOS first</p></div>
  }

  if (selectedSession) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-background/80">
        <SessionDetailPanel
          sessionId={selectedSession.id}
          type={selectedSession.type}
          onClose={() => setSelectedSession(null)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background/80">
      <div className="flex items-center justify-between border-b border-primary/10 p-4">
        <h2 className="text-sm font-medium uppercase text-primary">Sessions ({totalCount})</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="h-9 w-64 rounded-xl border border-primary/15 bg-accent pl-9 pr-3 text-xs"
            />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted">
            <p>No sessions found. Start a chat to create one.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-4">
            {sessions.map((session) => (
              <div
                key={session.session_id}
                className="flex items-center justify-between rounded-xl border border-primary/10 bg-accent/50 p-4 transition-colors hover:border-primary/20 hover:bg-accent"
              >
                <div
                  className="flex flex-1 cursor-pointer flex-col gap-1"
                  onClick={() => setSelectedSession({ id: session.session_id, type: session.session_type || 'agent' })}
                >
                  <div className="text-sm font-medium text-foreground">{session.session_name}</div>
                  <div className="flex gap-4 text-xs text-muted">
                    <span>{session.session_type || 'agent'}</span>
                    <span>{formatDate(session.created_at)}</span>
                    {session.total_tokens !== undefined && session.total_tokens !== null && (
                      <span>{session.total_tokens} tokens</span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(session.session_id)}>
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 border-t border-primary/10 p-3 text-xs text-muted">
          <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={16} />
          </Button>
          <span>Page {page} of {totalPages}</span>
          <Button variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}

export default SessionsView