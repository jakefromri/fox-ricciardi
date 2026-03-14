import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePost, useCreatePost, useUpdatePost } from '@/hooks/usePosts'
import { supabase } from '@/lib/supabase'
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
import { ImagePlus, X } from 'lucide-react'

export function PostEditor() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isNewPost = !id
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: post, isLoading: isPostLoading } = usePost(id || '')
  const createPost = useCreatePost()
  const updatePost = useUpdatePost()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState({})
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  // For edit mode, delay mounting the RichTextEditor until post data is loaded
  // into state. TipTap only reads the `content` prop once at initialization,
  // so we must not mount it until the real content is ready.
  const [formReady, setFormReady] = useState(isNewPost)

  useEffect(() => {
    if (!isNewPost && post) {
      setTitle(post.title)
      setSlug(post.slug)
      setExcerpt(post.excerpt || '')
      setContent(post.content || {})
      setStatus(post.status)
      setCoverImageUrl(post.cover_image_url || null)
      setFormReady(true)
    }
  }, [post, isNewPost])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (isNewPost && !slug) {
      setSlug(slugify(value))
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, WebP, or GIF image.')
      return
    }

    setIsUploadingImage(true)
    setError('')

    try {
      const ext = file.name.split('.').pop()
      const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, file, { upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(path)

      setCoverImageUrl(data.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setIsUploadingImage(false)
      // Reset input so the same file can be re-selected after removal
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveCoverImage = () => {
    setCoverImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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
        cover_image_url: coverImageUrl,
        published_at:
          status === 'published' && post?.status !== 'published'
            ? new Date().toISOString()
            : post?.published_at || null,
      }

      if (isNewPost) {
        await createPost.mutateAsync(postData as any)
      } else {
        await updatePost.mutateAsync({ id: id!, post: postData })
      }

      navigate('/admin/posts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isNewPost && isPostLoading) {
    return <div className="text-muted-foreground py-12">Loading post...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">
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

      {/* Cover Image */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleImageSelect}
        />
        {coverImageUrl ? (
          <div className="relative w-full rounded-lg overflow-hidden border border-border group">
            <img
              src={coverImageUrl}
              alt="Cover"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
              >
                Replace
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemoveCoverImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-sm">
              {isUploadingImage ? 'Uploading...' : 'Add cover image'}
            </span>
          </button>
        )}
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
        {formReady ? <RichTextEditor
          content={content}
          onChange={setContent}
          onImageUpload={async (file) => {
            const ext = file.name.split('.').pop()
            const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
            const { error: uploadError } = await supabase.storage
              .from('post-images')
              .upload(path, file, { upsert: false })
            if (uploadError) throw uploadError
            const { data } = supabase.storage.from('post-images').getPublicUrl(path)
            return data.publicUrl
          }}
        /> : (
          <div className="h-32 rounded-lg border border-border flex items-center justify-center text-muted-foreground text-sm">
            Loading content…
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isSaving || isUploadingImage}>
          {isSaving ? 'Saving...' : 'Save Post'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/posts')}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
