"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FadeIn } from "@/components/ui/FadeIn";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";
import { t, type Lang } from "@/lib/i18n";

interface FormData {
  naam: string;
  email: string;
  telefoon: string;
  onderwerp: string;
  bericht: string;
}

interface Props {
  lang: Lang;
}

export function ContactForm({ lang }: Props) {
  const s = t(lang).contactForm;
  const submitContact = useAction(api.contactForm.submit);

  const [form, setForm] = useState<FormData>({
    naam: "",
    email: "",
    telefoon: "",
    onderwerp: "",
    bericht: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!turnstileToken) {
      setStatus("error");
      return;
    }
    setStatus("sending");

    try {
      await submitContact({
        name: form.naam,
        email: form.email,
        phone: form.telefoon || undefined,
        subject: form.onderwerp || s.fallbackSubject,
        message: form.bericht,
        turnstileToken,
      });
      setStatus("sent");
      setForm({ naam: "", email: "", telefoon: "", onderwerp: "", bericht: "" });
      setTurnstileToken(null);
    } catch {
      setStatus("error");
      setTurnstileToken(null);
    }
  }

  const inputClass =
    "w-full bg-transparent border border-rule px-4 py-3 text-[15px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none transition-colors rounded-[2px]";

  return (
    <FadeIn>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Naam + Email row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="naam"
              className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2"
            >
              {s.nameLabel}
            </label>
            <input
              id="naam"
              type="text"
              required
              placeholder={s.namePlaceholder}
              value={form.naam}
              onChange={(e) => update("naam", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2"
            >
              {s.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder={s.emailPlaceholder}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Telefoon + Onderwerp row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="telefoon"
              className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2"
            >
              {s.phoneLabel}
            </label>
            <input
              id="telefoon"
              type="tel"
              placeholder={s.phonePlaceholder}
              value={form.telefoon}
              onChange={(e) => update("telefoon", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="onderwerp"
              className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2"
            >
              {s.subjectLabel}
            </label>
            <select
              id="onderwerp"
              value={form.onderwerp}
              onChange={(e) => update("onderwerp", e.target.value)}
              className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%230E0C0A%22%20fill-opacity%3D%220.3%22%20d%3D%22M3%204.5L6%207.5L9%204.5%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_16px_center] bg-no-repeat pr-10`}
            >
              <option value="">{s.subjectPlaceholder}</option>
              {s.subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bericht */}
        <div>
          <label
            htmlFor="bericht"
            className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2"
          >
            {s.messageLabel}
          </label>
          <textarea
            id="bericht"
            required
            rows={6}
            placeholder={s.messagePlaceholder}
            value={form.bericht}
            onChange={(e) => update("bericht", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Turnstile bot-check */}
        <TurnstileWidget
          onVerify={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />

        {/* Submit */}
        <div className="flex items-center gap-5">
          <button
            type="submit"
            disabled={status === "sending" || !turnstileToken}
            className="inline-flex items-center gap-2.5 bg-copper text-paper px-7 py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors disabled:opacity-50 rounded-[2px] cursor-pointer"
          >
            {status === "sending" ? s.sending : s.submit}
            <span aria-hidden="true">→</span>
          </button>

          {status === "sent" && (
            <span className="text-[13px] text-copper font-medium">
              {s.success}
            </span>
          )}
          {status === "error" && (
            <span className="text-[13px] text-red-600 font-medium">
              {s.error}
            </span>
          )}
        </div>

        <p className="text-[12px] text-ink/35 leading-[1.6]">
          {s.privacy}
        </p>
      </form>
    </FadeIn>
  );
}
