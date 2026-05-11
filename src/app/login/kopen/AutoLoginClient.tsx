"use client";

import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";

interface Props {
  email: string;
  next: string;
}

export function AutoLoginClient({ email, next }: Props) {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  // If already logged in, go directly to the destination
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(next);
    }
  }, [isAuthenticated, next, router]);

  if (isAuthenticated) return null;

  async function handleSend() {
    if (sending || sent) return;
    setSending(true);
    try {
      await signIn("resend", { email, redirectTo: next });
      setSent(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <p className="text-[15px] text-ink/70">Er ging iets mis. Ga naar de loginpagina om handmatig in te loggen.</p>
        <a href="/login" className="text-copper hover:text-copper-light text-[14px]">
          Naar inlogpagina
        </a>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-copper/10 flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-copper">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="font-display text-[clamp(22px,2.8vw,30px)] font-black leading-[0.97] tracking-[-0.03em]">
          Inloglink verstuurd
        </h1>
        <p className="text-[15px] text-ink/60 leading-[1.7]">
          We hebben een inloglink gestuurd naar <strong className="text-ink">{email}</strong>.
          Klik op de link in je mail om direct toegang te krijgen.
        </p>
        <p className="text-[13px] text-ink/40">
          Niets ontvangen?{" "}
          <button
            type="button"
            onClick={() => { setSent(false); setError(false); }}
            className="text-copper hover:text-copper-light cursor-pointer"
          >
            Stuur opnieuw
          </button>
        </p>
      </div>
    );
  }

  // Default: show prompt to send magic link (don't auto-send to avoid invalidating
  // the link already sent by PostPurchaseFlow on the bedankt page)
  return (
    <div className="text-center space-y-6">
      <div className="w-14 h-14 rounded-full bg-copper/10 flex items-center justify-center mx-auto">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-copper">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M2 7l10 7 10-7" />
        </svg>
      </div>
      <h1 className="font-display text-[clamp(22px,2.8vw,30px)] font-black leading-[0.97] tracking-[-0.03em]">
        Inloggen bij je dashboard
      </h1>
      <p className="text-[15px] text-ink/60 leading-[1.7]">
        Heb je al een inloglink ontvangen? Klik dan op die link in je mail.
        Nog geen link ontvangen? Stuur hem opnieuw naar{" "}
        <strong className="text-ink">{email}</strong>.
      </p>
      <button
        type="button"
        onClick={handleSend}
        disabled={sending}
        className="w-full bg-copper hover:bg-copper-light text-paper text-[14px] font-medium py-3 px-6 rounded-[2px] transition-colors disabled:opacity-60"
      >
        {sending ? "Versturen..." : "Stuur inloglink"}
      </button>
      <p className="text-[13px] text-ink/40">
        Of{" "}
        <a href="/login" className="text-copper hover:text-copper-light">
          log in via de loginpagina
        </a>
        .
      </p>
    </div>
  );
}
