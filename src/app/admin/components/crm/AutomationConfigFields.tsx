"use client";

/* ── Trigger config types ── */
export type TriggerType =
  | "score_threshold"
  | "stage_change"
  | "inactivity"
  | "checkout_abandoned"
  | "contact_form"
  | "purchase";

export type TriggerConfigState = {
  scoreType: "engagement" | "intent";
  threshold: number;
  fromStage: string;
  toStage: string;
  inactiveDays: number;
};

export const DEFAULT_TRIGGER_CONFIG: TriggerConfigState = {
  scoreType: "intent",
  threshold: 50,
  fromStage: "",
  toStage: "",
  inactiveDays: 14,
};

/* ── Action config types ── */
export type ActionType =
  | "notify_team"
  | "send_email"
  | "start_sequence"
  | "move_stage"
  | "assign_lead"
  | "create_lead";

export type ActionConfigState = {
  notifyEmail: string;
  templateKey: string;
  subject: string;
  sequenceName: string;
  stageSlug: string;
  assignEmail: string;
  titlePrefix: string;
};

export const DEFAULT_ACTION_CONFIG: ActionConfigState = {
  notifyEmail: "klaas@klaaskroezen.com",
  templateKey: "",
  subject: "",
  sequenceName: "",
  stageSlug: "",
  assignEmail: "",
  titlePrefix: "",
};

/* ── Deserialization (parse JSON config back to form state) ── */
export function parseTriggerConfig(trigger: TriggerType, json: string): TriggerConfigState {
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return {
      ...DEFAULT_TRIGGER_CONFIG,
      ...(trigger === "score_threshold" && {
        scoreType: (parsed.scoreType as "engagement" | "intent") ?? DEFAULT_TRIGGER_CONFIG.scoreType,
        threshold: (parsed.threshold as number) ?? DEFAULT_TRIGGER_CONFIG.threshold,
      }),
      ...(trigger === "stage_change" && {
        fromStage: (parsed.fromStage as string) ?? "",
        toStage: (parsed.toStage as string) ?? "",
      }),
      ...(trigger === "inactivity" && {
        inactiveDays: (parsed.inactiveDays as number) ?? DEFAULT_TRIGGER_CONFIG.inactiveDays,
      }),
    };
  } catch {
    return { ...DEFAULT_TRIGGER_CONFIG };
  }
}

export function parseActionConfig(action: ActionType, json: string): ActionConfigState {
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return {
      ...DEFAULT_ACTION_CONFIG,
      ...(action === "notify_team" && {
        notifyEmail: (parsed.notifyEmail as string) ?? DEFAULT_ACTION_CONFIG.notifyEmail,
      }),
      ...(action === "send_email" && {
        templateKey: (parsed.templateKey as string) ?? "",
        subject: (parsed.subject as string) ?? "",
      }),
      ...(action === "start_sequence" && {
        sequenceName: (parsed.sequenceName as string) ?? "",
      }),
      ...(action === "move_stage" && {
        stageSlug: (parsed.stageSlug as string) ?? "",
      }),
      ...(action === "assign_lead" && {
        assignEmail: (parsed.assignEmail as string) ?? "",
      }),
      ...(action === "create_lead" && {
        titlePrefix: (parsed.titlePrefix as string) ?? "",
      }),
    };
  } catch {
    return { ...DEFAULT_ACTION_CONFIG };
  }
}

/* ── Admin email type for dropdowns ── */
export type AdminEmailEntry = {
  _id: string | null;
  email: string;
  addedAt: number;
};

/* ── Serialization ── */
export function serializeTriggerConfig(trigger: TriggerType, state: TriggerConfigState): string {
  switch (trigger) {
    case "score_threshold":
      return JSON.stringify({ scoreType: state.scoreType, threshold: state.threshold });
    case "stage_change":
      return JSON.stringify({ fromStage: state.fromStage, toStage: state.toStage });
    case "inactivity":
      return JSON.stringify({ inactiveDays: state.inactiveDays });
    default:
      return "{}";
  }
}

export function serializeActionConfig(action: ActionType, state: ActionConfigState): string {
  switch (action) {
    case "notify_team":
      return JSON.stringify({ notifyEmail: state.notifyEmail });
    case "send_email":
      return JSON.stringify({ templateKey: state.templateKey, subject: state.subject });
    case "start_sequence":
      return JSON.stringify({ sequenceName: state.sequenceName });
    case "move_stage":
      return JSON.stringify({ stageSlug: state.stageSlug });
    case "assign_lead":
      return JSON.stringify({ assignEmail: state.assignEmail });
    case "create_lead":
      return JSON.stringify({ titlePrefix: state.titlePrefix });
    default:
      return "{}";
  }
}

/* ── Shared field styles ── */
const inputCls = "w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent";
const labelCls = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1";

/* ── Trigger config form fields ── */
export function TriggerConfigFields({
  trigger,
  state,
  onChange,
}: {
  trigger: TriggerType;
  state: TriggerConfigState;
  onChange: (s: TriggerConfigState) => void;
}) {
  switch (trigger) {
    case "score_threshold":
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Score type</label>
            <select
              value={state.scoreType}
              onChange={(e) => onChange({ ...state, scoreType: e.target.value as "engagement" | "intent" })}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="engagement">Engagement</option>
              <option value="intent">Intent</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Drempel</label>
            <input
              type="number"
              min={1}
              max={100}
              value={state.threshold}
              onChange={(e) => onChange({ ...state, threshold: parseInt(e.target.value) || 0 })}
              className={inputCls}
            />
          </div>
        </div>
      );
    case "stage_change":
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Van fase (slug)</label>
            <input
              type="text"
              placeholder="bijv. new-lead"
              value={state.fromStage}
              onChange={(e) => onChange({ ...state, fromStage: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Naar fase (slug)</label>
            <input
              type="text"
              placeholder="bijv. qualified"
              value={state.toStage}
              onChange={(e) => onChange({ ...state, toStage: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      );
    case "inactivity":
      return (
        <div>
          <label className={labelCls}>Inactieve dagen</label>
          <input
            type="number"
            min={1}
            value={state.inactiveDays}
            onChange={(e) => onChange({ ...state, inactiveDays: parseInt(e.target.value) || 1 })}
            className={inputCls}
          />
        </div>
      );
    default:
      return (
        <p className="text-[12px] text-ink/30 py-2">Geen extra configuratie nodig</p>
      );
  }
}

/* ── Action config form fields ── */
export function ActionConfigFields({
  action,
  state,
  onChange,
  adminEmails,
}: {
  action: ActionType;
  state: ActionConfigState;
  onChange: (s: ActionConfigState) => void;
  adminEmails?: AdminEmailEntry[];
}) {
  switch (action) {
    case "notify_team":
      return (
        <div>
          <label className={labelCls}>Email adres</label>
          {adminEmails && adminEmails.length > 0 ? (
            <select
              value={state.notifyEmail}
              onChange={(e) => onChange({ ...state, notifyEmail: e.target.value })}
              className={`${inputCls} cursor-pointer`}
              required
            >
              <option value="">Selecteer email...</option>
              {adminEmails.map((a) => (
                <option key={a.email} value={a.email}>
                  {a.email.split("@")[0]} — {a.email}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="email"
              placeholder="team@voorbeeld.nl"
              value={state.notifyEmail}
              onChange={(e) => onChange({ ...state, notifyEmail: e.target.value })}
              className={inputCls}
              required
            />
          )}
        </div>
      );
    case "send_email":
      return (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Template key</label>
            <input
              type="text"
              placeholder="bijv. training-welcome"
              value={state.templateKey}
              onChange={(e) => onChange({ ...state, templateKey: e.target.value })}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Onderwerp</label>
            <input
              type="text"
              placeholder="Email onderwerp"
              value={state.subject}
              onChange={(e) => onChange({ ...state, subject: e.target.value })}
              className={inputCls}
              required
            />
          </div>
        </div>
      );
    case "start_sequence":
      return (
        <div>
          <label className={labelCls}>Sequence naam</label>
          <input
            type="text"
            placeholder="bijv. Na event"
            value={state.sequenceName}
            onChange={(e) => onChange({ ...state, sequenceName: e.target.value })}
            className={inputCls}
            required
          />
        </div>
      );
    case "move_stage":
      return (
        <div>
          <label className={labelCls}>Fase slug</label>
          <input
            type="text"
            placeholder="bijv. qualified"
            value={state.stageSlug}
            onChange={(e) => onChange({ ...state, stageSlug: e.target.value })}
            className={inputCls}
            required
          />
        </div>
      );
    case "assign_lead":
      return (
        <div>
          <label className={labelCls}>Toewijzen aan (email)</label>
          {adminEmails && adminEmails.length > 0 ? (
            <select
              value={state.assignEmail}
              onChange={(e) => onChange({ ...state, assignEmail: e.target.value })}
              className={`${inputCls} cursor-pointer`}
              required
            >
              <option value="">Selecteer medewerker...</option>
              {adminEmails.map((a) => (
                <option key={a.email} value={a.email}>
                  {a.email.split("@")[0]} — {a.email}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="email"
              placeholder="medewerker@voorbeeld.nl"
              value={state.assignEmail}
              onChange={(e) => onChange({ ...state, assignEmail: e.target.value })}
              className={inputCls}
              required
            />
          )}
        </div>
      );
    case "create_lead":
      return (
        <div>
          <label className={labelCls}>Titel prefix</label>
          <input
            type="text"
            placeholder="bijv. Inbound —"
            value={state.titlePrefix}
            onChange={(e) => onChange({ ...state, titlePrefix: e.target.value })}
            className={inputCls}
          />
        </div>
      );
    default:
      return null;
  }
}
