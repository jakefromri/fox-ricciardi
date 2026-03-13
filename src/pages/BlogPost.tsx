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
    return <div>Loading post...</div>
  }

  if (!post) {
    return <div>Post not found.</div>
  }

  const htmlContent = generateHTML(post.content, [
    StarterKit,
    Placeholder.configure({ placeholder: '' }),
  ])

  return (
    <article className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <p className="text-muted-foreground">
          {formatDate(post.published_at)}
        </p>
      </header>

      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  )
}
