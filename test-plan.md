# foxricciardi.com — Test Plan

---

## Unit Tests

### Slug generation
- **Tests**: Slug auto-generation from post title
- **Setup**: Import `slugify` util
- **Action**: `slugify("Hello World! This is Jake's Blog")`
- **Expected**: `"hello-world-this-is-jakes-blog"`

### Slug collision handling
- **Tests**: Duplicate slug detection
- **Setup**: Post with slug `"my-post"` exists in DB
- **Action**: Attempt to insert another post with slug `"my-post"`
- **Expected**: Supabase throws unique constraint error; UI appends `-2` to suggest new slug

---

## Integration Tests

### Public can read published posts
- **Tests**: `public_read_published` RLS policy
- **Setup**: 2 posts — one `published`, one `draft`
- **Action**: Fetch `posts` table with anon key (no auth)
- **Expected**: Only the `published` post is returned; draft is not visible

### Admin can read all posts
- **Tests**: `owner_all` RLS policy — SELECT
- **Setup**: 2 posts — one `published`, one `draft`; Jake is authenticated
- **Action**: Fetch `posts` table with Jake's session
- **Expected**: Both posts returned

### Admin can create a post
- **Tests**: `owner_all` RLS policy — INSERT
- **Setup**: Jake is authenticated
- **Action**: Insert new post with `status = 'draft'`
- **Expected**: Post created, returned with generated `id` and `created_at`

### Admin can update a post
- **Tests**: `owner_all` RLS policy — UPDATE; `published_at` logic
- **Setup**: Draft post exists; Jake is authenticated
- **Action**: Update `status` to `'published'`, set `published_at = now()`
- **Expected**: Post updated; `status = 'published'`, `published_at` is set, `updated_at` refreshed

### Admin can delete a post
- **Tests**: `owner_all` RLS policy — DELETE
- **Setup**: Post exists; Jake is authenticated
- **Action**: Delete post by id
- **Expected**: Post no longer in DB; anon fetch also returns nothing

### Public cannot write posts
- **Tests**: Anon write protection
- **Setup**: Anon key (no auth)
- **Action**: Attempt to INSERT into `posts`
- **Expected**: 403 / RLS violation error

### Profile is readable by public
- **Tests**: `public_read` profile RLS policy
- **Setup**: Profile row with id=1 exists
- **Action**: Fetch `profile` with anon key
- **Expected**: Returns bio, linkedin_url, instagram_url, email

### Admin can update profile
- **Tests**: `owner_write` profile RLS policy
- **Setup**: Jake is authenticated; profile row exists
- **Action**: UPDATE profile bio to new value
- **Expected**: Row updated; new value reflected on next fetch

---

## E2E Tests

### Public blog browsing flow
- **Tests**: Full public reading experience
- **Setup**: 2 published posts exist; 1 draft exists
- **Action**: Visit `jake.foxricciardi.com` → click "Blog" → click a post title
- **Expected**:
  - Homepage loads with bio + links
  - Blog listing shows 2 published posts (not the draft)
  - Post detail page renders full rich text content
  - Draft post is not listed

### Admin login flow
- **Tests**: Auth guard and login redirect
- **Setup**: Navigate to `jake.foxricciardi.com/admin` while logged out
- **Action**: Redirected to `/admin/login` → enter Jake's credentials → submit
- **Expected**: Redirected to `/admin/posts`; session persists on page reload

### Admin login guard — unauthenticated access
- **Tests**: AdminRoute redirect behavior
- **Action**: Visit `/admin/posts` with no session
- **Expected**: Immediately redirected to `/admin/login`

### Create and publish a post
- **Tests**: Full post authoring flow
- **Setup**: Jake is logged in at `/admin/posts`
- **Action**: Click "New Post" → enter title → write content in TipTap → set status to Published → Save
- **Expected**:
  - Post appears in admin post list
  - Post is visible at `/blog/:slug` on public site
  - `published_at` is set; `status = 'published'`

### Edit an existing post
- **Tests**: Post update flow
- **Setup**: Published post exists; Jake is logged in
- **Action**: Click edit on a post → change title → save
- **Expected**: Updated title appears in post list and on public post page; `updated_at` refreshed; `published_at` unchanged

### Delete a post with confirmation
- **Tests**: Delete flow with guard
- **Setup**: Post exists; Jake is logged in
- **Action**: Click delete → confirm in dialog
- **Expected**: Post removed from list; no longer accessible at `/blog/:slug` (404)

### Edit profile
- **Tests**: Profile update flow
- **Setup**: Jake is logged in at `/admin/profile`
- **Action**: Update bio text → save
- **Expected**: Updated bio appears on homepage after save

### Draft post not visible on public site
- **Tests**: Draft isolation
- **Setup**: Post exists with `status = 'draft'`
- **Action**: Visit `/blog` (public, no auth)
- **Expected**: Draft post does not appear in list; navigating directly to `/blog/:slug` returns 404 or "not found"

---

## Deploy / Infrastructure Checks

### Vercel auto-deploy
- **Tests**: CI/CD pipeline
- **Action**: Push commit to `main` branch on GitHub
- **Expected**: Vercel deploy triggered automatically; site updated within 60s

### SPA routing (deep links work)
- **Tests**: `vercel.json` rewrite rule
- **Action**: Navigate directly to `jake.foxricciardi.com/blog/my-post-slug`
- **Expected**: React app loads and renders the correct post (no 404 from Vercel)

### SSL cert provisioned
- **Tests**: HTTPS on custom domain
- **Action**: Visit `https://jake.foxricciardi.com`
- **Expected**: Valid SSL cert; no browser security warnings

### ENV vars in production
- **Tests**: Supabase client works in Vercel environment
- **Action**: Visit production homepage
- **Expected**: Profile bio loads (confirms `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly in Vercel)
