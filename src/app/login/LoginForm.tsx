"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { t, type Lang } from "@/lib/i18n";

type Mode = "login" | "signup" | "magic-link" | "forgot";

interface Props {
  lang: Lang;
}

export function LoginForm({ lang }: Props) {
  const s = t(lang).login;
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const inputClass =
    "w-full bg-transparent border border-rule px-4 py-3 text-[15px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none transition-colors rounded-[2px]";

  const btnPrimary =
    "w-full bg-copper text-paper py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-50";

  const btnOAuth =
    "flex items-center justify-center gap-3 w-full border border-rule py-3.5 text-[13px] font-medium tracking-[0.06em] text-ink/80 hover:border-ink/30 hover:text-ink transition-colors rounded-[2px] cursor-pointer";

  async function handleOAuth(provider: "google" | "apple") {
    setError("");
    setLoading(true);
    try {
      await signIn(provider);
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
      await signIn("resend", { email });
      setMagicLinkSent(true);
    } catch {
      setError(s.errorMagicLink);
    } finally {
      setLoading(false);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signIn("password", { email, password, name, flow: "signUp" });
      } else if (mode === "forgot") {
        await signIn("password", { email, flow: "reset" });
        setMagicLinkSent(true);
      } else {
        await signIn("password", { email, password, flow: "signIn" });
      }
    } catch {
      setError(
        mode === "signup"
          ? s.errorSignup
          : mode === "forgot"
            ? s.errorForgot
            : s.errorLogin,
      );
    } finally {
      setLoading(false);
    }
  }

  if (magicLinkSent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-copper/10 flex items-center justify-center mx-auto">
          <span className="text-copper text-[24px]">✓</span>
        </div>
        <h2 className="font-display text-[22px] font-bold">
          {s.checkInbox}
        </h2>
        <p className="text-[15px] text-ink/60 leading-[1.7]">
          {s.magicLinkSent1} <strong>{email}</strong>{s.magicLinkSent2}
        </p>
        <button
          type="button"
          onClick={() => { setMagicLinkSent(false); setMode("login"); }}
          className="text-[13px] text-copper hover:text-copper-light transition-colors cursor-pointer"
        >
          {s.backToLogin}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* OAuth buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
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

        <button
          type="button"
          onClick={() => handleOAuth("apple")}
          disabled={loading}
          className={btnOAuth}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          {s.appleCta}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-rule" />
        <span className="text-[11px] text-ink/30 tracking-[0.15em] uppercase">{s.divider}</span>
        <div className="flex-1 h-px bg-rule" />
      </div>

      {/* Magic link / Password forms */}
      {mode === "magic-link" ? (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label htmlFor="ml-email" className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">
              {s.emailLabel}
            </label>
            <input
              id="ml-email"
              type="email"
              required
              placeholder={s.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? s.magicLinkSending : s.magicLinkCta}
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className="w-full text-[13px] text-ink/50 hover:text-ink transition-colors cursor-pointer"
          >
            {s.passwordLogin}
          </button>
        </form>
      ) : (
        <form onSubmit={handlePassword} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">
                {s.nameLabel}
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder={s.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
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
            />
          </div>
          {mode !== "forgot" && (
            <div>
              <label htmlFor="password" className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">
                {s.passwordLabel}
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                minLength={8}
              />
            </div>
          )}
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading
              ? s.loading
              : mode === "signup"
                ? s.signupCta
                : mode === "forgot"
                  ? s.forgotCta
                  : s.loginCta}
          </button>
        </form>
      )}

      {/* Error message */}
      {error && (
        <p className="text-[13px] text-red-600 text-center">{error}</p>
      )}

      {/* Mode switches */}
      <div className="space-y-2 text-center">
        {mode === "login" && (
          <>
            <button
              type="button"
              onClick={() => setMode("magic-link")}
              className="block w-full text-[13px] text-ink/50 hover:text-ink transition-colors cursor-pointer"
            >
              {s.magicLinkLogin}
            </button>
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="block w-full text-[13px] text-ink/50 hover:text-ink transition-colors cursor-pointer"
            >
              {s.forgotPassword}
            </button>
            <div className="pt-2 border-t border-rule mt-4">
              <span className="text-[13px] text-ink/40">{s.noAccount}</span>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-[13px] text-copper hover:text-copper-light transition-colors cursor-pointer"
              >
                {s.createAccount}
              </button>
            </div>
          </>
        )}
        {mode === "signup" && (
          <div className="pt-2 border-t border-rule">
            <span className="text-[13px] text-ink/40">{s.hasAccount}</span>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-[13px] text-copper hover:text-copper-light transition-colors cursor-pointer"
            >
              {s.loginLink}
            </button>
          </div>
        )}
        {(mode === "forgot" || mode === "magic-link") && (
          <button
            type="button"
            onClick={() => setMode("login")}
            className="text-[13px] text-ink/50 hover:text-ink transition-colors cursor-pointer"
          >
            {s.backToLogin}
          </button>
        )}
      </div>
    </div>
  );
}
