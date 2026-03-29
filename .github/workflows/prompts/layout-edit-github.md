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
- `src/app/*/content.ts` or `content-*.ts` — Page content (frontend fallback)
- `convex/siteSchemas.ts` — Section schema (admin form fields) — update when adding new fields to a section
- `convex/siteSeed*.ts` — Database seed content — ALWAYS update when content changes
- `convex/siteSeed.ts` — Add imports for NEW pages (getAllSeeds function)
- `src/lib/site-config.ts` — ONLY to add new pages to PAGES array

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

### Content & Database Sync (CRITICAL)
When you change content (add team members, change fields, add sections), you MUST update BOTH:
1. `src/app/[page]/content.ts` — frontend fallback
2. `convex/siteSeed[Page].ts` — database seed (MUST match content.ts structure and data)

The seed file is what gets synced to the database when the admin approves.
If you only update content.ts but not the seed, the admin CANNOT edit the new content in the Content tab.

Example: adding a 4th team member to over-ons:
- Update `src/app/over-ons/content.ts` → add 4th member to array (NL + EN + DE)
- Update `convex/siteSeedOverOns.ts` → add 4th member to both NL and EN `makeContent()` calls
- Do NOT need to change `siteSchemas.ts` — the `members` array type already supports unlimited items

If you add a completely NEW field type to a section (not just adding items to an existing array), also update `convex/siteSchemas.ts`.

### Content Rules
- If the user specifies exact content (names, descriptions, text), use that exact content — do NOT use placeholder text
- Only use placeholders ("Naam invullen", "Beschrijving toevoegen") when the user did NOT specify the content
- The content.ts files serve as fallback values — the database overrides them when edited via admin

### Component Props Contract
- Components receive content via props — NEVER hardcode text in JSX
- The props interface is the contract with the database — NEVER change prop types
- You may change how props are rendered (styling, layout) but not what props exist

### Validation (HARD GATE — must pass before finishing)
Run these checks. If they fail, fix and retry (max 2 attempts):
1. `npx next lint` — must pass with 0 errors
2. `npx tsc --noEmit` — must pass with 0 errors

### IMPORTANT: Do NOT commit or push
Do NOT run any git commands (no git add, git commit, or git push).
The workflow will handle committing and pushing your changes automatically.
Just make the code changes and ensure validation passes.
