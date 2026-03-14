# BLOG-1 Architecture Note

## Data model

### New table: `api_keys`
```sql
create table api_keys (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                  -- human label (e.g. "Claude automation")
  key_hash    text not null unique,            -- SHA-256 of the full key, hex-encoded
  key_prefix  text not null,                  -- first 8 chars for display (e.g. "sk_abc123")
  created_at  timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at  timestamptz
);

alter table api_keys enable row level security;

-- Only authenticated admin can manage keys
create policy "owner_all" on api_keys
  for all to authenticated
  using (true) with check (true);
```

### Key format
`sk_<32 random hex chars>` — e.g. `sk_a1b2c3d4e5f6...`

Key is generated client-side at creation, shown once in full. Hash stored in DB. Only the prefix (first 8 chars after `sk_`) is stored for display.

## API layer — Vercel serverless functions

### File structure
```
/api/
  _lib/
    supabase.ts       # server-side supabase client using SUPABASE_SERVICE_ROLE_KEY
    auth.ts           # validateApiKey(req) → boolean + records last_used_at
  posts/
    index.ts          # GET (public), POST (auth required)
    [id].ts           # PATCH, DELETE (auth required)
```

### Auth middleware pattern
```ts
// api/_lib/auth.ts
import crypto from 'crypto'

export async function validateApiKey(authHeader: string | undefined) {
  if (!authHeader?.startsWith('Bearer ')) return false
  const key = authHeader.slice(7)
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  const { data } = await supabase
    .from('api_keys')
    .select('id')
    .eq('key_hash', hash)
    .is('revoked_at', null)
    .single()
  if (!data) return false
  // fire-and-forget last_used_at update
  supabase.from('api_keys').update({ last_used_at: new Date() }).eq('id', data.id)
  return true
}
```

### Environment variables
| Var | Scope | Purpose |
|-----|-------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel server-only (not VITE_) | Used by API functions to bypass RLS |
| `VITE_SUPABASE_URL` | Already exists | Shared by frontend + functions |

**Critical:** `SUPABASE_SERVICE_ROLE_KEY` must NOT be prefixed with `VITE_` — Vite exposes any `VITE_` var to the browser bundle.

## Admin UI changes

### New page: `/admin/api-keys`
- List active keys (name, prefix, created, last used) — query `api_keys` where `revoked_at is null`
- "Generate key" button → calls a client-side function to:
  1. Generate key using `crypto.getRandomValues`
  2. Show key in a one-time modal ("Copy this now — it won't be shown again")
  3. POST the hash + prefix + name to Supabase directly from frontend (authenticated user can insert via RLS)
- "Revoke" button → sets `revoked_at = now()` via Supabase client

### Nav update
Add "API Keys" link to admin nav in Header.tsx.

## Local development
`vercel dev` replaces `npm run dev` when working on API routes. It runs the Vite frontend and serverless functions together on a single port.

## Migration
`005_api_keys.sql` — create `api_keys` table + RLS policies above.

## Risks
- **Key generation on client**: using `crypto.getRandomValues` in browser is cryptographically secure. Hash before sending to DB.
- **Service role key exposure**: only ever referenced in `/api/_lib/supabase.ts`, never in `src/`. Vercel's build process keeps server-only env vars out of the client bundle as long as they're not prefixed `VITE_`.
- **CORS**: write endpoints should restrict to known origins or omit CORS entirely (API is intended for server-to-server use, not browser calls).
- **`vercel dev` requirement**: local dev workflow changes. Worth documenting clearly in README.
