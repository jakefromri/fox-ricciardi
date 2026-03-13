import { Link } from 'react-router-dom'
import { Mail, Linkedin, Instagram } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { useRecentPosts } from '@/hooks/usePosts'
import { PostCard } from '@/components/blog/PostCard'
import { Button } from '@/components/ui/button'

export function Home() {
  const { data: profile } = useQuery({
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

  const { data: recentPosts } = useRecentPosts(3)

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-4">Hi, I'm Jake</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {profile?.bio || 'Product Manager, builder, and writer. [dev workflow test]'}
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          {profile?.email && (
            <a href={`mailto:${profile.email}`}>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </a>
          )}
          {profile?.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            </a>
          )}
          {profile?.instagram_url && (
            <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Recent Posts */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Posts</h2>
            <Link to="/blog">
              <Button variant="ghost" size="sm">
                View all →
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
