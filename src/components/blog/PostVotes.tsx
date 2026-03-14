import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { useVoteCounts, useSubmitVote, getStoredVote } from '@/hooks/useComments'
import { cn } from '@/lib/utils'

interface PostVotesProps {
  postId: string
}

export function PostVotes({ postId }: PostVotesProps) {
  const { data: counts } = useVoteCounts(postId)
  const submitVote = useSubmitVote()

  // Track the vote the user has already cast (from localStorage, initialised once)
  const [castedVote, setCastedVote] = useState<'up' | 'down' | null>(
    () => getStoredVote(postId)
  )

  const handleVote = async (type: 'up' | 'down') => {
    if (castedVote !== null) return // already voted — no-op
    try {
      await submitVote.mutateAsync({ post_id: postId, vote_type: type })
      setCastedVote(type)
    } catch {
      // DB unique constraint fired (edge case: same fingerprint from another tab)
      // Just mark as voted so the button disables
      setCastedVote(type)
    }
  }

  const hasVoted = castedVote !== null
  const isPending = submitVote.isPending

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => handleVote('up')}
        disabled={hasVoted || isPending}
        className={cn(
          'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors',
          castedVote === 'up'
            ? 'border-foreground bg-foreground text-background'
            : hasVoted
            ? 'border-border text-muted-foreground cursor-not-allowed opacity-50'
            : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        <span>{counts?.up ?? 0}</span>
      </button>

      <button
        type="button"
        onClick={() => handleVote('down')}
        disabled={hasVoted || isPending}
        className={cn(
          'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors',
          castedVote === 'down'
            ? 'border-foreground bg-foreground text-background'
            : hasVoted
            ? 'border-border text-muted-foreground cursor-not-allowed opacity-50'
            : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
        <span>{counts?.down ?? 0}</span>
      </button>

      {hasVoted && (
        <span className="text-xs text-muted-foreground">Thanks for your feedback</span>
      )}
    </div>
  )
}
