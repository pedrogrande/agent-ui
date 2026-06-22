'use client'
import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import {
  getMemoriesAPI,
  createMemoryAPI,
  updateMemoryAPI,
  deleteMemoryAPI,
  getUserMemoryStatsAPI,
  optimizeMemoriesAPI
} from '@/api/os'
import { UserMemory, UserStats } from '@/types/os'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { Trash2, Plus, Edit3, Sparkles, Search, X, Save } from 'lucide-react'
import { constructEndpointUrl } from '@/lib/constructEndpointUrl'

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—'
  return dayjs(date).format('DD MMM YYYY, HH:mm')
}

const MemoryForm = ({ memory, onSave, onCancel }: {
  memory: UserMemory | null
  onSave: (text: string, topics: string[]) => void
  onCancel: () => void
}) => {
  const [text, setText] = useState(memory?.memory || '')
  const [topicsInput, setTopicsInput] = useState(memory?.topics?.join(', ') || '')

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/15 bg-accent p-4">
      <div className="text-xs font-medium uppercase text-primary">
        {memory ? 'Edit Memory' : 'New Memory'}
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Memory content (1-5000 chars)..."
        className="min-h-[100px] resize-none text-sm"
        maxLength={5000}
      />
      <input
        type="text"
        value={topicsInput}
        onChange={(e) => setTopicsInput(e.target.value)}
        placeholder="Topics (comma-separated)..."
        className="h-9 rounded-xl border border-primary/15 bg-background px-3 text-xs"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(text, topicsInput.split(',').map(t => t.trim()).filter(Boolean))} disabled={!text.trim()}>
          <Save size={14} className="mr-1" /> Save
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

const MemoryView = () => {
  const { selectedEndpoint, authToken, isEndpointActive } = useStore()
  const [memories, setMemories] = useState<UserMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingMemory, setEditingMemory] = useState<UserMemory | null>(null)
  const [optimizing, setOptimizing] = useState(false)

  const fetchMemories = useCallback(async () => {
    setLoading(true)
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      const result = await getMemoriesAPI(base, {
        limit: 20,
        page,
        sort_by: 'updated_at',
        sort_order: 'desc',
        search_content: search || undefined,
      }, authToken)
      setMemories(result.data)
      setTotalPages(result.meta.total_pages)
    } catch {
      toast.error('Failed to fetch memories')
    } finally {
      setLoading(false)
    }
  }, [selectedEndpoint, page, search, authToken])

  const fetchStats = useCallback(async () => {
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      const data = await getUserMemoryStatsAPI(base, undefined, authToken)
      setStats(data)
    } catch {
      // silent fail
    }
  }, [selectedEndpoint, authToken])

  useEffect(() => {
    if (isEndpointActive) { fetchMemories(); fetchStats() }
  }, [fetchMemories, fetchStats, isEndpointActive])

  const handleSave = async (text: string, topics: string[]) => {
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      if (editingMemory) {
        await updateMemoryAPI(base, editingMemory.memory_id, { memory: text, topics }, undefined, authToken)
        toast.success('Memory updated')
      } else {
        await createMemoryAPI(base, { memory: text, topics }, undefined, authToken)
        toast.success('Memory created')
      }
      setShowForm(false)
      setEditingMemory(null)
      fetchMemories()
      fetchStats()
    } catch {
      toast.error('Failed to save memory')
    }
  }

  const handleDelete = async (memoryId: string) => {
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      await deleteMemoryAPI(base, memoryId, undefined, authToken)
      toast.success('Memory deleted')
      fetchMemories()
      fetchStats()
    } catch {
      toast.error('Failed to delete memory')
    }
  }

  const handleOptimize = async () => {
    setOptimizing(true)
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      // Preview first (apply=false)
      const preview = await optimizeMemoriesAPI(base, { user_id: 'user', apply: false }, undefined, authToken)
      const confirmed = confirm(
        `Optimize memories?\n\nBefore: ${preview.memories_before} memories, ${preview.tokens_before} tokens\n` +
        `After: ${preview.memories_after} memories, ${preview.tokens_after} tokens\n` +
        `Saved: ${preview.tokens_saved} tokens (${preview.reduction_percentage}% reduction)`
      )
      if (confirmed) {
        await optimizeMemoriesAPI(base, { user_id: 'user', apply: true }, undefined, authToken)
        toast.success('Memories optimized')
        fetchMemories()
        fetchStats()
      }
    } catch {
      toast.error('Failed to optimize memories')
    } finally {
      setOptimizing(false)
    }
  }

  if (!isEndpointActive) {
    return <div className="flex flex-1 items-center justify-center text-muted"><p>Connect to AgentOS first</p></div>
  }

  return (
    <div className="flex flex-1 overflow-hidden bg-background/80">
      {/* Left: Memory list */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-primary/10 p-4">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium uppercase text-primary">Memory</h2>
            {stats.length > 0 && (
              <span className="text-xs text-muted">
                {stats[0].total_memories} memories · Last updated {formatDate(stats[0].last_memory_updated_at)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search memories..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="h-9 w-56 rounded-xl border border-primary/15 bg-accent pl-9 pr-3 text-xs"
              />
            </div>
            <Button size="sm" variant="ghost" onClick={handleOptimize} disabled={optimizing}>
              <Sparkles size={14} className="mr-1" /> {optimizing ? 'Optimizing...' : 'Optimize'}
            </Button>
            <Button size="sm" onClick={() => { setEditingMemory(null); setShowForm(true) }}>
              <Plus size={14} className="mr-1" /> New
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : memories.length === 0 && !showForm ? (
            <div className="flex h-full items-center justify-center text-muted">
              <p>No memories yet. Create one or chat with an agent to build memories.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {showForm && (
                <MemoryForm
                  memory={editingMemory}
                  onSave={handleSave}
                  onCancel={() => { setShowForm(false); setEditingMemory(null) }}
                />
              )}
              {memories.map((memory) => (
                <div
                  key={memory.memory_id}
                  className="rounded-xl border border-primary/10 bg-accent/50 p-4 transition-colors hover:border-primary/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{memory.memory}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {memory.topics?.map((topic) => (
                          <span key={topic} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {topic}
                          </span>
                        ))}
                        <span className="text-xs text-muted">{formatDate(memory.updated_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingMemory(memory); setShowForm(true) }}>
                        <Edit3 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(memory.memory_id)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 border-t border-primary/10 p-3 text-xs text-muted">
            <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</Button>
            <span>Page {page} of {totalPages}</span>
            <Button variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MemoryView