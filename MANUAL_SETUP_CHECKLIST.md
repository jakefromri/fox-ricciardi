# Manual Setup Checklist for Dev Environment

These steps require authentication or manual action in web dashboards. Complete them after pushing the `dev` branch.

## ✅ Step 1: Create Dev Supabase Project

- [ ] Go to https://supabase.com/dashboard
- [ ] New Project:
  - Name: `fox-ricciardi-dev`
  - Database password: [create one]
  - Region: same as prod (us-east-1)
- [ ] Wait 2-3 minutes for project to spin up
- [ ] Note the **Project URL** and **Anon Key**

### Apply Schema to Dev

- [ ] Go to SQL Editor in dev Supabase dashboard
- [ ] Create new query
- [ ] Copy & paste the entire content of `/supabase/migrations/001_initial_schema.sql`
- [ ] Click Run
- [ ] Confirm `posts` and `profile` tables are created

### Create Test User

- [ ] Go to Authentication → Users
- [ ] Add User:
  - Email: `jakericciardi@gmail.com`
  - Password: [create one for testing]

## ✅ Step 2: Update Local `.env.local`

- [ ] You already have `.env.local` in the project (gitignored)
- [ ] Update it with the dev Supabase credentials:
  ```
  VITE_SUPABASE_URL=https://fox-ricciardi-dev.supabase.co
  VITE_SUPABASE_ANON_KEY=[YOUR-DEV-ANON-KEY]
  ```

## ✅ Step 3: Configure Vercel Environment Variables

- [ ] Follow the steps in `VERCEL_ENV_SETUP.md`
- [ ] Add environment-scoped variables (Preview scope for dev, Production scope for prod)
- [ ] Verify both `dev` and `main` branches redeploy with correct Supabase projects

## ✅ Step 4: Set Up GitHub Branch Protection

- [ ] Follow the steps in `GITHUB_BRANCH_PROTECTION.md`
- [ ] Protect `main` branch with PR requirement, approval requirement, and status checks

## ✅ Step 5: Test the Complete Workflow

- [ ] Create a test feature branch: `git checkout -b feature/test-dev-workflow`
- [ ] Make a small code change (e.g., change homepage subtitle)
- [ ] Push: `git push origin feature/test-dev-workflow`
- [ ] Create PR on GitHub: `feature/test-dev-workflow` → `dev`
- [ ] Vercel creates a preview deploy (check PR comments for URL)
- [ ] Visit the preview URL, verify it shows your change (should be connected to **dev** Supabase)
- [ ] Merge PR to `dev`
- [ ] Verify dev branch deployed to staging URL
- [ ] Create PR: `dev` → `main`
- [ ] Merge to `main`
- [ ] Verify `main` deployed to `jake.foxricciardi.com` (should show **original** code, connected to prod Supabase)
- [ ] Revert your test commit: `git revert [commit-hash]` and push to main

**Result:** You now have a complete dev → prod workflow with separate environments!
