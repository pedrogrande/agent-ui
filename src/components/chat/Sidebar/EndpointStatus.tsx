'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { useStore } from '@/store'
import useChatActions from '@/hooks/useChatActions'
import { isValidUrl } from '@/lib/utils'
import { toast } from 'sonner'
import { useQueryState } from 'nuqs'
import { useState, useEffect } from 'react'
import Icon from '@/components/ui/icon'
import { ExternalLink } from 'lucide-react'

const EndpointModal = ({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const {
    selectedEndpoint,
    isEndpointActive,
    setSelectedEndpoint,
    setAgents,
    setSessionsData,
    setMessages
  } = useStore()
  const { initialize } = useChatActions()
  const [endpointValue, setEndpointValue] = useState('')
  const [isRotating, setIsRotating] = useState(false)
  const [, setAgentId] = useQueryState('agent')
  const [, setSessionId] = useQueryState('session')

  useEffect(() => {
    if (open) {
      setEndpointValue(selectedEndpoint)
    }
  }, [open, selectedEndpoint])

  const handleSave = async () => {
    if (!isValidUrl(endpointValue)) {
      toast.error('Please enter a valid URL')
      return
    }
    const cleanEndpoint = endpointValue.replace(/\/$/, '').trim()
    setSelectedEndpoint(cleanEndpoint)
    setAgentId(null)
    setSessionId(null)
    setAgents([])
    setSessionsData([])
    setMessages([])
    onOpenChange(false)
  }

  const handleRefresh = async () => {
    setIsRotating(true)
    await initialize()
    setTimeout(() => setIsRotating(false), 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-dmmono">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium uppercase text-primary">
            AgentOS Endpoint
          </DialogTitle>
          <DialogDescription className="text-xs text-muted">
            Configure the AgentOS API URL to connect to your agent platform.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-2">
            <div
              className={`size-2 shrink-0 rounded-full ${isEndpointActive ? 'bg-positive' : 'bg-destructive'}`}
            />
            <span className="text-xs font-medium text-muted">
              {isEndpointActive ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={endpointValue}
              onChange={(e) => setEndpointValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
              className="flex h-9 w-full items-center text-ellipsis rounded-xl border border-primary/15 bg-accent p-3 text-xs font-medium text-muted"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="hover:cursor-pointer hover:bg-transparent"
            >
              <div
                className={isRotating ? 'animate-spin' : ''}
              >
                <Icon type="refresh" size="xs" />
              </div>
            </Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs uppercase hover:cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-8 rounded-xl bg-primary text-xs font-medium uppercase text-background hover:bg-primary/80 hover:cursor-pointer"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const EndpointStatus = () => {
  const { isEndpointActive, selectedEndpoint } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 border-t border-primary/10 bg-background px-3 py-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 text-xs transition-colors hover:bg-accent"
        >
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={`size-2 shrink-0 rounded-full ${isEndpointActive ? 'bg-positive' : 'bg-destructive'}`}
            />
            <span className="truncate text-muted">
              {isEndpointActive ? 'API Connected' : 'API Not Connected'}
            </span>
          </div>
          <ExternalLink size={12} className="shrink-0 text-muted/60" />
        </button>
      </div>
      <EndpointModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}

export default EndpointStatus