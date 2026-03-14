import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
}

// Server-side client — uses service role key to bypass RLS.
// Never import this from src/ (frontend). Server-only.
export const supabase = createClient(supabaseUrl, serviceRoleKey)
