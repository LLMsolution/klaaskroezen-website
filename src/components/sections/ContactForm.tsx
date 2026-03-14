"use client";

import { useState } from "react";
import { FadeIn } from "@/components/ui/FadeIn";

const subjects = [
  "Sales Excellence Training",
  "Customer Success Training",
  "Spreker / keynote boeken",
  "1-op-1 coaching",
  "Team coaching",
  "Overig",
] as const;

interface FormData {
  naam: string;
  email: string;
  telefoon: string;
  onderwerp: string;
  bericht: string;
}

export function ContactForm() {
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

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    // Build mailto fallback — replace with API endpoint when ready
    const subject = encodeURIComponent(
      `Website contact: ${form.onderwerp || "Algemeen"}`
    );
    const body = encodeURIComponent(
      `Naam: ${form.naam}\nE-mail: ${form.email}\nTelefoon: ${form.telefoon || "–"}\nOnderwerp: ${form.onderwerp || "–"}\n\n${form.bericht}`
    );
    window.location.href = `mailto:info@klaaskroezen.com?subject=${subject}&body=${body}`;
    setStatus("sent");
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
              Naam *
            </label>
            <input
              id="naam"
              type="text"
              required
              placeholder="Je volledige naam"
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
              E-mail *
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="naam@bedrijf.nl"
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
              Telefoon
            </label>
            <input
              id="telefoon"
              type="tel"
              placeholder="+31 6 ..."
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
              Onderwerp
            </label>
            <select
              id="onderwerp"
              value={form.onderwerp}
              onChange={(e) => update("onderwerp", e.target.value)}
              className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%230E0C0A%22%20fill-opacity%3D%220.3%22%20d%3D%22M3%204.5L6%207.5L9%204.5%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_16px_center] bg-no-repeat pr-10`}
            >
              <option value="">Kies een onderwerp</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
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
            Bericht *
          </label>
          <textarea
            id="bericht"
            required
            rows={6}
            placeholder="Vertel kort wat we voor je kunnen betekenen..."
            value={form.bericht}
            onChange={(e) => update("bericht", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-5">
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center gap-2.5 bg-copper text-paper px-7 py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors disabled:opacity-50 rounded-[2px] cursor-pointer"
          >
            {status === "sending" ? "Versturen..." : "Verstuur bericht"}
            <span aria-hidden="true">→</span>
          </button>

          {status === "sent" && (
            <span className="text-[13px] text-copper font-medium">
              Je mailprogramma is geopend.
            </span>
          )}
          {status === "error" && (
            <span className="text-[13px] text-red-600 font-medium">
              Er ging iets mis. Probeer het opnieuw.
            </span>
          )}
        </div>

        <p className="text-[12px] text-ink/35 leading-[1.6]">
          We reageren altijd binnen één werkdag. Je gegevens worden niet
          gedeeld met derden.
        </p>
      </form>
    </FadeIn>
  );
}
