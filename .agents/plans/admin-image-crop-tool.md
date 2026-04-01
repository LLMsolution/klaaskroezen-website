# Feature: Admin Image Crop Tool met Dynamische Dimensies + Taalvarianten

## Context Note

Dit plan is gebaseerd op:
- /prime output van de codebase-analyse (2026-04-01)
- Conversatie met gebruiker over image management requirements
- codebase-pattern-finder: volledige image pipeline analyse
- codebase-analyst: alle image dimensies per component
- web-search-researcher: crop library vergelijking

## Feature Description

Een image management systeem in het admin panel dat:
1. Per afbeelding toont welke dimensies vereist zijn (gebaseerd op waar de afbeelding wordt weergegeven)
2. Een crop tool biedt die automatisch de juiste aspect ratio lockt bij upload
3. Dimensie-specs dynamisch bijwerkt wanneer de layout editor wijzigingen maakt
4. Taal-specifieke afbeeldingen ondersteunt voor het boek (NL/EN/DE covers en preview pagina's)

## User Story

Als admin wil ik bij het uploaden van afbeeldingen direct zien welke dimensies nodig zijn
en de afbeelding kunnen croppen naar de juiste verhouding,
zodat afbeeldingen altijd correct worden weergegeven zonder handmatig Photoshop-werk.

## Problem Statement

- Afbeeldingen worden geupload zonder kennis van vereiste dimensies
- `width`/`height` velden in `siteImages` schema bestaan maar worden nooit gevuld
- Geen crop functionaliteit — afbeeldingen worden alleen geresized naar max 1920px
- Boek-afbeeldingen zijn altijd NL, geen taalvarianten mogelijk

## Solution Statement

- Image specs registry die per image-key de gewenste dimensies bijhoudt
- `react-image-crop` (~5KB gzip, React 19 compatible) voor client-side cropping
- Taal-veld op `siteImages` voor boek-afbeeldingen met fallback naar universeel
- Layout editor hook die specs bijwerkt bij dimensie-wijzigingen

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium-High
**Primary Systems Affected**: Admin panel (ImagesTab), siteImages, AdminImageUpload, layout editor
**Dependencies**: `react-image-crop` (npm package)

## Execution Strategy

**Recommended**: `/execute-small`

**Analysis:**
- Total tasks: 7
- Independent workstreams: deels (schema + seed onafhankelijk van UI)
- Same-file conflicts: ja — meerdere tasks raken AdminImageUpload en ImagesTab

**Recommendation rationale:** Sequentieel omdat tasks dezelfde bestanden raken en op elkaar voortbouwen.

---

## DECISIONS FROM CONVERSATION

### Architecture Choices

**Image Specs als aparte tabel (niet inline in siteImages):**
- What: Nieuwe `imageSpecs` tabel die per key de gewenste dimensies bijhoudt
- Why: Scheidt "wat is geupload" (siteImages) van "wat is gewenst" (imageSpecs)
- Context: Layout editor moet specs kunnen updaten zonder images te raken

**react-image-crop als crop library:**
- What: ~5KB gzip, zero dependencies, React 19 getest door maintainer
- Why: Kleinste bundle, enige lib die actief React 19 ondersteunt
- Context: Vergeleken met react-easy-crop (13KB, geen React 19 test) en react-cropper (30KB+, abandoned)

**Taal-specifieke images via lang veld op siteImages:**
- What: Optioneel `lang` veld op siteImages, lookup met fallback
- Why: Minimale schema-wijziging, backward compatible
- Context: Alleen nodig voor boek-afbeeldingen (cover, preview pagina's)

### Phased Approach

**Phase 1 (NOW):**
- Image specs tabel + seed met alle bekende dimensies
- Crop tool in upload flow
- Dimensie-info in ImagesTab
- Taal-specifieke boek-afbeeldingen
- Layout editor → imageSpecs sync

**Phase 2 (LATER — niet in scope):**
- Automatisch resizen van bestaande afbeeldingen die niet voldoen
- Batch crop tool voor meerdere afbeeldingen tegelijk
- Image CDN/optimization (Next.js Image doet dit al)

### Rejected Alternatives

**Server-side image processing:** Niet gekozen — alles client-side via canvas API. Geen extra infra nodig.
**Cropperjs/react-cropper:** Abandoned, 230KB bundle, geen React 19 support.

### Edge Cases & Error Scenarios

- **Afbeelding te klein voor gewenste dimensies** → Waarschuwing tonen, upload wel toestaan
- **Geen spec gevonden voor image key** → Crop tool toont vrije crop (geen locked ratio)
- **Layout editor wijzigt dimensies** → Bestaande afbeeldingen krijgen rode indicator "niet meer passend"
- **Taalvariant ontbreekt** → Fallback naar universele (lang=null) afbeelding

---

## CONTEXT REFERENCES

### Relevant Codebase Files

LEES DEZE BESTANDEN VOOR IMPLEMENTATIE:

- `convex/schema.ts` (regel 1003-1016) — `siteImages` tabel definitie
- `convex/siteImages.ts` — alle image CRUD mutations/queries
- `src/app/admin/components/ImagesTab.tsx` — huidige admin image grid
- `src/app/admin/components/AdminImageUpload.tsx` — upload + resize logica
- `src/app/admin/components/ContentFieldRenderer.tsx` (regel 227-253) — image-path veld rendering
- `src/lib/site-images.ts` — `loadSiteImages()` server-side loader
- `convex/layoutEditor.ts` (regel 313-347) — layout editor image handling
- `convex/siteSchemas.ts` — section schema definities met image-path velden

### New Files to Create

- `src/components/ui/ImageCropper.tsx` — crop tool component
- `convex/imageSpecs.ts` — image specs queries/mutations
- `convex/imageSpecsSeed.ts` — seed data met alle bekende dimensies

### Patterns to Follow

**Pattern: Convex mutation met admin auth**
From: `convex/siteImages.ts:75-109` (`saveImage` mutation)
- Altijd `await requireAdmin(ctx)` als eerste regel
- Args met `v.` validators
- Return ID na insert

**Pattern: Admin tab component**
From: `src/app/admin/components/ImagesTab.tsx`
- `useQuery` + `useMutation` van convex/react
- `Loading` en `EmptyState` uit `./shared`
- Design tokens: `text-[12px]`, `border-rule`, `rounded-[2px]`, `text-copper`

**Pattern: Image upload flow**
From: `src/app/admin/components/AdminImageUpload.tsx:77-100`
- `generateUploadUrl()` → `fetch(POST)` → `onUploaded(storageId)`
- Client-side resize via canvas voor upload

---

## IMPLEMENTATION PLAN

### Phase 1: Schema + Seed (Foundation)

Nieuwe `imageSpecs` tabel aanmaken en vullen met alle bekende dimensies uit de codebase-analyse.
Lang-veld toevoegen aan siteImages voor taalvarianten.

### Phase 2: Convex Backend (Queries/Mutations)

CRUD voor imageSpecs, uitgebreide image lookup met lang-support, dimensie-capture bij upload.

### Phase 3: Crop Component (UI)

Client-side crop tool met locked aspect ratio, WebP output, dimensie-validatie.

### Phase 4: Admin Integration (ImagesTab + Upload)

Dimensie-info tonen, crop integreren in upload flow, taal-tabs voor boek-afbeeldingen.

### Phase 5: Layout Editor Hook

Bij dimensie-wijzigingen automatisch imageSpecs updaten.

---

## STEP-BY-STEP TASKS

### Task 1: UPDATE `convex/schema.ts` — imageSpecs tabel + siteImages lang veld

- **IMPLEMENT**:
  1. Voeg `imageSpecs` tabel toe:
     ```
     imageSpecs: defineTable({
       imageKey: v.string(),
       displayWidth: v.number(),
       displayHeight: v.number(),
       aspectRatio: v.string(),       // "16:9", "4:3", "1:1"
       context: v.string(),           // "TrainingHero — volledig scherm"
       pageSlug: v.optional(v.string()), // welke pagina gebruikt dit
       updatedAt: v.number(),
     }).index("by_key", ["imageKey"])
       .index("by_page", ["pageSlug"])
     ```
  2. Voeg `lang` toe aan `siteImages`:
     ```
     lang: v.optional(langValidator)  // null = universeel
     ```
  3. Voeg composite index toe aan siteImages: `.index("by_key_lang", ["key", "lang"])`
- **PATTERN**: Bestaande tabel definities in schema.ts
- **VALIDATE**: `npx convex dev --once` (schema push)

### Task 2: CREATE `convex/imageSpecs.ts` — queries en mutations

- **IMPLEMENT**:
  1. `getSpecForKey` query — haal spec op voor een image key
  2. `getSpecsForPage` query — alle specs voor een pagina
  3. `listAllSpecs` query (admin) — alle specs
  4. `upsertSpec` mutation (admin) — maak/update een spec
  5. `bulkUpsert` internalMutation — voor seed en layout editor sync
- **PATTERN**: Volg `convex/siteImages.ts` voor auth + query structuur
- **VALIDATE**: `npx convex dev --once`

### Task 3: CREATE `convex/imageSpecsSeed.ts` — seed met bekende dimensies

- **IMPLEMENT**: Seed alle bekende image specs uit de codebase-analyse:

  | Key pattern | Width | Height | Ratio | Context |
  |-------------|-------|--------|-------|---------|
  | `hero/*` (full) | 1920 | 1080 | 16:9 | Hero — volledig scherm |
  | `hero/*` (slideshow) | 960 | 600 | 16:10 | Hero slideshow |
  | `team/*` (groot) | 960 | 500 | ~2:1 | Team foto groot |
  | `team/*` (klein) | 960 | 500 | ~2:1 | Team foto klein |
  | `about/klaas-*` | 960 | 1280 | 3:4 | Portrait |
  | `about/*-member` | 590 | 590 | 1:1 | Team member |
  | `about/kantoor*` | 1180 | 664 | 16:9 | Kantoor foto |
  | `book/cover*` | 380 | 570 | 2:3 | Boek cover |
  | `book/preview/*` | 896 | 1366 | ~2:3 | Boek preview pagina |
  | `blog/*` | 1360 | 765 | 16:9 | Blog hero |
  | `reviews/*` | 72 | 72 | 1:1 | Avatar |
  | `logos/*` | 200 | 52 | auto | Logo |
  | `spreker/*` | 960 | 1280 | 3:4 | Spreker foto |
  | `contact/*` | 960 | 1280 | 3:4 | Contact portret |

- **PATTERN**: Volg `convex/siteSeed.ts` structuur met internalMutation
- **VALIDATE**: `npx convex dev --once` + seed draaien via admin of CLI

### Task 4: UPDATE `convex/siteImages.ts` — lang-aware lookup + dimensie-capture

- **IMPLEMENT**:
  1. Update `getByKey` en `getByKeys` met optionele `lang` parameter:
     - Zoek eerst `key` + `lang` (taalspecifiek)
     - Fallback naar `key` zonder `lang` (universeel, `lang === undefined`)
  2. Update `saveImage` mutation: vul `width`/`height` altijd in (meegegeven door client na crop)
  3. Nieuwe mutation `saveImageWithLang`: zoals saveImage maar met `lang` parameter
  4. Update `listAll` query: toon `lang` veld in resultaten
- **PATTERN**: Bestaande `getByKeys` query als basis
- **VALIDATE**: `npx convex dev --once`

### Task 5: CREATE `src/components/ui/ImageCropper.tsx` — crop component

- **IMPLEMENT**:
  1. Installeer: `npm install react-image-crop`
  2. Client component (`"use client"`) met:
     - Props: `aspectRatio?: number`, `targetWidth?: number`, `targetHeight?: number`, `onCrop: (blob: Blob, width: number, height: number) => void`, `onCancel: () => void`
     - File input → image preview
     - `ReactCrop` met locked `aspect` ratio (uit imageSpecs)
     - Als geen spec: vrije crop
     - Canvas-based crop → WebP blob output (0.85 quality)
     - Resize naar target dimensies na crop
     - Toon waarschuwing als bronafbeelding kleiner is dan target
  3. Compact modal-achtige UI die past bij het admin design systeem:
     - `border-rule`, `rounded-[2px]`, `bg-paper`, copper accenten
     - "Bijsnijden" en "Annuleren" knoppen
     - Preview van crop resultaat met dimensie-info
  4. `cropToBlob` utility functie (canvas drawImage → toBlob)
- **IMPORTS**: `react-image-crop`, `react-image-crop/dist/ReactCrop.css`
- **WHY**: Locked aspect ratio zorgt dat uploads altijd passen bij de weergave
- **VALIDATE**: Handmatig testen in admin

### Task 6: UPDATE admin componenten — dimensie-info + crop integratie + taal-tabs

**6a: UPDATE `src/app/admin/components/AdminImageUpload.tsx`**
- **IMPLEMENT**:
  1. Na file selectie: toon ImageCropper modal in plaats van direct uploaden
  2. Haal imageSpec op voor de huidige key (nieuwe prop `imageKey?: string`)
  3. Als spec beschikbaar: lock aspect ratio en toon gewenste dimensies
  4. Na crop: upload gecropt resultaat (bestaande upload flow)
  5. Geef `width`/`height` door aan `onUploaded` callback (signature wijzigt)
  6. Als geen spec: toon vrije crop of skip crop bij "geen wijziging nodig"
- **PATTERN**: Bestaande `handleUpload` flow uitbreiden

**6b: UPDATE `src/app/admin/components/ImagesTab.tsx`**
- **IMPLEMENT**:
  1. Per afbeelding tonen:
     - Gewenste dimensies badge (uit imageSpecs): `"1920x1080 · 16:9"`
     - Huidige dimensies (uit siteImages width/height)
     - Status indicator: groen (match), oranje (close), rood (mismatch/ontbreekt)
     - Context label: "TrainingHero — volledig scherm"
  2. Taal-tabs voor boek-afbeeldingen:
     - Filter op category "book"
     - Per image: tabs NL / EN / DE
     - Upload per taal of markeer als universeel
     - Visueel welke talen een variant hebben (dot indicator)
  3. "Opnieuw croppen" knop per afbeelding (opent crop tool met huidige afbeelding)
- **PATTERN**: Bestaande grid layout uitbreiden, design tokens uit ImagesTab

**6c: UPDATE `src/app/admin/components/ContentFieldRenderer.tsx`**
- **IMPLEMENT**:
  1. Bij `image-path` velden: toon gewenste dimensies onder de upload
  2. Haal spec op via sectionId + field key mapping
  3. Kleine badge: `"Aanbevolen: 960x1280 (3:4)"`
- **PATTERN**: Bestaande ContentImageField sub-component

- **VALIDATE**: Handmatig testen — upload afbeelding, crop, check dimensies in grid

### Task 7: UPDATE layout editor — imageSpecs sync

- **IMPLEMENT**:
  1. In `convex/layoutEditorOps.ts` of nieuwe functie in `convex/imageSpecs.ts`:
     - Wanneer layout editor een sectie commit die image-gerelateerde CSS bevat
     - Parse aspect ratio / dimensie wijzigingen uit de gegenereerde code
     - Roep `imageSpecs.bulkUpsert` aan met nieuwe specs
  2. Dit is een best-effort sync — als parsing failt, log warning maar block niet
  3. Trigger: na succesvolle layout merge (in de callback flow)
- **PATTERN**: Bestaande layout editor callback in `convex/http.ts`
- **WHY**: Dimensies blijven automatisch in sync met layout wijzigingen
- **VALIDATE**: Layout wijziging maken → check of specs zijn bijgewerkt

---

## TESTING STRATEGY

### Handmatige Tests (Primair)

Dit is een admin-only feature, dus handmatig testen is de primaire strategie:

1. **Upload flow**: Selecteer afbeelding → crop modal verschijnt → lock ratio → crop → upload
2. **Dimensie-info**: Check dat alle afbeeldingen in grid hun gewenste dimensies tonen
3. **Taalvarianten**: Upload EN cover voor boek → check dat EN pagina de EN cover toont
4. **Fallback**: Verwijder EN variant → check dat EN pagina terugvalt naar NL cover
5. **Te kleine afbeelding**: Upload 200x200 voor een 1920x1080 slot → waarschuwing zichtbaar
6. **Vrije crop**: Upload afbeelding voor key zonder spec → crop tool zonder locked ratio

### Edge Cases

- Upload een portrait afbeelding voor een landscape slot → crop tool forceert landscape
- Upload exact de juiste dimensies → crop tool toont "Afbeelding past al, bijsnijden overslaan?"
- Meerdere talen tegelijk uploaden voor boek → elke taal krijgt eigen storageId

---

## VALIDATION COMMANDS

### Level 1: Build Check

```bash
npx convex dev --once    # Schema + functions deployen
npm run build            # Next.js build check
npm run lint             # ESLint
```

**Expected**: Alle commands exit code 0

### Level 2: Runtime Check

```bash
npm run dev              # Dev server starten
# Open /admin → Images tab → test upload flow
```

---

## ACCEPTANCE CRITERIA

- [ ] Elke afbeelding in ImagesTab toont gewenste dimensies + aspect ratio
- [ ] Upload opent crop tool met gelocked aspect ratio (als spec beschikbaar)
- [ ] Crop tool output is WebP, geresized naar target dimensies
- [ ] `width`/`height` worden opgeslagen in siteImages na upload
- [ ] Boek-afbeeldingen ondersteunen NL/EN/DE varianten
- [ ] Taal-lookup valt terug naar universele afbeelding als variant ontbreekt
- [ ] Content editor toont aanbevolen dimensies bij image-path velden
- [ ] Layout editor wijzigingen updaten imageSpecs automatisch
- [ ] Waarschuwing bij te kleine bronafbeelding
- [ ] Alle bestaande afbeeldingen blijven werken (backward compatible)
- [ ] `npm run build` slaagt zonder errors

---

## DEFERRED ITEMS

### Phase 2 Features
- **Batch crop**: Meerdere afbeeldingen tegelijk croppen — nu niet nodig, weinig afbeeldingen
- **Auto-resize bestaande images**: Bestaande afbeeldingen die niet passen automatisch herverwerken
- **Image quality scoring**: AI-gebaseerde kwaliteitscheck op uploads

### Known Limitations
- Layout editor sync is best-effort — complexe CSS parsing kan falen
- Crop tool werkt alleen client-side — grote afbeeldingen kunnen traag zijn op mobiel (admin is desktop-only)
- Image specs moeten handmatig bijgewerkt worden als nieuwe componenten worden toegevoegd

---

## NOTES & CONTEXT

### Twee image-paden in de codebase

Er zijn twee gescheiden image systemen:
1. **siteImages tabel** (key-based, gebruikt door `loadSiteImages()`) — voor hero's, team foto's, logos, etc.
2. **siteContent inline** (`convex:<storageId>` in sectie-JSON) — voor afbeeldingen in content secties

De crop tool moet beide paden ondersteunen:
- siteImages: via ImagesTab upload
- siteContent: via ContentFieldRenderer image-path upload

### AdminImageUpload signature wijziging

De `onUploaded` callback signature wijzigt van `(storageId)` naar `(storageId, width, height)`.
Alle bestaande callers moeten worden bijgewerkt. Check:
- `ImagesTab.tsx` (ReplaceButton)
- `ContentFieldRenderer.tsx` (ContentImageField)
- `TrainingEditor.tsx` (als het image upload gebruikt)
- `AdminImageUpload.tsx` zelf (interne flow)

### react-image-crop installatie

```bash
npm install react-image-crop
```
- ~5KB gzip, zero dependencies
- React 19 compatible (getest door maintainer)
- CSS import nodig: `import "react-image-crop/dist/ReactCrop.css"`
