# CLAUDE.md — Klaas Kroezen Website

## Tech stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS 4
- **Backend:** Convex (mutations, queries, actions, scheduled jobs)
- **Language:** TypeScript (strict)
- **Deployment:** Vercel
- **Payments:** Mollie (planned) + Plug&Pay (legacy)
- **Email:** Resend

## Git — NOOIT pushen of committen

- **Maak NOOIT een commit** tenzij de gebruiker er expliciet om vraagt ("commit dit", "maak een commit")
- **Push NOOIT naar remote** tenzij de gebruiker er expliciet om vraagt
- Geen `--force`, `--no-verify`, of `--amend` zonder expliciete instructie
- Bij twijfel: vraag eerst

## Bestandsgrootte — max 500 regels

- Geen enkel bestand mag langer zijn dan **500 regels**
- Als een bestand groter dreigt te worden: splits op in logische sub-modules
- Bestaande bestanden die de limiet overschrijden moeten bij de eerstvolgende wijziging opgesplitst worden

### Bekende overtreders (tech debt)

- `src/app/admin/AdminClient.tsx` (~1400 regels) → opsplitsen in tab-componenten
- `convex/emails.ts` (~950 regels) → opsplitsen in email-templates, email-tracking, email-sequences
- `convex/admin.ts` (~640 regels) → opsplitsen per domein

## Mappenstructuur

```
src/
  app/                    # Routes (pages, layouts, metadata)
    [locale]/             # NL/EN taalprefix (toekomstig)
  components/
    layout/               # Navbar, Footer, AnnouncementBar
    sections/             # Paginasecties (Hero, TrainingCards, etc.)
      training/           # Training-specifieke secties
    checkout/             # Checkout flow componenten
    ui/                   # Herbruikbare UI primitives
    seo/                  # JsonLd, structured data
    providers/            # Context providers
  lib/                    # Utilities, configs, i18n
convex/                   # Backend (schema, mutations, queries, actions)
public/
  images/                 # Geoptimaliseerde afbeeldingen
```

- Houd componenten gegroepeerd per domein, niet per type
- Maak een nieuwe map als een domein 4+ bestanden heeft
- Gebruik `index.ts` barrel exports alleen als de map 3+ exports heeft

## Design systeem

### Fonts

- **Headings:** Playfair Display (400, 700, 900)
- **Body:** DM Sans (300, 400, 500, 600)

### Kleuren

| Token          | Hex       | Gebruik                    |
| -------------- | --------- | -------------------------- |
| `ink`          | `#0E0C0A` | Tekst, borders             |
| `paper`        | `#F7F4EF` | Achtergrond                |
| `warm`         | `#EDE9E2` | Secundaire achtergrond     |
| `copper`       | `#B5622A` | Accent, CTA's, highlights  |
| `copper-light` | `#D4794A` | Hover state van copper     |

### Stijlregels

- Editorial/magazine-stijl, warm en premium
- Grid separators: 1px `border-rule`
- Border-radius: altijd `rounded-[2px]` (bijna geen afronding)
- Max-width container: `1180px`
- Padding: `56px` desktop, `28px` mobile
- Breakpoint: `1024px` (lg)
- Geen emoji in code of UI tenzij expliciet gevraagd
- Gebruik `text-[size]` voor font-sizes (geen Tailwind defaults)
- Tracking labels: `text-[10px] font-medium tracking-[0.2em] uppercase text-copper`

## Taal / i18n

- De gehele site moet NL + EN ondersteunen
- Standaardtaal: Nederlands
- Vertalingen in `src/lib/i18n.ts` (site-breed) en `src/lib/checkout-i18n.ts` (checkout)
- Alle hardcoded tekst moet via het i18n systeem lopen
- `lang` prop doorgeven van layout → pagina → secties → componenten

## SEO — vindbaarheid is prioriteit

### Elke pagina moet hebben

- `generateMetadata()` met taal-specifieke title + description
- Structured data via `JsonLd` component (schema.org)
- `<link rel="alternate" hreflang="nl">` en `hreflang="en"`
- OpenGraph image (1200x630)

### Centrale config

- `src/lib/site-config.ts` is de single source of truth voor pagina's en producten
- `src/app/sitemap.ts` leest uit site-config — altijd in sync houden
- `src/app/llms.txt/route.ts` leest uit site-config — altijd in sync houden
- `src/app/robots.ts` — nooit checkout of admin pagina's indexeren

### Bij elke nieuwe pagina of route

1. Toevoegen aan `site-config.ts` (PAGES array)
2. `generateMetadata()` implementeren
3. JsonLd structured data toevoegen
4. Controleer of sitemap.xml en llms.txt correct updaten

## Component conventies

- Server Components als default, `"use client"` alleen als echt nodig
- Props voor tekst (nooit hardcoded NL strings in components)
- `next/image` voor alle afbeeldingen (nooit `<img>`)
- `next/link` voor alle interne links (nooit `<a href>`)
- Checkout componenten altijd met `lang: Lang` prop

## Convex conventies

- Public mutations/queries in `convex/*.ts`
- Internal functions met `internalMutation` / `internalQuery`
- API routes die Convex aanroepen: alleen `fetchMutation(api.*)` (nooit `internal.*`)
- Schema validators altijd in `convex/schema.ts`
- Indexes toevoegen voor alle query-patterns

## TypeScript

- Strict mode, geen `any`
- Gebruik `type` boven `interface` tenzij extending nodig is
- Export types apart van implementatie
- Geen `as` type assertions tenzij onvermijdelijk
