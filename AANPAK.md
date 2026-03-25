# Stack Strategie — Klaas Kroezen
*Volledig migratieplan van huidige stack naar eigen platform*

---

## Huidige situatie

| Tool | Kosten (ex BTW) |
|---|---|
| Kajabi | ~€300/mnd |
| Plug&Pay | ~€50/mnd |
| ActiveCampaign | ~€150/mnd |
| **Totaal** | **~€500/mnd = ~€6.000/jaar** |

**Pijnpunten huidige stack:**
- Kajabi heeft geen native iDEAL — Nederlandse klanten haken af bij checkout
- Klantdata zit verspreid over 3 externe tools, niet in eigen beheer
- Slechte Core Web Vitals door Kajabi overhead — SEO nadeel
- Trainingen zitten vast in Kajabi — geen controle over klantervaring
- Plug&Pay als tussenstap in de checkout — extra frictie, extra kosten
- ActiveCampaign is een black box — geen inzicht in wat werkt
- Als de developer vertrekt, kan de eigenaar niet zelfstandig verder

---

## Nieuwe stack

| Tool | Doel | Plan | Prijs (USD) | Prijs (EUR ex BTW) |
|---|---|---|---|---|
| Next.js + Vercel | Frontend + hosting | Hobby (gratis) | $0 | €0/mnd |
| Convex | Database, auth, workflows, realtime | Pro | $25/mnd | €23/mnd |
| Vimeo | Video hosting + auto-ondertiteling | Standard | $33/mnd | €31/mnd |
| Mollie | iDEAL, creditcard, Apple Pay | Per transactie | ~1.8% | ~1.8% |
| Resend | E-mail (transactioneel + broadcasts) | Pro | $20/mnd | €19/mnd |
| Cloudflare Turnstile | CAPTCHA bescherming | Gratis | $0 | €0/mnd |
| **Totaal** | | | | **~€73/mnd = ~€867/jaar** |

**Besparing: ~€427/mnd = ~€5.133/jaar (86% goedkoper)**

### Waarom geen Circle?

Oorspronkelijk plan was Circle Business ($199/mnd) voor trainingen en community. Na analyse is besloten om het trainingsplatform zelf te bouwen omdat:
- De trainingen zijn primair video-based — daar heb je geen community-platform van $199/mnd voor nodig
- Eigen platform geeft volledige controle over klantervaring (alles op klaaskroezen.com)
- Geen SSO complexiteit, geen API rate limits, geen vendor lock-in
- Features die Circle niet kan: video bookmarks, adaptieve leerroutes, A/B testing, AI coach
- Custom bouwen kost minder uren dan Circle integreren (geen SSO, geen API mapping)
- Bespaart €199/mnd = €2.388/jaar extra

---

## Waarom deze keuzes

### Next.js + Vercel (Hobby plan, gratis)
- Sub-seconde laadtijden, perfecte Core Web Vitals
- Volledige controle over design en URL-structuur
- Vercel bouwt automatisch een preview URL bij elke wijziging
- Hobby plan is genoeg tot ~50k bezoekers/mnd

### Convex Pro ($25/mnd)
- Database + auth + workflows + realtime in een systeem
- Pro nodig voor dagelijkse automatische backups (klantdata beschermen)
- 25M function calls, 8GB storage — ruim voldoende
- TypeScript end-to-end, reactieve queries, vector search voor toekomstige AI

### Vimeo Standard ($33/mnd)
- 120 video's (we hebben ~50), 1TB opslag
- Automatische ondertiteling in 30+ talen — geen handwerk
- Privacy controls: video's alleen afspeelbaar op klaaskroezen.com
- Player API voor bookmarks en voortgang tracking
- Analytics per video

### Mollie (per transactie, ~1.8%)
- Native iDEAL, Bancontact, creditcard, Apple Pay
- Directe webhook integratie met Convex
- Klantdata blijft in eigen systeem

### Resend Pro ($20/mnd)
- 50.000 emails/mnd, geen daglimiet
- Nodig voor broadcasts naar 100+ ontvangers
- Developer-friendly, directe Convex integratie

---

## Architectuur

### Taakverdeling

**Klaas beheert zelfstandig via het admin dashboard:**
- Trainingen aanmaken en bewerken (modules, video's, quizzes)
- E-mail templates bewerken met live preview
- Broadcasts versturen naar segmenten
- Blog/nieuws posts schrijven
- Bestellingen, contacten, facturen bekijken
- A/B testen aanmaken en resultaten bekijken
- Abandoned cart timing aanpassen
- Kortingscodes beheren
- Experimenten op checkout pagina's draaien

**Klaas kan via Telegram (na Fase 5):**
- Tekst en prijzen aanpassen op de website
- Nieuwe landingspagina's maken
- Testimonials en afbeeldingen wijzigen
- Blog posts toevoegen

**Systeem doet automatisch:**
- Betalingen verwerken en facturen genereren
- Klantaccounts aanmaken, toegang verlenen
- Email sequences na aankoop (welkom, tips, follow-up)
- Abandoned cart recovery (4 escalatiestappen, timing instelbaar)
- Email open/click tracking
- Voortgang bijhouden per deelnemer
- Certificaten genereren na afronding

### Betaalflow

```
Klant koopt op klaaskroezen.com
  → Eigen checkout (iDEAL / creditcard / Apple Pay via Mollie)
  → Mollie webhook → Convex workflow:
    → Account aanmaken/koppelen
    → Betaling registreren
    → Factuur genereren (KK-YYYY-NNNN)
    → Toegang verlenen tot training
    → Welkomstmail via Resend
    → Email sequence starten
  → Klant logt in → ziet dashboard met trainingen, facturen, downloads
```

### Trainingsflow

```
Klant opent training op klaaskroezen.com
  → Ziet alle modules met voortgang
  → Speelt video af (Vimeo embed, ondertiteling in eigen taal)
  → Kan vlaggetje plaatsen op elk moment in de video + notitie maken
  → Na video: quiz (verplicht of optioneel)
  → Quiz gehaald → volgende module ontgrendeld
  → Discussie onder elke module: vragen stellen, anderen helpen
  → Alle modules + quizzes afgerond → certificaat (PDF)
```

---

## Custom trainingsplatform — features

### Kern
- **Video modules** met Vimeo embed en automatische ondertiteling (30+ talen)
- **Voortgang tracking** per gebruiker per module (hervat waar je was)
- **Werkboek/downloads** per module (PDF, templates, checklists)
- **Certificaat** na afronding (automatisch gegenereerde PDF)

### Quizzes (instelbaar door Klaas via admin)
- **Meerkeuzevraag** — 1 correct antwoord
- **Meerkeuze meerdere** — meerdere correcte antwoorden
- **Open vraag** — tekstveld, Klaas reviewt later
- **Schaalvraag** — 1-10 slider (zelfreflectie)
- Quiz kan verplicht zijn voor volgende module of optioneel
- Resultaten zichtbaar in admin per deelnemer

### Video bookmarks met notities
- Klant plaatst een vlaggetje tijdens het kijken → tijdstip wordt opgeslagen
- Klant schrijft notitie bij het vlaggetje (bijv. "Dit toepassen bij klant X")
- Alle bookmarks zichtbaar als tijdlijn naast/onder de video
- Klik op bookmark → video springt naar dat moment
- Klaas ziet in admin welke momenten het vaakst gebookmarked worden

### Mini-community per module
- Discussie-sectie onder elke video (geen apart forum)
- Deelnemers kunnen vragen stellen en elkaar helpen
- Klaas kan reageren met "Trainer" badge
- Upvote systeem (beste vragen/antwoorden bovenaan)
- Gekoppeld aan het juiste onderwerp (niet een generiek forum)

### Persoonlijke notities
- Per module een notitieveld: "Wat neem ik mee uit deze les?"
- Alleen zichtbaar voor de deelnemer zelf
- Doorzoekbaar over alle modules

### Wat dit beter doet dan Circle/Kajabi
- **Snelheid:** <1 seconde laden vs. 2-3 seconden (extern platform)
- **Geen redirect:** alles op klaaskroezen.com, zelfde design
- **Video bookmarks:** geen enkel trainingsplatform heeft dit
- **Adaptieve routes:** slechte quiz score → systeem suggereert review
- **Zoeken:** Ctrl+K doorzoekt trainingen, notities, bookmarks, discussies
- **Data:** Klaas ziet precies welke content impact heeft
- **A/B testing:** test verschillende quiz-varianten of modulevolgorde
- **Email integratie:** "Je bent gestopt bij Module 3" mail met deeplink

### Toekomstmogelijkheden
- **AI coach:** vraag stellen over de module → AI beantwoordt op basis van videotranscriptie + boek
- **Team dashboard:** manager ziet voortgang van heel zijn team
- **Certificaat verificatie:** QR code → publiek verifieerbaar
- **PWA:** installeerbaar als app, push notificaties
- **Offline:** video's cachen voor onderweg (service worker)

---

## Admin dashboard — volledig overzicht

### Dashboard (home)
- Snel overzicht: omzet, bestellingen, actieve trainingen, conversie
- Recente activiteit feed

### Bestellingen
- Alle bestellingen met status, bedrag, product, datum
- Filter op product, status, periode

### Contacten
- Mailing list met engagement stats (emails verstuurd, opens, clicks)
- Uitschrijvingen beheren

### Facturen
- Alle facturen, doorzoekbaar, downloadbaar als PDF

### E-mail templates
- Alle templates in een grid, gegroepeerd per type (transactioneel, training, boek, marketing)
- Live editor: HTML bewerken met split-view preview
- Preview op Desktop / Tablet / Mobiel (600px / 480px / 375px)
- NL/EN taalwisseling
- A/B testen aanmaken per template (variant B content, winnaar kiezen)
- Nieuwe templates aanmaken

### E-mail activiteit
- **Verzonden:** log van alle emails met slimme filters (alles/verzonden/mislukt/geopend/geklikt)
- **Prestaties:** open/click rates per template
- **A/B testen:** resultaten per variant met statistische significantie
- **Sequenties:** actieve email sequences met voortgang per klant
- **Uitschrijvingen:** wie heeft zich uitgeschreven, herinschrijven

### Broadcasts
- Nieuwe broadcast aanmaken (onderwerp, HTML body, segment)
- A/B test optie (variant B onderwerp + body)
- Segment kiezen: alle kopers, training-kopers, boek-kopers, SET, CST
- Preview en verzenden

### Experimenten (checkout A/B testing)
- Experiment aanmaken: naam, product, variant labels, traffic split
- Starten/pauzeren/hervatten
- Resultaten: bezoekers, conversies, omzet per variant
- Statistische significantie indicator (95% confidence)
- Winnaar kiezen

### Trainingen (nieuw te bouwen)
- Training aanmaken/bewerken (titel, beschrijving, thumbnail)
- Modules beheren met drag & drop volgorde
- Per module: Vimeo URL, beschrijving, werkboek (PDF upload)
- Quiz builder: vraagtypen, antwoorden, scoring, verplicht/optioneel
- Discussie aan/uit per module
- Deelnemersoverzicht: voortgang, quiz scores, activiteit
- Meest gebookmarkde momenten per video

### Kortingscodes
- Aanmaken: code, type (percentage/vast bedrag), geldigheid, max gebruik
- Overzicht van actieve en verlopen codes

### Blog / Nieuws
- Posts aanmaken/bewerken (titel, slug, body, afbeelding, video, categorie)
- Preview
- 44 posts gemigreerd van Kajabi

### Instellingen
- Admin beheerders (e-mailadressen met toegang)
- Abandoned cart timing (eerste herinnering in minuten, 3 escalatiestappen in uren)

---

## E-mail architectuur

### Responsive email layout
- Mobiel (<620px): full-width, geen kaartje-effect, compacte padding
- Desktop: wit kaartje op beige achtergrond, 40px padding
- Content-only opslag in database — layout wordt bij verzending toegepast
- Admin bewerkt alleen de inhoud, geen boilerplate

### Cross-sell in elke email
- Contextafhankelijke "Ontdek ook" sectie
- Training emails → suggereren het boek
- Boek emails → suggereren de training
- Abandoned cart → geen cross-sell (focus op conversie)

### Automatische flows
```
Klant koopt training → Convex workflow:
├── Direct:  bestelbevestiging + factuur
├── Dag 2:   welkom + start instructies
├── Dag 5:   tip uit de training
├── Dag 10:  voortgangscheck
└── Dag 14:  certificaat herinnering

Klant koopt boek → Convex workflow:
├── Direct:  bestelbevestiging + downloadlink
├── Dag 2:   "Heb je al een kijkje genomen?"
├── Dag 5:   tip uit het boek
└── Dag 10:  uitnodiging training (cross-sell)
```

### Abandoned cart recovery (timing instelbaar via admin)
```
Klant start checkout maar betaalt niet:
├── Na 30 min:  "Je bestelling staat nog klaar"
├── +24 uur:    "Nog steeds beschikbaar"
├── +48 uur:    "Gratis e-book erbij" (bonus)
└── +4 dagen:   "10% korting" (auto-gegenereerde code, 14 dagen geldig)
```
Bij elke stap: check of klant ondertussen betaald heeft → zo ja, stop.

### Broadcasts
- Klaas maakt email in admin of Canva → plakt HTML
- Kiest segment (alle kopers, training-kopers, boek-kopers, etc.)
- Optioneel: A/B test met variant B
- Verzenden of inplannen

### Email tracking
- Open tracking via pixel (elke email)
- Click tracking via redirect proxy (elke link)
- Per-template prestaties in admin
- A/B test resultaten met statistische significantie

---

## Checkout A/B testing

Middleware-based variant toewijzing op checkout pagina's:
1. Bezoeker komt op `/checkout/[product]`
2. Middleware wijst cookie toe (variant A of B, op basis van geconfigureerd gewicht)
3. Checkout pagina leest cookie → toont de juiste variant
4. Bij bestelling: variant wordt opgeslagen op de pending order
5. Bij betaling: conversie wordt geteld per variant
6. Admin: resultaten met bezoekers, conversies, omzet, en statistische significantie

---

## Migratiefases

### Fase 1 — Fundament: Next.js + Vercel + Convex ✅

**Status: Live op Vercel**

| Onderdeel | Status |
|---|---|
| Next.js 15 + Tailwind CSS 4 + TypeScript | ✅ |
| Convex schema (20+ tabellen) + auth | ✅ |
| Alle pagina's (home, SET, CST, spreker, boek, over-ons, contact, blog) | ✅ |
| NL/EN taalwisseling | ✅ |
| SEO: metadata, structured data, sitemap, robots.txt, llms.txt | ✅ |
| 44 blog posts gemigreerd | ✅ |
| Contact form (Convex + Resend) | ✅ |
| Vercel deployment | ✅ |
| Custom domein + DNS migratie | ❌ |
| Hogere resolutie foto's (bronbestanden nodig) | ❌ |
| GA4 + Clarity IDs instellen | ❌ |

---

### Fase 2 — Betaling: Mollie erin, Plug&Pay eruit ⚠️

**Status: ~85% klaar — Mollie test key actief**

**Besparing: ~€50/mnd**

| Onderdeel | Status |
|---|---|
| Checkout pagina's met bumps, social proof, NL/EN | ✅ |
| Mollie integratie (iDEAL, creditcard, Apple Pay) | ✅ |
| Factuursysteem (KK-YYYY-NNNN) | ✅ |
| Klant dashboard | ✅ |
| Checkout A/B testing systeem | ✅ |
| Mollie live key + testen | ❌ |
| CTA's omzetten: Plug&Pay → eigen checkout | ❌ |

---

### Fase 3 — Trainingen: eigen platform, Kajabi eruit

**Status: ❌ 0% — schema en admin nog te bouwen**

**Besparing: ~€300/mnd (Kajabi) + ~€185/mnd (Circle niet nodig)**

| Onderdeel | Status |
|---|---|
| Convex schema: trainings, modules, quizzes, progress, bookmarks, discussions | ❌ |
| Admin: training/module CRUD met drag & drop | ❌ |
| Admin: quiz builder (4 vraagtypen, scoring) | ❌ |
| Frontend: training overview (`/training/[slug]`) | ❌ |
| Frontend: module pagina (video + quiz + discussie + bookmarks) | ❌ |
| Vimeo integratie (embed, player API, ondertiteling) | ❌ |
| Video bookmarks met notities (vlaggetje + tijdstip + tekst) | ❌ |
| Voortgang tracking per user per module | ❌ |
| Discussie per module (vragen, antwoorden, upvotes) | ❌ |
| Persoonlijke notities per module | ❌ |
| Werkboek uploads (Convex file storage) | ❌ |
| Certificaat PDF generatie | ❌ |
| Training content migratie (Kajabi → eigen systeem) | ❌ |

---

### Fase 4 — E-mail: Resend erin, ActiveCampaign eruit ✅

**Status: ~95% klaar**

**Besparing: ~€150/mnd**

| Onderdeel | Status |
|---|---|
| Resend integratie + responsive email layout | ✅ |
| 15 branded email templates (content-only opslag) | ✅ |
| Cross-sell sectie in elke email | ✅ |
| Email sequences (training 4 stappen, boek 2 stappen) | ✅ |
| Broadcasts met segmentatie | ✅ |
| Abandoned cart recovery (4 stappen, timing instelbaar) | ✅ |
| Email open/click tracking | ✅ |
| Email A/B testing | ✅ |
| Admin: templates, activiteit, prestaties, A/B resultaten | ✅ |
| Resend domein klaaskroezen.com verificeren | ❌ |
| ActiveCampaign flows vergelijken + parallel draaien | ❌ |

---

### Fase 5 — Telegram deployment pipeline

**Status: ❌ ~10%**

| Onderdeel | Status |
|---|---|
| GitHub Actions basis | ✅ |
| Telegram bot + webhook handler | ❌ |
| Claude Code workflow (prompt → branch → PR → preview) | ❌ |
| Goedkeuringsflow | ❌ |

---

### Fase 6 — Events en webinars

**Status: ❌ ~5%**

Events worden beheerd in het eigen admin dashboard (niet Circle):
- Klaas maakt event aan in admin (naam, datum, prijs, max deelnemers)
- Event verschijnt automatisch op de website
- Betaling via Mollie → toegang verlenen → bevestigingsmail

| Onderdeel | Status |
|---|---|
| Cohorts tabel in schema | ✅ |
| Event admin (CRUD, prijs, deelnemers) | ❌ |
| Event betaalpagina | ❌ |
| Event op homepage/training pagina | ❌ |

---

### Fase 7 — Agenda koppeling: Outlook + booking, Calendly eruit

**Status: ❌ 0%**

| Onderdeel | Status |
|---|---|
| Microsoft Graph API integratie | ❌ |
| `/plan-een-gesprek` booking pagina | ❌ |
| Bevestigingsmail met .ics bijlage | ❌ |
| Herinneringsmail 24u van tevoren | ❌ |
| Admin: gesprekken overzicht | ❌ |

---

### Fase 8 — Leadinfo light (optioneel)

IPinfo API → bedrijfsnaam + domein per bezoeker → zichtbaar in admin.

**Status: ❌ 0%**

---

## Totaaloverzicht

### Kosten

| | Huidig | Nieuw |
|---|---|---|
| Kajabi | ~€300/mnd | €0 (eigen trainingsplatform) |
| Plug&Pay | ~€50/mnd | €0 (Mollie direct) |
| ActiveCampaign | ~€150/mnd | €0 (Resend) |
| Vercel | — | €0 (Hobby) |
| Convex Pro | — | ~€23/mnd |
| Vimeo Standard | — | ~€31/mnd |
| Resend Pro | — | ~€19/mnd |
| Mollie | — | ~1.8% per transactie |
| **Totaal** | **~€500/mnd** | **~€73/mnd** |
| **Jaarlijks** | **~€6.000** | **~€867** |
| **Besparing** | | **~€5.133/jaar** |

### Wat Klaas zelfstandig kan

| Actie | Via |
|---|---|
| Trainingen aanmaken/bewerken | Admin dashboard |
| Modules + video's + quizzes beheren | Admin dashboard |
| Discussies modereren | Admin dashboard |
| E-mail templates bewerken | Admin dashboard |
| Broadcasts versturen | Admin dashboard |
| Blog posts schrijven | Admin dashboard |
| A/B testen draaien (email + checkout) | Admin dashboard |
| Bestellingen/contacten/facturen bekijken | Admin dashboard |
| Abandoned cart timing aanpassen | Admin dashboard |
| Tekst en prijzen aanpassen | Telegram |
| Nieuwe landingspagina's | Telegram |
| Kortingsacties | Admin dashboard + Telegram |

---

*Laatste update: 16 maart 2026*
