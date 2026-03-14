# BLOG-6 — Comments and Upvote/Downvote

**Status:** Ready for migration + deploy
**Date:** 2026-03-14

## What changed

### New file — `src/hooks/useComments.ts`
All data hooks for comments and votes.
- `useComments(postId)` — fetch flat comment list for a post
- `useAllComments()` — all comments joined with post title/slug (admin)
- `useCreateComment()` — public insert mutation
- `useDeleteComment()` — authenticated delete mutation
- `useVoteCounts(postId)` — fetch up/down counts for a post
- `useSubmitVote()` — insert a vote, stores result in localStorage

**Vote fingerprinting:** on first visit, a random UUID is generated and stored in `localStorage` as `vfp`. This UUID is sent as `fingerprint` with every vote. The DB has a `unique(post_id, fingerprint)` constraint, so one browser can only vote once per post. The cast vote direction is stored in `localStorage` as `vote_<postId>` so the UI reflects the prior choice on page reload.

### New file — `src/components/blog/PostVotes.tsx`
Upvote/downvote buttons rendered in the post header (next to the date).
- Shows live counts from `useVoteCounts`
- Reads prior vote from localStorage on mount so the active state persists
- Once voted, both buttons disable and a "Thanks for your feedback" note appears

### New file — `src/components/blog/PostComments.tsx`
Public-facing comments section rendered below the post body.
- Section header shows live comment count
- Comment list: author name, relative date, body (flat, no threading)
- Form: name input + textarea with live 500-char counter (amber warning at 90%, red at 100%)
- Success message on submit; form clears automatically

### New file — `src/pages/admin/Comments.tsx`
Admin page at `/admin/comments`.
- Table of all comments across all posts: post title, author, body preview, date, delete button
- Ordered newest first

### Updated — `src/pages/BlogPost.tsx`
- `PostVotes` added to the post header row (right side, next to date)
- `PostComments` added below post content

### Updated — `src/router.tsx`
- Added `{ path: 'comments', element: <Comments /> }` under `/admin`

### Updated — `src/components/layout/Header.tsx`
- Added "Comments" nav link between Settings and API Keys (visible when logged in)

## Deploy steps

1. **Run migration** (dev first, then prod):
   ```bash
   # Confirm you're linked to the right project
   cat supabase/.temp/project-ref

   # Apply migration
   supabase db push
   ```
   Or paste `changes/BLOG-6/migration.sql` directly into the Supabase SQL editor.

2. `npm run build` — verify no errors
3. Push to `dev` branch → verify on staging (test comment submit, vote, admin delete)
4. Merge to `main` → Vercel auto-deploys

## Notes
- No spam protection in v1 — admin delete is the moderation tool
- Vote fingerprinting is localStorage-based (client side) + DB unique constraint (server side). Not foolproof but sufficient for a personal blog
- Comments are ordered oldest-first on the public page (chronological thread feel), newest-first in admin (easier moderation)
