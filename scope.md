# foxricciardi.com — Scope

## One-Liner
A personal site and blog for Jake Ricciardi, hosted at `jake.foxricciardi.com`, with a public-facing portfolio and a private admin interface for writing and managing content.

---

## Problem
Jake wants a home on the web that reflects his work and interests — a place to write, link to projects, and be reachable — without handing control of content or design to a third-party platform.

---

## MVP Scope

### Public Site (`jake.foxricciardi.com`)
- **Homepage** — short bio, photo placeholder, links to LinkedIn, Instagram, and email contact
- **Blog listing page** — list of published posts with title, date, and excerpt; newest first
- **Individual post page** — full rich-text blog post with title, date, and content
- **Contact** — `mailto:` link surfaced on homepage and footer; no form needed for MVP

### Admin Interface (`jake.foxricciardi.com/admin`)
- **Login** — email + password auth (Jake only; no signup flow)
- **Post list** — table of all posts (draft + published) with create/edit/delete actions
- **Post editor** — rich text editor (TipTap) with title, content, excerpt, status (draft/published), and save/publish
- **Profile editor** — edit bio text and personal links (LinkedIn URL, Instagram URL, email address)

---

## Out of Scope (MVP)

- Instagram feed embed (requires Instagram Graph API — link only for now)
- Comment system
- Newsletter / email capture
- Image uploads in posts (Supabase Storage — add in v2)
- RSS / sitemap generation
- Project showcase page (add once skunkworks has public-ready work)
- Analytics dashboard
- Multiple authors

---

## User Roles

| Role | Description |
|------|-------------|
| `owner` | Jake — the only authenticated user. Can create/edit/delete all content and manage profile. |
| `public` | Any unauthenticated visitor. Can read published posts and view the homepage. |

No invite system. No multi-tenancy. Jake creates his own account directly in Supabase Auth (one-time manual step during setup).

---

## Tenancy Model

Single-tenant. No tenant isolation needed — all data belongs to Jake. No `tenant_id` columns required.

---

## Admin Panel

### Owner capabilities (`/admin/*`)
- View all posts (draft + published)
- Create a new post (title, rich text, excerpt, status)
- Edit any post
- Delete any post (with confirmation)
- Edit profile (bio, links)
- Log out

### No tenant admin / superadmin distinction — single role.

---

## Environments

| Environment | URL | Notes |
|-------------|-----|-------|
| Dev | `localhost:5173` | Local Vite dev server |
| Production | `jake.foxricciardi.com` | Vercel, deployed from `main` branch |

---

## Explicit Behaviors

### The system will:
- Show only `published` posts to unauthenticated visitors
- Show both `draft` and `published` posts in the admin panel
- Redirect unauthenticated requests to `/admin/*` to `/admin/login`
- Persist blog post content as TipTap JSON in Supabase
- Deploy automatically when Jake pushes to `main` on GitHub
- Serve the site from `jake.foxricciardi.com` via Vercel with auto-provisioned SSL
- Use `foxricciardi.com` apex domain as a redirect to `jake.foxricciardi.com` (configured in GoDaddy)

### The system will NOT:
- Allow public users to create accounts or submit content
- Allow password reset (Jake manages his own Supabase auth credentials)
- Store any analytics or personal data about visitors
- Embed live Instagram feed content (v1 links to profile only)
- Send emails (contact is a `mailto:` link)

---

## Open Questions

- Should `/admin` be on the same domain (`jake.foxricciardi.com/admin`) or a separate subdomain (e.g., `admin.foxricciardi.com`)? **Decision: same domain, `/admin` path. Simpler Vercel config.**
- Featured images per post in v1? **Decision: deferred to v2 alongside Supabase Storage.**
- Should the homepage show the 3 most recent blog posts inline? **Decision: yes — adds substance to homepage immediately.**

---

## Success Criteria

- [ ] Public visitor can read published blog posts at `jake.foxricciardi.com/blog`
- [ ] Jake can log in at `/admin/login` and land on post management
- [ ] Jake can write, save as draft, and publish a post via rich text editor
- [ ] Jake can edit homepage bio and links
- [ ] Site is live at `jake.foxricciardi.com` via Vercel with SSL
- [ ] Auto-deploys on push to `main`
- [ ] Draft posts are invisible to public visitors
