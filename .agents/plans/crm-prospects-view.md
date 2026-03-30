# Feature: CRM Prospects — Maandelijkse forecast view

## Context Note

Based on conversation with Tim (2026-03-30). He wants a forecast view next to the existing pipeline,
showing expected revenue per month based on deal value × probability × expected close date.

## Feature Description

A "Prospects" tab in the CRM section that shows open leads grouped by expected close month.
5 columns: current month + 4 months ahead. Each column shows the weighted expected revenue
(value × probability%) and the leads that contribute to it.

Same data as Pipeline — just a different view. Leads are editable in both views via the same
detail panel. Drag-and-drop between month columns changes the expected close date.

## User Story

As Klaas (admin), I want to see my expected revenue per month based on deal probability,
so I can forecast income and prioritize high-value opportunities.

## Problem Statement

Pipeline shows deals by stage but not by TIME. No way to see "how much revenue do I expect
in April vs May?" — critical for business planning.

## Solution Statement

Add `expectedCloseAt` field to leads. A lead appears in Prospects when it has value + probability +
expectedCloseAt all set. Group by month, show weighted revenue (value × probability / 100).
Kanban layout with months as columns, drag-and-drop to reschedule.

## Feature Metadata

**Type**: New Capability
**Complexity**: Medium
**Systems**: convex/schema.ts, convex/crmLeads.ts, admin UI (CRM section)
**Dependencies**: None — builds on existing leads infrastructure

## Execution Strategy

**Recommended**: `/execute-small` — sequential tasks touching related files

---

## DECISIONS FROM CONVERSATION

### Architecture

- **Same data, different view** — Pipeline and Prospects show the same `leads` table
- **New field `expectedCloseAt`** — separate from `nextActionAt` (which is "next follow-up action")
- **Three required fields for Prospects visibility**: valueCents + probability + expectedCloseAt
- **5 month columns**: current month + 4 months ahead
- **Weighted revenue formula**: sum(valueCents × probability / 100) per month
- **Only "open" leads** shown in Prospects
- **Drag-and-drop** between months changes `expectedCloseAt`

### What's NOT in scope

- Historical months (past months)
- Won/lost leads in Prospects
- Revenue actuals vs forecast comparison (future enhancement)

---

## CONTEXT REFERENCES

### Existing Files to Modify

- `convex/schema.ts` (line 440-466) — Add `expectedCloseAt` to leads table
- `convex/crmLeads.ts` — Add `getLeadsByMonth` query + update `updateLead`/`createLead` to accept `expectedCloseAt`
- `src/app/admin/components/crm/LeadDetailPanel.tsx` — Add date picker for expected close date
- `src/app/admin/components/crm/AddLeadForm.tsx` — Add expected close date field
- `src/app/admin/components/AdminSidebar.tsx` — Add "Prospects" nav item
- `src/app/admin/AdminClient.tsx` — Add tab type + component mapping

### New Files to Create

- `src/app/admin/components/crm/ProspectsTab.tsx` — Main tab with month columns
- `src/app/admin/components/crm/ProspectsKanban.tsx` — Kanban view grouped by month

### Patterns to Follow

**Kanban pattern**: `PipelineKanban.tsx` — HTML5 drag-and-drop, column layout, lead cards
**Detail panel**: `LeadDetailPanel.tsx` — slide-over edit panel (reuse directly)
**Query pattern**: `getLeadsByStage()` — groups leads with enriched contact data

---

## IMPLEMENTATION PLAN

### Task 1: Schema — Add `expectedCloseAt` to leads

**File**: `convex/schema.ts`
- Add `expectedCloseAt: v.optional(v.number())` to leads table (timestamp ms)
- Add index `by_expected_close: ["expectedCloseAt"]` for efficient month queries
- **VALIDATE**: `npx tsc --noEmit`

### Task 2: Backend — Add `getLeadsByMonth` query + update mutations

**File**: `convex/crmLeads.ts`
- Add `getLeadsByMonth` query:
  - Args: none (always shows current month + 4)
  - Filter: `status === "open"` AND `expectedCloseAt` is set AND `valueCents` is set
  - Group by month (YYYY-MM derived from expectedCloseAt)
  - Return per month: `{ month, label, leads[], totalValue, weightedValue }`
  - weightedValue = sum(lead.valueCents × lead.probability / 100)
  - Enrich leads with contact data (same pattern as getLeadsByStage)
- Update `updateLead` args to accept `expectedCloseAt: v.optional(v.number())`
- Update `createLead` args to accept `expectedCloseAt: v.optional(v.number())`
- Add `moveLeadToMonth` mutation:
  - Args: `leadId`, `expectedCloseAt` (first day of target month)
  - Patches lead + logs activity "Verwachte sluitingsdatum gewijzigd"
- **VALIDATE**: `npx tsc --noEmit`

### Task 3: UI — Update AddLeadForm with expected close date

**File**: `src/app/admin/components/crm/AddLeadForm.tsx`
- Add `expectedCloseAt` field: `<input type="month">` (YYYY-MM picker)
- Convert selected month to timestamp (first day of month, 00:00 UTC)
- Pass to `createLead` mutation
- **VALIDATE**: `npx next lint`

### Task 4: UI — Update LeadDetailPanel with date picker

**File**: `src/app/admin/components/crm/LeadDetailPanel.tsx`
- Add editable "Verwachte sluiting" field with `<input type="month">`
- Show current month value from `lead.expectedCloseAt`
- On change: call `updateLead` with new `expectedCloseAt`
- Also update `nextActionAt` to use a proper `<input type="date">` instead of hardcoded 7-day offset
- **VALIDATE**: `npx next lint`

### Task 5: UI — Create ProspectsKanban component

**File**: `src/app/admin/components/crm/ProspectsKanban.tsx`
- 5 columns: current month + 4 months ahead
- Column header: month name (NL) + weighted revenue total
- Lead cards: same as PipelineKanban cards (title, contact, value, probability badge)
- Each card shows: weighted value = valueCents × probability / 100
- Drag-and-drop between columns: calls `moveLeadToMonth` mutation
- Click on card: opens LeadDetailPanel (same as pipeline)
- Empty state per column: "Geen prospects"
- **Pattern**: Follow PipelineKanban.tsx structure
- **VALIDATE**: `npx next lint`

### Task 6: UI — Create ProspectsTab wrapper

**File**: `src/app/admin/components/crm/ProspectsTab.tsx`
- Stats row: Total weighted pipeline, # prospects, avg probability, highest value deal
- Assignee filter (same as PipelineTab)
- ProspectsKanban component
- LeadDetailPanel slide-over (reuse)
- **VALIDATE**: `npx next lint`

### Task 7: Navigation — Add "Prospects" to sidebar + AdminClient

**Files**: `AdminSidebar.tsx`, `AdminClient.tsx`
- Add `"crm-prospects"` to Tab type
- Add sidebar item between "Pipeline" and "Contacten" with trend icon
- Add tab label: "Prospects"
- Add conditional render: `{activeTab === "crm-prospects" && <ProspectsTab />}`
- Import ProspectsTab
- **VALIDATE**: `npx tsc --noEmit && npx next lint`

### Task 8: Deploy

- `git add && git commit && git push`
- `npx convex deploy --yes`
- **VALIDATE**: Check admin → CRM → Prospects tab loads

---

## TESTING STRATEGY

### Manual Validation

1. Create a lead with value €10.000, probability 40%, expected close May 2026
2. Verify it appears in Prospects under May column
3. Verify weighted value shows €4.000
4. Drag it to June → verify expectedCloseAt updated
5. Open detail panel from Prospects → edit works
6. Open same lead from Pipeline → same data visible
7. Create lead WITHOUT expectedCloseAt → should NOT appear in Prospects
8. Create lead without value → should NOT appear in Prospects

### Edge Cases

- Lead with probability 0% → shows €0 weighted (still visible)
- Lead with probability 100% → full value shown
- Multiple leads in same month → values sum correctly
- Lead closed (won/lost) → disappears from Prospects
- No leads with expectedCloseAt → empty state for all columns

---

## VALIDATION COMMANDS

```bash
npx tsc --noEmit          # Zero TypeScript errors
npx next lint             # Zero ESLint errors/warnings
```

---

## ACCEPTANCE CRITERIA

- [ ] Prospects tab visible in admin sidebar under CRM
- [ ] 5 month columns (current + 4 ahead)
- [ ] Leads grouped by expectedCloseAt month
- [ ] Weighted revenue per column (value × probability / 100)
- [ ] Drag-and-drop between months changes close date
- [ ] Click opens same LeadDetailPanel as pipeline
- [ ] Lead only appears when value + probability + expectedCloseAt all set
- [ ] Date picker in AddLeadForm and LeadDetailPanel
- [ ] All files under 500 lines
- [ ] Zero TypeScript/ESLint errors
