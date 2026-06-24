'use client'

import * as React from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useStore } from '@/store'
import { MessageSquare, Clock, Brain, BookOpen } from 'lucide-react'

const viewOptions = [
  { value: 'chat' as const, label: 'Chat', icon: MessageSquare },
  { value: 'sessions' as const, label: 'Sessions', icon: Clock },
  { value: 'memory' as const, label: 'Memory', icon: Brain },
  { value: 'knowledge' as const, label: 'Knowledge', icon: BookOpen }
]

export function ViewSelector() {
  const { viewMode, setViewMode, isEndpointActive } = useStore()

  if (!isEndpointActive) return null

  return (
    <Select
      value={viewMode}
      onValueChange={(value) =>
        setViewMode(value as 'chat' | 'sessions' | 'memory' | 'knowledge')
      }
    >
      <SelectTrigger className="border-primary/15 bg-primaryAccent h-9 w-full rounded-xl border text-xs font-medium uppercase">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-primaryAccent font-dmmono border-none shadow-lg">
        {viewOptions.map(({ value, label, icon: IconComponent }) => (
          <SelectItem key={value} value={value} className="cursor-pointer">
            <div className="flex items-center gap-2 text-xs font-medium uppercase">
              <IconComponent size={14} />
              {label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
