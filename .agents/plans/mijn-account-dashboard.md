# Feature: Mijn Account Dashboard — Admin-Configured Product Catalog

## Context Note

This plan is based on:
- Conversation with Tim on 2026-04-09/10 about training UX and account dashboard
- Memory record `project_mijn_account_feature.md` capturing Tim's design
- Codebase analysis of accessRights, checkoutProducts, users, dashboard, admin

## Feature Description

Admin-configurable product catalog on the user dashboard. Every product Klaas offers (trainings, e-book, luisterboek, fysiek boek) is visible to logged-in users — locked with a padlock icon if not purchased (click → checkout), unlocked if purchased (click → content). Admin configures per language (NL/EN/DE) which checkout pages appear and in what order.

## User Story

As a logged-in user I want to see every available product on my dashboard — with a clear locked/unlocked state — so I can instantly see what I own and what I can still buy, with one click to the checkout.

As Klaas (admin) I want to configure per language which products appear on the dashboard, without touching code, by selecting from my existing checkout pages.

## Problem Statement

Today the dashboard only shows products the user already owns. A user who bought a book doesn't know trainings exist. There's no upsell surface. Klaas has no way to configure which products appear — it's hardcoded.

## Solution Statement

New Convex table `accountCatalog` storing per-language ordered lists of checkout product references. New admin tab "Mijn account" where Klaas picks products per language from his existing checkout pages. Dashboard fetches the catalog, cross-references the user's `accessRights`, and renders each product as a card: unlocked (with link to content) or locked (with link to checkout).

## Feature Metadata

**Feature Type:** New Capability
**Estimated Complexity:** Medium
**Primary Systems Affected:** `convex/schema.ts`, `convex/accountCatalog.ts` (new), `src/app/admin/components/AccountCatalogTab.tsx` (new), `src/app/dashboard/DashboardClient.tsx` (refactor), `src/app/dashboard/ProductCatalog.tsx` (new)
**Dependencies:** None — uses existing checkoutProducts + accessRights

## Execution Strategy

**Recommended:** `/execute-small`

**Analysis:**
- Total tasks: ~12
- Independent workstreams: no — schema → admin → dashboard, each depends on the previous
- Same-file conflicts: yes — DashboardClient touches happen sequentially

**Recommendation rationale:** Sequential build, one developer, manageable scope.

---

## DECISIONS FROM CONVERSATION

### Architecture Choices

**Admin-driven catalog, not auto-derived:**
- What: Admin explicitly selects which checkout pages appear per language
- Why: Tim said "ik wil gewoon in de admin een kopje met 'Mijn account' en dan moet ik daar per taal kunnen aangeven welke betaalpagina's daar op komen te staan"
- Implication: New table + admin UI needed, not a derived view from checkoutProducts

**Products per item, not per language variant:**
- What: E-book is one product on the dashboard, not three (NL/EN/DE)
- Why: Tim said "ik wil niet dat je elke taal ding krijgt. Dus echt per product"
- How: Admin maps the right language-specific checkout page per language environment. NL env → NL e-book checkout. DE env → DE e-book checkout (or EN fallback if no DE exists).

**Locked/unlocked via accessRights:**
- What: Check `accessRights.resource` against checkout product slug to determine ownership
- Why: This is the existing access-grant mechanism (set by `processSuccessfulPayment`)

### Phased Approach

**Phase 1 (NOW):**
- accountCatalog schema + CRUD
- Admin tab to configure per-language product selection
- Dashboard product catalog with locked/unlocked state
- DashboardClient split (443 lines → extract sections)

**Phase 2 (LATER):**
- Pre-fill profile from checkout data (needs investigation of checkout→contact data flow)
- "Claim purchase by email" for users who bought before registering
- Certificate display in dashboard
- Purchase history timeline view

### User Preferences & Constraints

- **500-line file limit** — DashboardClient is at 443, must split before adding
- **Per-language admin config** — admin has a language selector, picks products for that language
- **Design system** — `rounded-[2px]`, `border-rule`, copper accents, editorial style
- **No hardcoded NL strings** — all text through COPY objects

---

## CONTEXT REFERENCES

### Relevant Codebase Files

READ THESE BEFORE IMPLEMENTING:

- `convex/schema.ts:725-771` — `checkoutProducts` table definition, all product fields
- `convex/checkoutProducts.ts` — queries: `getBySlug`, `listActive`, admin CRUD
- `convex/users.ts:1-280` — `getMyAccessRights`, `getMyPurchases`, `getMyProfile`, `getCurrentUser`
- `convex/trainingProgress.ts` — `getMyTrainings` returns training list with progress
- `src/app/dashboard/DashboardClient.tsx:1-443` — current dashboard, must split
- `src/app/dashboard/ProfileEditor.tsx:1-82` — existing profile editor (firstName, lastName, phone, company, website, linkedin)
- `src/app/admin/components/AdminSidebar.tsx:3-26` — Tab union type, add new tab here
- `src/app/admin/AdminClient.tsx` — tab→component mapping, add new tab
- `convex/checkoutProductSeed.ts:15-171` — product slugs and metadata

### Key Data: Product Slugs

| Slug | Type | Name |
|---|---|---|
| `set-online` | training | Sales Excellence Training Online |
| `set-coaching` | training | SET + Coaching |
| `cst-online` | training | Customer Success Training Online |
| `cst-coaching` | training | CST + Coaching |
| `boek-ebook` | book | E-book |
| `boek-hardcopy` | book | Fysiek boek |
| `boek-luisterboek` | book | Luisterboek |
| `boek-cadeau` | book | Cadeau-editie |

### Key Data: Access Check Logic

`accessRights.resource` = product slug. A user "owns" a product when they have an accessRight row where `resource` matches the slug AND `revokedAt` is null AND (`expiresAt` is null OR > now).

### Patterns to Follow

**Pattern: Admin tab registration**
From: `src/app/admin/components/AdminSidebar.tsx:3-26`

Add `"account-catalog"` to the `Tab` union type. Add entry in `NAV` array under "Producten" group. Map to `<AccountCatalogTab />` in `AdminClient.tsx`.

**Pattern: Convex CRUD for admin**
From: `convex/checkoutProducts.ts` — `listActive`, `create`, `update` mutations with `requireAdmin(ctx)`.

**Pattern: Dashboard section**
From: `DashboardClient.tsx:127-165` — section with eyebrow label, grid of cards, empty state.

### New Files to Create

- `convex/accountCatalog.ts` — schema extension + CRUD queries/mutations
- `src/app/admin/components/AccountCatalogTab.tsx` — admin UI for per-language product selection
- `src/app/dashboard/ProductCatalog.tsx` — locked/unlocked product grid
- `src/app/dashboard/TrainingSection.tsx` — extracted from DashboardClient
- `src/app/dashboard/PurchasesSection.tsx` — extracted from DashboardClient
- `src/app/dashboard/DownloadsSection.tsx` — extracted from DashboardClient

---

## IMPLEMENTATION PLAN

### Phase 1: Schema + Convex Backend

Add `accountCatalog` table and CRUD.

**Tasks:**
- Add table to schema
- Create convex/accountCatalog.ts with admin mutations + public query

### Phase 2: Admin Tab

Add "Mijn account" tab to admin sidebar where Klaas selects per-language which checkout pages to show.

**Tasks:**
- Register new tab in AdminSidebar + AdminClient
- Build AccountCatalogTab with language selector + product picker

### Phase 3: Dashboard Refactor

Split DashboardClient.tsx and add the product catalog display.

**Tasks:**
- Extract sections into separate files
- Add ProductCatalog component
- Wire it into the dashboard shell

---

## STEP-BY-STEP TASKS

### UPDATE convex/schema.ts

- **IMPLEMENT:** Add `accountCatalog` table:
```
accountCatalog: defineTable({
  lang: v.union(v.literal("nl"), v.literal("en"), v.literal("de")),
  // Ordered list of checkout product IDs to show for this language
  items: v.array(v.object({
    checkoutProductId: v.id("checkoutProducts"),
    category: v.union(v.literal("training"), v.literal("book")),
    sortOrder: v.number(),
  })),
  updatedAt: v.number(),
}).index("by_lang", ["lang"]),
```
- **WHY:** One row per language. Each row stores an ordered list of product references. Simple, no join needed at read time.
- **VALIDATE:** `npx convex dev --once`

### CREATE convex/accountCatalog.ts

- **IMPLEMENT:** Admin mutations + public query:
  - `getForLang({ lang })` — public query: fetch catalog for lang, join with checkoutProducts for names/images/slugs, return resolved items
  - `getForLangWithAccess({ lang })` — public query: same + cross-reference `accessRights` for current user → add `owned: boolean` per item
  - `adminGet({ lang })` — admin query: raw catalog for editing
  - `adminSave({ lang, items })` — admin mutation: upsert the catalog row
- **PATTERN:** Follow `convex/checkoutProducts.ts` for requireAdmin pattern
- **VALIDATE:** `npx tsc --noEmit`

### UPDATE src/app/admin/components/AdminSidebar.tsx

- **IMPLEMENT:** Add `"account-catalog"` to Tab union type (line 3-26). Add nav entry in "Producten" group: `{ key: "account-catalog", label: "Mijn account", icon: UserIcon }`.
- **VALIDATE:** TypeScript compiles

### UPDATE src/app/admin/AdminClient.tsx

- **IMPLEMENT:** Import `AccountCatalogTab`, add case in tab rendering: `case "account-catalog": return <AccountCatalogTab />`
- **VALIDATE:** Admin loads, new tab appears in sidebar

### CREATE src/app/admin/components/AccountCatalogTab.tsx

- **IMPLEMENT:** Admin UI with:
  - Language selector (NL/EN/DE) at the top — follows existing `editLang` pattern from TrainingEditor
  - List of all active `checkoutProducts` (from `api.checkoutProducts.listActive`)
  - Per product: checkbox to include + drag-to-reorder or sortOrder field
  - Category auto-detected from `checkoutProduct.productType` ("training" or "book")
  - Save button writes to `accountCatalog.adminSave({ lang, items })`
  - Show current state: which products are selected for this language
- **PATTERN:** Follow `TrainingEditorSections.tsx` for Section/EditableField style. Use existing `editLang` selector from TrainingEditor.
- **WHY:** Tim described: "ga ik naartoe. Dan zie ik alle betaalpagina's die ik heb aangemaakt. Dan klik ik op de Nederlandse editie."
- **VALIDATE:** Admin can select products per language, save, reload, see persisted state

### CREATE src/app/dashboard/TrainingSection.tsx

- **IMPLEMENT:** Extract "Mijn trainingen" + "Mijn luisterboeken" sections from DashboardClient.tsx (lines 127-244). Self-contained component receiving `myTrainings` + `lang` props.
- **WHY:** DashboardClient at 443 lines, must split before adding more
- **VALIDATE:** Dashboard renders identically

### CREATE src/app/dashboard/PurchasesSection.tsx

- **IMPLEMENT:** Extract purchases table + StatusBadge from DashboardClient.tsx (lines 249-315). Receives `purchases` + `lang` props.
- **VALIDATE:** Dashboard renders identically

### CREATE src/app/dashboard/DownloadsSection.tsx

- **IMPLEMENT:** Extract downloads + invoices sections from DashboardClient.tsx (lines 319-420). Receives `downloads`, `invoices`, `lang` props.
- **VALIDATE:** Dashboard renders identically

### CREATE src/app/dashboard/ProductCatalog.tsx

- **IMPLEMENT:** The core new component. Queries `accountCatalog.getForLangWithAccess({ lang })`. Renders two groups:
  - **Trainingen** — training-category items
  - **Boeken** — book-category items
  
  Each product card shows:
  - Product image (from checkoutProduct.image/imageStorageId)
  - Product name (localized `shortName`)
  - **Owned** → green checkmark, link to content:
    - Training → `/training/[slug]`
    - Book (ebook/audiobook) → download link from `getMyDownloads`
    - Book (hardcopy) → just "Gekocht" label, no download
  - **Not owned** → padlock icon, copper "Bestellen" button → `/checkout/[slug]`
  
  Design: grid of cards, `border border-rule rounded-[2px]`, copper accents for locked CTA, editorial style matching the rest of the site.
- **COPY:** i18n object with NL/EN/DE for "Trainingen", "Boeken", "Bestellen", "Gekocht", etc.
- **VALIDATE:** Dashboard shows all configured products with correct locked/unlocked state

### UPDATE src/app/dashboard/DashboardClient.tsx

- **IMPLEMENT:** Slim down to orchestrating shell:
  - Keep useQuery calls and layout grid
  - Import and render `<ProductCatalog />` as the FIRST section (above TrainingSection)
  - Import and render extracted `<TrainingSection />`, `<PurchasesSection />`, `<DownloadsSection />`
  - Remove the inline JSX that was extracted
  - Target: < 150 lines
- **VALIDATE:** `npm run build`, dashboard renders correctly, all sections visible

### UPDATE src/app/dashboard/page.tsx

- **IMPLEMENT:** Add `generateMetadata()` with proper title per lang:
  - NL: "Mijn account — Klaas Kroezen"
  - EN: "My account — Klaas Kroezen"
  - DE: "Mein Konto — Klaas Kroezen"
- **VALIDATE:** Page title correct in browser tab

---

## TESTING STRATEGY

### Manual Validation

1. **Admin:** Go to "Mijn account" tab, select NL, add SET + e-book + luisterboek, save. Switch to DE, add CST + fysiek boek, save. Reload — selections persist per language.
2. **Dashboard (NL, no purchases):** All configured NL products show with padlock. Click padlock → goes to `/checkout/[slug]`. No products from DE config visible.
3. **Dashboard (NL, with SET access):** SET shows unlocked with link to `/training/sales-excellence-training`. E-book still locked with padlock.
4. **Dashboard (DE):** Only DE-configured products visible.
5. **Empty catalog:** If no products configured for a language, section doesn't render (no empty grid).

### Edge Cases

- User with no accessRights at all → all products locked
- User with expired accessRight (expiresAt < now) → product shows as locked
- Admin removes a product from catalog → it disappears from dashboard on next load
- Checkout product deactivated (`active: false`) → skip in catalog rendering
- User not logged in → redirect to login (existing behavior)

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
npx tsc --noEmit
npm run lint
```

### Level 2: Build
```bash
npm run build
```

### Level 3: Convex
```bash
npx convex dev --once
```

### Level 4: Manual
See testing strategy above.

---

## ACCEPTANCE CRITERIA

- [ ] Admin has "Mijn account" tab under "Producten" in admin sidebar
- [ ] Admin can select per language (NL/EN/DE) which checkout pages appear
- [ ] Dashboard shows all configured products for the user's current language
- [ ] Owned products show unlocked with link to content
- [ ] Unowned products show locked with padlock + link to checkout
- [ ] Products grouped by category (Trainingen / Boeken)
- [ ] DashboardClient.tsx is under 200 lines after split
- [ ] No new file exceeds 500 lines
- [ ] All text through i18n COPY objects
- [ ] `npx tsc --noEmit` and `npm run build` pass

---

## DEFERRED ITEMS

### Phase 2 Features
- **Pre-fill profile from checkout:** Verify how checkout populates CRM contact data. If it doesn't, add a hook in `processSuccessfulPayment` to copy buyer info (name, phone, company) to the CRM contact.
- **Claim purchase by email:** Users who bought before registering miss accessRights. Need a post-registration hook to backfill based on email match.
- **Certificate display:** Show earned certificates on the dashboard.
- **Purchase history timeline:** Visual timeline of all purchases.

### Known Limitations
- Access check is slug-based: if a checkout product slug changes, existing accessRights break. Don't change slugs.
- `getMyDownloads` may not cover all book types (e.g., hardcopy has no download). Handle gracefully in ProductCatalog.

---

## NOTES & CONTEXT

### Design Rationale

- **One table per language (not per product):** Simpler schema. One `accountCatalog` row per lang with an ordered array of items. Easy to reorder, add, remove in admin.
- **Admin picks from checkout pages:** Tim explicitly wants to reuse existing checkout page definitions, not create a separate product catalog. This means the `checkoutProducts` table is the source of truth for names, images, prices.
- **Locked/unlocked on dashboard:** The UX goal is subtle upsell. The padlock + copper "Bestellen" button is visible but not aggressive. Owned products get a green check and direct content link.

### Pre-fill Question (Deferred)

Tim asked: "worden die gegevens dan ook al ingevuld?" — whether checkout data pre-fills the profile. Current state: `processSuccessfulPayment` in `convex/payments.ts` creates a CRM contact with `firstName` + `email` from the checkout form. So yes, basic data flows. But phone, company, website are NOT captured at checkout — those are only in the profile editor. This is acceptable for Phase 1; address it in Phase 2 if Tim wants more fields pre-filled.
