# foxricciardi.com — Technical Architecture

---

## Service Map

Single-app architecture. No separate API server — Supabase handles all DB + Auth operations directly from the frontend via the Supabase JS client. Admin routes are protected by a React auth guard.

```
┌─────────────────────────────────────┐
│    jake.foxricciardi.com             │
│    React + Vite (Vercel)             │
│                                     │
│  /                  → Homepage      │
│  /blog              → Post list     │
│  /blog/:slug        → Post detail   │
│  /admin/login       → Auth          │
│  /admin             → Post mgmt     │
│  /admin/posts/new   → Editor        │
│  /admin/posts/:id   → Editor        │
│  /admin/profile     → Profile edit  │
└──────────────┬──────────────────────┘
               │ supabase-js
               ▼
┌─────────────────────────────────────┐
│    Supabase (hosted)                │
│    - Postgres (posts, profile)      │
│    - Auth (Jake's account only)     │
└─────────────────────────────────────┘

DNS: GoDaddy → jake CNAME → cname.vercel-dns.com
```

---

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + TypeScript + Vite | Single app, no separate admin app |
| UI | shadcn/ui + Tailwind CSS | All components from day one |
| Rich Text | TipTap v2 | JSON storage, StarterKit + extensions |
| Data Fetching | TanStack Query v5 | Caching, loading states, mutations |
| Auth | Supabase Auth | Email/password, Jake only |
| Database | Supabase Postgres (hosted) | No local Docker |
| DB Client | supabase-js v2 | Direct from frontend, RLS enforced |
| Migrations | Supabase CLI (`supabase db push`) | No manual dashboard SQL |
| Hosting | Vercel | Auto-deploy from GitHub `main` |
| Domain | GoDaddy → Vercel CNAME | `jake.foxricciardi.com` |

---

## Repo Structure

```
fox-ricciardi/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui generated components
│   │   ├── layout/          # Header, Footer, AdminLayout
│   │   ├── blog/            # PostCard, PostList
│   │   └── editor/          # TipTap editor wrapper
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Blog.tsx
│   │   ├── BlogPost.tsx
│   │   ├── admin/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── PostEditor.tsx
│   │   │   └── Profile.tsx
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client init
│   │   └── utils.ts         # shadcn cn() helper
│   ├── hooks/
│   │   ├── useAuth.ts       # Supabase session listener
│   │   └── usePosts.ts      # TanStack Query wrappers
│   ├── types/
│   │   └── index.ts         # Post, Profile types
│   ├── router.tsx           # React Router v6 config
│   └── main.tsx
├── supabase/
│   ├── migrations/          # SQL migration files
│   └── config.toml
├── .env.local               # Dev env vars (gitignored)
├── .env.example             # Template for env vars
├── package.json
├── vite.config.ts
└── vercel.json              # SPA fallback rewrite rule
```

---

## Data Model

### `posts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `title` | `text` | NOT NULL | |
| `slug` | `text` | NOT NULL, UNIQUE | URL-friendly, auto-generated from title |
| `content` | `jsonb` | NOT NULL | TipTap JSON document |
| `excerpt` | `text` | nullable | Short summary for listing pages |
| `status` | `text` | NOT NULL, default `'draft'` | `'draft'` or `'published'` |
| `published_at` | `timestamptz` | nullable | Set when status → published |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Updated via trigger |

**RLS Policies:**
- `public_read_published`: `SELECT` for `anon` role where `status = 'published'`
- `owner_all`: Full `SELECT/INSERT/UPDATE/DELETE` for `authenticated` role (Jake only)

**Trigger:** `updated_at` auto-updates on row change via `moddatetime` extension.

---

### `profile`

Singleton row — always exactly one record (id = 1). Seeded on first deploy.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `int` | PK, default `1` | Singleton — always 1 |
| `bio` | `text` | NOT NULL | Displayed on homepage |
| `linkedin_url` | `text` | nullable | |
| `instagram_url` | `text` | nullable | |
| `email` | `text` | nullable | Used for `mailto:` link |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |

**RLS Policies:**
- `public_read`: `SELECT` for `anon` role
- `owner_write`: `UPDATE` for `authenticated` role

---

## Auth Model

Single-user auth. Jake's account is created once manually via Supabase dashboard or CLI.

```
Jake logs in → Supabase Auth (email + password)
            → Returns JWT session
            → Stored in localStorage by supabase-js
            → useAuth() hook exposes session + user
            → AdminRoute component wraps /admin/* routes
            → Redirects to /admin/login if no session
```

**No signup flow.** No invite flow. No role stored in JWT — being authenticated IS the role.

**Session persistence:** supabase-js handles auto-refresh. Session survives page reload.

**Logout:** calls `supabase.auth.signOut()`, redirects to `/admin/login`.

---

## Route Architecture

### React Router v6 config (`router.tsx`)

```typescript
// Public routes — no auth required
/                      → <Home />
/blog                  → <Blog />
/blog/:slug            → <BlogPost />

// Admin routes — wrapped in <AdminRoute> (redirects to /login if unauthed)
/admin                 → <AdminDashboard />   (redirect to /admin/posts)
/admin/posts           → <PostList />
/admin/posts/new       → <PostEditor />       (create mode)
/admin/posts/:id/edit  → <PostEditor />       (edit mode)
/admin/profile         → <ProfileEditor />
/admin/login           → <Login />            (public, redirects to /admin if already authed)
```

### `AdminRoute` component

```typescript
// Wraps all /admin/* routes except /admin/login
// Reads session from useAuth()
// If no session → <Navigate to="/admin/login" />
// If session → renders <Outlet />
```

---

## Supabase Client Queries

### Public (anon key, no auth)

```typescript
// Fetch published posts for listing
supabase
  .from('posts')
  .select('id, title, slug, excerpt, published_at')
  .eq('status', 'published')
  .order('published_at', { ascending: false })

// Fetch single post by slug
supabase
  .from('posts')
  .select('*')
  .eq('slug', slug)
  .eq('status', 'published')
  .single()

// Fetch profile
supabase
  .from('profile')
  .select('*')
  .eq('id', 1)
  .single()
```

### Admin (authenticated session)

```typescript
// Fetch all posts (draft + published)
supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })

// Create post
supabase.from('posts').insert({ title, slug, content, excerpt, status })

// Update post
supabase.from('posts').update({ title, content, excerpt, status, published_at }).eq('id', id)

// Delete post
supabase.from('posts').delete().eq('id', id)

// Update profile
supabase.from('profile').update({ bio, linkedin_url, instagram_url, email }).eq('id', 1)
```

---

## TipTap Editor Configuration

```typescript
// Extensions: StarterKit, Placeholder, CharacterCount
// Storage format: editor.getJSON() → stored in posts.content (jsonb)
// Render format: <EditorContent> with stored JSON loaded via editor.commands.setContent()
// Public render: generateHTML(content, extensions) → rendered HTML for blog post page
```

Editor used in `/admin/posts/new` and `/admin/posts/:id/edit` only. Public post pages render stored JSON to HTML using TipTap's `generateHTML` utility (no editor instance needed).

---

## Slug Generation

Auto-generated from title on create, editable before first publish.

```typescript
// utils/slug.ts
export const slugify = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
```

Uniqueness enforced by Supabase UNIQUE constraint on `posts.slug`. If collision, append `-2`, `-3`, etc.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key | Yes |

`.env.local` for dev, Vercel environment variables for prod. Both are public-safe (anon key, no service role key needed — RLS handles auth).

---

## Vercel Configuration

### `vercel.json` — SPA fallback

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Required so React Router handles client-side routing (Vercel would otherwise 404 on deep links).

### Custom Domain Setup

1. Add `jake.foxricciardi.com` in Vercel project → Settings → Domains
2. Vercel provides a CNAME value (e.g., `cname.vercel-dns.com`)
3. In GoDaddy DNS: add CNAME record `jake` → `cname.vercel-dns.com`
4. SSL auto-provisioned by Vercel (Let's Encrypt) — no action needed

See `/personal/_templates/godaddy-domain-setup.md` for the full reusable checklist.

---

## Dev + Prod Environments

| Concern | Dev | Prod |
|---------|-----|------|
| URL | `localhost:5173` | `jake.foxricciardi.com` |
| Supabase project | Shared (same project, `dev` note in data is fine for personal use) | Same |
| Env vars | `.env.local` | Vercel project settings |
| Deploys | `npm run dev` | Auto-deploy on `git push origin main` |
| Branch | any | `main` only |

Note: For a personal site, using the same Supabase project for dev and prod is acceptable. Draft posts isolate "in-progress" work from public view naturally.

---

## GitHub + Vercel Integration

1. Create GitHub repo: `fox-ricciardi` (private)
2. Connect to Vercel: Import project → select repo → framework = Vite
3. Set env vars in Vercel dashboard (one-time)
4. Push to `main` → Vercel auto-deploys in ~30s
5. Preview deploys on feature branches (automatic)

---

## Migration Plan

```sql
-- 001_initial_schema.sql

-- Enable moddatetime extension for updated_at trigger
create extension if not exists moddatetime;

-- Posts table
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content jsonb not null default '{}',
  excerpt text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger handle_updated_at before update on posts
  for each row execute procedure moddatetime(updated_at);

-- RLS
alter table posts enable row level security;

create policy "public_read_published"
  on posts for select to anon
  using (status = 'published');

create policy "owner_all"
  on posts for all to authenticated
  using (true)
  with check (true);

-- Profile table (singleton)
create table profile (
  id int primary key default 1,
  bio text not null default '',
  linkedin_url text,
  instagram_url text,
  email text,
  updated_at timestamptz not null default now(),
  constraint singleton check (id = 1)
);

create trigger handle_profile_updated_at before update on profile
  for each row execute procedure moddatetime(updated_at);

-- RLS
alter table profile enable row level security;

create policy "public_read"
  on profile for select to anon
  using (true);

create policy "owner_write"
  on profile for update to authenticated
  using (true)
  with check (true);

-- Seed profile row
insert into profile (id, bio, email) values (1, 'Hi, I''m Jake.', 'jakericciardi@gmail.com');
```

---

## Key Implementation Notes

- **No service role key in frontend.** Anon key + RLS is sufficient. Owner operations work because Jake's authenticated session satisfies the `authenticated` role policies.
- **TipTap JSON is the source of truth.** Don't store HTML. Render HTML on the public post page using `generateHTML()`.
- **Slug must be set before first publish.** Editor auto-suggests slug from title, Jake can override. Once published, slug should not change (breaks URLs).
- **`published_at` logic:** Set `published_at = now()` when status transitions `draft → published`. Don't update it on subsequent edits.
- **Profile is INSERT-protected by singleton constraint** — only UPDATE is ever needed post-seed.
