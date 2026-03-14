---
description: Browser-based frontend testing - functional, visual, and accessibility testing on all devices
argument-hint: [--full|--changes] URL
---

# Test Frontend

Comprehensive browser-based testing of a running application. Tests every feature on desktop, tablet, and mobile. Uses the `agent-browser` skill for all browser automation.

**This is runtime testing** — it tests the actual app in a browser. For code analysis (patterns, performance rules, accessibility in code), use `/validate --review`.

## Modes

| Mode | What it tests | When to use |
|------|-------------|-------------|
| `--full` | ALL routes, ALL features, ALL devices | New app, release check, full audit |
| `--changes` | Only changed routes/features, ALL devices | After feature/bugfix (default) |

**Default:** If no mode specified, `--changes` is used.

**Arguments:** $ARGUMENTS

---

## Step 1: Route Discovery

Find all routes in the application:

```
- Find all page.tsx / page.jsx files in app/ or pages/ directory
- Convert file paths to URLs (e.g., app/(dashboard)/taken/page.tsx → /taken)
- Identify route groups and dynamic routes
- List protected routes (behind auth) vs public routes
```

**Output:**
```
Routes discovered: 12
  Public:    /login, /wachtwoord-wijzigen
  Protected: /, /taken, /taken/[id], /panden, /panden/[id], /agenda, /notificaties
  Admin:     /gebruikers, /categorieen
```

---

## Step 2: Scope Determination

### If `--full`:
- Test ALL discovered routes
- Skip to Step 3

### If `--changes` (default):
1. Run `git diff HEAD~1 --name-only` (or `git diff main --name-only` if on feature branch)
2. Map changed files to affected routes:
   - `app/(dashboard)/taken/page.tsx` → route `/taken`
   - `components/taken/TaakKaart.tsx` → routes that import TaakKaart (search for imports)
   - `convex/taken.ts` → routes using taken data (check which pages query taken)
   - `components/ui/button.tsx` → ALL routes (shared component)
   - `components/layout/Header.tsx` → ALL routes (layout component)
3. For shared components (ui/, layout/), test a representative sample (3-5 routes) instead of all

**Output:**
```
Changed files: 4
  app/(dashboard)/taken/page.tsx → /taken
  components/taken/TaakModal.tsx → /taken, /taken/[id]
Scope: 2 routes (+ /taken/[id] with sample data)
```

---

## Step 3: Feature Discovery

For each route in scope, read the page component and its imports to identify testable features:

**Read the page.tsx and imported components. Identify:**
- Forms (inputs, selects, textareas, submit buttons)
- Navigation elements (links, tabs, breadcrumbs)
- Interactive elements (buttons, modals, dropdowns, popovers, sheets)
- Data displays (tables, lists, cards, badges)
- State changes (loading, empty, error states)
- Filters and search functionality
- CRUD operations (create, read, update, delete)

**Output per route:**
```
Route: /taken
Features found:
  - Filter dropdown (status, prioriteit, categorie)
  - Search input (zoekbalk)
  - Task cards with click → modal
  - New task button → modal with form
  - Status badge interactions
  - Pagination or infinite scroll
```

---

## Step 4: Authentication

If protected routes are in scope:

1. Check if auth credentials are available (CLAUDE.md, .env, conversation context)
2. Navigate to login page
3. Authenticate using available credentials
4. Verify auth state persists across navigation
5. Store session for subsequent tests

**Default credentials (from project context):**
- Check CLAUDE.md for admin credentials
- Check `.env.local` for test user credentials

---

## Step 5: Test Execution

For each route in scope, run tests on ALL THREE device sizes:

### Device Sizes

| Device | Viewport | Touch | Notes |
|--------|----------|-------|-------|
| Desktop | 1920x1080 | No | Test hover states, wide layout |
| Tablet | 768x1024 | Yes | Test breakpoints, touch targets |
| Mobile | 375x667 | Yes | Test mobile layout, hamburger menu |

### Per Route, Per Device:

**Use skill: `agent-browser`**

#### 5a: Visual Integrity
- Take full-page screenshot
- Check: no horizontal overflow, no overlapping elements
- Check: text is readable (not truncated, not too small)
- Check: images load correctly
- Check: proper spacing and alignment

#### 5b: Feature Testing
For each feature discovered in Step 3:
- **Forms**: Fill all fields → submit → verify success/error state
- **Buttons**: Click → verify expected action (modal opens, navigation, state change)
- **Modals/Sheets**: Open → verify content → interact → close (click outside + X button + Escape key)
- **Dropdowns/Selects**: Open → select option → verify selection applied
- **Filters**: Apply filter → verify data updates → clear filter → verify reset
- **Search**: Type query → verify results update → clear → verify reset
- **Navigation**: Click links → verify correct page loads → back button works
- **CRUD**: If applicable, test create → verify appears → edit → verify updates → delete → verify removed

#### 5c: Accessibility (Runtime)
- **Keyboard navigation**: Tab through all interactive elements — verify logical order
- **Focus indicators**: Verify visible focus ring on every focusable element
- **Escape key**: Close modals, dropdowns, popovers with Escape
- **Color contrast**: Visually verify text is readable against background
- **Touch targets** (tablet/mobile): Interactive elements are at least 44x44px

#### 5d: Responsive Behavior
- **Layout**: Verify layout adapts correctly between device sizes
- **Navigation**: Desktop sidebar → mobile hamburger/bottom nav
- **Tables**: Horizontal scroll or card view on mobile
- **Forms**: Full-width inputs on mobile
- **Modals**: Full-screen or sheet on mobile

---

## Step 6: Results Report

Generate a comprehensive report:

```markdown
# Frontend Test Report

**URL:** [tested URL]
**Mode:** [--full / --changes]
**Date:** [timestamp]
**Routes tested:** [count] / [total discovered]

## Summary

| Route | Desktop | Tablet | Mobile | Issues |
|-------|---------|--------|--------|--------|
| /taken | ✅ | ✅ | ⚠️ | 1 layout issue |
| /taken/[id] | ✅ | ✅ | ✅ | — |
| /panden | ✅ | ⚠️ | ⚠️ | 2 issues |

## Device Results

### Desktop (1920x1080)
- [Screenshots per route]
- Issues: [list or "None"]

### Tablet (768x1024)
- [Screenshots per route]
- Issues: [list or "None"]

### Mobile (375x667)
- [Screenshots per route]
- Issues: [list or "None"]

## Feature Test Results

### /taken
| Feature | Status | Notes |
|---------|--------|-------|
| Filter dropdown | ✅ | All filters work correctly |
| Search | ✅ | Results update in real-time |
| Task modal | ⚠️ | Close button too small on mobile |
| New task form | ✅ | Validation works |

### /panden
[...]

## Accessibility Results

| Check | Desktop | Tablet | Mobile |
|-------|---------|--------|--------|
| Keyboard navigation | ✅ | N/A | N/A |
| Focus indicators | ✅ | ✅ | ✅ |
| Touch targets | N/A | ✅ | ⚠️ |
| Escape to close | ✅ | ✅ | ✅ |

## Issues Found

### Critical (blocks release)
[list or "None"]

### Important (fix soon)
[list or "None"]

### Minor (nice to have)
[list or "None"]

## Next Steps
- Fix critical issues
- Re-run `/test-frontend --changes URL` after fixes
- Run `/validate` for code quality checks
- Ready for `/commit` when all tests pass
```
