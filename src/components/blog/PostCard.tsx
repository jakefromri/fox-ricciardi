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
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer h-full border-border/60 hover:border-border overflow-hidden">
        {post.cover_image_url && (
          <div className="w-full h-40 overflow-hidden">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
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
