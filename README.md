# Klaas Kroezen — Website

Nieuwe website voor [klaaskroezen.com](https://www.klaaskroezen.com). Vervangt de huidige Kajabi-site met een eigen stack die sneller, goedkoper en volledig in eigen beheer is.

## Live

- **Productie:** [klaaskroezen-website.vercel.app](https://klaaskroezen-website.vercel.app)
- **Convex dashboard:** [dashboard.convex.dev](https://dashboard.convex.dev/d/hardy-jaguar-483)
- **Admin panel:** `/admin` (alleen voor geautoriseerde emails)

## Tech stack

| Tool | Doel |
|---|---|
| Next.js 15 + React 19 | Frontend (App Router) |
| Tailwind CSS 4 | Styling |
| Convex | Backend (database, auth, workflows, realtime) |
| Mollie | Betalingen (iDEAL, creditcard, Apple Pay) |
| Resend | Transactionele email |
| Vercel | Hosting + deployment |

## Huidige status

### Wat werkt

- Volledige website met alle pagina's (NL + EN)
- Taalwisseling via vlag-dropdown in header
- Google login + magic link + wachtwoord
- Contactformulier met branded email bevestiging
- Admin panel met stats, bestellingen, contacten, facturen, email log
- 15 branded HTML email templates (transactioneel + sequences + marketing)
- Boek popup (scroll-triggered, frosted glass)
- Boek preview (17 pagina's bladeren)
- Mollie integratie (test key actief)
- Checkout flow met order bumps en staffelprijzen
- SEO: metadata, structured data, sitemap, robots.txt, llms.txt

### Wat tijdelijk is

- **Email from-adres** is `info@llmsolution.nl` (wordt `klaaskroezen.com` na domeinverificatie)
- **SITE_URL** staat op localhost (wordt productie-URL)
- **Mollie** draait op test key — live key nog instellen

### Wat nog moet

- Custom domein `klaaskroezen.com` koppelen
- Mollie live key instellen + end-to-end testen
- Google Analytics 4 + Microsoft Clarity activeren
- Resend domein verifiëren
- Circle integratie (trainingen + community)
- Hogere resolutie foto's

Zie [AANPAK.md](AANPAK.md) voor het volledige migratieplan met alle fases.

## Go-Live Checklist — Boek Checkout

Doorloop dit voordat je de boek-checkout (e-book / luisterboek / hardcopy) live zet.

### Convex environment

- [ ] `MOLLIE_API_KEY` switchen van `test_*` naar `live_*` (`npx convex env set MOLLIE_API_KEY live_xxxxxxxx`)
- [ ] `SITE_URL` zetten op `https://klaaskroezen.nl` (`npx convex env set SITE_URL https://klaaskroezen.nl`)
- [ ] `MOLLIE_WEBHOOK_URL` (indien handmatig gezet) updaten naar productie-URL
- [ ] `RESEND_API_KEY` is een live key
- [ ] Resend domein `klaaskroezen.nl` is geverifieerd (DKIM/SPF) en het `from`-adres is omgezet naar `info@klaaskroezen.nl`

### Admin & content

- [ ] Per taal (NL/EN/DE) is een EPUB/PDF geüpload via Admin → Producten → Digitale bestanden voor `boek-ebook`
- [ ] Per taal (NL/EN/DE) is een audiofile geüpload of de audiobook-training in Admin gepubliceerd
- [ ] Audiobook-training heeft `linkedProducts: ["boek-luisterboek"]` zodat luisterboek-kopers automatisch toegang krijgen
- [ ] Account catalog heeft entries voor `boek-ebook` (download), `boek-luisterboek` (audiobook + linkedTrainingSlug) en `boek-hardcopy` (physical)

### Juridisch & privacy

- [ ] Algemene Voorwaarden en Privacystatement zijn door een Nederlandse jurist gereviewd; concept-banner verwijderd
- [ ] Cookie-banner verschijnt in incognito op `klaaskroezen.nl`
- [ ] Klik &ldquo;Weiger&rdquo; → DevTools Network: geen requests naar `_vercel/insights` / `va.vercel-scripts.com`
- [ ] Klik &ldquo;Accepteer&rdquo; na reset → analytics laadt
- [ ] Herroepingsrecht-checkbox is verplicht op `/checkout/boek-ebook` en `/checkout/boek-luisterboek`, niet zichtbaar op `/checkout/boek-hardcopy`
- [ ] Adresvalidatie blokkeert niet-NL postcodes op hardcopy

### End-to-end test (live key, ~€1 testbedrag)

- [ ] `boek-ebook` test-order → Mollie redirect → bedankt-pagina toont download CTA → mail bevat downloadlink → dashboard toont NL-bestand
- [ ] `boek-luisterboek` test-order → bedankt-pagina linkt naar dashboard → audiobook-training is bereikbaar zonder paywall
- [ ] `boek-hardcopy` test-order → adres NL-only → bedankt-pagina toont verzendinfo → admin Bestellingen toont order met adres
- [ ] Bevestigingsmail bevat geen `{{...}}` placeholders en de juiste `{{format}}` substitutie
- [ ] Newsletter opt-in: maak een nieuwe order met opt-in checkbox aan; controleer in Admin → CRM dat het contact bestaat met tag `mailing-optin`

### Monitoring na go-live

- [ ] Mollie dashboard: webhook events komen door (geen 5xx-fouten)
- [ ] Resend dashboard: bounce-rate < 2%
- [ ] Vercel logs: geen onverwachte fouten op `/checkout/*` of `/api/mollie/webhook`

## Vercel deployment — Convex auto-deploy

Vercel draait `npm run vercel-build` als override van `npm run build`. Dat script
deployt eerst de Convex functies en draait daarna de Next.js build, zodat
frontend en backend altijd in sync gaan. Zonder deze setup kan een deploy
mismatched zijn (frontend nieuw, backend oud → server errors op queries).

**Eénmalige setup:**

1. Open Convex dashboard → het juiste project → **Settings** → **Generate Production Deploy Key**
2. Kopieer de deploy key (begint met `prod:...`)
3. Vercel dashboard → het project → **Settings** → **Environment Variables**
4. Voeg toe: `CONVEX_DEPLOY_KEY` = `<key>` met scope **Production** (én **Preview** als je previews gebruikt)
5. Redeploy: bij de volgende push naar `main` deployt Convex automatisch mee

**Verifiëren**: in de Vercel build logs zie je `Deploying convex/...` voordat de Next.js build start.

**Locale builds (`npm run build`) deployen Convex NIET** — alleen Vercel doet dit via `vercel-build`. Voor handmatige prod-deploy: `npx convex deploy --prod`.

## Development

```bash
# Install
npm install

# Run dev server + Convex
npm run dev
# In apart terminal:
npx convex dev

# Build
npm run build

# Push Convex functions
npx convex dev --once
```

## Troubleshooting

### `npx convex dev` faalt met source map / module errors

Als `npx convex dev` crasht met errors als:
- `Unexpected end of file in source map` (lege `.js.map` bestanden)
- `Could not resolve "@panva/hkdf"` of vergelijkbare module-errors
- `Cannot read file` errors in `node_modules/svix/`

Dan zijn er packages corrupt in `node_modules` (meestal door een afgebroken `npm install`).

**Fix — herinstalleer alleen de kapotte packages:**
```bash
npm install svix @stablelib/base64 jose @panva/hkdf @oslojs/encoding
npx convex dev --once
```

Als dat niet helpt, volledige herinstallatie:
```bash
mv node_modules /tmp/nm_backup_$(date +%s)
npm install
npx convex dev --once
```

> **Let op:** `rm -rf node_modules` kan vastlopen als er directories met spaties in de naam staan (npm bug). Gebruik `mv` om de map te verplaatsen in plaats van te verwijderen.

## Environment variables

### `.env.local` (Next.js)
```
CONVEX_DEPLOYMENT=dev:hardy-jaguar-483
NEXT_PUBLIC_CONVEX_URL=https://hardy-jaguar-483.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://hardy-jaguar-483.convex.site
NEXT_PUBLIC_GA4_ID=           # Google Analytics 4 (optioneel)
NEXT_PUBLIC_CLARITY_ID=       # Microsoft Clarity (optioneel)
```

### Convex environment variables
```
MOLLIE_API_KEY=               # Mollie API key (test_ of live_)
RESEND_API_KEY=               # Resend API key
SITE_URL=                     # Productie URL voor redirects
JWKS=                         # Auth JWKS
JWT_PRIVATE_KEY=              # Auth JWT private key
```

## Admin toegang

Admin panel op `/admin`. Beheerders worden beheerd via het admin panel (Instellingen tab).
De lijst wordt opgeslagen in de `adminEmails` tabel in Convex.
Bij een lege tabel wordt teruggevallen op de seed-lijst in `convex/adminAuth.ts`.

## Rollback naar Plug&Pay

Als de eigen checkout pagina's niet werken, kunnen alle koop-buttons snel worden teruggeschakeld naar Plug&Pay. De oude URLs staan hieronder per bestand:

| Bestand | Eigen checkout | Plug&Pay URL |
|---|---|---|
| `src/components/layout/Navbar.tsx` (2x) | `/checkout/set-online` | `https://klaaskroezen.plugandpay.com/checkout/checkout-online-sales-training` |
| `src/components/sections/AboutKlaas.tsx` | `/checkout/set-online` | `https://klaaskroezen.plugandpay.com/checkout/checkout-online-sales-training` |
| `src/components/sections/BookPricing.tsx` | `/checkout/boek-ebook` | `https://klaaskroezen.plugandpay.com/checkout/oprecht-en-ontspannen-sales-1762786340` |
| `src/components/sections/BookPricing.tsx` | `/checkout/boek-hardcopy` | `https://klaaskroezen.plugandpay.com/checkout/oprecht-en-ontspannen-sales` |
| `src/components/sections/BookPricing.tsx` | `/checkout/boek-luisterboek` | `https://klaaskroezen.plugandpay.com/checkout/oprecht-en-ontspannen-sales-luisterboek` |
| `src/app/sales-excellence-training/content.ts` | `/checkout/set-online` | `https://klaaskroezen.plugandpay.com/checkout/checkout-online-sales-training` |
| `src/app/sales-excellence-training/content.ts` | `/checkout/set-coaching` | `https://klaaskroezen.plugandpay.com/checkout/checkout-online-sales-training` |
| `src/app/customer-success-training/content.ts` | `/checkout/cst-online` | `https://klaaskroezen.plugandpay.com/checkout/customer-success-training` |
| `src/app/customer-success-training/content.ts` | `/checkout/cst-coaching` | `https://klaaskroezen.plugandpay.com/checkout/customer-success-training` |

Bij rollback: vervang `ButtonLink` terug naar `ButtonExternal` en `<Link>` terug naar `<a target="_blank">` in Navbar en BookPricing.

## Mappenstructuur

```
src/
  app/                    # Routes (pages, layouts)
  components/
    layout/               # Navbar, Footer, LanguageSwitcher
    sections/             # Paginasecties (Hero, TrainingCards, etc.)
    checkout/             # Checkout flow componenten
    ui/                   # Herbruikbare UI (Button, BookPopup, etc.)
    seo/                  # JsonLd, structured data
  lib/
    i18n/                 # Vertalingen (nl.ts, en.ts, server.ts)
    checkout-config.ts    # Product catalog + prijzen
convex/
  schema.ts               # Database schema
  auth.ts                 # Auth providers (Google, Resend, Password)
  adminAuth.ts            # Admin auth helpers + admin email CRUD
  mollie.ts               # Mollie payment actions (Node.js runtime)
  payments.ts             # Payment processing + invoice generation
  emails.ts               # Email sending + sequences + broadcasts
  emailTemplates.ts       # 15 branded HTML email templates
  admin.ts                # Admin queries + mutations
  users.ts                # User queries
```
