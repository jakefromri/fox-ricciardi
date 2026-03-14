import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Post } from '@/types'

// Fetch published posts in reverse chronological order
export function usePublishedPosts(): UseQueryResult<Post[], Error> {
  return useQuery({
    queryKey: ['posts', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (error) throw error
      return data as Post[]
    },
  })
}

// Fetch N most recent published posts
export function useRecentPosts(
  limit: number = 3
): UseQueryResult<Post[], Error> {
  return useQuery({
    queryKey: ['posts', 'recent', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as Post[]
    },
  })
}

// Fetch all posts (admin only)
export function useAllPosts(): UseQueryResult<Post[], Error> {
  return useQuery({
    queryKey: ['posts', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Post[]
    },
  })
}

// Fetch single post by ID
export function usePost(id: string): UseQueryResult<Post, Error> {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Post
    },
  })
}

// Fetch published post by slug
export function usePostBySlug(slug: string): UseQueryResult<Post, Error> {
  return useQuery({
    queryKey: ['posts', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) throw error
      return data as Post
    },
  })
}

// Create post mutation
export function useCreatePost(): UseMutationResult<
  Post,
  Error,
  Omit<Post, 'id' | 'created_at' | 'updated_at'>,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (post) => {
      const { data, error } = await supabase
        .from('posts')
        .insert([post])
        .select()
        .single()

      if (error) throw error
      return data as Post
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// Update post mutation
export function useUpdatePost(): UseMutationResult<
  Post,
  Error,
  { id: string; post: Partial<Post> },
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, post }) => {
      const { data, error } = await supabase
        .from('posts')
        .update(post)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Post
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// Delete post mutation
export function useDeletePost(): UseMutationResult<
  void,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// Fetch the previous (older) and next (newer) published posts relative to a given post.
// Used by the PostNavigation component.
export function useAdjacentPosts(
  publishedAt: string | null,
  currentId: string
): UseQueryResult<{ prev: Post | null; next: Post | null }, Error> {
  return useQuery({
    queryKey: ['posts', 'adjacent', currentId],
    queryFn: async () => {
      if (!publishedAt) return { prev: null, next: null }

      const [prevResult, nextResult] = await Promise.all([
        // Previous = older post
        supabase
          .from('posts')
          .select('id, title, slug, excerpt, content, published_at')
          .eq('status', 'published')
          .lt('published_at', publishedAt)
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        // Next = newer post
        supabase
          .from('posts')
          .select('id, title, slug, excerpt, content, published_at')
          .eq('status', 'published')
          .gt('published_at', publishedAt)
          .order('published_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
      ])

      if (prevResult.error) throw prevResult.error
      if (nextResult.error) throw nextResult.error

      return {
        prev: prevResult.data as Post | null,
        next: nextResult.data as Post | null,
      }
    },
    enabled: !!currentId && !!publishedAt,
  })
}
