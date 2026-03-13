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
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
          <CardDescription>
            {formatDate(post.published_at)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground">{post.excerpt}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
