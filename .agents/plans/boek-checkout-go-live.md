# Feature: Boek Checkout Go-Live

## Context Note

Dit plan is gebaseerd op:
- `/prime` output van 2026-04-29 (project state, conventions uit CLAUDE.md)
- Conversatie met Tim op 2026-04-29 over het volledig live krijgen van de boek-checkout
- `codebase-analyst` audit over de checkout flow (zes dimensies: product config, end-to-end flow, bedankt + email, nieuwsbrief opt-in, juridisch, hardcopy specifics)
- Aanvullende verkenning van `digitalFiles`, `accountCatalog`, `accessRights`, `getMyDownloads`

## Feature Description

De boek-checkout (e-book, luisterboek, hardcopy) staat nu op ~80% — Mollie test key actief, code grotendeels af, maar er ontbreken juridische, content- en admin-onderdelen om dit echt live te zetten. Doel: een koper kiest een boekformaat → betaalt via Mollie → krijgt directe toegang (download voor e-book, audiobook-training voor luisterboek, verzending voor hardcopy) → ontvangt een passende bevestigingsmail → en Klaas kan via admin per taal de digitale bestanden beheren.

## User Story

Als bezoeker  
wil ik een e-book, luisterboek of fysiek boek kunnen kopen  
zodat ik direct toegang krijg tot de digitale versie of mijn fysieke exemplaar onderweg is — in mijn eigen taal — terwijl alle juridische verplichtingen (cookies, herroepingsrecht, AV) correct zijn afgehandeld.

Als beheerder (Klaas)  
wil ik per taal de EPUB/PDF en luisterboek-bestanden kunnen uploaden en beheren  
zodat kopers automatisch de juiste taalversie krijgen zonder handwerk.

## Problem Statement

1. Geen verschil tussen bevestigingen voor digitale en fysieke producten — e-book kopers krijgen "ontvang binnen 2 werkdagen" boodschap
2. Geen mechanisme om EPUB/PDF te uploaden via admin, en `digitalFiles` schema heeft geen taal-veld
3. Geen cookie consent banner (AVG/ePrivacy verplicht)
4. Geen herroepingsrecht-waiver checkbox voor digitale producten (Wet Consumentenkoop art. 6:230o lid 3)
5. `{{format}}` placeholder in `bookWelcomeNl` template wordt niet gesubstitueerd
6. Nieuwsbrief opt-in race condition: als CRM contact nog niet bestaat bij betaling → opt-in stilletjes weggegooid
7. Internationale verzending: AV zegt "gratis NL" maar checkout valideert het land niet
8. AV-tekst (172 regels) niet jurist-ready voor combinatie digitaal + fysiek

## Solution Statement

Implementeer in vijf groepen:
- **A. Juridisch + checkout-form**: cookie banner, herroepingsrecht waiver, NL-only adres
- **B. Per-booktype bevestiging**: bedankt-pagina + bevestigingsmail differentieren, `{{format}}` fix
- **C. Admin & digitale bestanden**: `digitalFiles` schema met `lang`, admin upload-tab, taalfilter in `getMyDownloads`, audiobook auto-toegang verifiëren
- **D. Nieuwsbrief + juridische teksten**: opt-in robuust + concept-revisie AV/Privacy klaar voor jurist
- **E. Go-live config**: README sectie met Mollie live key + `SITE_URL` checklist

## Feature Metadata

- **Feature Type**: Enhancement (existing flow naar production-ready)
- **Estimated Complexity**: Medium
- **Primary Systems Affected**: Checkout flow, Convex schema, admin UI, email templates, dashboard, juridische pagina's
- **Dependencies**: Geen nieuwe externe libraries — alle infra (Mollie, Resend, Convex storage) al geïnstalleerd

## Execution Strategy

**Recommended**: `/execute-small`

**Analysis**:
- Totaal taken: 12
- Onafhankelijke werkstromen: gedeeltelijk — A en C kunnen parallel, maar B raakt zowel `payments.ts` als email-templates die in volgorde moeten
- Same-file conflicten: `CheckoutClient.tsx` en `payments.ts` worden door meerdere taken aangeraakt → sequentieel veiliger

**Recommendation rationale**: 12 taken in 5 logische groepen waarvan groepen onderling sequentieel zijn (juridisch → bedankt/email → admin → opt-in/AV → go-live). Gebruik `/execute-small` voor controle en omdat meerdere taken dezelfde bestanden aanraken.

---

## DECISIONS FROM CONVERSATION

### Architecture Choices

**Luisterboek = audiobook-training, niet download**:
- Wat: Luisterboek wordt al gemodelleerd als `trainings` met `type: "audiobook"`. `boek-luisterboek` koop geeft `accessRights` → `accountCatalog` koppelt naar audiobook training in dashboard
- Why: Bestaande architectuur al werkend, audio per module met per-taal `audioStorageId` + `title.{nl,en,de}`. Geen reden om los download-mechanisme te bouwen
- Context: `convex/schema.ts:858` `trainings.type` heeft `audiobook` literal, modules hebben `audioStorageId`/`audioFileName`/`audioDurationSeconds`

**E-book = `digitalFiles` met taal-veld**:
- Wat: `digitalFiles` tabel uitbreiden met `lang` veld, één rij per (product, taal) combinatie
- Why: Tabel bestaat al (`schema.ts:129`), `getMyDownloads` (`users.ts:111`) gebruikt 'm. Minimale verandering: alleen `lang` toevoegen + filtering in query
- Context: Eenvoudiger dan een nieuwe tabel; achterwaarts compatibel als `lang` optional blijft

**Cookie banner: lichte eigen implementatie, geen externe library**:
- Wat: Eigen component dat consent in localStorage schrijft, gates Vercel Analytics + Speed Insights load
- Why: Past bij editorial/magazine design, geen extra dependency, AVG-compliant met deny + accept knoppen + link naar privacy
- Alternatief verworpen: Cookiebot/Cookiehub (€20-50/mnd, design clash)

### Phased Approach

**Phase 1 (NOW - In Scope)**:
- Cookie consent banner + herroepingsrecht waiver checkbox + NL-only adres validatie
- Bedankt-pagina + bevestigingsmail per booktype + `{{format}}` substitutie fix
- `digitalFiles.lang` + admin upload-tab + taalfilter in `getMyDownloads`
- Audiobook auto-toegang verificatie
- Nieuwsbrief opt-in robuust (contact aanmaken indien nieuw)
- AV + Privacy concept-revisie (jurist-ready)
- README go-live checklist

**Phase 2 (LATER - Deferred)**:
- Internationale verzending logica
- Tweede shipping address voor `boek-cadeau` bump (cadeau-ontvanger ander adres)
- Echte AV juridische review zelf (extern jurist-traject)
- Double opt-in mail voor nieuwsbrief

### Rejected Alternatives

**Eigen download tabel los van `digitalFiles`**: niet gekozen — bestaande tabel + index + query werken al, alleen `lang` veld nodig.

**Cookiebot / externe consent SaaS**: niet gekozen — €20-50/mnd ongewenst, design integratie kost net zoveel werk als eigen banner.

**EPUB-conversie automatisch via API**: niet gekozen — Klaas levert EPUB/PDF aan per taal, admin upload is voldoende.

**Externe nieuwsbrief tool (Mailchimp etc.)**: niet gekozen — eigen CRM `contacts` tabel is al de single source of truth, Resend doet de versturing.

### User Preferences & Constraints

**Technical Preferences**:
- Geen pushen tussentijds — alles lokaal afmaken en testen, pas pushen op expliciet verzoek (memory: `feedback_deploy_workflow.md`)
- Geen emoji in code/UI tenzij gevraagd (CLAUDE.md)
- Server Components default; `"use client"` alleen als nodig
- Alle hardcoded NL/EN strings via i18n

**Constraints**:
- 500-regel limiet per file — splits indien nodig (CLAUDE.md)
- AV juridisch reviewen door externe jurist NA deze klus, vóór go-live (geen code blocker, wel proces blocker)
- Cookie banner mag analytics niet laden vóór consent

**Quality Expectations**:
- Geen test framework geconfigureerd in dit project — manuele validatie via dev server + handmatige checkout flow per booktype
- TypeScript strict, geen `any`

### Edge Cases & Error Scenarios

- **CRM contact bestaat nog niet bij payment success + mailingOptIn**: huidige code gooit opt-in weg → fix: contact aanmaken met `mailing-optin` tag
- **Koper kiest taal X maar EPUB voor X is niet geüpload**: `getMyDownloads` toont niets → fallback naar NL (default)
- **Hardcopy koper voert niet-NL postcode in**: validatie blokkeert submit met copy "Verzending alleen binnen Nederland"
- **E-book koper vinkt herroepingsrecht waiver niet aan**: submit geblokkeerd, copy: "Bevestig dat je per direct toegang wilt"
- **Cookie banner niet beantwoord**: analytics niet geladen, banner blijft sticky tot keuze gemaakt
- **`{{format}}` substitutie**: nu letterlijk "{{format}}" in mail → fix in `emailSequences.ts` substitution map

---

## CONTEXT REFERENCES

### Relevant Codebase Files

LEZEN VOORDAT JE IMPLEMENTEERT:

- `src/components/checkout/CheckoutClient.tsx` (~750 regels)
  - `:256-257` `needsShipping` berekening (bump-aware)
  - `:258-315` `handleSubmit` met `createPendingOrder` + `createMolliePayment`
  - `:509-523` Terms + mailing opt-in checkboxes (toevoegen: herroeping waiver)
  - Pattern volgen voor nieuwe checkbox

- `src/components/checkout/CheckoutForm.tsx`
  - `:147-172` shipping address block (toevoegen: NL-only validatie + readonly land)

- `convex/payments.ts`
  - `:36` `processSuccessfulPayment` — alle post-payment side effects
  - `:131-141` `accessRights` insertions per gekocht product (pattern voor downloads)
  - `:172-180` mailing opt-in CRM patch — race conditie hier fixen

- `convex/mollie.ts`
  - `:79` MOLLIE_API_KEY env var
  - `:83-84` SITE_URL gebruikt voor redirect + webhook
  - `:102` `handleMollieWebhook`

- `convex/schema.ts`
  - `:129-134` `digitalFiles` tabel (uitbreiden met `lang`)
  - `:780-804` `accountCatalog` (al per-taal, dashboardAction)
  - `:858-900` `trainings` (audiobook variant + per-taal workbook pattern)

- `convex/users.ts`
  - `:111-147` `getMyDownloads` (taalfilter toevoegen)
  - Pattern: ophalen accessRights → join met digitalFiles → return URLs

- `convex/checkout.ts`
  - `createPendingOrder` — toevoegen: `agreedDigitalWaiver` veld voor digitale boeken

- `convex/emailTemplates.ts`
  - `:222` `bookWelcomeNl` — `{{format}}` placeholder
  - Templates per booktype splitsen of variabele substitueren

- `convex/emailSequences.ts`
  - `:177-185` substitution map — `{{format}}` toevoegen + downloadlink injectie

- `src/app/checkout/bedankt/page.tsx`
  - `:12-47` `NEXT_STEPS` object — uitbreiden met `book-ebook`, `book-luisterboek`, `book-hardcopy`
  - `:59` slug-naar-type mapping

- `src/app/algemene-voorwaarden/page.tsx` (172 regels)
  - `:84-90` huidige herroepingsclausule — uitbreiden, structureren per producttype

- `src/app/privacy/page.tsx` (195 regels) — uitbreiden met cookies sectie

- `src/app/dashboard/DownloadsSection.tsx` — werkt al, krijgt input via `getMyDownloads`

- `src/app/admin/components/AdminSidebar.tsx`
  - `:46-80` NAV — toevoegen `digital-files` tab onder Producten sectie

- `src/app/admin/components/AdminImageUpload.tsx` — pattern voor file upload via Convex storage

### New Files to Create

- `src/components/layout/CookieConsent.tsx` — banner component, `"use client"`
- `src/components/providers/AnalyticsConsent.tsx` — gate Vercel Analytics op consent
- `src/app/admin/components/DigitalFilesTab.tsx` — admin tab voor file management
- `convex/digitalFiles.ts` — list/upload/delete mutations + getUploadUrl

### Patterns to Follow

**Pattern: Convex storage upload via admin**

From: `convex/siteImages.ts` + `src/app/admin/components/AdminImageUpload.tsx`

```typescript
// Mutation: generateUploadUrl
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

// Frontend: get url → POST file → save storageId
const url = await generateUploadUrl();
const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
const { storageId } = await res.json();
await saveDigitalFile({ product, lang, storageId, fileName, fileType });
```

**Apply to**: `digitalFiles.ts` mutations + `DigitalFilesTab.tsx` upload handler

**Pattern: Per-language admin form**

From: `src/app/admin/components/CheckoutPageForm.tsx:73-95`

```typescript
const [nameNl, setNameNl] = useState(product?.name.nl ?? "");
const [nameEn, setNameEn] = useState(product?.name.en ?? "");
const [nameDe, setNameDe] = useState(product?.name.de ?? "");
```

**Apply to**: `DigitalFilesTab.tsx` — drie tabs of drie kolommen voor NL/EN/DE per product

**Pattern: Admin tab registration**

From: `src/app/admin/components/AdminSidebar.tsx:46-80`

```typescript
{ key: "digital-files", label: "Digitale bestanden", icon: I("...") }
```

Plus `AdminClient.tsx` switch toevoegen.

**Pattern: i18n via lib/i18n**

From: `src/lib/i18n/nl.ts` / `en.ts` / `de.ts`

Alle nieuwe UI-strings (cookie banner, waiver checkbox, NL-only error) toevoegen aan alle drie i18n files. Gebruik `useT()` hook of `t()` helper zoals in bestaande components.

### Key Findings from Agent Research

**From codebase-analyst audit (samengevat)**:
- Mollie flow is complete; alleen env vars verschillen prod vs test
- `getMyDownloads` (`users.ts:111`) joined al `accessRights` × `digitalFiles` op `product` slug — alleen `lang` filter ontbreekt
- `accountCatalog` (`schema.ts:780`) is al per-taal met `dashboardAction: "download" | "audiobook" | "physical"` — het routing-mechanisme bestaat
- `bookWelcomeNl` template heeft `format === "Hard Copy"` branch (`emailTemplates.ts:222`) maar substitutie werkt niet — pure substitution-fix in `emailSequences.ts:177-185`
- Geen cookie consent component vindbaar in codebase — Vercel Analytics + Speed Insights staan in `package.json`

**From inspectie van schema**:
- `digitalFiles` tabel heeft 4 velden: product, fileName, storageId, fileType — `lang` toevoegen is niet-breaking als optional
- `accessRights` is al gekoppeld via product slug — geen schemawijziging nodig voor auto-toegang

---

## IMPLEMENTATION PLAN

### Phase 1: Juridisch + Checkout Form (Tasks 1-3)

Toegevoegde compliance features blokkeren go-live als ze ontbreken. Eerst doen.

**Tasks**: Cookie banner, herroepingsrecht waiver, NL-only adres validatie

**Why this order**: zonder deze drie kan de site niet AVG-compliant draaien. Geen afhankelijkheden onderling — kunnen in volgorde geïmplementeerd worden.

### Phase 2: Per-Booktype Bevestiging (Tasks 4-5)

Bedankt-pagina + bevestigingsmail content correct krijgen voor de drie boekformaten.

**Tasks**: Bedankt-pagina differentiatie, email differentiatie + `{{format}}` fix + downloadlink injectie

**Pattern to follow**: `NEXT_STEPS` object in `bedankt/page.tsx`, `bookWelcomeNl` template in `emailTemplates.ts`

### Phase 3: Admin & Digitale Bestanden (Tasks 6-9)

Schema, admin UI, query filtering, en audiobook auto-toegang verificatie.

**Tasks**: Schema migratie, admin tab, query taalfilter, audiobook check

**Existing integration points**: `digitalFiles` tabel + `getMyDownloads` query + `accountCatalog`

### Phase 4: Nieuwsbrief & Juridisch (Tasks 10-11)

Opt-in robuust + AV/Privacy klaar voor externe jurist.

**Tasks**: Opt-in fallback, AV+Privacy concept-revisie

### Phase 5: Go-Live Config (Task 12)

Geen code, alleen documentatie + checklist.

**Tasks**: README go-live sectie

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `src/components/layout/CookieConsent.tsx` + analytics gate

- **IMPLEMENT**: Sticky banner onderin met "Accepteer" / "Weiger" / link naar privacy. Schrijft consent state naar `localStorage` (`kk-cookie-consent: "accepted" | "denied"`). Wrap `<Analytics />` en `<SpeedInsights />` zodat ze pas laden bij `accepted`.
- **PATTERN**: Editorial design — `rounded-[2px]`, `border-rule`, `text-copper` voor links, copy via `lib/i18n`
- **IMPORTS**: React `useState`/`useEffect`, `next/link`, i18n helpers
- **WHY**: AVG/ePrivacy verplicht consent vóór analytics/tracking cookies geladen worden. Geen consent banner = geen go-live mogelijk
- **VALIDATE**: `npm run dev` → bezoek pagina incognito → banner zichtbaar → klik weiger → DevTools Network: geen `_vercel/insights` requests. Klik accept → analytics laadt.

### Task 2: ADD herroepingsrecht-waiver checkbox to `CheckoutClient.tsx`

- **IMPLEMENT**: Voeg checkbox toe NA `agreedTerms` (regel ~518), alleen tonen voor digitale producten (`product.requiresShipping === false && (slug === "boek-ebook" || slug === "boek-luisterboek")`). State: `agreedDigitalWaiver`. Validate in `handleSubmit` (~regel 263). Copy NL: "Ik bevestig dat ik per direct toegang wil tot dit digitale product en ga ermee akkoord dat mijn herroepingsrecht hiermee vervalt." EN/DE equivalent in i18n. Pass `agreedDigitalWaiver` naar `createPendingOrder`. Update `pendingOrders` schema + `convex/checkout.ts` om veld te accepteren.
- **PATTERN**: Volg bestaande `agreedTerms` checkbox struktuur (`CheckoutClient.tsx:511-518`)
- **IMPORTS**: i18n keys toevoegen aan `lib/i18n/nl.ts`, `en.ts`, `de.ts`
- **WHY**: Wet Consumentenkoop art. 6:230o lid 3 vereist expliciete bevestiging dat koper akkoord gaat met directe levering en herroepingsrecht verliest
- **VALIDATE**: Open `/checkout/boek-ebook` → checkbox zichtbaar. Open `/checkout/boek-hardcopy` → checkbox NIET zichtbaar. Submit zonder waiver → blocked met error.

### Task 3: ADD NL-only adres validatie to `CheckoutForm.tsx` + `CheckoutClient.tsx`

- **IMPLEMENT**: In de shipping address block (`CheckoutForm.tsx:147-172`), zet `country` field readonly op "Nederland" (of verwijder country selector helemaal als die er nog is). Validate postcode regex `/^\d{4}\s?[A-Za-z]{2}$/` in `handleSubmit`. Toon copy "Bezorging alleen binnen Nederland — neem contact op voor andere landen."
- **PATTERN**: Bestaande field validatie in CheckoutForm
- **IMPORTS**: Geen — gebruik bestaande i18n
- **WHY**: AV zegt "gratis NL", code valideert nu niet. Voorkomt ongeldige internationale orders
- **VALIDATE**: Voer postcode "12345" in → blocked. "1234 AB" → accepted. Geen country dropdown zichtbaar bij hardcopy.

### Task 4: REFACTOR `src/app/checkout/bedankt/page.tsx` voor per-booktype messaging

- **IMPLEMENT**: Splits `NEXT_STEPS.book` (`:31-46`) in drie varianten: `boek-ebook` ("download staat klaar in je dashboard"), `boek-luisterboek` ("toegang tot het luisterboek staat in je dashboard onder Trainingen"), `boek-hardcopy` ("verzending binnen 2 werkdagen naar je adres"). Mapping op slug ipv. type. Voeg per variant een directe CTA naar dashboard of training.
- **PATTERN**: Bestaande `NEXT_STEPS` object structuur, dezelfde i18n shape
- **IMPORTS**: Lang type uit `@/lib/i18n`
- **WHY**: Generieke boodschap is misleidend voor digitale producten — koper denkt dat ze nog moeten wachten
- **VALIDATE**: Door checkout met test key per product → bedankt-pagina toont juiste copy + CTA

### Task 5: UPDATE email templates + sequence runner

- **IMPLEMENT**: 
  - In `convex/emailSequences.ts:177-185` substitution map: voeg toe `{{format}}` (vertaal `boek-ebook` → "E-book", `boek-luisterboek` → "Luisterboek", `boek-hardcopy` → "Hard Copy" per `lang`), `{{downloadUrl}}` (alleen voor digitale producten — link naar `/dashboard?lang={lang}#downloads`).
  - In `convex/emails.ts:422` `buildPurchaseConfirmationHtml`: branche op product slug, voeg per booktype een gerichte alinea toe (download CTA voor e-book, dashboard CTA voor luisterboek, verzendinfo voor hardcopy).
  - Verifieer `bookWelcomeNl` template in `convex/emailTemplates.ts:222` rendert correct met substitutie.
- **PATTERN**: Bestaande substitutie via `replace(/\{\{name\}\}/g, ...)` patroon in sequences runner
- **IMPORTS**: Geen
- **WHY**: Email moet relevant zijn per type, anders ziet koper letterlijk "{{format}}" in zijn inbox
- **VALIDATE**: Test order met `MOLLIE_API_KEY=test_*` → ontvangen mail bevat geen `{{...}}` placeholders. Drie verschillende mails per booktype.

### Task 6: MIGRATE `digitalFiles` schema met `lang` veld

- **IMPLEMENT**: 
  - In `convex/schema.ts:129` voeg toe `lang: v.optional(v.union(v.literal("nl"), v.literal("en"), v.literal("de")))`
  - Voeg index `by_product_lang` toe op `["product", "lang"]`
  - Backfill mutation in `convex/digitalFiles.ts`: bestaande rijen krijgen `lang: "nl"` (default)
- **PATTERN**: Bestaande tabel-uitbreiding zoals `trainings.workbookEn/De` (`schema.ts:874-891`)
- **IMPORTS**: Convex validators
- **WHY**: Multi-language eis — Klaas wil per taal een eigen EPUB/PDF kunnen leveren
- **VALIDATE**: `npx convex dev --once` slaagt zonder schemafout. Bestaande rijen hebben `lang: "nl"`.

### Task 7: CREATE `convex/digitalFiles.ts` + `src/app/admin/components/DigitalFilesTab.tsx`

- **IMPLEMENT**:
  - Backend (`digitalFiles.ts`): mutations `generateUploadUrl`, `saveFile({product, lang, storageId, fileName, fileType})`, `deleteFile`, query `listAll` met grouping per product/lang
  - Frontend tab: filter per product (`boek-ebook`, `boek-luisterboek`, evt later trainingen-werkboeken), per product drie kolommen NL/EN/DE met huidige file (naam + grootte + delete-knop) of upload-knop
- **PATTERN**: `src/app/admin/components/AdminImageUpload.tsx` voor upload flow; `CheckoutPageForm.tsx:73-95` voor per-taal kolommen
- **IMPORTS**: `useMutation`, `useQuery`, `api` van Convex
- **WHY**: `getMyDownloads` verwacht files maar admin kan ze niet uploaden — dood pad zonder admin UI
- **VALIDATE**: `/admin#digital-files` → upload testfile naar `boek-ebook` NL → file verschijnt → file URL werkt → delete werkt

### Task 8: REGISTER admin tab in sidebar + `AdminClient.tsx` switch

- **IMPLEMENT**: Voeg `digital-files` toe aan `AdminTab` type (`AdminSidebar.tsx:3-26`). Voeg NAV item toe in PRODUCTEN sectie (~regel 60). Render `DigitalFilesTab` in `AdminClient.tsx` switch.
- **PATTERN**: Bestaande tabs zoals `account-catalog` (`AdminSidebar.tsx:59`)
- **IMPORTS**: `DigitalFilesTab` import in `AdminClient.tsx`
- **WHY**: Tab moet bereikbaar zijn vanuit admin
- **VALIDATE**: `/admin` → "Digitale bestanden" zichtbaar in sidebar onder Producten → klik laadt tab

### Task 9: UPDATE `convex/users.ts` `getMyDownloads` met taalfilter + verifieer audiobook auto-toegang

- **IMPLEMENT**: 
  - `getMyDownloads` (`users.ts:111`): args toevoegen `{ lang: v.optional(v.union(v.literal("nl"), v.literal("en"), v.literal("de"))) }`. In handler: filter `digitalFiles` op `lang === args.lang || lang === undefined` met fallback naar NL als specifieke taal niet bestaat
  - Verifieer in `payments.ts:131` dat bij `boek-luisterboek` aankoop een `accessRights` rij komt met `resource: "boek-luisterboek"`. Verifieer in `accountCatalog` dat luisterboek `dashboardAction: "audiobook"` heeft + `linkedTrainingSlug`. Test: koop boek-luisterboek → check dashboard → audiobook-training is bereikbaar
- **PATTERN**: Bestaande accessRights → digitalFiles join + `accountCatalog` lookup
- **IMPORTS**: Convex validators
- **WHY**: NL koper krijgt nu alle taalvarianten in dashboard. Audiobook auto-toegang moet werken zonder admin-handmatige stap
- **VALIDATE**: 
  - DownloadsSection toont alleen NL-bestanden voor NL gebruiker
  - Test order voor luisterboek → log in → dashboard → klik audiobook → training opent zonder paywall

### Task 10: FIX nieuwsbrief opt-in race in `convex/payments.ts:172-180`

- **IMPLEMENT**: Vervang de huidige patch-bestaand-contact logica met: zoek contact op email → indien geen contact → `ctx.runMutation(internal.crm.upsertContact, {...})` met `tags: ["mailing-optin"]`, `unsubscribed: false`. Indien wel contact → patch zoals nu.
- **PATTERN**: Bestaande `crm.upsertContact` of equivalent in `convex/crm.ts`
- **IMPORTS**: `internal` van `_generated/api`
- **WHY**: Race conditie verliest opt-in als CRM hook nog niet gedraaid heeft. Onder AVG moet expliciete consent vastgelegd worden
- **VALIDATE**: Verwijder bestaand contact uit DB, doe nieuwe order met opt-in checkbox aan, na betaling → contact bestaat met `mailing-optin` tag

### Task 11: REWRITE `src/app/algemene-voorwaarden/page.tsx` + `src/app/privacy/page.tsx` (jurist-ready)

- **IMPLEMENT**: 
  - **AV**: structureer in artikelen — definities, toepasselijkheid, totstandkoming overeenkomst, prijzen + betaling (Mollie, BTW), levering (digitaal vs fysiek), herroepingsrecht (14 dagen fysiek, vervalt bij toegang digitaal — verwijs naar checkout-waiver), klachten + geschillencommissie thuiswinkel, aansprakelijkheid, intellectueel eigendom (boek/audio niet kopiëren), toepasselijk recht NL. Min ~350 regels.
  - **Privacy**: structureer met verwerkingsdoelen + grondslagen (uitvoering overeenkomst, gerechtvaardigd belang, toestemming), verwerkers (Mollie, Resend, Vercel, Convex), bewaartermijnen (orders 7 jaar fiscaal, marketingdata tot opt-out), AVG-rechten (inzage/correctie/verwijdering/dataportabiliteit/bezwaar), cookies (functioneel, analytics na consent), klachten bij AP. Min ~300 regels.
- **PATTERN**: Bestaande pagina-structuur met `lang` prop, `lib/i18n/server` voor copy
- **IMPORTS**: `getLang` of equivalent, `metadata` export
- **WHY**: Huidige tekst is te kort voor consumenten-shop met digitaal + fysiek combinatie. Externe jurist krijgt klare basis ipv. lege canvas — bespaart ~1-2 uur reviewtijd
- **VALIDATE**: `/algemene-voorwaarden` en `/privacy` renderen zonder fouten in NL/EN/DE. Headings hebben anchors. Tekst is concept (mag niet zonder jurist-review live).
- **NOTE**: Externe jurist moet dit reviewen voor go-live — zet duidelijk in PR-beschrijving en `STATUS.md` als pending blocker.

### Task 12: UPDATE `README.md` met go-live checklist

- **IMPLEMENT**: Voeg sectie "Go-Live Checklist" toe met:
  - [ ] `MOLLIE_API_KEY` in Convex dashboard switchen van `test_*` naar `live_*`
  - [ ] `SITE_URL` in Convex dashboard zetten op `https://klaaskroezen.nl`
  - [ ] `MOLLIE_WEBHOOK_URL` (indien gezet) updaten naar productie
  - [ ] Resend domein `klaaskroezen.nl` verifiëren + `from`-adres switchen
  - [ ] AV + Privacy door externe jurist laten reviewen
  - [ ] Test order maken met live key (~€1 product) → webhook ontvangen → mail ontvangen → factuur gegenereerd
  - [ ] Cookie consent gedrag verifiëren in incognito
  - [ ] Per booktype een test-order doen, end-to-end
- **PATTERN**: Bestaande README structuur (sectie "Wat nog moet")
- **IMPORTS**: N.v.t.
- **WHY**: Voorkomt vergeten config-stappen; geeft Tim/Klaas een concrete checklist voor switch-day
- **VALIDATE**: README renderen op GitHub → checklist klikbaar/zichtbaar

---

## TESTING STRATEGY

### Manual Testing (geen test framework in project)

**Per booktype een test-order draaien (Mollie test key)**:
- `boek-ebook`: incognito → checkout → herroeping waiver checkbox aanwezig + verplicht → submit → Mollie test → bedankt-pagina toont download CTA → mail in inbox met downloadlink → log in → dashboard → DownloadsSection toont NL EPUB → file werkt
- `boek-luisterboek`: zelfde + dashboard toont audiobook-training onder Trainingen → klik → audiobook speelt
- `boek-hardcopy`: checkout vraagt adres NL-only → submit → bedankt-pagina toont verzendinfo → mail bevat verzendinfo → admin Bestellingen toont order met adres

**Cookie banner**:
- Incognito → banner verschijnt → klik weiger → reload → banner weg, geen analytics requests
- Reset localStorage → klik accept → analytics laadt

**Newsletter opt-in**:
- Test 1: bestaand contact → opt-in tagged
- Test 2: nieuwe email → contact aangemaakt met tag

### Edge Cases

- E-book in EN: upload alleen NL EPUB → EN gebruiker krijgt fallback NL
- Hardcopy + bump e-book: shipping address verschijnt + downloadlink in mail voor bump
- 100% korting (€0 order): bestaande free-order flow blijft werken voor boek

### Test Patterns to Follow

- `npm run dev` voor lokaal testen
- `npx convex dev` voor backend functie reload
- Manuele inspectie via DevTools Network voor analytics gating

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
# TypeScript type checking
npx tsc --noEmit

# Linting
npm run lint
```

**Expected**: 0 errors, 0 warnings

### Level 2: Convex Schema

```bash
npx convex dev --once
```

**Expected**: schema-migratie slaagt, geen rode logs in Convex dashboard

### Level 3: Build

```bash
npm run build
```

**Expected**: build slaagt, geen prerender warnings op nieuwe pagina's

### Level 4: Manual Validation

1. Per booktype een test-order draaien (zie Testing Strategy)
2. Cookie banner gedrag verifiëren
3. Newsletter opt-in scenarios testen
4. AV + Privacy pagina's lezen op compleetheid
5. README checklist controleren

---

## ACCEPTANCE CRITERIA

- [ ] Cookie consent banner zichtbaar pre-consent, blokkeert analytics
- [ ] Herroepingsrecht waiver verplicht voor `boek-ebook` + `boek-luisterboek`, niet zichtbaar bij `boek-hardcopy`
- [ ] Adres velden accepteren alleen NL postcode (regex)
- [ ] Bedankt-pagina toont booktype-specifieke copy (download / audiobook / verzending)
- [ ] Bevestigingsmail bevat geen `{{...}}` placeholders, juiste `{{format}}` substitutie, downloadlink voor digitale producten
- [ ] `digitalFiles` heeft `lang` veld, admin kan upload/delete per (product, taal)
- [ ] `getMyDownloads` toont alleen taalvariant van ingelogde gebruiker
- [ ] Boek-luisterboek aankoop opent automatisch audiobook-training in dashboard
- [ ] Newsletter opt-in maakt CRM contact aan indien nog niet bestaand
- [ ] AV + Privacy pagina's >300 regels, gestructureerd in artikelen, jurist-ready (markeer als concept)
- [ ] README go-live checklist staat onder "Wat nog moet"
- [ ] Geen TypeScript errors, geen lint warnings, build slaagt
- [ ] Geen regressies in bestaande training/checkout flows

---

## DEFERRED ITEMS

### Phase 2 Features
- **Internationale verzending**: blok niet-NL adressen voorlopig — andere landen post-MVP met carrier rate-shopping (DHL/PostNL API)
- **Tweede shipping address voor boek-cadeau bump**: cadeau-ontvanger ander adres dan koper — UX/architectuur keuze later
- **Double opt-in mail voor nieuwsbrief**: extra bevestigingsstap met `confirmation_token` — verhoogt deliverability, maar niet wettelijk vereist bij purchase-flow consent
- **AV juridische review zelf**: extern jurist-traject na deze klus

### Future Enhancements
- Boek-bumps in andere talen dan hoofdproduct (bijv. NL hardcopy + EN ebook bump)
- Webhook → fulfillment partner voor hardcopy automatisch
- AI summarisation van AV/Privacy in plain text per pagina

### Known Limitations
- Cookie banner gebruikt `localStorage`, niet cookie — bewust gekozen (geen extra cookie pre-consent)
- AV/Privacy concept nog niet juridisch beoordeeld — go-live blocker tot extern reviewed
- Mollie webhook lokaal niet bereikbaar zonder tunnel (ngrok)

---

## NOTES & CONTEXT

### Conversation Summary

- Tim wil de boek-checkout volledig live krijgen voor drie producten: e-book, luisterboek, hardcopy
- Bevestiging + email moeten differentiëren per booktype
- Newsletter opt-in moet werken
- Cookie + algemene voorwaarden + herroeping juridisch correct
- Admin moet bestanden per taal kunnen beheren
- Auto-toegang via dashboard zonder handwerk
- AV juridisch laten reviewen is wel nodig voor go-live (externe jurist)

### Design Rationale

- **Eigen cookie banner**: editorial design + geen €/mnd
- **`digitalFiles.lang` ipv. nieuwe tabel**: minimale wijziging, achterwaarts compatibel
- **Luisterboek = audiobook training**: bestaand pattern hergebruiken
- **Concept-revisie AV ipv. vanaf nul**: bespaart jurist tijd, Tim kan inhoud beoordelen vóór externe review

### Assumptions Made

- Klaas levert EPUB/PDF aan per taal — geen automatische conversie
- NL-only verzending is acceptabel voor go-live (internationaal later)
- Mollie test key blijft tot expliciete switch in Convex env
- Geen e2e tests gewenst (geen framework geconfigureerd)

### Questions Answered

- Q: Multi-language voor digitale bestanden? → A: Ja, `digitalFiles` schema krijgt `lang` veld
- Q: Luisterboek download of streaming? → A: Streaming via bestaande audiobook-training (modules met `audioStorageId`)
- Q: AV juridische review? → A: Tim wil externe jurist; ik schrijf concept-revisie ter voorbereiding (optie B)
- Q: Internationale verzending? → A: Out of scope, blokkeer niet-NL adressen
- Q: Boek-cadeau 2e shipping address? → A: Out of scope

### For Future Reference

- De combinatie "luisterboek = training met type audiobook" is een bewuste keuze om audio-content te kunnen modulariseren (per hoofdstuk, met bookmarks etc.) — niet alleen een grote MP3 download
- De `accountCatalog` is per-taal geconfigureerd zodat dezelfde checkoutProduct in verschillende talen anders kan tonen op het dashboard
- Cookie consent kiest bewust localStorage boven cookies om geen pre-consent cookies te zetten
- Externe jurist-review is wettelijk verstandig maar geen technische blocker — alleen proces blocker voor finale go-live
