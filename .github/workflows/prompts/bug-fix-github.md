# Bug Fix: GitHub Issue #$ISSUE_NUMBER

## GitHub Context

- **Repository**: $REPOSITORY
- **Issue Number**: $ISSUE_NUMBER
- **Issue Title**: $ISSUE_TITLE
- **Triggered By**: $TRIGGERED_BY
- **Branch Name**: $BRANCH_NAME

## Configuration

CREATE_BRANCH=$CREATE_BRANCH
CREATE_PR=$CREATE_PR
COMMENT_ON_ISSUE=$COMMENT_ON_ISSUE

## Issue Description

$ISSUE_BODY

## Overview

This workflow chains Root Cause Analysis + Fix Implementation for bug fixes in GitHub Actions.

---

## Phase 1: Root Cause Analysis

### Objective

Investigate this GitHub issue, identify the root cause, and document findings.

### Process

**1. Fetch Issue Details**

```bash
gh issue view $ISSUE_NUMBER
```

**2. Search Codebase**

Identify relevant code:
- Search for components mentioned in issue
- Find related functions, classes, modules
- Check recent changes in affected areas

**3. Investigate Root Cause**

Analyze the code to determine:
- What is the actual bug?
- Why is it happening?
- What was the original intent?

**4. Create RCA Document**

Save analysis to: `docs/rca/issue-$ISSUE_NUMBER.md`

Document must include:
- Issue summary and reproduction steps
- Root cause analysis with affected files/functions
- Proposed fix strategy
- Testing requirements
- Validation commands

---

## Phase 2: Implement Fix

### Objective

Implement the fix based on the RCA document.

### Process

**1. Read RCA**

```bash
cat docs/rca/issue-$ISSUE_NUMBER.md
```

**2. Implement Fix**

- Follow the proposed fix strategy from RCA
- Make changes to affected files
- Maintain code style and conventions

**3. Add Tests**

Create test cases to:
- Verify the fix resolves the issue
- Test edge cases
- Prevent regression

**4. Run Validation (HARD GATE — Do NOT proceed until all checks pass)**

Execute validation commands. You MUST NOT proceed to commit until every check passes with zero errors.

```bash
# Run the project's lint/type-check command (e.g., npm run lint, tsc --noEmit)
# Run the test suite
# Run the build if applicable
```

**If ANY check fails:**
1. Read the error messages carefully
2. Fix EVERY error (do not skip or suppress errors)
3. Re-run the check
4. Repeat until the check passes with zero errors

**Common pitfalls to watch for:**
- New files not registered in auto-generated type/API files (may need codegen or should be in existing module)
- String-based function references instead of typed imports
- Missing imports from generated modules
- Type mismatches between frontend calls and backend signatures

**5. Verify Fix**

- Follow reproduction steps from RCA
- Confirm issue no longer occurs

---

## Update Project Status

If the file `.agents/STATUS.md` exists, update it to reflect this fix:

1. **Read** `.agents/STATUS.md` to understand the current format
2. **Add or update a row** in the Features table if this fix relates to an existing feature, or add a new row for the bug fix with status `in-review`, PR number (to be filled after PR creation), and today's date
3. **Add an entry** to the Recent Activity section at the top of the list
4. **Include** `.agents/STATUS.md` in the files you stage for commit

If `.agents/STATUS.md` does not exist, skip this step.

---

## GitHub Workflow Integration

### Configure Git

```bash
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
```

### Branch Management

**If CREATE_BRANCH = "true":**

```bash
git checkout -b $BRANCH_NAME
```

### Commit Changes

```bash
# Stage files individually (NOT git add . or git add -A)
git add <file1> <file2> ...
git commit -m "fix: resolve issue #$ISSUE_NUMBER - $ISSUE_TITLE

[Summary of fix from RCA]

Fixes #$ISSUE_NUMBER"
```

### Push Branch

**If CREATE_BRANCH = "true":**

```bash
git push origin $BRANCH_NAME
```

### Create Pull Request

**If CREATE_PR = "true":**

```bash
gh pr create \
  --title "Fix: $ISSUE_TITLE" \
  --body "Fixes #$ISSUE_NUMBER

## Root Cause
[Brief explanation from RCA]

## Changes Made
- [List key changes]

## Testing
- All tests passing
- Manual verification complete

See \`docs/rca/issue-$ISSUE_NUMBER.md\` for detailed analysis." \
  --base main \
  --head $BRANCH_NAME
```

### Comment on Issue

**If COMMENT_ON_ISSUE = "true":**

```bash
gh issue comment $ISSUE_NUMBER --body "Fix implemented and tested. Branch: \`$BRANCH_NAME\`"
```

---

## Summary

Provide final summary:

### Bug Fix Complete

**Issue**: #$ISSUE_NUMBER - $ISSUE_TITLE
**RCA Document**: `docs/rca/issue-$ISSUE_NUMBER.md`
**Root Cause**: [One-line summary]
**Files Modified**: [List]
**Tests Added**: [List]
**Validation**: All passing
**Branch**: $BRANCH_NAME (created: $CREATE_BRANCH)
**PR**: (created: $CREATE_PR)
**Comment**: (posted: $COMMENT_ON_ISSUE)
