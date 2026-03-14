---
description: Commit, push, and optionally create a PR with full CI/CD integration
argument-hint: [commit message or "pr" to also create a PR]
---

# Git Commit & PR Workflow

Complete workflow for committing changes, pushing to remote, and creating pull requests. Integrates with GitHub Actions CI/CD pipeline.

## Step 1: Ensure Feature Branch

**Check current branch:**
```bash
git branch --show-current
```

**If on `main`:**
- ASK the user what to name the branch
- Suggest based on changes: `feat/...`, `fix/...`, `refactor/...`, `docs/...`
- Create and switch: `git checkout -b <branch-name>`

**If already on a feature branch:** continue.

## Step 2: Review Changes

Run these in parallel:
```bash
git status
git diff --stat
git diff HEAD
git log --oneline -5
```

**Pre-commit checks:**
- Verify NO `.env`, `.env.local`, credentials, or secrets are staged
- Verify no `node_modules/`, `.next/`, `__pycache__/` are included
- If suspicious files found: WARN the user and exclude them

## Step 3: Stage Files

Stage changed and new files individually (NOT `git add .` or `git add -A`):
```bash
git add <file1> <file2> ...
```

**Exclude from staging:**
- `.env*` files (except `.env.example`)
- `node_modules/`, `.next/`, `__pycache__/`, `venv/`
- OS files (`.DS_Store`, `Thumbs.db`)
- Large binary files (ask user first)

## Step 4: Create Commit

**Commit format:**
```
<type>: <concise description of what changed>

<optional body: WHY this change was made, not WHAT>

Co-Authored-By: LLMsolution <info@llmsolution.nl>
```

**Types:**
- `feat:` — New feature or functionality
- `fix:` — Bug fix
- `refactor:` — Code restructuring without behavior change
- `docs:` — Documentation only
- `test:` — Adding or updating tests
- `chore:` — Build, config, dependency changes
- `style:` — Formatting, whitespace (no logic change)
- `perf:` — Performance improvement
- `ci:` — CI/CD pipeline changes

**Rules:**
- Use HEREDOC for the commit message (proper formatting)
- Keep subject line under 72 characters
- Use imperative mood ("add feature" not "added feature")
- Always include `Co-Authored-By: LLMsolution <info@llmsolution.nl>`

```bash
git commit -m "$(cat <<'EOF'
<type>: <description>

<optional body>

Co-Authored-By: LLMsolution <info@llmsolution.nl>
EOF
)"
```

## Step 4b: Update Project Status

If `.agents/STATUS.md` exists, update it to reflect the current changes:

1. **Read** `.agents/STATUS.md` to understand the format
2. **Feature table**: If this commit relates to a feature or bug fix:
   - Add a new row if the feature/fix isn't listed yet
   - Update the status (`in-progress`, `in-review`, `done`) if it already exists
3. **Recent Activity**: Add an entry at the top of the list with today's date and a brief description
4. **Current Focus**: Update if a feature is now in progress or completed
5. **Stage** `.agents/STATUS.md` together with the other files

If `.agents/STATUS.md` does not exist, skip this step.

**Note**: Skip this step for trivial changes (typos, formatting, config tweaks) that don't relate to a feature or fix.

## Step 5: Sync with Main & Push

**Why this step matters:** When PRs are squash-merged, the feature branch's commit history diverges from main. Pushing without rebasing causes merge conflicts on the next PR.

**5a. Fetch latest main:**
```bash
git fetch origin main
```

**5b. Check if branch needs rebasing on main:**
```bash
git log --oneline origin/main..HEAD | head -5
git log --oneline HEAD..origin/main | head -5
```

If origin/main has commits not in HEAD (second command shows output), rebase:
```bash
git rebase origin/main
```

If rebase has conflicts:
1. Resolve conflicts in each file
2. `git add <resolved-files>`
3. `git rebase --continue`
4. If too complex, `git rebase --abort` and ask user for help

**5c. Push to remote:**
```bash
git push -u origin <branch-name>
```

If push is rejected (remote branch has diverged, e.g. after rebase):
```bash
git push --force-with-lease origin <branch-name>
```

**Note:** `--force-with-lease` is safe here — it only overwrites if no one else pushed to the branch since your last fetch.

## Step 6: Create Pull Request (if requested)

**Only create a PR if:**
- User passes "pr" as argument: `/commit pr`
- User explicitly asks for a PR
- Otherwise, just commit and push

**PR creation:**
```bash
gh pr create --title "<type>: <description>" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points describing what changed and why>

## Changes
<list of key files/components modified>

## Manual Verification
- [ ] Tested manually in browser

## Notes
<any additional context, screenshots, or migration steps>

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: LLMsolution <info@llmsolution.nl>
EOF
)"
```

**After PR creation:**
- Print the PR URL
- **Update `.agents/STATUS.md`:** Find the matching feature row → add PR link (e.g., `#3`), Updated → today's date. Add to "Recent Activity": `- [date]: [Feature name] PR created (#N)`
- Remind user: PR will **auto-merge** when all CI checks pass (squash merge, branch auto-deleted)
- Remind user: `@claude-review` comment triggers AI code review (runs in parallel with CI)

## What Happens After Push/PR

**Automatic (GitHub Actions CI pipeline):**
1. Frontend Linting — `frontend-eslint.yml` (auto-detected)
2. Security Analysis — `security-analysis.yml` (Bandit + ESLint security, auto-detected)
3. Frontend E2E Tests — `frontend-playwright.yml` (auto-detected, runs after linting)
4. All Tests Passed gate — `run-tests.yml` (orchestrates all above)
5. **Auto-merge** — PR is squash-merged and branch is deleted when all checks pass

**On-demand (PR comments):**
- `@claude-review` → AI code review (read-only)
- `@claude-fix` → AI implements fixes on a new branch

## Quick Reference

| Command | What it does |
|---------|-------------|
| `/commit` | Commit + push to current/new branch |
| `/commit pr` | Commit + push + create PR |
| `/commit` on `main` | Asks to create branch first |
