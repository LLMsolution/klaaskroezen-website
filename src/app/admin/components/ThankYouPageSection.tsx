"use client";

type ThankYouStep = { nl: string; en: string; de?: string };
export type ThankYouConfig = {
  steps: ThankYouStep[];
  ctaLabel: { nl: string; en: string; de?: string };
  ctaHref: string;
};

const I = "w-full bg-transparent border border-rule px-3 py-2 text-[14px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none transition-colors rounded-[2px]";

export function ThankYouPageSection({
  config,
  onChange,
}: {
  config: ThankYouConfig;
  onChange: (c: ThankYouConfig) => void;
}) {
  function updateStep(i: number, lang: "nl" | "en" | "de", value: string) {
    const steps = config.steps.map((s, idx) => idx === i ? { ...s, [lang]: value } : s);
    onChange({ ...config, steps });
  }

  function addStep() {
    onChange({ ...config, steps: [...config.steps, { nl: "", en: "", de: "" }] });
  }

  function removeStep(i: number) {
    onChange({ ...config, steps: config.steps.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] text-ink/50 mb-3">Stappen die de koper te zien krijgt na aankoop (zonder iconen).</p>
        <div className="space-y-3">
          {config.steps.map((step, i) => (
            <div key={i} className="border border-rule rounded-[2px] p-3 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-ink/50">Stap {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="text-[11px] text-red-400 hover:text-red-600 cursor-pointer"
                >
                  Verwijderen
                </button>
              </div>
              <div>
                <label className="text-[10px] text-ink/40 block mb-1">NL</label>
                <input value={step.nl} onChange={(e) => updateStep(i, "nl", e.target.value)} className={I} placeholder="Tekst in het Nederlands" />
              </div>
              <div>
                <label className="text-[10px] text-ink/40 block mb-1">EN</label>
                <input value={step.en} onChange={(e) => updateStep(i, "en", e.target.value)} className={I} placeholder="Text in English" />
              </div>
              <div>
                <label className="text-[10px] text-ink/40 block mb-1">DE</label>
                <input value={step.de} onChange={(e) => updateStep(i, "de", e.target.value)} className={I} placeholder="Text auf Deutsch" />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addStep} className="text-[11px] text-copper cursor-pointer mt-2">+ Stap toevoegen</button>
      </div>

      <div className="border-t border-rule pt-4 space-y-3">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">Knop (CTA)</p>
        <div>
          <label className="text-[10px] text-ink/40 block mb-1">URL</label>
          <input
            value={config.ctaHref}
            onChange={(e) => onChange({ ...config, ctaHref: e.target.value })}
            className={I}
            placeholder="/dashboard"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-ink/40 block mb-1">Label NL</label>
            <input value={config.ctaLabel.nl} onChange={(e) => onChange({ ...config, ctaLabel: { ...config.ctaLabel, nl: e.target.value } })} className={I} />
          </div>
          <div>
            <label className="text-[10px] text-ink/40 block mb-1">Label EN</label>
            <input value={config.ctaLabel.en} onChange={(e) => onChange({ ...config, ctaLabel: { ...config.ctaLabel, en: e.target.value } })} className={I} />
          </div>
          <div>
            <label className="text-[10px] text-ink/40 block mb-1">Label DE</label>
            <input value={config.ctaLabel.de} onChange={(e) => onChange({ ...config, ctaLabel: { ...config.ctaLabel, de: e.target.value } })} className={I} />
          </div>
        </div>
      </div>
    </div>
  );
}
