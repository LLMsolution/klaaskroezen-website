"use client";

const H2 = "font-display text-[22px] font-bold tracking-[-0.02em] mt-10 first:mt-0";
const P = "text-[15px] text-ink/70 leading-[1.8]";
const FIELD = "text-[15px] text-ink/70 leading-[1.8] border-b border-rule pb-2 min-h-[2em]";

export function LegalFallback() {
  return (
          <div className="prose-kk max-w-[760px] space-y-2">
            <p className={`${P} print:hidden`}>
              Wil je gebruikmaken van je herroepingsrecht? Vul dit formulier in
              en mail het naar{" "}
              <a
                href="mailto:info@klaaskroezen.com?subject=Herroeping%20bestelling"
                className="text-copper hover:text-copper-light underline"
              >
                info@klaaskroezen.com
              </a>{" "}
              of stuur het per post naar het adres onderaan. Je herroepingsrecht
              vervalt voor digitale producten zodra de levering is begonnen met
              jouw uitdrukkelijke voorafgaande toestemming (zie{" "}
              <a href="/algemene-voorwaarden#art-6" className="text-copper hover:text-copper-light underline">
                artikel 6 van onze Algemene Voorwaarden
              </a>
              ).
            </p>

            <div className="flex gap-3 my-6 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase rounded-[2px] hover:bg-copper-light transition-colors cursor-pointer"
              >
                Afdrukken / Opslaan als PDF
              </button>
              <a
                href="mailto:info@klaaskroezen.com?subject=Herroeping%20bestelling&body=Aan%20Klaas%20Kroezen%2C%0A%0AIk%2Fwij%20deel%2Fdelen%20u%20hierbij%20mede%20dat%20ik%2Fwij%20onze%20overeenkomst%20betreffende%20de%20verkoop%20van%20de%20volgende%20goederen%20herroep%2Fherroepen%3A%0A%0A-%20Product%3A%20%5Bvul%20in%5D%0A-%20Besteld%20op%3A%20%5Bdatum%5D%0A-%20Ontvangen%20op%3A%20%5Bdatum%5D%0A-%20Naam%3A%20%5Bvolledige%20naam%5D%0A-%20Adres%3A%20%5Bvolledig%20adres%5D%0A-%20Bestelnummer%2Ffactuurnummer%3A%20%5Bindien%20bekend%5D%0A%0ADatum%3A%20%5Bvandaag%5D%0AHandtekening%3A%20%5Balleen%20bij%20papieren%20versie%5D"
                className="border border-rule text-ink/60 px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase rounded-[2px] hover:border-ink hover:text-ink transition-colors"
              >
                Direct mailen
              </a>
            </div>

            <h2 className={H2}>Aan</h2>
            <p className={P}>
              Klaas Kroezen
              <br />
              Oude Parklaan 111
              <br />
              1901 ZL Castricum
              <br />
              <a href="mailto:info@klaaskroezen.com" className="text-copper hover:text-copper-light underline">
                info@klaaskroezen.com
              </a>
            </p>

            <h2 className={H2}>Verklaring</h2>
            <p className={P}>
              Ik/wij <span className="italic text-ink/40">(*)</span> deel/delen{" "}
              <span className="italic text-ink/40">(*)</span> u hierbij mede dat
              ik/wij <span className="italic text-ink/40">(*)</span> onze
              overeenkomst betreffende de verkoop van de volgende goederen
              herroep/herroepen <span className="italic text-ink/40">(*)</span>:
            </p>

            <div className="space-y-6 mt-6">
              <div>
                <p className="text-[12px] font-medium tracking-[0.1em] uppercase text-ink/45 mb-2">
                  Product / dienst
                </p>
                <div className={FIELD}>&nbsp;</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[12px] font-medium tracking-[0.1em] uppercase text-ink/45 mb-2">
                    Besteld op
                  </p>
                  <div className={FIELD}>&nbsp;</div>
                </div>
                <div>
                  <p className="text-[12px] font-medium tracking-[0.1em] uppercase text-ink/45 mb-2">
                    Ontvangen op
                  </p>
                  <div className={FIELD}>&nbsp;</div>
                </div>
              </div>

              <div>
                <p className="text-[12px] font-medium tracking-[0.1em] uppercase text-ink/45 mb-2">
                  Bestelnummer / factuurnummer
                </p>
                <div className={FIELD}>&nbsp;</div>
              </div>

              <div>
                <p className="text-[12px] font-medium tracking-[0.1em] uppercase text-ink/45 mb-2">
                  Naam consument(en)
                </p>
                <div className={FIELD}>&nbsp;</div>
              </div>

              <div>
                <p className="text-[12px] font-medium tracking-[0.1em] uppercase text-ink/45 mb-2">
                  Adres consument(en)
                </p>
                <div className={FIELD}>&nbsp;</div>
                <div className={`${FIELD} mt-3`}>&nbsp;</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[12px] font-medium tracking-[0.1em] uppercase text-ink/45 mb-2">
                    Handtekening
                    <span className="text-ink/30 normal-case tracking-normal ml-1">
                      (alleen bij papieren versie)
                    </span>
                  </p>
                  <div className={FIELD}>&nbsp;</div>
                </div>
                <div>
                  <p className="text-[12px] font-medium tracking-[0.1em] uppercase text-ink/45 mb-2">
                    Datum
                  </p>
                  <div className={FIELD}>&nbsp;</div>
                </div>
              </div>
            </div>

            <p className={`${P} text-ink/45 mt-10`}>
              <span className="italic">(*)</span> Doorhalen wat niet van
              toepassing is.
            </p>

            <p className={`${P} mt-6 print:hidden`}>
              Wij bevestigen de ontvangst van je herroeping per e-mail. Het
              betaalde bedrag wordt binnen 14 dagen na ontvangst van het product
              (of, bij digitale producten waarvoor het herroepingsrecht nog niet
              is vervallen, binnen 14 dagen na herroeping) terugbetaald via
              dezelfde betaalmethode.
            </p>
          </div>
  );
}
