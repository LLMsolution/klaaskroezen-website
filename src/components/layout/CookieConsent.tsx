"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CONSENT_CHANGE_EVENT, readConsent, writeConsent } from "@/lib/cookie-consent";
import { t, type Lang } from "@/lib/i18n";

export function CookieConsent({ lang }: { lang: Lang }) {
  const [decided, setDecided] = useState<boolean | null>(null);
  const fallback = t(lang).cookieConsent;

  const dbContent = useQuery(api.siteContent.getPageContent, {
    slug: "site-shared",
    lang,
  });
  const banner = (dbContent?.["cookie-banner"] ?? {}) as {
    title?: string;
    description?: string;
    privacyLink?: string;
    accept?: string;
    deny?: string;
  };
  const copy = {
    title: banner.title?.trim() || fallback.title,
    description: banner.description?.trim() || fallback.description,
    privacyLink: banner.privacyLink?.trim() || fallback.privacyLink,
    accept: banner.accept?.trim() || fallback.accept,
    deny: banner.deny?.trim() || fallback.deny,
  };

  useEffect(() => {
    setDecided(readConsent() !== null);
    const onChange = () => setDecided(readConsent() !== null);
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  if (decided === null || decided === true) return null;

  return (
    <div
      role="dialog"
      aria-label={copy.title}
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-rule bg-paper"
    >
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-7 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-14">
        <div className="flex-1">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
            {copy.title}
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink">
            {copy.description}{" "}
            <Link
              href="/privacy"
              className="text-copper underline underline-offset-2 hover:text-copper-light"
            >
              {copy.privacyLink}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => writeConsent("denied")}
            className="rounded-[2px] border border-ink/30 px-5 py-2 text-[13px] font-medium text-ink transition hover:border-ink hover:bg-warm"
          >
            {copy.deny}
          </button>
          <button
            type="button"
            onClick={() => writeConsent("accepted")}
            className="rounded-[2px] bg-ink px-5 py-2 text-[13px] font-medium text-paper transition hover:bg-copper"
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
