"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { ImageCropper } from "@/components/ui/ImageCropper";

const MAX_SIZE = 1920;
const QUALITY = 0.85;

interface Props {
  /** Current image URL (from Convex storage or static) */
  currentUrl?: string;
  /** Called with storageId after successful upload (width/height from crop) */
  onUploaded: (storageId: Id<"_storage">, width?: number, height?: number) => void;
  /** Called when image is removed */
  onRemoved?: () => void;
  /** Alt text for preview */
  alt?: string;
  /** Compact mode for small slots like avatars */
  compact?: boolean;
  /** Image key for looking up specs (optional — enables crop tool) */
  imageKey?: string;
}

/**
 * Resize image to max 1920px (HD) and convert to WebP at 85% quality.
 * Returns a Blob ready for upload.
 */
async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;

      // Only resize if larger than MAX_SIZE
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        },
        "image/webp",
        QUALITY,
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export function AdminImageUpload({
  currentUrl,
  onUploaded,
  onRemoved,
  alt = "Afbeelding",
  compact = false,
  imageKey,
}: Props) {
  const generateUploadUrl = useMutation(api.trainings.generateUploadUrl);
  const spec = useQuery(
    api.imageSpecs.getSpecForKey,
    imageKey ? { imageKey } : "skip",
  );
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadBlob = useCallback(async (blob: Blob, width?: number, height?: number) => {
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const result = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "image/webp" },
        body: blob,
      });
      const { storageId } = await result.json();
      onUploaded(storageId, width, height);
      setPreview(URL.createObjectURL(blob));
    } catch {
      // silently fail — user can retry
    } finally {
      setUploading(false);
    }
  }, [generateUploadUrl, onUploaded]);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    // If we have a spec with aspect ratio, show crop tool
    if (spec && spec.displayWidth && spec.displayHeight) {
      setCropFile(file);
      return;
    }

    // No spec — direct resize + upload (legacy flow)
    setUploading(true);
    try {
      const resized = await resizeImage(file);
      await uploadBlob(resized);
    } catch {
      // silently fail
    } finally {
      setUploading(false);
    }
  }, [spec, uploadBlob]);

  function handleCropComplete(blob: Blob, width: number, height: number) {
    setCropFile(null);
    uploadBlob(blob, width, height);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  const displayUrl = preview || currentUrl;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {displayUrl ? (
          <div
            className="w-12 h-12 rounded-full bg-warm overflow-hidden cursor-pointer relative group"
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displayUrl} alt={alt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <UploadIcon />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            disabled={uploading}
            className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
              dragOver ? "border-copper bg-copper/5" : "border-rule hover:border-copper/40"
            } ${uploading ? "opacity-50" : ""}`}
          >
            {uploading ? <Spinner /> : <UploadIcon />}
          </button>
        )}
        <div className="flex flex-col gap-1">
          {displayUrl && onRemoved && (
            <button type="button" onClick={onRemoved} className="text-[11px] text-red-400 hover:text-red-600 cursor-pointer text-left">
              Verwijderen
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
    );
  }

  // Calculate preview container style based on spec (or default landscape)
  const previewAspect = spec && spec.displayWidth && spec.displayHeight
    ? `${spec.displayWidth} / ${spec.displayHeight}`
    : "4 / 3";

  return (
    <div>
      {displayUrl ? (
        <div className="relative group">
          <div
            className="border border-rule rounded-[2px] overflow-hidden bg-warm/30 max-w-[320px]"
            style={{ aspectRatio: previewAspect }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt={alt}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-[11px] text-copper hover:text-copper-light cursor-pointer"
            >
              Vervangen
            </button>
            {onRemoved && (
              <button
                type="button"
                onClick={onRemoved}
                className="text-[11px] text-red-500 hover:text-red-700 cursor-pointer"
              >
                Verwijderen
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          disabled={uploading}
          className={`w-full border-2 border-dashed rounded-[2px] py-8 flex flex-col items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 ${
            dragOver ? "border-copper bg-copper/5" : "border-rule hover:border-copper/40"
          }`}
        >
          {uploading ? <Spinner /> : <UploadIcon />}
          <span className="text-[12px] text-ink/40">
            {uploading ? "Optimaliseren & uploaden..." : "Sleep afbeelding of klik om te uploaden"}
          </span>
          <span className="text-[10px] text-ink/25">
            Wordt automatisch geoptimaliseerd (max 1920px, WebP)
          </span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      {/* Spec badge */}
      {spec && spec.displayWidth && spec.displayHeight && (
        <p className="text-[10px] text-ink/30 mt-1">
          Aanbevolen: {spec.displayWidth}x{spec.displayHeight}px · {spec.aspectRatio}
        </p>
      )}
      {/* Crop modal */}
      {cropFile && spec && (
        <ImageCropper
          file={cropFile}
          aspectRatio={spec.displayWidth / spec.displayHeight}
          targetWidth={spec.displayWidth}
          targetHeight={spec.displayHeight}
          onCrop={handleCropComplete}
          onCancel={() => setCropFile(null)}
        />
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/30">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function Spinner() {
  return <div className="w-5 h-5 border-2 border-copper/30 border-t-copper rounded-full animate-spin" />;
}
