---
description: Fast-track for small bug fixes, styling tweaks, and minor updates
argument-hint: [what to fix]
---

# Quick Fix

Fast-track workflow for small changes. Skips Prime, Plan, and Archon task management.

## When to use

- Bug fixes touching 1-3 files
- Styling/design tweaks (colors, spacing, fonts, layout)
- Copy/text changes
- Small UI adjustments
- Config tweaks

## When NOT to use → full PIV loop

- New features or functionality
- Architectural changes
- Changes touching 4+ files
- Anything requiring research or planning

## Step 1: Understand

1. Read the relevant file(s) — only what's needed
2. Understand the current behavior and what needs to change
3. **Scope check**: If this grows beyond 3 files or needs architectural decisions → STOP and suggest `/plan-feature` instead

## Step 2: Fix

- Make the change — keep it minimal
- Only change what's directly needed
- Follow existing patterns in the file

## Step 3: Validate

Run quick validation:
```bash
npm run lint
```

If TypeScript changes were made:
```bash
npx tsc --noEmit
```

For UI changes: visually verify in browser if dev server is running.

## Step 4: Commit

Follow normal `/commit` flow:
- Feature branch (create if on main)
- Stage changed files individually
- Commit with appropriate type (`fix:`, `style:`, `chore:`)
- Push to remote

**Skip for quick fixes:**
- STATUS.md update (unless the fix relates to a tracked feature)
- Archon task management
- PR creation (unless explicitly requested)
