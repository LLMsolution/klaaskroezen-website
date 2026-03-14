---
description: Fix issues from a validation or code review report
argument-hint: <report-file-path>
---

# Code Review Fix

Fix issues identified in a validation or code review report, one by one, then re-validate.

**Arguments:** $ARGUMENTS

---

## Step 1: Read the Report

Read the report file at `$ARGUMENTS`.

If no argument is provided, check for the most recent report in `.agents/reviews/` and use that:
```bash
ls -t .agents/reviews/validate-*.md | head -1
```

Parse the report and identify:
- **Critical issues** (must fix)
- **Important issues** (should fix)
- **Suggestions** (optional — skip unless trivial)

Count the total issues to fix.

---

## Step 2: Fix Issues (One by One)

For EACH Critical issue first, then Important issues:

### 2.1 Understand the Issue
- Read the file(s) mentioned in the issue
- Understand the surrounding code context
- Identify the root cause (not just the symptom)

### 2.2 Apply the Fix
- Make the minimum change needed to resolve the issue
- Follow existing code patterns and conventions
- Don't refactor surrounding code — fix the issue only

### 2.3 Confirm the Fix
- Briefly explain: what was wrong and what you changed
- If a test is relevant and quick, run it

### 2.4 Move to Next Issue
- Report progress: `Fixed 2/5 issues...`
- Continue to next issue

---

## Step 3: Re-validate

After all Critical and Important issues are fixed, run `/validate` at the same level as the original report:
- If original was `--review` → run `/validate --review`
- If original was `--full` → run `/validate --full`
- If unknown, default to `/validate --review`

---

## Step 4: Report

Provide a summary:

```
Code Review Fix Complete

Fixed: X/Y issues (Z Critical, W Important)
Skipped: N suggestions (optional)

Re-validation: ✅ PASS / ⚠️ still has issues

[If still has issues: new report saved to .agents/reviews/validate-YYYY-MM-DD-N.md]
```

If re-validation still finds new issues, inform the user and suggest running `/code-review-fix` again with the new report path.
