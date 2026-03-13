import { useParams } from 'react-router-dom'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { usePostBySlug } from '@/hooks/usePosts'
import { formatDate } from '@/lib/utils'

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading } = usePostBySlug(slug!)

  if (isLoading) {
    return <div className="text-muted-foreground py-12">Loading...</div>
  }

  if (!post) {
    return <div className="text-muted-foreground py-12">Post not found.</div>
  }

  const htmlContent = generateHTML(post.content, [
    StarterKit,
    Placeholder.configure({ placeholder: '' }),
  ])

  return (
    <article className="max-w-2xl mx-auto space-y-10">
      <header className="space-y-3 pb-8 border-b border-border">
        <h1 className="text-3xl font-semibold tracking-tight leading-snug">
          {post.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatDate(post.published_at)}
        </p>
      </header>

      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  )
}
