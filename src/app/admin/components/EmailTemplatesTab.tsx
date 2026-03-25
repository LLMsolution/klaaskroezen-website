"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { formatDate, Loading, EmptyState } from "./shared";
import { CreateTemplateForm } from "./CreateTemplateForm";
import { TemplateDetailPanel, type Template } from "./TemplateDetailPanel";

const TYPE_LABELS: Record<string, string> = {
  transactional: "Transactioneel",
  training: "Training",
  book: "Boek",
  marketing: "Marketing",
};

const TYPE_ORDER: Record<string, number> = {
  transactional: 0,
  training: 1,
  book: 2,
  marketing: 3,
};

function getTemplateType(t: Template): string {
  const key = t.templateKey.toLowerCase();
  if (key.includes("welcome") || key.includes("confirm") || key.includes("receipt") || key.includes("invoice")) {
    return "transactional";
  }
  if (t.sequenceType === "training" || key.includes("training") || key.includes("set-") || key.includes("cst-")) {
    return "training";
  }
  if (t.sequenceType === "book" || key.includes("book") || key.includes("boek")) {
    return "book";
  }
  return "marketing";
}

export function EmailTemplatesTab() {
  const templates = useQuery(api.admin.getEmailTemplates);
  const updateTemplate = useMutation(api.admin.updateEmailTemplate);
  const deleteTemplate = useMutation(api.emailAdmin.deleteTemplate);
  const duplicateTemplate = useMutation(api.emailAdmin.duplicateTemplate);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<Id<"emailTemplates"> | null>(null);
  const [previewWidth, setPreviewWidth] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewLang, setPreviewLang] = useState<"nl" | "en" | "de">("nl");
  const [editSubjectNl, setEditSubjectNl] = useState("");
  const [editSubjectEn, setEditSubjectEn] = useState("");
  const [editSubjectDe, setEditSubjectDe] = useState("");
  const [editHtmlNl, setEditHtmlNl] = useState("");
  const [editHtmlEn, setEditHtmlEn] = useState("");
  const [editHtmlDe, setEditHtmlDe] = useState("");
  const [editDelayDays, setEditDelayDays] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editMode, setEditMode] = useState<"preview" | "edit" | "ai">("preview");
  const [saving, setSaving] = useState(false);

  if (templates === undefined) return <Loading />;

  if (templates.length === 0 && !showCreate) return (
    <div>
      <EmptyState text="Geen e-mail templates gevonden." />
      <button onClick={() => setShowCreate(true)} className="mt-4 text-[13px] text-copper hover:text-copper-light cursor-pointer">
        + Nieuwe template aanmaken
      </button>
    </div>
  );

  const grouped = new Map<string, Template[]>();
  for (const t of templates) {
    const type = getTemplateType(t as Template);
    const existing = grouped.get(type) || [];
    existing.push(t as Template);
    grouped.set(type, existing);
  }

  const sortedGroups = [...grouped.entries()].sort(
    (a, b) => (TYPE_ORDER[a[0]] ?? 99) - (TYPE_ORDER[b[0]] ?? 99)
  );

  const selectedTemplate = selectedId
    ? (templates.find((t) => t._id === selectedId) as Template | undefined)
    : null;

  function selectTemplate(t: Template) {
    setSelectedId(t._id);
    setEditSubjectNl(t.subjectNl);
    setEditSubjectEn(t.subjectEn);
    setEditSubjectDe(t.subjectDe ?? "");
    setEditHtmlNl(t.htmlNl);
    setEditHtmlEn(t.htmlEn);
    setEditHtmlDe(t.htmlDe ?? "");
    setEditDelayDays(String(t.delayDays));
    setEditActive(t.active);
    setEditMode("preview");
    setPreviewLang("nl");
    setPreviewWidth("desktop");
  }

  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    try {
      await updateTemplate({
        id: selectedId,
        subjectNl: editSubjectNl,
        subjectEn: editSubjectEn,
        subjectDe: editSubjectDe || undefined,
        htmlNl: editHtmlNl,
        htmlEn: editHtmlEn,
        htmlDe: editHtmlDe || undefined,
        delayDays: Number(editDelayDays),
        active: editActive,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Create new template */}
      {showCreate ? (
        <CreateTemplateForm onDone={() => setShowCreate(false)} />
      ) : (
        <button onClick={() => setShowCreate(true)} className="text-[13px] text-copper hover:text-copper-light transition-colors cursor-pointer">
          + Nieuwe template aanmaken
        </button>
      )}

      {/* Detail panel */}
      {selectedTemplate && (
        <TemplateDetailPanel
          template={selectedTemplate}
          previewWidth={previewWidth}
          setPreviewWidth={setPreviewWidth}
          previewLang={previewLang}
          setPreviewLang={setPreviewLang}
          editSubjectNl={editSubjectNl}
          setEditSubjectNl={setEditSubjectNl}
          editSubjectEn={editSubjectEn}
          setEditSubjectEn={setEditSubjectEn}
          editSubjectDe={editSubjectDe}
          setEditSubjectDe={setEditSubjectDe}
          editHtmlNl={editHtmlNl}
          setEditHtmlNl={setEditHtmlNl}
          editHtmlEn={editHtmlEn}
          setEditHtmlEn={setEditHtmlEn}
          editHtmlDe={editHtmlDe}
          setEditHtmlDe={setEditHtmlDe}
          editDelayDays={editDelayDays}
          setEditDelayDays={setEditDelayDays}
          editActive={editActive}
          setEditActive={setEditActive}
          editMode={editMode}
          setEditMode={setEditMode}
          saving={saving}
          onSave={handleSave}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Template grid grouped by type */}
      {sortedGroups.map(([type, items]) => (
        <div key={type}>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">
            {TYPE_LABELS[type] || type} ({items.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items
              .sort((a, b) => a.stepIndex - b.stepIndex)
              .map((t) => (
                <TemplateCard
                  key={t._id}
                  template={t}
                  isSelected={selectedId === t._id}
                  onClick={() => selectTemplate(t)}
                  onDuplicate={() => duplicateTemplate({ id: t._id })}
                  onDelete={() => { if (confirm("Template verwijderen?")) deleteTemplate({ id: t._id }); }}
                  onSaveSubjects={(subjectNl, subjectEn) => {
                    updateTemplate({ id: t._id, subjectNl, subjectEn });
                  }}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Template Card ─── */

function TemplateCard({
  template,
  isSelected,
  onClick,
  onDuplicate,
  onDelete,
  onSaveSubjects,
}: {
  template: Template;
  isSelected: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSaveSubjects: (subjectNl: string, subjectEn: string) => void;
}) {
  const [editingSubject, setEditingSubject] = useState(false);
  const [localSubjectNl, setLocalSubjectNl] = useState(template.subjectNl);
  const [localSubjectEn, setLocalSubjectEn] = useState(template.subjectEn);

  function handleStartEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setLocalSubjectNl(template.subjectNl);
    setLocalSubjectEn(template.subjectEn);
    setEditingSubject(true);
  }

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    onSaveSubjects(localSubjectNl, localSubjectEn);
    setEditingSubject(false);
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation();
    setEditingSubject(false);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={editingSubject ? undefined : onClick}
      onKeyDown={(e) => { if (!editingSubject && (e.key === "Enter" || e.key === " ")) onClick(); }}
      className={`text-left border rounded-[2px] p-4 transition-colors w-full ${
        editingSubject
          ? "border-copper bg-copper/5"
          : isSelected
            ? "border-copper bg-copper/5 cursor-pointer"
            : template.active
              ? "border-rule hover:border-copper/40 hover:bg-warm/20 cursor-pointer"
              : "border-rule/50 opacity-50 hover:opacity-75 cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] text-ink/40 font-mono truncate">{template.templateKey}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {template.abTestActive && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-[2px] font-medium bg-purple-100 text-purple-700">
              A/B
            </span>
          )}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-[2px] font-medium ${
              template.active ? "bg-green-100 text-green-700" : "bg-ink/5 text-ink/40"
            }`}
          >
            {template.active ? "Actief" : "Uit"}
          </span>
        </div>
      </div>

      {editingSubject ? (
        <div className="space-y-2 mb-2" onClick={(e) => e.stopPropagation()}>
          <div>
            <label className="text-[9px] font-medium tracking-[0.15em] uppercase text-ink/40 block mb-0.5">NL</label>
            <input
              type="text"
              value={localSubjectNl}
              onChange={(e) => setLocalSubjectNl(e.target.value)}
              className="w-full px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent focus:border-copper focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] font-medium tracking-[0.15em] uppercase text-ink/40 block mb-0.5">EN</label>
            <input
              type="text"
              value={localSubjectEn}
              onChange={(e) => setLocalSubjectEn(e.target.value)}
              className="w-full px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent focus:border-copper focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5 justify-end">
            <button onClick={handleCancel} className="text-[10px] text-ink/40 hover:text-ink cursor-pointer px-2 py-0.5">
              Annuleren
            </button>
            <button onClick={handleSave} className="text-[10px] font-medium text-copper hover:text-copper-light cursor-pointer px-2 py-0.5">
              Opslaan
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 mb-1.5 group">
          <p className="text-[13px] font-medium text-ink truncate">{template.subjectNl}</p>
          <button
            onClick={handleStartEdit}
            className="text-[10px] text-ink/20 hover:text-copper transition-colors cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
            title="Onderwerpen bewerken"
          >
            Bewerk
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-[10px] text-ink/40">
          {template.sequenceType} stap {template.stepIndex + 1}
        </span>
        <span className="text-[10px] text-ink/40">dag {template.delayDays}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        {template.updatedAt > 0 && (
          <p className="text-[10px] text-ink/30">
            Bijgewerkt {formatDate(template.updatedAt)}
          </p>
        )}
        <div className="flex gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
          <button onClick={onDuplicate} className="text-[10px] text-ink/30 hover:text-copper transition-colors cursor-pointer" title="Dupliceren">
            Kopieer
          </button>
          <button onClick={onDelete} className="text-[10px] text-ink/30 hover:text-red-500 transition-colors cursor-pointer" title="Verwijderen">
            Verwijder
          </button>
        </div>
      </div>
    </div>
  );
}

