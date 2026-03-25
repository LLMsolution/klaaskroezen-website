# Stack Vergelijking: Oud vs. Nieuw + Roadmap

## Oude stack — wat we vervangen

| Platform | Kosten | Rol |
|---|---|---|
| **Kajabi** | ~€300/mnd | Website + trainingsplatform + hosting |
| **Plug&Pay** | ~€50/mnd | Checkout + betalingen |
| **ActiveCampaign** | ~€150/mnd | CRM + email automation + broadcasts |
| **Circle** (gepland) | ~€199/mnd | Community + trainingen (nooit gestart) |
| **Calendly** | ~€12/mnd | Agenda booking |
| **Totaal** | **~€711/mnd = ~€8.532/jaar** |

---

## Nieuwe stack — wat we bouwen

| Tool | Kosten | Rol |
|---|---|---|
| **Next.js + Vercel** | €0 | Website + hosting |
| **Convex Pro** | ~€23/mnd | Database, auth, workflows, realtime |
| **Vimeo Standard** | ~€31/mnd | Video hosting + ondertiteling |
| **Mollie** | ~1.8%/transactie | Betalingen |
| **Resend Pro** | ~€19/mnd | Email |
| **GitHub + Claude Code** | ~€20/mnd | AI-gedreven deployment |
| **Totaal** | **~€93/mnd = ~€1.116/jaar** |

**Besparing: ~€618/mnd = ~€7.416/jaar (86% goedkoper)**

---

## Voordelen nieuw systeem per categorie

### Website (vervangt Kajabi website)

| | Kajabi | Nieuw |
|---|---|---|
| Laadtijd | 2-3 seconden | <1 seconde |
| Core Web Vitals | Slecht (Kajabi overhead) | Perfect (Next.js + Vercel) |
| SEO | Beperkt, Kajabi templates | Volledige controle: metadata, structured data, sitemap, robots.txt, llms.txt |
| Talen | Alleen NL of EN | NL + EN met taalwisseling in header |
| Design | Kajabi template, beperkt aanpasbaar | Volledig custom, editorial/magazine stijl |
| URL structuur | Kajabi URLs (niet SEO-vriendelijk) | Eigen URLs, clean structuur |
| Blog | Kajabi blog (basis) | Eigen blog met categorieën, likes, video embed, CTA per post |
| Hosting | Kajabi servers (VS) | Vercel Edge (wereldwijd CDN) |
| Domein | Via Kajabi | Eigen domein, volledige DNS controle |

### Betalingen (vervangt Plug&Pay)

| | Plug&Pay | Nieuw |
|---|---|---|
| iDEAL | Via Plug&Pay (redirect) | Direct via Mollie (geen redirect) |
| Checkout ervaring | Apart platform, ander design | Op eigen website, zelfde design |
| Order bumps | Beperkt | Volledig configureerbaar per product |
| Staffelprijzen | Nee | Ja (bijv. 1 boek = €32,50, 3 = €27,50, 10 = €22,50) |
| Termijnbetalingen | Beperkt | Ja (bijv. 3x €750 voor training) |
| Facturen | Handmatig of apart systeem | Automatisch: KK-2026-0001, BTW logica (NL/EU/non-EU), PDF |
| Abandoned cart | Nee | 4-staps recovery (timing instelbaar via admin) |
| A/B testing checkout | Nee | Ja: middleware-based variant toewijzing, conversie + omzet tracking |
| Kortingscodes | Beperkt | Volledig: percentage/vast, geldigheid, max gebruik, per-product |
| Klant dashboard | Nee | Ja: bestellingen, downloads, facturen, trainingen |
| Referral systeem | Nee | Ja: referrer + referee krijgen korting |
| Real-time bezoekers | Nee | Ja: live bezoekertelling op checkout pagina's |

### Email & Automation (vervangt ActiveCampaign)

| | ActiveCampaign | Nieuw |
|---|---|---|
| Kosten | ~€150/mnd | ~€19/mnd (Resend) |
| Templates | ActiveCampaign editor | 15+ branded HTML templates, bewerkbaar in admin |
| Email sequences | ActiveCampaign workflows | Eigen sequences: training (4 stappen), boek (2 stappen) |
| Abandoned cart | Aparte flow in AC | Geïntegreerd: 4 escalatiestappen, timing instelbaar |
| Broadcasts | ActiveCampaign campaigns | Eigen broadcast systeem met 5 segmenten |
| A/B testing | ActiveCampaign A/B | Eigen A/B: onderwerp + body, statistische significantie |
| Open/click tracking | ActiveCampaign tracking | Eigen tracking pixel + click proxy |
| Cross-sell in emails | Handmatig | Automatisch: context-afhankelijke sectie in elke email |
| Email preview | ActiveCampaign preview | Live preview: desktop/tablet/mobile in admin |
| Responsive | ActiveCampaign responsive | Custom responsive layout met mobile-first breakpoints |
| Data eigendom | ActiveCampaign bezit data | Alle data in eigen Convex database |

### CRM (vervangt ActiveCampaign CRM)

| | ActiveCampaign CRM | Nieuw |
|---|---|---|
| Contacten | ActiveCampaign contacts | Eigen contacten met engagement + intent scoring |
| Lead pipeline | ActiveCampaign deals | Eigen pipeline: Kanban + lijst view, configureerbare stages |
| Scoring | AC lead scoring (beperkt) | Dubbele scoring: engagement (opens/clicks) + intent (checkout/purchase) |
| Score decay | Nee | Ja: 10%/maand automatische veroudering |
| Automations | AC automation builder | 6 triggers × 6 acties, instelbaar via admin |
| Nurturing | AC sequences | Eigen nurturing sequences met auto-cancel bij aankoop |
| Rapportages | AC reports (basis) | 5 rapporten: pipeline, conversie, forecast 30/60/90d, team performance, bron-analyse |
| Activiteitenlog | AC activity feed | 17 event types per contact/lead |
| Tags | AC tags | Eigen tags systeem |
| Contact merging | AC merge | Eigen merge: tags + scores + activities + leads samengevoegd |

### Trainingsplatform (vervangt Kajabi + maakt Circle overbodig)

| | Kajabi | Nieuw |
|---|---|---|
| Kosten | ~€300/mnd + €199/mnd Circle | ~€31/mnd (Vimeo) |
| Video hosting | Kajabi (beperkt) | Vimeo: auto-ondertiteling 30+ talen, CDN, privacy controls |
| Voortgang tracking | Kajabi (basis) | Per user per module: video positie, percentage, quiz, completion |
| Video bookmarks | Nee (geen enkel platform heeft dit) | Ja: vlaggetje + notitie + tijdstip, klik om terug te springen |
| Quizzes | Kajabi quizzes (basis) | 4 vraagtypen, server-side scoring, onbeperkt herkansen |
| Certificaat | Handmatig | Automatisch PDF na alle quizzes gehaald |
| Discussie | Circle (apart platform, €199/mnd) | Per module: Q&A met upvotes, trainer badge, notificatie aan Klaas |
| Werkboek | Kajabi (basis download) | Per module: upload + download, Convex file storage |
| Admin beheer | Kajabi admin | Eigen admin: training/module/quiz CRUD, deelnemersoverzicht |
| Navigatie | Locked modules (lineair) | Vrij navigeren (past bij volwassen leerders) |
| Koppeling checkout | Los van Kajabi checkout | linkedProducts: training automatisch ontgrendeld na aankoop |
| Design | Kajabi template | Eigen design, consistent met de rest van de website |
| Data | Kajabi bezit data | Alle leerdata in eigen database |

### Admin Panel (vervangt losse dashboards in Kajabi + AC + Plug&Pay)

| | Oud (3 losse tools) | Nieuw (1 admin panel) |
|---|---|---|
| Overzicht | Inloggen op 3 platforms | Alles in 1 dashboard op /admin |
| Tabs | — | 18 tabs verdeeld over 3 secties |
| Bestellingen | Plug&Pay dashboard | Eigen bestellingenoverzicht met filters |
| Facturen | Handmatig/Plug&Pay | Automatisch, doorzoekbaar, PDF download |
| Contacten | ActiveCampaign | Eigen contactenlijst met scoring |
| CRM Pipeline | ActiveCampaign deals | Eigen Kanban + lijst view |
| Email templates | ActiveCampaign editor | Live HTML editor met preview op 3 devices |
| Broadcasts | ActiveCampaign campaigns | Eigen broadcast systeem met segmentatie |
| A/B testen | Nee | Ja: email + checkout experimenten |
| Trainingen | Kajabi admin | Eigen training/module/quiz CRUD |
| Blog | Kajabi blog editor | Eigen blog editor met categorieën |
| Instellingen | Verspreid over 3 tools | Centraal: admin emails, abandoned cart timing |

---

## Wat we nog gaan bouwen (roadmap)

### Fase 3 afronden — Trainingsplatform (bijna klaar)
*Status: ~90% — schema + backend + admin + frontend gebouwd, testen + polish nodig*

| Nog te doen | Prioriteit |
|---|---|
| Vimeo video IDs invullen per module (door Klaas) | Hoog |
| Werkboek PDFs uploaden per module (door Klaas) | Hoog |
| Training content migratie vanuit Kajabi | Hoog |
| Persoonlijke notities per module | Medium |
| Drag & drop module volgorde in admin | Laag |
| Meest gebookmarkde momenten per video in admin | Laag |

### Fase 5 — AI Layout Editor (gepland)
*Status: Plan klaar, niet gebouwd*

| Feature | Beschrijving |
|---|---|
| Chat in admin | Natuurlijke taal: "Maak de hero fullscreen" |
| Claude Code via GitHub Actions | AI past code aan, CI/CD valideert |
| Vercel preview URL | Klaas ziet het resultaat voor het live gaat |
| Approve/reject | Goedkeuren = live, afkeuren = branch weg |
| Content naar database | Teksten bewerkbaar via admin formulieren (zonder deploy) |
| Scoped file access | AI mag alleen presentatie-bestanden aanraken |

### Fase 6 — Events en webinars
*Status: 5% — alleen cohorts tabel*

| Feature | Beschrijving |
|---|---|
| Event admin | CRUD: naam, datum, prijs, max deelnemers |
| Event betaalpagina | Checkout via Mollie |
| Event op website | Automatisch zichtbaar op relevante pagina's |
| Bevestigingsmail | Met .ics kalender bijlage |

### Fase 7 — Agenda koppeling (vervangt Calendly)
*Status: 0%*

| Feature | Beschrijving |
|---|---|
| Microsoft Graph API | Outlook agenda integratie |
| Booking pagina | /plan-een-gesprek met beschikbare tijdslots |
| Bevestiging + herinnering | Emails met .ics bijlage |

### Fase 8 — Leadinfo light (optioneel)
*Status: 0%*

| Feature | Beschrijving |
|---|---|
| IPinfo API | Bedrijfsnaam + domein per bezoeker |
| Admin widget | Welke bedrijven bezoeken de site |

### Toekomstmogelijkheden (deferred)

| Feature | Beschrijving |
|---|---|
| AI coach | Vraag stellen over module → AI beantwoordt op basis van videotranscriptie + boek |
| Team dashboard | Manager ziet voortgang van heel zijn team |
| Certificaat QR verificatie | Publiek verifieerbaar certificaat |
| PWA + offline | Installeerbaar als app, video's cachen |
| Adaptieve leerroutes | Slechte quiz → systeem suggereert review |
| Ctrl+K zoeken | Doorzoekt trainingen, notities, bookmarks, discussies |
| Email integratie | "Je bent gestopt bij Module 3" mail met deeplink |

---

## Samenvatting

**Wat we al hebben (gebouwd):**
- Complete website (NL + EN, SEO, blog)
- Eigen checkout + Mollie betalingen
- Volledig email systeem (15+ templates, sequences, broadcasts, tracking, A/B)
- CRM met pipeline, scoring, automations, nurturing, rapportages
- Trainingsplatform (schema, backend, admin, frontend)
- Admin panel (18 tabs, alles centraal)
- A/B testing (email + checkout)
- Referral systeem
- Wachtwoord reset met branded email

**Wat we nog gaan bouwen:**
- AI Layout Editor (admin chat → code wijziging → preview → live)
- Events & webinars
- Agenda koppeling (Outlook, vervangt Calendly)
- Leadinfo light
- AI coach, team dashboard, certificaat QR, PWA

**Van 5 platformen → 1 eigen systeem. Van ~€711/mnd → ~€93/mnd.**
