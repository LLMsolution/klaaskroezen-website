"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading, EmptyState } from "./shared";
import { AdminImageUpload } from "./AdminImageUpload";

export function ImagesTab() {
  const categories = useQuery(api.siteImages.listCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const images = useQuery(api.siteImages.listAll, { category: selectedCategory ?? undefined });
  const saveImage = useMutation(api.siteImages.saveImage);
  const updateAlt = useMutation(api.siteImages.updateAlt);
  const deleteImage = useMutation(api.siteImages.deleteImage);
  const generateUploadUrl = useMutation(api.siteImages.generateUploadUrl);

  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [altValue, setAltValue] = useState("");

  if (categories === undefined || images === undefined) return <Loading />;

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
            <div key={img._id} className="border border-rule rounded-[2px] overflow-hidden group">
              {/* Preview */}
              <div className="aspect-[4/3] bg-warm/30 relative overflow-hidden">
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.alt || img.key} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink/20 text-[12px]">Geen preview</div>
                )}
                {/* Replace overlay */}
                <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ReplaceButton
                    imageKey={img.key}
                    category={img.category}
                    onReplace={async (storageId, fileName) => {
                      await saveImage({ key: img.key, storageId, fileName, category: img.category, alt: img.alt });
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-[11px] text-ink/40 truncate mb-1">{img.key}</p>

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

                {/* Delete */}
                <button
                  onClick={async () => {
                    if (confirm(`"${img.key}" verwijderen?`)) await deleteImage({ key: img.key });
                  }}
                  className="text-[10px] text-red-400 hover:text-red-600 cursor-pointer mt-1"
                >
                  Verwijder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReplaceButton({ imageKey, category, onReplace }: {
  imageKey: string;
  category: string;
  onReplace: (storageId: Id<"_storage">, fileName: string) => Promise<void>;
}) {
  const generateUploadUrl = useMutation(api.siteImages.generateUploadUrl);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await res.json();
      await onReplace(storageId, file.name);
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className={`text-[12px] text-paper font-medium cursor-pointer px-4 py-2 bg-copper rounded-[2px] hover:bg-copper-light transition-colors ${uploading ? "opacity-50" : ""}`}>
      {uploading ? "Uploaden..." : "Vervangen"}
      <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
    </label>
  );
}
