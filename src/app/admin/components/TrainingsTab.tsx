"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Image from "next/image";
import { Loading, EmptyState, formatDate } from "./shared";
import { TrainingEditor } from "./TrainingEditor";
import { TrainingParticipantsTab } from "./TrainingParticipantsTab";
import { TranslateFromButton } from "./TranslateFromButton";

type View = "list" | "create" | "edit" | "participants";

export function TrainingsTab({ filterType }: { filterType?: "training" | "audiobook" } = {}) {
  const allTrainings = useQuery(api.trainings.listAll);
  const trainings = allTrainings?.filter((t) => {
    if (!filterType) return true;
    const type = (t as Record<string, unknown>).type as string | undefined;
    if (filterType === "audiobook") return type === "audiobook";
    return type !== "audiobook"; // default: show trainings (including those without type set)
  });
  const createTraining = useMutation(api.trainings.createTraining);
  const updateTraining = useMutation(api.trainings.updateTraining);

  const [view, setView] = useState<View>("list");
  const [editId, setEditId] = useState<Id<"trainings"> | null>(null);
  const [participantsId, setParticipantsId] = useState<Id<"trainings"> | null>(null);

  // Quick create form
  const [slug, setSlug] = useState("");
  const [titleNl, setTitleNl] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleDe, setTitleDe] = useState("");
  const [descNl, setDescNl] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descDe, setDescDe] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (trainings === undefined) return <Loading />;

  if (view === "edit" && editId) {
    return (
      <TrainingEditor
        trainingId={editId}
        onBack={() => { setView("list"); setEditId(null); }}
      />
    );
  }

  if (view === "participants" && participantsId) {
    return (
      <TrainingParticipantsTab
        trainingId={participantsId}
        onBack={() => { setView("list"); setParticipantsId(null); }}
      />
    );
  }

  async function handleCreate() {
    if (!slug || !titleNl || !titleEn) {
      setError("Slug en titels zijn verplicht.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const id = await createTraining({
        slug,
        type: filterType ?? "training",
        title: { nl: titleNl, en: titleEn, de: titleDe || undefined },
        description: { nl: descNl, en: descEn, de: descDe || undefined },
        active: false,
      });
      setSlug("");
      setTitleNl("");
      setTitleEn("");
      setTitleDe("");
      setDescNl("");
      setDescEn("");
      setDescDe("");
      setEditId(id);
      setView("edit");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij aanmaken.");
    } finally {
      setSaving(false);
    }
  }

  if (view === "create") {
    return (
      <div>
        <button
          onClick={() => setView("list")}
          className="text-[12px] text-ink/40 hover:text-ink mb-6 cursor-pointer"
        >
          ← Terug
        </button>
        <h2 className="font-display text-[22px] font-black tracking-[-0.02em] mb-6">
          {filterType === "audiobook" ? "Nieuw luisterboek" : "Nieuwe training"}
        </h2>

        {error && <p className="text-red-600 text-[13px] mb-4">{error}</p>}

        <div className="grid grid-cols-3 gap-4 mb-4">
          <Field label="Slug" value={slug} onChange={setSlug} placeholder="sales-excellence-training" />
          <div /><div />
          <FieldWithTranslate
            label="Titel (NL)"
            value={titleNl}
            onChange={setTitleNl}
            targetLang="nl"
            sources={{ en: titleEn, de: titleDe }}
            onTranslated={setTitleNl}
          />
          <FieldWithTranslate
            label="Titel (EN)"
            value={titleEn}
            onChange={setTitleEn}
            targetLang="en"
            sources={{ nl: titleNl, de: titleDe }}
            onTranslated={setTitleEn}
          />
          <FieldWithTranslate
            label="Titel (DE)"
            value={titleDe}
            onChange={setTitleDe}
            targetLang="de"
            sources={{ nl: titleNl, en: titleEn }}
            onTranslated={setTitleDe}
          />
          <FieldWithTranslate
            label="Beschrijving (NL)"
            value={descNl}
            onChange={setDescNl}
            multiline
            targetLang="nl"
            sources={{ en: descEn, de: descDe }}
            onTranslated={setDescNl}
          />
          <FieldWithTranslate
            label="Beschrijving (EN)"
            value={descEn}
            onChange={setDescEn}
            multiline
            targetLang="en"
            sources={{ nl: descNl, de: descDe }}
            onTranslated={setDescEn}
          />
          <FieldWithTranslate
            label="Beschrijving (DE)"
            value={descDe}
            onChange={setDescDe}
            multiline
            targetLang="de"
            sources={{ nl: descNl, en: descEn }}
            onTranslated={setDescDe}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={saving}
          className="bg-copper text-paper px-6 py-3 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Opslaan..." : filterType === "audiobook" ? "Luisterboek aanmaken" : "Training aanmaken"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[14px] text-ink/50">
          {trainings.length} training{trainings.length !== 1 ? "en" : ""}
        </p>
        <button
          onClick={() => setView("create")}
          className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
        >
          + {filterType === "audiobook" ? "Nieuw luisterboek" : "Nieuwe training"}
        </button>
      </div>

      {trainings.length === 0 ? (
        <EmptyState text={filterType === "audiobook" ? "Nog geen luisterboeken." : "Nog geen trainingen."} />
      ) : (
        <div className="space-y-3">
          {trainings.map((t) => (
            <div
              key={t._id}
              className="border border-rule rounded-[2px] p-5"
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {t.thumbnailUrl ? (
                  <div className="shrink-0 border border-rule rounded-[2px] overflow-hidden">
                    <Image
                      src={t.thumbnailUrl}
                      alt={t.title.nl}
                      width={80}
                      height={56}
                      className="object-cover w-[80px] h-[56px]"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-[80px] h-[56px] border border-dashed border-rule rounded-[2px] flex items-center justify-center bg-warm/20">
                    <span className="text-[9px] text-ink/20">Geen foto</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[16px] font-medium text-ink">
                        {t.title.nl}
                      </h3>
                      <StatusDropdown
                        active={t.active}
                        onChange={(active) => updateTraining({ id: t._id, active })}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <a
                        href={`/training/${t.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-ink/30 hover:text-ink cursor-pointer"
                      >
                        Bekijk pagina
                      </a>
                      <button
                        onClick={() => {
                          setParticipantsId(t._id);
                          setView("participants");
                        }}
                        className="text-[12px] text-ink/40 hover:text-ink cursor-pointer"
                      >
                        Deelnemers
                      </button>
                      <button
                        onClick={() => {
                          setEditId(t._id);
                          setView("edit");
                        }}
                        className="text-[12px] text-copper hover:text-copper-light cursor-pointer font-medium"
                      >
                        Bewerken
                      </button>
                    </div>
                  </div>
                  <p className="text-[12px] text-ink/40">
                    {t.moduleCount} hoofdstukken · /{t.slug} · {formatDate(t.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusDropdown({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <select
      value={active ? "active" : "inactive"}
      onChange={(e) => onChange(e.target.value === "active")}
      className={`text-[11px] font-medium px-2.5 py-1 rounded-[2px] border-0 cursor-pointer appearance-auto ${
        active
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      <option value="active">Actief</option>
      <option value="inactive">Inactief</option>
    </select>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const cls =
    "w-full bg-transparent border border-rule px-4 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]";
  return (
    <div>
      <label className="block text-[12px] text-ink/50 mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

function FieldWithTranslate({
  label,
  value,
  onChange,
  multiline,
  targetLang,
  sources,
  onTranslated,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  targetLang: "nl" | "en" | "de";
  sources: { nl?: string; en?: string; de?: string };
  onTranslated: (v: string) => void;
}) {
  const cls =
    "w-full bg-transparent border border-rule px-4 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <label className="text-[12px] text-ink/50">{label}</label>
        <TranslateFromButton
          targetLang={targetLang}
          sourcesAvailable={sources}
          onTranslated={onTranslated}
          compact
        />
      </div>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}
