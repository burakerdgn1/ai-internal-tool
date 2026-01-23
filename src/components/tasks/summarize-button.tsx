'use client'

import { useState, useTransition } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { summarizeTask } from '@/app/dashboard/actions'

interface SummarizeButtonProps {
  taskId: string
}

export function SummarizeButton({ taskId }: SummarizeButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleSummarize = () => {
    setError('')
    startTransition(async () => {
      const result = await summarizeTask(taskId)
      if (result.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleSummarize} 
        disabled={isPending}
        className="text-xs text-muted-foreground w-fit h-auto py-1 px-2"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-1 h-3 w-3" />
            Summarize with AI
          </>
        )}
      </Button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}