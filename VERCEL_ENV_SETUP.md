# Vercel Environment Variables Setup

Once you've created the dev Supabase project, configure Vercel to use separate credentials for dev and prod.

## Approach: Environment-Scoped Variables (Recommended for Single Project)

### What You'll Do

1. Go to https://vercel.com/dashboard → fox-ricciardi project → Settings → Environment Variables
2. Add variables with **scope** (important!):

| Variable | Value | Scope |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `https://fox-ricciardi-dev.supabase.co` | **Preview** |
| `VITE_SUPABASE_ANON_KEY` | [DEV_ANON_KEY] | **Preview** |
| `VITE_SUPABASE_URL` | `https://vbburmpaeonjmsnsxugd.supabase.co` | **Production** |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_URzIL_kqB5BYVrOhBLhaGQ_cmkQJUh3` | **Production** |

### How Vercel Uses These

- **Preview scope** variables are used when deploying:
  - `dev` branch
  - Pull requests to `dev`
  - Pull requests to `main` (before merge)

- **Production scope** variables are used when deploying:
  - `main` branch (after merge)

This means your staging URL and dev environment use dev Supabase, and your production domain uses prod Supabase.

### Steps

1. Delete or replace your current environment variables in Vercel (which point to prod only)
2. Add the four variables above with correct scopes
3. Trigger a redeploy of `dev` branch → should connect to dev Supabase
4. Trigger a redeploy of `main` branch → should connect to prod Supabase (existing setup)
