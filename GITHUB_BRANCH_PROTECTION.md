# GitHub Branch Protection Setup

After creating the dev environment, protect the `main` branch to enforce the dev → prod workflow.

## Steps

1. Go to GitHub repository Settings → Branches
2. Click "Add rule" under "Branch protection rules"
3. Apply rule to `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1 reviewer minimum)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging (Vercel deploy)
   - ✅ Restrict who can push to matching branches (owner only)
4. Click "Create"

## Result

Now the workflow is enforced:
- No direct pushes to `main` (branch protection blocks them)
- All code must go through PR → approval → merge
- Vercel status check must pass before merge allowed
- No force pushes allowed
