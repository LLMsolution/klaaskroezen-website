"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading, EmptyState } from "./shared";

const TRIGGERS = [
  { value: "purchase", label: "Aankoop" },
  { value: "contact_form", label: "Contactformulier" },
  { value: "checkout_abandoned", label: "Checkout verlaten" },
  { value: "tag_added", label: "Tag toegevoegd" },
  { value: "tag_removed", label: "Tag verwijderd" },
  { value: "email_opened", label: "Email geopend" },
  { value: "email_clicked", label: "Email link geklikt" },
  { value: "score_threshold", label: "Score drempel bereikt" },
  { value: "stage_change", label: "Pipeline fase gewijzigd" },
  { value: "manual", label: "Handmatig / vanuit andere workflow" },
];

const STEP_TYPES = [
  { value: "send_email", label: "Email versturen", icon: "✉" },
  { value: "wait", label: "Wachten", icon: "⏳" },
  { value: "if_else", label: "Als/anders", icon: "🔀" },
  { value: "add_tag", label: "Tag toevoegen", icon: "🏷" },
  { value: "remove_tag", label: "Tag verwijderen", icon: "🏷" },
  { value: "update_score", label: "Score bijwerken", icon: "📊" },
  { value: "move_stage", label: "Pipeline fase", icon: "📋" },
  { value: "notify_team", label: "Team notificatie", icon: "🔔" },
  { value: "goal", label: "Doel (exit)", icon: "🎯" },
  { value: "webhook", label: "Webhook", icon: "🔗" },
];

const CONDITIONS = [
  { value: "has_tag", label: "Heeft tag" },
  { value: "score_above", label: "Score boven drempel" },
  { value: "email_opened", label: "Email geopend (afgelopen X dagen)" },
  { value: "email_clicked", label: "Email geklikt (afgelopen X dagen)" },
  { value: "has_purchase", label: "Heeft een aankoop" },
];

type View = "list" | "create" | "edit";

export function WorkflowsTab() {
  const workflows = useQuery(api.workflows.listAll);
  const createWorkflow = useMutation(api.workflows.createWorkflow);
  const updateWorkflow = useMutation(api.workflows.updateWorkflow);
  const deleteWorkflow = useMutation(api.workflows.deleteWorkflow);

  const [view, setView] = useState<View>("list");
  const [editId, setEditId] = useState<Id<"workflows"> | null>(null);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("purchase");
  const [triggerConfig, setTriggerConfig] = useState("");

  if (workflows === undefined) return <Loading />;

  async function handleCreate() {
    if (!name.trim()) return;
    const id = await createWorkflow({ name, trigger, triggerConfig: triggerConfig || undefined });
    setView("edit");
    setEditId(id);
  }

  if (view === "create") {
    return (
      <div className="max-w-[500px]">
        <button onClick={() => setView("list")} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer mb-4">← Terug</button>
        <h3 className="font-display text-[20px] font-black mb-6">Nieuwe workflow</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1.5">Naam</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bijv. Onboarding na aankoop SET" className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
          </div>
          <div>
            <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1.5">Trigger</label>
            <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px] cursor-pointer">
              {TRIGGERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {(trigger === "tag_added" || trigger === "tag_removed") && (
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1.5">Tag naam</label>
              <input value={triggerConfig} onChange={(e) => setTriggerConfig(JSON.stringify({ tag: e.target.value }))} placeholder="klant-set" className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
            </div>
          )}
          {trigger === "score_threshold" && (
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1.5">Score drempel</label>
              <input type="number" value={triggerConfig} onChange={(e) => setTriggerConfig(JSON.stringify({ threshold: Number(e.target.value), scoreType: "intent" }))} placeholder="50" className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
            </div>
          )}
          <button onClick={handleCreate} disabled={!name.trim()} className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light rounded-[2px] cursor-pointer disabled:opacity-50">
            Aanmaken
          </button>
        </div>
      </div>
    );
  }

  if (view === "edit" && editId) {
    return <WorkflowEditor workflowId={editId} onBack={() => { setView("list"); setEditId(null); }} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div />
        <button onClick={() => { setView("create"); setName(""); setTrigger("purchase"); setTriggerConfig(""); }}
          className="bg-copper text-paper px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light rounded-[2px] cursor-pointer">
          + Nieuwe workflow
        </button>
      </div>

      {workflows.length === 0 ? (
        <EmptyState text="Nog geen workflows. Maak je eerste if/then automatisering." />
      ) : (
        <div className="space-y-2">
          {workflows.map((wf) => (
            <div key={wf._id} className="border border-rule rounded-[2px] p-4 flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-ink">{wf.name}</p>
                <p className="text-[11px] text-ink/40">
                  {TRIGGERS.find((t) => t.value === wf.trigger)?.label ?? wf.trigger}
                  {" · "}{wf.enrolledCount} ingeschreven · {wf.completedCount} voltooid
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateWorkflow({ id: wf._id, active: !wf.active })}
                  className={`text-[11px] font-medium px-3 py-1 rounded-[2px] cursor-pointer ${wf.active ? "bg-green-50 text-green-700" : "bg-ink/5 text-ink/40"}`}>
                  {wf.active ? "Actief" : "Inactief"}
                </button>
                <button onClick={() => { setEditId(wf._id); setView("edit"); }} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">Bewerken</button>
                <button onClick={() => { if (confirm("Workflow verwijderen?")) deleteWorkflow({ id: wf._id }); }} className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer">Verwijder</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Workflow Editor ─── */

function WorkflowEditor({ workflowId, onBack }: { workflowId: Id<"workflows">; onBack: () => void }) {
  const workflow = useQuery(api.workflows.getWorkflow, { id: workflowId });
  const addStep = useMutation(api.workflows.addStep);
  const deleteStep = useMutation(api.workflows.deleteStep);
  const [addingStep, setAddingStep] = useState(false);
  const [stepType, setStepType] = useState("send_email");
  const [stepConfig, setStepConfig] = useState("{}");

  if (!workflow) return <Loading />;

  async function handleAddStep() {
    const lastStep = workflow!.steps[workflow!.steps.length - 1];
    await addStep({
      workflowId,
      type: stepType,
      config: stepConfig,
      afterStepId: lastStep?._id,
    });
    setAddingStep(false);
    setStepConfig("{}");
  }

  return (
    <div>
      <button onClick={onBack} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer mb-4">← Terug naar workflows</button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-[20px] font-black">{workflow.name}</h3>
          <p className="text-[11px] text-ink/40">
            Trigger: {TRIGGERS.find((t) => t.value === workflow.trigger)?.label}
            {" · "}{workflow.activeEnrollments} actief · {workflow.totalEnrollments} totaal
          </p>
        </div>
      </div>

      {/* Visual step chain */}
      <div className="space-y-0">
        {/* Trigger card */}
        <div className="border-2 border-copper/30 bg-copper/5 rounded-[2px] p-4 mb-1">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">Trigger</p>
          <p className="text-[14px] text-ink mt-1">{TRIGGERS.find((t) => t.value === workflow.trigger)?.label}</p>
        </div>
        <div className="w-px h-4 bg-rule mx-auto" />

        {/* Steps */}
        {workflow.steps.map((step, i) => {
          const stepInfo = STEP_TYPES.find((s) => s.value === step.type);
          const config = step.config ? JSON.parse(step.config) : {};
          return (
            <div key={step._id}>
              <div className={`border rounded-[2px] p-4 ${step.type === "if_else" ? "border-amber-300 bg-amber-50/50" : step.type === "goal" ? "border-green-300 bg-green-50/50" : "border-rule"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">{stepInfo?.icon}</span>
                    <div>
                      <p className="text-[13px] font-medium text-ink">{stepInfo?.label}</p>
                      <p className="text-[11px] text-ink/40">
                        {step.type === "send_email" && `Template: ${config.templateKey ?? "—"}`}
                        {step.type === "wait" && `${config.days ?? 1} dag${(config.days ?? 1) !== 1 ? "en" : ""}`}
                        {step.type === "if_else" && `Conditie: ${CONDITIONS.find((c) => c.value === config.condition)?.label ?? config.condition}`}
                        {step.type === "add_tag" && `Tag: ${config.tag ?? "—"}`}
                        {step.type === "remove_tag" && `Tag: ${config.tag ?? "—"}`}
                        {step.type === "goal" && `${CONDITIONS.find((c) => c.value === config.condition)?.label ?? "Doel bereikt"}`}
                        {step.type === "notify_team" && `${config.message ?? "Notificatie"}`}
                        {step.type === "update_score" && `${config.scoreType ?? "intent"} ${config.delta > 0 ? "+" : ""}${config.delta ?? 0}`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => { if (confirm("Stap verwijderen?")) deleteStep({ id: step._id }); }}
                    className="text-[11px] text-red-400 hover:text-red-600 cursor-pointer">✕</button>
                </div>
                {step.type === "if_else" && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-green-100 rounded-[2px] p-2 text-green-700">✓ Ja → {step.nextStepId ? "volgende stap" : "einde"}</div>
                    <div className="bg-red-100 rounded-[2px] p-2 text-red-700">✗ Nee → {step.elseBranchStepId ? "andere stap" : "einde"}</div>
                  </div>
                )}
              </div>
              {i < workflow.steps.length - 1 && <div className="w-px h-4 bg-rule mx-auto" />}
            </div>
          );
        })}

        {/* Add step */}
        <div className="w-px h-4 bg-rule mx-auto" />
        {addingStep ? (
          <div className="border border-copper/20 rounded-[2px] p-4 bg-copper/[0.02]">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1">Type</label>
                <select value={stepType} onChange={(e) => setStepType(e.target.value)}
                  className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px] cursor-pointer">
                  {STEP_TYPES.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1">Config</label>
                <StepConfigInput type={stepType} value={stepConfig} onChange={setStepConfig} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddStep} className="bg-copper text-paper px-4 py-2 text-[12px] font-medium hover:bg-copper-light rounded-[2px] cursor-pointer">Toevoegen</button>
              <button onClick={() => setAddingStep(false)} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer">Annuleer</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingStep(true)}
            className="w-full border-2 border-dashed border-rule hover:border-copper/40 rounded-[2px] py-3 text-[12px] text-ink/40 hover:text-copper cursor-pointer transition-colors">
            + Stap toevoegen
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Step config input per type ─── */

function StepConfigInput({ type, value, onChange }: { type: string; value: string; onChange: (v: string) => void }) {
  const cls = "w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

  if (type === "send_email") {
    return <input placeholder="template-key" className={cls} onChange={(e) => onChange(JSON.stringify({ templateKey: e.target.value }))} />;
  }
  if (type === "wait") {
    return <input type="number" placeholder="Dagen" className={cls} onChange={(e) => onChange(JSON.stringify({ days: Number(e.target.value) }))} />;
  }
  if (type === "add_tag" || type === "remove_tag") {
    return <input placeholder="tag-naam" className={cls} onChange={(e) => onChange(JSON.stringify({ tag: e.target.value }))} />;
  }
  if (type === "if_else" || type === "goal") {
    return (
      <select className={cls + " cursor-pointer"} onChange={(e) => onChange(JSON.stringify({ condition: e.target.value }))}>
        {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
    );
  }
  if (type === "notify_team") {
    return <input placeholder="Bericht" className={cls} onChange={(e) => onChange(JSON.stringify({ message: e.target.value }))} />;
  }
  if (type === "update_score") {
    return <input type="number" placeholder="+10 of -5" className={cls} onChange={(e) => onChange(JSON.stringify({ scoreType: "intent", delta: Number(e.target.value) }))} />;
  }
  if (type === "webhook") {
    return <input placeholder="https://..." className={cls} onChange={(e) => onChange(JSON.stringify({ url: e.target.value }))} />;
  }
  return <input placeholder="Config (JSON)" className={cls} value={value} onChange={(e) => onChange(e.target.value)} />;
}
