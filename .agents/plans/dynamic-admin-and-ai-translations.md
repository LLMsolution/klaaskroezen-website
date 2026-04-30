# Feature: Dynamic Admin + AI Translations

## Context Note

Dit plan is gebaseerd op:
- Conversatie met Tim op 2026-04-30 over volledig dynamische admin (boeken + trainingen) en vervanging van DeepL door AI-vertalingen
- Code-audit van hardcoded slug-checks, DeepL implementatie en bestaande dynamic infrastructuur (`siteContent`, `accountCatalog`, `trainings.linkedProducts`)
- Drie tracks samengevoegd in één PR per Tim's verzoek

## Feature Description

Drie samenhangende verbeteringen die de admin van boekjes naar product-fabriek tillen:

**Track 1 — Dynamic Products**: Op dit moment zijn er hardcoded slug-checks in 5+ files (`boek-ebook`, `set-online`, etc.) waardoor een nieuw product (extra boek of nieuwe training) niet zonder code-wijziging gelanceerd kan worden. Door een `productVariant` veld op `checkoutProducts` te zetten en alle hardcoded checks daarop te vervangen, kan Klaas zelf een 2e boek of "Leadership Training" aanmaken.

**Track 2 — AI Translations**: DeepL ligt eruit — alle translate-functies zijn dood. Vervangen door OpenRouter (Claude Haiku 4.5) met een door admin beheerbare glossary. Per term kiest admin "niet vertalen" of "specifieke vertaling" met EN/DE waarden. Glossary wordt bij elke vertaling meegestuurd in de prompt zodat AI consistente vertalingen levert.

**Track 3 — Dynamic Marketing Pages**: De pagina's `/sales-excellence-training` en `/customer-success-training` zijn statisch hardcoded. Verhuizen naar dynamische route die `siteContent` als bron gebruikt — zodat een nieuwe training ook automatisch een marketing-landing krijgt.

## User Story

**Als Klaas (admin)**  
wil ik nieuwe boeken en trainingen volledig zelfstandig kunnen lanceren  
zodat ik niet afhankelijk ben van een ontwikkelaar voor elke product-uitbreiding.

**Als Klaas (admin)**  
wil ik een woordenboek beheren dat AI gebruikt bij vertalingen  
zodat productnamen, eigennamen en merkterminologie consistent worden vertaald.

**Als Tim (ontwikkelaar)**  
wil ik geen hardcoded slug-checks meer onderhouden  
zodat features uitbreidbaar zijn zonder copy-paste in 5 files.

## Problem Statement

1. **Hardcoded slugs**: 7+ plekken in code (`shared.tsx`, `bedankt/page.tsx`, `emails.ts`, `emailSequences.ts`, `DigitalFilesTab.tsx`, `ExperimentsTab.tsx`, `users.ts`) checken op exacte slug-waarden zoals `boek-ebook` of `set-online` — onuitbreidbaar zonder code
2. **Statische marketing pagina's**: SET en CST hebben eigen `page.tsx` + `content-{nl,en,de}.ts` files; nieuwe training vereist nieuwe directory
3. **DeepL niet meer beschikbaar**: blog en training translate functies werken niet meer; backlog van handmatig vertalen
4. **Inconsistente vertalingen**: zonder glossary wordt "Sales Excellence Training" soms wel/niet vertaald — slecht voor merkidentiteit

## Solution Statement

Eén abstractie laag (`productVariant` veld + DB-driven labels), één AI service met glossary, en één dynamische marketing template:

1. `checkoutProducts.productVariant` als single source of truth voor product-type → vervangt alle hardcoded slug-checks
2. `translationGlossary` tabel + admin tab + OpenRouter integration (Claude Haiku 4.5) → vervangt DeepL
3. `/training/[slug]/marketing` dynamische route + `siteContent` blocks → vervangt hardcoded landing pages, met 301 redirects voor SEO

## Feature Metadata

- **Feature Type**: Refactor + new capability
- **Estimated Complexity**: High (~12-15u, raakt 15+ files)
- **Primary Systems Affected**: checkoutProducts schema, admin UI, email rendering, bedankt-pagina, marketing routes, blog/training translate
- **Dependencies**: OpenRouter account + API key (admin-werk vóór deploy)

## Execution Strategy

**Recommended**: `/execute-small` (één file tegelijk, sequentieel, want fasen bouwen op elkaar)

**Analysis**:
- Totaal taken: ~22 in 7 fasen
- Onafhankelijke werkstromen: track 2 (AI translations) is geïsoleerd; track 1 (productVariant) raakt veel files maar vrij mechanical; track 3 (marketing pages) hangt op track 1 want gebruikt productVariant
- Same-file conflicten: ja — `schema.ts`, `AdminClient.tsx`, `AdminSidebar.tsx`, `emails.ts` worden door meerdere fasen aangeraakt → sequentieel veiliger

**Recommendation rationale**: 22 taken in 7 logische fasen waarvan track 2 → track 1 → track 3 sequentieel kunnen. `/execute-small` voor controle.

---

## DECISIONS FROM CONVERSATION

### Architecture Choices

**`productVariant` als single source of truth (Optie B uit conversatie)**:
- What: Eén veld op `checkoutProducts` met waardes `ebook` / `audiobook` / `hardcopy` / `online-course` / `coaching` / `event`
- Why: Tim koos optie B — werkt voor zowel boeken als trainingen, geen aparte velden per producttype
- Context: Voorkomt 7+ slug-checks; één refactor dekt alle frontend/backend logic

**Glossary "niet vertalen" via radio (Optie B uit conversatie)**:
- What: Per term kiest admin "Niet vertalen" of "Specifieke vertaling". Bij eerste worden EN/DE velden disabled.
- Why: Conceptueel duidelijk voor Klaas, geen tripled inputs voor eigennamen
- Context: Tim's woorden: "lijst woorden in NL met EN/DE vertaling, als ingevuld → altijd zo, soms niet vertalen"

**Marketing pagina's: alle trainings naar dynamische route (Optie B)**:
- What: SET en CST verhuizen naar `/training/[slug]/marketing`. Bestaande URLs `/sales-excellence-training` en `/customer-success-training` → 301 redirects.
- Why: Eén consistent URL-patroon, future-proof, eenmalige SEO-shuffle is acceptabel
- Context: Tim: "ja allemaal akkoord"

**Claude Haiku 4.5 als enige model**:
- What: Vast `anthropic/claude-haiku-4-5-20251001` via OpenRouter
- Why: Tim wil "goedkoop, robuust, goed luisterend". Haiku 4.5 voldoet daaraan. Geen model-selector om scope simpel te houden.
- Context: ~$0.001 per blogpost vertaling

**Globale glossary, geen scope-veld (Optie A)**:
- What: Eén glossary voor alle vertalingen (blog, training, content blocks, etc.)
- Why: Simpel begin; scope-veld kan later toegevoegd als blijkt dat termen contextspecifiek zijn

### Phased Approach

**Phase 1 (NOW - In Scope)**:
- `productVariant` veld + alle hardcoded slug-checks weg
- AI translate via OpenRouter + glossary admin
- Dynamische marketing pagina's voor trainings
- 301 redirects oude URLs

**Phase 2 (LATER - Deferred)**:
- Audit log glossary wijzigingen
- Bulk CSV import voor glossary
- Multi-model selector (Sonnet als optie)
- Productvariants `workshop` en `keynote` (als Klaas die wil verkopen)
- Translation memory caching (vermijdt herhaalde calls voor identieke fragmenten)
- Bestaande DeepL-vertalingen her-vertalen via AI met glossary

### Rejected Alternatives

**`bookFormat` alleen voor boeken (oorspronkelijke Optie A)**: niet gekozen — Tim's optie B met breder `productVariant` voorkomt aparte velden per type.

**Glossary "preserve via 3x dezelfde tekst"**: niet gekozen — tweede voorkeur, conceptueel onduidelijk voor Klaas.

**Marketing pages laten staan als legacy**: niet gekozen — Tim wil consistent URL-patroon.

**Admin-selector voor AI model**: niet gekozen — Tim wil "vast Haiku 4.5".

**DeepL als fallback houden**: niet gekozen — Tim "DeepL eruit, helemaal".

### User Preferences & Constraints

**Technical Preferences**:
- Niet committen tussentijds; pas pushen als alles werkt (memory `feedback_deploy_workflow.md`)
- Geen emoji in code/UI tenzij gevraagd (CLAUDE.md)
- Server Components default; `"use client"` alleen waar nodig
- Alle hardcoded NL/EN/DE strings via `lib/i18n`

**Constraints**:
- 500-regel limiet per file (CLAUDE.md) — `AdminClient.tsx` en `emails.ts` blijven binnen budget na refactor
- OpenRouter account + saldo door Tim aangemaakt vóór deploy
- 1 PR (Tim's voorkeur), wel logische commits binnen die PR

**Quality Expectations**:
- Geen test framework geconfigureerd → manuele validatie via dev server
- Build moet groen, lint geen nieuwe warnings
- Bestaande functionaliteit (SET/CST checkout, blog vertaling van bestaande posts) blijft werken

### Edge Cases & Error Scenarios

- **OpenRouter down/timeout**: graceful error in admin ("AI tijdelijk niet bereikbaar"); geen crash
- **Glossary entry zonder vertaling**: behandeld als "Niet vertalen" (default)
- **Multi-word phrases**: AI krijgt hele glossary in prompt en matcht zelf — geen client-side regex
- **Hoofdletter-gevoeligheid**: vinkje per term, default uit; alleen bij namen/productnamen aanzetten
- **Rate limiting**: 100 vertalingen per uur per admin (voorkomt onbedoelde kosten-spike)
- **Bestaande DeepL vertalingen**: blijven staan, niet automatisch her-vertaald
- **301 redirects** moeten zowel oude `/sales-excellence-training` als `/customer-success-training` correct doorsturen, ook met query params (lang=en etc.)
- **`productVariant` ontbreekt**: bestaande producten zonder veld → fallback op `productType` (`book` of `training`) en custom mapping voor SET/CST

---

## CONTEXT REFERENCES

### Relevant Codebase Files

LEZEN VOORDAT JE IMPLEMENTEERT:

- `convex/schema.ts:62-94` — `pendingOrders` schema
- `convex/schema.ts:130-145` — `digitalFiles` schema (al uitgebreid met format)
- `convex/schema.ts:213-280` — `checkoutProducts` schema (waar `productVariant` bij komt)
- `convex/checkoutProducts.ts` — CRUD mutations (createProduct + updateProduct moeten `productVariant` accepteren)
- `convex/checkoutProductSeed.ts:99-180` — bestaande boekproducten met huidige slugs
- `convex/blogTranslate.ts` — DeepL caller voor blog (te migreren)
- `convex/trainingTranslate.ts` — DeepL caller voor trainings (te migreren)
- `convex/emails.ts:472-491` — `buildPurchaseConfirmationHtml` met hardcoded slug branches
- `convex/emailSequences.ts:404-411` — `formatLabel` hardcoded mapping
- `convex/users.ts:111-160` — `getMyDownloads` met taalfilter (mogelijk format-filter)
- `src/app/admin/components/shared.tsx:3-11` — `PRODUCT_NAMES` hardcoded
- `src/app/admin/components/ExperimentsTab.tsx:328-331` — hardcoded product dropdown
- `src/app/admin/components/DigitalFilesTab.tsx:11` — `PRODUCTS` array hardcoded
- `src/app/admin/components/CheckoutPageForm.tsx` — admin form, krijgt `productVariant` dropdown
- `src/app/admin/components/AdminSidebar.tsx:46-80` — nav (nieuwe glossary tab)
- `src/app/admin/AdminClient.tsx` — tab routing
- `src/app/admin/components/DeepLButton.tsx` — wordt `TranslateButton` (refactor)
- `src/app/checkout/bedankt/page.tsx:104` — `resolveVariant` slug-switch
- `src/app/sales-excellence-training/page.tsx` + `content-*.ts` — verhuizen
- `src/app/customer-success-training/page.tsx` + `content-*.ts` — verhuizen
- `convex/siteContent.ts` + `convex/siteSeed.ts` — patroon voor dynamische pagina-content
- `next.config.ts` — voor 301 redirects toevoegen

### New Files to Create

- `convex/translationGlossary.ts` — CRUD mutations voor glossary
- `convex/aiTranslate.ts` — OpenRouter integratie + prompt assembly
- `src/app/admin/components/TranslationGlossaryTab.tsx` — admin UI
- `src/app/admin/components/TranslationTester.tsx` — live preview paneel
- `src/app/training/[slug]/marketing/page.tsx` — dynamische marketing landing
- `convex/siteSeedTrainings.ts` — seed bestaande SET/CST content naar siteContent

### Patterns to Follow

**Pattern: Admin tab met DB-driven CRUD**

From: `src/app/admin/components/AccountCatalogTab.tsx`

Filter/sort/edit pattern voor lijstweergave + inline edit form. Apply to: `TranslationGlossaryTab`.

**Pattern: Convex internal action met externe API**

From: `convex/blogTranslate.ts` (DeepL fetch). Apply to: `aiTranslate.ts` met OpenRouter.

**Pattern: Schema veld met optional fallback**

From: `digitalFiles.lang: v.optional(langValidator)` (uit recente PR). Apply to: `checkoutProducts.productVariant: v.optional(v.union(...))`.

**Pattern: Dynamische marketing pagina via siteContent**

From: `src/app/page.tsx` (home gebruikt siteContent). Apply to: `/training/[slug]/marketing/page.tsx`.

### Key Findings from Code Audit

- **Hardcoded slugs gevonden in 7 plekken**: shared.tsx (PRODUCT_NAMES), bedankt/page.tsx (resolveVariant + PRIMARY_CTA), emails.ts (bookSection branches), emailSequences.ts (formatLabel), DigitalFilesTab.tsx (PRODUCTS), ExperimentsTab.tsx (option list), training content-*.ts files (checkout URLs)
- **DeepL is overal de actieve translate-engine**: 9 admin componenten gebruiken `DeepLButton`. Migratie → één `<TranslateButton>` met zelfde shape, andere backend.
- **Trainings infra al dynamisch**: `trainings` schema + `linkedProducts` + `accountCatalog` werken al voor nieuwe trainings — alleen marketing-landing-pages zijn statisch
- **`siteContent` patroon bestaat** voor home/over-ons/spreker etc — uitbreidbaar naar trainings

---

## IMPLEMENTATION PLAN

### Phase 1: Schema migratie + glossary backend

`productVariant` veld toevoegen, `translationGlossary` tabel maken, OpenRouter `aiTranslate` action bouwen — alles geïsoleerd, geen UI nog.

**Tasks**: 4 (schema, glossary mutations, aiTranslate action, env var setup)
**Why this order**: backend eerst, UI bouwt erop

### Phase 2: Glossary admin UI + tester

Admin tab met CRUD voor glossary entries en een live-tester paneel.

**Tasks**: 3 (TranslationGlossaryTab, TranslationTester, sidebar/AdminClient registratie)

### Phase 3: Migrate translation callers

Alle plekken die `DeepLButton` of `*Translate` aanroepen verhuizen naar nieuwe AI flow.

**Tasks**: 4 (refactor blogTranslate, refactor trainingTranslate, hernoem DeepLButton → TranslateButton, update 9 admin components die ButtonLook gebruiken)

### Phase 4: `productVariant` in checkout products + admin form

Schema veld is er; nu admin form-UI + backfill voor bestaande producten.

**Tasks**: 2 (CheckoutPageForm dropdown, backfill mutation)

### Phase 5: Vervang hardcoded slug-checks

Alle 7 plekken refactoren naar DB-reads via `productVariant`.

**Tasks**: 5 (DigitalFilesTab dynamisch, PRODUCT_NAMES uit DB, ExperimentsTab dropdown, bedankt/page resolveVariant, emails branches via productVariant)

### Phase 6: Dynamic marketing pages

SET/CST migreren naar siteContent, nieuwe `/training/[slug]/marketing` route, 301 redirects.

**Tasks**: 3 (siteSeed voor trainings, marketing page route, next.config.ts redirects)

### Phase 7: Validation + cleanup

Build groen, manual test, oude DeepL env vars opgeruimd.

**Tasks**: 2 (build/types/lint, manual acceptance walkthrough)

---

## STEP-BY-STEP TASKS

### Task 1: ADD `productVariant` + `translationGlossary` to `convex/schema.ts`

- **IMPLEMENT**: Op `checkoutProducts` toevoegen `productVariant: v.optional(v.union(v.literal("ebook"), v.literal("audiobook"), v.literal("hardcopy"), v.literal("online-course"), v.literal("coaching"), v.literal("event")))`. Nieuwe tabel `translationGlossary` met `termNl`, `mode: "preserve" | "translate"`, `en?`, `de?`, `caseSensitive`, `notes?`, `createdAt`, `updatedAt`. Index `by_term_lower` voor lookups.
- **PATTERN**: `digitalFiles.format` toevoeging uit recente PR
- **WHY**: Single source of truth voor product-type, geen hardcoded checks
- **VALIDATE**: `npx convex dev --once` slaagt

### Task 2: CREATE `convex/translationGlossary.ts`

- **IMPLEMENT**: Mutations `createEntry`, `updateEntry`, `deleteEntry`; query `listAll`. Alle admin-only via `requireAdmin`.
- **PATTERN**: `convex/digitalFiles.ts` voor mutation/auth patroon
- **WHY**: Backend voor admin glossary CRUD
- **VALIDATE**: typecheck slaagt

### Task 3: CREATE `convex/aiTranslate.ts` met OpenRouter

- **IMPLEMENT**: `"use node"` action `translate({ text, sourceLang, targetLang })`. Glossary-entries laden, system prompt bouwen met preserve-list + translation-rules, fetch naar `https://openrouter.ai/api/v1/chat/completions` met model `anthropic/claude-haiku-4-5-20251001`, max_tokens limit, retry op 5xx (1x). Rate limit via `rateLimiter` (`aiTranslate` cap 100/uur per admin). Error handling: graceful return `{ ok: false, error }` ipv throw.
- **PATTERN**: `convex/blogTranslate.ts` translate-flow + `convex/rateLimits.ts` patroon
- **IMPORTS**: `internal.translationGlossary.listAll`, `requireAdmin`
- **WHY**: Vervangt DeepL met AI + glossary-aware prompts
- **VALIDATE**: TypeScript groen; manual test in volgende fase

### Task 4: SET OpenRouter env var

- **IMPLEMENT**: Tim zet `OPENROUTER_API_KEY` in Convex env via `npx convex env set OPENROUTER_API_KEY ...`. Code leest 'm via `process.env.OPENROUTER_API_KEY`.
- **WHY**: Auth voor OpenRouter API calls
- **VALIDATE**: `npx convex env list` toont OPENROUTER_API_KEY

### Task 5: CREATE `src/app/admin/components/TranslationGlossaryTab.tsx`

- **IMPLEMENT**: Lijst van glossary entries; "Toevoegen" knop; per entry edit/delete. Form: NL term, radio "Niet vertalen" / "Specifieke vertaling", als specifieke → EN + DE inputs, vinkje "Hoofdletter-gevoelig", textarea "Notitie".
- **PATTERN**: `AccountCatalogTab.tsx` voor list+form structuur
- **WHY**: Admin UI om glossary te beheren
- **VALIDATE**: `/admin#translation-glossary` toont lijst, add/edit/delete werkt

### Task 6: CREATE `src/app/admin/components/TranslationTester.tsx`

- **IMPLEMENT**: Onder glossary-tabel een paneel met source-textarea, dropdown target-lang (EN/DE), "Vertaal" knop. Toont resultaat in monospaced div. Highlight matched glossary-terms (badge "via glossary"). Disabled tijdens fetch.
- **PATTERN**: bestaande inline forms in admin
- **WHY**: Klaas kan glossary tunen zonder via blog te moeten testen
- **VALIDATE**: Test fragment "Sales Excellence Training is oprecht en ontspannen" met glossary entries → output volgt regels

### Task 7: REGISTER glossary tab in sidebar + AdminClient

- **IMPLEMENT**: `AdminTab` type uitbreiden met `"translation-glossary"`; sidebar entry onder Settings sectie ("Vertaalwoordenboek"); AdminClient switch.
- **PATTERN**: bestaande tab-registratie
- **VALIDATE**: tab klikbaar vanuit sidebar

### Task 8: REFACTOR `convex/blogTranslate.ts` van DeepL naar AI

- **IMPLEMENT**: Vervang `translateText` met call naar `internal.aiTranslate.translate`. Behoud bestaande mutation-shape zodat callers ongewijzigd blijven. Verwijder DeepL fetch + auth-key code.
- **PATTERN**: bestaande translate-flow (input/output shape)
- **WHY**: Blog-vertaling werkt weer
- **VALIDATE**: Test in admin: vertaal een blogpost naar EN → resultaat verschijnt

### Task 9: REFACTOR `convex/trainingTranslate.ts` van DeepL naar AI

- **IMPLEMENT**: Zelfde patroon als task 8.
- **WHY**: Training/module-vertaling werkt weer
- **VALIDATE**: Test in admin: vertaal training titel/beschrijving

### Task 10: RENAME `DeepLButton` → `TranslateButton`

- **IMPLEMENT**: File rename + alle imports updaten (9 admin components). Visueel ongewijzigd; alleen backend roept nu AI aan.
- **PATTERN**: zelfde props-interface, andere mutation
- **WHY**: Branding klopt, geen DeepL-referentie meer
- **VALIDATE**: lint slaagt; admin componenten renderen vertaal-knop

### Task 11: ADD `productVariant` dropdown in `CheckoutPageForm.tsx`

- **IMPLEMENT**: In het Algemeen-blok van het form: dropdown "Variant" met de 6 waardes + "(geen)". Bij wijziging: state + save naar mutation.
- **PATTERN**: bestaande dropdowns in CheckoutPageForm
- **WHY**: Admin kan variant per product instellen
- **VALIDATE**: Edit een bestaand product → variant invullen → save → DB heeft veld

### Task 12: BACKFILL bestaande producten met `productVariant`

- **IMPLEMENT**: Eenmalige internal mutation `backfillProductVariants` die voor `boek-ebook`→`ebook`, `boek-luisterboek`→`audiobook`, `boek-hardcopy`→`hardcopy`, `set-online`→`online-course`, `set-coaching`→`coaching`, `cst-online`→`online-course`, `cst-coaching`→`coaching` patcht. Run via `npx convex run`.
- **WHY**: Bestaande producten krijgen variant zonder admin-werk
- **VALIDATE**: `npx convex run --prod backfillProductVariants` → alle producten hebben variant

### Task 13: REFACTOR `DigitalFilesTab.tsx` naar dynamic

- **IMPLEMENT**: Vervang hardcoded `PRODUCTS` array met `useQuery(api.checkoutProducts.listEbookProducts)` (nieuwe query die filter op `productVariant === "ebook"`). Voor elk product render het EPUB+PDF grid.
- **WHY**: Nieuw e-book krijgt automatisch upload-grid
- **VALIDATE**: Maak in admin een 2e e-book product met variant=ebook → DigitalFilesTab toont nieuw blok

### Task 14: REFACTOR `PRODUCT_NAMES` (`shared.tsx`) naar DB

- **IMPLEMENT**: Helper `useProductNames(): Record<string, string>` die `useQuery(api.checkoutProducts.listAll)` doet en map produceert van `slug → name[lang]`. Gebruik in OrdersTab, DownloadsSection, etc. Houd hardcoded fallback-map voor pre-load state.
- **WHY**: Nieuwe producten krijgen automatisch label in admin/dashboard
- **VALIDATE**: Maak nieuw product → orders-tab toont juiste label

### Task 15: REFACTOR `ExperimentsTab.tsx` product dropdown

- **IMPLEMENT**: Vervang `<option>` lijst met loop over `useQuery(api.checkoutProducts.listAll)`.
- **WHY**: Nieuw product is meteen kies-baar voor experimenten
- **VALIDATE**: Maak nieuw product → ExperimentsTab dropdown bevat 'm

### Task 16: REFACTOR `bedankt/page.tsx` `resolveVariant` via productVariant

- **IMPLEMENT**: Server-side fetch van `checkoutProducts` op slug → gebruik `productVariant` om NEXT_STEPS variant te kiezen. Als variant === "ebook" → ebook copy, etc. Fallback "training" voor onbekende variants.
- **WHY**: Bedankt-pagina automatisch correct voor nieuwe producten
- **VALIDATE**: Maak boek-tweede-titel-ebook → checkout test → bedankt-pagina toont download CTA

### Task 17: REFACTOR `buildPurchaseConfirmationHtml` via productVariant

- **IMPLEMENT**: In emails.ts: ipv `if (productSlug === "boek-ebook")` → fetch `checkoutProducts.productVariant` en branche daarop.
- **WHY**: Bevestigingsmail correct voor nieuwe producten
- **VALIDATE**: Test order op nieuw product → mail bevat juiste CTA

### Task 18: REFACTOR `formatLabel` (emailSequences.ts) via productVariant

- **IMPLEMENT**: Map nu `productVariant` → label per taal: ebook→"E-book"/"E-Book", audiobook→"Luisterboek"/"Audiobook"/"Hörbuch", etc. Lookup vanuit DB-product.
- **WHY**: `{{format}}` placeholder klopt voor nieuwe producten
- **VALIDATE**: Test sequence mail → format-label klopt

### Task 19: SEED bestaande SET/CST content naar `siteContent`

- **IMPLEMENT**: `convex/siteSeedTrainings.ts` met blocks voor `training_set-online` en `training_cst-online` (hero, forWhom, painPoints, program, etc) gebaseerd op huidige `content-{nl,en,de}.ts` bestanden.
- **PATTERN**: bestaande `siteSeedHome.ts` etc.
- **WHY**: Marketing pagina's kunnen content uit DB halen ipv hardcoded files
- **VALIDATE**: `npx convex run siteSeedTrainings:seed` → blocks zichtbaar in `/admin#content`

### Task 20: CREATE `/training/[slug]/marketing/page.tsx` dynamic route

- **IMPLEMENT**: Server component die `siteContent.training_{slug}` blocks laadt en bestaande section-componenten (TrainingHero, ForWhom, etc.) rendert. Metadata via `generateMetadata` uit DB. Hreflang voor NL/EN/DE.
- **PATTERN**: `src/app/sales-excellence-training/page.tsx` voor sectie-volgorde + bestaande dynamische `/[slug]` patronen
- **WHY**: Nieuwe trainings krijgen automatisch een marketing landing
- **VALIDATE**: `/training/set-online/marketing` toont SET marketing identiek aan oude `/sales-excellence-training`

### Task 21: REDIRECT oude marketing URLs in `next.config.ts`

- **IMPLEMENT**: 301 redirects:  
  `/sales-excellence-training` → `/training/set-online/marketing`  
  `/customer-success-training` → `/training/cst-online/marketing`  
  Behoud query params (lang etc.).
- **WHY**: SEO-equity behouden + bestaande externe links blijven werken
- **VALIDATE**: `curl -I localhost:3000/sales-excellence-training` → 301 met juiste Location header

### Task 22: BUILD + TYPES + LINT + MANUAL TEST

- **IMPLEMENT**: `npx tsc --noEmit`, `npm run lint`, `npm run build`. Manuele test:
  - Maak in admin tweede boek-product (ebook variant) + upload EPUB+PDF NL
  - Maak een derde luisterboek-training (DE)
  - Voeg glossary-entry toe ("Klaas Kroezen" preserve, "ontspannen" → "relaxed"/"entspannt")
  - Vertaal een blogpost via TranslateButton
  - Test order op nieuw product → bedankt-pagina + mail kloppen
- **VALIDATE**: alle bovenstaande items werken zonder code-aanpassing

---

## TESTING STRATEGY

### Manual Testing (geen test framework)

**Track 1 acceptance test**:
1. Admin → Producten → Betaalpagina's → "Nieuw product"
2. Vul in: slug `boek-tweede-titel-ebook`, naam, prijs, variant=`ebook`
3. Save → product staat in lijst
4. Admin → Digitale bestanden → het nieuwe product heeft eigen blok met EPUB+PDF slots
5. Upload EPUB voor NL → verschijnt
6. Test-order → bedankt-pagina + mail tonen download-CTA met juiste link
7. Dashboard toont nieuw download-bestand

**Track 2 acceptance test**:
1. Admin → Vertaalwoordenboek → "Toevoegen"
2. Term: "Klaas Kroezen", Niet vertalen, hoofdletter-gevoelig
3. Term: "ontspannen", Specifieke vertaling, EN="relaxed", DE="entspannt"
4. Tester paneel: paste "Klaas Kroezen schrijft over ontspannen verkopen"
5. Verwacht NL→EN: "Klaas Kroezen writes about relaxed selling"
6. Verwacht NL→DE: "Klaas Kroezen schreibt über entspannten Verkauf"
7. Blog admin → vertaal post → resultaat klopt met glossary

**Track 3 acceptance test**:
1. Open `/sales-excellence-training` → 301 redirect naar `/training/set-online/marketing`
2. Pagina toont identieke content (hero, forWhom, etc.)
3. Switch naar EN via vlag → content komt uit `siteContent.training_set-online.en`
4. Lighthouse / Core Web Vitals niet verslechterd

### Edge Cases (verplicht testen)

- Glossary entry zonder EN/DE waarde → AI mag vertalen (default-gedrag)
- OpenRouter API key fout → admin ziet error, geen crash
- Nieuw product zonder `productVariant` → fallback op `productType` of skip in DigitalFilesTab
- 100+ glossary entries → prompt blijft binnen token limits (chunked input?)
- Multi-word match: "Sales Excellence Training" als geheel preserveren

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
npx tsc --noEmit
npm run lint
```

**Expected**: 0 errors, 0 nieuwe warnings

### Level 2: Convex Schema

```bash
npx convex dev --once
```

**Expected**: schema migratie + nieuwe tabel + nieuwe indexes succesvol

### Level 3: Build

```bash
npm run build
```

**Expected**: alle 30+ routes builden, geen prerender warnings

### Level 4: Manual Validation

Zie testing strategy hierboven (3 acceptance tests).

---

## ACCEPTANCE CRITERIA

- [ ] Klaas kan in admin een 2e boek-product aanmaken (ebook variant) en de DigitalFilesTab toont automatisch een upload-grid voor dat product
- [ ] Klaas kan in admin een 3e luisterboek-training aanmaken (per taal) gekoppeld aan een product
- [ ] Glossary tab werkt: add/edit/delete entries; live tester toont AI-output
- [ ] DeepL is volledig vervangen — geen DeepL API calls meer
- [ ] Bestaande blog-vertalingen + training-vertalingen blijven intact (niet automatisch overschreven)
- [ ] `/sales-excellence-training` en `/customer-success-training` retourneren 301 naar nieuwe URL
- [ ] Nieuwe `/training/[slug]/marketing` route toont content uit `siteContent`
- [ ] Bedankt-pagina + bevestigingsmail kiezen variant op basis van DB-veld, niet hardcoded slug
- [ ] PRODUCT_NAMES worden uit DB gelezen — admin/dashboard tonen juiste label voor nieuwe producten
- [ ] ExperimentsTab dropdown bevat alle producten uit DB
- [ ] `npx tsc --noEmit` 0 errors; `npm run build` slaagt
- [ ] OpenRouter saldo zichtbaar afnemend bij gebruik (~$0.001 per blog vertaling)

---

## DEFERRED ITEMS

### Phase 2 Features

- **Audit log glossary wijzigingen**: wie wijzigde welke term wanneer
- **Bulk CSV import** voor glossary (handig bij migratie van 50+ termen ineens)
- **Translation memory caching** — herhaalde calls voor identieke fragmenten cachen
- **Multi-model selector** (Sonnet als premium optie naast Haiku default)
- **Productvariants `workshop` en `keynote`** als Klaas die wil verkopen
- **Her-vertaal alle bestaande content via AI met glossary** (eenmalige sweep)
- **Glossary scope-veld** (per-domein in plaats van globaal)

### Future Enhancements

- AI-suggested glossary entries op basis van veelvoorkomende namen in content
- Versie-historie per glossary-term
- Bilingual side-by-side preview in blog editor

### Known Limitations

- Plurals/inflecties zijn afhankelijk van AI-kwaliteit (gebruiken we Haiku 4.5 → goed maar niet perfect voor obscure NL-vervoegingen)
- 100/uur rate limit kan bottleneck worden bij grote bulk-vertalingen — verhoog of bypass voor specifieke admin-bulk-action
- OpenRouter outages = geen vertaling mogelijk; admin moet wachten of handmatig vertalen

---

## NOTES & CONTEXT

### Conversation Summary

- Tim wil dynamische admin voor zowel boeken als trainingen — nieuwe producten zonder code
- DeepL ligt eruit; vervangen door AI (OpenRouter) met admin-glossary
- Glossary: lijst NL termen met optionele EN/DE vertalingen; "Niet vertalen" als alternatief
- Marketing pagina's voor SET/CST naar nieuwe dynamische route, oude URLs als 301 redirects
- 1 PR ondanks groot scope (Tim's voorkeur)

### Design Rationale

- **`productVariant` als enum-veld** ipv kosmetische strings: TypeScript-veiligheid + queryable
- **Glossary in single tabel met radio-mode** ipv twee tabellen: simpler, één lookup
- **OpenRouter ipv directe Anthropic API**: één account voor multiple models, makkelijker switchen later
- **Live tester in admin**: Klaas kan glossary tunen zonder blogpost te hoeven vertalen
- **Marketing pagina's via siteContent**: bestaande infra hergebruikt, geen nieuw concept

### Assumptions Made

- Klaas heeft een OpenRouter account (of gaat aanmaken) — Tim regelt env var
- 100 vertalingen per uur per admin is genoeg (~3 blog-posts of 10 product-edits)
- Bestaande `siteContent` tabel kan training-blocks aan zonder schema-wijziging
- AI met glossary in prompt is consistent genoeg — geen post-processing regex nodig
- 301 redirects worden door Vercel correct afgehandeld

### Questions Answered

- Q: ProductVariant alleen voor boeken of breder? → A: breder (Optie B)
- Q: Glossary "niet vertalen" via radio of dummy-velden? → A: radio (Optie B)
- Q: Marketing pages bestaande URLs houden? → A: 301 redirects naar nieuwe route
- Q: Model-selector? → A: nee, vast Haiku 4.5
- Q: Bestaande DeepL vertalingen migreren? → A: laten staan
- Q: Glossary scope per domein? → A: globaal voor MVP

### For Future Reference

- Keuze "1 PR" is bewust ondanks grote scope — drie tracks hangen logisch samen, een gefaseerde merge zou tussentijds gebroken state hebben
- Glossary-architectuur is opzettelijk simpel om snel te kunnen lanceren; uitbreidingen (scope, audit, bulk) zijn deferred zonder schema-breaking changes
- Marketing-pagina migratie betekent eenmalige SEO-shuffle — Klaas moet Search Console verifiëren dat nieuwe URLs geïndexeerd worden
