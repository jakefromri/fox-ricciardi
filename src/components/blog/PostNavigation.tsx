import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useAdjacentPosts } from '@/hooks/usePosts'
import { Post } from '@/types'
import { formatDate, extractTextFromTipTap } from '@/lib/utils'

interface PostNavigationProps {
  currentPost: Post
}

interface NavCardProps {
  post: Post
  direction: 'prev' | 'next'
}

function NavCard({ post, direction }: NavCardProps) {
  const isPrev = direction === 'prev'
  const preview =
    post.excerpt?.trim() ||
    extractTextFromTipTap(post.content as Record<string, unknown>, 120)

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col gap-2 p-5 rounded-xl border border-border bg-card hover:border-foreground/30 hover:bg-muted/40 transition-colors"
    >
      {/* Direction label */}
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide font-medium">
        {isPrev && <ArrowLeft className="h-3 w-3" />}
        {isPrev ? 'Previous' : 'Next'}
        {!isPrev && <ArrowRight className="h-3 w-3" />}
      </span>

      {/* Title */}
      <p className="text-sm font-medium leading-snug group-hover:underline underline-offset-2 line-clamp-2">
        {post.title}
      </p>

      {/* Preview */}
      {preview && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {preview}
        </p>
      )}

      {/* Date */}
      <p className="text-xs text-muted-foreground mt-auto pt-1">
        {formatDate(post.published_at)}
      </p>
    </Link>
  )
}

export function PostNavigation({ currentPost }: PostNavigationProps) {
  const { data } = useAdjacentPosts(currentPost.published_at, currentPost.id)

  // Nothing to show if both are null (only post on the blog)
  if (!data || (!data.prev && !data.next)) return null

  return (
    <nav
      aria-label="Post navigation"
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 border-t border-border"
    >
      {/* Left slot — previous (older) */}
      <div>
        {data.prev && <NavCard post={data.prev} direction="prev" />}
      </div>

      {/* Right slot — next (newer) */}
      <div className={!data.prev ? 'sm:col-start-2' : ''}>
        {data.next && <NavCard post={data.next} direction="next" />}
      </div>
    </nav>
  )
}
