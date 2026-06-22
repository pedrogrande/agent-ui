'use client'
import Sidebar from '@/components/chat/Sidebar/Sidebar'
import { ChatArea } from '@/components/chat/ChatArea'
import SessionsView from '@/components/views/SessionsView'
import MemoryView from '@/components/views/MemoryView'
import KnowledgeView from '@/components/views/KnowledgeView'
import { Suspense } from 'react'
import { useStore } from '@/store'

export default function Home() {
  const hasEnvToken = !!process.env.NEXT_PUBLIC_OS_SECURITY_KEY
  const envToken = process.env.NEXT_PUBLIC_OS_SECURITY_KEY || ''
  const viewMode = useStore((state) => state.viewMode)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex h-screen bg-background/80">
        <Sidebar hasEnvToken={hasEnvToken} envToken={envToken} />
        {viewMode === 'chat' && <ChatArea />}
        {viewMode === 'sessions' && <SessionsView />}
        {viewMode === 'memory' && <MemoryView />}
        {viewMode === 'knowledge' && <KnowledgeView />}
      </div>
    </Suspense>
  )
}
