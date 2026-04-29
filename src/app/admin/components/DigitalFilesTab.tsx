"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

type Lang = "nl" | "en" | "de";

const PRODUCTS: { slug: string; label: string }[] = [
  { slug: "boek-ebook", label: "E-book — Sales, Oprecht en Ontspannen" },
  { slug: "boek-luisterboek", label: "Luisterboek — Sales, Oprecht en Ontspannen" },
];

const LANGS: { value: Lang; label: string }[] = [
  { value: "nl", label: "Nederlands" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
];

type DigitalFileRow = {
  _id: Id<"digitalFiles">;
  product: string;
  lang: Lang;
  fileName: string;
  fileType: string;
  url: string | null;
};

export function DigitalFilesTab() {
  const files = useQuery(api.digitalFiles.listAll);
  const generateUploadUrl = useMutation(api.digitalFiles.generateUploadUrl);
  const saveFile = useMutation(api.digitalFiles.saveFile);
  const deleteFile = useMutation(api.digitalFiles.deleteFile);

  const fileMap = useMemo(() => {
    const map = new Map<string, DigitalFileRow>();
    (files ?? []).forEach((f) => map.set(`${f.product}::${f.lang}`, f as DigitalFileRow));
    return map;
  }, [files]);

  if (files === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-copper/30 border-t-copper rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
          Digitale bestanden
        </p>
        <h2 className="font-display text-[28px] font-black leading-tight mt-2">
          E-book & luisterboek per taal
        </h2>
        <p className="text-[14px] text-ink/60 mt-2 max-w-[640px]">
          Upload per product en taal het juiste bestand. Kopers krijgen automatisch het bestand in
          hun gekozen taal in hun dashboard. Vervangen verwijdert het oude bestand uit storage.
        </p>
      </header>

      {PRODUCTS.map((product) => (
        <section key={product.slug} className="border border-rule rounded-[2px] p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50">
                {product.slug}
              </p>
              <h3 className="font-display text-[20px] font-bold mt-1">{product.label}</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LANGS.map((lang) => (
              <FileSlot
                key={lang.value}
                product={product.slug}
                lang={lang.value}
                langLabel={lang.label}
                file={fileMap.get(`${product.slug}::${lang.value}`)}
                onUpload={async (uploadFile) => {
                  const url = await generateUploadUrl();
                  const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": uploadFile.type || "application/octet-stream" },
                    body: uploadFile,
                  });
                  if (!res.ok) throw new Error("Upload mislukt");
                  const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
                  await saveFile({
                    product: product.slug,
                    lang: lang.value,
                    storageId,
                    fileName: uploadFile.name,
                    fileType: uploadFile.type || "application/octet-stream",
                  });
                }}
                onDelete={async (id) => {
                  await deleteFile({ id });
                }}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function FileSlot({
  product,
  lang,
  langLabel,
  file,
  onUpload,
  onDelete,
}: {
  product: string;
  lang: Lang;
  langLabel: string;
  file: DigitalFileRow | undefined;
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: Id<"digitalFiles">) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    setUploading(true);
    try {
      await onUpload(f);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="border border-rule rounded-[2px] p-4 bg-warm/20">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">
        {langLabel}
      </p>

      {file ? (
        <div className="space-y-2">
          <p className="text-[13px] text-ink truncate" title={file.fileName}>{file.fileName}</p>
          <p className="text-[11px] text-ink/40">{file.fileType}</p>
          <div className="flex flex-wrap gap-3 pt-2 text-[12px]">
            {file.url && (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-copper hover:text-copper-light underline"
              >
                Open
              </a>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-copper hover:text-copper-light cursor-pointer"
              disabled={uploading}
            >
              Vervangen
            </button>
            <button
              type="button"
              onClick={() => onDelete(file._id)}
              className="text-red-500 hover:text-red-700 cursor-pointer"
              disabled={uploading}
            >
              Verwijderen
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-rule hover:border-copper/40 rounded-[2px] py-6 text-center text-[12px] text-ink/40 cursor-pointer disabled:opacity-50"
        >
          {uploading ? "Uploaden..." : "Upload bestand"}
        </button>
      )}

      {error && <p className="text-[11px] text-red-500 mt-2">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".epub,.pdf,.mp3,.m4b,.zip,application/epub+zip,application/pdf,audio/*"
        onChange={handleFileChange}
        className="hidden"
        data-product={product}
        data-lang={lang}
      />
    </div>
  );
}
