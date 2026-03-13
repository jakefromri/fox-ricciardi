import { Link } from 'react-router-dom'
import { Post } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link to={`/blog/${post.slug}`}>
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer h-full border-border/60 hover:border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold leading-snug tracking-tight">
            {post.title}
          </CardTitle>
          <CardDescription className="text-xs">
            {formatDate(post.published_at)}
          </CardDescription>
        </CardHeader>
        {post.excerpt && (
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
