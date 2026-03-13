import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImagePlus, X } from 'lucide-react'

export function BlogSettings() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', 1)
        .single()
      if (error) throw error
      return data as Profile
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const { data: result, error } = await supabase
        .from('profile')
        .update(data)
        .eq('id', 1)
        .select()
        .single()
      if (error) throw error
      return result as Profile
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const [blogName, setBlogName] = useState('')
  const [blogTagline, setBlogTagline] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setBlogName(profile.blog_name || 'Jake Ricciardi')
      setBlogTagline(profile.blog_tagline || '')
      setCoverImageUrl(profile.blog_cover_image_url || null)
    }
  }, [profile])

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
      const path = `site/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

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
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!blogName.trim()) {
      setError('Blog name is required')
      return
    }
    setError('')
    setSaved(false)
    try {
      await updateMutation.mutateAsync({
        blog_name: blogName.trim(),
        blog_tagline: blogTagline.trim() || null,
        blog_cover_image_url: coverImageUrl,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    }
  }

  if (isLoading) {
    return <div className="text-muted-foreground py-12">Loading...</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Blog Settings</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md border border-green-200">
          Settings saved.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identity</CardTitle>
          <CardDescription>Shown in the site header and homepage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blog-name">Blog name</Label>
            <Input
              id="blog-name"
              value={blogName}
              onChange={(e) => setBlogName(e.target.value)}
              placeholder="Jake Ricciardi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-tagline">
              Tagline <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="blog-tagline"
              value={blogTagline}
              onChange={(e) => setBlogTagline(e.target.value)}
              placeholder="A short description shown under your name on the homepage"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cover image</CardTitle>
          <CardDescription>Hero image shown at the top of the homepage</CardDescription>
        </CardHeader>
        <CardContent>
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
                alt="Blog cover"
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
                  onClick={() => {
                    setCoverImageUrl(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
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
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={updateMutation.isPending || isUploadingImage}>
        {updateMutation.isPending ? 'Saving...' : 'Save settings'}
      </Button>
    </div>
  )
}
