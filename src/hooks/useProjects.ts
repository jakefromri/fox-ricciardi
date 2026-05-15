import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Project } from '@/types'

// Public: fetch all projects ordered by `order` asc
export function useProjects(): UseQueryResult<Project[], Error> {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order', { ascending: true })

      if (error) throw error
      return data as Project[]
    },
  })
}

// Create
export function useCreateProject(): UseMutationResult<
  Project,
  Error,
  Omit<Project, 'id' | 'created_at' | 'updated_at'>,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (project) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single()

      if (error) throw error
      return data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Update
export function useUpdateProject(): UseMutationResult<
  Project,
  Error,
  { id: string; project: Partial<Project> },
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, project }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...project, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Delete
export function useDeleteProject(): UseMutationResult<void, Error, string, unknown> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
