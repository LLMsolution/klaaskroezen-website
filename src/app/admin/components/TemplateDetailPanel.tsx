"use client";

import type { Id } from "../../../../convex/_generated/dataModel";
import { AbTestPanel } from "./AbTestPanel";
import { EmailAIPanel } from "./EmailAIPanel";
import { layout } from "../../../../convex/emailHelpers";

type PreviewWidth = "desktop" | "tablet" | "mobile";

const PREVIEW_WIDTHS: Record<PreviewWidth, number> = {
  desktop: 600,
  tablet: 480,
  mobile: 375,
};

export type Template = {
  _id: Id<"emailTemplates">;
  _creationTime: number;
  templateKey: string;
  sequenceType: string;
  stepIndex: number;
  subjectNl: string;
  subjectEn: string;
  subjectDe?: string;
  htmlNl: string;
  htmlEn: string;
  htmlDe?: string;
  delayDays: number;
  active: boolean;
  updatedAt: number;
  abTestActive?: boolean;
  subjectNlB?: string;
  subjectEnB?: string;
  htmlNlB?: string;
  htmlEnB?: string;
};

export function TemplateDetailPanel({
  template,
  previewWidth,
  setPreviewWidth,
  previewLang,
  setPreviewLang,
  editSubjectNl,
  setEditSubjectNl,
  editSubjectEn,
  setEditSubjectEn,
  editSubjectDe,
  setEditSubjectDe,
  editHtmlNl,
  setEditHtmlNl,
  editHtmlEn,
  setEditHtmlEn,
  editHtmlDe,
  setEditHtmlDe,
  editDelayDays,
  setEditDelayDays,
  editActive,
  setEditActive,
  editMode,
  setEditMode,
  saving,
  onSave,
  onClose,
}: {
  template: Template;
  previewWidth: PreviewWidth;
  setPreviewWidth: (w: PreviewWidth) => void;
  previewLang: "nl" | "en" | "de";
  setPreviewLang: (l: "nl" | "en" | "de") => void;
  editSubjectNl: string;
  setEditSubjectNl: (v: string) => void;
  editSubjectEn: string;
  setEditSubjectEn: (v: string) => void;
  editSubjectDe: string;
  setEditSubjectDe: (v: string) => void;
  editHtmlNl: string;
  setEditHtmlNl: (v: string) => void;
  editHtmlEn: string;
  setEditHtmlEn: (v: string) => void;
  editHtmlDe: string;
  setEditHtmlDe: (v: string) => void;
  editDelayDays: string;
  setEditDelayDays: (v: string) => void;
  editActive: boolean;
  setEditActive: (v: boolean) => void;
  editMode: "preview" | "edit" | "ai";
  setEditMode: (m: "preview" | "edit" | "ai") => void;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const htmlByLang = { nl: editHtmlNl, en: editHtmlEn, de: editHtmlDe };
  const setHtmlByLang = { nl: setEditHtmlNl, en: setEditHtmlEn, de: setEditHtmlDe };
  const currentHtml = htmlByLang[previewLang];
  const setCurrentHtml = setHtmlByLang[previewLang];
  const widthPx = PREVIEW_WIDTHS[previewWidth];
  const previewHtml = currentHtml ? layout(currentHtml, { lang: previewLang }) : "";

  return (
    <div className="border border-copper/30 rounded-[2px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-warm/30 border-b border-rule">
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
            Template detail
          </p>
          <span className="text-[11px] text-ink/40 font-mono">{template.templateKey}</span>
        </div>
        <button onClick={onClose} className="text-[12px] text-ink/40 hover:text-ink transition-colors cursor-pointer">
          Sluiten
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Subject fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">
              Onderwerp (NL)
            </label>
            <input
              type="text"
              value={editSubjectNl}
              onChange={(e) => setEditSubjectNl(e.target.value)}
              className="w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">
              Subject (EN)
            </label>
            <input
              type="text"
              value={editSubjectEn}
              onChange={(e) => setEditSubjectEn(e.target.value)}
              className="w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">
              Betreff (DE)
            </label>
            <input
              type="text"
              value={editSubjectDe}
              onChange={(e) => setEditSubjectDe(e.target.value)}
              className="w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
            />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">
              Vertraging (dagen)
            </label>
            <input
              type="number"
              value={editDelayDays}
              onChange={(e) => setEditDelayDays(e.target.value)}
              className="w-24 bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">
              Status
            </label>
            <button
              onClick={() => setEditActive(!editActive)}
              className={`text-[12px] font-medium px-4 py-2.5 rounded-[2px] cursor-pointer transition-colors ${
                editActive
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-ink/5 text-ink/40 hover:bg-ink/10"
              }`}
            >
              {editActive ? "Actief" : "Inactief"}
            </button>
          </div>
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-copper text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>

        {/* Preview / Editor section */}
        <div className="border-t border-rule pt-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex border border-rule rounded-[2px] overflow-hidden">
              <button
                onClick={() => setEditMode("preview")}
                className={`text-[11px] px-4 py-1.5 cursor-pointer transition-colors ${
                  editMode === "preview" ? "bg-ink text-paper" : "text-ink/50 hover:bg-warm/30"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setEditMode("edit")}
                className={`text-[11px] px-4 py-1.5 cursor-pointer transition-colors ${
                  editMode === "edit" ? "bg-ink text-paper" : "text-ink/50 hover:bg-warm/30"
                }`}
              >
                HTML bewerken
              </button>
              <button
                onClick={() => setEditMode("ai")}
                className={`text-[11px] px-4 py-1.5 cursor-pointer transition-colors ${
                  editMode === "ai" ? "bg-copper text-paper" : "text-ink/50 hover:bg-warm/30"
                }`}
              >
                AI Editor
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex border border-rule rounded-[2px] overflow-hidden mr-2">
                {(["nl", "en", "de"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setPreviewLang(l)}
                    className={`text-[11px] px-3 py-1.5 cursor-pointer transition-colors ${
                      previewLang === l ? "bg-copper text-paper" : "text-ink/50 hover:bg-warm/30"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              {(["desktop", "tablet", "mobile"] as PreviewWidth[]).map((w) => (
                <button
                  key={w}
                  onClick={() => setPreviewWidth(w)}
                  className={`text-[11px] px-3 py-1.5 rounded-[2px] cursor-pointer transition-colors ${
                    previewWidth === w
                      ? "bg-ink text-paper"
                      : "border border-rule text-ink/50 hover:text-ink"
                  }`}
                >
                  {w === "desktop" ? "Desktop" : w === "tablet" ? "Tablet" : "Mobiel"}{" "}
                  <span className="text-[9px] opacity-60">{PREVIEW_WIDTHS[w]}px</span>
                </button>
              ))}
            </div>
          </div>

          {editMode === "ai" ? (
            <EmailAIPanel
              templateId={template._id}
              currentHtml={currentHtml}
              lang={previewLang}
              onApply={(html) => {
                setCurrentHtml(html);
                setEditMode("edit");
              }}
            />
          ) : editMode === "edit" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-2">
                  HTML ({previewLang.toUpperCase()})
                </p>
                <textarea
                  value={currentHtml}
                  onChange={(e) => setCurrentHtml(e.target.value)}
                  className="w-full bg-white border border-rule px-3 py-2.5 text-[12px] text-ink font-mono focus:border-copper focus:outline-none rounded-[2px] resize-y"
                  style={{ minHeight: 500 }}
                  spellCheck={false}
                />
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-2">
                  Live preview
                </p>
                <div className="bg-warm/20 rounded-[2px] p-3">
                  <div
                    className="bg-white border border-rule rounded-[2px] overflow-hidden mx-auto"
                    style={{ width: widthPx, maxWidth: "100%" }}
                  >
                    {currentHtml ? (
                      <iframe
                        srcDoc={previewHtml}
                        className="w-full border-0"
                        style={{ minHeight: 500 }}
                        title={`Edit preview ${previewLang.toUpperCase()}`}
                        sandbox="allow-same-origin"
                      />
                    ) : (
                      <div className="p-8 text-center text-[13px] text-ink/40">
                        Geen HTML. Begin met typen in de editor.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center bg-warm/20 rounded-[2px] p-4">
              <div
                className="bg-white border border-rule rounded-[2px] overflow-hidden transition-all duration-300"
                style={{ width: widthPx, maxWidth: "100%" }}
              >
                {currentHtml ? (
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full border-0"
                    style={{ minHeight: 400 }}
                    title={`Preview ${previewLang.toUpperCase()} - ${template.templateKey}`}
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="p-8 text-center text-[13px] text-ink/40">
                    Geen {{ nl: "Nederlandse", en: "Engelse", de: "Duitse" }[previewLang]} HTML beschikbaar.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* A/B Testing */}
        <AbTestPanel
          templateId={template._id}
          templateKey={template.templateKey}
          abTestActive={template.abTestActive}
          subjectNlB={template.subjectNlB}
          subjectEnB={template.subjectEnB}
          htmlNlB={template.htmlNlB}
          htmlEnB={template.htmlEnB}
        />
      </div>
    </div>
  );
}
