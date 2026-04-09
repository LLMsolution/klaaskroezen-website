"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { ModuleVideoField } from "./ModuleFields";
import { InlineForm } from "./TrainingEditorSections";
import { LangField, mergeLang, type Lang } from "./LangEditor";
import { LessonFormEditor } from "./LessonFormEditor";

// Keep the shape loose — consumed from TrainingEditor which already queries the raw data.
export type SortableModule = {
  _id: Id<"trainingModules">;
  parentModuleId?: Id<"trainingModules">;
  title: { nl: string; en?: string; de?: string };
  description: { nl: string; en?: string; de?: string };
  sortOrder: number;
  displayNumber?: string;
  vimeoVideoId?: string;
  quizRequired?: boolean;
};

type ModuleMut = ReturnType<typeof useMutation<typeof api.trainingModules.updateModule>>;
type ModuleDel = ReturnType<typeof useMutation<typeof api.trainingModules.deleteModule>>;

interface Props {
  topModules: SortableModule[];
  lessonMap: Map<string, SortableModule[]>;
  editLang: Lang;
  expandedModuleId: string | null;
  addingModule: boolean;
  addingLessonFor: string | null;
  formTitle: string;
  saving: boolean;
  onToggleExpand: (id: string) => void;
  onToggleAddModule: () => void;
  onFormTitleChange: (v: string) => void;
  onAddModule: () => void;
  onCancelAddModule: () => void;
  onStartAddLesson: (id: string) => void;
  onAddLesson: (parentId: Id<"trainingModules">) => Promise<void>;
  onCancelAddLesson: () => void;
  onUpdateModule: ModuleMut;
  onDeleteModule: ModuleDel;
  onEditQuiz: (id: Id<"trainingModules">) => void;
}

export function TrainingModuleSortable({
  topModules,
  lessonMap,
  editLang,
  expandedModuleId,
  addingModule,
  addingLessonFor,
  formTitle,
  saving,
  onToggleExpand,
  onToggleAddModule,
  onFormTitleChange,
  onAddModule,
  onCancelAddModule,
  onStartAddLesson,
  onAddLesson,
  onCancelAddLesson,
  onUpdateModule,
  onDeleteModule,
  onEditQuiz,
}: Props) {
  const reorderModules = useMutation(api.trainingModules.reorderModules);
  // Local ordered copy so drag feels instant while mutation resolves.
  const [orderedTop, setOrderedTop] = useState(topModules);
  useEffect(() => {
    setOrderedTop([...topModules].sort((a, b) => a.sortOrder - b.sortOrder));
  }, [topModules]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleTopDragEnd(ev: DragEndEvent) {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const oldIdx = orderedTop.findIndex((m) => m._id === active.id);
    const newIdx = orderedTop.findIndex((m) => m._id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(orderedTop, oldIdx, newIdx);
    setOrderedTop(next);
    await reorderModules({ orderedIds: next.map((m) => m._id) });
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
          Modules ({orderedTop.length})
        </h3>
        <button onClick={onToggleAddModule} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
          {addingModule ? "Annuleer" : "+ Module toevoegen"}
        </button>
      </div>

      {addingModule && (
        <InlineForm
          placeholder="Naam van de module"
          value={formTitle}
          onChange={onFormTitleChange}
          saving={saving}
          onSave={onAddModule}
          onCancel={onCancelAddModule}
        />
      )}

      {orderedTop.length === 0 && !addingModule && (
        <p className="text-[14px] text-ink/30 py-6 text-center border border-dashed border-rule rounded-[2px]">
          Nog geen modules.
        </p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTopDragEnd}>
        <SortableContext items={orderedTop.map((m) => m._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {orderedTop.map((mod, modIdx) => {
              const lessons = (lessonMap.get(mod._id) ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
              const isExpanded = expandedModuleId === mod._id;
              const autoLabel = String(modIdx + 1).padStart(2, "0");
              return (
                <SortableModuleRow
                  key={mod._id}
                  mod={mod}
                  editLang={editLang}
                  autoLabel={autoLabel}
                  lessonCount={lessons.length}
                  isExpanded={isExpanded}
                  onToggleExpand={() => onToggleExpand(mod._id)}
                  onUpdateModule={onUpdateModule}
                >
                  {isExpanded && (
                    <ExpandedModuleBody
                      modIdx={modIdx}
                      mod={mod}
                      editLang={editLang}
                      lessons={lessons}
                      addingLessonFor={addingLessonFor}
                      formTitle={formTitle}
                      saving={saving}
                      onFormTitleChange={onFormTitleChange}
                      onStartAddLesson={onStartAddLesson}
                      onAddLesson={onAddLesson}
                      onCancelAddLesson={onCancelAddLesson}
                      onUpdateModule={onUpdateModule}
                      onDeleteModule={onDeleteModule}
                      onEditQuiz={onEditQuiz}
                      reorderModules={reorderModules}
                    />
                  )}
                </SortableModuleRow>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

/* ─── Sortable row for a top-level module (collapsed + expanded slot) ─── */

function SortableModuleRow({
  mod,
  editLang,
  autoLabel,
  lessonCount,
  isExpanded,
  onToggleExpand,
  onUpdateModule,
  children,
}: {
  mod: SortableModule;
  editLang: Lang;
  autoLabel: string;
  lessonCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateModule: ModuleMut;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mod._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const displayLabel = mod.displayNumber?.trim() || autoLabel;
  const displayTitle = mod.title[editLang] || mod.title.nl || `Module ${displayLabel}`;

  return (
    <div ref={setNodeRef} style={style} className="border border-rule rounded-[2px] overflow-hidden bg-paper">
      <div className="w-full flex items-center gap-3 p-4 hover:bg-warm/20 transition-colors">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Versleep module"
          className="cursor-grab active:cursor-grabbing text-ink/25 hover:text-ink/60 touch-none"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.3" /><circle cx="5" cy="8" r="1.3" /><circle cx="5" cy="12" r="1.3" />
            <circle cx="11" cy="4" r="1.3" /><circle cx="11" cy="8" r="1.3" /><circle cx="11" cy="12" r="1.3" />
          </svg>
        </button>

        {/* Editable display number */}
        <DisplayNumberInput
          value={mod.displayNumber ?? ""}
          placeholder={autoLabel}
          onSave={async (v) => { await onUpdateModule({ id: mod._id, displayNumber: v }); }}
        />

        <button type="button" onClick={onToggleExpand} className="flex-1 text-left cursor-pointer">
          <p className="text-[14px] font-medium text-ink">{displayTitle}</p>
          <p className="text-[11px] text-ink/40">{lessonCount} les{lessonCount !== 1 ? "sen" : ""}</p>
        </button>

        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`text-ink/30 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          onClick={onToggleExpand}
          style={{ cursor: "pointer" }}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </div>
      {children}
    </div>
  );
}

/* ─── Expanded module body with sortable lesson list ─── */

function ExpandedModuleBody({
  modIdx,
  mod,
  editLang,
  lessons,
  addingLessonFor,
  formTitle,
  saving,
  onFormTitleChange,
  onStartAddLesson,
  onAddLesson,
  onCancelAddLesson,
  onUpdateModule,
  onDeleteModule,
  onEditQuiz,
  reorderModules,
}: {
  modIdx: number;
  mod: SortableModule;
  editLang: Lang;
  lessons: SortableModule[];
  addingLessonFor: string | null;
  formTitle: string;
  saving: boolean;
  onFormTitleChange: (v: string) => void;
  onStartAddLesson: (id: string) => void;
  onAddLesson: (parentId: Id<"trainingModules">) => Promise<void>;
  onCancelAddLesson: () => void;
  onUpdateModule: ModuleMut;
  onDeleteModule: ModuleDel;
  onEditQuiz: (id: Id<"trainingModules">) => void;
  reorderModules: ReturnType<typeof useMutation<typeof api.trainingModules.reorderModules>>;
}) {
  const [orderedLessons, setOrderedLessons] = useState(lessons);
  useEffect(() => { setOrderedLessons(lessons); }, [lessons]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleLessonDragEnd(ev: DragEndEvent) {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const oldIdx = orderedLessons.findIndex((l) => l._id === active.id);
    const newIdx = orderedLessons.findIndex((l) => l._id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(orderedLessons, oldIdx, newIdx);
    setOrderedLessons(next);
    await reorderModules({ orderedIds: next.map((l) => l._id) });
  }

  return (
    <div className="border-t border-rule p-4 space-y-3 bg-warm/5">
      {/* Title & description in the active lang (with DeepL button for non-NL) */}
      <LangField
        label="Module titel"
        value={mod.title[editLang] ?? ""}
        sourceNl={mod.title.nl}
        lang={editLang}
        onSave={async (v) => {
          await onUpdateModule({ id: mod._id, title: mergeLang(mod.title, editLang, v) });
        }}
      />
      <LangField
        label="Module beschrijving"
        value={mod.description[editLang] ?? ""}
        sourceNl={mod.description.nl}
        lang={editLang}
        multiline
        onSave={async (v) => {
          await onUpdateModule({ id: mod._id, description: mergeLang(mod.description, editLang, v) });
        }}
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
        <SortableContext items={orderedLessons.map((l) => l._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {orderedLessons.map((lesson, lessonIdx) => (
              <SortableLessonRow
                key={lesson._id}
                lesson={lesson}
                editLang={editLang}
                autoLabel={`${modIdx + 1}.${lessonIdx + 1}`}
                onUpdateModule={onUpdateModule}
                onDelete={async () => {
                  if (confirm(`Les "${lesson.title.nl}" verwijderen?`)) await onDeleteModule({ id: lesson._id });
                }}
                onEditQuiz={() => onEditQuiz(lesson._id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {addingLessonFor === mod._id ? (
        <InlineForm
          placeholder={`Titel les ${modIdx + 1}.${orderedLessons.length + 1}`}
          value={formTitle}
          onChange={onFormTitleChange}
          saving={saving}
          onSave={() => onAddLesson(mod._id)}
          onCancel={onCancelAddLesson}
        />
      ) : (
        <button
          onClick={() => onStartAddLesson(mod._id)}
          className="text-[12px] text-copper hover:text-copper-light cursor-pointer"
        >
          + Les toevoegen
        </button>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-rule">
        <button onClick={() => onEditQuiz(mod._id)} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
          Quiz beheren
        </button>
        <button
          onClick={async () => {
            if (confirm("Module en alle lessen verwijderen?")) {
              for (const l of orderedLessons) await onDeleteModule({ id: l._id });
              await onDeleteModule({ id: mod._id });
            }
          }}
          className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer"
        >
          Verwijder module
        </button>
      </div>
    </div>
  );
}

/* ─── Sortable row for a lesson ─── */

function SortableLessonRow({
  lesson,
  editLang,
  autoLabel,
  onUpdateModule,
  onDelete,
  onEditQuiz,
}: {
  lesson: SortableModule;
  editLang: Lang;
  autoLabel: string;
  onUpdateModule: ModuleMut;
  onDelete: () => Promise<void>;
  onEditQuiz: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const [expanded, setExpanded] = useState(false);
  const displayLabel = lesson.displayNumber?.trim() || autoLabel;
  const displayTitle = lesson.title[editLang] || lesson.title.nl || `Les ${displayLabel}`;

  return (
    <div ref={setNodeRef} style={style} className="border border-rule/60 rounded-[2px] bg-paper overflow-hidden">
      <div className="w-full flex items-center gap-3 p-3 hover:bg-warm/20 transition-colors">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Versleep les"
          className="cursor-grab active:cursor-grabbing text-ink/25 hover:text-ink/60 touch-none"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.3" /><circle cx="5" cy="8" r="1.3" /><circle cx="5" cy="12" r="1.3" />
            <circle cx="11" cy="4" r="1.3" /><circle cx="11" cy="8" r="1.3" /><circle cx="11" cy="12" r="1.3" />
          </svg>
        </button>
        <DisplayNumberInput
          value={lesson.displayNumber ?? ""}
          placeholder={autoLabel}
          onSave={async (v) => { await onUpdateModule({ id: lesson._id, displayNumber: v }); }}
          compact
        />
        <button type="button" onClick={() => setExpanded(!expanded)} className="flex-1 text-left cursor-pointer">
          <p className="text-[13px] font-medium text-ink">{displayTitle}</p>
        </button>
        {lesson.vimeoVideoId && <span className="text-[10px] text-ink/30">Video</span>}
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`text-ink/20 transition-transform ${expanded ? "rotate-180" : ""}`}
          onClick={() => setExpanded(!expanded)}
          style={{ cursor: "pointer" }}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-rule/50 p-4 space-y-4">
          {/* Two-column layout: text inputs left, video preview right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <LangField
                label="Les titel"
                value={lesson.title[editLang] ?? ""}
                sourceNl={lesson.title.nl}
                lang={editLang}
                onSave={async (v) => {
                  await onUpdateModule({ id: lesson._id, title: mergeLang(lesson.title, editLang, v) });
                }}
              />
              <LangField
                label="Les beschrijving"
                value={lesson.description[editLang] ?? ""}
                sourceNl={lesson.description.nl}
                lang={editLang}
                multiline
                onSave={async (v) => {
                  await onUpdateModule({ id: lesson._id, description: mergeLang(lesson.description, editLang, v) });
                }}
              />
            </div>
            <div>
              <ModuleVideoField
                moduleId={lesson._id}
                currentVideoId={lesson.vimeoVideoId}
                onSave={async (videoId) => { await onUpdateModule({ id: lesson._id, vimeoVideoId: videoId }); }}
              />
            </div>
          </div>
          <LessonFormEditor moduleId={lesson._id} />
          <div className="flex items-center gap-3 pt-2 border-t border-rule/50">
            <button onClick={onEditQuiz} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">Quiz</button>
            <button onClick={onDelete} className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer">Verwijder</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Inline editable displayNumber override ─── */

function DisplayNumberInput({
  value,
  placeholder,
  onSave,
  compact,
}: {
  value: string;
  placeholder: string;
  onSave: (v: string) => Promise<void>;
  compact?: boolean;
}) {
  const [val, setVal] = useState(value);
  useEffect(() => { setVal(value); }, [value]);

  async function commit() {
    if (val === value) return;
    await onSave(val.trim());
  }

  const width = compact ? "w-12" : "w-14";
  return (
    <input
      type="text"
      value={val}
      placeholder={placeholder}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className={`${width} text-center text-[12px] text-ink/60 bg-transparent border border-rule/40 px-1 py-1 rounded-[2px] focus:border-copper focus:outline-none`}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
