"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-7 sm:px-14 py-20">
      <div className="text-center max-w-md">
        <p className="font-body text-[10.5px] font-medium tracking-[0.22em] uppercase text-copper mb-4">
          Er ging iets mis
        </p>
        <h1 className="font-display text-[clamp(32px,5vw,48px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
          Onverwachte fout
        </h1>
        <p className="text-[15px] font-light text-ink/50 leading-[1.85] mb-8">
          Er is een fout opgetreden bij het laden van deze pagina. Probeer het
          opnieuw of ga terug naar de homepage.
        </p>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <button
            type="button"
            onClick={reset}
            className="group inline-flex items-center justify-center gap-[7px] font-body text-[11.5px] font-medium tracking-[0.09em] uppercase rounded-[2px] border transition-all duration-200 whitespace-nowrap px-[22px] py-[13px] bg-copper text-paper border-copper hover:bg-copper-light hover:border-copper-light outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    </section>
  );
}
