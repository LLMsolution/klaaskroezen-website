"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading, EmptyState } from "./shared";
import { ImageCropper } from "@/components/ui/ImageCropper";

type Lang = "nl" | "en" | "de";

export function ImagesTab() {
  const categories = useQuery(api.siteImages.listCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const images = useQuery(api.siteImages.listAll, { category: selectedCategory ?? undefined });
  const allSpecs = useQuery(api.imageSpecs.listAllSpecs);

  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [altValue, setAltValue] = useState("");

  if (categories === undefined || images === undefined) return <Loading />;

  // Build specs lookup (graceful — works even if specs query fails or is loading)
  const specsByKey = new Map((allSpecs ?? []).map((s) => [s.imageKey, s]));

  return (
    <div>
      {/* Category filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`text-[12px] px-3 py-1.5 rounded-[2px] border cursor-pointer transition-colors ${
            !selectedCategory ? "border-copper bg-copper/10 text-copper font-medium" : "border-rule text-ink/40 hover:border-copper/30"
          }`}
        >
          Alles ({images.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-[12px] px-3 py-1.5 rounded-[2px] border cursor-pointer transition-colors ${
              selectedCategory === cat ? "border-copper bg-copper/10 text-copper font-medium" : "border-rule text-ink/40 hover:border-copper/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {images.length === 0 ? (
        <EmptyState text="Geen afbeeldingen gevonden. Voer het migratiescript uit of upload nieuwe afbeeldingen." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <ImageCard
              key={img._id}
              img={img}
              spec={specsByKey.get(img.key)}
              editingAlt={editingAlt}
              altValue={altValue}
              setEditingAlt={setEditingAlt}
              setAltValue={setAltValue}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type ImageDoc = {
  _id: Id<"siteImages">;
  key: string;
  url: string | null;
  alt?: string;
  category: string;
  width?: number;
  height?: number;
  lang: string | null;
};

type SpecDoc = {
  imageKey: string;
  displayWidth: number;
  displayHeight: number;
  aspectRatio: string;
  context: string;
};

function ImageCard({
  img,
  spec,
  editingAlt,
  altValue,
  setEditingAlt,
  setAltValue,
}: {
  img: ImageDoc;
  spec?: SpecDoc;
  editingAlt: string | null;
  altValue: string;
  setEditingAlt: (v: string | null) => void;
  setAltValue: (v: string) => void;
}) {
  const generateUploadUrl = useMutation(api.siteImages.generateUploadUrl);
  const saveImage = useMutation(api.siteImages.saveImage);
  const updateAlt = useMutation(api.siteImages.updateAlt);
  const deleteImage = useMutation(api.siteImages.deleteImage);
  const [uploading, setUploading] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [uploadLang, setUploadLang] = useState<Lang | undefined>(undefined);
  const [showPreview, setShowPreview] = useState(false);

  const isBook = img.category === "book";
  const dimMatch = getDimStatus(img, spec);

  async function handleReplace(file: File, lang?: Lang) {
    if (spec) {
      setUploadLang(lang);
      setCropFile(file);
      return;
    }
    await directUpload(file, lang);
  }

  async function directUpload(fileOrBlob: File | Blob, lang?: Lang, width?: number, height?: number) {
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": fileOrBlob.type || "image/webp" }, body: fileOrBlob });
      const { storageId } = await res.json();
      await saveImage({ key: img.key, storageId, fileName: img.key.split("/").pop() || "image.webp", category: img.category, alt: img.alt, width, height, lang });
    } finally {
      setUploading(false);
    }
  }

  function handleCropDone(blob: Blob, width: number, height: number) {
    setCropFile(null);
    directUpload(blob, uploadLang, width, height);
  }

  return (
    <div className="border border-rule rounded-[2px] overflow-hidden group">
      {/* Thumbnail — fixed 4:3 for consistent grid */}
      <div className="aspect-[4/3] bg-warm/30 relative overflow-hidden">
        {img.url ? (
          <button
            onClick={() => setShowPreview(true)}
            className="w-full h-full cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt || img.key} className="w-full h-full object-cover" />
          </button>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/20 text-[12px]">Geen preview</div>
        )}
        {/* Replace overlay */}
        <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <ReplaceButton onReplace={(f) => handleReplace(f)} uploading={uploading} />
          </div>
        </div>
        {/* Aspect ratio badge */}
        {spec && (
          <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-[2px] text-[9px] font-medium ${
            dimMatch === "match" ? "bg-green-100 text-green-700" :
            dimMatch === "close" ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-700"
          }`}>
            {spec.aspectRatio}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] text-ink/40 truncate mb-1">{img.key}</p>

        {/* Spec info */}
        {spec && (
          <div className="mb-1.5">
            <p className="text-[10px] text-ink/30">
              {spec.displayWidth}x{spec.displayHeight} · {spec.context}
            </p>
            {img.width && img.height && (
              <p className={`text-[10px] ${dimMatch === "match" ? "text-green-600" : dimMatch === "close" ? "text-amber-600" : "text-red-500"}`}>
                Huidig: {img.width}x{img.height}
              </p>
            )}
          </div>
        )}

        {/* Lang indicator for book images */}
        {isBook && (
          <div className="flex gap-1 mb-1.5">
            {(["nl", "en", "de"] as const).map((lang) => (
              <LangUploadButton
                key={lang}
                lang={lang}
                isActive={img.lang === lang}
                isUniversal={!img.lang}
                onUpload={(f) => handleReplace(f, lang)}
              />
            ))}
          </div>
        )}

        {/* Alt text */}
        {editingAlt === img.key ? (
          <div className="flex gap-1">
            <input
              value={altValue}
              onChange={(e) => setAltValue(e.target.value)}
              className="flex-1 bg-transparent border border-rule px-2 py-1 text-[12px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
              placeholder="Alt tekst..."
              autoFocus
            />
            <button
              onClick={async () => {
                await updateAlt({ key: img.key, alt: altValue });
                setEditingAlt(null);
              }}
              className="text-[11px] text-copper cursor-pointer"
            >
              OK
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-ink/60 truncate flex-1">
              {img.alt || <span className="text-ink/25 italic">Geen alt</span>}
            </p>
            <button
              onClick={() => { setEditingAlt(img.key); setAltValue(img.alt || ""); }}
              className="text-[11px] text-copper cursor-pointer shrink-0 ml-2"
            >
              Wijzig
            </button>
          </div>
        )}

        {/* Lang badge */}
        {img.lang && (
          <span className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 bg-copper/10 text-copper rounded-[2px] uppercase">
            {img.lang}
          </span>
        )}

        {/* Delete */}
        <button
          onClick={async () => {
            if (confirm(`"${img.key}" verwijderen?`)) await deleteImage({ key: img.key });
          }}
          className="text-[10px] text-red-400 hover:text-red-600 cursor-pointer mt-1 block"
        >
          Verwijder
        </button>
      </div>

      {/* Preview modal — shows image at actual display aspect ratio */}
      {showPreview && img.url && (
        <ImagePreviewModal
          url={img.url}
          alt={img.alt || img.key}
          imageKey={img.key}
          spec={spec}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Crop modal */}
      {cropFile && spec && (
        <ImageCropper
          file={cropFile}
          aspectRatio={spec.displayWidth / spec.displayHeight}
          targetWidth={spec.displayWidth}
          targetHeight={spec.displayHeight}
          onCrop={handleCropDone}
          onCancel={() => setCropFile(null)}
        />
      )}
    </div>
  );
}

/** Full-screen modal showing the image at its actual display aspect ratio */
function ImagePreviewModal({ url, alt, imageKey, spec, onClose }: {
  url: string;
  alt: string;
  imageKey: string;
  spec?: SpecDoc;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70"
      onClick={onClose}
    >
      <div
        className="bg-paper border border-rule rounded-[2px] max-w-[900px] w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-rule">
          <div>
            <p className="text-[13px] font-medium text-ink">{imageKey}</p>
            {spec && (
              <p className="text-[11px] text-ink/40 mt-0.5">
                {spec.displayWidth}x{spec.displayHeight} · {spec.aspectRatio} · {spec.context}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[20px] text-ink/40 hover:text-ink cursor-pointer leading-none px-2"
          >
            &times;
          </button>
        </div>

        {/* Image at actual ratio */}
        <div className="p-5 flex justify-center bg-warm/20">
          {spec ? (
            <div
              className="relative w-full overflow-hidden bg-warm/30 border border-rule rounded-[2px]"
              style={{
                maxWidth: `${Math.min(spec.displayWidth, 800)}px`,
                aspectRatio: `${spec.displayWidth} / ${spec.displayHeight}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={alt} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="max-h-[70vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={alt} className="max-h-[70vh] max-w-full object-contain" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplaceButton({ onReplace, uploading }: {
  onReplace: (file: File) => void;
  uploading: boolean;
}) {
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onReplace(file);
  }

  return (
    <label className={`text-[12px] text-paper font-medium cursor-pointer px-4 py-2 bg-copper rounded-[2px] hover:bg-copper-light transition-colors ${uploading ? "opacity-50" : ""}`}>
      {uploading ? "Uploaden..." : "Vervangen"}
      <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
    </label>
  );
}

function LangUploadButton({ lang, isActive, isUniversal, onUpload }: {
  lang: Lang;
  isActive: boolean;
  isUniversal: boolean;
  onUpload: (file: File) => void;
}) {
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }

  return (
    <label
      className={`text-[10px] font-medium px-2 py-0.5 rounded-[2px] cursor-pointer transition-colors ${
        isActive
          ? "bg-copper text-paper"
          : isUniversal
            ? "bg-ink/5 text-ink/40 hover:bg-ink/10"
            : "bg-ink/5 text-ink/20 hover:bg-ink/10"
      }`}
    >
      {lang.toUpperCase()}
      {isActive && <span className="ml-0.5">*</span>}
      <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </label>
  );
}

function getDimStatus(img: ImageDoc, spec?: SpecDoc): "match" | "close" | "mismatch" {
  if (!spec || !img.width || !img.height) return "mismatch";
  const widthDiff = Math.abs(img.width - spec.displayWidth) / spec.displayWidth;
  const heightDiff = Math.abs(img.height - spec.displayHeight) / spec.displayHeight;
  if (widthDiff < 0.05 && heightDiff < 0.05) return "match";
  if (widthDiff < 0.2 && heightDiff < 0.2) return "close";
  return "mismatch";
}
