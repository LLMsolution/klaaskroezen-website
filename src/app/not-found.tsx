import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-7 sm:px-14 py-20">
      <div className="text-center max-w-md">
        <p className="font-body text-[10.5px] font-medium tracking-[0.22em] uppercase text-copper mb-4">
          Pagina niet gevonden
        </p>
        <h1 className="font-display text-[clamp(48px,8vw,96px)] font-black leading-[0.9] tracking-[-0.04em] mb-4">
          404
        </h1>
        <p className="text-[15px] font-light text-ink/50 leading-[1.85] mb-8">
          Deze pagina bestaat niet of is verplaatst. Ga terug naar de homepage of
          bekijk ons aanbod.
        </p>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-[7px] font-body text-[11.5px] font-medium tracking-[0.09em] uppercase rounded-[2px] border transition-all duration-200 whitespace-nowrap px-[22px] py-[13px] bg-copper text-paper border-copper hover:bg-copper-light hover:border-copper-light outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2"
          >
            Naar homepage
          </Link>
          <Link
            href="/sales-excellence-training"
            className="group inline-flex items-center justify-center gap-[7px] font-body text-[11.5px] font-medium tracking-[0.09em] uppercase rounded-[2px] border transition-all duration-200 whitespace-nowrap px-[22px] py-[13px] bg-transparent text-ink border-rule hover:border-ink/35 outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            Bekijk trainingen
          </Link>
        </div>
      </div>
    </section>
  );
}
