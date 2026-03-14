# BLOG-1 Change Brief — Public Blog Management API

## Problem
Blog posts can only be created/edited through the admin panel UI. There's no way for Claude (or any HTTP client) to manage posts programmatically — which limits automation and content workflows.

## Solution
A public REST API secured by API keys, plus an admin UI to generate and revoke those keys. Claude (or any client) can create and update posts by calling the API with a key.

## Scope

### API endpoints (Vercel serverless functions in `/api/`)
- `GET /api/posts` — list posts (public, no auth required)
- `POST /api/posts` — create post (API key required)
- `PATCH /api/posts/:id` — update post (API key required)
- `DELETE /api/posts/:id` — delete post (API key required)

### API key management (admin UI)
- Generate a new named key (shown once in full at creation)
- List active keys (name + prefix + created date + last used)
- Revoke a key

### Documentation
- Static page at `/api-docs` in the public Vite app showing endpoints, auth header format, and curl examples

## Out of scope
- Rate limiting (not needed for personal use)
- Key rotation / expiry
- Webhook support
- Public GET /api/posts is already available via Supabase's auto-generated REST API — this BLOG-1 API is primarily for write operations

## Key constraints
- Service role key must never reach the frontend — only used inside serverless functions
- Local dev requires `vercel dev` (runs Vite + API functions together)
- API key plaintext shown only once at creation; only the hash is stored

## Success criteria
- Claude can create a blog post via `POST /api/posts` with a Bearer token and have it appear in the admin panel
- Keys can be revoked from the admin panel and immediately stop working
- API docs page is public and explains how to use the API
