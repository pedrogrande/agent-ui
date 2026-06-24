'use client'

import { useState, type FC } from 'react'
import { Check, Copy } from 'lucide-react'

import Tooltip from '@/components/ui/tooltip'

interface CopyButtonProps {
  content: string
  className?: string
}

const CopyButton: FC<CopyButtonProps> = ({ content, className }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Tooltip
      delayDuration={0}
      content={
        <p className="text-accent">{copied ? 'Copied!' : 'Copy message'}</p>
      }
      side="bottom"
    >
      <button
        type="button"
        onClick={handleCopy}
        className={`text-muted hover:text-primary flex items-center justify-center rounded-sm p-1 transition-colors ${className ?? ''}`}
        aria-label="Copy message"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </Tooltip>
  )
}

export default CopyButton
