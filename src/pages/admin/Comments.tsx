import { useAllComments, useDeleteComment } from '@/hooks/useComments'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2 } from 'lucide-react'

export function Comments() {
  const { data: comments, isLoading } = useAllComments()
  const deleteComment = useDeleteComment()

  const handleDelete = async (id: string) => {
    if (confirm('Delete this comment? This cannot be undone.')) {
      try {
        await deleteComment.mutateAsync(id)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete comment')
      }
    }
  }

  if (isLoading) {
    return <div className="text-muted-foreground py-12">Loading comments…</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Comments</h1>
        <span className="text-sm text-muted-foreground">
          {comments?.length ?? 0} total
        </span>
      </div>

      {!comments || comments.length === 0 ? (
        <p className="text-muted-foreground">No comments yet.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="text-sm font-medium whitespace-nowrap max-w-[140px] truncate">
                    {comment.posts?.title ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {comment.author_name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    <span className="line-clamp-2">{comment.body}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(comment.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deleteComment.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
