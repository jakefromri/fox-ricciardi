import type { VercelRequest, VercelResponse } from '../_lib/types.js'
import { supabase } from '../_lib/supabase.js'
import { validateApiKey, json } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res)
  }
  if (req.method === 'POST') {
    return handlePost(req, res)
  }
  return json(res, 405, { error: 'Method not allowed' })
}

// GET /api/posts — public, no auth required
async function handleGet(_req: VercelRequest, res: VercelResponse) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, status, published_at, created_at, updated_at, cover_image_url')
    .order('created_at', { ascending: false })

  if (error) return json(res, 500, { error: error.message })
  return json(res, 200, { posts: data })
}

// POST /api/posts — create a post, API key required
async function handlePost(req: VercelRequest, res: VercelResponse) {
  const valid = await validateApiKey(req.headers['authorization'] as string)
  if (!valid) return json(res, 401, { error: 'Invalid or missing API key' })

  const { title, slug, content, excerpt, status, cover_image_url } = req.body ?? {}

  if (!title || typeof title !== 'string') {
    return json(res, 400, { error: '`title` is required' })
  }
  if (!slug || typeof slug !== 'string') {
    return json(res, 400, { error: '`slug` is required' })
  }
  if (!content || typeof content !== 'object') {
    return json(res, 400, { error: '`content` must be a TipTap JSON object' })
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title,
      slug,
      content,
      excerpt: excerpt ?? null,
      status: status === 'published' ? 'published' : 'draft',
      cover_image_url: cover_image_url ?? null,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return json(res, 409, { error: 'A post with that slug already exists' })
    return json(res, 500, { error: error.message })
  }

  return json(res, 201, { post: data })
}
