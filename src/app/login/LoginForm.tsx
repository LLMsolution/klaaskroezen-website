"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";
import { t, type Lang } from "@/lib/i18n";

interface Props {
  lang: Lang;
}

export function LoginForm({ lang }: Props) {
  const s = t(lang).login;
  const { signIn } = useAuthActions();
  const verifyTurnstile = useAction(api.turnstile.verify);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const inputClass =
    "w-full bg-transparent border border-rule px-4 py-3 text-[15px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none focus-visible:outline-none focus:ring-0 transition-colors rounded-[2px]";

  const btnPrimary =
    "w-full bg-copper text-paper py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-50";

  // Google login UI temporarily disabled — see commit "google login uit".
  // Re-enable by restoring the button + divider in the JSX below and the
  // handleGoogleLogin handler.

  const emailExists = useQuery(
    api.users.checkEmailExists,
    email.includes("@") ? { email } : "skip",
  );

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Check if account exists — redirect to registration if not
    if (emailExists === false) {
      window.location.href = `/registreren?email=${encodeURIComponent(email)}`;
      return;
    }

    if (!turnstileToken) {
      setError(s.errorMagicLink);
      return;
    }

    setLoading(true);
    try {
      const verifyRes = await verifyTurnstile({ token: turnstileToken });
      if (!verifyRes.ok) {
        setError(s.errorMagicLink);
        setTurnstileToken(null);
        return;
      }
      await signIn("resend", { email, lang });
      setMagicLinkSent(true);
    } catch {
      setError(s.errorMagicLink);
      setTurnstileToken(null);
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
      {/* Google login tijdelijk uitgeschakeld */}

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
        <TurnstileWidget
          onVerify={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />
        <button
          type="submit"
          disabled={loading || !turnstileToken}
          className={btnPrimary}
        >
          {loading ? s.magicLinkSending : s.magicLinkCta}
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="text-[13px] text-red-600 text-center">{error}</p>
      )}

      {/* Link to registration */}
      <p className="text-center text-[13px] text-ink/50">
        {s.noAccount}
        <a href="/registreren" className="text-copper hover:text-copper-light">{s.createAccount}</a>
      </p>
    </div>
  );
}
