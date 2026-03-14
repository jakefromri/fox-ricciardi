import { createHash } from 'crypto'
import { supabase } from './supabase.js'

export async function validateApiKey(authHeader: string | undefined): Promise<boolean> {
  if (!authHeader?.startsWith('Bearer ')) return false

  const key = authHeader.slice(7)
  const hash = createHash('sha256').update(key).digest('hex')

  const { data } = await supabase
    .from('api_keys')
    .select('id')
    .eq('key_hash', hash)
    .is('revoked_at', null)
    .maybeSingle()

  if (!data) return false

  // Fire-and-forget — update last_used_at without blocking the response
  supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return true
}

export function json(res: any, status: number, body: unknown) {
  res.status(status).json(body)
}
