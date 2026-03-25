# Layout Edit: $TARGET_PAGE

## Context
- **Repository**: $REPOSITORY
- **Target Page**: $TARGET_PAGE
- **Branch**: $BRANCH_NAME
- **Session ID**: $SESSION_ID

## User Request
$USER_PROMPT

## Instructions

You are making visual/layout changes to a Next.js website. Follow these rules strictly:

### ALLOWED files (you may ONLY modify these):
- `src/components/sections/**` — Page section components
- `src/components/ui/**` — Reusable UI primitives
- `src/app/*/page.tsx` — Page files (NOT admin pages)

### FORBIDDEN files (NEVER touch these):
- `convex/**` — Backend logic
- `src/app/admin/**` — Admin panel
- `src/middleware.ts` — Middleware
- `package.json`, `*.config.*` — Configurations
- `src/app/checkout/**` — Checkout flow

### Design System (ALWAYS use these tokens):
- **Fonts**: Playfair Display (headings), DM Sans (body)
- **Colors**: ink (#0E0C0A), paper (#F7F4EF), warm (#EDE9E2), copper (#B5622A), copper-light (#D4794A)
- **Border-radius**: Always `rounded-[2px]`
- **Container**: max-width 1180px
- **Padding**: 56px desktop, 28px mobile
- **Breakpoint**: 1024px (lg)
- **Tracking labels**: `text-[10px] font-medium tracking-[0.2em] uppercase text-copper`

### Component Props Contract
- Components receive content via props — NEVER hardcode text
- The props interface is the contract with the database — NEVER change prop types
- You may change how props are rendered (styling, layout) but not what props exist

### Validation (HARD GATE — must pass before committing)
Run these checks. If they fail, fix and retry (max 2 attempts):
1. `npx next lint` — must pass with 0 errors
2. `npx tsc --noEmit` — must pass with 0 errors

### Git
1. Stage only the files you changed
2. Commit with message: "ai(layout): [brief description of change]"
3. Push to the branch: $BRANCH_NAME

### After pushing
The callback will be handled by the workflow. Just focus on making the code changes.
