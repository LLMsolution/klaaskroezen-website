# Stack Strategie — Klaas Kroezen
*Volledig migratieplan van huidige stack naar nieuwe architectuur*

---

## Huidige situatie

| Tool | Kosten |
|---|---|
| Kajabi | €300/mnd |
| Plug&Pay | €50/mnd |
| ActiveCampaign | €150/mnd |
| **Totaal** | **€500/mnd = €6.000/jaar** |

**Pijnpunten huidige stack:**
- Kajabi heeft geen Headless API — trainingen en community kunnen niet in eigen site geïntegreerd worden
- Kajabi heeft geen native iDEAL — Nederlandse klanten haken af bij checkout
- Kajabi community is een nagekomen feature, niet de kern van het platform
- Plug&Pay is overbodig zodra Mollie direct geïntegreerd is
- Klantdata zit verspreid over externe tools, niet in eigen beheer
- Slechte Core Web Vitals door Kajabi overhead — SEO nadeel
- Als de developer vertrekt, kan de eigenaar niet zelfstandig verder op eigen code

---

## Nieuwe stack

| Tool | Doel | Kosten |
|---|---|---|
| Next.js + Vercel | Frontend + hosting | ~€20/mnd |
| Convex | Database, auth, workflows, realtime | ~€25/mnd |
| Circle Business | Trainingen, community, live events | €199/mnd |
| Mollie | iDEAL, Bancontact, creditcard | 1.8% per transactie |
| Resend | Transactionele e-mail | €0–20/mnd |
| Cloudflare Turnstile | CDN + CAPTCHA bescherming | Gratis |
| **Totaal** | | **~€265/mnd** |

**Besparing: €235/mnd = €2.820/jaar**

---

## Waarom deze keuzes

### Next.js + Vercel
- Uitstekende Core Web Vitals en SEO performance
- Volledige controle over design en URL-structuur
- Statische pagina's laden razendsnel
- Werkt naadloos samen met Convex en Circle API
- Vercel bouwt automatisch een preview URL bij elke wijziging

### Convex (boven Supabase)
- Developer kent beide — geen leercurve
- Ingebouwde workflow engine voor e-mailflows na aankoop
- Reactieve queries — admin dashboard werkt vanzelf realtime
- Auth ingebouwd met magic links, Google, Apple, GitHub
- Vector search ingebouwd voor toekomstige AI chatbot
- TypeScript end-to-end — geen context switch
- Lokale versie beschikbaar — vendor lock-in risico is nul
- Één systeem voor alles in plaats van losse tools

### Circle Business (boven Kajabi voor community)
- Community-first platform: training én community als één geheel, zelfde login
- Eigenaar beheert zelfstandig: trainingen, community, live events zonder developer
- Headless API + Custom SSO beschikbaar (alleen Business plan) — vereist voor Mollie koppeling
- Spaces per stuk instelbaar: public, invite-only of private met slotje
- Kleuren en huisstijl aanpasbaar in de instellingen

**Circle nadelen (bewust geaccepteerd):**
- Alleen Stripe ingebouwd — opgelost via eigen Mollie checkout + Circle API
- Certificaten niet ingebouwd — zelf bouwen via webhook indien gewenst
- Prijs van een betaald event zit niet in de API response — wordt eenmalig ingevoerd in eigen admin dashboard

### Mollie (boven Plug&Pay)
- Native iDEAL, Bancontact, creditcard
- Klantdata blijft in eigen systeem (Convex)
- Lagere transactiekosten dan via tussenpersoon
- Directe webhook integratie met Convex

### Resend
- Goedkoop en developer-friendly
- Werkt naadloos samen met Convex workflows
- Vervangt ActiveCampaign voor transactionele mails

---

## Architectuur

### Taakverdeling

**Eigenaar beheert zelfstandig (no-code) via Circle:**
- Trainingen toevoegen en bewerken
- Modules en lessen aanmaken
- Community modereren
- Leden beheren
- Live events plannen en hosten
- Gratis en betaalde content instellen

**Systeem beheert automatisch via Convex:**
- Betalingen registreren
- Klantaccounts aanmaken
- Toegang verlenen tot juiste Circle spaces
- Facturen genereren
- E-mailflows uitvoeren

**Developer bouwt eenmalig:**
- Next.js website en landingspagina's
- Mollie checkout integratie
- Convex datastructuur en workflows
- Circle API koppeling
- Admin dashboard voor Klaas
- Telegram deployment pipeline

---

### Betaalflow

```
Klant koopt op klaaskroezen.nl
→ Mollie iDEAL checkout
→ Mollie webhook → Convex workflow start
→ Convex: account aanmaken/koppelen + betaling registreren + factuur genereren
→ Circle API: toegang verlenen tot juiste spaces
→ Resend: welkomstmail + toegangslink
→ Klant logt in op klaaskroezen.nl → ziet dashboard met alle aankopen
```

---

### Authenticatie en wachtwoorden

**Eerste aankoop:**
Klant vult alleen e-mail in bij aankoop → ontvangt magic link → klikt → direct binnen. Geen wachtwoord aanmaken vereist.

**Later (optioneel):**
Klant gaat naar accountinstellingen → stelt wachtwoord in → voortaan inloggen met e-mail + wachtwoord.

**SSO naar Circle:**
Via Convex wordt automatisch een JWT token aangemaakt. Klant logt in op klaaskroezen.nl en ziet Circle content zonder apart Circle loginscherm. Één wachtwoord, één plek.

---

### Toegangsniveaus (voorbeeld)

| Niveau | Wat klant krijgt |
|---|---|
| Boek gekocht | Gratis maandelijkse live sessie |
| Starter training | Bovenstaande + 1 cursus |
| Pro training | Alles + meerdere cursussen |

Aankoop via Mollie → Convex registreert → Circle API verleent automatisch toegang tot juiste spaces. Upgrade? Extra spaces worden automatisch toegevoegd.

---

### E-mail architectuur

**Laag 1 — Automatische flows (Convex + Resend, eenmalig gebouwd):**
```
Klant koopt boek → Convex workflow:
├── Direct:  bestelbevestiging + downloadlink
├── Dag 2:   "Heb je al een kijkje genomen?"
├── Dag 5:   tip uit het boek
├── Dag 10:  uitnodiging live training
└── Dag 14:  herinnering plek reserveren
```

**Laag 2 — Broadcasts door Klaas zelf (eigen admin dashboard):**
- Klaas maakt mail in Canva → exporteert HTML → plakt in eigen admin dashboard
- Kiest doelgroep op basis van aankoopdata in Convex:
  - Iedereen / alleen e-boek kopers / alleen luisterboek / alleen training X / etc.
- Kiest timing: nu / specifieke datum / herhaling
- Convex + Resend verwerkt alles op achtergrond

---

### Events en webinars

```
Klaas maakt event aan in Circle (naam, datum)
→ Klaas voert prijs in eigen admin dashboard in
→ Next.js homepage pikt event automatisch op via Circle API
→ Event verschijnt op homepage met "Schrijf in" knop
→ Klant klikt → betaalpagina (automatisch gegenereerd)
→ Klant betaalt via Mollie
→ Convex registreert betaling
→ Circle API verleent toegang tot dat specifieke event
→ Resend stuurt bevestigingsmail + link
```

**Opmerking:** Prijs zit niet in de Circle API response. Wordt daarom eenmalig ingevoerd in het eigen admin dashboard naast het aanmaken in Circle.

---

### Telegram deployment pipeline

```
Klaas stuurt prompt in Telegram
→ Bot controleert user ID (beveiliging)
→ GitHub Action start → Claude Code leest CLAUDE.md
→ Claude maakt feature branch + wijziging
→ Vercel bouwt preview URL automatisch
→ Telegram stuurt preview URL terug naar Klaas
→ Klaas stuurt ✅ of ❌
→ Bij ✅: merge naar main → Vercel productie deploy
→ Telegram: "🚀 Live op klaaskroezen.nl!"
→ Bij ❌: branch verwijderd, niets gewijzigd
```

**Wat Klaas zelf kan via Telegram:**
Tekst en prijzen aanpassen, nieuwe landingspagina's, afbeeldingen, testimonials, kortingsacties, blog posts.

**Blijft developer werk:**
Betaalmethoden, Convex datamodel, Circle API koppelingen, architectuurwijzigingen.

**GitHub Secrets nodig:**
`ANTHROPIC_API_KEY`, `VERCEL_TOKEN`, `CONVEX_PROD_DEPLOY_KEY`, `CONVEX_DEV_DEPLOY_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_ALLOWED_USER_ID`

---

### Circle plan — limitaties Business ($199/mnd)

**Wat inbegrepen is en nodig is:**
- Headless API + Admin API ✅
- Custom SSO ✅
- Unlimited members ✅
- Unlimited workflows en automations ✅
- Unlimited spaces en cursussen ✅
- Huisstijl aanpassen (kleuren, logo, lettertypen) ✅

**Bewuste beperkingen:**
- 2% transactiekosten op Circle's eigen betaalsysteem — niet van toepassing want wij gebruiken Mollie
- Certificaten niet ingebouwd — zelf te bouwen via webhook indien gewenst
- E-mail marketing is betaalde add-on — niet nodig want wij gebruiken Resend
- API rate limit: 2000 requests per 5 minuten — ruim voldoende

---

### SEO migratie van Kajabi naar Next.js

**Voordelen Next.js boven Kajabi:**
- Uitstekende Core Web Vitals vs. matige performance bij Kajabi
- Volledige metadata controle
- Structured data / Schema.org volledig instelbaar
- URL structuur volledig zelf bepalen
- robots.txt en sitemap volledig configureerbaar
- llms.txt mogelijk (niet bij Kajabi)

**Migratieplan:**
1. Vóór migratie: crawl alle Kajabi URLs (Screaming Frog)
2. Vóór migratie: exporteer rankings uit Google Search Console
3. Tijdens bouwen: behoud URL structuur zoveel mogelijk
4. Tijdens bouwen: 301 redirects instellen in next.config.js voor gewijzigde URLs
5. Go-live: nieuwe XML sitemap indienen in Search Console
6. Go-live: Fetch as Google voor top 20 pagina's
7. 4–6 weken monitoring

Zonder plan: 30–50% traffic verlies mogelijk. Met plan: max 5% tijdelijke daling.

---

### Leadinfo

Leadinfo werkt via IP-herkenning gekoppeld aan een bedrijfsdatabase. Dit is niet zelf na te bouwen omdat de database het product is.

**Light versie wel mogelijk:**
IPinfo API integreren in Next.js → IP van bezoeker → bedrijfsnaam + domein → opslaan in Convex → zichtbaar in admin dashboard.

**Advies:** Leadinfo voorlopig aanhouden zolang actief B2B verkoop plaatsvindt. Na go-live van eigen admin dashboard opnieuw beoordelen of Leadinfo nog meerwaarde heeft boven de eigen data in Convex.

---

## Migratiefases

### Fase 1 — Fundament: Next.js + Vercel + Convex datastructuur
Next.js website bouwen en live zetten op Vercel. Convex opzetten met de datastructuur voor gebruikers, aankopen en toegangsrechten — nog niet actief in gebruik maar klaar voor fase 2. Homepage, landingspagina's, alles in eigen huisstijl. De "Koop nu" knoppen linken nog door naar Plug&Pay. Kajabi levert nog de trainingen. Bezoekers zien de nieuwe site, de backend verandert nog niks. **Nul risico.**

**Status: ✅ ~95% klaar**

| Onderdeel | Status |
|---|---|
| Next.js 15.5 + Tailwind CSS 4 + Turbopack | ✅ Klaar |
| Convex schema (users, purchases, accessRights, pendingOrders, invoices, etc.) | ✅ Klaar |
| Convex auth (Google, Apple, magic links, wachtwoord) | ✅ Klaar |
| Alle pagina's (homepage, SET, CST, spreker, boek, over-ons, contact, login) | ✅ Klaar |
| SEO: metadata, OG images, structured data, sitemap, robots.txt, llms.txt | ✅ Klaar |
| Redirects voor oude Kajabi-URLs | ✅ Klaar |
| Juridisch: privacy, algemene voorwaarden | ✅ Klaar |
| Contact form backend (Convex + Resend) | ✅ Klaar |
| Vercel project aanmaken + deployen | ❌ Nog te doen (`vercel login` nodig) |
| Custom domein `klaaskroezen.nl` + DNS migratie | ❌ Nog te doen |
| Hogere resolutie foto's | ❌ Nog te doen (bronbestanden fotograaf nodig) |
| Spreker video URL (placeholder-mindset) | ❌ Nog te doen (content van Klaas nodig) |

---

### Fase 2 — Betaling: Mollie erin, Plug&Pay eruit
Eigen betaalpagina's bouwen in Next.js met Mollie. Convex authenticatie en magic links activeren. Convex ontvangt de Mollie webhook na betaling, registreert de aankoop, stuurt een bevestigingsmail via Resend en geeft de klant nog steeds toegang via Kajabi. Eerst parallel testen naast Plug&Pay. Zodra één volledige aankoop foutloos werkt van begin tot eind: Plug&Pay loskoppelen.

**Besparing: €50/mnd**

**Status: ⚠️ ~60% klaar — code gebouwd, Mollie API key ontbreekt**

| Onderdeel | Status |
|---|---|
| Checkout pagina's (`/checkout/[product]`) met order bumps, reviews, social proof, NL/EN | ✅ Klaar |
| `convex/payments.ts` — volledige betaalflow (aankoop → factuur → access → email) | ✅ Klaar |
| `convex/checkout.ts` — pending orders, BTW berekening, kortingscode validatie | ✅ Klaar |
| Webhook route `/api/webhooks/mollie` | ✅ Klaar |
| Factuursysteem met sequentiële nummering (KK-YYYY-NNNN) | ✅ Klaar |
| Factuur HTML view + print-to-PDF (`/api/invoice/[id]`) | ✅ Klaar |
| Klant dashboard (`/dashboard`) met aankopen, downloads, facturen | ✅ Klaar |
| Bedankt-pagina (`/checkout/bedankt`) NL/EN | ✅ Klaar |
| Mollie SDK installeren (`@mollie/api-client`) | ❌ Nog te doen |
| `MOLLIE_API_KEY` instellen als Convex env var | ❌ Nog te doen |
| `createMolliePayment` activeren (uncomment in payments.ts) | ❌ Nog te doen |
| `handleMollieWebhook` activeren (uncomment in payments.ts) | ❌ Nog te doen |
| CTA knoppen omzetten: Plug&Pay URLs → `/checkout/...` | ❌ Nog te doen |
| `SITE_URL` env var instellen | ❌ Nog te doen |
| Parallel testen naast Plug&Pay | ❌ Nog te doen |

---

### Fase 3 — Community en trainingen: Circle erin, Kajabi eruit
Circle opzetten in eigen huisstijl. Trainingen één voor één overzetten van Kajabi naar Circle. SSO koppelen via Convex zodat bestaande klanten inloggen met hetzelfde account. Convex regelt via de Circle API automatisch welke klant toegang krijgt tot welke spaces op basis van aankopen. Pas als alles overstaat en getest is: Kajabi opzeggen.

**Besparing: €300/mnd**

**Status: ❌ 0% — niet begonnen**

| Onderdeel | Status |
|---|---|
| Circle Business account aanmaken + huisstijl instellen | ❌ Nog te doen |
| Circle SDK/API client opzetten (API key, base URL) | ❌ Nog te doen |
| SSO implementeren (JWT token generatie in Convex → Circle Custom SSO) | ❌ Nog te doen |
| Space mapping bouwen (product slug → Circle space ID) | ❌ Nog te doen |
| `grantCircleAccess` functie na betaling (Circle API: user toevoegen aan space) | ❌ Nog te doen |
| Training content migratie (Kajabi modules → Circle courses) | ❌ Nog te doen (content van Klaas nodig) |
| Testen bestaande klant login + toegang | ❌ Nog te doen |

---

### Fase 4 — E-mail: Resend + admin dashboard erin, ActiveCampaign eruit
Automatische e-mailflows bouwen in Convex met Resend. Opvolgmails na elke aankoop, herinneringen, uitnodigingen. Admin dashboard bouwen zodat Klaas zelfstandig broadcasts kan sturen aan segmenten op basis van aankoopdata in Convex. Bestaande ActiveCampaign flows nabootsen en minstens twee weken parallel draaien. Dan pas ActiveCampaign opzeggen.

**Besparing: €150/mnd**

**Status: ✅ ~90% klaar — code gebouwd, Resend API key ontbreekt**

| Onderdeel | Status |
|---|---|
| `convex/emails.ts` — Resend integratie, sendEmail, emailWrapper, templates | ✅ Klaar |
| Email sequenties (dag 2, 5, 10, 14) voor training en boek, NL/EN | ✅ Klaar |
| Bewerkbare email templates in admin (NL + EN, preview, aan/uit, delay) | ✅ Klaar |
| Broadcasts met segment filtering (alle, training, boek, SET, CST) | ✅ Klaar |
| Abandoned cart reminders | ✅ Klaar |
| Email tracking: open pixel + click tracking via API routes | ✅ Klaar |
| `emailEvents` tabel met individuele open/klik events + IP/user agent | ✅ Klaar |
| Admin dashboard: overzicht, bestellingen, contacten, facturen, winkelmandjes, sequenties, broadcasts, e-mails, kortingscodes | ✅ Klaar |
| Contacten tab (mailing lijst) met engagement stats per contact | ✅ Klaar |
| E-mails tab met open rate, click rate, preview | ✅ Klaar |
| `RESEND_API_KEY` instellen als Convex env var | ❌ Nog te doen |
| Resend domein verifiëren (SPF/DKIM DNS records) | ❌ Nog te doen |
| Unsubscribe link in broadcasts (wettelijk verplicht) | ❌ Nog te doen |
| ActiveCampaign flows vergelijken + 2 weken parallel draaien | ❌ Nog te doen |

---

### Fase 5 — Telegram deployment pipeline
GitHub Actions instellen. Telegram bot koppelen. Klaas kan vanaf zijn telefoon tekstwijzigingen, nieuwe landingspagina's en prijsaanpassingen doorvoeren via een prompt in Telegram. Systeem bouwt een preview, Klaas keurt goed of af, bij goedkeuring gaat het live. Developer werk blijft vereist voor architectuurwijzigingen.

**Status: ❌ ~10% — GitHub Actions aanwezig, geen Telegram integratie**

| Onderdeel | Status |
|---|---|
| GitHub Actions (eslint, playwright, security) | ✅ Klaar |
| Telegram bot aanmaken (BotFather, token) | ❌ Nog te doen |
| GitHub Action: Claude Code workflow (prompt → branch → PR → preview) | ❌ Nog te doen |
| Telegram webhook handler (Vercel serverless) | ❌ Nog te doen |
| Goedkeuringsflow (✅ merge / ❌ branch verwijderen) | ❌ Nog te doen |
| GitHub Secrets instellen (ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN, etc.) | ❌ Nog te doen |

---

### Fase 6 — Events: betaalde webinars automatiseren
Circle event aanmaken → prijs invoeren in admin dashboard → Convex pikt event op via Circle API → event verschijnt automatisch op de homepage met koopknop → klant betaalt via Mollie → Convex verleent toegang tot het specifieke event in Circle → bevestigingsmail via Resend. Volledig automatisch na eenmalige setup.

**Status: ❌ ~5% — alleen cohorts tabel in schema**

| Onderdeel | Status |
|---|---|
| `cohorts` tabel in Convex schema (training, startDate, maxParticipants) | ✅ Klaar |
| Basis cohort queries in `convex/checkout.ts` | ✅ Klaar |
| Circle event integratie (ophalen via API) | ❌ Nog te doen (vereist Fase 3) |
| Automatische betaalpagina generatie voor events | ❌ Nog te doen |
| Event admin (prijs invoeren, beheren) | ❌ Nog te doen |
| Event op homepage tonen | ❌ Nog te doen |

---

### Fase 7 — Agenda koppeling: Outlook + booking pagina, Calendly eruit
Eigen bookingpagina bouwen op `/plan-een-gesprek`. Koppeling met Klaas z'n Outlook agenda via Microsoft Graph API. Bezoekers zien beschikbare tijdslots en boeken direct een 30-minuten gesprek. Systeem maakt automatisch een Outlook-afspraak aan met Teams-link, stuurt bevestigingsmail via Resend met .ics bijlage, en herinnering 24 uur van tevoren. Beschikbaarheid en geboekte gesprekken zichtbaar in admin dashboard. Vervangt Calendly.

```
Bezoeker opent /plan-een-gesprek
→ Convex haalt beschikbaarheid op via Microsoft Graph API (calendarView)
→ Bezoeker kiest dag + tijdslot (30 min blokken, ma-vr)
→ Bezoeker vult naam + e-mail + onderwerp in
→ Convex maakt Outlook event aan via Graph API (events.create) met Teams meeting link
→ Convex slaat booking op + stuurt bevestigingsmail via Resend (.ics bijlage)
→ 24u van tevoren: herinneringsmail via Convex scheduled job
→ Admin dashboard: overzicht van alle gesprekken, annuleren, beschikbaarheid instellen
```

**Technisch:** Microsoft Entra app registratie, OAuth2 server-side flow met refresh token in Convex, `Calendars.ReadWrite` permission, timezone-aware slot berekening.

**Besparing: Calendly kosten vervallen**

**Status: ❌ 0% — niet begonnen**

| Onderdeel | Status |
|---|---|
| Microsoft Entra app registratie (App ID, client secret, permissions) | ❌ Nog te doen |
| OAuth2 server-side flow met refresh token in Convex | ❌ Nog te doen |
| `convex/calendar.ts` — beschikbaarheid ophalen, booking aanmaken | ❌ Nog te doen |
| `/plan-een-gesprek` pagina (kalender UI, tijdslots, formulier) | ❌ Nog te doen |
| Bevestigingsmail met .ics bijlage via Resend | ❌ Nog te doen |
| Herinneringsmail 24u van tevoren (Convex scheduled job) | ❌ Nog te doen |
| Admin tab: geboekte gesprekken, annuleren, beschikbaarheid | ❌ Nog te doen |
| Calendly link op contact pagina vervangen | ❌ Nog te doen |

---

### Fase 8 — Quizzes en vragenlijsten via Circle
Quizzes, assessments en vragenlijsten worden gebouwd in Circle. Circle heeft ingebouwde quiz-functionaliteit binnen cursussen en kan gekoppeld worden aan certificaten en voortgang. Geen custom ontwikkeling nodig — Klaas beheert dit zelfstandig via het Circle dashboard.

**Status: ❌ 0% — vereist Fase 3 (Circle)**

---

### Fase 9 — Leadinfo light (optioneel)
IPinfo API integreren in Next.js. Bezoekende bedrijven worden herkend via IP en opgeslagen in Convex. Zichtbaar in het admin dashboard: welk bedrijf, welke pagina's, hoe vaak. Op dat moment beslissen of Leadinfo nog meerwaarde heeft of opgezegd kan worden.

**Status: ❌ 0% — niet begonnen**

---

## Totaaloverzicht besparingen

| Tool | Besparing |
|---|---|
| Plug&Pay | €50/mnd |
| Kajabi | €300/mnd |
| ActiveCampaign | €150/mnd |
| Calendly | ~€10/mnd |
| **Totaal** | **~€510/mnd = ~€6.120/jaar** |

---

## Wat Klaas zelfstandig kan na afronding

| Actie | Via |
|---|---|
| Trainingen toevoegen en bewerken | Circle dashboard |
| Community modereren | Circle dashboard |
| Live events plannen | Circle dashboard |
| Quizzes en vragenlijsten maken | Circle dashboard |
| Leden beheren en toegang aanpassen | Circle dashboard |
| Tekst en prijzen aanpassen op website | Telegram |
| Nieuwe landingspagina aanmaken | Telegram |
| Testimonials en afbeeldingen aanpassen | Telegram |
| Kortingsacties instellen | Telegram |
| E-mail broadcast sturen | Eigen admin dashboard |
| Doelgroep kiezen voor broadcast | Eigen admin dashboard |
| Geboekte gesprekken bekijken | Eigen admin dashboard |
| Beschikbaarheid instellen voor gesprekken | Eigen admin dashboard |
| Aankomstige events bekijken | Eigen admin dashboard |
| Bezoekende bedrijven bekijken (B2B) | Eigen admin dashboard |

---

---

## Fase 1 voortgang — Next.js website

### Technische setup (afgerond)

- Next.js 15.5, TypeScript, Tailwind CSS 4, Turbopack
- Fonts: Playfair Display (display) + DM Sans (body) via `next/font`
- Kleurenpalet: ink `#0E0C0A`, paper `#F7F4EF`, warm `#EDE9E2`, copper `#B5622A`, copper-light `#D4794A`, rule `rgba(14,12,10,0.10)`
- Image optimalisatie: AVIF/WebP, quality 85
- Redirects voor oude Kajabi-URLs in `next.config.ts`

### Homepage secties (afgerond)

| Sectie | Status | Opmerkingen |
|---|---|---|
| Header/navigatie | Klaar | Responsive, sticky, dropdown trainingen |
| HeroSlideshow | Klaar | 5 slides, crossfade, alle quotes geverifieerd uit LinkedIn |
| LogoBar | Klaar | 10 logo's: Visma, Heigo, Leadinfo, GP Products, Gradient, Vasco, Edison, MT Sprout, Mom in Balance, Zigt |
| TrainingCards | Klaar | Sales Excellence + Customer Success, spacing tussen kaarten |
| TeamPhotos | Klaar | 3 foto's (Visma, Heigo, Customer Success), hover overlay |
| ReviewGrid | Klaar | 6 reviews, afwisselend licht/donker, geen hover (niet klikbaar) |
| Over Klaas | Klaar | Portretfoto + korte bio |
| Boek sectie | Klaar | Cover + bestellen knop |
| CTA/footer | Klaar | Contact + navigatie |

**Alle testimonials en claims zijn geverifieerd uit LINKEDIN-POSTS.md — geen onbewezen claims.**

### Bekende issues

| Issue | Ernst | Toelichting |
|---|---|---|
| Foto's onscherp op retina | Hoog | Bronbestanden zijn max 1280×720. Kajabi heeft dezelfde resolutie — originelen nodig van fotograaf/telefoon. Vooral: `klaas-flipchart.jpeg` (800px), groepsfoto's (1280px). Ideaal 2400px+ breed. |
| Tailwind CSS 4 hover bug | Opgelost | `hover:bg-ink` genereert geen CSS. Workaround: `hover:bg-[#0E0C0A]` met expliciete hex. |
| Sommige logo's klein | Laag | Heigo (400×400) en GP Products (165×147) zijn vierkant, verschijnen klein in horizontale balk. |

### Nog te doen — Fase 1

**Subpagina's bouwen:**
- [x] `/sales-excellence-training` — landingspagina met programma, radar model, pricing, FAQ
- [x] `/customer-success-training` — idem
- [x] `/spreker` — keynote/spreker pagina met video's, coaching, FAQ
- [x] `/boek` — Sales, oprecht & ontspannen, 3D testimonials, bestelmogelijkheden
- [x] `/over-ons` — team (Klaas, Joost, Sanne, Tim), missie, achtergrond
- [x] `/contact` — contactformulier met Turnstile, locatie, directe contactgegevens

**SEO & metadata:**
- [x] `generateMetadata` per pagina (title, description, OG image)
- [x] OG images genereren via `next/og`
- [x] Structured data (Organization, Course, Book, Person, WebSite, Service, ContactPage)
- [x] `sitemap.xml` en `robots.txt` — dynamisch via `site-config.ts`
- [x] `llms.txt` voor AI crawlers — dynamisch via `site-config.ts`

**Design & kwaliteit:**
- [ ] Hogere resolutie foto's verkrijgen en vervangen (zie bekende issues)
- [x] Mobile testing — screenshots op 375px, 768px, 1440px
- [x] Accessibility audit — 97/100 (WCAG contrast, ARIA fixes)
- [x] Lighthouse: Performance 87, Accessibility 97, Best Practices 96, SEO 100

**Juridisch:**
- [x] Privacybeleid pagina
- [x] Algemene voorwaarden pagina
- [x] Cookie consent — niet nodig: site zet geen cookies, geen analytics, Turnstile is cookieloos

**Deploy:**
- [x] Git repo geïnitialiseerd
- [ ] Vercel project aanmaken en koppelen (CLI auth nodig: `vercel login`)
- [ ] Custom domein `klaaskroezen.nl` configureren
- [ ] DNS migratie plannen (zie SEO migratie sectie)

**Nog open:**
- [ ] Spreker pagina: `placeholder-mindset` video URL vervangen door echte URL
- [ ] Pricing CTA's: echte Plug&Pay checkout URLs invullen (SET/CST)
- [ ] ContactForm backend: Resend API koppelen

---

*Laatste update: maart 2026*