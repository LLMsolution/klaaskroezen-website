# Feature: Training Notes + Workbook Overhaul

## Context Note

This plan is based on:
- Codebase reading of `ModulePageClient`, `VideoPlayer`, `BookmarksPanel`, `NotesPanel`, `convex/schema.ts` during conversation
- Conversation with Tim on 2026-04-09 about training UX improvements
- Incremental changes already shipped earlier in the session (auto-next 10s, ArrowLeft/Right lesson nav, copper Vimeo player color)

## Feature Description

Overhaul of the training lesson experience. Five coupled improvements:

1. **Rich-text notes** with a toolbar (Title / Bullets / Numbers / Bookmark) that replaces the separate bookmarks panel. Bookmarks become inline clickable `[mm:ss]` chips inside the note itself.
2. **Back button** at the top of a lesson page that returns to the training overview.
3. **Training overview page** gains a *Mijn materiaal* section: download workbook + download all notes as PDF.
4. **Workbook gets body**: title, description, thumbnail image, custom download-button label, all editable in admin per language.
5. **Prev/next nav under sidebar** — compact prev/next buttons rendered at the bottom of the `ModuleSidebar` (right column), in addition to the existing bottom-of-main-column placement.

Plus the two small changes already landed this session (10s auto-next countdown, arrow-key lesson navigation, copper player color).

## User Story

As a paying training student
I want one unified note field per lesson with bookmarks as inline timestamps, plus a single place to download my full notebook and the workbook PDF,
So that I can study actively during the video and walk away with a complete personal study document after the training.

## Problem Statement

Today the lesson page has two disconnected inputs: a standalone bookmarks panel and a plain textarea for notes. Bookmarks have a timestamp but live separate from the thoughts they relate to. Notes are plain text, no structure, no way to jump back to a video moment from within them. There is no export — students who finish a training cannot take anything with them. The workbook download is a naked PDF link with no context, title, or visual.

## Solution Statement

Merge bookmarks into the notes as inline timestamp chips rendered by a Tiptap editor with a 4-button toolbar. Add a Convex action that renders all notes for a training into a single PDF via `@react-pdf/renderer`. Expand the `trainings.workbook*` schema with a button label and surface it through a richer `WorkbookCard` component used on both the lesson page and the training overview page. Add a back button and a *Mijn materiaal* section on the overview.

## Feature Metadata

**Feature Type:** Enhancement (with one small new capability: PDF export)
**Estimated Complexity:** Medium-High
**Primary Systems Affected:** `src/components/training/*`, `convex/userNotes.ts`, `convex/bookmarks.ts` (migration only), `convex/schema.ts`, `src/app/admin/AdminClient.tsx` (workbook section), new Convex action for PDF export
**Dependencies:** `@tiptap/react`, `@tiptap/starter-kit`, `@react-pdf/renderer`

## Execution Strategy

**Recommended:** `/execute-big`

**Analysis:**
- Total tasks: ~22 across 4 phases
- Independent workstreams: yes — schema/admin (Phase 4) and Tiptap editor (Phase 1) touch different files and can run in parallel after the schema migration lands
- Same-file conflicts: minimal — `ModulePageClient.tsx` is touched in phases 1, 2 and 4 so those must serialize

**Recommendation rationale:** The phases are substantial enough and touch distinct subsystems (backend schema, admin, lesson page, overview page, PDF renderer) that parallel agent teams save wall-clock time. Serialize only the `ModulePageClient.tsx` edits.

---

## DECISIONS FROM CONVERSATION

### Architecture Choices

**Tiptap over markdown-lite textarea:**
- What: Use `@tiptap/react` + `@tiptap/starter-kit` as the notes editor
- Why: Tim explicitly wants toggle-state toolbar buttons (Title button lights up copper when cursor is in an H2) and does NOT want the user to see raw markdown characters. A plain textarea cannot satisfy both. Tiptap is the minimum tool that delivers WYSIWYG + toggle state + custom nodes for timestamp chips.
- Rejected alternative: markdown-in-textarea approach where the user sees `##` and `-` characters. Ruled out because Tim said "gebruiker dat niet ziet en gewoon de buttons gebruikt".

**Bookmarks merged into notes, not kept as parallel data:**
- What: Drop the standalone `BookmarksPanel` from the lesson page. The "Bladwijzer op huidige tijd" button moves into the notes toolbar and inserts a custom `timestamp` Tiptap node at the cursor.
- Why: Single source of truth, less visual clutter, and the timestamp naturally lives next to the thought it annotates.
- Migration: existing `bookmarks` rows prepend into the user's note for that module as timestamp nodes. `bookmarks` table stays read-only for now, dropped in a later cleanup.

**PDF renderer = `@react-pdf/renderer` (pure JS):**
- Why: Runs inside a Convex action, no headless browser, no system binaries. Adequate for the layout we need (cover, grouped sections, paragraphs, bullets, inline chips).
- Rejected: Puppeteer — too heavy for Convex, requires browser install.

**Workbook lives at training level, not module level:**
- What: Use and expand existing `trainings.workbookNl/En/De` objects in `convex/schema.ts:834-858`. Module-level `workbookStorageId` on `trainingModules` (line 885) is legacy, leave alone for now.
- Why: Schema already has per-language workbook objects with title/description/image. We only need to add `buttonLabel` and wire up a frontend component.

### Phased Approach

**Phase 1 (NOW — In scope, in this order):**
1. **Phase 4 first: Workbook schema + admin + `WorkbookCard` component** — foundation, touches `AdminClient.tsx` which is already over the 500-line limit and needs splitting per CLAUDE.md tech-debt notes
2. **Phase 2: Back button + training overview *Mijn materiaal* section** — uses the `WorkbookCard` from Phase 4
3. **Phase 1: Tiptap rich-text notes + merged bookmarks** — largest isolated frontend change
4. **Phase 3: Notes PDF export** — builds on Tiptap `contentJson` from previous phase

**Phase 2 (LATER — Deferred):**
- Dropping the `bookmarks` table entirely (after migration stabilizes)
- Per-module PDF export
- Deeplink from PDF timestamps to video (`?t=123` query param handled by `VideoPlayer`)
- Cross-training "my library" page with all notes from all trainings
- Notes search across trainings

**Phase 5 (NOW — confirmed by Tim):**
- Render a compact prev/next nav at the bottom of the `ModuleSidebar` (right column, next to the video), in addition to the existing placement at the bottom of the main column (`ModulePageClient.tsx:357-400`). Both stay in sync using the same `nav.prev`/`nav.next` from the `useMemo` in `ModulePageClient.tsx:115-192`.

### Rejected Alternatives

**Markdown-lite textarea:** Rejected — user would see raw `##`/`-` characters.

**Lexical editor (Meta):** Rejected — more boilerplate for a relatively small editor usecase, ecosystem smaller than Tiptap for React.

**Vimeo auto-translate captions:** Discussed and deferred. Not part of this plan but noted: NL→EN/DE captions via DeepL API + Vimeo Text Tracks API is a separate future script (`scripts/translate-vimeo-captions.ts`).

**Custom Vimeo player controls (to hide Vimeo logo):** Rejected for now. Tim has Pro plan + brand preset; will try Vimeo Player Preset first. Custom HTML5 controls would be a major rebuild.

### User Preferences & Constraints

**Technical preferences:**
- Tiptap over Lexical — confirmed above
- Copper (`#B5622A`) as the active-state color for toolbar buttons and timestamp chips — project design system
- Single wide note field, toolbar above — Tim's explicit UX request
- Toolbar buttons light up fully copper when their block is active — Tim's explicit UX request

**Constraints:**
- **500-line file limit per CLAUDE.md** — `AdminClient.tsx` is already ~1400 lines and on the tech-debt list. Phase 4 MUST split it (start by extracting `AdminTrainingTab` / `AdminWorkbookEditor` submodules) rather than adding more code to the existing monolith.
- **Strict TypeScript, no `any`** per CLAUDE.md
- **All UI text through i18n** — both `src/lib/i18n.ts` and component-level COPY objects. Never hardcoded NL strings.
- **`next/image` always, `next/link` always** — CLAUDE.md rules.
- **Git: no commits/pushes without explicit "commit dit" instruction** — per feedback memory.

**Quality expectations:**
- Editor must handle paste-from-Word cleanly (Tiptap's `StarterKit` covers most of this)
- PDF export must be fast enough to run in a Convex action (no multi-minute renders)
- Workbook card must be responsive, editorial style, rounded-[2px], border-rule separators — design system

### Edge Cases & Error Scenarios

- **User has no notes yet, clicks PDF download:** Return a friendly "Je hebt nog geen notities" error instead of empty PDF.
- **User has bookmarks but no notes when migrating:** Create a new `userNotes` row with the timestamps as the initial content.
- **Video not yet loaded when user clicks Bladwijzer toolbar button:** Disable button or show a toast — don't insert `[0:00]`.
- **Workbook has no thumbnail uploaded:** Fall back to a copper placeholder block, don't break layout.
- **Tiptap `contentJson` is null on legacy rows:** Lazy-migrate plain `content` into a single paragraph node on first load.
- **ArrowLeft/Right while typing in the editor:** Already handled in `ModulePageClient.tsx` — checks for INPUT/TEXTAREA/contentEditable. Tiptap editors ARE contentEditable so arrow keys correctly do NOT navigate lessons while the user is writing.

---

## CONTEXT REFERENCES

### Relevant Codebase Files

READ THESE BEFORE IMPLEMENTING:

- `src/components/training/ModulePageClient.tsx` (all) — main lesson shell, imports all other training components. Touched in every phase.
- `src/components/training/VideoPlayer.tsx` (lines 50-135) — Vimeo Player SDK integration and the `getCurrentTime` + `setCurrentTime` calls we need for the Bladwijzer toolbar button.
- `src/components/training/BookmarksPanel.tsx` (lines 52-124) — existing Vimeo Player helpers + jump/play logic. The `getVimeoPlayer()` helper should be extracted and reused by the new `TimestampNode`.
- `src/components/training/NotesPanel.tsx` — current plain textarea implementation, replaced entirely in Phase 1.
- `src/components/training/TrainingOverviewClient.tsx` — target for Phase 2 "Mijn materiaal" section + back button target.
- `convex/schema.ts:825-894` — `trainings` (workbook fields already in place for NL/EN/DE, shared image) and `trainingModules`.
- `convex/schema.ts:963-980` — `bookmarks` + `userNotes` tables, schema changes land here.
- `convex/userNotes.ts` — existing upsert mutation, needs `contentJson` field.
- `convex/bookmarks.ts` — existing CRUD, leave intact for migration compat.
- `src/app/admin/AdminClient.tsx` (~1400 lines) — MUST be split before adding the workbook editor. Start by extracting one tab.
- `CLAUDE.md` — design system tokens, file-size rule, commit discipline.

### New Files to Create

- `src/components/training/NotesEditor.tsx` — Tiptap-based rich text editor (replaces `NotesPanel`).
- `src/components/training/NotesEditorToolbar.tsx` — copper toggle button row (Title / Bullets / Numbers / Bookmark).
- `src/components/training/tiptap/TimestampNode.ts` — custom Tiptap node for `[mm:ss]` chips, click → seek + play via Vimeo SDK.
- `src/components/training/tiptap/vimeoPlayer.ts` — shared Vimeo Player accessor (extracted from `BookmarksPanel`).
- `src/components/training/WorkbookCard.tsx` — rich workbook presentation with thumbnail, title, description, custom button.
- `src/components/training/NotesDownloadButton.tsx` — triggers the PDF export action and downloads the result.
- `src/components/training/LessonBackButton.tsx` — small "← Terug naar overzicht" component.
- `convex/userNotesPdf.ts` — new Convex action using `@react-pdf/renderer` to render notes to PDF bytes, returns a signed storage URL.
- `src/app/admin/training/WorkbookEditor.tsx` — extracted admin panel for editing per-language workbook fields (first step of splitting `AdminClient.tsx`).

### Patterns to Follow

**Pattern: Vimeo Player SDK access**
From: `src/components/training/BookmarksPanel.tsx:52-63`

```typescript
async function getVimeoPlayer() {
  const iframe = document.querySelectorAll("iframe[src*='vimeo']")[0] as HTMLIFrameElement | undefined;
  const Player = (window as { Vimeo?: { Player: any } }).Vimeo?.Player;
  if (!iframe || !Player) return null;
  return new Player(iframe);
}
```

**Why this pattern:** Already proven, handles missing player gracefully, typed without `any` escape hatch at the callsite.
**Apply to:** Extract to `tiptap/vimeoPlayer.ts`, import from `NotesEditorToolbar` (for Bladwijzer button) and from `TimestampNode` click handler.

**Pattern: Localized string helper**
From: `src/components/training/ModulePageClient.tsx:19-21`

```typescript
type LocalizedStr = { nl: string; en: string; de?: string };
function loc(obj: LocalizedStr, lang: Lang): string {
  return obj[lang] || obj.nl || obj.en || "";
}
```

**Apply to:** `WorkbookCard` reads `workbookNl/En/De` objects via this pattern, falling back gracefully.

**Pattern: Per-language workbook record**
From: `convex/schema.ts:834-857`

The existing `workbookNl/En/De` objects already have `storageId`, `fileName`, `title`, `description`. Phase 4 adds `buttonLabel` to each of the three objects.

### Key Findings from Agent Research

None used — the conversation and direct codebase reading covered everything needed.

---

## IMPLEMENTATION PLAN

### Phase 4 FIRST — Workbook body + admin split

**Why first:** Unblocks Phase 2 (*Mijn materiaal* section needs `WorkbookCard`). Forces `AdminClient.tsx` split which is CLAUDE.md tech debt. Schema change should land before anything touches it.

**Tasks:**
- Extend `trainings.workbookNl/En/De` schema with `buttonLabel: v.optional(v.string())` and an optional per-language override for the shared `workbookImageStorageId`.
- Update `convex/trainings.ts` queries/mutations to read/write the new field.
- Extract `src/app/admin/training/WorkbookEditor.tsx` from `AdminClient.tsx`. Wire up file upload for PDF + thumbnail, input fields for title, description, button label per language.
- Build `WorkbookCard.tsx` (thumbnail left, text right, copper CTA button, responsive collapse on mobile).
- Replace the simple workbook strip in `ModulePageClient.tsx:324-342` with `<WorkbookCard />`.

### Phase 2 — Back button + overview *Mijn materiaal*

**Tasks:**
- `LessonBackButton.tsx` — copper outline, arrow icon, linked to `/training/[slug]`.
- Add it above the breadcrumb in `ModulePageClient.tsx` around line 266.
- In `TrainingOverviewClient.tsx`, add a new section below the modules list: *Mijn materiaal*. Contains `<WorkbookCard />` (training-level) + `<NotesDownloadButton />`.
- `NotesDownloadButton.tsx` is a stub in this phase — it calls an action that doesn't exist yet. Disable with "Binnenkort beschikbaar" label or hide until Phase 3.

### Phase 1 — Tiptap rich-text notes

**Tasks:**
- `npm i @tiptap/react @tiptap/starter-kit`
- Create `tiptap/vimeoPlayer.ts` — extracted Vimeo accessor.
- Create `tiptap/TimestampNode.ts` — custom Tiptap node with attrs `{ seconds: number }`. Renders as copper chip `<button>[mm:ss]</button>` with click → seek + play. Serializes to `{ type: "timestamp", attrs: { seconds } }`.
- Create `NotesEditorToolbar.tsx` — 4 buttons: Title (H2 toggle), Bullets, Numbers, Bookmark. Copper fill when `editor.isActive(...)` is true. Bladwijzer button reads Vimeo current time, inserts TimestampNode at cursor.
- Create `NotesEditor.tsx` — wires `useEditor`, `StarterKit` (disable blockquote + codeBlock), adds `TimestampNode`, debounced save (2s) to `userNotes` mutation.
- Schema: add `contentJson: v.optional(v.any())` to `userNotes`. Keep `content` as plain-text fallback.
- `convex/userNotes.ts` — update `upsert` to accept and store `contentJson`.
- Lazy migration: on first load of an existing row, if `contentJson` is null and `content` is non-empty, wrap the plain text in a single paragraph node client-side and save on first edit.
- Bookmark migration: one-time Convex migration (script or internal mutation) that iterates `bookmarks` by user × module, builds timestamp nodes, prepends them to the matching `userNotes.contentJson` (or creates a new row). After dry-run + verification, mark bookmarks as migrated (field `migratedAt` on `bookmarks`).
- Remove `<BookmarksPanel />` from `ModulePageClient.tsx:345` and the import. Tab:`<NotesEditor />` replaces `<NotesPanel />` at line 348.
- Keep `bookmarks` table + mutations intact (read-only) until Phase 3 is stable.

### Phase 3 — Notes PDF export

**Tasks:**
- `npm i @react-pdf/renderer`
- Create `convex/userNotesPdf.ts` — action `exportTrainingNotes({ trainingId })`. Fetches all `userNotes` for the current user filtered by training, joins with `trainingModules` for titles + ordering, renders via `@react-pdf/renderer`, uploads result to `_storage`, returns signed URL.
- Renderer walks the Tiptap `contentJson` tree: `paragraph` → `<Text>`, `heading` level 2 → `<Text fontSize={18}>`, `bulletList` → bullets, `orderedList` → numbers, `timestamp` node → inline `[mm:ss]` in copper.
- Cover page: training title (from `trainings.title`), student name (from `users`), export date.
- Wire `NotesDownloadButton.tsx` to call the action and `window.open(url)` the result.
- Empty state: if no notes, surface a friendly error toast instead of an empty PDF.

### Phase 5 — Prev/next under ModuleSidebar

**Tasks:**
- Add a compact prev/next row at the bottom of `src/components/training/ModuleSidebar.tsx`, below the lesson list. Copper outline arrow-in-box style matching the main-column version but smaller (single line, truncated lesson title).
- Accept `prev` and `next` (nullable) as new props, passed down from `ModulePageClient.tsx:407-420` where the sidebar is rendered — reusing the same `nav.prev`/`nav.next` from the existing `useMemo`.
- Hide the row entirely when both prev and next are null.
- No new data or schema — purely a UI addition that mirrors existing state.

**Why:** Tim wants the prev/next controls directly next to the video (where his eyes already are) in addition to the main-column footer position. Both stay in sync because they bind to the same computed `nav` object.

**Note on the main-column row:** keep it. Two placements is intentional — the sidebar version is for quick hopping while watching, the main-column version is the natural "I finished everything on this page, now what" footer.

---

## STEP-BY-STEP TASKS

Execute in order. Each task is atomic and testable.

### UPDATE convex/schema.ts

- **IMPLEMENT:** Add `buttonLabel: v.optional(v.string())` to the `workbookNl`, `workbookEn`, `workbookDe` objects on `trainings`. Add `contentJson: v.optional(v.any())` to `userNotes`. Add `migratedAt: v.optional(v.number())` to `bookmarks`.
- **PATTERN:** Follow existing per-language workbook object shape at `convex/schema.ts:834-857`.
- **WHY:** Foundation for Phase 4 workbook + Phase 1 Tiptap storage + Phase 1 bookmark migration tracking.
- **VALIDATE:** `npx convex dev` picks up schema without errors.

### UPDATE convex/trainings.ts

- **IMPLEMENT:** Extend the training create/update mutations to accept `buttonLabel` in each language workbook object.
- **WHY:** Admin needs to write the new field.
- **VALIDATE:** `npm run type-check`.

### CREATE src/app/admin/training/WorkbookEditor.tsx

- **IMPLEMENT:** Extract workbook editing UI from `AdminClient.tsx`. Fields per language: PDF upload, title, description, button label. Shared: thumbnail upload.
- **PATTERN:** Reuse existing storage-upload helpers from `AdminClient.tsx`.
- **WHY:** First step of the AdminClient split required by CLAUDE.md tech debt list.
- **VALIDATE:** Admin loads, can save a workbook, refresh shows persisted data.

### UPDATE src/app/admin/AdminClient.tsx

- **IMPLEMENT:** Import and render `<WorkbookEditor />` in the training edit panel. Remove the inline workbook JSX that was extracted.
- **WHY:** Wire up the extracted editor.
- **VALIDATE:** `npm run build` and manual admin check.

### CREATE src/components/training/WorkbookCard.tsx

- **IMPLEMENT:** Responsive card: thumbnail (`next/image`) left on desktop, stacked on mobile. Title, description, copper CTA button using `buttonLabel`. `lang` prop drives localization.
- **PATTERN:** `loc()` helper from `ModulePageClient.tsx:19-21`. Design tokens: `border-rule`, `rounded-[2px]`, `text-[10px] tracking-[0.2em] uppercase text-copper` label.
- **WHY:** Rich workbook surface used by both overview and lesson page.
- **VALIDATE:** Storybook or manual smoke in a sandbox page.

### UPDATE src/components/training/ModulePageClient.tsx

- **IMPLEMENT:** Replace the workbook strip at lines 324-342 with `<WorkbookCard training={training} lang={lang} />`.
- **WHY:** Unified presentation.
- **VALIDATE:** Lesson page renders, download still works.

### CREATE src/components/training/LessonBackButton.tsx

- **IMPLEMENT:** `next/link` back to `/training/[slug]`, copper outline, left arrow icon, `lang`-aware label.
- **VALIDATE:** Click returns to overview.

### UPDATE src/components/training/ModulePageClient.tsx (back button)

- **IMPLEMENT:** Render `<LessonBackButton />` just above the breadcrumb `<nav>` (line 266).
- **VALIDATE:** Button visible and functional on every lesson.

### UPDATE src/components/training/TrainingOverviewClient.tsx

- **IMPLEMENT:** Add *Mijn materiaal* section below the modules list containing `<WorkbookCard />` (if training has a workbook) and `<NotesDownloadButton />` (stub for now).
- **PATTERN:** Existing section spacing / headings in the overview.
- **VALIDATE:** Overview renders both cards.

### INSTALL Tiptap

- **IMPLEMENT:** `npm i @tiptap/react @tiptap/starter-kit`
- **VALIDATE:** `package.json` updated, no peer-dep warnings.

### CREATE src/components/training/tiptap/vimeoPlayer.ts

- **IMPLEMENT:** Export `getVimeoPlayer()` — moved from `BookmarksPanel.tsx:52-63`, stricter type.
- **PATTERN:** Keep the same graceful null-return behavior.
- **VALIDATE:** Compile only.

### CREATE src/components/training/tiptap/TimestampNode.ts

- **IMPLEMENT:** Tiptap `Node.create({ name: "timestamp", group: "inline", inline: true, atom: true, addAttributes: { seconds } })`. Render as a `<button>` element with copper styling, click handler seeks + plays via `getVimeoPlayer()`.
- **PATTERN:** See Tiptap docs for custom inline atom nodes.
- **VALIDATE:** Manual: insert a timestamp, click it, video jumps.

### CREATE src/components/training/NotesEditorToolbar.tsx

- **IMPLEMENT:** Row of 4 buttons. Each button uses `editor.isActive(...)` to compute copper-filled vs outlined state. Bladwijzer button: `await getVimeoPlayer(); t = await player.getCurrentTime(); editor.chain().focus().insertContent({ type: "timestamp", attrs: { seconds: Math.round(t) } }).run()`.
- **VALIDATE:** Buttons toggle correctly, Bladwijzer inserts chip at cursor.

### CREATE src/components/training/NotesEditor.tsx

- **IMPLEMENT:** `useEditor` with StarterKit (disable blockquote, codeBlock) + TimestampNode. Debounced save every 2s. Props: `moduleId`, `trainingId`, `initialContentJson`, `initialContent`, `lang`.
- **PATTERN:** Debounce via `useEffect` + `setTimeout` cleanup. Save via `api.userNotes.upsert` with `contentJson` field.
- **VALIDATE:** Type, refresh, content persists.

### UPDATE convex/userNotes.ts

- **IMPLEMENT:** Extend `upsert` mutation to accept `contentJson: v.optional(v.any())` and write it. Keep `content` optional for backwards compat.
- **VALIDATE:** Convex type-check + manual save round-trip.

### CREATE convex/migrations/bookmarksToNotes.ts

- **IMPLEMENT:** Internal mutation that iterates `bookmarks`, groups by user × module, builds an array of TimestampNode JSON objects sorted by `videoTimestamp`, prepends them into the matching `userNotes.contentJson` (creating a note row if missing), then sets `migratedAt` on the bookmark.
- **WHY:** Preserve existing user data when switching the source of truth.
- **VALIDATE:** Dry-run on dev DB, inspect a few notes before enabling in production.

### UPDATE src/components/training/ModulePageClient.tsx (notes swap)

- **IMPLEMENT:** Replace `<NotesPanel />` at line 348 with `<NotesEditor />`. Remove `<BookmarksPanel />` at line 345 and its import.
- **VALIDATE:** Lesson page loads, editor works, no bookmarks panel.

### INSTALL @react-pdf/renderer

- **IMPLEMENT:** `npm i @react-pdf/renderer`
- **VALIDATE:** Package installed.

### CREATE convex/userNotesPdf.ts

- **IMPLEMENT:** Action `exportTrainingNotes({ trainingId })`. Fetches `userNotes` by user + training, joins with `trainingModules` for titles, renders PDF via `@react-pdf/renderer`, stores in `_storage`, returns signed URL.
- **PATTERN:** Existing Convex action patterns in the repo (check an existing action for the storage write + URL pattern).
- **WHY:** Core deliverable of Phase 3.
- **VALIDATE:** Call from dev, open returned URL, check layout.

### UPDATE src/components/training/ModuleSidebar.tsx

- **IMPLEMENT:** Accept new props `prev` and `next` (nullable `SidebarLesson`). Render a compact prev/next row at the bottom of the sidebar using copper outline boxed arrows matching the main-column style. Hide when both are null.
- **PATTERN:** Mirror the markup from `ModulePageClient.tsx:357-400` but smaller (one line, truncated title).
- **WHY:** Phase 5 — quick lesson hop next to the video.
- **VALIDATE:** Lesson page shows prev/next both under the sidebar and under the main column; clicking either navigates correctly.

### UPDATE src/components/training/ModulePageClient.tsx (sidebar props)

- **IMPLEMENT:** Pass `prev={nav.prev}` and `next={nav.next}` to `<ModuleSidebar />` at line 408.
- **VALIDATE:** TypeScript clean, sidebar renders the new row.

### UPDATE src/components/training/NotesDownloadButton.tsx

- **IMPLEMENT:** Enable the button, call the action, `window.open(url)`. Handle empty-notes error with a toast.
- **VALIDATE:** Click downloads a valid PDF with real notes inside.

---

## TESTING STRATEGY

### Unit Tests

- `loc()` helper branches (nl/en/de fallback) — reused by `WorkbookCard`.
- TimestampNode serialization round-trip: `contentJson` → render → save → reload produces the same JSON.
- Tiptap toolbar: `editor.isActive('heading', { level: 2 })` reflects cursor position after `toggleHeading`.
- PDF renderer: given a fixed `contentJson` fixture, snapshot the resulting `<Document>` element tree.

### Integration Tests

- Notes editor: type, paste from Word, insert timestamp, reload — content persists and is rendered.
- Bookmark migration: seed 3 bookmarks + 1 note for a user, run migration, assert the note has 3 timestamp nodes prepended in chronological order and bookmarks are marked `migratedAt`.
- PDF export: seed notes across 2 modules, call action, inspect returned PDF has 2 module sections.

### Edge Cases

- User with only bookmarks (no notes) — migration creates a fresh note.
- Tiptap `contentJson` null on old rows — lazy wrap into paragraph, no data loss.
- Workbook missing thumbnail — card falls back to copper placeholder.
- PDF export with zero notes — returns friendly error, no empty PDF.
- User pastes an image into the editor — StarterKit strips to plain text (not supporting images in this phase).

### Test Patterns

- Vitest + Testing Library (existing in repo).
- Convex action tests via `convexTest` helper.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
npm run lint
npm run type-check
```

### Level 2: Unit Tests

```bash
npm test
```

### Level 3: Build

```bash
npm run build
```

### Level 4: Manual

1. Admin: edit a training workbook, set title + description + button label + thumbnail, save, reload.
2. Lesson page: workbook card renders with all fields in NL and EN.
3. Lesson page: notes editor toggles headings/lists, Bladwijzer button inserts a copper chip, clicking chip seeks the video.
4. Arrow keys navigate lessons when cursor is outside the editor, do NOT navigate when cursor is inside the editor.
5. Training overview: back button from a lesson returns here; *Mijn materiaal* section shows workbook card + notes download button.
6. Notes download: click produces a PDF with cover, grouped modules, notes, inline timestamps rendered as `[mm:ss]` in copper.
7. Migration: on a dev account with existing bookmarks, confirm bookmarks appear as timestamp nodes at the top of the matching note.

---

## ACCEPTANCE CRITERIA

- [ ] Workbook schema has `buttonLabel` per language; admin UI edits all fields; `WorkbookCard` renders them.
- [ ] `AdminClient.tsx` is smaller than before (at least one tab extracted to its own file).
- [ ] Lesson page shows back button linking to training overview.
- [ ] Training overview shows *Mijn materiaal* section with workbook + notes download.
- [ ] Notes editor is a single wide Tiptap field with copper toggle toolbar (Title / Bullets / Numbers / Bladwijzer).
- [ ] Bladwijzer button inserts clickable `[mm:ss]` chip at cursor; click seeks + plays video.
- [ ] `BookmarksPanel` is no longer rendered on the lesson page.
- [ ] Existing bookmarks migrated into notes; no data loss verified on a seeded account.
- [ ] PDF export produces a valid document with cover + grouped modules + notes + inline timestamps.
- [ ] Arrow keys navigate lessons outside the editor and do NOT when inside it.
- [ ] Prev/next nav is rendered both under the main column AND under the `ModuleSidebar` (right column), staying in sync.
- [ ] All text through i18n (NL/EN/DE), no hardcoded NL in new components.
- [ ] No new file exceeds 500 lines (CLAUDE.md).
- [ ] `npm run lint`, `npm run type-check`, `npm run build` all pass.

---

## DEFERRED ITEMS

### Phase 2 Features
- **Drop `bookmarks` table entirely:** keep read-only for at least one release after migration.
- **Per-module PDF export:** only training-wide in v1.
- **PDF timestamp deeplinks:** timestamps render as plain text in PDF v1; clickable deeplinks to `lesson?t=123` is a later enhancement requiring VideoPlayer to read the query param.
- **Notes search / cross-training library page:** future.
- **Image/embed support in notes editor:** explicitly out of scope; paste-as-plain-text only.

### Future Enhancements
- **Vimeo captions automation:** separate script, not in this plan.
- **Custom Vimeo player controls:** only if Pro brand preset doesn't hide the logo.

### Known Limitations
- PDF uses `@react-pdf/renderer` fonts — may need a custom font file if Playfair/DM Sans should match the website exactly. Otherwise fall back to Helvetica.
- Tiptap adds ~50kb gzipped to the lesson route bundle. Acceptable given the page already loads Vimeo.

---

## NOTES & CONTEXT

### Conversation Summary

Tim drove this session iteratively. Started with small tweaks to the auto-next countdown (5 → 10s) and lesson arrow-key navigation, then Vimeo player color/branding. From there the conversation expanded into the broader UX redesign: merging bookmarks into notes, adding a notebook PDF export, and giving the workbook download proper visual weight on both the overview and lesson pages. Tim explicitly chose Tiptap over plain markdown after considering both, because he wants WYSIWYG toggle-state toolbar buttons.

### Design Rationale

- **Single source of truth (merged bookmarks + notes)** beats parallel data because users think of a bookmark as "this moment + my thought", not two separate records.
- **Tiptap beats a plain textarea** because the user explicitly does not want to see raw markdown.
- **Phase 4 first** because it forces the `AdminClient.tsx` split, and because `WorkbookCard` is a dependency for Phase 2.
- **Workbook at training level, not module level** because the schema already supports it and it's how the user thinks about workbooks (one per training).

### Assumptions Made

- `AdminClient.tsx` can be split incrementally; we don't have to do the whole thing in this feature.
- `@react-pdf/renderer` runs inside Convex actions without special Node APIs. Verify on first implementation.
- The existing `bookmarks` data volume is small enough to migrate in a single internal mutation. Verify before running.
- Vimeo player SDK loads before the user opens the editor (otherwise Bladwijzer button is briefly disabled).

### Questions Answered

- Q: Tiptap or markdown-lite? → A: Tiptap — users must not see raw markdown.
- Q: Bookmarks as parallel data or merged? → A: Merged into notes.
- Q: Workbook at training level or module level? → A: Training level, schema already supports it.
- Q: Phase order? → A: 4 → 2 → 1 → 3. Confirmed by Tim.
- Q: Vimeo logo removal? → A: Try Pro brand preset first, custom controls deferred.

### For Future Reference

- The `bookmarks` table stays for one release cycle after migration as a safety net. Revisit removing it once PDF exports confirm the merged model works in production.
- `AdminClient.tsx` split is a slow refactor — this feature extracts one tab (workbook). Future features should continue the split rather than growing the monolith.
- Tiptap `contentJson` becomes the canonical notes format. Any future notes features (search, AI summaries, etc.) should read from it, not from legacy `content`.
