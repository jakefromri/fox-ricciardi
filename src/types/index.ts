export interface Post {
  id: string
  title: string
  slug: string
  content: Record<string, unknown>
  excerpt: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: number
  bio: string
  linkedin_url: string | null
  instagram_url: string | null
  email: string | null
  updated_at: string
}
