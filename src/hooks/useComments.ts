import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Comment, VoteCounts } from '@/types'

// ─── Fingerprint helpers ──────────────────────────────────────────────────────
// We generate a random UUID on first visit and store it in localStorage.
// This is used as a dedup key for votes — one vote per fingerprint per post.

const FINGERPRINT_KEY = 'vfp'

export function getFingerprint(): string {
  let fp = localStorage.getItem(FINGERPRINT_KEY)
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem(FINGERPRINT_KEY, fp)
  }
  return fp
}

const voteStorageKey = (postId: string) => `vote_${postId}`

export function getStoredVote(postId: string): 'up' | 'down' | null {
  return (localStorage.getItem(voteStorageKey(postId)) as 'up' | 'down') ?? null
}

function storeVote(postId: string, type: 'up' | 'down') {
  localStorage.setItem(voteStorageKey(postId), type)
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useComments(postId: string): UseQueryResult<Comment[], Error> {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Comment[]
    },
    enabled: !!postId,
  })
}

// All comments for admin view — joined with posts to get title + slug
export function useAllComments(): UseQueryResult<Comment[], Error> {
  return useQuery({
    queryKey: ['comments', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, posts(title, slug)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Comment[]
    },
  })
}

export function useCreateComment(): UseMutationResult<
  Comment,
  Error,
  { post_id: string; author_name: string; body: string },
  unknown
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (comment) => {
      const { data, error } = await supabase
        .from('comments')
        .insert([comment])
        .select()
        .single()
      if (error) throw error
      return data as Comment
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.post_id] })
      queryClient.invalidateQueries({ queryKey: ['comments', 'all'] })
    },
  })
}

export function useDeleteComment(): UseMutationResult<void, Error, string, unknown> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('comments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })
}

// ─── Votes ────────────────────────────────────────────────────────────────────

export function useVoteCounts(postId: string): UseQueryResult<VoteCounts, Error> {
  return useQuery({
    queryKey: ['votes', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('post_id', postId)
      if (error) throw error
      const up = (data ?? []).filter((v) => v.vote_type === 'up').length
      const down = (data ?? []).filter((v) => v.vote_type === 'down').length
      return { up, down } as VoteCounts
    },
    enabled: !!postId,
  })
}

export function useSubmitVote(): UseMutationResult<
  void,
  Error,
  { post_id: string; vote_type: 'up' | 'down' },
  unknown
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ post_id, vote_type }) => {
      const fingerprint = getFingerprint()
      const { error } = await supabase
        .from('votes')
        .insert([{ post_id, vote_type, fingerprint }])
      if (error) throw error
      storeVote(post_id, vote_type)
    },
    onSuccess: (_data, { post_id }) => {
      queryClient.invalidateQueries({ queryKey: ['votes', post_id] })
    },
  })
}
