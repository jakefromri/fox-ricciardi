import { usePublishedPosts } from '@/hooks/usePosts'
import { PostCard } from '@/components/blog/PostCard'

export function Blog() {
  const { data: posts, isLoading } = usePublishedPosts()

  if (isLoading) {
    return <div>Loading posts...</div>
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
