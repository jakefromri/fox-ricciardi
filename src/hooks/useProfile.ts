import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

const PROFILE_QUERY_KEY = ['profile']

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', 1)
        .single()
      if (error) throw new Error(error.message)
      return data as Profile
    },
    // Cache for 5 minutes — profile rarely changes, no need to refetch on every navigation
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const { data: result, error } = await supabase
        .from('profile')
        .update(data)
        .eq('id', 1)
        .select()
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!result) throw new Error('Update matched 0 rows — try signing out and back in, or check that the profile row exists in Supabase.')
      return result as Profile
    },
    onSuccess: (updated) => {
      // Update cache directly so consumers reflect changes instantly
      queryClient.setQueryData(PROFILE_QUERY_KEY, updated)
    },
  })
}
