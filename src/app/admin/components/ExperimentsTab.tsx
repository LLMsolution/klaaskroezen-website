"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { formatDate, formatPrice, Loading, EmptyState, StatCard } from "./shared";
import { calculateSignificance } from "@/lib/ab-stats";

const STATUS_LABELS: Record<string, string> = {
  draft: "Concept",
  running: "Actief",
  paused: "Gepauzeerd",
  completed: "Afgerond",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-ink/5 text-ink/50",
  running: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-ink/5 text-ink/50",
};

export function ExperimentsTab() {
  const experiments = useQuery(api.abtest.getExperiments);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<Id<"experiments"> | null>(null);

  if (experiments === undefined) return <Loading />;

  const selected = selectedId ? experiments.find((e) => e._id === selectedId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
          {experiments.length} experiment{experiments.length !== 1 ? "en" : ""}
        </p>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-[12px] text-copper font-medium tracking-[0.1em] uppercase hover:text-copper-light transition-colors cursor-pointer"
        >
          {showCreate ? "Annuleren" : "+ Nieuw experiment"}
        </button>
      </div>

      {showCreate && <CreateExperimentForm onDone={() => setShowCreate(false)} />}
      {selected && <ExperimentDetail experiment={selected} onClose={() => setSelectedId(null)} />}

      {experiments.length === 0 && !showCreate ? (
        <EmptyState text="Nog geen experimenten. Maak je eerste checkout A/B test aan." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {experiments.map((exp) => (
            <ExperimentCard
              key={exp._id}
              experiment={exp}
              isSelected={selectedId === exp._id}
              onClick={() => setSelectedId(selectedId === exp._id ? null : exp._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Experiment Card ─── */

function ExperimentCard({
  experiment: exp,
  isSelected,
  onClick,
}: {
  experiment: { _id: Id<"experiments">; name: string; slug: string; product: string; status: string; impressionsA: number; impressionsB: number; conversionsA: number; conversionsB: number; winner?: string; createdAt: number };
  isSelected: boolean;
  onClick: () => void;
}) {
  const totalImpressions = exp.impressionsA + exp.impressionsB;
  const totalConversions = exp.conversionsA + exp.conversionsB;
  const convRate = totalImpressions > 0 ? Math.round((totalConversions / totalImpressions) * 100) : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      className={`text-left border rounded-[2px] p-4 transition-colors cursor-pointer ${
        isSelected ? "border-copper bg-copper/5" : "border-rule hover:border-copper/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] text-ink/40 font-mono truncate">{exp.slug}</span>
        <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-[2px] font-medium ${STATUS_COLORS[exp.status]}`}>
          {STATUS_LABELS[exp.status]}
        </span>
      </div>
      <p className="text-[13px] font-medium text-ink mb-1">{exp.name}</p>
      <p className="text-[10px] text-ink/40 mb-2">Product: {exp.product}</p>
      <div className="flex items-center gap-3 text-[11px] text-ink/50">
        <span>{totalImpressions} bezoekers</span>
        <span>{totalConversions} conversies</span>
        <span className={convRate >= 5 ? "text-green-600 font-medium" : ""}>{convRate}%</span>
      </div>
      {exp.winner && (
        <p className="mt-2 text-[11px] font-medium text-green-600">Winnaar: Variant {exp.winner}</p>
      )}
    </div>
  );
}

/* ─── Experiment Detail ─── */

function ExperimentDetail({
  experiment: exp,
  onClose,
}: {
  experiment: {
    _id: Id<"experiments">; name: string; slug: string; product: string; status: string;
    variantALabel: string; variantBLabel: string; weight: number;
    impressionsA: number; impressionsB: number; conversionsA: number; conversionsB: number;
    revenueA: number; revenueB: number; winner?: string;
    createdAt: number; startedAt?: number; completedAt?: number;
  };
  onClose: () => void;
}) {
  const startExp = useMutation(api.abtest.startExperiment);
  const pauseExp = useMutation(api.abtest.pauseExperiment);
  const declareWinner = useMutation(api.abtest.declareWinner);
  const deleteExp = useMutation(api.abtest.deleteExperiment);

  const stats = calculateSignificance({
    impressionsA: exp.impressionsA,
    impressionsB: exp.impressionsB,
    conversionsA: exp.conversionsA,
    conversionsB: exp.conversionsB,
  });

  return (
    <div className="border border-copper/30 rounded-[2px] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-warm/30 border-b border-rule">
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">Experiment detail</p>
          <span className="text-[11px] text-ink/40 font-mono">{exp.slug}</span>
        </div>
        <button onClick={onClose} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer">Sluiten</button>
      </div>

      <div className="p-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Bezoekers" value={String(exp.impressionsA + exp.impressionsB)} />
          <StatCard label="Conversies" value={String(exp.conversionsA + exp.conversionsB)} />
          <StatCard label="Omzet" value={formatPrice((exp.revenueA + exp.revenueB))} accent />
          <StatCard label="Betrouwbaarheid" value={`${stats.confidence}%`} sub={stats.significant ? "Significant!" : "Meer data nodig"} />
        </div>

        {/* Variant comparison */}
        <div className="grid grid-cols-2 gap-4">
          <VariantCard
            label="A"
            name={exp.variantALabel}
            impressions={exp.impressionsA}
            conversions={exp.conversionsA}
            revenue={exp.revenueA}
            convRate={stats.convRateA}
            isWinner={stats.winner === "A"}
          />
          <VariantCard
            label="B"
            name={exp.variantBLabel}
            impressions={exp.impressionsB}
            conversions={exp.conversionsB}
            revenue={exp.revenueB}
            convRate={stats.convRateB}
            isWinner={stats.winner === "B"}
            lift={stats.lift}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-rule">
          {exp.status === "draft" && (
            <button onClick={() => startExp({ id: exp._id })} className="bg-copper text-paper px-5 py-2 text-[11px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light rounded-[2px] cursor-pointer">
              Starten
            </button>
          )}
          {exp.status === "running" && (
            <button onClick={() => pauseExp({ id: exp._id })} className="border border-amber-400 text-amber-700 px-5 py-2 text-[11px] font-medium tracking-[0.1em] uppercase hover:bg-amber-50 rounded-[2px] cursor-pointer">
              Pauzeren
            </button>
          )}
          {exp.status === "paused" && (
            <button onClick={() => startExp({ id: exp._id })} className="bg-copper text-paper px-5 py-2 text-[11px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light rounded-[2px] cursor-pointer">
              Hervatten
            </button>
          )}
          {(exp.status === "running" || exp.status === "paused") && stats.significant && (
            <>
              <button
                onClick={() => { if (confirm("Variant A als winnaar instellen?")) declareWinner({ id: exp._id, winner: "A" }); }}
                className="border border-rule text-ink/60 px-4 py-2 text-[11px] font-medium hover:border-green-400 hover:text-green-700 rounded-[2px] cursor-pointer"
              >
                A wint
              </button>
              <button
                onClick={() => { if (confirm("Variant B als winnaar instellen?")) declareWinner({ id: exp._id, winner: "B" }); }}
                className="border border-rule text-ink/60 px-4 py-2 text-[11px] font-medium hover:border-green-400 hover:text-green-700 rounded-[2px] cursor-pointer"
              >
                B wint
              </button>
            </>
          )}
          {exp.status !== "running" && (
            <button
              onClick={() => { if (confirm("Experiment verwijderen?")) { deleteExp({ id: exp._id }); onClose(); } }}
              className="text-[11px] text-red-500 hover:text-red-600 px-3 py-2 cursor-pointer ml-auto"
            >
              Verwijderen
            </button>
          )}
        </div>

        {/* Timeline */}
        <div className="text-[11px] text-ink/40 flex gap-4">
          <span>Aangemaakt {formatDate(exp.createdAt)}</span>
          {exp.startedAt && <span>Gestart {formatDate(exp.startedAt)}</span>}
          {exp.completedAt && <span>Afgerond {formatDate(exp.completedAt)}</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── Variant Card ─── */

function VariantCard({ label, name, impressions, conversions, revenue, convRate, isWinner, lift }: {
  label: string; name: string; impressions: number; conversions: number; revenue: number; convRate: number; isWinner: boolean; lift?: number;
}) {
  return (
    <div className={`border rounded-[2px] p-4 ${isWinner ? "border-green-300 bg-green-50/30" : "border-rule"}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[13px] font-medium text-ink">Variant {label}</span>
          <span className="text-[11px] text-ink/40 ml-2">{name}</span>
        </div>
        {isWinner && <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-green-600">Winnaar</span>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[20px] font-display font-black text-ink">{impressions}</p>
          <p className="text-[10px] text-ink/40">Bezoekers</p>
        </div>
        <div>
          <p className="text-[20px] font-display font-black text-ink">{conversions}</p>
          <p className="text-[10px] text-ink/40">Conversies</p>
        </div>
        <div>
          <p className={`text-[20px] font-display font-black ${convRate >= 5 ? "text-green-600" : "text-ink"}`}>
            {Math.round(convRate * 100)}%
          </p>
          <p className="text-[10px] text-ink/40">Conversie</p>
        </div>
        <div>
          <p className="text-[20px] font-display font-black text-ink">{formatPrice(revenue)}</p>
          <p className="text-[10px] text-ink/40">Omzet</p>
        </div>
      </div>
      {lift !== undefined && lift !== 0 && (
        <p className={`mt-2 text-[11px] font-medium ${lift > 0 ? "text-green-600" : "text-red-500"}`}>
          {lift > 0 ? "+" : ""}{Math.round(lift)}% t.o.v. variant A
        </p>
      )}
    </div>
  );
}

/* ─── Create Experiment Form ─── */

function CreateExperimentForm({ onDone }: { onDone: () => void }) {
  const create = useMutation(api.abtest.createExperiment);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [product, setProduct] = useState("set-online");
  const [labelA, setLabelA] = useState("Origineel");
  const [labelB, setLabelB] = useState("Nieuw design");
  const [weight, setWeight] = useState("50");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const labelClass = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2";
  const inputClass = "w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await create({ name, slug, product, variantALabel: labelA, variantBLabel: labelB, weight: Number(weight) });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij aanmaken.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-copper/30 rounded-[2px] p-5">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">Nieuw experiment</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Naam</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Checkout V2 test" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slug (uniek)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="checkout-set-v2" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Product</label>
            <select value={product} onChange={(e) => setProduct(e.target.value)} className={inputClass}>
              <option value="*">Alle producten</option>
              <option value="set-online">SET Online</option>
              <option value="set-coaching">SET Coaching</option>
              <option value="cst-online">CST Online</option>
              <option value="cst-coaching">CST Coaching</option>
              <option value="boek-hardcopy">Boek Hard Copy</option>
              <option value="boek-ebook">E-book</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Variant A naam</label>
            <input value={labelA} onChange={(e) => setLabelA(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Variant B naam</label>
            <input value={labelB} onChange={(e) => setLabelB(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="max-w-[200px]">
          <label className={labelClass}>Traffic naar B (%)</label>
          <input type="number" min="10" max="90" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} />
        </div>
        {error && <p className="text-[12px] text-red-500">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light rounded-[2px] cursor-pointer disabled:opacity-40">
            {saving ? "Aanmaken..." : "Experiment aanmaken"}
          </button>
          <button type="button" onClick={onDone} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer">Annuleren</button>
        </div>
      </form>
    </div>
  );
}
