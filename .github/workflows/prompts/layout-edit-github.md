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
- `src/app/*/content.ts` or `content-*.ts` — Page content
- `src/lib/site-config.ts` — ONLY to add new pages to PAGES array

### ALSO ALLOWED for NEW pages only (if target starts with "new:"):
- `convex/siteSchemas.ts` — Add content schema for admin editing
- `convex/siteSeed.ts` — Add import + entry to `getAllSeeds()` function
- `convex/siteSeed[NewPage].ts` — Add seed content for the new page (follow existing pattern)
- `src/app/[new-slug]/page.tsx` — Create the new page route
- `src/lib/site-config.ts` — Add the new page to the PAGES array

### FORBIDDEN files (NEVER touch these):
- `src/app/admin/**` — Admin panel
- `src/middleware.ts` — Middleware
- `package.json`, `*.config.*` — Configurations
- `src/app/checkout/**` — Checkout flow
- `convex/auth.ts`, `convex/payments.ts`, `convex/mollie.ts` — Core backend

### Design System (ALWAYS use these tokens):
- **Fonts**: Playfair Display (headings), DM Sans (body)
- **Colors**: ink (#0E0C0A), paper (#F7F4EF), warm (#EDE9E2), copper (#B5622A), copper-light (#D4794A)
- **Border-radius**: Always `rounded-[2px]`
- **Container**: max-width 1180px
- **Padding**: 56px desktop, 28px mobile
- **Breakpoint**: 1024px (lg)
- **Tracking labels**: `text-[10px] font-medium tracking-[0.2em] uppercase text-copper`

### Images
- Legacy images exist in `/public/images/` — OK to reference for existing sections
- NEW images should use Convex storage (uploaded via admin drag-drop)
- For new sections: create an image prop (string) that accepts both static paths AND Convex URLs
- The admin replaces images via the Content tab (AdminImageUpload component with auto-resizing to WebP)
- ALWAYS use `next/image` (import Image from "next/image") — never `<img>`
- For aspect ratio changes: use Tailwind classes like `aspect-[16/9]` + `object-cover`
- NEVER hardcode image paths in component JSX — always receive via props so admin can change them

### Content Strategy
- Content goes in `content.ts` files (fallback) — the admin can override via the Content tab later
- If the user specifies exact content in their message (names, descriptions, text), use that exact content in `content.ts` — do NOT use placeholder text when the user gave you the real content
- Only use placeholders ("Naam invullen", "Beschrijving toevoegen") when the user did NOT specify the content
- The content.ts files serve as the initial values — the database overrides them when edited via admin

### Component Props Contract
- Components receive content via props — NEVER hardcode text in JSX
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
