import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Algemene Voorwaarden",
  description: "Algemene voorwaarden van Klaas Kroezen trainingen en diensten.",
};

export default function AlgemeneVoorwaardenPage() {
  return (
    <section className="py-16 sm:py-[110px] border-b border-rule">
      <Container>
        <FadeIn>
          <Label className="mb-3">Juridisch</Label>
          <h1 className="font-display text-[clamp(32px,4.2vw,54px)] font-black leading-[0.97] tracking-[-0.03em] mb-10">
            Algemene Voorwaarden
          </h1>

          <div className="prose-kk max-w-[720px] space-y-8">
            <p className="text-[15px] text-ink/70 leading-[1.8]">
              Laatst bijgewerkt: maart 2026
            </p>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                1. Definities
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                <strong className="text-ink">Klaas Kroezen:</strong> eenmanszaak gevestigd te Castricum,
                ingeschreven bij de Kamer van Koophandel, hierna te noemen
                &ldquo;dienstverlener&rdquo;.
              </p>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                <strong className="text-ink">Opdrachtgever:</strong> de natuurlijke of rechtspersoon die een
                overeenkomst aangaat met de dienstverlener.
              </p>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                <strong className="text-ink">Diensten:</strong> trainingen, coaching, keynotes, workshops,
                digitale producten en overige door de dienstverlener aangeboden
                diensten.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                2. Toepasselijkheid
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Deze voorwaarden zijn van toepassing op elk aanbod van de
                dienstverlener en op elke tot stand gekomen overeenkomst. Door een
                bestelling te plaatsen of een dienst af te nemen, ga je akkoord met
                deze voorwaarden.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                3. Aanbod en overeenkomst
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Alle aanbiedingen zijn vrijblijvend, tenzij uitdrukkelijk anders
                vermeld. Een overeenkomst komt tot stand op het moment dat de
                opdrachtgever het aanbod heeft aanvaard en aan de eventuele
                betalingsverplichting heeft voldaan.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                4. Prijzen en betaling
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Alle genoemde prijzen zijn in euro&apos;s en exclusief btw, tenzij
                anders vermeld. Betaling geschiedt via de op de website aangeboden
                betaalmethoden (iDEAL, creditcard, bankoverschrijving). Bij
                niet-tijdige betaling is de opdrachtgever van rechtswege in verzuim.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                5. Herroepingsrecht — digitale producten
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Bij de aankoop van digitale producten (e-books, online trainingen)
                doe je afstand van je herroepingsrecht zodra je toegang hebt gekregen
                tot de digitale inhoud. Bij fysieke producten geldt een
                herroepingstermijn van 14 dagen na ontvangst.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                6. Annulering — trainingen en coaching
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Annulering van incompany trainingen, coaching en keynotes is
                kosteloos tot 14 dagen voor de geplande datum. Bij annulering tussen
                14 en 7 dagen voor de datum wordt 50% van het overeengekomen bedrag
                in rekening gebracht. Bij annulering binnen 7 dagen wordt het
                volledige bedrag in rekening gebracht.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                7. Resultaatgarantie
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Wij bieden een 10% resultaatgarantie op onze online trainingen. Als
                je na het volledig doorlopen van de training niet minimaal 10%
                verbetering ervaart in je resultaten, ontvang je je geld terug. Deze
                garantie geldt uitsluitend wanneer alle modules volledig zijn
                afgerond.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                8. Intellectueel eigendom
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Alle intellectuele eigendomsrechten op de door de dienstverlener
                verstrekte materialen, trainingen, werkboeken en digitale content
                berusten bij de dienstverlener. Niets uit deze materialen mag worden
                verveelvoudigd, opgeslagen of openbaar gemaakt zonder voorafgaande
                schriftelijke toestemming.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                9. Aansprakelijkheid
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                De dienstverlener is uitsluitend aansprakelijk voor directe schade
                die is ontstaan door opzet of grove nalatigheid. De aansprakelijkheid
                is in alle gevallen beperkt tot het bedrag dat voor de betreffende
                dienst in rekening is gebracht.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                10. Toepasselijk recht
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Op alle overeenkomsten is uitsluitend Nederlands recht van
                toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in
                het arrondissement Noord-Holland.
              </p>
            </div>

            <div className="pt-6 border-t border-rule">
              <p className="text-[14px] text-ink/50 leading-[1.8]">
                Vragen over deze voorwaarden? Neem contact op via{" "}
                <a
                  href="mailto:klaas@klaaskroezen.com"
                  className="text-copper hover:text-copper-light transition-colors"
                >
                  klaas@klaaskroezen.com
                </a>
              </p>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
