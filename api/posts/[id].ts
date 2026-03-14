import type { VercelRequest, VercelResponse } from '../_lib/types.js'
import { supabase } from '../_lib/supabase.js'
import { validateApiKey, json } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const valid = await validateApiKey(req.headers['authorization'] as string)
  if (!valid) return json(res, 401, { error: 'Invalid or missing API key' })

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return json(res, 400, { error: 'Post ID is required' })
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res, id)
  }
  if (req.method === 'DELETE') {
    return handleDelete(res, id)
  }
  return json(res, 405, { error: 'Method not allowed' })
}

// PATCH /api/posts/:id — partial update
async function handlePatch(req: VercelRequest, res: VercelResponse, id: string) {
  const allowed = ['title', 'slug', 'content', 'excerpt', 'status', 'cover_image_url']
  const body = req.body ?? {}
  const updates: Record<string, unknown> = {}

  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return json(res, 400, { error: 'No valid fields to update' })
  }

  // Set published_at when publishing for the first time
  if (updates.status === 'published') {
    const { data: existing } = await supabase
      .from('posts')
      .select('published_at')
      .eq('id', id)
      .single()
    if (existing && !existing.published_at) {
      updates.published_at = new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) return json(res, 500, { error: error.message })
  if (!data) return json(res, 404, { error: 'Post not found' })

  return json(res, 200, { post: data })
}

// DELETE /api/posts/:id
async function handleDelete(res: VercelResponse, id: string) {
  const { error, count } = await supabase
    .from('posts')
    .delete({ count: 'exact' })
    .eq('id', id)

  if (error) return json(res, 500, { error: error.message })
  if (count === 0) return json(res, 404, { error: 'Post not found' })

  return json(res, 200, { success: true })
}
