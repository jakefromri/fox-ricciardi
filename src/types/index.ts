export interface Post {
  id: string
  title: string
  slug: string
  content: Record<string, unknown>
  excerpt: string | null
  cover_image_url: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_name: string
  body: string
  created_at: string
  // populated when fetching all comments for admin (join to posts)
  posts?: { title: string; slug: string }
}

export interface Vote {
  id: string
  post_id: string
  vote_type: 'up' | 'down'
  fingerprint: string
  created_at: string
}

export interface VoteCounts {
  up: number
  down: number
}

export interface Profile {
  id: number
  bio: string
  linkedin_url: string | null
  instagram_url: string | null
  email: string | null
  blog_name: string
  blog_tagline: string | null
  blog_cover_image_url: string | null
  updated_at: string
}
