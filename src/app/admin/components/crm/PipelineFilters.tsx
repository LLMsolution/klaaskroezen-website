"use client";

import { useState } from "react";

export type PipelineFilterState = {
  assignee: string;
  dateFrom: string;
  dateTo: string;
  valueMin: string;
  valueMax: string;
  probabilityMin: string;
  source: string;
  overdueOnly: boolean;
  noActionOnly: boolean;
};

export const defaultFilters: PipelineFilterState = {
  assignee: "",
  dateFrom: "",
  dateTo: "",
  valueMin: "",
  valueMax: "",
  probabilityMin: "",
  source: "",
  overdueOnly: false,
  noActionOnly: false,
};

const SOURCES = [
  { value: "", label: "Alle bronnen" },
  { value: "website", label: "Website" },
  { value: "bol.com", label: "Bol.com" },
  { value: "cold-call", label: "Cold call" },
  { value: "referral", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "email", label: "E-mail" },
  { value: "event", label: "Event" },
  { value: "import", label: "Import" },
];

type Props = {
  filters: PipelineFilterState;
  onChange: (filters: PipelineFilterState) => void;
};

export function PipelineFilters({ filters, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  const activeCount = countActive(filters);

  function update(partial: Partial<PipelineFilterState>) {
    onChange({ ...filters, ...partial });
  }

  function reset() {
    onChange(defaultFilters);
  }

  return (
    <div className="space-y-3">
      {/* Toggle + assignee (always visible) */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Filter op eigenaar..."
          value={filters.assignee}
          onChange={(e) => update({ assignee: e.target.value })}
          className="px-3 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent w-[200px]"
        />
        <button
          onClick={() => setExpanded(!expanded)}
          className={`px-3 py-1.5 text-[12px] rounded-[2px] border transition-colors cursor-pointer ${
            expanded || activeCount > 0
              ? "border-copper text-copper bg-copper/5"
              : "border-rule text-ink/50 hover:text-ink"
          }`}
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="text-[11px] text-ink/40 hover:text-ink transition-colors cursor-pointer"
          >
            Wissen
          </button>
        )}
      </div>

      {/* Expanded filter bar */}
      {expanded && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 border border-rule rounded-[2px] p-4">
          {/* Date range */}
          <div>
            <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 block mb-1">
              Aangemaakt van
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => update({ dateFrom: e.target.value })}
              className="w-full px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 block mb-1">
              Aangemaakt tot
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => update({ dateTo: e.target.value })}
              className="w-full px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent"
            />
          </div>

          {/* Value range */}
          <div>
            <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 block mb-1">
              Min. bedrag (EUR)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={filters.valueMin}
              onChange={(e) => update({ valueMin: e.target.value })}
              className="w-full px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 block mb-1">
              Max. bedrag (EUR)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Onbeperkt"
              value={filters.valueMax}
              onChange={(e) => update({ valueMax: e.target.value })}
              className="w-full px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent"
            />
          </div>

          {/* Probability */}
          <div>
            <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 block mb-1">
              Min. kans (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              placeholder="0"
              value={filters.probabilityMin}
              onChange={(e) => update({ probabilityMin: e.target.value })}
              className="w-full px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent"
            />
          </div>

          {/* Source */}
          <div>
            <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 block mb-1">
              Bron
            </label>
            <select
              value={filters.source}
              onChange={(e) => update({ source: e.target.value })}
              className="w-full px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent"
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="flex items-end gap-4 col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.overdueOnly}
                onChange={(e) => update({ overdueOnly: e.target.checked })}
                className="rounded-[2px]"
              />
              <span className="text-[12px]">Alleen verlopen acties</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.noActionOnly}
                onChange={(e) => update({ noActionOnly: e.target.checked })}
                className="rounded-[2px]"
              />
              <span className="text-[12px]">Zonder volgende actie</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

/** Count how many non-default filters are active (excluding assignee which is always visible) */
function countActive(f: PipelineFilterState): number {
  let n = 0;
  if (f.dateFrom) n++;
  if (f.dateTo) n++;
  if (f.valueMin) n++;
  if (f.valueMax) n++;
  if (f.probabilityMin) n++;
  if (f.source) n++;
  if (f.overdueOnly) n++;
  if (f.noActionOnly) n++;
  return n;
}

/** Apply filter state to a flat list of leads (client-side) */
export function applyPipelineFilters<T extends {
  assignedTo?: string;
  createdAt: number;
  valueCents?: number;
  probability: number;
  source?: string;
  nextAction?: string;
  nextActionAt?: number;
}>(leads: T[], filters: PipelineFilterState): T[] {
  let result = leads;

  if (filters.assignee) {
    const q = filters.assignee.toLowerCase();
    result = result.filter((l) => l.assignedTo?.toLowerCase().includes(q));
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    result = result.filter((l) => l.createdAt >= from);
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime() + 86400000; // end of day
    result = result.filter((l) => l.createdAt < to);
  }

  if (filters.valueMin) {
    const min = Number(filters.valueMin) * 100; // EUR to cents
    result = result.filter((l) => (l.valueCents ?? 0) >= min);
  }

  if (filters.valueMax) {
    const max = Number(filters.valueMax) * 100;
    result = result.filter((l) => (l.valueCents ?? 0) <= max);
  }

  if (filters.probabilityMin) {
    const min = Number(filters.probabilityMin);
    result = result.filter((l) => l.probability >= min);
  }

  if (filters.source) {
    result = result.filter((l) => l.source === filters.source);
  }

  if (filters.overdueOnly) {
    const now = Date.now();
    result = result.filter((l) => l.nextActionAt !== undefined && l.nextActionAt < now);
  }

  if (filters.noActionOnly) {
    result = result.filter((l) => !l.nextAction);
  }

  return result;
}
