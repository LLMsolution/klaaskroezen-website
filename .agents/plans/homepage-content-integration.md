# Feature: Homepage Content via Admin Content tab

## Context Note

Plan gebaseerd op:
- /prime output + volledige inventaris van homepage componenten
- Conversatie over inline image management en vertalingen
- Bestaande patronen uit over-ons, spreker, boek, training pages die al via Content tab werken

## Feature Description

De homepage is de laatste pagina die nog niet via de Content tab beheerd kan worden. Alle content (slideshow, logos, team photos, about section, book teaser) zit hardcoded in 9 componenten die hun eigen data laden via `loadSiteImages` of statische arrays. Deze feature maakt alle homepage content beheerbaar via admin met ondersteuning voor NL/EN/DE.

## User Story

Als admin wil ik de homepage content per sectie kunnen beheren via de Content tab,
zodat ik teksten, afbeeldingen, slides en reviews kan wijzigen zonder code aan te passen,
en dat in alle drie de talen (NL/EN/DE).

## Problem Statement

- Homepage heeft geen `loadPageContent()` call — draait volledig op hardcoded data in componenten
- 9 componenten bevatten hardcoded NL strings zonder i18n of props voor content
- Homepage is de enige pagina die volledig buiten het admin systeem staat
- Team heeft geen manier om homepage te wijzigen zonder developer

## Solution Statement

1. **Nieuwe sectie schemas** voor 8 homepage secties in `siteSchemas.ts`
2. **`siteSeedHome.ts`** met alle bestaande content (NL/EN/DE) geseed in siteContent
3. **`src/app/page.tsx`** roept `loadPageContent("home", lang)` aan + passes data via props
4. **Component refactors** — alle homepage componenten accepteren data als props i.p.v. intern laden
5. **Backward compat** — defaults in componenten blijven werken als fallback

## Feature Metadata

**Feature Type:** Refactor (architectural completion)
**Estimated Complexity:** High (~10 files, 8 nieuwe schemas, 3 talen seed)
**Primary Systems Affected:** siteSchemas, siteSeed, homepage components, home page
**Dependencies:** Bestaande `loadPageContent`, `sectionOr`, `ContentFieldRenderer`

## Execution Strategy

**Recommended:** `/execute-small` (sequentieel)

**Analysis:**
- Total tasks: 8
- Sequentieel omdat schemas nodig zijn voor seed, seed nodig voor page integratie
- Component refactors kunnen parallel maar touch dezelfde page.tsx

---

## DECISIONS FROM CONVERSATION

### Architecture Choices

**Nieuwe schemas vs bestaande hergebruiken:**
- What: Aparte home-specifieke schemas (home-slideshow, home-logos, etc.) naast bestaande generieke schemas
- Why: Homepage componenten hebben unieke velden (slide quotes, team photo layouts) die niet passen in generieke schemas
- Context: Hergebruik zou abstracties forceren die niet passen

**Per component één sectie:**
- What: Elke homepage component krijgt één siteContent sectie
- Why: Één-op-één mapping maakt beheer intuïtief in admin
- Context: Matches het patroon van andere pagina's

**Alle drie talen in initial seed:**
- What: Direct NL + EN + DE seeden vanaf start
- Why: Voorkomt de problemen die we eerder hadden waarbij DE content later moest worden aangevuld
- Context: Content bestaat al in i18n/*.ts files — kan geport worden

**Componenten blijven server components:**
- What: `loadPageContent` in page.tsx, data via props naar componenten
- Why: Homepage moet snel renderen, data loading centraal op page niveau
- Context: Matches over-ons / boek / spreker patroon

### Phased Approach

**Phase 1 (NOW):**
- Schemas voor alle 8 homepage secties
- siteSeedHome.ts met NL + EN + DE content
- page.tsx integratie met loadPageContent
- Component refactors (alle 8)

**Phase 2 (LATER):**
- Schema editor voor slide order / drag-drop
- A/B testing per sectie
- Personalisatie per bezoeker segment

### User Preferences & Constraints

**Technical Preferences:**
- Gebruik bestaande `sectionOr` + `loadPageContent` patroon (consistent met rest)
- Geen nieuwe helpers of abstractions — minimale changes
- Behoud bestaande component defaults als fallback

**Quality Expectations:**
- Content bewerking via Content tab werkt end-to-end per taal
- "Kopieer NL" knop werkt voor alle homepage secties
- Geen regressies in bestaande pagina weergave

### Edge Cases

- **Homepage is server component** — data moet via props, geen interne loading
- **Slideshow items array** — dynamisch aantal slides, niet hardcoded 5
- **Review grid bestaat al** als `reviews` schema — hergebruik of nieuwe variant?
  - Antwoord: eigen `home-reviews` om homepage-specifieke layout te behouden
- **LogoBar gedeeld** met training pages — home krijgt eigen siteContent entry, andere pagina's blijven hun eigen content gebruiken

---

## CONTEXT REFERENCES

### Relevant Codebase Files

LEES VOOR IMPLEMENTATIE:

- `src/app/page.tsx` — homepage entry, heeft geen `loadPageContent`
- `src/app/over-ons/page.tsx` — referentie patroon voor `loadPageContent` + `sectionOr`
- `src/components/sections/HeroSlideshow.tsx` — hardcoded SLIDE_KEYS + slideData
- `src/components/sections/LogoBar.tsx` — hardcoded LOGO_KEYS + logoData
- `src/components/sections/TrainingCards.tsx` — interne loadSiteImages
- `src/components/sections/StatsBand.tsx` — hardcoded stats via `t()`
- `src/components/sections/TeamPhotos.tsx` — hardcoded PHOTO_KEYS
- `src/components/sections/ReviewGrid.tsx` — hardcoded reviewData + AVATAR_KEYS
- `src/components/sections/AboutKlaas.tsx` — interne loadSiteImages
- `src/components/sections/BookTeaser.tsx` — interne loadSiteImages
- `src/components/sections/FinaleCta.tsx` — hardcoded via `t()`
- `convex/siteSchemas.ts` — sectie schemas (uitbreiden)
- `convex/siteSeed.ts` — `getAllSeeds()` functie (home toevoegen)
- `convex/siteSeedOverOns.ts` — patroon voor seed file structuur

### New Files to Create

- `convex/siteSeedHome.ts` — homepage siteContent seed (NL + EN + DE)

### Patterns to Follow

**Pattern: Server page met siteContent + fallback**
From: `src/app/over-ons/page.tsx`
```ts
const lang = await getLocale();
const db = await loadPageContent("home", lang);
const slideshow = sectionOr(db, "slideshow", defaultSlides);
return <HeroSlideshow slides={slideshow.items} />
```

**Pattern: Seed file met 3 talen**
From: `convex/siteSeedOverOns.ts` (na recente updates)
- NL, EN, DE entries per sectie
- `makeContent(SLUG, sectionId, type, "de", data)` patroon

**Pattern: Dumb component accepting props**
From: `src/components/sections/training/TrainingHero.tsx`
- Alleen render logica
- Alle content via props
- Defaults als fallback voor type safety

---

## IMPLEMENTATION PLAN

### Phase 1: Schema Definitions

Nieuwe schemas in `siteSchemas.ts` voor alle 8 homepage secties.

### Phase 2: Seed Creation

`siteSeedHome.ts` met alle bestaande content in NL + EN + DE.

### Phase 3: Page Integration

`src/app/page.tsx` refactor naar loadPageContent flow.

### Phase 4: Component Refactors

Alle 8 componenten: verwijder interne data loading, accepteer props.

### Phase 5: Validation

Build check + visuele verificatie van homepage in alle 3 talen.

---

## STEP-BY-STEP TASKS

### Task 1: UPDATE `convex/siteSchemas.ts` — 8 homepage schemas

- **IMPLEMENT:** Voeg toe aan `SECTION_SCHEMAS`:
  - `home-slideshow`: `items[]` met `{ image, quote, author, role }`
  - `home-logos`: `label` + `items[]` met `{ image, alt, width, height }`
  - `home-training-cards`: `eyebrow` + `title` + `items[]` met `{ image, title, description, href, ctaLabel }`
  - `home-stats`: `items[]` met `{ value, label }`
  - `home-team-photos`: `eyebrow` + `title` + `titleAccent` + `items[]` met `{ image, caption, featured }`
  - `home-reviews`: `eyebrow` + `title` + `titleAccent` + `items[]` met `{ text, name, role, avatar, source }`
  - `home-about-klaas`: `label` + `name` + `subtitle` + `bio1` + `bio1Bold` + `bio1End` + `bio2` + `ctaPrimary` + `ctaSecondary` + `stats[]`
  - `home-book-teaser`: `image` + `label` + `badges[]` + `title` + `description` + `cta`
- **PATTERN:** Bestaande sectie schemas zoals `team`, `reviews`, `hero`
- **VALIDATE:** `npx convex dev --once`

### Task 2: CREATE `convex/siteSeedHome.ts` — homepage seed

- **IMPLEMENT:** `seedHomeContent(): PageSeed`
  - sections array met alle 8 secties
  - content array met NL + EN + DE entries per sectie
  - Source materiaal uit:
    - `src/lib/i18n/nl.ts`, `en.ts`, `de.ts` voor teksten
    - Huidige hardcoded arrays uit componenten voor structuur
  - Image paths: `/images/hero/*`, `/images/logos/*`, etc.
- **PATTERN:** `convex/siteSeedOverOns.ts` volgen
- **VALIDATE:** `npx convex dev --once`

### Task 3: UPDATE `convex/siteSeed.ts` — home toevoegen

- **IMPLEMENT:** Importeer `seedHomeContent` en voeg toe aan `getAllSeeds()`
- **VALIDATE:** `npx convex dev --once`

### Task 4: UPDATE `src/app/page.tsx` — loadPageContent integratie

- **IMPLEMENT:**
  - Importeer `loadPageContent`, `sectionOr`
  - `const db = await loadPageContent("home", lang)`
  - `const slideshow = sectionOr(db, "slideshow", defaultSlideshow)`
  - Idem voor alle 8 secties
  - Pass section data naar componenten als props + lang
- **PATTERN:** `src/app/over-ons/page.tsx`
- **VALIDATE:** `npm run build`

### Task 5: REFACTOR `HeroSlideshow.tsx` + `Hero.tsx`

- **IMPLEMENT:**
  - `HeroSlideshow` accepteert `slides: Array<{ image, quote, author, role }>` als prop
  - `Hero` is wrapper die siteContent doorgeeft
  - Verwijder SLIDE_KEYS en slideData hardcoded arrays
  - Verwijder interne `loadSiteImages`
- **VALIDATE:** `npm run build` + visuele check

### Task 6: REFACTOR `LogoBar.tsx` + `TrainingInfoBar.tsx`

- **IMPLEMENT:**
  - `LogoBar` accepteert `label` + `logos: Array<{ src, alt, width, height }>` als prop
  - `TrainingInfoBar` ook (ze delen dezelfde structuur)
  - Verwijder LOGO_KEYS en logoData
  - Homepage page.tsx geeft logos door via props
  - Training pages blijven hun eigen data gebruiken (backward compat)
- **VALIDATE:** `npm run build`

### Task 7: REFACTOR `TrainingCards.tsx` + `StatsBand.tsx` + `TeamPhotos.tsx` + `ReviewGrid.tsx`

- **IMPLEMENT:**
  - `TrainingCards`: accepteer `cards: Array<{ image, title, description, href, ctaLabel }>` + `eyebrow` + `title` props
  - `StatsBand`: accepteer `stats: Array<{ value, label }>` prop
  - `TeamPhotos`: accepteer `photos: Array<{ image, caption, featured }>` prop
  - `ReviewGrid`: accepteer `reviews: Array<{ text, name, role, avatar, source }>` prop
  - Verwijder interne `loadSiteImages` en hardcoded data arrays
  - Defaults als fallback behouden
- **VALIDATE:** `npm run build`

### Task 8: REFACTOR `AboutKlaas.tsx` + `BookTeaser.tsx` + `FinaleCta.tsx`

- **IMPLEMENT:**
  - `AboutKlaas`: accepteer `image`, `label`, `name`, `subtitle`, `bio1*`, `bio2`, `cta*`, `stats[]` props
  - `BookTeaser`: accepteer `image`, `label`, `badges[]`, `title`, `description`, `cta` props
  - `FinaleCta`: accepteer `title`, `titleAccent`, `description`, `ctaLabel`, `href` props
  - Verwijder interne data loading
- **VALIDATE:** `npm run build` + visuele check homepage

---

## TESTING STRATEGY

### Handmatige Tests (Primair)

1. **Admin Content tab** → Home pagina → alle 8 secties zichtbaar met correcte velden
2. **Lang switching**: NL/EN/DE tabs tonen correcte content per sectie
3. **Kopieer NL knop** werkt voor EN en DE secties
4. **Image upload** per sectie — crop tool actief via imageSpecs
5. **Save + refresh homepage** → wijzigingen zichtbaar op `/` in alle 3 talen
6. **Visuele check**: homepage layout identiek aan huidige versie (geen regressies)

### Edge Cases

- Image ontbreekt in siteContent → fallback naar default image
- Sectie is leeg → component toont niets / skip render
- Locale cookie DE → homepage laadt DE content uit database
- Admin wijzigt slide volgorde → correct gerenderd

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
# Open /admin → Content → Home → test alle secties per taal
# Open / → visuele regressie check
# Open / met DE locale → check DE content laadt
```

### Level 3: Productie Deploy

```bash
npx convex deploy --yes
npx convex run --prod siteSeed:syncNewContent
```

---

## ACCEPTANCE CRITERIA

- [ ] Homepage heeft `loadPageContent("home")` in page.tsx
- [ ] Alle 8 secties zichtbaar in Admin Content tab
- [ ] NL, EN, DE content beschikbaar voor alle secties
- [ ] Alle 8 componenten accepteren data als props (geen interne loadSiteImages)
- [ ] Homepage visueel identiek aan huidige versie
- [ ] Content wijzigingen in admin worden zichtbaar op frontend
- [ ] "Kopieer NL" knop werkt voor homepage secties
- [ ] `npm run build` slaagt zonder errors
- [ ] Geen regressies op andere pagina's die `LogoBar`, `TrainingCards`, etc. gebruiken

---

## DEFERRED ITEMS

### Phase 2 Features
- **Slide drag-and-drop ordering** — nu sortOrder via manual edit
- **A/B testing per sectie** — integratie met bestaande experiments tabel
- **Personalisatie** — content varianten per bezoeker segment
- **Video slides** — slideshow ondersteunt nu alleen images

### Known Limitations
- Homepage heeft meer hardcoded strings in subcomponenten (StatsBand etc.) — die blijven via i18n files
- Image crop ratios voor slides moeten handmatig in imageSpecs seed worden bijgewerkt
- Geen undo/versioning bij content wijzigingen

---

## NOTES & CONTEXT

### Conversation Summary

- Homepage is de enige pagina die niet beheerbaar is via admin
- Andere pagina's (over-ons, boek, spreker, training pages) werken al via siteContent
- Gebruiker wil consistentie: alles via Content tab
- DE content moet vanaf start beschikbaar zijn (geen latere retrofit)

### Design Rationale

- **Aparte home-* schemas** voorkomen forced abstraction met andere pagina's
- **Props-based componenten** maakt testen en hergebruik makkelijker
- **Centrale data loading** in page.tsx is performanter (één query, geen waterfall)
- **3 talen vanaf start** voorkomt de sync issues die we eerder hadden

### For Future Reference

Na deze refactor is de hele site beheerbaar via de Content tab. De laatste hardcoded resten (TransformationSlider i18n, RadarModel i18n, StatsBand via `t()`) blijven bestaan omdat die niet zinvol zijn om inhoudelijk te beheren — ze zijn puur UI labels.

De `siteSeedHome.ts` wordt de single source of truth voor de homepage default content. Toekomstige wijzigingen via admin blijven bewaard en worden niet overschreven door re-seed.
