'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CopyableFieldProps {
  value: string
  label: string
  type?: 'email' | 'phone' | 'text'
  showIcon?: boolean
}

export function CopyableField({ value, label, type = 'text', showIcon = true }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getHref = () => {
    if (type === 'email') return `mailto:${value}`
    if (type === 'phone') return `tel:${value}`
    return undefined
  }

  const href = getHref()

  return (
    <div className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {href ? (
          <a
            href={href}
            className="font-medium text-primary hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="font-medium break-all">{value}</p>
        )}
      </div>
      {showIcon && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="flex-shrink-0"
          aria-label={`Copiar ${label}`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  )
}
