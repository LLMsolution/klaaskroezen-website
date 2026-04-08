# Feature: Homepage + Remaining Images via Content Tab

## Context Note

Gebaseerd op:
- /prime output + volledige codebase-analyst onderzoek (2026-04-01)
- Conversatie: gebruiker wil ALLE images per pagina beheren, inclusief homepage en overgebleven edge cases
- Explore agent audit: complete inventaris van 40+ images per pagina
- Bestaand werk: Phase 1-3 van inline-image-management al afgerond (training pages, over-ons, spreker, contact, boek secties)

## Feature Description

Maak de resterende hardcoded images op de homepage, het boek en blog beheerbaar via de Content tab per pagina. Corrigeer alle aspect ratios in imageSpecs zodat de admin preview en ratio badges overeenkomen met hoe de afbeeldingen daadwerkelijk op de site worden getoond.

## User Story

Als admin wil ik alle afbeeldingen op elke pagina (inclusief homepage) kunnen beheren via de Content tab,
zodat ik nooit meer in de code hoef te komen en direct zie welke afbeelding bij welke sectie hoort met de correcte ratio.

## Problem Statement

- **Homepage is volledig hardcoded** — 6 componenten laden images direct via `loadSiteImages` of hardcoded paden
- **Boek hero cover + previews** bypassen `hero-book.image` schema veld
- **Aspect ratios kloppen niet** — Contact hero toont 1:1 maar container is `~5:4`; over-ons hero toont `3:4` maar desktop is full-height
- **Blog list pagina** heeft geen siteContent — geen header/hero beheerbaar
- **Content key → spec mapping** dekt maar 9 van de ~20 inline images

## Solution Statement

1. **Nieuwe schemas** voor homepage secties (slideshow, logo-bar uitbreiding, training-cards, team-photos, about-klaas, book-teaser)
2. **Homepage `loadPageContent` integratie** + seed file (`siteSeedHome.ts`)
3. **6 componenten refactoren** om content als props te accepteren i.p.v. interne `loadSiteImages`
4. **Boek cover + previews** naar siteContent verplaatsen
5. **Aspect ratio correcties** — alle imageSpecs herberekenen op basis van echte container CSS
6. **Content key → spec mapping uitbreiden** — alle content images → juiste spec

## Feature Metadata

**Feature Type:** Refactor (architectural completion)
**Estimated Complexity:** High
**Primary Systems Affected:** Homepage components, siteSchemas, siteSeed, imageSpecs, ContentFieldRenderer
**Dependencies:** Bestaande ImageCropper, siteContent infrastructure, loadPageContent

## Execution Strategy

**Recommended:** `/execute-small` (sequentieel)

**Analysis:**
- Total tasks: 11
- Independent workstreams: gedeeltelijk — schemas blokkeren componenten
- Same-file conflicts: ja — siteSchemas.ts, imageSpecsSeed.ts, page.tsx worden meerdere keren aangeraakt

**Rationale:** Schemas → seed → page integratie → component refactors → cleanup. Moet in volgorde want componenten hebben schemas nodig.

---

## DECISIONS FROM CONVERSATION

### Architecture Choices

**Homepage volledig via siteContent:**
- What: Home krijgt `loadPageContent("home")` + 6 nieuwe schemas
- Why: Gebruiker: "home moet nog als pagina worden toegevoegd om het via daar te beheren"
- Context: Home is enige pagina zonder siteContent integratie

**Boek cover uit siteContent:**
- What: `boek/page.tsx` leest `hero.image` uit siteContent i.p.v. hardcoded bookImages
- Why: Hero-book schema heeft al image veld dat niet wordt gebruikt
- Context: Eerdere fix voegde schema veld toe maar page.tsx gebruikt het nog niet

**Aspect ratios gebaseerd op desktop rendering:**
- What: Specs tonen de desktop ratio (primaire view), mobile is afwijkend
- Why: Admin ziet 1 preview — desktop is representatief voor print/social use
- Context: Contact hero is mobile `4:3` maar desktop `~5:4` — desktop wint

**Blog list heeft geen hero sectie:**
- What: Blog list pagina krijgt geen siteContent — blijft zoals is
- Why: Individuele blog posts worden al via Blog tab beheerd; de list page heeft geen editor-waardige content
- Context: Gebruiker noemde blog/nieuws maar alleen individuele posts hoeven beheerbaar

### Phased Approach

**Phase 1 (NOW):**
- Nieuwe schemas: slideshow, logo-bar (uitbreiden), training-cards, team-photos, about-klaas, book-teaser, book-preview
- siteSeedHome.ts maken
- Home page.tsx siteContent integratie
- 6 homepage componenten refactoren
- Boek page.tsx cover + previews fix
- Spec mapping uitbreiden
- Ratio specs corrigeren

**Phase 2 (LATER — niet in scope):**
- Training platform pages (`/training/[slug]`) — eigen dynamisch systeem
- Blog list page hero/header sectie — nu niet nodig

### Rejected Alternatives

**Blog list page siteContent:** Verworpen — individuele posts zijn al beheerbaar, de list view heeft geen editable content.

**Dedicated contact schema:** Verworpen — contact pagina gebruikt al `hero-about` schema wat voldoende is.

**Auto-ratio detection:** Verworpen — te complex, handmatig specs corrigeren is betrouwbaarder.

### User Preferences & Constraints

**Geen refactor van training platform** — aparte dynamische pagina's, buiten scope.
**Backward compat:** `loadSiteImages` blijft bestaan als fallback.
**Geen data loss:** Bestaande siteImages en siteContent blijven werken.

### Edge Cases

- **Homepage slideshow** — complex array met image + quote + author per slide → `slideshow` schema met items[]
- **Logo-bar** — gedeeld tussen home/training/spreker → één schema, content kan gedeeld worden of per pagina
- **Team photos** — mixed grid (1 groot + 2 klein) → items[] met optional `featured: boolean`
- **Review grid** — homepage heeft hardcoded reviews, training pages gebruiken `reviews` schema → home gebruikt ook `reviews` schema
- **Book previews** — 17 pagina's als items[] array in `book-preview` schema
- **Contact hero container** — `aspect-[4/3] lg:aspect-auto lg:min-h-[480px]` in 50vw col → desktop ratio is `~1.23:1` (590/480)

---

## CONTEXT REFERENCES

### Relevant Codebase Files

LEES VOOR IMPLEMENTATIE:

- `src/app/page.tsx` — homepage entry, heeft geen `loadPageContent`
- `src/components/sections/HeroSlideshow.tsx` — hardcoded SLIDE_KEYS + slideData
- `src/components/sections/LogoBar.tsx` — hardcoded LOGO_KEYS + logoData
- `src/components/sections/training/TrainingInfoBar.tsx` — dupliceert LOGO_KEYS
- `src/components/sections/TrainingCards.tsx` — loadSiteImages intern
- `src/components/sections/TeamPhotos.tsx` — hardcoded PHOTO_KEYS
- `src/components/sections/ReviewGrid.tsx` — hardcoded reviewData + AVATAR_KEYS
- `src/components/sections/AboutKlaas.tsx` — loadSiteImages intern
- `src/components/sections/BookTeaser.tsx` — loadSiteImages intern
- `src/app/boek/page.tsx` — hardcoded bookImages voor cover + previews
- `src/components/sections/BookPreview.tsx` — client component voor preview pagina's
- `convex/siteSchemas.ts` — sectie schemas (uitbreiden)
- `convex/siteSeed.ts` — `getAllSeeds()` functie
- `convex/siteSeedOverOns.ts` — patroon voor seed file structuur
- `convex/imageSpecsSeed.ts` — specs met (onjuiste) ratios
- `convex/imageSpecs.ts` — `CONTENT_KEY_TO_SPEC` mapping
- `src/lib/site-content-loader.ts` — `loadPageContent` + `sectionOr` helpers
- `src/lib/site-images.ts` — `loadSiteImages` helper (blijft bestaan)

### New Files to Create

- `convex/siteSeedHome.ts` — homepage siteContent seed
- Possibly `convex/siteSeedBlogList.ts` — alleen als we blog list beheerbaar maken (uitgesteld)

### Patterns to Follow

**Pattern: Server Component met siteContent fallback**
From: `src/app/over-ons/page.tsx`
```ts
const db = await loadPageContent("over-ons", lang);
const img = await loadSiteImages([...]);
const fallback = getOverOnsContent(lang, imageUrls);
const hero = sectionOr(db, "hero", fallback.hero);
// Use hero.image || imgUrl(img, "fallback-key")
```

**Pattern: Dumb component accepting data as props**
From: `src/components/sections/training/TrainingHero.tsx`
- Accepts `image`, `title`, etc. as props
- No internal data loading
- Reusable across pages

**Pattern: Seed file structure**
From: `convex/siteSeedOverOns.ts` — `makeContent(SLUG, sectionId, type, lang, data)`

### Key Findings from Agent Research

**From Explore audit:** Homepage heeft 6 componenten die images laden, allemaal met verschillende patronen. Duidelijk: refactor ze allemaal naar prop-based data flow.

**From Explore audit:** Contact hero container is `aspect-[4/3] lg:aspect-auto lg:min-h-[480px]` — op desktop effectief ~1.23:1, niet 4:3 of 1:1.

**From Explore audit:** Book previews gebruiken aspect `8.5:11` (boek pagina standaard), 17 items.

**From conversation:** Gebruiker frustreert op ratio mismatches. Correctie moet systematisch zijn per image, niet globaal.

---

## IMPLEMENTATION PLAN

### Phase 1: New Schemas (Foundation)

Nieuwe sectie schemas voor homepage content. Logo-bar uitbreiden met items array.

**Tasks:** Task 1 (alle nieuwe schemas in één edit)

### Phase 2: Homepage Seed + Page Integration

Seed file met default homepage content + page.tsx siteContent integratie.

**Tasks:** Task 2-3 (seed file, page.tsx update)

### Phase 3: Homepage Component Refactors

6 componenten refactoren naar prop-based data flow.

**Tasks:** Tasks 4-9 (HeroSlideshow, LogoBar, TrainingCards, TeamPhotos, ReviewGrid, AboutKlaas, BookTeaser)

### Phase 4: Boek Cover + Previews

Boek page.tsx cover en previews via siteContent laden.

**Tasks:** Task 10 (boek page + book-preview schema)

### Phase 5: Specs + Mapping Correcties

Aspect ratios fixen, spec mapping uitbreiden.

**Tasks:** Task 11 (imageSpecsSeed + CONTENT_KEY_TO_SPEC)

---

## STEP-BY-STEP TASKS

### Task 1: UPDATE `convex/siteSchemas.ts` — nieuwe sectie schemas

- **IMPLEMENT:** Voeg toe aan `SECTION_SCHEMAS`:
  - `slideshow`: `items[]` met `{ image, quote, author, role }`
  - `logo-bar` uitbreiden: `items[]` met `{ image, alt, width, height }`
  - `training-cards`: `items[]` met `{ image, title, description, href }`
  - `team-photos`: `items[]` met `{ image, caption, featured }`
  - `about-klaas`: `{ image, name, subtitle, bio1, bio1Bold, bio1End, bio2, stats[] }`
  - `book-teaser`: `{ image, badge1, badge2, badge3, title, description, cta }`
  - `book-preview`: `items[]` met `{ image, pageNumber }`
- **PATTERN:** Bestaande `team` sectie met `members[]` array
- **VALIDATE:** `npx convex dev --once`

### Task 2: CREATE `convex/siteSeedHome.ts` — homepage seed

- **IMPLEMENT:** Seed functie met alle 6 secties (slideshow, logo-bar, training-cards, team-photos, about-klaas, book-teaser) voor NL + EN
- **PATTERN:** `convex/siteSeedOverOns.ts` volledig volgen
- **IMPORT:** In `siteSeed.ts` → `getAllSeeds()` toevoegen
- **VALIDATE:** `npx convex dev --once`

### Task 3: UPDATE `src/app/page.tsx` — siteContent integratie

- **IMPLEMENT:**
  - Importeer `loadPageContent`, `sectionOr`
  - `const db = await loadPageContent("home", lang)`
  - `const slideshow = sectionOr(db, "slideshow", defaultSlides)`
  - `const logoBar = sectionOr(db, "logo-bar", defaultLogos)`
  - Etc. voor alle 6 secties
  - Pass section data naar componenten als props
- **PATTERN:** `src/app/over-ons/page.tsx`
- **VALIDATE:** `npm run build`

### Task 4: REFACTOR `src/components/sections/HeroSlideshow.tsx`

- **IMPLEMENT:**
  - Accepteer `slides: Array<{ image, quote, author, role }>` als prop
  - Verwijder hardcoded `SLIDE_KEYS` en `slideData`
  - Verwijder interne loadSiteImages
- **VALIDATE:** `npm run build` + visuele check

### Task 5: REFACTOR `src/components/sections/LogoBar.tsx` + `TrainingInfoBar.tsx`

- **IMPLEMENT:**
  - Accepteer `logos: Array<{ src, alt, width, height }>` als prop
  - Verwijder LOGO_KEYS en logoData
  - `TrainingInfoBar.tsx` idem (gedeelde logos)
- **VALIDATE:** `npm run build`

### Task 6: REFACTOR `src/components/sections/TrainingCards.tsx`

- **IMPLEMENT:** Accepteer `cards: Array<{ image, title, description, href }>` als prop, verwijder interne image loading
- **VALIDATE:** `npm run build`

### Task 7: REFACTOR `src/components/sections/TeamPhotos.tsx`

- **IMPLEMENT:** Accepteer `photos: Array<{ image, caption, featured }>` als prop
- **VALIDATE:** `npm run build`

### Task 8: REFACTOR `src/components/sections/ReviewGrid.tsx`

- **IMPLEMENT:** Accepteer `reviews: Array<{ text, name, role, avatar }>` als prop (hergebruikt bestaande `reviews` schema)
- **VALIDATE:** `npm run build`

### Task 9: REFACTOR `src/components/sections/AboutKlaas.tsx` + `BookTeaser.tsx`

- **IMPLEMENT:**
  - `AboutKlaas`: accepteer `image`, `name`, `bio*`, `stats` als props
  - `BookTeaser`: accepteer `image`, `badges`, `title`, `description`, `cta` als props
- **VALIDATE:** `npm run build`

### Task 10: UPDATE `src/app/boek/page.tsx` — cover + previews via siteContent

- **IMPLEMENT:**
  - Lees book cover uit `hero.image` (hero-book schema)
  - Lees preview pagina's uit nieuwe `book-preview` sectie `items[]`
  - Verwijder hardcoded `bookImages` voor cover en previews
  - Update `convex/siteSeedBoek.ts` om `book-preview` sectie te seeden met 17 items
- **VALIDATE:** `npm run build` + visuele check boek pagina

### Task 11: UPDATE `convex/imageSpecsSeed.ts` + `convex/imageSpecs.ts` — ratios fixen

- **IMPLEMENT:**
  - `imageSpecsSeed.ts`: Herbereken ALLE specs op basis van desktop container CSS:
    - Contact hero: `~5:4` (590x480)
    - Over-ons hero: `~2:3` (590x900)
    - Over-ons mission: `~1:1` (590x560)
    - Spreker content-block: `~5:4` (590x480)
    - Home about-klaas: `~16:9` (590x340)
    - Home book-teaser: `2:3` (180x270 compact)
    - Home training-cards: `16:9` (590x332)
    - Home team-photos large: `2:1` (500x250)
    - Home team-photos small: `~1.12:1` (249x222)
    - Home slideshow: `16:10` desktop
    - Logo-bar: `auto × 52px` (26px × 2 retina)
  - `imageSpecs.ts` `CONTENT_KEY_TO_SPEC`: voeg alle content-based keys toe voor homepage secties
- **VALIDATE:** `npx convex dev --once` + admin visuele check

---

## TESTING STRATEGY

### Handmatige Tests (Primair)

1. **Home Content tab:** Na seed — alle 6 secties zichtbaar met image velden
2. **Home frontend:** Upload afbeelding → zichtbaar op homepage na refresh
3. **Boek cover:** Vervang via Content tab → werkt op /boek
4. **Boek previews:** 17 pagina's beheerbaar als items array
5. **Ratio badges:** Elke image in Content tab toont correcte ratio badge (geen 1:1 voor contact)
6. **Preview modal:** Opent met correcte aspect ratio per image
7. **Contact hero:** Preview modal toont ~5:4 ratio, niet 4:3

### Edge Cases

- Homepage slideshow met 5 slides werkt correct
- Logo-bar met 10 logos blijft strakke rij
- Team photos grid heeft correcte layout (1 groot + rest klein)
- Book previews 17 pagina's laden lazy
- Content key zonder spec mapping → fallback naar width/height match

---

## VALIDATION COMMANDS

### Level 1: Build Check

```bash
npx tsc --noEmit
npx convex dev --once
npm run build
npm run lint
```

**Expected:** Exit code 0 voor alle

### Level 2: Runtime Check

```bash
npm run dev
# Admin → Content → Home → check alle secties
# Frontend → / → visual regression
# Frontend → /boek → cover + previews tonen
```

### Level 3: Productie Deploy

```bash
npx convex deploy --yes
npx convex run --prod siteSeed:syncNewContent
```

---

## ACCEPTANCE CRITERIA

- [ ] Homepage heeft `loadPageContent("home")` en alle 6 secties in Content tab
- [ ] Alle 6 homepage componenten accepteren data als props (geen interne loadSiteImages)
- [ ] Boek cover via `hero.image` (schema veld)
- [ ] Boek previews via `book-preview` sectie items array
- [ ] Alle imageSpecs hebben ratios die overeenkomen met desktop rendering
- [ ] CONTENT_KEY_TO_SPEC mapping dekt alle inline images
- [ ] Contact preview modal toont `~5:4`, niet 1:1
- [ ] Over-ons hero preview toont `~2:3`, niet 3:4
- [ ] Alle pagina's tonen juiste afbeeldingen na siteContent update
- [ ] `npm run build` slaagt
- [ ] `npx convex deploy --yes` werkt zonder errors
- [ ] Geen regressies op bestaande pagina's

---

## DEFERRED ITEMS

### Niet in scope
- **Training platform pages** (`/training/[slug]`) — dynamisch systeem, eigen structuur
- **Blog list hero/header** — geen editor-waardige content, individuele posts zijn al beheerbaar
- **Review grid content migratie** — reviews worden nu hardcoded getoond, later via siteContent

### Known Limitations
- Logo-bar content is gedeeld tussen home/training/spreker — wijziging op één plek beïnvloedt alle pagina's
- Homepage seed overschrijft bestaande home content niet (syncNewContent is additief)
- Book preview page numbers blijven hardcoded in seed (niet dynamisch)

---

## NOTES & CONTEXT

### Conversation Summary

- Gebruiker wil ALLES beheerbaar per pagina via Content tab
- Homepage is grootste gat — 6 componenten moeten gerefactoreerd
- Ratios moeten correct zijn in admin preview
- Blog individuele posts worden al via Blog tab beheerd (ok)
- Book previews moeten onder boek pagina staan

### Design Rationale

- **Prop-based componenten:** Decoupling van data loading en rendering maakt testbaarheid en hergebruik mogelijk
- **Ratios op desktop:** Admin preview toont één state, desktop is primaire view
- **Logo-bar shared content:** Voorkomt duplicatie maar beperkt flexibiliteit — acceptabele trade-off
- **Seed is additief:** Geen risico op data loss, `force` parameter alleen bij explicit update

### Assumptions Made

- `imageSpecs` tabel is al op productie met bestaande entries
- `loadSiteImages` fallback blijft werken voor legacy keys
- Vercel auto-deploys na push naar main
- Convex productie schema push vereist handmatige `convex deploy --yes`

### Questions Answered

- Q: Homepage ook refactoren? → A: Ja, volledig
- Q: Blog list ook? → A: Nee, individuele posts zijn al beheerbaar
- Q: Book previews waar? → A: Onder boek pagina als items array
- Q: Training platform pages? → A: Buiten scope (dynamisch systeem)

### For Future Reference

Dit is de afronding van de inline image management migratie. Na deze feature heeft de site één uniform systeem waar alle beheerbare images via Content tab gaan. De `siteImages` tabel blijft als backend voor de daadwerkelijke storage en wordt gebruikt door `loadSiteImages` voor legacy componenten die niet gemigreerd zijn.

De grootste risico's zitten in:
1. Homepage refactor (6 componenten) — veel bestanden, veel props
2. Ratio correcties — handmatig werk, makkelijk om fouten te maken

Aanbeveling voor executie: één component tegelijk refactoreren, lokaal testen voor commit, systematisch door de lijst.
