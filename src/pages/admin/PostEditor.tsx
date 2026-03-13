import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePost, useCreatePost, useUpdatePost } from '@/hooks/usePosts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { slugify } from '@/lib/utils'
import { Post } from '@/types'

export function PostEditor() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isNewPost = !id

  const { data: post, isLoading: isPostLoading } = usePost(id || '')
  const createPost = useCreatePost()
  const updatePost = useUpdatePost()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState({})
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isNewPost && post) {
      setTitle(post.title)
      setSlug(post.slug)
      setExcerpt(post.excerpt || '')
      setContent(post.content || {})
      setStatus(post.status)
    }
  }, [post, isNewPost])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (isNewPost && !slug) {
      setSlug(slugify(value))
    }
  }

  const handleSave = async () => {
    if (!title || !slug) {
      setError('Title and slug are required')
      return
    }

    setError('')
    setIsSaving(true)

    try {
      const postData = {
        title,
        slug,
        excerpt,
        content,
        status,
        published_at:
          status === 'published' && post?.status !== 'published'
            ? new Date().toISOString()
            : post?.published_at || null,
      }

      if (isNewPost) {
        await createPost.mutateAsync(postData as any)
      } else {
        await updatePost.mutateAsync({
          id: id!,
          post: postData,
        })
      }

      navigate('/admin/posts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isNewPost && isPostLoading) {
    return <div>Loading post...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {isNewPost ? 'New Post' : 'Edit Post'}
      </h1>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="post-slug"
          disabled={!isNewPost && post?.status === 'published'}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Input
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief summary of the post"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value: any) => setStatus(value)}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Post'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/posts')}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
