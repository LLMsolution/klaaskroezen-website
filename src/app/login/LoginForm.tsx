"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { t, type Lang } from "@/lib/i18n";

interface Props {
  lang: Lang;
}

export function LoginForm({ lang }: Props) {
  const s = t(lang).login;
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const inputClass =
    "w-full bg-transparent border border-rule px-4 py-3 text-[15px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none focus-visible:outline-none focus:ring-0 transition-colors rounded-[2px]";

  const btnPrimary =
    "w-full bg-copper text-paper py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-50";

  const btnOAuth =
    "flex items-center justify-center gap-3 w-full border border-rule py-3.5 text-[13px] font-medium tracking-[0.06em] text-ink/80 hover:border-ink/30 hover:text-ink transition-colors rounded-[2px] cursor-pointer";

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      await signIn("google");
    } catch {
      setError(s.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn("resend", { email, lang });
      setMagicLinkSent(true);
    } catch {
      setError(s.errorMagicLink);
    } finally {
      setLoading(false);
    }
  }

  if (magicLinkSent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-copper/10 flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-copper">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="font-display text-[22px] font-bold">
          {s.checkInbox}
        </h2>
        <p className="text-[15px] text-ink/60 leading-[1.7]">
          {s.magicLinkSent1} <strong>{email}</strong>{s.magicLinkSent2}
        </p>
        <button
          type="button"
          onClick={() => { setMagicLinkSent(false); setEmail(""); setError(""); }}
          className="text-[13px] text-copper hover:text-copper-light transition-colors cursor-pointer"
        >
          {s.backToLogin}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Google login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className={btnOAuth}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {s.googleCta}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-rule" />
        <span className="text-[11px] text-ink/30 tracking-[0.15em] uppercase">{s.divider}</span>
        <div className="flex-1 h-px bg-rule" />
      </div>

      {/* Magic link form */}
      <form onSubmit={handleMagicLink} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">
            {s.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder={s.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoFocus
          />
        </div>
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? s.magicLinkSending : s.magicLinkCta}
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="text-[13px] text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
