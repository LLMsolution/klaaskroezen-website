"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";
import { t, type Lang } from "@/lib/i18n";
import Link from "next/link";

const STORAGE_KEY = "kk-register-profile";

export function RegisterForm({ lang }: { lang: Lang }) {
  const s = t(lang).register;
  const loginS = t(lang).login;
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const completeRegistration = useMutation(api.users.completeRegistration);
  const verifyTurnstile = useAction(api.turnstile.verify);

  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("email") ?? "";
    }
    return "";
  });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // After magic link click: user is authenticated → complete registration
  useEffect(() => {
    if (!isAuthenticated) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const profile = JSON.parse(stored);
    localStorage.removeItem(STORAGE_KEY);

    completeRegistration({
      firstName: profile.firstName,
      lastName: profile.lastName || undefined,
      phone: profile.phone || undefined,
      company: profile.company || undefined,
      website: profile.website || undefined,
      linkedin: profile.linkedin || undefined,
      lang,
    }).then(() => {
      window.location.href = "/dashboard";
    }).catch(() => {
      window.location.href = "/dashboard";
    });
  }, [isAuthenticated, completeRegistration, lang]);

  const inputClass =
    "w-full bg-transparent border border-rule px-4 py-3 text-[15px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none focus-visible:outline-none focus:ring-0 transition-colors rounded-[2px]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !firstName) return;
    if (!turnstileToken) {
      setError(loginS.errorMagicLink);
      return;
    }
    setError("");
    setLoading(true);

    // Store profile data before magic link redirect
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      firstName, lastName, phone, company, website, linkedin,
    }));

    try {
      const verifyRes = await verifyTurnstile({ token: turnstileToken });
      if (!verifyRes.ok) {
        setError(loginS.errorMagicLink);
        setTurnstileToken(null);
        return;
      }
      await signIn("resend", { email, lang });
      setMagicLinkSent(true);
    } catch {
      setError(loginS.errorMagicLink);
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
        <h2 className="font-display text-[20px] font-bold">{loginS.checkInbox}</h2>
        <p className="text-[14px] text-ink/60 leading-[1.7]">
          {loginS.magicLinkSent1} <strong>{email}</strong>{loginS.magicLinkSent2}
        </p>
        <button onClick={() => setMagicLinkSent(false)} className="text-[13px] text-copper hover:text-copper-light cursor-pointer">
          {loginS.backToLogin}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="text-[12px] font-medium text-ink/50 mb-1.5 block">{loginS.emailLabel} *</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={loginS.emailPlaceholder} className={inputClass} />
      </div>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-medium text-ink/50 mb-1.5 block">{s.firstNameLabel}</label>
          <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
            placeholder={s.firstNamePlaceholder} className={inputClass} />
        </div>
        <div>
          <label className="text-[12px] font-medium text-ink/50 mb-1.5 block">{s.lastNameLabel}</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
            placeholder={s.lastNamePlaceholder} className={inputClass} />
        </div>
      </div>

      {/* Phone + Company row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-medium text-ink/50 mb-1.5 block">{s.phoneLabel}</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder={s.phonePlaceholder} className={inputClass} />
        </div>
        <div>
          <label className="text-[12px] font-medium text-ink/50 mb-1.5 block">{s.companyLabel}</label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
            placeholder={s.companyPlaceholder} className={inputClass} />
        </div>
      </div>

      {/* Website + LinkedIn row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-medium text-ink/50 mb-1.5 block">{s.websiteLabel}</label>
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
            placeholder={s.websitePlaceholder} className={inputClass} />
        </div>
        <div>
          <label className="text-[12px] font-medium text-ink/50 mb-1.5 block">{s.linkedinLabel}</label>
          <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
            placeholder={s.linkedinPlaceholder} className={inputClass} />
        </div>
      </div>

      {/* Turnstile bot-check */}
      <TurnstileWidget
        onVerify={setTurnstileToken}
        onExpire={() => setTurnstileToken(null)}
        onError={() => setTurnstileToken(null)}
      />

      {/* Error */}
      {error && <p className="text-[13px] text-red-500">{error}</p>}

      {/* Submit */}
      <button type="submit" disabled={loading || !email || !firstName || !turnstileToken}
        className="w-full bg-copper text-paper py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-50">
        {loading ? s.sending : s.submitCta}
      </button>

      {/* Link to login */}
      <p className="text-center text-[13px] text-ink/50">
        {s.hasAccount}
        <Link href="/login" className="text-copper hover:text-copper-light">{s.loginLink}</Link>
      </p>
    </form>
  );
}
