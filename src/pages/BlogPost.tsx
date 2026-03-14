import { useParams } from 'react-router-dom'
import { generateHTML } from '@tiptap/html'
import { usePostBySlug } from '@/hooks/usePosts'
import { getRendererExtensions } from '@/lib/editor-extensions'
import { formatDate } from '@/lib/utils'
import { PostVotes } from '@/components/blog/PostVotes'
import { PostComments } from '@/components/blog/PostComments'

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading } = usePostBySlug(slug!)

  if (isLoading) {
    return <div className="text-muted-foreground py-12">Loading...</div>
  }

  if (!post) {
    return <div className="text-muted-foreground py-12">Post not found.</div>
  }

  const htmlContent = generateHTML(post.content, getRendererExtensions())

  return (
    <article className="max-w-2xl mx-auto space-y-10">
      {/* Cover image — full width, above header */}
      {post.cover_image_url && (
        <div className="-mx-4 sm:-mx-6 rounded-xl overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>
      )}

      <header className="space-y-3 pb-8 border-b border-border">
        <h1 className="text-3xl font-semibold tracking-tight leading-snug">
          {post.title}
        </h1>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-muted-foreground">
            {formatDate(post.published_at)}
          </p>
          <PostVotes postId={post.id} />
        </div>
      </header>

      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      <PostComments postId={post.id} />
    </article>
  )
}
