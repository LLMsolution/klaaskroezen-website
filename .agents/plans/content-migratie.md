# Feature: Content Migratie — Content uit code naar database

## Context

Content (teksten, CTA's, afbeeldingen) zit nu hardcoded in `content.ts` bestanden. We verhuizen dit naar de database zodat:
- Klaas content kan beheren via admin formulieren (zonder deploy)
- De AI Layout Editor (Fase 1+2+3) alleen de presentatie-laag hoeft aan te passen
- Het content-contract (component props) stabiel blijft

Dit is de fundatie voor de AI Layout Editor. Zonder dit kan de rest niet gebouwd worden.

---

## Execution Strategy

**Recommended**: `/execute-small` — taken zijn sequentieel (schema → seed → queries → admin UI → refactor)

---

## CONTEXT REFERENCES

### Content bestanden die gemigreerd moeten worden

| Bestand | Regels | Secties |
|---|---|---|
| `src/app/sales-excellence-training/content.ts` | 551 | hero, painPoints, transformation, audiences, program, reviews, pricing, crossLink, faq, cta |
| `src/app/boek/content.ts` | 410 | hero, painPoints, bookContent, reviews, pricing, faq, cta |
| `src/app/spreker/content.ts` | 286 | hero, topics, approach, reviews, cta |
| `src/app/customer-success-training/content.ts` | 192 | hero, painPoints, transformation, audiences, program, reviews, pricing, crossLink, faq, cta |
| `src/app/over-ons/content.ts` | 169 | hero, story, values, team, cta |

### Pagina's die NIET gemigreerd hoeven

- `/checkout/*` — content komt al uit database (`checkoutProducts` tabel)
- `/dashboard` — dynamische data
- `/admin` — admin panel
- `/login` — i18n via `lib/i18n`
- `/privacy`, `/algemene-voorwaarden` — juridische tekst
- `/nieuws/*` — al in database (`blogPosts` tabel)
- `/training/*` — al in database (`trainings` + `trainingModules` tabellen)

### Bestaande patronen om te hergebruiken

**Admin CRUD** (`src/app/admin/components/BlogTab.tsx`, `convex/blog.ts`):
- View state: list | create | edit
- requireAdmin(ctx) op elke mutation
- Patch pattern voor partial updates

**Schema conventies** (`convex/schema.ts`):
- Timestamps, indexes, v.optional
- NL/EN als `v.object({ nl: v.string(), en: v.string() })`

**Admin tab pattern** (`src/app/admin/AdminClient.tsx`, `AdminSidebar.tsx`):
- Tab type toevoegen aan AdminSidebar
- Import + render in AdminClient
- TAB_LABELS record

### Sectie-types inventaris

| Type | Gebruikt door | Velden (NL+EN) |
|---|---|---|
| `hero` | SET, CST, Boek, Spreker, Over ons | eyebrow, title (1-2 regels), description, image, imageAlt, imagePosition, glassItems[] |
| `pain-points` | SET, CST, Boek | title, titleAccent, points[] |
| `transformation` | SET, CST | items[]: label, before, after |
| `audiences` | SET, CST | items[] (strings) |
| `program` | SET, CST | price, modules[]: number, title, description |
| `reviews` | SET, CST, Boek, Spreker | items[]: text, name, role, avatar? |
| `pricing` | SET, CST, Boek | guarantee, individual.tiers[], team.tiers[] |
| `faq` | SET, CST, Boek | title, titleAccent, items[]: question, answer |
| `cta` | SET, CST, Boek, Spreker, Over ons | title, titleAccent, description, href |
| `cross-link` | SET, CST | eyebrow, title, titleAccent, description, image, href, ctaLabel |
| `book-content` | Boek | chapters[], features[] |
| `topics` | Spreker | items[]: title, description |
| `approach` | Spreker | items[]: title, description |
| `story` | Over ons | paragraphs[] |
| `values` | Over ons | items[]: title, description |
| `team` | Over ons | members[]: name, role, image |

---

## AUTO-FORMULIER STRATEGIE

Het admin content-formulier genereert zichzelf op basis van het JSON schema per sectie-type.

### Schema formaat

Elk sectie-type heeft een schema-definitie:

```json
{
  "type": "hero",
  "fields": [
    { "key": "eyebrow", "type": "text", "label": "Eyebrow tekst" },
    { "key": "title", "type": "text", "label": "Titel" },
    { "key": "description", "type": "textarea", "label": "Beschrijving" },
    { "key": "image", "type": "image-path", "label": "Afbeelding" },
    { "key": "imageAlt", "type": "text", "label": "Alt tekst" },
    { "key": "cta", "type": "object", "label": "CTA", "fields": [
      { "key": "label", "type": "text", "label": "Knoptekst" },
      { "key": "href", "type": "text", "label": "Link" }
    ]},
    { "key": "glassItems", "type": "array", "label": "Glass items", "itemFields": [
      { "key": "label", "type": "text", "label": "Label" },
      { "key": "text", "type": "text", "label": "Tekst" }
    ]}
  ]
}
```

### Veldtypen

| Type | Admin UI | Opslag |
|---|---|---|
| `text` | Input veld | string |
| `textarea` | Textarea | string |
| `richtext` | HTML textarea | string (HTML) |
| `number` | Number input | number |
| `image-path` | Tekstveld met pad (bijv. `/images/hero/...`) | string |
| `object` | Groep van sub-velden | object |
| `array` | Lijst met add/remove knoppen | array |

### Formulier component

`ContentFieldRenderer.tsx` (~200 regels) — recursief component dat op basis van het schema het juiste formulier rendert:
- `text` → `<input type="text">`
- `textarea` → `<textarea>`
- `object` → genest formulier met sub-velden
- `array` → lijst met "+ Item" knop, elk item is een genest formulier

---

## DATA MODEL

### Nieuw in convex/schema.ts

**`sitePages`** — Pagina-definitie met sectie-lijst
```
slug: string                      — "sales-excellence-training"
title: object { nl, en }
sections: array of {
  id: string                      — unieke key (bijv. "hero", "pain-points")
  type: string                    — sectie-type
  active: boolean
  sortOrder: number
}
createdAt: number
updatedAt: number
```
Index: by_slug

**`siteContent`** — Content per sectie, bewerkbaar in admin
```
pageSlug: string
sectionId: string
schema: string                    — JSON schema (welke velden de admin toont)
content: string                   — JSON content data
lang: "nl" | "en"
updatedAt: number
```
Index: by_page_section (pageSlug + sectionId), by_page (pageSlug)

---

## STEP-BY-STEP TASKS

### Task 1: Sectie-type schema's + database tabellen

**IMPLEMENT**:
- `convex/siteSchemas.ts` — TypeScript constanten met JSON schema per sectie-type (~16 types)
- `sitePages` en `siteContent` tabellen toevoegen aan `convex/schema.ts`
- **PATTERN**: Bestaande tabel conventies (timestamps, indexes, v.optional)
- **VALIDATE**: `npx convex dev --once`

### Task 2: Seed script — content migreren naar database

**IMPLEMENT**:
- `convex/siteSeed.ts` — migreer content uit alle 5 content.ts bestanden
- Per pagina: 1 `sitePages` rij met sectie-lijst
- Per sectie per taal: 1 `siteContent` rij met schema + content JSON
- Pagina's: sales-excellence-training, customer-success-training, boek, spreker, over-ons
- **VALIDATE**: `npx convex run siteSeed:seed`, check data in Convex dashboard

### Task 3: Convex queries + mutations

**IMPLEMENT**:
- `convex/siteContent.ts` — CRUD voor site content:
  - `getPage` query — pagina + alle secties
  - `getPageContent` query — alle content voor een pagina (beide talen)
  - `getSection` query — enkele sectie content
  - `updateSection` mutation — content JSON opslaan (requireAdmin)
  - `reorderSections` mutation — volgorde aanpassen (requireAdmin)
  - `toggleSection` mutation — sectie aan/uit (requireAdmin)
- **PATTERN**: Blog CRUD pattern (convex/blog.ts)
- **VALIDATE**: `npx convex dev --once`

### Task 4: Admin content-editor

**IMPLEMENT**:
- `src/app/admin/components/ContentTab.tsx` (~250 regels):
  - Pagina-selector dropdown
  - Lijst van secties met expand/collapse
  - Per sectie: NL/EN tab-toggle
  - Opslaan knop per sectie
- `src/app/admin/components/ContentFieldRenderer.tsx` (~200 regels):
  - Recursief formulier op basis van schema
  - Veldtypen: text, textarea, number, image-path, object, array
  - Array: add/remove items
  - Object: geneste sub-velden
- AdminSidebar: tab `content` toevoegen (sectie "beheren")
- AdminClient: import + render ContentTab
- **PATTERN**: BlogTab CRUD pattern, bestaande admin styling
- **VALIDATE**: `npx next build` (geen errors)

### Task 5: Refactor pagina-componenten

**IMPLEMENT**:
- Alle 5 pagina's refactoren: server components halen content op via Convex query
- Per pagina: `fetchQuery(api.siteContent.getPageContent, { slug, lang })`
- Props-interface (het contract) blijft identiek — componenten merken niks
- Fallback: als DB content niet gevonden → lege defaults (pagina breekt niet)
- `content.ts` bestanden verwijderen na validatie
- **VALIDATE**: Pagina's renderen identiek met DB content, `npx next build`

---

## TESTING & VALIDATION

### Per task
1. `npx convex dev --once` — backend compileert
2. `npx next build` — frontend compileert

### Na alle tasks
1. Seed draaien: `npx convex run siteSeed:seed`
2. Admin: Content tab → pagina selecteren → secties zichtbaar met formulieren
3. Content wijzigen in admin → pagina herlaadt met nieuwe content (zonder deploy)
4. Alle 5 pagina's renderen identiek aan de huidige versie
5. `content.ts` bestanden verwijderd
6. Alle bestanden onder 500 regels

---

## ACCEPTANCE CRITERIA

- [ ] 5 pagina's hebben content in de database (NL + EN)
- [ ] Admin Content tab toont alle secties per pagina met formulieren
- [ ] Content wijzigen via admin werkt direct (geen deploy)
- [ ] Pagina's renderen identiek met database content
- [ ] content.ts bestanden zijn verwijderd
- [ ] Sectie aan/uit toggle werkt
- [ ] Sectie volgorde aanpassen werkt
- [ ] NL/EN tab-toggle in content editor
- [ ] Alle bestanden ≤ 500 regels
