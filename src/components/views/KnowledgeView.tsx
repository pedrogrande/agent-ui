'use client'
import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import {
  getKnowledgeContentAPI,
  uploadContentAPI,
  deleteContentAPI,
  getContentStatusAPI,
  searchKnowledgeAPI
} from '@/api/os'
import { ContentResponse, VectorSearchResult, ContentStatus } from '@/types/os'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TextArea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { Trash2, Upload, Search, FileText, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { constructEndpointUrl } from '@/lib/constructEndpointUrl'

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—'
  return dayjs(date).format('DD MMM YYYY, HH:mm')
}

const formatSize = (size: string | null | undefined) => {
  if (!size) return '—'
  const bytes = parseInt(size, 10)
  if (isNaN(bytes)) return size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const statusColors: Record<ContentStatus, string> = {
  processing: 'bg-yellow-500/20 text-yellow-600',
  completed: 'bg-green-500/20 text-green-600',
  failed: 'bg-red-500/20 text-red-600',
}

const KnowledgeView = () => {
  const { selectedEndpoint, authToken, isEndpointActive } = useStore()
  const [content, setContent] = useState<ContentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [activeTab, setActiveTab] = useState<'content' | 'upload' | 'search'>('content')

  // Upload state
  const [uploadText, setUploadText] = useState('')
  const [uploadUrl, setUploadUrl] = useState('')
  const [uploadName, setUploadName] = useState('')
  const [uploading, setUploading] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('hybrid')
  const [maxResults, setMaxResults] = useState(5)
  const [searchResults, setSearchResults] = useState<VectorSearchResult[]>([])
  const [searching, setSearching] = useState(false)

  const fetchContent = useCallback(async () => {
    setLoading(true)
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      const result = await getKnowledgeContentAPI(base, {
        limit: 20,
        page,
        sort_by: 'created_at',
        sort_order: 'desc',
      }, authToken)
      setContent(result.data)
      setTotalPages(result.meta.total_pages)
    } catch {
      toast.error('Failed to fetch knowledge content')
    } finally {
      setLoading(false)
    }
  }, [selectedEndpoint, page, authToken])

  useEffect(() => {
    if (isEndpointActive && activeTab === 'content') fetchContent()
  }, [fetchContent, isEndpointActive, activeTab])

  const handleUploadText = async () => {
    if (!uploadText.trim()) return
    setUploading(true)
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      const formData = new FormData()
      if (uploadName) formData.append('name', uploadName)
      formData.append('text_content', uploadText)
      await uploadContentAPI(base, formData, undefined, undefined, authToken)
      toast.success('Content uploaded — processing')
      setUploadText('')
      setUploadName('')
      setActiveTab('content')
      fetchContent()
    } catch {
      toast.error('Failed to upload content')
    } finally {
      setUploading(false)
    }
  }

  const handleUploadUrl = async () => {
    if (!uploadUrl.trim()) return
    setUploading(true)
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      const formData = new FormData()
      if (uploadName) formData.append('name', uploadName)
      formData.append('url', JSON.stringify([uploadUrl]))
      await uploadContentAPI(base, formData, undefined, undefined, authToken)
      toast.success('URL content uploaded — processing')
      setUploadUrl('')
      setUploadName('')
      setActiveTab('content')
      fetchContent()
    } catch {
      toast.error('Failed to upload URL content')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (contentId: string) => {
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      await deleteContentAPI(base, contentId, undefined, undefined, authToken)
      toast.success('Content deleted')
      fetchContent()
    } catch {
      toast.error('Failed to delete content')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const base = constructEndpointUrl(selectedEndpoint)
      const result = await searchKnowledgeAPI(base, {
        query: searchQuery,
        search_type: searchType,
        max_results: maxResults,
      }, authToken)
      setSearchResults(result.data || [])
    } catch {
      toast.error('Failed to search knowledge')
    } finally {
      setSearching(false)
    }
  }

  if (!isEndpointActive) {
    return <div className="flex flex-1 items-center justify-center text-muted"><p>Connect to AgentOS first</p></div>
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background/80">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-primary/10 p-2">
        {(['content', 'upload', 'search'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-xs font-medium uppercase transition-colors ${
              activeTab === tab ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-accent'
            }`}
          >
            {tab === 'content' && 'Content'}
            {tab === 'upload' && 'Upload'}
            {tab === 'search' && 'Search'}
          </button>
        ))}
      </div>

      {/* Content tab */}
      {activeTab === 'content' && (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : content.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted">
                <div className="text-center">
                  <p>No knowledge content yet.</p>
                  <p className="mt-1">Switch to the Upload tab to add documents.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {content.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-primary/10 bg-accent/50 p-4">
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.name || 'Unnamed'}</span>
                        {item.status && (
                          <span className={`rounded-md px-2 py-0.5 text-xs ${statusColors[item.status]}`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs text-muted">
                        <span>{item.type || 'unknown'}</span>
                        <span>{formatSize(item.size)}</span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
        </>
      )}

      {/* Upload tab */}
      {activeTab === 'upload' && (
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          <div className="flex flex-col gap-3 rounded-xl border border-primary/15 bg-accent p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase text-primary">
              <FileText size={14} /> Upload Text Content
            </div>
            <input
              type="text"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="Document name (optional)"
              className="h-9 rounded-xl border border-primary/15 bg-background px-3 text-xs"
            />
            <TextArea
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              placeholder="Paste text content here..."
              className="min-h-[120px] resize-none text-sm"
            />
            <Button size="sm" onClick={handleUploadText} disabled={!uploadText.trim() || uploading}>
              <Upload size={14} className="mr-1" /> {uploading ? 'Uploading...' : 'Upload Text'}
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-primary/15 bg-accent p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase text-primary">
              <LinkIcon size={14} /> Upload from URL
            </div>
            <input
              type="text"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="Document name (optional)"
              className="h-9 rounded-xl border border-primary/15 bg-background px-3 text-xs"
            />
            <input
              type="text"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              placeholder="https://example.com/document.pdf"
              className="h-9 rounded-xl border border-primary/15 bg-background px-3 text-xs"
            />
            <Button size="sm" onClick={handleUploadUrl} disabled={!uploadUrl.trim() || uploading}>
              <Upload size={14} className="mr-1" /> {uploading ? 'Uploading...' : 'Upload URL'}
            </Button>
          </div>
        </div>
      )}

      {/* Search tab */}
      {activeTab === 'search' && (
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="flex flex-col gap-3 rounded-xl border border-primary/15 bg-accent p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase text-primary">
              <Search size={14} /> Search Knowledge Base
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search query..."
                className="h-9 flex-1 rounded-xl border border-primary/15 bg-background px-3 text-xs"
              />
              <Button size="sm" onClick={handleSearch} disabled={!searchQuery.trim() || searching}>
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted">Type:</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="h-8 rounded-lg border border-primary/15 bg-background px-2 text-xs"
                >
                  <option value="hybrid">Hybrid</option>
                  <option value="vector">Vector</option>
                  <option value="keyword">Keyword</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted">Max results:</label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                  className="w-24"
                />
                <span className="text-xs text-muted">{maxResults}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted">
                <p>Enter a query and click Search to find documents.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {searchResults.map((result) => (
                  <div key={result.id} className="rounded-xl border border-primary/10 bg-accent/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{result.name || 'Unnamed'}</span>
                      {result.reranking_score !== null && (
                        <span className="text-xs text-muted">Score: {(result.reranking_score * 100).toFixed(1)}%</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted line-clamp-4">{result.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default KnowledgeView