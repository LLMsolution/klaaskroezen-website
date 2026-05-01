"use client";

import { useState } from "react";
import { CONSENT_STORAGE_KEY, CONSENT_CHANGE_EVENT } from "@/lib/cookie-consent";

export function CookieResetButton() {
  const [done, setDone] = useState(false);

  function handleClick() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT));
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 border border-rule px-4 py-2 text-[13px] text-ink/70 hover:text-ink hover:border-ink/30 rounded-[2px] cursor-pointer transition-colors"
      >
        Cookie-keuze opnieuw maken
      </button>
      {done && (
        <span className="text-[12px] text-copper" role="status">
          Voorkeur gewist — de banner verschijnt opnieuw onderaan.
        </span>
      )}
    </div>
  );
}
