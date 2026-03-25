"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading } from "./shared";
import { QuizEditor } from "./QuizEditor";
import { ModuleVideoField, ModuleWorkbookField } from "./ModuleFields";
import { AdminImageUpload } from "./AdminImageUpload";

interface Props {
  trainingId: Id<"trainings">;
  onBack: () => void;
}

export function TrainingEditor({ trainingId, onBack }: Props) {
  const trainingData = useQuery(api.trainings.listAll);
  const modules = useQuery(api.trainings.getModulesForTraining, { trainingId });
  const checkoutProducts = useQuery(api.checkoutProducts.listAll);
  const updateTraining = useMutation(api.trainings.updateTraining);
  const createModule = useMutation(api.trainingModules.createModule);
  const updateModule = useMutation(api.trainingModules.updateModule);
  const deleteModule = useMutation(api.trainingModules.deleteModule);
  const generateUploadUrl = useMutation(api.trainings.generateUploadUrl);

  const [editingQuizModule, setEditingQuizModule] = useState<Id<"trainingModules"> | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [addingModule, setAddingModule] = useState(false);
  const [addingLessonFor, setAddingLessonFor] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [saving, setSaving] = useState(false);

  if (!trainingData || modules === undefined) return <Loading />;
  const t = trainingData.find((tr) => tr._id === trainingId);
  if (!t) return <Loading />;

  if (editingQuizModule) {
    return <QuizEditor moduleId={editingQuizModule} onBack={() => setEditingQuizModule(null)} />;
  }

  const sorted = [...modules].sort((a, b) => a.sortOrder - b.sortOrder);
  const topModules = sorted.filter((m) => !m.parentModuleId);
  const lessonMap = new Map<string, typeof sorted>();
  for (const m of sorted) {
    if (m.parentModuleId) {
      const list = lessonMap.get(m.parentModuleId) ?? [];
      list.push(m);
      lessonMap.set(m.parentModuleId, list);
    }
  }

  const linkedProducts: string[] = "linkedProducts" in t && Array.isArray(t.linkedProducts) ? t.linkedProducts : [];

  async function addModule() {
    if (!formTitle.trim()) return;
    setSaving(true);
    const slug = formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await createModule({
      trainingId, slug,
      title: { nl: formTitle, en: formTitle },
      description: { nl: "", en: "" },
      discussionEnabled: false, quizRequired: false, active: true,
    });
    setFormTitle(""); setAddingModule(false); setSaving(false);
  }

  async function addLesson(parentId: Id<"trainingModules">) {
    if (!formTitle.trim()) return;
    setSaving(true);
    const parentIdx = topModules.findIndex((m) => m._id === parentId);
    const children = lessonMap.get(parentId) ?? [];
    const slug = `${parentIdx + 1}-${children.length + 1}-${formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    await createModule({
      trainingId, parentModuleId: parentId, slug,
      title: { nl: formTitle, en: formTitle },
      description: { nl: "", en: "" },
      discussionEnabled: false, quizRequired: false, active: true,
    });
    setFormTitle(""); setAddingLessonFor(null); setSaving(false);
  }

  return (
    <div>
      <button onClick={onBack} className="text-[12px] text-ink/40 hover:text-ink mb-6 cursor-pointer">
        ← Terug naar trainingen
      </button>

      {/* Training header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-[24px] font-black tracking-[-0.02em]">{t.title.nl}</h2>
          <p className="text-[13px] text-ink/40">/{t.slug}</p>
        </div>
        <select
          value={t.active ? "active" : "inactive"}
          onChange={(e) => updateTraining({ id: trainingId, active: e.target.value === "active" })}
          className={`text-[12px] font-medium px-3 py-2 rounded-[2px] cursor-pointer ${t.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
        >
          <option value="active">Actief</option>
          <option value="inactive">Inactief</option>
        </select>
      </div>

      {/* Linked products */}
      {checkoutProducts && (
        <Section title="Gekoppelde betaalpagina's" subtitle="Klanten die een van deze producten kopen krijgen toegang.">
          <div className="flex flex-wrap gap-2">
            {checkoutProducts.map((p) => {
              const linked = linkedProducts.includes(p.slug);
              return (
                <button key={p._id} onClick={() => updateTraining({ id: trainingId, linkedProducts: linked ? linkedProducts.filter((s) => s !== p.slug) : [...linkedProducts, p.slug] })}
                  className={`text-[12px] px-3 py-1.5 rounded-[2px] border cursor-pointer transition-colors ${linked ? "border-copper bg-copper/10 text-copper font-medium" : "border-rule text-ink/40 hover:border-copper/30"}`}>
                  {p.name.nl}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* Werkboek */}
      <WorkbookSection trainingId={trainingId} />

      {/* Certificaat */}
      <CertificateSection trainingId={trainingId} />

      {/* Modules */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
            Modules ({topModules.length})
          </h3>
          <button onClick={() => { setAddingModule(!addingModule); setFormTitle(""); }} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
            {addingModule ? "Annuleer" : "+ Module toevoegen"}
          </button>
        </div>

        {addingModule && (
          <InlineForm placeholder="Naam van de module" value={formTitle} onChange={setFormTitle} saving={saving} onSave={addModule} onCancel={() => setAddingModule(false)} />
        )}

        {topModules.length === 0 && !addingModule && (
          <p className="text-[14px] text-ink/30 py-6 text-center border border-dashed border-rule rounded-[2px]">Nog geen modules.</p>
        )}

        <div className="space-y-2">
          {topModules.map((mod, modIdx) => {
            const lessons = lessonMap.get(mod._id) ?? [];
            const isExpanded = expandedModuleId === mod._id;

            return (
              <div key={mod._id} className="border border-rule rounded-[2px] overflow-hidden">
                {/* Module header */}
                <button type="button" onClick={() => setExpandedModuleId(isExpanded ? null : mod._id)}
                  className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-warm/20 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-medium text-ink/25 w-7 text-center">{String(modIdx + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="text-[14px] font-medium text-ink">{mod.title.nl}</p>
                      <p className="text-[11px] text-ink/40">{lessons.length} training{lessons.length !== 1 ? "en" : ""}</p>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={`text-ink/30 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}><path d="M4 6l4 4 4-4" /></svg>
                </button>

                {/* Expanded: trainingen within module */}
                {isExpanded && (
                  <div className="border-t border-rule p-4 space-y-3 bg-warm/5">
                    {/* Existing lessons */}
                    {lessons.map((lesson, lessonIdx) => (
                      <LessonCard
                        key={lesson._id}
                        lesson={lesson}
                        label={`${modIdx + 1}.${lessonIdx + 1}`}
                        onUpdateVideo={async (videoId) => { await updateModule({ id: lesson._id, vimeoVideoId: videoId }); }}
                        onUpdateTitle={async (title) => { await updateModule({ id: lesson._id, title: { nl: title, en: title } }); }}
                        onUpdateDesc={async (desc) => { await updateModule({ id: lesson._id, description: { nl: desc, en: desc } }); }}
                        onDelete={async () => { if (confirm(`Training "${lesson.title.nl}" verwijderen?`)) await deleteModule({ id: lesson._id }); }}
                        onEditQuiz={() => setEditingQuizModule(lesson._id)}
                      />
                    ))}

                    {/* Add training */}
                    {addingLessonFor === mod._id ? (
                      <InlineForm placeholder={`Titel training ${modIdx + 1}.${lessons.length + 1}`} value={formTitle} onChange={setFormTitle} saving={saving}
                        onSave={() => addLesson(mod._id)} onCancel={() => setAddingLessonFor(null)} />
                    ) : (
                      <button onClick={() => { setAddingLessonFor(mod._id); setFormTitle(""); }}
                        className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
                        + Training toevoegen
                      </button>
                    )}

                    {/* Module actions */}
                    <div className="flex items-center gap-3 pt-2 border-t border-rule">
                      <button onClick={() => setEditingQuizModule(mod._id)} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
                        Quiz beheren
                      </button>
                      <button onClick={async () => {
                        if (confirm("Module en alle trainingen verwijderen?")) {
                          for (const l of lessons) await deleteModule({ id: l._id });
                          await deleteModule({ id: mod._id });
                          setExpandedModuleId(null);
                        }
                      }} className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer">Verwijder module</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Lesson card within a module ─── */

function LessonCard({ lesson, label, onUpdateVideo, onUpdateTitle, onUpdateDesc, onDelete, onEditQuiz }: {
  lesson: { _id: Id<"trainingModules">; title: { nl: string }; description: { nl: string }; vimeoVideoId?: string; quizRequired: boolean };
  label: string;
  onUpdateVideo: (id: string) => Promise<void>;
  onUpdateTitle: (t: string) => Promise<void>;
  onUpdateDesc: (d: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onEditQuiz: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-rule/60 rounded-[2px] bg-paper overflow-hidden">
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left cursor-pointer hover:bg-warm/20 transition-colors">
        <span className="text-[12px] font-medium text-ink/25 w-8">{label}</span>
        <p className="text-[13px] font-medium text-ink flex-1">{lesson.title.nl}</p>
        {lesson.vimeoVideoId && <span className="text-[10px] text-ink/30">Video</span>}
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={`text-ink/20 transition-transform ${expanded ? "rotate-180" : ""}`}><path d="M4 6l4 4 4-4" /></svg>
      </button>

      {expanded && (
        <div className="border-t border-rule/50 p-3 space-y-3">
          <EditableField label="Titel" value={lesson.title.nl} onSave={onUpdateTitle} />
          <EditableField label="Beschrijving" value={lesson.description.nl} onSave={onUpdateDesc} multiline />
          <ModuleVideoField moduleId={lesson._id} currentVideoId={lesson.vimeoVideoId} onSave={onUpdateVideo} />
          <div className="flex items-center gap-3 pt-2">
            <button onClick={onEditQuiz} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">Quiz</button>
            <button onClick={onDelete} className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer">Verwijder</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Editable inline field ─── */

function EditableField({ label, value, onSave, multiline }: {
  label: string; value: string; onSave: (v: string) => Promise<void>; multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const cls = "w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

  if (!editing) {
    return (
      <div>
        <p className="text-[11px] text-ink/50 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-[13px] text-ink flex-1">{value || <span className="text-ink/25">Niet ingesteld</span>}</p>
          <button onClick={() => { setVal(value); setEditing(true); }} className="text-[11px] text-copper hover:text-copper-light cursor-pointer">Wijzig</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] text-ink/50 mb-1">{label}</p>
      {multiline ? <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={2} className={cls} /> : <input value={val} onChange={(e) => setVal(e.target.value)} className={cls} />}
      <div className="flex gap-2 mt-1">
        <button onClick={async () => { await onSave(val); setEditing(false); }} className="text-[11px] text-copper cursor-pointer">Opslaan</button>
        <button onClick={() => setEditing(false)} className="text-[11px] text-ink/40 cursor-pointer">Annuleer</button>
      </div>
    </div>
  );
}

/* ─── Inline add form ─── */

function InlineForm({ placeholder, value, onChange, saving, onSave, onCancel }: {
  placeholder: string; value: string; onChange: (v: string) => void; saving: boolean; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="flex gap-2 mb-3">
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
        onKeyDown={(e) => { if (e.key === "Enter") onSave(); }} autoFocus />
      <button onClick={onSave} disabled={saving || !value.trim()} className="bg-copper text-paper px-4 py-2 text-[12px] font-medium hover:bg-copper-light rounded-[2px] cursor-pointer disabled:opacity-50">
        {saving ? "..." : "Toevoegen"}
      </button>
      <button onClick={onCancel} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer">Annuleer</button>
    </div>
  );
}

/* ─── Section wrapper ─── */

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 border border-rule rounded-[2px] p-5">
      <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-2">{title}</h3>
      {subtitle && <p className="text-[12px] text-ink/40 mb-3">{subtitle}</p>}
      {children}
    </div>
  );
}

/* ─── Werkboek section ─── */

function WorkbookSection({ trainingId }: { trainingId: Id<"trainings"> }) {
  const trainingData = useQuery(api.trainings.listAll);
  const generateUploadUrl = useMutation(api.trainings.generateUploadUrl);
  const saveWorkbook = useMutation(api.trainings.saveWorkbook);
  const removeWorkbook = useMutation(api.trainings.removeWorkbook);
  const updateMeta = useMutation(api.trainings.updateWorkbookMeta);
  const saveImage = useMutation(api.trainings.saveWorkbookImage);
  const [uploading, setUploading] = useState(false);

  const t = trainingData?.find((tr) => tr._id === trainingId);
  const has = t && "workbookStorageId" in t && !!t.workbookStorageId;
  const wbTitle = (t as any)?.workbookTitle ?? "";
  const wbDesc = (t as any)?.workbookDescription ?? "";
  const wbFile = (t as any)?.workbookFileName ?? "";

  async function handleUploadPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await res.json();
      await saveWorkbook({ trainingId, storageId, fileName: file.name, title: wbTitle || file.name, description: wbDesc });
    } finally { setUploading(false); }
  }

  return (
    <Section title="Werkboek" subtitle="Upload een PDF werkboek met titel, afbeelding en beschrijving. Deelnemers kunnen dit downloaden.">
      {has ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-copper">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
              </svg>
              <span className="text-[13px] text-ink">{wbFile}</span>
            </div>
            <div className="flex gap-3">
              <label className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
                Vervangen <input type="file" accept=".pdf" onChange={handleUploadPdf} className="hidden" />
              </label>
              <button onClick={() => removeWorkbook({ trainingId })} className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer">Verwijderen</button>
            </div>
          </div>
          <EditableField label="Titel" value={wbTitle} onSave={async (v) => { await updateMeta({ trainingId, title: v, description: wbDesc }); }} />
          <EditableField label="Beschrijving" value={wbDesc} onSave={async (v) => { await updateMeta({ trainingId, title: wbTitle, description: v }); }} multiline />
          <div>
            <p className="text-[11px] text-ink/50 mb-1">Afbeelding</p>
            <AdminImageUpload
              onUploaded={async (storageId) => { await saveImage({ trainingId, storageId }); }}
              alt="Werkboek cover"
            />
          </div>
        </div>
      ) : (
        <label className={`inline-block bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light rounded-[2px] cursor-pointer ${uploading ? "opacity-50" : ""}`}>
          {uploading ? "Uploaden..." : "PDF uploaden"}
          <input type="file" accept=".pdf" onChange={handleUploadPdf} disabled={uploading} className="hidden" />
        </label>
      )}
    </Section>
  );
}

/* ─── Certificate section ─── */

function CertificateSection({ trainingId }: { trainingId: Id<"trainings"> }) {
  const trainingData = useQuery(api.trainings.listAll);
  const generateUploadUrl = useMutation(api.trainings.generateUploadUrl);
  const saveCertificate = useMutation(api.trainings.saveCertificate);
  const removeCertificate = useMutation(api.trainings.removeCertificate);
  const [uploading, setUploading] = useState(false);

  const t = trainingData?.find((tr) => tr._id === trainingId);
  const has = t && "certificateStorageId" in t && !!t.certificateStorageId;
  const fileName = (t as any)?.certificateFileName;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await res.json();
      await saveCertificate({ trainingId, storageId, fileName: file.name });
    } finally { setUploading(false); }
  }

  return (
    <Section title="Certificaat PDF" subtitle="Deelnemers downloaden dit na afronding van alle quizzes.">
      {has ? (
        <div className="flex items-center justify-between">
          <p className="text-[14px] text-ink">{fileName || "certificaat.pdf"}</p>
          <div className="flex gap-3">
            <label className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
              Vervangen <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" />
            </label>
            <button onClick={() => removeCertificate({ trainingId })} className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer">Verwijderen</button>
          </div>
        </div>
      ) : (
        <label className={`inline-block bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light rounded-[2px] cursor-pointer ${uploading ? "opacity-50" : ""}`}>
          {uploading ? "Uploaden..." : "PDF uploaden"}
          <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      )}
    </Section>
  );
}
