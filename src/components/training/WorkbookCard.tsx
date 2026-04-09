"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

type Copy = {
  eyebrow: string;
  defaultTitle: string;
  defaultButton: string;
};

const COPY: Record<Lang, Copy> = {
  nl: {
    eyebrow: "Werkboek",
    defaultTitle: "Werkboek bij deze training",
    defaultButton: "Download werkboek",
  },
  en: {
    eyebrow: "Workbook",
    defaultTitle: "Workbook for this training",
    defaultButton: "Download workbook",
  },
  de: {
    eyebrow: "Arbeitsbuch",
    defaultTitle: "Arbeitsbuch zu diesem Training",
    defaultButton: "Arbeitsbuch herunterladen",
  },
};

export function WorkbookCard({
  trainingId,
  lang,
}: {
  trainingId: Id<"trainings">;
  lang: Lang;
}) {
  const workbook = useQuery(api.trainings.getWorkbookUrl, { trainingId, lang });
  const copy = COPY[lang];

  if (workbook === undefined) {
    // Loading: render a subtle skeleton to avoid layout shift.
    return (
      <div className="my-6 border border-rule rounded-[2px] p-6 h-[140px] animate-pulse bg-warm/40" />
    );
  }

  if (!workbook?.url) return null;

  const title = workbook.title?.trim() || copy.defaultTitle;
  const description = workbook.description?.trim() || "";
  const buttonLabel = workbook.buttonLabel?.trim() || copy.defaultButton;

  return (
    <div className="my-6 border border-rule rounded-[2px] overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail or placeholder */}
        <div className="relative w-full sm:w-[200px] shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[180px] bg-copper/10 border-b sm:border-b-0 sm:border-r border-rule">
          {workbook.imageUrl ? (
            <Image
              src={workbook.imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, 200px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="text-copper/60"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
          )}
        </div>

        {/* Text + CTA */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col gap-3 justify-between">
          <div>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">
              {copy.eyebrow}
            </p>
            <h3 className="font-display text-[20px] sm:text-[22px] font-bold leading-[1.2] tracking-[-0.01em] text-ink mb-2">
              {title}
            </h3>
            {description && (
              <p className="text-[13px] text-ink/60 leading-[1.6]">{description}</p>
            )}
          </div>
          <div>
            <a
              href={workbook.url}
              download={workbook.fileName}
              className="inline-block bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
            >
              {buttonLabel}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
