# Website Klaas Kroezen - Onderzoeksrapport

> Doel: Volledige analyse van de huidige website (klaaskroezen.com) en de HTML-voorbeelden, als basis voor de Next.js herbouw.

---

## 1. Design Systeem (uit HTML-voorbeelden)

### 1.1 Kleurenpalet

| CSS Variable | Hex/Waarde | Gebruik |
|---|---|---|
| `--ink` | `#0E0C0A` | Primaire tekstkleur, donkere achtergronden (nav, footer, hero's) |
| `--paper` | `#F7F4EF` | Hoofdachtergrond, lichte secties — warm crème/off-white |
| `--warm` | `#EDE9E2` | Secundaire lichte achtergrond (logo-bars, reviews, alternerende secties) |
| `--copper` | `#B5622A` | Accent/CTA kleur — koper/roestbruin |
| `--cop2` | `#D4794A` | Lichter koper voor hover-states en italic accenten |
| `--rule` | `rgba(14,12,10,.10)` | Subtiele scheidingslijnen |

**Kernprincipe:** Warm, premium, "editorial" gevoel. Donker (ink) versus licht (paper) met koper als accent. Geen felle kleuren.

### 1.2 Typografie

| Font | Familie | Gebruik |
|---|---|---|
| **Playfair Display** | `'Playfair Display', Georgia, serif` | Headings, quotes, prijzen, numerieke statistieken. Weights: 400, 700, 900. Italic voor emphasis. |
| **DM Sans** | `'DM Sans', 'Helvetica Neue', sans-serif` | Body tekst, labels, knoppen, navigatie. Weights: 300 (light), 400, 500, 600. |

**Google Fonts URL:**
```
https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap
```

**Typografische patronen:**
- **Labels (`.lbl`):** DM Sans, 10.5px, weight 500, letter-spacing 0.22em, uppercase, koper kleur
- **Section headings (`.sec-h`):** Playfair Display, 34-58px responsive (clamp), weight 900, line-height 0.97, letter-spacing -0.03em
- **Section heading emphasis (`em`):** Playfair italic, weight 400, kleur rgba(14,12,10,.26) — sterk vervaagd
- **Body tekst:** DM Sans, 15-17px, weight 300, kleur rgba(14,12,10,.50-.52), line-height 1.65-1.92
- **Bold in body:** weight 500, volle ink kleur
- **Knoppen:** DM Sans, 11.5px, weight 500, letter-spacing 0.09em, uppercase
- **Nav items:** 12px, weight 400, letter-spacing 0.08em, uppercase
- **Statistieken/nummers:** Playfair Display, 26-42px, weight 900

### 1.3 Spacing & Layout

- **Max-width container (`.w`):** 1180px, padding 0 56px (28px op mobiel)
- **Sectie-padding:** 110px verticaal (80px op mobiel)
- **Border-radius:** 2px (bijna geen ronde hoeken — strak, editorial)
- **Grid gaps:** Vaak 1px met achtergrondkleur als separator (kaarten-grid patroon)
- **Breakpoint:** 1024px (single column)

### 1.4 Componenten

#### Knoppen
| Variant | Class | Stijl |
|---|---|---|
| Primary CTA | `.btn-cop` | Koper achtergrond, paper tekst |
| Ghost (light bg) | `.btn-ghost` | Transparant, dunne border |
| Ghost (dark bg) | `.btn-paper` | Transparant, lichte border, lichte tekst |
| Dark | `.btn-ink` | Ink achtergrond, paper tekst, hover → koper |
| Large | `.btn-lg` | Padding 16px 32px, font 12.5px |

Alle knoppen: inline-flex, gap 7px, SVG pijl die 3px translateX op hover, uppercase, letter-spacing.

#### Navigatie
- **Announcement bar:** Koper achtergrond, paper tekst, 12.5px
- **Navbar:** Sticky, ink achtergrond, 64px hoog
- **Logo:** Playfair Display, 17px, weight 900, uppercase, letter-spacing 0.06em
- **Mega dropdown:** Grid 2-koloms, ink achtergrond, koper top-border, hover-state per kaart
- **Nav CTA:** Koper achtergrond button

#### Kaarten (Grid-patroon)
- Kaarten gescheiden door 1px gap met `var(--rule)` achtergrond
- Border 1px solid var(--rule) rondom hele grid
- Hover: achtergrond verandert naar `--warm` (light) of donkerder tint (dark)
- Vaak een 3px koper topbar op featured cards

#### Reviews
- 3-koloms grid
- Playfair Display italic voor quotes
- Grote Playfair " (50px, koper)
- Sterren in koper
- Ronde avatar (36px)
- Dark variant: ink achtergrond, alle tekst licht

#### Stats/Filosofie band
- Ink achtergrond
- 3 of 5 koloms met separators
- Nummers: Playfair Display 42px, weight 900
- Labels: 10px uppercase, sterk vervaagd

### 1.5 Visuele Effecten
- **Image overlays:** `linear-gradient(to bottom, transparent 30%, rgba(14,12,10,.85) 100%)`
- **Radial glow (finale secties):** `radial-gradient(ellipse 60% 70% at 50% 50%, rgba(181,98,42,.11), transparent 65%)`
- **Image opacity op donkere bg:** 0.60-0.72
- **Hover op images:** `transform: scale(1.03-1.04)` met 0.6-0.7s ease transitie
- **Hover op SVG pijl:** `translateX(3px)`
- **Alle transities:** 0.15-0.2s

---

## 2. Paginastructuur & Content

### 2.1 Homepage (nieuw ontwerp uit examples/homepage-v2.html)

**Secties (top → bottom):**
1. **Announcement Bar** — Koper, boek-promotie
2. **Navigatie** — Sticky, mega-dropdown voor trainingen
3. **Hero** — 2-koloms grid:
   - Links: foto met overlay + quote (Simon Kornblum)
   - Rechts: headline "Meer omzet. *Minder stress.* Echte fans.", twee keuze-kaarten (SET featured/dark, CST normal), trust-indicators
4. **Stats Band** — Ink achtergrond: 25+ jaar, 21 landen, 9.1 beoordeling, 10% garantie
5. **Logo Bar** — Warm achtergrond: Vasco, Visma, MT Sprout, Mom in Balance, Zigt
6. **Twee Trainingen** — Section header + 2-koloms kaarten grid met afbeeldingen, beschrijvingen, bullet points
7. **Team Foto's** — Grid met 3 foto's (1 groot links, 2 kleiner rechts), captions
8. **Reviews** — 3-koloms grid, 1 dark card
9. **Over Klaas** — 2-koloms: foto links (420px) + bio rechts met stats
10. **Boek Teaser** — Ink achtergrond, boek-cover met glow, badges (#1, 2e druk, 9.1)
11. **Finale CTA** — Ink achtergrond, grote typografie, radial glow, twee CTA's

### 2.2 Sales Excellence Training (examples/sales-excellence-training.html)

**Secties:**
1. Announcement Bar + Nav (active state op trainingen)
2. **Page Hero** — 2-koloms: copy links (lichte bg), foto rechts (donkere bg met overlay + stat-band onderaan)
3. **Voor Wie Band** — Ink achtergrond, pill-tags: Accountmanagers, Ondernemers, etc.
4. **Logo Bar**
5. **Programma** — 2-koloms: 6 modules links + sticky CTA-box rechts met prijs (€2.250), features, koop-knoppen
6. **Team Foto's** — 3-koloms grid (2fr 1fr 1fr)
7. **Reviews** — 3-koloms
8. **Koopopties** — 3 pricing cards: Online (€2.250), Training+Coaching featured (€3.750), Teams (op maat)
9. **CS Crosslink** — Warm achtergrond, link naar Customer Success Training
10. **Over Klaas**
11. **Finale CTA**

**6 Modules SET:**
1. Mindset & Identiteit
2. Oprechte Verbinding
3. De Klantvraag Achter de Vraag
4. Ontspannen Presenteren & Pitchen
5. Bezwaren & Onderhandelen
6. Klanten die Fans Worden

### 2.3 Customer Success Training (examples/customer-success-training.html)

**Secties (zelfde structuur als SET maar met donker hero):**
1. Announcement Bar + Nav
2. **Page Hero (DONKER)** — Ink achtergrond, copy links, foto rechts
3. **Herkenning Band** — Warm achtergrond, "Herken je dit?" met pills (CS, Account management, Support & service, etc.)
4. **Voor Wie Band** — Ink achtergrond
5. **Logo Bar**
6. **Programma** — 6 modules + sticky CTA (€2.250)
7. **Team Foto's** — 2-koloms
8. **Reviews** — 3-koloms
9. **Koopopties** — 3 pricing cards
10. **SE Crosslink** — Ink achtergrond, link naar Sales Excellence Training
11. **Over Klaas**
12. **Finale CTA**

**6 Modules CST:**
1. Jouw rol in het commerciële geheel
2. Oprechte Klantfocus
3. Signalen Herkennen
4. Moeilijke Gesprekken Ontspannen Voeren
5. Kansen Zien Zonder "Te Verkopen"
6. Van Klant naar Ambassadeur

### 2.4 Spreker pagina (huidig: klaaskroezen.com/spreker)

- Hero met foto van Klaas bij flipchart
- Titel: "Inspireer je team met Oprecht en Ontspannen Sales"
- Beschrijving van inspratiesessie (halve dag, ~3 uur)
- Wat je kunt verwachten (4 punten)
- 5 video-fragmenten
- CTA: "Neem contact op"

### 2.5 Boek pagina (huidig: klaaskroezen.com/boek-sales-oprecht-&-ontspannen)

- Boekcover prominent
- Beschrijving met uitgebreide tekst
- 4 Reviews (Michael Pilarczyk, Simon Kornblum, Mark Tigchelaar, Tijn Touber)
- 3 Koopopties: e-Book (€22,50), Hard-Copy (€32,50), Luisterboek (€22,50)
- Video's: Speech boeklancering, Aftermovie
- Blog posts

### 2.6 Over Ons (huidig: klaaskroezen.com/over-mij)

- Hero foto Klaas
- Uitgebreide bio en missie
- Waarom + Achtergrond
- Twee trainingen uitleg
- Video
- Team sectie: Tim Lind, Joost Wammes, Sanne Bakker
- Kantoor info + foto (Oude Parklaan 111, Castricum)

### 2.7 Contact pagina

- Contactgegevens Klaas (+31618098906, klaas@klaaskroezen.com)
- Contactgegevens Joost (+31657396281, joost@klaaskroezen.com)
- Contactformulier (voornaam, achternaam, email, bericht, telefoon)
- Kantoor adres + foto

### 2.8 Blog

- Overzichtspagina met artikelen
- 40+ blogposts
- Onderwerpen: sales tips, boeklancering, klantcases, persoonlijke verhalen, Tony Robbins lessen

### 2.9 Overige pagina's (huidig)
- `/trainingen` — Overzichtspagina trainingen
- `/reviews` — Reviews pagina
- `/store` — Webshop
- `/privacy` + `/privacy-and-cookies` — Privacybeleid
- `/login` — Inloggen (Kajabi member area)
- `/module1` — Gratis module
- `/opt-in` — E-mail opt-in
- `/thank-you` / `/bedankt-contact` / `/bedankt-na-invullen-agenda` — Bedankpagina's

---

## 3. Afbeeldingen Inventaris

### 3.1 Kernafbeeldingen (veel gebruikt)

| Beschrijving | Huidige URL (Kajabi CDN) |
|---|---|
| Sales Excellence Training groepsfoto (certificaten) | `...5a8602-...8ad85eb4-d107-4c28-b077-3b0aa6770469.jpeg` |
| Customer Success Training groepsfoto | `...5e60b2-...cc3b53bf-d0d5-4154-9266-4e82a16b1a84.jpg` |
| Klaas Kroezen portret (Eva Aker Fotografie) | `...fe5d284-...Eva_Aker_Fotografie-21_2048px.jpeg` |
| Boekcover "Sales, Oprecht & Ontspannen" | `...eb00256-...5f4a3e18-5dda-4e8c-9858-e2fea518cdf2.png` |
| Visma YouServe trainingssessie | `...dc6b5e-...ab54915a-96cb-445b-b78c-d4287c8152ec.jpg` |
| Klaas bij flipchart (spreker) | `...358dfd7-...e0b63a6c-3e6b-4c4c-bbbb-89fc715e3abc.jpeg` |
| Klaas portret 2 | `...4c3fc3-...51abab58-9f3c-482b-bb65-43d098cf0465.jpeg` |
| Joost Wammer + Klaas | `...35d5104-...Joost_Wammer_en_Klaas_Kroezen_Sales_Excellence_Training.jpeg` |

### 3.2 Logo's (klanten)

| Bedrijf | Bestandsnaam |
|---|---|
| Vasco | `...17a8a535-9150-467d-970d-2d4a61cb8b9c.png` |
| Visma | `...04282995-f370-4363-a075-942fd0051fd4.png` |
| MT Sprout | `...b375d4c0-f615-4f0b-a37e-4630ada76f79.png` |
| Mom in Balance | `...MIB-logo-neon-roze-1.png` |
| Zigt | `...zigt-organization-logo.webp` |

### 3.3 Review avatars

| Persoon | Type |
|---|---|
| Simon Kornblum | Foto |
| Michael Pilarczyk | Foto |
| Mark Tigchelaar | Foto |
| Tijn Touber | Foto |

### 3.4 Team foto's

| Persoon | Type |
|---|---|
| Tim Lind | Screenshot-achtig portret |
| Joost Wammes | Portretfoto |
| Sanne Bakker | Screenshot-achtig portret |

### 3.5 Overige afbeeldingen
- Diverse groepsfoto's van trainingen (8+ afbeeldingen)
- Kantoor foto (Het Oude Administratiegebouw)
- Video thumbnails (5+ stuks)
- Stappen-iconen (3 illustraties voor het 3-stappenplan)
- Favicon/logo
- Foto in `examples/` map: PHOTO-2026-03-10-17-13-08.jpg (Klaas bij flipchart, spreker-achtig)

---

## 4. Huidige Website vs. HTML Voorbeelden — Verschillen

| Aspect | Huidige site (Kajabi) | HTML Voorbeelden (Doel) |
|---|---|---|
| **Font** | Montserrat | **Playfair Display + DM Sans** |
| **Kleurschema** | Blauw-achtig (#1A5F7A) + oranje (#E76F51) | **Warm ink (#0E0C0A) + koper (#B5622A)** |
| **Achtergrond** | Licht (#F9F7F7) | **Warmer crème (#F7F4EF)** |
| **Stijl** | Standaard Kajabi template, rounded buttons (30px radius) | **Editorial/magazine, bijna geen radius (2px), grid-gebaseerde kaarten** |
| **Layout** | Standaard secties, veel witruimte | **Strak grid-systeem, 1px separators, kaart-grids** |
| **Navigatie** | Simpel | **Mega-dropdown met 2-koloms kaarten** |
| **Hero** | Simpele tekst + afbeelding | **Split-screen met overlay, quote, keuze-kaarten** |
| **Schrijfstijl** | Informeel, emoji's | **Strak, premium, minder emoji's, meer typografische hiërarchie** |
| **Pricing** | Lijsten met features | **3-koloms kaart-grid met featured (dark) variant** |
| **Responsiveness** | Kajabi standaard | **Custom breakpoint 1024px, single-column mobile** |

---

## 5. Schrijfstijl & Tone of Voice

### Kenmerken:
- **Taal:** Nederlands
- **Toon:** Professioneel maar persoonlijk, direct, geen jargon
- **Kernboodschap:** "Oprecht en ontspannen" — geen trucjes, geen scripts
- **Recurring phrases:**
  - "Meer omzet, minder stress"
  - "Van klanten fans maken"
  - "Oprecht en ontspannen"
  - "Geen trucjes, geen scripts"
  - "10% resultaat of geld terug"
- **Headline patronen:**
  - Grote bold + italic em: "Meer omzet. *Minder stress.*"
  - Label boven heading (uppercase koper)
  - Subtekst: lichtere kleur, weight 300
- **CTA's:** Uppercase, actiegericht: "Bekijk training →", "Direct kopen", "Neem contact op"

---

## 6. Next.js Implementatieplan — Architectuur

### 6.1 Tech Stack Voorstel

| Technologie | Keuze | Reden |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | SSG/SSR, SEO, performance |
| Styling | **Tailwind CSS 4** + CSS Variables | Past bij het design systeem, utility-first |
| Fonts | **next/font (Google)** | Playfair Display + DM Sans, self-hosted |
| Images | **next/image** | Optimalisatie, lazy loading, responsive |
| Deployment | **Vercel** | Next.js native, edge functions |
| CMS (optioneel) | **Headless CMS of MDX** | Blog content |
| Forms | **Server Actions** of externe service | Contactformulier |
| Analytics | **Vercel Analytics** of GA4 | Traffic tracking |
| Video | **Embedded (YouTube/Vimeo)** of custom player | Video content |

### 6.2 Routestructuur

```
app/
├── layout.tsx                    # Root layout (nav + footer)
├── page.tsx                      # Homepage
├── sales-excellence-training/
│   └── page.tsx                  # SET pagina
├── customer-success-training/
│   └── page.tsx                  # CST pagina
├── spreker/
│   └── page.tsx                  # Spreker pagina
├── boek/
│   └── page.tsx                  # Boek pagina
├── over-ons/
│   └── page.tsx                  # Over ons pagina
├── contact/
│   └── page.tsx                  # Contact pagina
├── blog/
│   ├── page.tsx                  # Blog overzicht
│   └── [slug]/
│       └── page.tsx              # Blog artikel
├── reviews/
│   └── page.tsx                  # Reviews pagina
├── login/
│   └── page.tsx                  # Login/redirect
├── privacy/
│   └── page.tsx                  # Privacy beleid
└── bedankt/
    └── page.tsx                  # Bedankpagina
```

### 6.3 Component Bibliotheek

```
components/
├── layout/
│   ├── AnnouncementBar.tsx       # Koper announcement balk
│   ├── Navbar.tsx                # Sticky nav met mega-dropdown
│   ├── Footer.tsx                # Footer (nog te ontwerpen)
│   ├── Container.tsx             # Max-width 1180px wrapper
│   └── MobileMenu.tsx            # Hamburger menu <1024px
│
├── ui/
│   ├── Button.tsx                # btn-cop, btn-ghost, btn-paper, btn-ink, btn-lg
│   ├── Label.tsx                 # Uppercase koper label
│   ├── SectionHeader.tsx         # Label + Heading + Subtekst
│   ├── StatBand.tsx              # Ink achtergrond met nummers
│   ├── LogoBar.tsx               # Klant-logo carousel
│   ├── ArrowIcon.tsx             # SVG pijl-icoon
│   └── Badge.tsx                 # Tags/badges
│
├── sections/
│   ├── Hero.tsx                  # Homepage split-screen hero
│   ├── PageHero.tsx              # Training pagina hero (light/dark variant)
│   ├── TrainingCards.tsx          # 2-koloms training kaarten
│   ├── ProgramModules.tsx         # 6-module lijst met sticky CTA
│   ├── PricingCards.tsx           # 3-koloms pricing grid
│   ├── ReviewGrid.tsx             # 3-koloms review kaarten
│   ├── TeamPhotos.tsx             # Foto grid met captions
│   ├── AboutKlaas.tsx             # 2-koloms bio sectie
│   ├── BookTeaser.tsx             # Boek CTA (ink achtergrond)
│   ├── CrossLink.tsx              # Link naar andere training
│   ├── FinaleCtA.tsx              # Grote finale CTA sectie
│   ├── RecognitionBand.tsx        # "Herken je dit?" sectie
│   ├── ForWhoBand.tsx             # "Voor wie" pill-tags
│   └── ContactForm.tsx            # Contactformulier
│
├── blog/
│   ├── BlogCard.tsx              # Blog preview kaart
│   └── BlogPost.tsx              # Volledige blog post
│
└── shared/
    ├── VideoEmbed.tsx            # Video player component
    └── Image.tsx                 # Wrapper rond next/image
```

### 6.4 Design Tokens (Tailwind Config)

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        ink: '#0E0C0A',
        paper: '#F7F4EF',
        warm: '#EDE9E2',
        copper: '#B5622A',
        'copper-light': '#D4794A',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'Helvetica Neue', 'sans-serif'],
      },
      maxWidth: {
        container: '1180px',
      },
      fontSize: {
        // Custom sizes matching the design
        'label': ['10.5px', { letterSpacing: '0.22em', fontWeight: '500' }],
        'nav': ['12px', { letterSpacing: '0.08em', fontWeight: '400' }],
        'btn': ['11.5px', { letterSpacing: '0.09em', fontWeight: '500' }],
      },
    },
  },
}
```

### 6.5 Font Setup (next/font)

```typescript
// app/fonts.ts
import { Playfair_Display, DM_Sans } from 'next/font/google'

export const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})
```

---

## 7. SEO & Metadata

### Per pagina benodigde metadata:
- **Title:** Max 60 chars, keyword-first
- **Description:** Max 160 chars, CTA-achtig
- **OG Image:** Per pagina uniek (training foto's)
- **Language:** `nl`
- **Canonical URLs:** Schone URL-structuur

### Redirects nodig (oud → nieuw):
| Oud (Kajabi) | Nieuw (Next.js) |
|---|---|
| `/Sales-Excellence-Training` | `/sales-excellence-training` |
| `/boek-sales-oprecht-&-ontspannen` | `/boek` |
| `/over-mij` | `/over-ons` |
| `/klaas-kroezen` | `/over-ons` |
| `/business-coaching-Klaas` | redirect naar relevant |

---

## 8. Externe Integraties

| Service | Gebruik | URL |
|---|---|---|
| **Plug&Pay** | Checkout/betaling trainingen | `wwwcxia.plugandpay.nl/checkout/...` |
| **Plug&Pay** | Checkout boek | `klaaskroezen.plugandpay.com/checkout/...` |
| **Kajabi** | Huidige member area / login | Te migreren of redirecten |
| **Google Fonts** | Typografie | Via next/font |
| **Video hosting** | Training video's, spreker fragmenten | YouTube/Vimeo embeds |

---

## 9. Ontbrekende Elementen (te ontwerpen)

1. **Footer** — Niet aanwezig in de HTML-voorbeelden, moet ontworpen worden in dezelfde stijl
2. **Mobile hamburger menu** — Nav verbergt op <1024px, menu-implementatie nodig
3. **Blog layout** — Geen voorbeeld in HTML, moet ontworpen worden
4. **404 pagina** — Niet aanwezig
5. **Loading states** — Skeleton loaders in dezelfde stijl
6. **Cookie consent** — GDPR compliance
7. **Spreker pagina** — Geen HTML-voorbeeld, huidige pagina als basis + nieuw design
8. **Bedankpagina's** — Na formulier submit en checkout

---

## 10. Prioriteiten voor Implementatie

### Fase 1 — Core (MVP)
1. Design systeem opzetten (Tailwind config, fonts, kleuren)
2. Layout componenten (Nav, Footer, Container)
3. Homepage
4. Sales Excellence Training pagina
5. Customer Success Training pagina
6. Contact pagina

### Fase 2 — Secundair
7. Boek pagina
8. Over Ons pagina
9. Spreker pagina
10. Reviews pagina

### Fase 3 — Content & Extra
11. Blog (CMS integratie)
12. SEO optimalisatie + redirects
13. Analytics
14. Cookie consent
15. Performance optimalisatie

---

## 11. Foto in examples/ map

De foto `PHOTO-2026-03-10-17-13-08.jpg` toont Klaas Kroezen bij een flipchart in een warme, huiselijke setting. Dit lijkt een spreker/trainer-foto te zijn die gebruikt kan worden op de spreker-pagina of als alternatieve hero-afbeelding.

---

*Laatste update: 2026-03-11*
