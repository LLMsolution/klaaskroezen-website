---
description: Unified validation - auto-detects codebase type and runs appropriate checks, agents, and skills
argument-hint: [--quick|--review|--full]
---

# Validate

Unified validation command that auto-detects your codebase type and runs the appropriate checks, agents, and skills. This is CODE ANALYSIS only — no browser needed. For browser-based testing, use `/test-frontend`.

## Validation Levels

| Level | What it does | When to use |
|-------|-------------|-------------|
| `--quick` | Foundational checks only (type, lint, test, build) | During development |
| `--review` | + Code review agents + frontend code skills (default) | Before commit |
| `--full` | Everything applicable for this codebase | Before PR merge |

**Default:** If no flag is provided, `--review` is used.

**Arguments:** $ARGUMENTS

---

## Step 1: Detect Codebase Type

Auto-detect the stack by reading project files. Do this EVERY time (no cached profile needed).

**Check for these files and determine the stack:**

| File/Pattern | Detected As |
|---|---|
| `package.json` with `next` dependency | Next.js |
| `package.json` with `react` dependency | React |
| `package.json` with `typescript` dependency | TypeScript |
| `eslint.config.*` or `.eslintrc*` | ESLint |
| `jest.config.*` or `vitest.config.*` | JavaScript tests |
| `playwright.config.*` | Playwright E2E |
| `pyproject.toml` or `requirements.txt` | Python |
| `pytest.ini` or `conftest.py` | Python tests |
| `mypy.ini` or `[mypy]` in pyproject.toml | Python types |
| `convex/` directory | Convex backend |
| `supabase/` directory | Supabase backend |
| `app/api/` or `pages/api/` | API routes |
| `auth` in dependencies | Auth system |
| `pydantic-ai` or `langchain` in deps | AI/ML |
| `Dockerfile` or `docker-compose.yml` | Docker |

**Output a brief stack summary before proceeding:**
```
Detected: TypeScript, Next.js, Convex, ESLint, Tailwind
Frontend: Yes | Backend: Yes (Convex) | API routes: Yes | Auth: Yes
Validation level: --review
```

---

## Step 2: Foundational Checks (ALL levels)

Run the appropriate checks based on detected stack. Stop and report if any critical check fails.

**TypeScript detected:**
```bash
npx tsc --noEmit
```

**ESLint detected:**
```bash
npm run lint
```
(or `npx eslint .` if no lint script)

**Test framework detected (jest/vitest/playwright):**
```bash
npm test
```

**Python detected:**
```bash
pytest
```

**Python types (mypy) detected:**
```bash
mypy .
```

**Python security (bandit) detected or Python project:**
```bash
bandit -r . --exclude=venv,.venv,__pycache__,node_modules -f txt || true
```

**Build check (Next.js or build script detected):**
```bash
npm run build
```

**Report results:**
```
Foundational Checks:
  TypeScript:  ✅ PASS (0 errors)
  ESLint:      ✅ PASS (0 errors, 2 warnings)
  Tests:       ✅ PASS (12/12)
  Build:       ✅ PASS
```

**If `--quick` was specified, STOP HERE and report the summary.**

---

## Step 3: Code Review Agents (--review, --full)

Run these agents on the recent changes (git diff).

### Always run:

**code-reviewer agent:**
```
Task(subagent_type="code-reviewer", prompt="Review the recent code changes for bugs, security issues, and adherence to project standards in CLAUDE.md. Focus on: logic errors, security issues, performance problems, code quality.")
```

**silent-failure-hunter agent:**
```
Task(subagent_type="silent-failure-hunter", prompt="Review recent code changes for silent failures, inadequate error handling, inappropriate fallback behavior, and empty catch blocks.")
```

### Conditionally run based on git diff:

**If new types/interfaces were added (check git diff for `type `, `interface `):**
```
Task(subagent_type="type-design-analyzer", prompt="Review the new types/interfaces in the recent changes for encapsulation, invariant expression, and design quality.")
```

**If auth or API routes were changed:**
```
Task(subagent_type="security-auditor", prompt="Review the recent changes for security vulnerabilities, focusing on authentication, authorization, input validation, and data exposure.")
```

**If a `docs/` directory exists and was modified:**
```
Task(subagent_type="docs-impact-agent", prompt="Review recent code changes and identify any documentation that needs to be updated to reflect the changes.")
```

**Run agents in parallel where possible** (code-reviewer + silent-failure-hunter can run simultaneously).

### Frontend code quality (auto-detected):

**If Next.js detected, use skill:** `next-best-practices`

Scan all frontend code for:
- File conventions (layout.tsx, loading.tsx, error.tsx placement)
- RSC boundaries (no async client components, serializable props)
- Async patterns (async params, searchParams, cookies, headers)
- Metadata API usage, error handling, image/font optimization

**If React detected, use skill:** `vercel-react-best-practices`

Scan components for performance anti-patterns:
- CRITICAL: Eliminating waterfalls, bundle size
- HIGH: Server-side performance (caching, dedup)
- MEDIUM: Re-render optimization (memo, derived state)

**If frontend detected (any), use skill:** `web-design-guidelines`

Review UI component code for:
- Accessibility (ARIA labels, semantic HTML in code)
- Touch targets (minimum 44x44px in styles)
- Form labels and error messages
- Focus indicator styles

### Report agent + skill findings:

```
Agent Reviews:
  code-reviewer:         ✅ No critical issues (1 medium suggestion)
  silent-failure-hunter: ✅ No silent failures detected
  type-design-analyzer:  ⚠️ 1 type could improve encapsulation

Frontend Code Quality:
  Next.js Best Practices: ✅ 9/10
  React Performance:      ⚠️ 7/10 (2 waterfall issues)
  Web Design Guidelines:  ✅ 8/10
```

**If `--review` was specified (or no flag), STOP HERE and report the full summary.**

---

## Step 4: Full Validation (--full only)

Runs everything above, PLUS additional checks:

### Always run in --full:

**pr-test-analyzer agent:**
```
Task(subagent_type="pr-test-analyzer", prompt="Review the PR changes for test coverage quality and completeness. Identify critical gaps in test coverage, untested error handling paths, and missing edge cases. Rate each gap by criticality (1-10). Focus on behavioral coverage, not line coverage.")
```

**dependency-auditor agent:**
```
Task(subagent_type="dependency-auditor", prompt="Audit all project dependencies for known security vulnerabilities, outdated packages, and license compliance issues. Check npm audit, pip audit, or equivalent for the detected stack.")
```

**Run these two in parallel.**

### Conditionally run based on detected stack:

**If Python AI detected (pydantic-ai, langchain):**
```
Task(subagent_type="pydantic-ai-validator", prompt="Validate the AI/ML implementation for correct dependency usage, prompt patterns, and tool integration.")
```

**If API routes detected:**
```
Task(subagent_type="api-contract-validator", prompt="Validate API endpoint contracts: request/response shapes, status codes, error handling, authentication requirements.")
```

**If Docker detected:**
```bash
docker compose build --dry-run 2>&1 || true
```

**Dependency audit (CLI):**
```bash
npm audit --audit-level=high 2>&1 || true
```

---

## Final Report

Generate a unified report with the following structure. **If any Critical or Important issues are found, ALSO write the report to a file** (see below).

```markdown
# Validation Report

**Codebase:** [detected stack]
**Level:** [--quick|--review|--full]
**Date:** [timestamp]

## Summary

| Category | Status | Issues |
|----------|--------|--------|
| TypeScript | ✅ | 0 errors |
| ESLint | ✅ | 0 errors |
| Tests | ✅ | 12/12 passed |
| Build | ✅ | Clean |
| Code Review | ✅ | No critical issues |
| Silent Failures | ✅ | None detected |
| Frontend Code Quality | ✅ | 8/10 (if applicable) |
| Test Coverage | ✅ | No critical gaps (--full only) |
| Dependencies | ✅ | No vulnerabilities (--full only) |

**Overall: ✅ PASS / ⚠️ NEEDS WORK / ❌ CRITICAL ISSUES**

## Issues Found

### Critical (fix before commit)
[list or "None"]

For each issue include:
- **File**: exact file path and line number(s)
- **Issue**: what's wrong
- **Why**: why it matters
- **Fix**: specific recommendation

### Important (fix before PR)
[list or "None" — same format as Critical]

### Suggestions (nice to have)
[list or "None" — brief, no fix needed]
```

---

## Report File (when issues found)

**If the overall result is ⚠️ NEEDS WORK or ❌ CRITICAL ISSUES:**

1. Create directory `.agents/reviews/` if it doesn't exist
2. Write the full report to: `.agents/reviews/validate-YYYY-MM-DD.md`
   - If a file with that name already exists, append a counter: `validate-YYYY-MM-DD-2.md`
3. Show the user a concise summary + the file path:

```
Overall: ⚠️ NEEDS WORK — 2 Critical, 1 Important issue found

Report saved to: .agents/reviews/validate-2026-02-12.md

Run `/code-review-fix .agents/reviews/validate-2026-02-12.md` to fix the issues.
```

**If the overall result is ✅ PASS:**

No report file needed. Show the summary in the console:

```
Overall: ✅ PASS — no issues found

Next steps:
- Run `/test-frontend` for browser-based testing (if UI changes)
- Ready for `/commit` when all checks pass
```
