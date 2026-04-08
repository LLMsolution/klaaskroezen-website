import { t, type Lang } from "@/lib/i18n";

type StatItem = { value?: string; label?: string };

type StatsBandProps = {
  lang: Lang;
  content?: { items?: StatItem[] };
};

export function StatsBand({ lang, content }: StatsBandProps) {
  const s = t(lang).stats;

  const stats = content?.items && content.items.length > 0
    ? content.items.map((it) => ({ number: it.value || "", suffix: "", label: it.label || "" }))
    : [
        { number: "25", suffix: "+", label: s.experience },
        { number: "21", suffix: "", label: s.countries },
        { number: "9,1", suffix: "", label: s.rating },
        { number: "10", suffix: "%", label: s.guarantee },
      ];

  return (
    <section
      aria-label={s.ariaLabel}
      className="bg-ink border-b border-paper/[0.06] py-12 sm:py-[52px] px-7 sm:px-14 flex items-center justify-center"
    >
      <div className="max-w-[1180px] w-full flex flex-wrap items-center justify-center gap-y-8">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center">
            <div className="text-center px-6 sm:px-8 lg:px-10">
              <div className="font-display text-[32px] sm:text-[36px] lg:text-[42px] font-black tracking-[-0.04em] leading-none text-paper mb-1.5 tabular-nums">
                {stat.number}
                {stat.suffix && (
                  <span className="text-copper">{stat.suffix}</span>
                )}
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-paper/60">
                {stat.label}
              </div>
            </div>
            {i < stats.length - 1 && (
              <div
                className="hidden sm:block w-px h-11 bg-paper/[0.08] shrink-0"
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
