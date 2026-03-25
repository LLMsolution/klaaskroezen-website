"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Loading, EmptyState } from "../shared";
import { formatDateTime } from "./shared";
import {
  type TriggerType,
  type ActionType,
  type TriggerConfigState,
  type ActionConfigState,
  type AdminEmailEntry,
  DEFAULT_TRIGGER_CONFIG,
  DEFAULT_ACTION_CONFIG,
  serializeTriggerConfig,
  serializeActionConfig,
  parseTriggerConfig,
  parseActionConfig,
  TriggerConfigFields,
  ActionConfigFields,
} from "./AutomationConfigFields";

const TRIGGER_LABELS: Record<string, string> = {
  score_threshold: "Score drempel bereikt",
  stage_change: "Fase verandering",
  inactivity: "Inactiviteit",
  checkout_abandoned: "Checkout verlaten",
  contact_form: "Contactformulier",
  purchase: "Aankoop",
};

const ACTION_LABELS: Record<string, string> = {
  notify_team: "Team notificeren",
  send_email: "Email versturen",
  start_sequence: "Sequence starten",
  move_stage: "Fase verplaatsen",
  assign_lead: "Lead toewijzen",
  create_lead: "Lead aanmaken",
};

/* ── Shared field styles ── */
const inputCls = "w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent";

export function AutomationsTab() {
  const rules = useQuery(api.crmAutomation.getRules);
  const adminEmailsData = useQuery(api.adminAuth.listAdminEmails);
  const toggleRule = useMutation(api.crmAutomation.toggleRule);
  const createRule = useMutation(api.crmAutomation.createRule);
  const updateRule = useMutation(api.crmAutomation.updateRule);
  const deleteRule = useMutation(api.crmAutomation.deleteRule);
  const testRule = useMutation(api.crmAutomation.testRule);

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<Id<"automationRules"> | null>(null);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<TriggerType>("score_threshold");
  const [action, setAction] = useState<ActionType>("notify_team");
  const [triggerConfig, setTriggerConfig] = useState<TriggerConfigState>({ ...DEFAULT_TRIGGER_CONFIG });
  const [actionConfig, setActionConfig] = useState<ActionConfigState>({ ...DEFAULT_ACTION_CONFIG });

  /* Test state */
  const [testingId, setTestingId] = useState<Id<"automationRules"> | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  if (rules === undefined) return <Loading />;

  const adminEmails: AdminEmailEntry[] = adminEmailsData?.emails ?? [];

  function resetForm() {
    setName("");
    setTrigger("score_threshold");
    setAction("notify_team");
    setTriggerConfig({ ...DEFAULT_TRIGGER_CONFIG });
    setActionConfig({ ...DEFAULT_ACTION_CONFIG });
    setEditingId(null);
  }

  function startEdit(rule: {
    _id: Id<"automationRules">;
    name: string;
    trigger: string;
    action: string;
    triggerConfig: string;
    actionConfig: string;
  }) {
    const t = rule.trigger as TriggerType;
    const a = rule.action as ActionType;
    setEditingId(rule._id);
    setName(rule.name);
    setTrigger(t);
    setAction(a);
    setTriggerConfig(parseTriggerConfig(t, rule.triggerConfig));
    setActionConfig(parseActionConfig(a, rule.actionConfig));
    setShowCreate(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createRule({
      name,
      trigger: trigger as TriggerType,
      action: action as ActionType,
      triggerConfig: serializeTriggerConfig(trigger, triggerConfig),
      actionConfig: serializeActionConfig(action, actionConfig),
    });
    setShowCreate(false);
    resetForm();
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    await updateRule({
      ruleId: editingId,
      name,
      trigger: trigger as TriggerType,
      action: action as ActionType,
      triggerConfig: serializeTriggerConfig(trigger, triggerConfig),
      actionConfig: serializeActionConfig(action, actionConfig),
    });
    setEditingId(null);
    resetForm();
  }

  async function handleTest(ruleId: Id<"automationRules">) {
    if (!testEmail.trim()) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const result = await testRule({ ruleId, testEmail: testEmail.trim() });
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : "Onbekende fout" });
    } finally {
      setTestLoading(false);
    }
  }

  const isFormOpen = showCreate || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-ink/60">
          Automatische regels die worden uitgevoerd bij bepaalde triggers.
        </p>
        <button
          onClick={() => { resetForm(); setShowCreate(true); }}
          className="bg-copper text-paper px-5 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
        >
          + Nieuwe regel
        </button>
      </div>

      {/* Create / Edit form */}
      {isFormOpen && (
        <form onSubmit={editingId ? handleUpdate : handleCreate} className="border border-rule rounded-[2px] p-5 space-y-4">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
            {editingId ? "Regel bewerken" : "Nieuwe automation regel"}
          </p>
          <input
            type="text"
            placeholder="Naam van de regel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1">Trigger</label>
              <select
                value={trigger}
                onChange={(e) => {
                  setTrigger(e.target.value as TriggerType);
                  setTriggerConfig({ ...DEFAULT_TRIGGER_CONFIG });
                }}
                className={`${inputCls} cursor-pointer`}
              >
                {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1">Actie</label>
              <select
                value={action}
                onChange={(e) => {
                  setAction(e.target.value as ActionType);
                  setActionConfig({ ...DEFAULT_ACTION_CONFIG });
                }}
                className={`${inputCls} cursor-pointer`}
              >
                {Object.entries(ACTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-3">Trigger configuratie</p>
              <TriggerConfigFields trigger={trigger} state={triggerConfig} onChange={setTriggerConfig} />
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-3">Actie configuratie</p>
              <ActionConfigFields action={action} state={actionConfig} onChange={setActionConfig} adminEmails={adminEmails} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowCreate(false); resetForm(); }}
              className="px-3 py-1.5 text-[12px] text-ink/50 cursor-pointer"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 text-[12px] font-medium bg-copper text-paper rounded-[2px] hover:bg-copper-light transition-colors cursor-pointer"
            >
              {editingId ? "Opslaan" : "Aanmaken"}
            </button>
          </div>
        </form>
      )}

      {/* Rules list */}
      {rules.length === 0 ? (
        <EmptyState text="Nog geen automation regels" />
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule._id} className="border border-rule rounded-[2px] p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-[14px] font-medium">{rule.name}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-[2px] ${rule.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {rule.active ? "Actief" : "Inactief"}
                    </span>
                  </div>
                  <p className="text-[12px] text-ink/50">
                    {TRIGGER_LABELS[rule.trigger] ?? rule.trigger} → {ACTION_LABELS[rule.action] ?? rule.action}
                  </p>
                  <RuleConfigSummary rule={rule} />
                  <p className="text-[11px] text-ink/30 mt-1">
                    {rule.executionCount}x uitgevoerd
                    {rule.lastExecutedAt && ` — laatst: ${formatDateTime(rule.lastExecutedAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(rule)}
                    className="px-3 py-1 text-[11px] font-medium rounded-[2px] bg-warm text-ink/70 hover:bg-warm/80 transition-colors cursor-pointer"
                  >
                    Bewerken
                  </button>
                  <button
                    onClick={() => {
                      setTestingId(testingId === rule._id ? null : rule._id);
                      setTestEmail("");
                      setTestResult(null);
                    }}
                    className="px-3 py-1 text-[11px] font-medium rounded-[2px] bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => toggleRule({ ruleId: rule._id })}
                    className={`px-3 py-1 text-[11px] font-medium rounded-[2px] transition-colors cursor-pointer ${
                      rule.active
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {rule.active ? "Pauzeer" : "Activeer"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Weet je zeker dat je deze regel wilt verwijderen?")) {
                        deleteRule({ ruleId: rule._id });
                      }
                    }}
                    className="px-2 py-1 text-[11px] text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    Verwijder
                  </button>
                </div>
              </div>

              {/* Test panel */}
              {testingId === rule._id && (
                <div className="mt-3 pt-3 border-t border-rule">
                  <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-blue-600 mb-2">Test regel</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="Email van testcontact"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-[13px] border border-rule rounded-[2px] bg-transparent"
                    />
                    <button
                      onClick={() => handleTest(rule._id)}
                      disabled={testLoading || !testEmail.trim()}
                      className="px-4 py-1.5 text-[11px] font-medium bg-blue-600 text-white rounded-[2px] hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {testLoading ? "Bezig..." : "Uitvoeren"}
                    </button>
                  </div>
                  {testResult && (
                    <p className={`text-[12px] mt-2 ${testResult.success ? "text-green-700" : "text-red-600"}`}>
                      {testResult.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Human-readable config summary for rule cards ── */
function RuleConfigSummary({ rule }: { rule: { trigger: string; triggerConfig: string; action: string; actionConfig: string } }) {
  const parts: string[] = [];

  try {
    const tc = JSON.parse(rule.triggerConfig);
    switch (rule.trigger) {
      case "score_threshold":
        parts.push(`${tc.scoreType === "intent" ? "Intent" : "Engagement"} >= ${tc.threshold}`);
        break;
      case "stage_change":
        if (tc.fromStage || tc.toStage) parts.push(`${tc.fromStage || "*"} → ${tc.toStage || "*"}`);
        break;
      case "inactivity":
        parts.push(`${tc.inactiveDays} dagen inactief`);
        break;
    }
  } catch { /* ignore parse errors */ }

  try {
    const ac = JSON.parse(rule.actionConfig);
    switch (rule.action) {
      case "notify_team":
        if (ac.notifyEmail) parts.push(`naar: ${ac.notifyEmail}`);
        break;
      case "send_email":
        if (ac.templateKey) parts.push(`template: ${ac.templateKey}`);
        break;
      case "start_sequence":
        if (ac.sequenceName) parts.push(`sequence: ${ac.sequenceName}`);
        break;
      case "move_stage":
        if (ac.stageSlug) parts.push(`fase: ${ac.stageSlug}`);
        break;
      case "assign_lead":
        if (ac.assignEmail) parts.push(`aan: ${ac.assignEmail}`);
        break;
      case "create_lead":
        if (ac.titlePrefix) parts.push(`prefix: ${ac.titlePrefix}`);
        break;
    }
  } catch { /* ignore parse errors */ }

  if (parts.length === 0) return null;

  return (
    <p className="text-[11px] text-ink/40 mt-0.5">
      {parts.join(" · ")}
    </p>
  );
}
