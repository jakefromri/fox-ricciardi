# Change Brief: Admin panel blog settings (BLOG-2)

## What
Add a Blog Settings page in the admin panel where Jake can edit the blog name (shown in the header), a tagline (shown on the homepage), and a site-level cover/hero image. Changes are reflected immediately on the public site.

## Affected areas
- `supabase/migrations/003_blog_settings.sql` — extend profile table
- `src/types/index.ts` — new fields on Profile
- `src/components/layout/Header.tsx` — fetch and display dynamic blog_name; add Settings nav link
- `src/pages/Home.tsx` — show blog_tagline and blog_cover_image_url if set
- `src/pages/admin/BlogSettings.tsx` — new admin settings page
- `src/router.tsx` — add /admin/settings route

## Data model changes
Three new nullable columns on the `profile` singleton:
- `blog_name text not null default 'Jake Ricciardi'`
- `blog_tagline text` — optional subtitle on homepage
- `blog_cover_image_url text` — optional hero image on homepage

Reuses the existing `post-images` Supabase Storage bucket (from BLOG-3) with a `site/` path prefix.

## Acceptance criteria
- [ ] Blog name field in admin settings updates the name shown in the header
- [ ] Tagline field updates the subtitle shown on the homepage
- [ ] Cover image upload works; image appears as hero on homepage
- [ ] Cover image can be removed; homepage reverts to no-image layout
- [ ] All fields are optional except blog_name (which has a sensible default)
- [ ] Settings link visible in admin nav when logged in

## Out of scope
- Browser tab title (document.title) — defer, would need react-helmet
- Per-page SEO meta tags
- Separate site_config table — extending profile is sufficient
