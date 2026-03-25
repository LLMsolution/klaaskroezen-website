"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { layout } from "../../../../convex/emailHelpers";

import type { Lang } from "@/lib/i18n";

interface Props {
  templateId: Id<"emailTemplates">;
  currentHtml: string;
  lang: Lang;
  onApply: (html: string) => void;
}

export function EmailAIPanel({ templateId, currentHtml, lang, onApply }: Props) {
  const [prompt, setPrompt] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.trainings.generateUploadUrl);
  const startSession = useMutation(api.emailEditor.startSession);
  const triggerGeneration = useAction(api.emailEditor.triggerGeneration);
  const applyToTemplate = useMutation(api.emailEditor.applyToTemplate);
  const discardSession = useMutation(api.emailEditor.discardSession);
  const activeSession = useQuery(api.emailEditor.getActiveSession);

  const sessionId = activeSession?._id;
  const session = useQuery(
    api.emailEditor.getSession,
    sessionId ? { sessionId } : "skip",
  );

  const isGenerating = session?.status === "generating" || session?.status === "pending";
  const isCompleted = session?.status === "completed";
  const isFailed = session?.status === "failed";
  const generatedHtml = session?.generatedHtml;

  async function handleUploadImage(file: File) {
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      // Construct the Convex storage URL
      const storageUrl = `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/api/storage/${storageId}`;
      setImageUrls([...imageUrls, storageUrl]);
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    const mode = currentHtml.trim() ? "edit" : "new";
    const id = await startSession({
      mode: mode as "new" | "edit",
      lang,
      prompt: prompt.trim(),
      imageUrls,
      existingHtml: mode === "edit" ? currentHtml : undefined,
      templateId,
    });
    await triggerGeneration({ sessionId: id });
  }

  async function handleApply() {
    if (generatedHtml && sessionId) {
      // First persist to DB
      await applyToTemplate({ sessionId, templateId });
      // Then update parent UI
      onApply(generatedHtml);
      // Then clean up session
      await discardSession({ sessionId });
    }
  }

  async function handleDiscard() {
    if (sessionId) await discardSession({ sessionId });
    setPrompt("");
    setImageUrls([]);
  }

  return (
    <div className="border border-copper/20 rounded-[2px] p-5 bg-copper/[0.02]">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
        AI Email Editor
      </p>

      {/* Image upload */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[11px] text-ink/50">Afbeeldingen</p>
          <label className={`text-[11px] text-copper hover:text-copper-light cursor-pointer ${uploading ? "opacity-50" : ""}`}>
            {uploading ? "Uploaden..." : "+ Upload"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadImage(f); }}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative group">
                <div className="w-16 h-16 border border-rule rounded-[2px] overflow-hidden bg-warm/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prompt */}
      <div className="mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={currentHtml.trim()
            ? 'Beschrijf je wijziging: "Vervang de afbeelding voor de geploade foto en wijzig de CTA naar /checkout/set-online"'
            : 'Beschrijf de email: "Maak een email over de lancering van de CST training met de geploade foto, eindig met een CTA naar de checkout"'
          }
          rows={3}
          className="w-full bg-transparent border border-rule px-3 py-2.5 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px] resize-y"
          disabled={isGenerating}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
        >
          {isGenerating ? "Genereren..." : currentHtml.trim() ? "Wijzig email" : "Genereer email"}
        </button>
        {isGenerating && (
          <span className="text-[12px] text-ink/40">
            Claude is bezig... (1-3 minuten)
          </span>
        )}
      </div>

      {/* Error */}
      {isFailed && session?.errorMessage && (
        <div className="border border-red-200 bg-red-50 rounded-[2px] px-4 py-3 mb-4">
          <p className="text-[13px] text-red-700">{session.errorMessage}</p>
        </div>
      )}

      {/* Generated result */}
      {isCompleted && generatedHtml && (
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-2">
            Resultaat
          </p>
          <div className="bg-warm/20 rounded-[2px] p-3 mb-4">
            <div className="bg-white border border-rule rounded-[2px] overflow-hidden mx-auto" style={{ maxWidth: 600 }}>
              <iframe
                srcDoc={layout(generatedHtml, { lang })}
                className="w-full border-0"
                style={{ minHeight: 400 }}
                title="AI generated email preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleApply}
              className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
            >
              Toepassen
            </button>
            <button
              onClick={handleDiscard}
              className="text-[12px] text-ink/40 hover:text-ink cursor-pointer"
            >
              Verwerpen
            </button>
            <button
              onClick={() => { setPrompt(""); }}
              className="text-[12px] text-copper hover:text-copper-light cursor-pointer"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
