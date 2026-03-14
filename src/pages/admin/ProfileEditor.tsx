import { useEffect, useState } from 'react'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ProfileEditor() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '')
      setEmail(profile.email || '')
      setLinkedinUrl(profile.linkedin_url || '')
      setInstagramUrl(profile.instagram_url || '')
    }
  }, [profile])

  const handleSave = async () => {
    setError('')
    setSaved(false)
    try {
      await updateProfile.mutateAsync({
        bio,
        email: email || null,
        linkedin_url: linkedinUrl || null,
        instagram_url: instagramUrl || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    }
  }

  if (isLoading) {
    return <div className="text-muted-foreground py-12">Loading...</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md border border-green-200">
          Profile saved.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
          <CardDescription>Shown on your homepage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio shown on your homepage"
              className="h-24"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social links</CardTitle>
          <CardDescription>Shown as buttons on your homepage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input
              id="instagram"
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/yourprofile"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Saving...' : 'Save profile'}
      </Button>
    </div>
  )
}
