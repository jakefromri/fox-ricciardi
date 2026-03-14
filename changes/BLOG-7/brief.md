# BLOG-7 — Post Navigation Carousel

**Status:** Ready to deploy
**Date:** 2026-03-14

## What changed

### Updated — `src/lib/utils.ts`
Added `extractTextFromTipTap(node, maxLength?)` — walks a TipTap JSON document recursively and returns plain text, truncated with an ellipsis. Used as a fallback preview when a post has no excerpt.

### Updated — `src/hooks/usePosts.ts`
Added `useAdjacentPosts(publishedAt, currentId)`. Makes two parallel Supabase queries:
- **Previous** — nearest published post with `published_at < current`, ordered DESC
- **Next** — nearest published post with `published_at > current`, ordered ASC

Both use `.maybeSingle()` so missing results (first/last post) return `null` cleanly.

### New file — `src/components/blog/PostNavigation.tsx`
Renders the two navigation cards. Key details:
- Returns `null` if both prev and next are absent (only post on the blog)
- Two-column grid on sm+, single column on mobile
- If only one card exists, it stays left-aligned (prev) or right-aligned (next) via `sm:col-start-2`
- Each card shows: direction label with arrow icon, title (2-line clamp), preview snippet (excerpt → TipTap text fallback, 2-line clamp), publish date
- Entire card is a `<Link>` to `/blog/${slug}` with hover state (border darkens, muted background)

### Updated — `src/pages/BlogPost.tsx`
- Imported `PostNavigation`
- Placed between post body and comments section

## Deploy steps
1. `npm run build` — verify no errors
2. No migration needed — queries existing `posts` table
3. Push to `dev` → verify prev/next cards appear on a post with neighbours
4. Merge to `main`
