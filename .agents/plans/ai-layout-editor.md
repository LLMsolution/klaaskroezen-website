# Feature: AI Layout Editor — Visuele wijzigingen via chat in de admin

## Context

Klaas wil de look & feel van zijn website-pagina's kunnen aanpassen zonder developer. In plaats van een traditioneel CMS met vaste velden bouwen we een chat-interface in de admin waarmee hij in natuurlijke taal layout-wijzigingen kan aanvragen. De AI voert de code-wijzigingen uit, de bestaande CI/CD pipeline valideert alles, en Klaas ziet een preview voordat het live gaat.

**Kernprincipe: Lock de data. Free de presentatie.**
- Content (teksten, CTA's, afbeeldingen) → database, beheert via admin formulieren
- Presentatie (layout, stijl, volgorde) → code, wijzigbaar via AI chat

---

## Execution Strategy

**Recommended**: `/execute-big` — 3 onafhankelijke workstreams (GitHub Actions, Convex backend, Admin UI) die parallel kunnen.

**Prerequisite**: Content migratie (Fase 0) moet eerst af zijn. Zie `.agents/plans/content-migratie.md`.

---

## BESLISSINGEN

### Architectuur
- **Chat in admin**, niet Telegram — betere UX, direct preview naast chat
- **Bestaande `claude-fix.yml` uitbreiden** met `repository_dispatch` trigger — geen nieuwe workflow nodig
- **OAuth token** (`CLAUDE_CODE_OAUTH_TOKEN`) al geconfigureerd — werkt met Pro ($20/mo), geen Max nodig
- **Bestaande CI/CD pipeline hergebruiken** — `run-tests.yml` (ESLint + security + Playwright + auto-merge) draait al op elke PR
- **Eén gebruiker tegelijk** — lock systeem, instelbaar wie mag wijzigen
- **Scoped file access** — AI mag alleen presentatie-bestanden aanraken
- **Preview → Approve/Reject flow** — Vercel preview deploy met goedkeuringsknop
- **Reject = branch verwijderen**, approve = merge naar main (auto-merge via bestaande pipeline)
- **Itereren op preview** — na preview kun je doorpraten en verder aanpassen voor goedkeuring
- **Afbeeldingen blijven in public/images/** — image paths als strings in content, niet naar Convex storage (onnodig complex)
- **Session timeout** — sessies verlopen na 2 uur inactiviteit (cron job)

### Wat we al hebben en hergebruiken

| Bestaand | Bestand | Hergebruik |
|---|---|---|
| Claude Code in GitHub Actions | `claude-fix.yml` | Uitbreiden met `repository_dispatch` trigger |
| OAuth token secret | `CLAUDE_CODE_OAUTH_TOKEN` | Hergebruiken — al geconfigureerd |
| `anthropics/claude-code-action@beta` | In `claude-fix.yml` | Hergebruiken |
| Prompt templates met variabelen | `.github/workflows/prompts/*.md` | Nieuw template: `layout-edit-github.md` |
| CI/CD pipeline met auto-merge | `run-tests.yml` | Hergebruiken — ESLint + security + Playwright + auto-merge |
| Autorisatie check | `author_association` in workflows | Hergebruiken |
| PR template | `pull_request_template.md` | Hergebruiken |
| Validatie-loop (hard gate) | `end-to-end-feature-github.md` | Pattern hergebruiken in layout prompt |
| Label-based prompt routing | `claude-fix.yml` (bug/feature labels) | Uitbreiden met `layout` label |

### Content/Presentatie scheiding
- Pagina's worden lijsten van secties in de database (type + content JSON)
- Sectie-types hebben een vast content-schema (het "contract")
- Componenten renderen secties op basis van type
- AI mag componenten restylen maar niet het content-schema breken
- Admin genereert formulieren automatisch op basis van sectie-schema's

### Wat de AI wel/niet mag

| Wel | Niet |
|-----|------|
| Component styling (Tailwind classes) | Schema wijzigen (convex/schema.ts) |
| Secties herordenen | Backend logica (convex/*.ts) |
| Componenten combineren/splitsen | Admin panel code (src/app/admin/**) |
| Nieuwe sectie-componenten bouwen | Middleware, auth, API routes |
| Responsive aanpassingen | Package.json, configs |
| Animaties toevoegen | Checkout flow |

---

## ARCHITECTUUR

```
┌─────────────────────────────────────────────────────────┐
│ ADMIN PANEL — Layout Editor tab                          │
│                                                          │
│  ┌──────────────────┐  ┌─────────────────────────────┐  │
│  │ Chat Interface    │  │ Preview iframe              │  │
│  │                   │  │                             │  │
│  │ "Maak de hero     │  │  [Vercel preview URL]       │  │
│  │  fullscreen met   │  │                             │  │
│  │  tekst over de    │  │                             │  │
│  │  afbeelding"      │  │                             │  │
│  │                   │  │                             │  │
│  │ [Status: bezig]   │  │  Desktop | Tablet | Mobile  │  │
│  │                   │  │                             │  │
│  │ ┌──────┐┌──────┐  │  │                             │  │
│  │ │Goed- ││Afkeu-│  │  │                             │  │
│  │ │keuren││ren   │  │  │                             │  │
│  │ └──────┘└──────┘  │  │                             │  │
│  └──────────────────┘  └─────────────────────────────┘  │
└────────────┬────────────────────────────────────────────┘
             │ Convex mutation
             ▼
┌──────────────────────────┐
│ Convex Backend            │
│                           │
│ layoutSessions tabel      │    Convex HTTP action
│ → status tracking         │───────────────────────┐
│ → messages[]              │                       │
│ → branchName              │                       │
│ → previewUrl              │                       ▼
└──────────────────────────┘    ┌─────────────────────────────────┐
             ▲                  │ GitHub API                       │
             │ callback         │ repository_dispatch event        │
             │                  └──────────┬──────────────────────┘
             │                             │
             │                             ▼
             │    ┌───────────────────────────────────────────┐
             │    │ claude-fix.yml (BESTAAND, uitgebreid)      │
             │    │                                            │
             │    │ Trigger: repository_dispatch               │
             │    │   type: "layout-edit"                      │
             │    │   payload: { prompt, page, branch, cb }    │
             │    │                                            │
             │    │ 1. Checkout repo                           │
             │    │ 2. Checkout/create branch                  │
             │    │ 3. Load layout-edit-github.md prompt       │
             │    │ 4. Run Claude Code (OAuth token)           │
             │    │    - Scoped file whitelist                 │
             │    │    - User prompt ingevoegd                 │
             │    │ 5. Commit + push                           │
             │    │ 6. Create PR (als nog niet bestaat)        │
             │    └──────────────┬────────────────────────────┘
             │                   │
             │                   ▼
             │    ┌───────────────────────────────────────────┐
             │    │ run-tests.yml (BESTAAND, ongewijzigd)      │
             │    │                                            │
             │    │ Trigger: pull_request naar main            │
             │    │                                            │
             │    │ 1. Frontend ESLint                         │
             │    │ 2. Security Analysis                       │
             │    │ 3. Frontend E2E (Playwright)               │
             │    │ 4. All Tests Passed gate                   │
             │    │ 5. Auto-merge (na goedkeuring)             │
             │    └──────────────┬────────────────────────────┘
             │                   │
             │                   ▼
             │    ┌───────────────────────────────────────────┐
             │    │ Vercel (BESTAAND, ongewijzigd)              │
             │    │                                            │
             │    │ - Preview deploy op elke branch push       │
             │    │ - Production deploy na merge naar main     │
             │    │ - Preview URL via Vercel API               │
             └────│ - Callback met URL naar Convex             │
                  └───────────────────────────────────────────┘
```

### Wat er NIET gebouwd hoeft te worden

- Geen nieuwe CI/CD pipeline — `run-tests.yml` draait al ESLint + security + Playwright + auto-merge
- Geen nieuwe GitHub Actions workflow — `claude-fix.yml` uitbreiden met extra trigger
- Geen OAuth token setup — `CLAUDE_CODE_OAUTH_TOKEN` staat al in GitHub Secrets
- Geen Vercel preview setup — Vercel maakt al automatisch previews per branch
- Geen PR template — `pull_request_template.md` bestaat al
- Geen autorisatie-systeem — `author_association` check bestaat al

---

## DATA MODEL

### Nieuw in convex/schema.ts

**`layoutSessions`** — Eén actieve sessie per keer
```
status: "locked" | "building" | "preview" | "approved" | "rejected" | "failed"
userId: Id<"users">
targetPage: string                — bijv. "sales-excellence-training"
branchName: string                — "ai/layout-1710672000"
prNumber: optional number         — GitHub PR nummer
previewUrl: optional string       — Vercel preview URL
messages: array of {
  role: "user" | "assistant" | "system"
  text: string
  createdAt: number
}
errorMessage: optional string     — CI/CD foutmelding
lastActivityAt: number            — voor session timeout
createdAt: number
completedAt: optional number
```
Index: by_status, by_user

**`layoutConfig`** — Wie mag de layout editor gebruiken (enkele rij)
```
key: string                       — "config"
allowedEmails: array of string
sessionTimeoutMinutes: number     — default 120
```
Index: by_key

### Content tabellen (gebouwd in Fase 0)

`sitePages` en `siteContent` tabellen bestaan al na de content migratie. Zie `.agents/plans/content-migratie.md` voor details.

---

## IMPLEMENTATION PLAN

### Fase 1: GitHub Actions uitbreiden — workstream 1

**Task 1.1**: `repository_dispatch` trigger toevoegen aan `claude-fix.yml`
- Nieuwe trigger naast bestaande `issue_comment` en `pull_request_review_comment`
- Event type: `layout-edit`
- Payload: `{ prompt, targetPage, branchName, callbackUrl, callbackSecret, sessionId }`
- Routing: als event type `layout-edit` → laad `layout-edit-github.md` prompt

```yaml
on:
  repository_dispatch:
    types: [layout-edit]
  issue_comment:
    types: [created]
  # ... bestaande triggers
```

**Task 1.2**: Prompt template `layout-edit-github.md`
- Systeem-instructies met strikte scope:
  - ALLEEN bestanden in: `src/components/sections/**`, `src/components/ui/**`, `src/app/*/page.tsx` (niet admin)
  - VERBODEN: `convex/**`, `src/app/admin/**`, `src/middleware.ts`, `package.json`, `*.config.*`
  - BEHOUD component props interface — data-contract mag niet breken
  - GEBRUIK design tokens uit CLAUDE.md (kleuren, fonts, spacing, rounded-[2px])
- Variabelen: `$TARGET_PAGE`, `$USER_PROMPT`, `$BRANCH_NAME`, `$SESSION_ID`, `$CALLBACK_URL`, `$CALLBACK_SECRET`
- Validatie-loop (hard gate, zoals in `end-to-end-feature-github.md`):
  - `npx next lint`
  - `npx next build`
  - Bij falen: fix + retry (max 2x)
- Git: checkout/create branch, commit, push, create PR als die niet bestaat
- Callback: `curl` naar Convex HTTP action met resultaat

**Task 1.3**: Callback + preview URL ophalen
- Na succesvolle push + PR creation:
  - Vercel preview URL = `https://{project}--{branch}.vercel.app` (voorspelbaar patroon)
  - Of: gebruik Vercel API (`GET /v6/deployments?projectId=X&target=preview`) met `VERCEL_TOKEN`
  - Wacht max 5 min op deployment ready
- `curl` naar Convex HTTP action: `{ sessionId, status: "preview", previewUrl, prNumber }`
- Bij falen na retries: `curl` met `{ sessionId, status: "failed", errorMessage }`
- Authenticatie: `LAYOUT_CALLBACK_SECRET` in GitHub Secrets + Convex env

### Fase 2: Convex backend — workstream 2

**Task 2.1**: `convex/layoutEditor.ts` (~200 regels)
- `getActiveSession` query — huidige sessie + lock status
- `getConfig` query — wie mag wat
- `startSession` mutation — check lock + permissions, maak sessie aan
- `addMessage` mutation — voeg user/assistant bericht toe aan sessie, update lastActivityAt
- `closeSession` mutation — status naar approved/rejected, completedAt instellen

**Task 2.2**: `convex/layoutEditorActions.ts` (~200 regels)
- `triggerBuild` action — GitHub API: `repository_dispatch` event versturen
  - POST `https://api.github.com/repos/{owner}/{repo}/dispatches`
  - Body: `{ event_type: "layout-edit", client_payload: { prompt, targetPage, branchName, callbackUrl, callbackSecret, sessionId } }`
  - Auth: `GITHUB_TOKEN` (Personal Access Token met `repo` scope)
- `approveSession` action — GitHub API: merge PR
  - PUT `https://api.github.com/repos/{owner}/{repo}/pulls/{prNumber}/merge`
  - Daarna: delete branch
- `rejectSession` action — GitHub API: close PR + delete branch

**Task 2.3**: HTTP route voor callback
- `convex/http.ts` uitbreiden met route: `POST /layout-callback`
- Valideer `callbackSecret` header
- Update sessie: previewUrl, prNumber, status, errorMessage
- Als status "preview": voeg system message toe ("Preview is klaar: {url}")

**Task 2.4**: Session timeout (cron)
- In `convex/crons.ts`: elke 30 min checken op verlopen sessies
- Als `lastActivityAt` > `sessionTimeoutMinutes` geleden en status niet "approved"/"rejected":
  - Status → "failed", errorMessage → "Sessie verlopen door inactiviteit"
  - Branch verwijderen via GitHub API
  - Lock vrijgeven

**Task 2.5**: `convex/layoutEditorConfig.ts` (~50 regels)
- `updateConfig` mutation — admin stelt allowed emails + timeout in
- Gebruikt door `startSession` voor permission check

### Fase 3: Admin UI — workstream 3

**Task 3.1**: `LayoutEditorTab.tsx` (~300 regels)
- Split layout: chat links (40%), preview rechts (60%)
- **Chat panel:**
  - Pagina-selector dropdown (uit `sitePages`)
  - Berichtenlijst met role-based styling (user/assistant/system)
  - Input veld + verzendknop
  - Status indicator: idle → building → preview → approved/rejected/failed
  - Error weergave als CI/CD faalt (errorMessage uit sessie)
- **Preview panel:**
  - iframe met Vercel preview URL
  - URL navigeert naar specifieke pagina (`previewUrl + "/" + targetPage`)
  - Responsive toggle: desktop (100%) / tablet (768px) / mobile (375px)
  - Refresh knop
- **Actieknoppen (zichtbaar bij status "preview"):**
  - "Goedkeuren" → merge + live
  - "Afkeuren" → verwijder branch + sluit sessie
  - Doorwerken: gewoon nieuw bericht typen
- **Lock indicator:**
  - Als iemand anders bezig is: toon wie + "Wacht tot sessie is afgesloten"

**Task 3.2**: AdminSidebar + AdminClient uitbreiden
- Tab `layout-editor` toevoegen aan AdminSidebar (sectie "beheren")
- Import + render in AdminClient
- TAB_LABELS: "Layout Editor"

**Task 3.3**: Settings uitbreiden
- In SettingsTab: sectie "Layout Editor"
- Email-lijst van wie de layout editor mag gebruiken
- Session timeout (minuten)
- Opslaan via `layoutEditorConfig.updateConfig`

---

## ENVIRONMENT VARIABLES (nieuw nodig)

### GitHub Secrets (al aanwezig)
- `CLAUDE_CODE_OAUTH_TOKEN` — al geconfigureerd

### GitHub Secrets (nieuw)
- `LAYOUT_CALLBACK_SECRET` — gedeeld secret voor callback authenticatie

### Convex env vars (nieuw)
- `GITHUB_TOKEN` — Personal Access Token met `repo` scope (voor repository_dispatch + PR merge)
- `LAYOUT_CALLBACK_SECRET` — zelfde secret als in GitHub Secrets
- `VERCEL_TOKEN` — (optioneel) voor Vercel API preview URL lookup, alternatief: URL uit branch naam construeren

---

## BEVEILIGINGSLAGEN

```
Laag 1: Admin auth            — alleen ingelogde admins zien de tab
Laag 2: Email whitelist        — alleen specifieke emails mogen sessies starten
Laag 3: Session lock           — max 1 sessie tegelijk, voorkomt conflicten
Laag 4: Session timeout        — verlopen na 2 uur inactiviteit (cron)
Laag 5: File whitelist         — Claude mag alleen src/components/sections/** etc.
Laag 6: System prompt          — expliciete instructies over wat wel/niet mag
Laag 7: CI/CD pipeline         — ESLint + security + Playwright + build moeten slagen
         (BESTAAND)              run-tests.yml draait automatisch op elke PR
Laag 8: Contract validatie     — component props moeten matchen met DB schema
Laag 9: Menselijke review      — Klaas keurt goed via preview voordat het live gaat
Laag 10: Git branch isolation  — wijzigingen op aparte branch, main is beschermd
Laag 11: Auto-merge gate       — run-tests.yml merged PAS na alle checks groen
          (BESTAAND)
```

---

## FLOW VOORBEELD

```
1.  Klaas opent admin → Layout Editor tab
2.  Systeem checkt: geen actieve sessie, Klaas staat in allowed emails
3.  Selecteert pagina: "Sales Excellence Training"
4.  Typt: "Maak de hero fullscreen met de tekst over de afbeelding heen"
5.  Convex: sessie aangemaakt (status: "building"), bericht opgeslagen
6.  Convex action: GitHub API repository_dispatch event
7.  GitHub Actions start (claude-fix.yml):
    a. Checkout repo
    b. Create branch: ai/layout-1710672000
    c. Load layout-edit-github.md prompt met user prompt erin
    d. Claude Code leest Hero.tsx, past aan (fullscreen, overlay)
    e. Validatie-loop: next lint + next build
    f. Commit + push
    g. Create PR naar main
    h. Callback naar Convex: { status: "preview", previewUrl, prNumber }
8.  Bestaande run-tests.yml draait automatisch op de PR (ESLint, security, Playwright)
9.  Vercel bouwt automatisch preview deploy
10. Admin toont preview in iframe
11. Klaas typt: "Maak de tekst iets groter en wit"
12. Stap 6-10 herhaalt op dezelfde branch (nieuwe commit op bestaande PR)
13. Klaas is tevreden → klikt "Goedkeuren"
14. Convex action: GitHub API merge PR
15. run-tests.yml auto-merge job bevestigt (alle checks al groen)
16. Vercel deployt automatisch naar productie
17. Convex: sessie status → "approved", lock vrijgegeven
```

---

## KOSTEN

| Component | Kosten | Status |
|---|---|---|
| Claude OAuth token (Pro) | $20/mo (inbegrepen) | Al geconfigureerd |
| GitHub Actions | Gratis (2000 min/mo private repos) | Al actief |
| Vercel preview deploys | Gratis (inbegrepen) | Al actief |
| Extra infra | Geen | — |

~3-5 min GitHub Actions per layout-wijziging.
20 wijzigingen/maand = ~100 min = ruim binnen gratis tier.

---

## VOLGORDE VAN BOUWEN

1. **Fase 0 eerst** — `/execute-small .agents/plans/content-migratie.md`
2. **Testen** — content editor werkt, pagina's renderen identiek
3. **`/prime`** — codebase context laden voor de agents
4. **Fase 1+2+3 parallel** — `/execute-big .agents/plans/ai-layout-editor.md`
5. **Testen** — layout editor end-to-end

---

## RISICO'S EN MITIGATIE

| Risico | Mitigatie |
|---|---|
| AI breekt component props (contract) | Contract validatie + system prompt + build check |
| AI raakt verboden bestanden aan | File whitelist in prompt + CLAUDE.md restricties |
| CI/CD faalt na AI wijziging | Validatie-loop in prompt (2x retry) + bestaande pipeline als gate |
| Merge conflict met development | Layout branches kort-levend + session lock (1 tegelijk) |
| Vercel preview duurt te lang | Timeout na 5 min in callback, foutmelding in admin |
| Ongeautoriseerde gebruiker | Email whitelist + admin auth + session lock |
| GitHub Actions quota overschreden | ~100 min/mo bij 20 wijzigingen, ver onder 2000 min gratis |
| Sessie vergeten (lock blijft hangen) | Cron job: timeout na 2 uur inactiviteit |

---

## DEFERRED

- **History/audit log** — niet nodig nu, kan later
- **Meerdere gelijktijdige sessies** — nu 1, later uitbreidbaar
- **Rollback na live** — Vercel heeft ingebouwde instant rollback
- **AI-gegenereerde content** — nu alleen layout, later tekst-suggesties
- **Sectie drag & drop** — kan als aanvulling op chat
- **Telegram integratie** — kan later als alternatieve trigger naast admin
- **Afbeelding upload via admin** — nu image-path veld, later Convex storage upload
