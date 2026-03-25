# Feature: Trainingsplatform — Eigen leeromgeving voor SET + CST

## Context

Klaas' trainingen zitten in Kajabi (€300/mnd). We bouwen een eigen trainingsplatform op klaaskroezen.com zodat deelnemers video's kijken, quizzes maken, bookmarks plaatsen, en discussiëren — alles in dezelfde stack (Next.js + Convex + Vimeo).

**Uit gesprek besloten:**
- **Vrij navigeren** — modules zijn niet locked, maar voortgang wordt bijgehouden
- **Quizzes optioneel** — maar vereist voor certificaat (motiveert zonder te blokkeren)
- **Bookmarks/checkpoints** — vlaggetje op de tijdlijn + optionele notitie
- **Discussie per module** — vragen/antwoorden met upvotes, Klaas reageert met Trainer badge
- **~1000 deelnemers** — discussie is relevant op die schaal
- **Klaas krijgt notificatie** bij nieuwe discussievragen

**Deferred naar later:**
- AI coach, team dashboard, adaptieve leerroutes, persoonlijke notities, offline/PWA

---

## Execution Strategy

**Recommended**: `/execute-big` — 4 onafhankelijke workstreams (schema, admin, frontend, quiz) die parallel kunnen.

---

## DECISIONS FROM CONVERSATION

### Architectuur
- **Vrij navigeren**: Geen locked modules. Voortgangsindicator per module (niet begonnen / bezig / voltooid)
- **Quiz voor certificaat**: Alle quizzes ≥70% → certificaat unlock. Quiz kan herkanst worden
- **Vimeo embed**: Video's op Vimeo, embed via iframe + @vimeo/player SDK voor progress tracking
- **Bookmarks op tijdlijn**: Klik vlaggetje → tijdstip opgeslagen → optioneel notitie → klik om terug te springen

### Wat nu, wat later
| NOW (v1) | LATER |
|---|---|
| Video modules + voortgang | AI coach |
| Quiz systeem (4 types) | Team dashboard |
| Bookmarks/checkpoints | Adaptieve leerroutes |
| Discussie per module | Persoonlijke notities |
| Werkboek download | Offline/PWA |
| Certificaat PDF | Certificaat QR verificatie |
| Admin: training CRUD | Admin: drag & drop volgorde |

### Rejected
- **Locked modules** — Klaas wil vrij navigeren, past bij volwassen leerders
- **Eigen video hosting** — Vimeo is beter (ondertiteling, CDN, €31/mnd)
- **Circle community** — te duur, niet nodig met discussie per module

---

## CONTEXT REFERENCES

### Bestaande patronen om te hergebruiken

**Access rights** (`convex/users.ts`, `convex/schema.ts:36-46`):
- `accessRights` tabel: userId + purchaseId + resource + grantedAt/revokedAt
- Query: `getMyAccessRights` filtert op revokedAt === undefined
- Training resource = product slug ("sales-excellence-training")

**File upload** (`convex/checkoutProducts.ts:119-140`, `src/app/admin/components/ImageUpload.tsx`):
- 3-stap: generateUploadUrl → POST file → saveStorageId
- `ctx.storage.getUrl(storageId)` voor download URLs
- Herbruikbaar voor werkboek uploads

**Admin CRUD** (`src/app/admin/components/BlogTab.tsx`, `convex/blog.ts`):
- View state: list | create | edit
- requireAdmin(ctx) op elke mutation
- Slug uniqueness check
- Patch pattern voor partial updates

**Dashboard** (`src/app/dashboard/DashboardClient.tsx`):
- Toont purchases, downloads, invoices
- Moet uitgebreid worden met "Mijn trainingen" sectie

**Training content** (`src/app/sales-excellence-training/content.ts`):
- SET: 6 modules (Mindset, Verbinding, Klantvraag, Presenteren, Bezwaren, Fans)
- CST: 6 modules (Rol, Klantfocus, Signalen, Moeilijke Gesprekken, Kansen, Ambassadeur)

**Email notificaties** (`convex/emails.ts`):
- `sendEmail` internalAction met tracking pixel
- Herbruikbaar voor "nieuwe discussievraag" notificatie aan Klaas

---

## IMPLEMENTATION PLAN

### Fase 1: Schema

Nieuwe tabellen in `convex/schema.ts`:

**`trainings`** — hoofdrecord per training
```
slug, title (nl/en), description (nl/en), thumbnailStorageId?, active, sortOrder, createdAt
Indexes: by_slug, by_active
```

**`trainingModules`** — modules binnen een training
```
trainingId, slug, title (nl/en), description (nl/en), vimeoVideoId,
durationSeconds?, sortOrder, workbookStorageId?, workbookFileName?,
discussionEnabled, quizRequired, active, createdAt
Indexes: by_training (trainingId + sortOrder), by_slug
```

**`quizzes`** — quiz per module
```
moduleId, passingScore (default 70), active, createdAt
Indexes: by_module
```

**`quizQuestions`** — vragen binnen een quiz
```
quizId, sortOrder, type ("multiple_choice" | "multiple_select" | "open" | "scale"),
question (nl/en), options? (array van {text nl/en, correct boolean}),
scaleMin?, scaleMax?, scaleLabels? (nl/en), createdAt
Indexes: by_quiz (quizId + sortOrder)
```

**`quizAttempts`** — ingevulde quizzes
```
userId, quizId, moduleId, score, passed, answers (array van {questionId, answer, correct?}),
createdAt
Indexes: by_user_module (userId + moduleId), by_quiz
```

**`moduleProgress`** — voortgang per user per module
```
userId, moduleId, trainingId, videoProgress (0-100), videoPosition (seconds),
quizPassed, completedAt?, lastAccessedAt
Indexes: by_user_training (userId + trainingId), by_module (moduleId)
```

**`bookmarks`** — video checkpoints
```
userId, moduleId, videoTimestamp (seconds), note?, createdAt
Indexes: by_user_module (userId + moduleId), by_module
```

**`discussions`** — vragen per module
```
moduleId, userId, userName, text, upvotes, isTrainer, parentId? (for replies),
createdAt
Indexes: by_module (moduleId + createdAt), by_parent (parentId)
```

**`discussionVotes`** — upvote tracking
```
discussionId, userId, createdAt
Indexes: by_discussion, by_user_discussion (userId + discussionId)
```

### Fase 2: Backend CRUD

**`convex/trainings.ts`** (~200 regels)
- Public: `getBySlug`, `listActive`, `getModulesForTraining`
- Admin: `createTraining`, `updateTraining`, `deactivateTraining`
- Admin: file upload: `generateUploadUrl` (hergebruik pattern)

**`convex/trainingModules.ts`** (~250 regels)
- Public: `getBySlug`, `getWithProgress` (module + user progress)
- Admin: `createModule`, `updateModule`, `deleteModule`, `reorderModules`
- Admin: `saveWorkbook`, `removeWorkbook` (file storage)

**`convex/quizzes.ts`** (~250 regels)
- Public: `getForModule` (quiz + vragen, zonder correcte antwoorden)
- Public: `submitAttempt` — valideer antwoorden server-side, bereken score, sla op
- Admin: `createQuiz`, `updateQuiz`, `addQuestion`, `updateQuestion`, `removeQuestion`

**`convex/trainingProgress.ts`** (~150 regels)
- Public: `updateVideoProgress` — sla positie + percentage op
- Public: `getMyTrainingProgress` — alle modules + voortgang voor een training
- Public: `getMyTrainings` — trainingen waar user toegang toe heeft + overall voortgang

**`convex/bookmarks.ts`** (~100 regels)
- Public: `create`, `update`, `delete`, `listForModule`

**`convex/discussions.ts`** (~200 regels)
- Public: `listForModule` (met upvote count, gesorteerd), `create`, `reply`
- Public: `toggleVote` (upvote/remove)
- Internal: `notifyTrainer` — email aan Klaas bij nieuwe vraag

### Fase 3: Admin UI

**Nieuwe tab "Trainingen"** in AdminSidebar (sectie "beheren")

**`src/app/admin/components/TrainingsTab.tsx`** (~200 regels)
- Lijst van trainingen met modules count, deelnemers, actief/inactief
- "Nieuwe training" knop → formulier
- Klik → TrainingEditor

**`src/app/admin/components/TrainingEditor.tsx`** (~300 regels)
- Training basis: titel nl/en, slug, beschrijving, thumbnail upload
- Modules lijst met add/edit/delete/reorder
- Per module: titel, vimeo URL, beschrijving, werkboek upload, quiz toggle

**`src/app/admin/components/QuizEditor.tsx`** (~300 regels)
- Vragen toevoegen/bewerken/verwijderen
- Per vraagtype ander formulier:
  - Multiple choice: opties + markeer correct
  - Multiple select: opties + meerdere correct
  - Open: alleen vraag (Klaas reviewt handmatig)
  - Schaal: min/max/labels
- Passing score instellen
- Preview van de quiz

**`src/app/admin/components/TrainingParticipantsTab.tsx`** (~200 regels)
- Per training: wie heeft toegang, voortgang per module, quiz scores
- Filter: alle/actief/voltooid
- Export naar CSV (optioneel)

### Fase 4: Frontend — Klantervaring

**`src/app/training/[slug]/page.tsx`** — Training overzicht
- Hero met training titel + beschrijving
- Modules grid met voortgangsindicator per module
- Overall voortgang balk
- Certificaat knop (als alle quizzes gehaald)

**`src/app/training/[slug]/[module]/page.tsx`** — Module pagina
- Vimeo video player (hervat waar je was)
- Bookmark/checkpoint functionaliteit
- Werkboek download knop
- Quiz sectie (als quiz enabled)
- Discussie sectie

**`src/components/training/VideoPlayer.tsx`** (~150 regels)
- Vimeo iframe embed met @vimeo/player SDK
- `timeupdate` event → sla voortgang op (debounced, elke 10 sec)
- Bookmark knop (vlaggetje) → opent notitie input
- Checkpoints markers op de progress bar

**`src/components/training/QuizSection.tsx`** (~250 regels)
- Render vragen op basis van type
- Submit → server-side validatie → score tonen
- ≥70%: groene melding + "Ga naar volgende module"
- <70%: rode melding + "Bekijk de video opnieuw" + herkans knop
- Eerdere pogingen tonen

**`src/components/training/DiscussionSection.tsx`** (~200 regels)
- Vragen lijst met upvotes, replies, trainer badge
- "Stel een vraag" formulier
- Reply functionaliteit
- Sorteer: meest upvoted / nieuwst

**`src/components/training/BookmarksList.tsx`** (~100 regels)
- Lijst van bookmarks voor deze module
- Klik → video springt naar timestamp
- Bewerk/verwijder notitie

**`src/components/training/CertificateButton.tsx`** (~80 regels)
- Toont status: "X van Y quizzes gehaald"
- Als alles gehaald: download PDF knop
- PDF generatie via API route met @react-pdf/renderer

### Fase 5: Dashboard uitbreiden

**`src/app/dashboard/DashboardClient.tsx`** aanpassen:
- Nieuwe sectie "Mijn trainingen" bovenaan
- Per training: thumbnail, titel, voortgang %, link naar training
- "Hervat waar je was" — deeplink naar laatst bekeken module

### Fase 6: Seed + Migratie

**`convex/trainingSeed.ts`**:
- Seed de 2 trainingen (SET + CST) met 6 modules elk
- Module titels/beschrijvingen uit bestaande content.ts bestanden
- Vimeo video IDs moeten handmatig toegevoegd worden door Klaas

---

## STEP-BY-STEP TASKS

### Task 1: CREATE convex/schema.ts wijzigingen
- **IMPLEMENT**: 8 nieuwe tabellen (trainings, trainingModules, quizzes, quizQuestions, quizAttempts, moduleProgress, bookmarks, discussions, discussionVotes)
- **PATTERN**: Bestaande tabel conventies (timestamps, indexes, v.optional)
- **VALIDATE**: `npx convex dev --once`

### Task 2: CREATE convex/trainings.ts + convex/trainingModules.ts
- **IMPLEMENT**: CRUD voor trainingen en modules, file upload voor werkboek/thumbnail
- **PATTERN**: Blog CRUD pattern (convex/blog.ts), file upload (convex/checkoutProducts.ts)
- **VALIDATE**: `npx convex dev --once`

### Task 3: CREATE convex/quizzes.ts
- **IMPLEMENT**: Quiz CRUD, question management, server-side submitAttempt met scoring
- **PATTERN**: Server-side validatie, nooit correcte antwoorden naar client sturen
- **VALIDATE**: `npx convex dev --once`

### Task 4: CREATE convex/trainingProgress.ts + convex/bookmarks.ts + convex/discussions.ts
- **IMPLEMENT**: Progress tracking, bookmarks CRUD, discussie met upvotes + trainer notificatie
- **PATTERN**: Email notificatie via internal.emails.sendEmail
- **VALIDATE**: `npx convex dev --once`

### Task 5: CREATE Admin UI (TrainingsTab, TrainingEditor, QuizEditor, ParticipantsTab)
- **IMPLEMENT**: Volledige admin CRUD voor trainingen, modules, quizzes
- **PATTERN**: BlogTab CRUD pattern, ImageUpload component hergebruiken
- **VALIDATE**: `npx next build` (geen errors)

### Task 6: CREATE Frontend training overzicht + module pagina
- **IMPLEMENT**: /training/[slug] overzicht, /training/[slug]/[module] module pagina
- **PATTERN**: Checkout page pattern (server component + client component)
- **VALIDATE**: Pagina laadt, video speelt, voortgang wordt opgeslagen

### Task 7: CREATE VideoPlayer + QuizSection + DiscussionSection + BookmarksList
- **IMPLEMENT**: Vimeo SDK, quiz rendering, discussie met upvotes, bookmarks op tijdlijn
- **VALIDATE**: Video progress tracking, quiz submit, bookmark create, discussie post

### Task 8: CREATE CertificateButton + PDF generatie
- **IMPLEMENT**: API route voor PDF generatie met @react-pdf/renderer
- **VALIDATE**: PDF download met correcte naam + datum

### Task 9: UPDATE Dashboard
- **IMPLEMENT**: "Mijn trainingen" sectie met voortgang + deeplink naar laatste module
- **PATTERN**: Bestaande DashboardClient.tsx uitbreiden
- **VALIDATE**: Dashboard toont trainingen na aankoop

### Task 10: CREATE trainingSeed.ts + AdminSidebar/AdminClient update
- **IMPLEMENT**: Seed 2 trainingen + 12 modules, tab toevoegen aan admin
- **VALIDATE**: `npx convex run trainingSeed:seed`, admin tab werkt

---

## TESTING & VALIDATION

### Handmatige test flow
1. Admin: training aanmaken → modules toevoegen → quiz bouwen → vimeo URL instellen
2. Seed uitvoeren → 2 trainingen met 12 modules in DB
3. Testuser: access right toekennen → dashboard toont training
4. Training openen → modules zien met voortgang
5. Module openen → video speelt → voortgang wordt opgeslagen
6. Bookmark plaatsen → notitie toevoegen → terugklikken werkt
7. Quiz invullen → score berekend → herkansing werkt
8. Discussie: vraag stellen → Klaas krijgt notificatie → reageren met badge
9. Alle quizzes gehaald → certificaat PDF downloaden
10. Alle bestanden onder 500 regels

### Build validatie
```bash
npx convex dev --once    # Backend bouwt
npx next build           # Frontend bouwt (geen nieuwe errors)
```

---

## ACCEPTANCE CRITERIA

- [ ] Admin kan trainingen + modules + quizzes beheren
- [ ] Deelnemer ziet trainingen op dashboard na aankoop
- [ ] Video speelt in Vimeo embed, voortgang wordt opgeslagen
- [ ] Bookmarks: plaatsen, notitie, terugspringen naar timestamp
- [ ] Quiz: 4 vraagtypen, server-side scoring, herkansing
- [ ] Certificaat PDF na alle quizzes ≥70%
- [ ] Discussie per module met upvotes en trainer badge
- [ ] Klaas krijgt email bij nieuwe discussievraag
- [ ] Werkboek upload + download werkt
- [ ] Vrij navigeren, geen locked modules
- [ ] NL + EN ondersteuning
- [ ] Alle bestanden ≤ 500 regels

---

## DEFERRED

- **AI coach**: Videotranscriptie + boek als RAG context — pas als v1 werkt
- **Team dashboard**: Manager ziet voortgang van team — pas bij bedrijfslicenties
- **Adaptieve leerroutes**: Slechte quiz → review suggestie — overengineering voor 6 modules
- **Persoonlijke notities**: Meeste mensen gebruiken eigen notitie-app
- **Offline/PWA**: Service worker + video caching — complexiteit vs waarde
- **Drag & drop volgorde**: Modules reorderen — kan met sortOrder nummers in v1
- **Certificaat QR verificatie**: Publiek verifieerbaar — nice-to-have
