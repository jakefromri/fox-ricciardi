# Change Brief: Per-post cover art (BLOG-3)

## What
Add optional cover images to blog posts. Authors upload an image in the editor; it appears prominently on the post detail page and as a thumbnail on post cards.

## Affected areas
- `supabase/migrations/002_add_cover_image.sql` — new column + storage bucket + RLS
- `src/types/index.ts` — add `cover_image_url` to Post
- `src/hooks/usePosts.ts` — select `cover_image_url` in all post queries
- `src/pages/admin/PostEditor.tsx` — image upload UI
- `src/pages/BlogPost.tsx` — full-width cover image above header
- `src/components/blog/PostCard.tsx` — thumbnail if image present

## Data model changes
- `posts.cover_image_url text nullable` — stores the public Supabase Storage URL
- New Supabase Storage bucket: `post-images` (public read, authenticated write/delete)

## Acceptance criteria
- [ ] Can upload a cover image on a new or existing post
- [ ] Image appears above the title on the post detail page
- [ ] Image appears as a card thumbnail on the blog listing and home page
- [ ] Posts without a cover image render normally (image sections are omitted)
- [ ] Can remove/replace a cover image on an existing post
- [ ] Uploaded file is stored in Supabase Storage and served via its public URL

## Out of scope
- Image cropping or resizing
- Alt text field (defer to BLOG-2 site settings work)
- Shared storage bucket with BLOG-2 (this creates its own `post-images` bucket)
