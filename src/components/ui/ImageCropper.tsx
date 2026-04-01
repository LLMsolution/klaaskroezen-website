"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const QUALITY = 0.85;

type ImageCropperProps = {
  /** Lock aspect ratio (width/height). Undefined = free crop. */
  aspectRatio?: number;
  /** Recommended width in px (shown as hint) */
  targetWidth?: number;
  /** Recommended height in px (shown as hint) */
  targetHeight?: number;
  /** Called with cropped blob + final dimensions */
  onCrop: (blob: Blob, width: number, height: number) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Pre-selected file (from parent) */
  file: File;
};

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

async function cropToBlob(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  targetWidth?: number,
  targetHeight?: number,
): Promise<{ blob: Blob; width: number; height: number }> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Source crop in natural pixels
  const sx = pixelCrop.x * scaleX;
  const sy = pixelCrop.y * scaleY;
  const sw = pixelCrop.width * scaleX;
  const sh = pixelCrop.height * scaleY;

  // Output dimensions: use target if provided and smaller than source, otherwise use source
  let outW = sw;
  let outH = sh;
  if (targetWidth && targetHeight) {
    outW = targetWidth;
    outH = targetHeight;
  } else if (targetWidth) {
    outW = targetWidth;
    outH = Math.round(sh * (targetWidth / sw));
  }

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outW, outH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve({ blob, width: outW, height: outH });
        else reject(new Error("Canvas is empty"));
      },
      "image/webp",
      QUALITY,
    );
  });
}

export function ImageCropper({
  aspectRatio,
  targetWidth,
  targetHeight,
  onCrop,
  onCancel,
  file,
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [src] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [processing, setProcessing] = useState(false);
  const [tooSmall, setTooSmall] = useState(false);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height, naturalWidth, naturalHeight } = e.currentTarget;

      // Check if source is smaller than target
      if (targetWidth && targetHeight) {
        setTooSmall(naturalWidth < targetWidth || naturalHeight < targetHeight);
      }

      if (aspectRatio) {
        setCrop(centerAspectCrop(width, height, aspectRatio));
      } else {
        // Default: select 90% centered
        setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
      }
    },
    [aspectRatio, targetWidth, targetHeight],
  );

  async function handleConfirm() {
    if (!imgRef.current || !completedCrop) return;
    setProcessing(true);
    try {
      const { blob, width, height } = await cropToBlob(
        imgRef.current,
        completedCrop,
        targetWidth,
        targetHeight,
      );
      onCrop(blob, width, height);
    } catch {
      // Retry without target dimensions
      try {
        const { blob, width, height } = await cropToBlob(
          imgRef.current,
          completedCrop,
        );
        onCrop(blob, width, height);
      } catch {
        // Give up
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60">
      <div className="bg-paper border border-rule rounded-[2px] max-w-[800px] w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
          <div>
            <p className="text-[13px] font-medium text-ink">Afbeelding bijsnijden</p>
            {targetWidth && targetHeight && (
              <p className="text-[11px] text-ink/40 mt-0.5">
                Aanbevolen: {targetWidth}x{targetHeight}px
                {aspectRatio && ` · ${formatRatio(aspectRatio)}`}
              </p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="text-[12px] text-ink/40 hover:text-ink cursor-pointer"
          >
            Annuleren
          </button>
        </div>

        {/* Crop area */}
        <div className="p-5">
          {tooSmall && (
            <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-[2px]">
              <p className="text-[11px] text-amber-700">
                Bronafbeelding is kleiner dan de aanbevolen dimensies. Kwaliteit kan lager zijn.
              </p>
            </div>
          )}

          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              aspect={aspectRatio}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={src}
                onLoad={onImageLoad}
                alt="Bijsnijden"
                style={{ maxHeight: "60vh", maxWidth: "100%" }}
              />
            </ReactCrop>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-rule">
          <button
            onClick={onCancel}
            className="text-[12px] text-ink/40 hover:text-ink cursor-pointer px-4 py-2"
          >
            Annuleren
          </button>
          <button
            onClick={handleConfirm}
            disabled={!completedCrop || processing}
            className="bg-copper text-paper px-5 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
          >
            {processing ? "Verwerken..." : "Bijsnijden & uploaden"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatRatio(ratio: number): string {
  // Common ratios
  const known: [number, string][] = [
    [16 / 9, "16:9"],
    [16 / 10, "16:10"],
    [4 / 3, "4:3"],
    [3 / 4, "3:4"],
    [2 / 3, "2:3"],
    [3 / 2, "3:2"],
    [1, "1:1"],
    [2 / 1, "2:1"],
  ];
  for (const [val, label] of known) {
    if (Math.abs(ratio - val) < 0.01) return label;
  }
  return `${ratio.toFixed(2)}`;
}
