"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

type Lang = "nl" | "en" | "de";
type Format = "epub" | "pdf";

const EBOOK_FORMATS: Format[] = ["epub", "pdf"];

const LANGS: { value: Lang; label: string }[] = [
  { value: "nl", label: "Nederlands" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
];

const FORMAT_LABEL: Record<Format, string> = {
  epub: "EPUB",
  pdf: "PDF",
};

const FORMAT_ACCEPT: Record<Format, string> = {
  epub: ".epub,application/epub+zip",
  pdf: ".pdf,application/pdf",
};

type DigitalFileRow = {
  _id: Id<"digitalFiles">;
  product: string;
  lang: Lang;
  format?: Format;
  fileName: string;
  fileType: string;
  url: string | null;
};

export function DigitalFilesTab() {
  const files = useQuery(api.digitalFiles.listAll);
  const allProducts = useQuery(api.checkoutProducts.listAll);
  const generateUploadUrl = useMutation(api.digitalFiles.generateUploadUrl);
  const saveFile = useMutation(api.digitalFiles.saveFile);
  const deleteFile = useMutation(api.digitalFiles.deleteFile);

  const fileMap = useMemo(() => {
    const map = new Map<string, DigitalFileRow>();
    (files ?? []).forEach((f) => {
      const key = `${f.product}::${f.lang}::${f.format ?? "unknown"}`;
      map.set(key, f as DigitalFileRow);
    });
    return map;
  }, [files]);

  const ebookProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts
      .filter((p) => p.productVariant === "ebook" && p.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((p) => ({
        slug: p.slug,
        label: p.name?.nl ?? p.shortName?.nl ?? p.slug,
        formats: EBOOK_FORMATS,
        availableLangs: (p.availableBookLanguages ?? ["nl", "en", "de"]) as Lang[],
      }));
  }, [allProducts]);

  if (files === undefined || allProducts === undefined) {
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
          E-book per taal en formaat
        </h2>
        <p className="text-[14px] text-ink/60 mt-2 max-w-[640px]">
          Upload per taal beide formaten (EPUB voor e-readers, PDF voor desktop/print).
          Kopers krijgen automatisch beide bestanden in hun gekozen taal.
          Vervangen verwijdert het oude bestand uit storage.
        </p>
        <p className="text-[12px] text-ink/40 mt-3 max-w-[640px]">
          Het luisterboek is geen download maar een eigen omgeving — beheer dat onder
          <strong className="text-ink/60"> Producten → Luisterboeken</strong>.
        </p>
      </header>

      {ebookProducts.length === 0 && (
        <p className="text-[13px] text-ink/40">
          Geen e-book producten gevonden. Maak in Producten → Betaalpagina&apos;s een product met variant &quot;E-book&quot; aan.
        </p>
      )}

      {ebookProducts.map((product) => (
        <section key={product.slug} className="border border-rule rounded-[2px] p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50">
                {product.slug}
              </p>
              <h3 className="font-display text-[20px] font-bold mt-1">{product.label}</h3>
            </div>
          </div>

          <div className="space-y-6">
            {LANGS.filter((lang) => product.availableLangs.includes(lang.value)).map((lang) => (
              <div key={lang.value}>
                <p className="text-[12px] font-medium text-ink/70 mb-2">{lang.label}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.formats.map((format) => (
                    <FileSlot
                      key={format}
                      product={product.slug}
                      lang={lang.value}
                      format={format}
                      formatLabel={FORMAT_LABEL[format]}
                      accept={FORMAT_ACCEPT[format]}
                      file={fileMap.get(`${product.slug}::${lang.value}::${format}`)}
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
                          format,
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
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function FileSlot({
  formatLabel,
  accept,
  file,
  onUpload,
  onDelete,
}: {
  product: string;
  lang: Lang;
  format: Format;
  formatLabel: string;
  accept: string;
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
        {formatLabel}
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
          {uploading ? "Uploaden..." : `Upload ${formatLabel}`}
        </button>
      )}

      {error && <p className="text-[11px] text-red-500 mt-2">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
