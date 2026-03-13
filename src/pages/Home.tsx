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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="space-y-5 pt-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight mb-4 leading-tight">
            Hi, I'm Jake
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            {profile?.bio || 'Product Manager, builder, and writer.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile?.email && (
            <a href={`mailto:${profile.email}`}>
              <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                Email
              </Button>
            </a>
          )}
          {profile?.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-3.5 w-3.5 mr-1.5" />
                LinkedIn
              </Button>
            </a>
          )}
          {profile?.instagram_url && (
            <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-3.5 w-3.5 mr-1.5" />
                Instagram
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Recent Posts */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Recent writing</h2>
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm">
                All posts →
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
