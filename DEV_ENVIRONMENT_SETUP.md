# fox-ricciardi — Dev Environment Setup

This document walks through setting up the three-environment workflow for this project. Follow these steps once to establish dev → prod separation.

---

## Current State

**What exists now (prod only):**
- ✅ Production Supabase project: `[PROD-PROJECT-REF].supabase.co`
- ✅ Production Vercel deployment: `jake.foxricciardi.com`
- ✅ Production database schema & RLS policies
- ❌ Dev environment (need to create)

**What we need to add:**
1. New dev Supabase project
2. Git branch strategy (dev branch for staging)
3. Vercel configuration for environment-scoped variables

---

## Step 1: Create Dev Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. New Project:
   - Name: `fox-ricciardi-dev`
   - Database password: [create one]
   - Region: same as prod (us-east-1 or your region)
3. Wait for project to spin up (~2 min)
4. Note the **Project URL** and **Anon Key** (you'll need these in a moment)

### Apply Schema to Dev

Once dev project is running:

1. Go to SQL Editor
2. Paste the entire content of `supabase/migrations/001_initial_schema.sql`
3. Click Run
4. Confirm both `posts` and `profile` tables are created

---

## Step 2: Create Dev Git Branch

```bash
# From your fox-ricciardi folder
git checkout -b dev
git push -u origin dev
```

This creates the `dev` branch and pushes it to GitHub. From now on:
- **`main`** = production code
- **`dev`** = staging/QA code
- **Feature branches** = your working branches (merge to `dev`, then promote to `main`)

---

## Step 3: Configure Vercel Environment Variables

### If Using Approach A (Single Vercel Project with Scoped Variables)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your `fox-ricciardi` project
3. Settings → Environment Variables
4. **Delete the current variables** (or we'll add new scopes)
5. Add new variables with **separate scopes**:

| Variable | Value | Scope |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `https://[YOUR-DEV-PROJECT].supabase.co` | **Preview** |
| `VITE_SUPABASE_ANON_KEY` | [DEV_ANON_KEY] | **Preview** |
| `VITE_SUPABASE_URL` | `https://[PROD-PROJECT-REF].supabase.co` | **Production** |
| `VITE_SUPABASE_ANON_KEY` | `[PROD-ANON-KEY]` | **Production** |

**How Vercel picks which ones to use:**
- When deploying `dev` branch or PRs → uses **Preview** scope variables
- When deploying `main` branch → uses **Production** scope variables

### If Using Approach B (Separate Vercel Projects)

Create a second Vercel project for dev:

1. Vercel Dashboard → Add New Project → Import Git Repository
2. Select your `fox-ricciardi` repo again
3. **Create a new project** (don't import to existing one)
4. Name it: `fox-ricciardi-dev`
5. Set environment variables to dev Supabase credentials
6. Set it to deploy the `dev` branch only (Project Settings → Git Integration → Production Branch = `dev`)
7. Leave your original `fox-ricciardi` project to deploy `main` only

---

## Step 4: Create Dev User in Dev Supabase

1. Go to dev Supabase dashboard → Authentication → Users
2. Add User:
   - Email: `jakericciardi@gmail.com`
   - Password: [create one for testing]
3. Click Add User

---

## Step 5: Update Local .env.local (Optional but Recommended)

To test against **dev** database locally:

```bash
# .env.local
VITE_SUPABASE_URL=https://[YOUR-DEV-PROJECT].supabase.co
VITE_SUPABASE_ANON_KEY=[DEV_ANON_KEY]
```

Then `npm run dev` uses dev database locally.

**Note:** You can also keep `.env.local` pointing to prod for testing against live data. Just be careful not to accidentally delete real posts!

---

## Step 6: Test the Setup

### Test Dev Environment

1. Make a small change to the code:
   ```bash
   git checkout -b feature/test-dev
   # Edit src/pages/Home.tsx — change "Hi, I'm Jake" to "Hi, testing dev env"
   git add .
   git commit -m "test: dev environment"
   git push origin feature/test-dev
   ```

2. Create PR on GitHub: `feature/test-dev` → `dev`
   - GitHub triggers Vercel preview deploy

3. Wait for Vercel deploy to finish (check PR comments for preview URL)

4. Visit the preview URL (should look like `fox-ricciardi-dev-abc123.vercel.app`)
   - Should say "Hi, testing dev env"
   - Connected to **dev Supabase** (test data only)

5. Create a test blog post in the admin panel

6. Merge PR to `dev`
   - Vercel re-deploys `dev` branch to staging URL

7. Verify staging URL has the test post

8. Create PR `dev` → `main`

9. Merge to `main`
   - Vercel deploys `main` branch to `jake.foxricciardi.com`
   - Should still show "Hi, I'm Jake" (original code, not test)
   - Connected to **prod Supabase** (real data)

10. Revert your test change:
    ```bash
    git revert <commit-hash-of-test-commit>
    git push origin main
    ```

---

## Step 7: Lock Down Main Branch (GitHub Settings)

Prevent accidental pushes to `main`:

1. Go to GitHub repo Settings → Branches
2. Add branch protection rule for `main`:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1 reviewer)
   - ✅ Dismiss stale pull request approvals
   - ✅ Require status checks to pass (Vercel)
   - ✅ Restrict who can push (only you)
3. Click Create

---

## Going Forward: The Workflow

### Adding a New Feature

```bash
# Create feature branch from dev (the staging branch)
git checkout dev
git pull
git checkout -b feature/new-blog-editor

# Work on feature locally, test against dev database
# (or prod database, your choice in .env.local)
npm run dev

# Commit and push
git push origin feature/new-blog-editor

# Create PR on GitHub: feature/new-blog-editor → dev
# Vercel auto-creates preview deploy
# Test in the preview environment (against dev Supabase)

# Once satisfied, merge PR to dev
# Vercel re-deploys dev branch

# When ready to go live, create PR: dev → main
# Vercel auto-creates status check
# Review code, merge PR
# Vercel auto-deploys to production (jake.foxricciardi.com)
```

### Testing Locally

```bash
# Test against dev database (safer for rapid iteration)
cp .env.example .env.local
# Edit .env.local to point to dev Supabase
npm run dev

# Or test against prod database (to see real data)
cp .env.example .env.local
# Edit .env.local to point to prod Supabase
npm run dev
# ⚠️ Be careful not to delete real posts!
```

---

## Summary

| Layer | Database | Vercel | Branch | Purpose |
|-------|----------|--------|--------|---------|
| Local | Dev Supabase (or Prod) | localhost:5173 | feature/xyz | Development |
| Dev | Dev Supabase | `fox-ricciardi-dev.vercel.app` | `dev` | QA & Testing |
| Prod | Prod Supabase | `jake.foxricciardi.com` | `main` | Live |

**Key principle:** Code is tested in an environment that matches prod before going live. This prevents surprises in production.

---

## Troubleshooting

**Q: Vercel preview showing wrong database**
- Check Environment Variables → make sure Preview scope has dev credentials

**Q: Local dev showing prod data**
- Check `.env.local` — did you copy prod credentials instead of dev?

**Q: Can't merge to main**
- GitHub branch protection is working! Create PR, wait for Vercel status check, get approval, then merge.

**Q: Need to reset dev database**
- Supabase dashboard for dev project → SQL Editor → `DROP TABLE posts; DROP TABLE profile;` → Run
- Then re-run the migration (`001_initial_schema.sql`)

---

## Next Steps

Once this is set up:
1. All new features go to `feature/*` branches
2. Test locally, push to feature branch
3. Create PR to `dev` for QA
4. Merge `dev` → `main` when ready for prod
5. Sleep better knowing prod is never breaking 😴
