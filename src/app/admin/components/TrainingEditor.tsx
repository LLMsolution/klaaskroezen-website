"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading } from "./shared";
import { QuizEditor } from "./QuizEditor";
import { ModuleVideoField, ModuleAudioField } from "./ModuleFields";
import { DeepLButton } from "./DeepLButton";
import { Section, EditableField, InlineForm, WorkbookSection, CoverImageSection, CertificateSection } from "./TrainingEditorSections";

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
  const saveAudio = useMutation(api.trainingModules.saveAudio);
  const removeAudio = useMutation(api.trainingModules.removeAudio);
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

  const isAudiobook = (t as Record<string, unknown>).type === "audiobook";
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
      title: { nl: formTitle, en: formTitle, de: "" },
      description: { nl: "", en: "", de: "" },
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
      title: { nl: formTitle, en: formTitle, de: "" },
      description: { nl: "", en: "", de: "" },
      discussionEnabled: false, quizRequired: false, active: true,
    });
    setFormTitle(""); setAddingLessonFor(null); setSaving(false);
  }

  async function addChapter() {
    if (!formTitle.trim()) return;
    setSaving(true);
    const slug = `ch-${topModules.length + 1}-${formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    await createModule({
      trainingId, slug,
      title: { nl: formTitle, en: formTitle, de: "" },
      description: { nl: "", en: "", de: "" },
      discussionEnabled: false, quizRequired: false, active: true,
    });
    setFormTitle(""); setAddingModule(false); setSaving(false);
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
        <div className="flex items-center gap-3">
          <select
            value={(t as Record<string, unknown>).type as string ?? "training"}
            onChange={(e) => updateTraining({ id: trainingId, type: e.target.value as "training" | "audiobook" })}
            className="text-[12px] font-medium px-3 py-2 rounded-[2px] cursor-pointer border border-rule bg-paper text-ink"
          >
            <option value="training">Training</option>
            <option value="audiobook">Luisterboek</option>
          </select>
          <select
            value={t.active ? "active" : "inactive"}
            onChange={(e) => updateTraining({ id: trainingId, active: e.target.value === "active" })}
            className={`text-[12px] font-medium px-3 py-2 rounded-[2px] cursor-pointer ${t.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
          >
            <option value="active">Actief</option>
            <option value="inactive">Inactief</option>
          </select>
        </div>
      </div>

      {/* Cover image (audiobook) */}
      {isAudiobook && <CoverImageSection trainingId={trainingId} />}

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
      {!isAudiobook && <CertificateSection trainingId={trainingId} />}

      {/* Audiobook: flat chapter list */}
      {isAudiobook ? (
        <AudiobookChapterList
          chapters={topModules}
          addingChapter={addingModule}
          formTitle={formTitle}
          saving={saving}
          onToggleAdd={() => { setAddingModule(!addingModule); setFormTitle(""); }}
          onFormTitleChange={setFormTitle}
          onAddChapter={addChapter}
          onCancelAdd={() => setAddingModule(false)}
          onUpdateModule={updateModule}
          onDeleteModule={deleteModule}
          generateUploadUrl={generateUploadUrl}
          saveAudio={saveAudio}
          removeAudio={removeAudio}
        />
      ) : (
        /* Training: module hierarchy */
        <TrainingModuleList
          topModules={topModules}
          lessonMap={lessonMap}
          isAudiobook={false}
          expandedModuleId={expandedModuleId}
          addingModule={addingModule}
          addingLessonFor={addingLessonFor}
          formTitle={formTitle}
          saving={saving}
          onToggleExpand={(id) => setExpandedModuleId(expandedModuleId === id ? null : id)}
          onToggleAddModule={() => { setAddingModule(!addingModule); setFormTitle(""); }}
          onFormTitleChange={setFormTitle}
          onAddModule={addModule}
          onCancelAddModule={() => setAddingModule(false)}
          onStartAddLesson={(id) => { setAddingLessonFor(id); setFormTitle(""); }}
          onAddLesson={addLesson}
          onCancelAddLesson={() => setAddingLessonFor(null)}
          onUpdateModule={updateModule}
          onDeleteModule={deleteModule}
          generateUploadUrl={generateUploadUrl}
          saveAudio={saveAudio}
          removeAudio={removeAudio}
          onEditQuiz={setEditingQuizModule}
        />
      )}
    </div>
  );
}

/* ─── Audiobook flat chapter list ─── */

type Mod = { _id: Id<"trainingModules">; title: { nl: string; en?: string; de?: string }; description: { nl: string }; sortOrder: number; audioStorageId?: Id<"_storage">; audioFileName?: string };
type ModMut = ReturnType<typeof useMutation<typeof api.trainingModules.updateModule>>;
type ModDel = ReturnType<typeof useMutation<typeof api.trainingModules.deleteModule>>;
type GenUrl = ReturnType<typeof useMutation<typeof api.trainings.generateUploadUrl>>;
type AudioSave = ReturnType<typeof useMutation<typeof api.trainingModules.saveAudio>>;
type AudioRm = ReturnType<typeof useMutation<typeof api.trainingModules.removeAudio>>;

function AudiobookChapterList({ chapters, addingChapter, formTitle, saving, onToggleAdd, onFormTitleChange, onAddChapter, onCancelAdd, onUpdateModule, onDeleteModule, generateUploadUrl, saveAudio, removeAudio }: {
  chapters: Mod[]; addingChapter: boolean; formTitle: string; saving: boolean;
  onToggleAdd: () => void; onFormTitleChange: (v: string) => void; onAddChapter: () => void; onCancelAdd: () => void;
  onUpdateModule: ModMut; onDeleteModule: ModDel; generateUploadUrl: GenUrl; saveAudio: AudioSave; removeAudio: AudioRm;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
          Hoofdstukken ({chapters.length})
        </h3>
        <button onClick={onToggleAdd} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
          {addingChapter ? "Annuleer" : "+ Hoofdstuk toevoegen"}
        </button>
      </div>

      {addingChapter && (
        <InlineForm placeholder="Titel van het hoofdstuk" value={formTitle} onChange={onFormTitleChange} saving={saving} onSave={onAddChapter} onCancel={onCancelAdd} />
      )}

      {chapters.length === 0 && !addingChapter && (
        <p className="text-[14px] text-ink/30 py-6 text-center border border-dashed border-rule rounded-[2px]">Nog geen hoofdstukken.</p>
      )}

      <div className="space-y-1">
        {chapters.map((ch, idx) => {
          const hasAudio = !!(ch as Record<string, unknown>).audioStorageId;
          const audioFile = (ch as Record<string, unknown>).audioFileName as string | undefined;
          const isExpanded = expandedId === ch._id;

          return (
            <div key={ch._id} className="border border-rule rounded-[2px] overflow-hidden">
              <button type="button" onClick={() => setExpandedId(isExpanded ? null : ch._id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-warm/20 transition-colors">
                <span className="text-[13px] font-medium text-ink/25 w-7 text-center">{String(idx + 1).padStart(2, "0")}</span>
                <p className="text-[13px] font-medium text-ink flex-1">{ch.title.nl}</p>
                {hasAudio ? (
                  <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-[2px]">MP3: {audioFile || "audio"}</span>
                ) : (
                  <span className="text-[10px] text-ink/25">MP3 uploaden</span>
                )}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={`text-ink/20 transition-transform ${isExpanded ? "rotate-180" : ""}`}><path d="M4 6l4 4 4-4" /></svg>
              </button>

              {isExpanded && (
                <AudiobookChapterExpanded
                  chapter={ch}
                  hasAudio={hasAudio}
                  audioFile={audioFile}
                  onUpdateModule={onUpdateModule}
                  onDeleteModule={onDeleteModule}
                  generateUploadUrl={generateUploadUrl}
                  saveAudio={saveAudio}
                  removeAudio={removeAudio}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Expanded chapter card for audiobooks ─── */

function AudiobookChapterExpanded({ chapter, hasAudio, audioFile, onUpdateModule, onDeleteModule, generateUploadUrl, saveAudio, removeAudio }: {
  chapter: Mod; hasAudio: boolean; audioFile?: string;
  onUpdateModule: ModMut; onDeleteModule: ModDel; generateUploadUrl: GenUrl; saveAudio: AudioSave; removeAudio: AudioRm;
}) {
  const [titleNl, setTitleNl] = useState(chapter.title.nl);
  const [titleEn, setTitleEn] = useState(chapter.title.en ?? "");
  const [titleDe, setTitleDe] = useState(chapter.title.de ?? "");
  const [dirty, setDirty] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);

  function markDirty(setter: (v: string) => void, val: string) {
    setter(val);
    setDirty(true);
  }

  async function saveTitles() {
    setSavingTitle(true);
    await onUpdateModule({ id: chapter._id, title: { nl: titleNl, en: titleEn, de: titleDe || undefined } });
    setSavingTitle(false);
    setDirty(false);
  }

  return (
    <div className="border-t border-rule/50 p-4 space-y-3 bg-warm/5">
      {/* Title NL with DeepL */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] text-ink/50">Titel (NL)</p>
          <DeepLButton sourceText={titleNl} onTranslated={(t) => { markDirty(setTitleEn, t.en ?? titleEn); markDirty(setTitleDe, t.de ?? titleDe); }} />
        </div>
        <input value={titleNl} onChange={(e) => markDirty(setTitleNl, e.target.value)}
          className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-ink/50 mb-1">Titel (EN)</p>
          <input value={titleEn} onChange={(e) => markDirty(setTitleEn, e.target.value)}
            className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
        </div>
        <div>
          <p className="text-[11px] text-ink/50 mb-1">Titel (DE)</p>
          <input value={titleDe} onChange={(e) => markDirty(setTitleDe, e.target.value)}
            className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
        </div>
      </div>
      {dirty && (
        <button onClick={saveTitles} disabled={savingTitle}
          className="text-[11px] text-copper hover:text-copper-light cursor-pointer disabled:opacity-50">
          {savingTitle ? "Opslaan..." : "Titels opslaan"}
        </button>
      )}

      {/* Audio upload */}
      <ModuleAudioField
        moduleId={chapter._id}
        hasAudio={hasAudio}
        fileName={audioFile}
        onUpload={async (file) => {
          const url = await generateUploadUrl();
          const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
          const { storageId } = await res.json();
          await saveAudio({ moduleId: chapter._id, storageId, fileName: file.name });
        }}
        onRemove={async () => { await removeAudio({ moduleId: chapter._id }); }}
      />

      {/* Delete */}
      <button onClick={async () => { if (confirm(`Hoofdstuk "${chapter.title.nl}" verwijderen?`)) await onDeleteModule({ id: chapter._id }); }}
        className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer">
        Verwijder hoofdstuk
      </button>
    </div>
  );
}

/* ─── Training module hierarchy ─── */

function TrainingModuleList({ topModules, lessonMap, expandedModuleId, addingModule, addingLessonFor, formTitle, saving, onToggleExpand, onToggleAddModule, onFormTitleChange, onAddModule, onCancelAddModule, onStartAddLesson, onAddLesson, onCancelAddLesson, onUpdateModule, onDeleteModule, generateUploadUrl, saveAudio, removeAudio, onEditQuiz }: {
  topModules: Mod[]; lessonMap: Map<string, Mod[]>; isAudiobook: boolean;
  expandedModuleId: string | null; addingModule: boolean; addingLessonFor: string | null; formTitle: string; saving: boolean;
  onToggleExpand: (id: string) => void; onToggleAddModule: () => void; onFormTitleChange: (v: string) => void;
  onAddModule: () => void; onCancelAddModule: () => void; onStartAddLesson: (id: string) => void;
  onAddLesson: (parentId: Id<"trainingModules">) => Promise<void>; onCancelAddLesson: () => void;
  onUpdateModule: ModMut; onDeleteModule: ModDel; generateUploadUrl: GenUrl; saveAudio: AudioSave; removeAudio: AudioRm;
  onEditQuiz: (id: Id<"trainingModules">) => void;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">Modules ({topModules.length})</h3>
        <button onClick={onToggleAddModule} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
          {addingModule ? "Annuleer" : "+ Module toevoegen"}
        </button>
      </div>

      {addingModule && (
        <InlineForm placeholder="Naam van de module" value={formTitle} onChange={onFormTitleChange} saving={saving} onSave={onAddModule} onCancel={onCancelAddModule} />
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
              <button type="button" onClick={() => onToggleExpand(mod._id)}
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

              {isExpanded && (
                <div className="border-t border-rule p-4 space-y-3 bg-warm/5">
                  {lessons.map((lesson, lessonIdx) => (
                    <LessonCard
                      key={lesson._id}
                      lesson={lesson}
                      label={`${modIdx + 1}.${lessonIdx + 1}`}
                      onUpdateModule={onUpdateModule}
                      onUploadAudio={async (file) => {
                        const url = await generateUploadUrl();
                        const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
                        const { storageId } = await res.json();
                        await saveAudio({ moduleId: lesson._id, storageId, fileName: file.name });
                      }}
                      onRemoveAudio={async () => { await removeAudio({ moduleId: lesson._id }); }}
                      onDelete={async () => { if (confirm(`Training "${lesson.title.nl}" verwijderen?`)) await onDeleteModule({ id: lesson._id }); }}
                      onEditQuiz={() => onEditQuiz(lesson._id)}
                    />
                  ))}

                  {addingLessonFor === mod._id ? (
                    <InlineForm placeholder={`Titel training ${modIdx + 1}.${lessons.length + 1}`} value={formTitle} onChange={onFormTitleChange} saving={saving}
                      onSave={() => onAddLesson(mod._id)} onCancel={onCancelAddLesson} />
                  ) : (
                    <button onClick={() => onStartAddLesson(mod._id)} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">+ Training toevoegen</button>
                  )}

                  <div className="flex items-center gap-3 pt-2 border-t border-rule">
                    <button onClick={() => onEditQuiz(mod._id)} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">Quiz beheren</button>
                    <button onClick={async () => {
                      if (confirm("Module en alle trainingen verwijderen?")) {
                        for (const l of lessons) await onDeleteModule({ id: l._id });
                        await onDeleteModule({ id: mod._id });
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
  );
}

/* ─── Lesson card within a training module ─── */

function LessonCard({ lesson, label, onUpdateModule, onUploadAudio, onRemoveAudio, onDelete, onEditQuiz }: {
  lesson: Mod & { vimeoVideoId?: string; quizRequired?: boolean }; label: string;
  onUpdateModule: ModMut; onUploadAudio: (file: File) => Promise<void>; onRemoveAudio: () => Promise<void>;
  onDelete: () => Promise<void>; onEditQuiz: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasAudio = !!(lesson as Record<string, unknown>).audioStorageId;
  const audioFile = (lesson as Record<string, unknown>).audioFileName as string | undefined;

  return (
    <div className="border border-rule/60 rounded-[2px] bg-paper overflow-hidden">
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left cursor-pointer hover:bg-warm/20 transition-colors">
        <span className="text-[12px] font-medium text-ink/25 w-8">{label}</span>
        <p className="text-[13px] font-medium text-ink flex-1">{lesson.title.nl}</p>
        {lesson.vimeoVideoId && <span className="text-[10px] text-ink/30">Video</span>}
        {hasAudio && <span className="text-[10px] text-ink/30">Audio</span>}
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={`text-ink/20 transition-transform ${expanded ? "rotate-180" : ""}`}><path d="M4 6l4 4 4-4" /></svg>
      </button>

      {expanded && (
        <div className="border-t border-rule/50 p-3 space-y-3">
          <EditableField label="Titel" value={lesson.title.nl} onSave={async (v) => { await onUpdateModule({ id: lesson._id, title: { nl: v, en: lesson.title.en ?? v } }); }} />
          <EditableField label="Beschrijving" value={lesson.description.nl} onSave={async (v) => { await onUpdateModule({ id: lesson._id, description: { nl: v, en: v } }); }} multiline />
          <ModuleVideoField moduleId={lesson._id} currentVideoId={lesson.vimeoVideoId} onSave={async (videoId) => { await onUpdateModule({ id: lesson._id, vimeoVideoId: videoId }); }} />
          <div className="flex items-center gap-3 pt-2">
            <button onClick={onEditQuiz} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">Quiz</button>
            <button onClick={onDelete} className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer">Verwijder</button>
          </div>
        </div>
      )}
    </div>
  );
}
