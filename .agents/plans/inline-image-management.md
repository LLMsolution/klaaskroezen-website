# Feature: Inline Image Management per Pagina

## Context Note

Gebaseerd op:
- /prime output + codebase-analyst onderzoek van image architectuur
- Conversatie over Images tab problemen (dubbele systemen, verwarring)
- codebase-analyst agent: volledige inventaris van System 1 vs System 2 images

## Feature Description

Verwijder de aparte "Images" tab uit het admin panel en verplaats alle image beheer naar de Content tab, geïntegreerd per pagina sectie. Behoud de bestaande crop tool, dimensie-info en preview modal functionaliteit, maar maak ze beschikbaar direct waar de admin de content bewerkt.

**Nu:** Twee systemen (siteImages tabel via Images tab, siteContent via Content tab) — verwarrend, duplicaten, synchronisatie issues.

**Straks:** Eén systeem — alle afbeeldingen via Content tab, geïntegreerd in de sectie waar ze worden gebruikt, met dezelfde crop/preview/dimensie features.

## User Story

Als admin wil ik alle afbeeldingen per pagina beheren binnen de sectie waar ze gebruikt worden,
zodat ik direct zie welke afbeeldingen bij welke sectie horen en niet hoef te wisselen tussen twee tabs.

## Problem Statement

- **Twee gescheiden systemen** veroorzaken synchronisatie problemen
- Images tab toont images die niet altijd matchen met wat op pagina's wordt gebruikt
- Content tab image-path velden missen crop tool en dimensie info
- Hardwired JSX bypasses in `over-ons/page.tsx` en `spreker/page.tsx` omzeilen siteContent
- Homepage heeft geen siteContent integratie — volledig hardcoded
- 5 sectie schemas missen `image-path` velden voor images die wel worden gebruikt

## Solution Statement

1. **Schema's uitbreiden:** Voeg `image-path` velden toe aan secties die ze missen
2. **Hardwired bypasses elimineren:** Page JSX leest image uit siteContent, niet uit `loadSiteImages`
3. **Homepage siteContent integreren:** Nieuwe schemas voor slideshow, logo-bar, team-photos, review-grid, about-klaas, book-teaser
4. **ContentFieldRenderer upgraden:** Image-path velden krijgen crop tool, dimensie badges, preview modal
5. **Images tab verwijderen** uit admin navigatie (siteImages tabel blijft als backend voor loadSiteImages backward compat)

## Feature Metadata

**Feature Type:** Refactor (architectural simplification)
**Estimated Complexity:** High (~15 files, schema migratie, content migratie)
**Primary Systems Affected:** siteSchemas, ContentFieldRenderer, all page components, admin navigation
**Dependencies:** Bestaande ImageCropper + react-image-crop (al geïnstalleerd)

## Execution Strategy

**Recommended:** `/execute-small` (sequentieel)

**Analysis:**
- Total tasks: 12
- Independent workstreams: nee — schema changes blokkeren page refactors
- Same-file conflicts: ja — meerdere tasks raken siteSchemas.ts, ContentFieldRenderer

**Rationale:** Schema moet eerst, dan page components in volgorde van afhankelijkheid, dan UI integratie. Sequentieel voorkomt conflicten.

---

## DECISIONS FROM CONVERSATION

### Architecture Choices

**Eén systeem via siteContent:**
- What: Alle images via sectie JSON met `convex:<storageId>` refs
- Why: "ik wil gewoon per pagina zien welke afbeeldingen ik kan aanpassen"
- Context: Huidige dualiteit veroorzaakt sync problemen en verwarring

**ContentFieldRenderer als single source:**
- What: Image-path velden krijgen volledige image manager (upload, crop, preview, dimensies)
- Why: Admin werkt al in Content tab per pagina — images horen daar bij
- Context: Alle bestaande crop/preview logica wordt hergebruikt

**Images tab verwijderen (niet de tabel):**
- What: Admin tab weg, `siteImages` tabel + `loadSiteImages` blijven voor backward compat
- Why: Sommige images worden nog via `loadSiteImages` geladen (logos, book previews)
- Context: Geen database wipe, alleen UI simplificatie

**Book previews blijven in Content tab:**
- What: Nieuwe `book-preview` sectie schema met items array
- Why: Gebruiker wil preview pagina's onder boek pagina kunnen beheren
- Context: 17 preview pagina's moeten één geheel blijven

### Phased Approach

**Phase 1 (NOW):**
- Schema `image-path` velden toevoegen aan bestaande secties
- Hardwired bypasses in over-ons/spreker fixen
- ContentFieldRenderer upgraden met crop/preview/dimensie features
- Homepage siteContent integratie (nieuwe schemas)
- Images tab verwijderen uit admin navigatie
- Migratie script: siteImages data → siteContent JSON

**Phase 2 (LATER):**
- Book preview bulk upload flow (17 pagina's tegelijk)
- Layout editor hook voor automatische spec updates
- Image library view als secundaire referentie (optioneel)

### Rejected Alternatives

**Images tab behouden als bibliotheek:** Verworpen — gebruiker wil "afbeeldingen er helemaal uit", niet als dubbele plek.

**Alleen Groep A (partial fix):** Verworpen — homepage zou dan nog steeds buiten het systeem vallen, probleem niet opgelost.

**Volledig nieuw image model:** Verworpen — te veel risico. Hergebruik bestaande `convex:` ref patroon uit Content tab.

### Edge Cases & Error Scenarios

- **Homepage slideshow:** Complex array structure — aparte `slideshow` schema met items[] voor image + quote + author
- **Logos (21 stuks):** LogoBar en TrainingInfoBar delen dezelfde logos — één schema, gedeeld via content
- **Gedeelde images:** `about/klaas-kroezen-portrait-2.jpeg` op over-ons én contact — contact page krijgt eigen sectie met eigen image veld
- **Book preview pagina's:** 17 hardcoded images — nieuwe `book-preview` sectie met items array
- **Backward compat:** `loadSiteImages` blijft werken voor componenten die nog niet gemigreerd zijn
- **Migratie dataloss:** Bestaande siteImages → siteContent migratie moet idempotent zijn

---

## CONTEXT REFERENCES

### Relevant Codebase Files

LEES VOOR IMPLEMENTATIE:

- `convex/siteSchemas.ts` — SECTION_SCHEMAS definities (hero-about, mission, office, content-block, hero-book missen image velden)
- `convex/siteSeed.ts` — hoe secties worden geseed per pagina
- `convex/siteSeedOverOns.ts` — bestaande seed patroon met team members
- `src/app/admin/components/ContentFieldRenderer.tsx` — image-path rendering, ContentImageField
- `src/app/admin/components/ImagesTab.tsx` — bestaande crop/preview/dimensie logica (hergebruiken in ContentFieldRenderer)
- `src/components/ui/ImageCropper.tsx` — crop modal (hergebruiken)
- `src/app/over-ons/page.tsx` (regel 53, 164, 218) — 3 hardwired imgUrl() bypasses
- `src/app/spreker/page.tsx` (regel 75) — 1 hardwired imgUrl() bypass
- `src/app/boek/page.tsx` — book cover + preview pagina's laden
- `src/app/page.tsx` — homepage (heeft geen loadPageContent)
- `src/components/sections/HeroSlideshow.tsx` — hardcoded SLIDE_KEYS array
- `src/components/sections/LogoBar.tsx` — hardcoded LOGO_KEYS
- `src/components/sections/TeamPhotos.tsx` — hardcoded PHOTO_KEYS
- `src/components/sections/AboutKlaas.tsx` — loadSiteImages intern
- `src/components/sections/BookTeaser.tsx` — loadSiteImages intern
- `src/app/admin/components/AdminSidebar.tsx` — tab navigatie (Images tab verwijderen)

### New Files to Create

- `convex/contentImageMigration.ts` — migreert siteImages records naar siteContent JSON refs
- `src/components/ui/InlineImageManager.tsx` — ingebouwd in ContentFieldRenderer (crop + preview + dimensies)

### Patterns to Follow

**Pattern: Image-path field in schema**
From: `convex/siteSchemas.ts` (hero sectie)
```ts
{ key: "image", type: "image-path", label: "Afbeelding" }
```

**Pattern: Convex ref in content JSON**
From: siteContent entries
```
"image": "convex:kg2abc123..."
```

**Pattern: Resolved URL in admin preview**
From: `ContentFieldRenderer.tsx` ContentImageField — gebruikt `displayData` parameter voor pre-resolved URLs

**Pattern: Image crop flow**
From: `ImagesTab.tsx` directUpload + handleReplace — hergebruiken in InlineImageManager

### Key Findings from Agent Research

**From codebase-analyst:** Homepage heeft NUL siteContent integratie — volledig hardcoded in 6 componenten (HeroSlideshow, LogoBar, TeamPhotos, ReviewGrid, AboutKlaas, BookTeaser). Grootste refactor zit hier.

**From codebase-analyst:** Training pages (sales/customer success) zijn al gemigreerd — `loadSiteImages` is alleen fallback, siteContent wint via `sectionOr`. Geen wijzigingen nodig behalve schema fixes.

**From codebase-analyst:** 3 hardwired JSX bypasses in over-ons (hero, mission, office) en 1 in spreker (content-block) gebruiken `imgUrl()` direct in JSX — negeren siteContent zelfs als data aanwezig is. Simpele fix: vervangen door siteContent waarde lezen.

**From codebase-analyst:** `hero-about`, `mission`, `office`, `content-block`, `hero-book` schemas missen `image-path` velden. 5 snelle schema wins.

---

## IMPLEMENTATION PLAN

### Phase 1: Schema Foundation (Quick Wins)

Voeg `image-path` velden toe aan bestaande schemas die ze missen. Geen breaking changes — bestaande content werkt door.

**Tasks:** Task 1 (schema updates)

### Phase 2: Hardwired Bypasses Fixen

Vervang 4 hardwired `imgUrl()` calls in page JSX door siteContent waarden. Pagina's lezen nu consequent uit siteContent.

**Tasks:** Tasks 2-3 (over-ons + spreker fixes)

### Phase 3: ContentFieldRenderer Upgrade

ContentImageField krijgt crop tool, dimensie badges, en preview modal — alle features die nu in Images tab zitten.

**Tasks:** Task 4 (InlineImageManager component)

### Phase 4: Homepage siteContent Integratie

Grootste refactor — nieuwe schemas voor homepage secties, content loading, component refactors.

**Tasks:** Tasks 5-9 (schemas, seed, page, component refactors)

### Phase 5: Images Tab Verwijderen + Migratie

Migreer bestaande siteImages data naar siteContent refs, verwijder admin tab.

**Tasks:** Tasks 10-12 (migratie, admin nav, cleanup)

---

## STEP-BY-STEP TASKS

### Task 1: UPDATE `convex/siteSchemas.ts` — image-path velden

- **IMPLEMENT:**
  - `hero-about` sectie: voeg `{ key: "image", type: "image-path", label: "Afbeelding" }` toe
  - `mission` sectie: idem
  - `office` sectie: idem
  - `content-block` sectie: idem
  - `hero-book` sectie: `{ key: "image", type: "image-path", label: "Boek cover" }`
- **PATTERN:** Bestaande `hero` sectie schema
- **WHY:** 5 secties missen image velden terwijl ze wel images gebruiken via hardwired JSX
- **VALIDATE:** `npx convex dev --once`

### Task 2: UPDATE `src/app/over-ons/page.tsx` — fix 3 hardwired bypasses

- **IMPLEMENT:**
  - Regel 53: `src={imgUrl(img, "about/klaas-over-mij.jpeg")}` → `src={hero.image || fallback}`
  - Regel 164: `src={imgUrl(img, "about/klaas-kroezen-portrait-2.jpeg")}` → `src={mission.image || fallback}`
  - Regel 218: `src={imgUrl(img, "about/kantoor-administratie.jpg")}` → `src={office.image || fallback}`
- **PATTERN:** Bestaande siteContent fallback patroon in training pages
- **WHY:** Pagina's lezen nu uit siteContent — admin wijzigingen werken door
- **VALIDATE:** `npm run build`

### Task 3: UPDATE `src/app/spreker/page.tsx` — fix content-block bypass

- **IMPLEMENT:** Regel 75: `image={imgUrl(img, "spreker/klaas-flipchart.jpeg")}` → `image={contentBlock.image || fallback}`
- **PATTERN:** Zelfde als over-ons
- **VALIDATE:** `npm run build`

### Task 4: UPDATE `src/app/admin/components/ContentFieldRenderer.tsx` — inline image manager

- **IMPLEMENT:**
  - Importeer `ImageCropper` en `imageSpecs` query
  - `ContentImageField` uitbreiden met:
    - Dimensie badge (uit imageSpecs lookup via contextual key `pageSlug/sectionId/fieldKey`)
    - Crop tool bij upload (locked aspect ratio als spec beschikbaar)
    - Preview modal bij klik op afbeelding (toont in juiste aspect ratio)
    - Warning indien afbeelding te klein
  - `ContentFieldRenderer` props al uitgebreid met `pageSlug` en `sectionId` (bestaand)
- **PATTERN:** Hergebruik logica uit `ImagesTab.tsx` (ImageCard, ImagePreviewModal, crop flow)
- **WHY:** Alle image features direct in Content tab beschikbaar
- **VALIDATE:** Handmatig testen — upload image via Content tab

### Task 5: UPDATE `convex/siteSchemas.ts` — homepage schemas

- **IMPLEMENT:** Nieuwe schemas toevoegen:
  - `slideshow`: items[] met { image, quote, author, role }
  - `logo-bar` uitbreiden: items[] met { image, alt, width, height }
  - `team-photos`: items[] met { image, company, caption }
  - `about-klaas-section`: { image, name, subtitle, bio1, bio2, stats[] }
  - `book-teaser`: { image, badges[], title, description }
  - `book-preview` (voor boek pagina): items[] met { image, pageNumber }
- **PATTERN:** Bestaande `team` sectie met members[] array
- **VALIDATE:** `npx convex dev --once`

### Task 6: CREATE `convex/siteSeedHome.ts` — homepage seed data

- **IMPLEMENT:** Seed functie die homepage secties met default content + image refs maakt
- **PATTERN:** Volg `convex/siteSeedOverOns.ts` structuur
- **WHY:** Homepage heeft nu geen siteContent — moet gepopuleerd worden voor admin beheer
- **VALIDATE:** Run via `npx convex dev --once`

### Task 7: UPDATE `src/app/page.tsx` — siteContent integratie

- **IMPLEMENT:**
  - Voeg `loadPageContent("home", lang)` toe
  - `sectionOr(db, "slideshow", fallback)` voor Hero
  - Pass resolved section data naar Hero, LogoBar, TeamPhotos, AboutKlaas, BookTeaser componenten
- **PATTERN:** Bestaande `over-ons/page.tsx` structuur
- **VALIDATE:** `npm run build` + visuele check

### Task 8: REFACTOR homepage section components

- **IMPLEMENT:**
  - `HeroSlideshow.tsx`: accepteer slides als props, verwijder hardcoded SLIDE_KEYS
  - `LogoBar.tsx`: accepteer logos als props, verwijder interne `loadSiteImages`
  - `TrainingInfoBar.tsx`: zelfde als LogoBar (gedeelde logos)
  - `TeamPhotos.tsx`: accepteer photos als props
  - `AboutKlaas.tsx`: accepteer image + content als props
  - `BookTeaser.tsx`: accepteer image + content als props
  - `ReviewGrid.tsx`: accepteer reviews als props (verwijder hardcoded reviewData)
- **PATTERN:** Dumb components — alleen rendering, geen data loading
- **WHY:** Data loading centraal in page.tsx, secties herbruikbaar en testbaar
- **VALIDATE:** `npm run build`

### Task 9: UPDATE `src/app/boek/page.tsx` — book cover + previews via siteContent

- **IMPLEMENT:**
  - Book cover via `hero.image` (nieuw schema veld uit Task 1)
  - Preview pagina's via nieuwe `book-preview` sectie (items array)
  - Verwijder `loadSiteImages` voor book-specifieke keys
- **PATTERN:** Sectie iteratie zoals team members in over-ons
- **VALIDATE:** `npm run build` + visuele check boek pagina

### Task 10: CREATE `convex/contentImageMigration.ts` — migratie script

- **IMPLEMENT:** InternalMutation die:
  - Leest alle bestaande `siteImages` records
  - Bouwt lookup: key → storageId
  - Leest alle `siteContent` entries
  - Voor elke sectie: als image-path veld aanwezig en nog statisch pad, vervang door `convex:<storageId>`
  - Idempotent (checkt of al `convex:` ref)
- **PATTERN:** Bestaande `siteImagesMigrateContent.ts` `migrateContentImages` mutation
- **WHY:** Bestaande content moet naar nieuwe model zonder handmatig werk
- **VALIDATE:** Dry-run optie eerst, dan uitvoeren

### Task 11: UPDATE `src/app/admin/AdminClient.tsx` — verwijder Images tab

- **IMPLEMENT:**
  - Verwijder "Images" tab uit navigatie
  - Verwijder `ImagesTab` import
  - Verwijder route/state voor images tab
- **PATTERN:** Bestaande tab structuur
- **WHY:** Gebruiker wil niet meer dubbele plek voor image beheer
- **VALIDATE:** `npm run build` + visuele check admin

### Task 12: DELETE `src/app/admin/components/ImagesTab.tsx`

- **IMPLEMENT:** Bestand verwijderen (siteImages tabel blijft bestaan voor loadSiteImages fallback)
- **WHY:** Dead code na verwijdering van tab
- **VALIDATE:** `npm run build` — geen imports meer

---

## TESTING STRATEGY

### Handmatige Tests (Primair)

1. **Schema velden:** Open Content tab → over-ons → hero sectie → check of image veld zichtbaar is
2. **Hardwired fix:** Vervang image via Content tab → check of frontend update
3. **Inline crop:** Upload image via Content tab → crop modal verschijnt → juiste ratio locked
4. **Preview modal:** Klik op image in Content tab → modal toont in correcte aspect ratio
5. **Dimensie badge:** Badge toont aanbevolen dimensies uit imageSpecs
6. **Homepage:** Wijzig slideshow via Content tab → homepage toont nieuwe slide
7. **Migratie:** Draai migratie → check of alle bestaande images nog werken
8. **Images tab weg:** Admin nav toont geen Images tab meer

### Edge Cases

- Image te klein voor aanbevolen dimensies → warning zichtbaar
- Geen imageSpec voor een veld → vrije crop, geen badge
- Bestaande `convex:` ref in content → niet dubbel migreren
- Missing image bij upload → fallback naar statisch pad via `loadSiteImages`
- Contact pagina gebruikt over-ons image → werkt via gedeelde storageId

---

## VALIDATION COMMANDS

### Level 1: Build Check

```bash
npx tsc --noEmit
npx convex dev --once
npm run build
npm run lint
```

**Expected:** Exit code 0

### Level 2: Runtime Check

```bash
npm run dev
# Open /admin → Content tab → test per pagina
# Open / → check homepage rendering
```

### Level 3: Migratie Check

```bash
# Dashboard → Functions → contentImageMigration:migrate → dryRun: true
# Review output, dan dryRun: false
```

---

## ACCEPTANCE CRITERIA

- [ ] Alle 5 sectie schemas (`hero-about`, `mission`, `office`, `content-block`, `hero-book`) hebben image-path velden
- [ ] Over-ons hero, mission, office afbeeldingen komen uit siteContent (niet hardwired)
- [ ] Spreker content-block afbeelding komt uit siteContent
- [ ] ContentFieldRenderer image-path velden tonen crop tool, dimensie badge, preview modal
- [ ] Homepage heeft siteContent integratie (loadPageContent aanwezig)
- [ ] Alle homepage componenten accepteren data als props (geen interne `loadSiteImages`)
- [ ] Book cover en preview pagina's beheerbaar via Content tab
- [ ] Migratie script draait idempotent op bestaande content
- [ ] Images tab verwijderd uit admin navigatie
- [ ] `ImagesTab.tsx` bestand verwijderd
- [ ] `npm run build` slaagt zonder errors
- [ ] Alle bestaande afbeeldingen blijven werken op frontend
- [ ] Admin kan alle afbeeldingen per pagina beheren in één tab

---

## DEFERRED ITEMS

### Phase 2 Features
- **Book preview bulk upload:** 17 pagina's tegelijk uploaden met ZIP — later, nu handmatig per stuk
- **Layout editor spec sync:** Bestaande imageSpecUpdates callback blijft werken
- **Image library view:** Optionele secundaire tab als bibliotheek — gebruiker wil dit niet nu

### Known Limitations
- `siteImages` tabel blijft bestaan (backward compat voor `loadSiteImages`)
- Logos staan dan in 1 home sectie maar worden op 4 pagina's getoond — gedeelde content via shared section
- Migratie moet handmatig gedraaid worden na deploy (niet automatisch)

---

## NOTES & CONTEXT

### Conversation Summary

- Gebruiker wil "afbeeldingen er helemaal uit" de admin navigatie
- Functionaliteit (crop, preview, dimensies) moet behouden blijven maar per pagina
- Blog/nieuws blijft buiten dit systeem (eigen Blog tab)
- Book previews moeten onder boek pagina blijven
- Home en contact moeten ook beheerbaar worden

### Design Rationale

- **Waarom ContentFieldRenderer uitbreiden vs nieuwe component:** Bestaande infrastructure benutten, minder duplicatie
- **Waarom siteImages tabel behouden:** `loadSiteImages` fallback blijft werken voor legacy code tijdens migratie
- **Waarom homepage schemas groot:** Homepage is de enige pagina zonder siteContent — complete integratie nodig
- **Waarom Phase-aanpak:** Schema → fixes → UI → homepage → cleanup minimaliseert risico en laat gradueel testen toe

### Assumptions Made

- `ImageCropper` component werkt zoals nu (geen refactor nodig)
- `imageSpecs` tabel blijft bestaan voor dimensie info
- Content tab workflow blijft hetzelfde — alleen image velden upgraden
- Vercel auto-deploys Convex schema changes bij push

### Questions Answered

- Q: Home page als filter toevoegen? → A: Nee, via Content tab per pagina beheren
- Q: Book previews onder boek pagina? → A: Ja, nieuwe book-preview schema met items array
- Q: Nieuws in Images tab? → A: Nee, al via Blog tab beheerd
- Q: Contact pagina images? → A: Via nieuwe contact sectie schema

### For Future Reference

Dit is een architecturele simplificatie: van twee systemen (siteImages + siteContent) naar één hoofdsysteem (siteContent). De `siteImages` tabel en `loadSiteImages` functie blijven technisch bestaan maar worden alleen nog gebruikt als fallback/legacy pad. De admin heeft geen directe toegang meer — alle beheer via Content tab per pagina.

De grootste complexiteit zit in de homepage refactor (~6 componenten) omdat die nooit siteContent integratie heeft gehad. Training pages zijn al grotendeels gemigreerd en hebben alleen schema velden + hardwired bypass fixes nodig.
