import { useState } from 'react'
import { useComments, useCreateComment } from '@/hooks/useComments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/utils'

const MAX_BODY = 500
const MAX_NAME = 100

interface PostCommentsProps {
  postId: string
}

export function PostComments({ postId }: PostCommentsProps) {
  const { data: comments, isLoading } = useComments(postId)
  const createComment = useCreateComment()

  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedBody = body.trim()

    if (!trimmedName || !trimmedBody) {
      setError('Name and comment are required.')
      return
    }
    if (trimmedBody.length > MAX_BODY) {
      setError(`Comment must be ${MAX_BODY} characters or fewer.`)
      return
    }

    setError('')
    try {
      await createComment.mutateAsync({
        post_id: postId,
        author_name: trimmedName,
        body: trimmedBody,
      })
      setName('')
      setBody('')
      setSubmitted(true)
      // Reset the success message after a few seconds
      setTimeout(() => setSubmitted(false), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment.')
    }
  }

  const count = comments?.length ?? 0

  return (
    <section className="space-y-8 pt-10 border-t border-border">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <h2 className="text-lg font-medium">
        {count === 0 ? 'No comments yet' : `${count} comment${count === 1 ? '' : 's'}`}
      </h2>

      {/* ── Comment list ────────────────────────────────────────────── */}
      {!isLoading && comments && comments.length > 0 && (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <li key={comment.id} className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{comment.author_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}

      {/* ── Form ────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Leave a comment
        </h3>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {submitted && (
          <p className="text-sm text-muted-foreground">Comment posted — thanks!</p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="comment-name">Name</Label>
          <Input
            id="comment-name"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
            placeholder="Your name"
            disabled={createComment.isPending}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="comment-body">Comment</Label>
            <span
              className={`text-xs tabular-nums ${
                body.length > MAX_BODY * 0.9
                  ? body.length >= MAX_BODY
                    ? 'text-destructive'
                    : 'text-amber-600'
                  : 'text-muted-foreground'
              }`}
            >
              {body.length}/{MAX_BODY}
            </span>
          </div>
          <textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
            placeholder="Write a comment…"
            rows={4}
            disabled={createComment.isPending}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={createComment.isPending || !name.trim() || !body.trim()}
        >
          {createComment.isPending ? 'Posting…' : 'Post comment'}
        </Button>
      </form>
    </section>
  )
}
