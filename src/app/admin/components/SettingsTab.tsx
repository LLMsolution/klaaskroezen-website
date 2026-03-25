"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { Loading } from "./shared";

export function SettingsTab() {
  const data = useQuery(api.adminAuth.listAdminEmails);
  const addEmail = useMutation(api.adminAuth.addAdminEmail);
  const removeEmail = useMutation(api.adminAuth.removeAdminEmail);
  const updateEmail = useMutation(api.adminAuth.updateAdminEmail);
  const initEmails = useMutation(api.adminAuth.initAdminEmails);

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<Record<string, string>>({});

  if (data === undefined) return <Loading />;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setSaving(true);
    setError("");
    try {
      await addEmail({ email: newEmail.trim(), name: newName.trim() || undefined });
      setNewEmail("");
      setNewName("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fout bij toevoegen.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    setError("");
    try {
      await removeEmail({ id: id as Id<"adminEmails"> });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fout bij verwijderen.");
    }
    setConfirmRemove(null);
  }

  async function handleNameSave(id: string) {
    const name = editingName[id];
    if (name === undefined) return;
    try {
      await updateEmail({ id: id as Id<"adminEmails">, name: name.trim() || undefined });
      setEditingName((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fout bij opslaan naam.");
    }
  }

  async function handleInit() {
    setError("");
    try {
      await initEmails();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fout bij initialiseren.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Abandoned cart timing */}
      <AbandonedCartSettings />

      {/* Layout editor config */}
      <LayoutEditorSettings />

      {/* Admin emails section */}
      <div>
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1">
          Beheerders
        </p>
        <p className="text-[13px] text-ink/50 mb-5">
          E-mailadressen die toegang hebben tot het admin dashboard.
        </p>

        {!data.isSeeded && (
          <div className="border border-amber-200 bg-amber-50 rounded-[2px] p-4 mb-5">
            <p className="text-[13px] text-amber-800 mb-3">
              Admin e-mails staan nog niet in de database. Klik hieronder om ze te initialiseren.
            </p>
            <button
              onClick={handleInit}
              className="bg-amber-600 text-white px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase rounded-[2px] hover:bg-amber-700 transition-colors cursor-pointer"
            >
              Initialiseren
            </button>
          </div>
        )}

        {error && (
          <div className="border border-red-200 bg-red-50 rounded-[2px] px-4 py-3 mb-4">
            <p className="text-[13px] text-red-700">{error}</p>
          </div>
        )}

        {/* Email list */}
        <div className="space-y-2 mb-5">
          {data.emails.map((entry) => {
            const isEditing = entry._id != null && editingName[entry._id] !== undefined;
            const currentName = entry._id != null && editingName[entry._id] !== undefined
              ? editingName[entry._id]
              : entry.name ?? "";

            return (
              <div
                key={entry.email}
                className="flex items-center justify-between border border-rule rounded-[2px] px-4 py-3 gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] text-ink">{entry.email}</p>
                    {entry.addedAt > 0 && (
                      <p className="text-[11px] text-ink/30 mt-0.5">
                        Toegevoegd {new Date(entry.addedAt).toLocaleDateString("nl-NL", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  {entry._id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="text"
                        value={currentName}
                        onChange={(e) =>
                          setEditingName((prev) => ({ ...prev, [entry._id!]: e.target.value }))
                        }
                        placeholder="Naam..."
                        className="bg-transparent border border-rule px-2.5 py-1.5 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px] w-[160px]"
                      />
                      {isEditing && (
                        <button
                          onClick={() => handleNameSave(entry._id!)}
                          className="text-[11px] text-copper font-medium hover:text-copper-light cursor-pointer"
                        >
                          Opslaan
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-[13px] text-ink/30 italic">{entry.name ?? ""}</span>
                  )}
                </div>
                {entry._id && (
                  <div className="flex items-center gap-2 shrink-0">
                    {confirmRemove === entry._id ? (
                      <>
                        <button
                          onClick={() => handleRemove(entry._id!)}
                          className="text-[11px] text-red-600 font-medium hover:text-red-700 cursor-pointer"
                        >
                          Bevestig
                        </button>
                        <button
                          onClick={() => setConfirmRemove(null)}
                          className="text-[11px] text-ink/40 hover:text-ink cursor-pointer"
                        >
                          Annuleer
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmRemove(entry._id)}
                        className="text-[11px] text-ink/30 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Verwijderen
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Naam (optioneel)"
            className="bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px] w-[160px]"
          />
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="nieuw@emailadres.nl"
            className="flex-1 bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
          />
          <button
            type="submit"
            disabled={saving || !newEmail.trim()}
            className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
          >
            {saving ? "..." : "Toevoegen"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Abandoned Cart Timing Settings ─── */

function AbandonedCartSettings() {
  const settings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.updateSettings);

  const [delay, setDelay] = useState("");
  const [esc1, setEsc1] = useState("");
  const [esc2, setEsc2] = useState("");
  const [esc3, setEsc3] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Sync state from query
  if (settings && !initialized) {
    setDelay(String(settings.abandonedCartDelayMinutes));
    setEsc1(String(settings.escalationDelayHours[0] ?? 24));
    setEsc2(String(settings.escalationDelayHours[1] ?? 48));
    setEsc3(String(settings.escalationDelayHours[2] ?? 96));
    setInitialized(true);
  }

  if (!settings) return <Loading />;

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateSettings({
        abandonedCartDelayMinutes: Number(delay),
        escalationDelayHours: [Number(esc1), Number(esc2), Number(esc3)].filter((n) => n > 0),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const labelClass = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2";
  const inputClass = "w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

  return (
    <div>
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1">
        Abandoned cart timing
      </p>
      <p className="text-[13px] text-ink/50 mb-5">
        Wanneer worden herinneringen verstuurd na een niet-afgeronde bestelling?
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>Eerste herinnering (minuten)</label>
          <input type="number" min="5" value={delay} onChange={(e) => setDelay(e.target.value)} className={inputClass} />
          <p className="text-[11px] text-ink/30 mt-1">Na {delay} min. als bestelling niet afgerond</p>
        </div>
        <div>
          <label className={labelClass}>Escalatie 1 (uren)</label>
          <input type="number" min="1" value={esc1} onChange={(e) => setEsc1(e.target.value)} className={inputClass} />
          <p className="text-[11px] text-ink/30 mt-1">{esc1}u na eerste herinnering</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className={labelClass}>Escalatie 2 (uren) — gratis e-book</label>
          <input type="number" min="1" value={esc2} onChange={(e) => setEsc2(e.target.value)} className={inputClass} />
          <p className="text-[11px] text-ink/30 mt-1">{esc2}u na escalatie 1</p>
        </div>
        <div>
          <label className={labelClass}>Escalatie 3 (uren) — 10% korting</label>
          <input type="number" min="1" value={esc3} onChange={(e) => setEsc3(e.target.value)} className={inputClass} />
          <p className="text-[11px] text-ink/30 mt-1">{esc3}u na escalatie 2</p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
      >
        {saving ? "Opslaan..." : saved ? "Opgeslagen!" : "Timing opslaan"}
      </button>
    </div>
  );
}

/* ─── Layout Editor Settings ─── */

function LayoutEditorSettings() {
  const config = useQuery(api.layoutEditorConfig.getConfig);
  const updateConfig = useMutation(api.layoutEditorConfig.updateConfig);

  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState("120");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (config && !initialized) {
    setEmails(config.allowedEmails);
    setSessionTimeout(String(config.sessionTimeoutMinutes));
    setInitialized(true);
  }

  if (!config) return <Loading />;

  function handleAddEmail(e: React.FormEvent) {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email || emails.includes(email)) return;
    setEmails([...emails, email]);
    setNewEmail("");
  }

  function handleRemoveEmail(email: string) {
    setEmails(emails.filter((e) => e !== email));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await updateConfig({
        allowedEmails: emails,
        sessionTimeoutMinutes: Math.max(10, Number(sessionTimeout) || 120),
      });
      setSaved(true);
      globalThis.setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fout bij opslaan.");
    } finally {
      setSaving(false);
    }
  }

  const labelClass = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2";
  const inputClass = "w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

  return (
    <div>
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1">
        Layout Editor
      </p>
      <p className="text-[13px] text-ink/50 mb-5">
        Wie mag de AI Layout Editor gebruiken en hoe lang blijft een sessie actief?
      </p>

      {error && (
        <div className="border border-red-200 bg-red-50 rounded-[2px] px-4 py-3 mb-4">
          <p className="text-[13px] text-red-700">{error}</p>
        </div>
      )}

      {/* Allowed emails */}
      <div className="mb-5">
        <label className={labelClass}>Toegestane e-mailadressen</label>
        <div className="space-y-2 mb-3">
          {emails.map((email) => (
            <div
              key={email}
              className="flex items-center justify-between border border-rule rounded-[2px] px-4 py-2.5"
            >
              <p className="text-[14px] text-ink">{email}</p>
              <button
                onClick={() => handleRemoveEmail(email)}
                className="text-[11px] text-ink/30 hover:text-red-600 transition-colors cursor-pointer"
              >
                Verwijderen
              </button>
            </div>
          ))}
          {emails.length === 0 && (
            <p className="text-[13px] text-ink/30 italic">
              Geen e-mailadressen — iedereen met admin-rechten mag de editor gebruiken.
            </p>
          )}
        </div>
        <form onSubmit={handleAddEmail} className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@voorbeeld.nl"
            className={`flex-1 ${inputClass}`}
          />
          <button
            type="submit"
            disabled={!newEmail.trim()}
            className="bg-copper text-paper px-4 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
          >
            Toevoegen
          </button>
        </form>
      </div>

      {/* Timeout */}
      <div className="mb-5">
        <label className={labelClass}>Sessie timeout (minuten)</label>
        <input
          type="number"
          min="10"
          value={sessionTimeout}
          onChange={(e) => setSessionTimeout(e.target.value)}
          className={inputClass}
          style={{ maxWidth: 200 }}
        />
        <p className="text-[11px] text-ink/30 mt-1">
          Sessies worden automatisch afgesloten na {sessionTimeout} minuten inactiviteit.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
      >
        {saving ? "Opslaan..." : saved ? "Opgeslagen!" : "Layout Editor opslaan"}
      </button>
    </div>
  );
}
