# Agent Status

## Features

| Feature | Status | Updated |
|---------|--------|---------|
| Training Platform | done | 2026-03-17 |
| Content Migratie | done | 2026-03-18 |
| AI Layout Editor | done | 2026-03-18 |
| CRM Prospects View | done | 2026-03-30 |
| Admin Image Crop Tool | done | 2026-04-01 |
| Inline Image Management | done | 2026-04-01 |
| Homepage + Remaining Images | partial | 2026-04-01 |
| Homepage Content Integration | in-progress | 2026-04-08 |
| Domeinmigratie .com → .nl | done | 2026-04-09 |
| Admin Trainings: sortable + per-lang workbook | done | 2026-04-09 |
| Admin bugfixes: Popup width, AdSpend tooltip | done | 2026-04-09 |
| Boek Checkout Go-Live | done | 2026-04-29 |
| Dynamic Admin + AI Translations | in-review (#33) | 2026-05-02 |
| Admin vertaal-bugfixes + emailadres .nl | done | 2026-05-11 |
| PDF factuur bijlage + auth + privacy | in-review (#48) | 2026-05-11 |
| Legal Completeness | done | 2026-05-01 |
| Audioboek MP3 duur + E-book downloads | done | 2026-05-11 |
| E-book downloadnaam instelbaar in admin | in-review (#53) | 2026-05-11 |
| Checkout flow: auto-login + bumps + aankoop-faillures | in-review | 2026-05-11 |
| Magic link dubbele signIn fix | in-review (#56) | 2026-05-11 |

## Current Focus
No features in progress

## Recent Activity
- 2026-05-11: Magic link dubbele signIn fix — AutoLoginClient stuurde automatisch een nieuwe link die de eerste invalideerde; nu alleen knop (#56)
- 2026-05-11: Checkout flow aankoop-faillures — access rights voor nieuwe klanten (retry job), webhook 500, PaymentVerifier timeout, magic link error-state, upsell adresvelden
- 2026-05-11: Checkout flow verbeteringen — auto-login na aankoop, bumps in mail + admin, Mollie betaalmethode vrij, /login/kopen pagina, Creditcard/Apple Pay label (#54)
- 2026-05-11: E-book downloadnaam instelbaar in admin — per EPUB/PDF eigen naam instellen, ZIP-naam afgeleid van bestandsnaam (#53)
- 2026-05-11: Audioboek MP3 duur auto-detectie — duur uit bestandsmetadata bij upload (admin), backfill via AudioPlayer bij eerste afspeel, duur tonen in admin en luisterboek-pagina
- 2026-05-11: PDF factuur bijlage — invoice PDF via @react-pdf/renderer, bijlage in bevestigingsmail, bedrijfsgegevens in admin, auth guard listInvoices, privacy link checkout, multi-download fix dashboard
- 2026-05-11: Admin vertaal-bugfixes — silent catch-blocks, ContentTab stale state, luisterboek werkboek, email klaas@klaaskroezen.nl
- 2026-05-02: Vercel build fix — vercel-build conditional zodat preview builds geen Convex deploy doen (PR #33 unblocked)
- 2026-05-01: Legal Completeness merged (#34) — herroepingsformulier, datalek-clausule, account self-service (export + delete), KvK in footer, cookie reset
- 2026-04-30: Dynamic Admin + AI Translations PR created (#33) — 38 files, productVariant refactor + OpenRouter glossary + dynamic marketing pages
- 2026-04-30: Dynamic Admin + AI Translations implementation completed — 22 taken in 7 fasen, build groen, 7 producten gebackfilled met productVariant
- 2026-04-30: Dynamic Admin + AI Translations plan created (3 tracks: productVariant refactor, OpenRouter glossary, dynamic marketing pages)
- 2026-04-30: E-book multi-format + audiobook scope split (#32) merged
- 2026-04-29: Boek Checkout Go-Live PR created (#30) — 37 files, multilingual emails + admin orders + Excel 13 kolommen
- 2026-04-29: Boek Checkout Go-Live implementation completed (12 taken, build slaagt — concept-AV/Privacy nog jurist-review pending)
- 2026-04-29: Boek Checkout Go-Live execution started (feat/boek-checkout-go-live branch)
- 2026-04-29: Boek Checkout Go-Live plan created (12 taken, juridisch + email + admin digitale bestanden + AV concept-revisie)
- 2026-04-09: Admin Trainings drag-and-drop + manual display numbers + per-lang workbook PDF
- 2026-04-09: Domeinmigratie klaaskroezen.com → klaaskroezen.nl (SITE_URL via env)
- 2026-04-09: Admin fixes — PopupTab fullwidth + Ad Spend tooltip label/format
- 2026-04-01: Homepage + Remaining Images plan created
- 2026-04-01: Inline Image Management implementation completed (Phase 1-3 + cleanup; homepage deferred)
- 2026-04-01: Inline Image Management execution started
- 2026-04-01: Inline Image Management plan created
- 2026-04-01: Admin Image Crop Tool implementation completed
- 2026-04-01: Admin Image Crop Tool plan created
- 2026-03-30: CRM Prospects View implementation completed
- 2026-03-30: CRM Prospects View execution started
- 2026-03-18: AI Layout Editor implementation completed (team build)
- 2026-03-18: AI Layout Editor execution started (team build)
- 2026-03-18: Content Migratie implementation completed
- 2026-03-18: Content Migratie execution started
- 2026-03-17: Training Platform execution started
- 2026-03-17: Training Platform implementation completed
