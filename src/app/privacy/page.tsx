import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Privacybeleid",
  description: "Privacybeleid van Klaas Kroezen. Hoe wij omgaan met je persoonsgegevens.",
};

export default function PrivacyPage() {
  return (
    <section className="py-16 sm:py-[110px] border-b border-rule">
      <Container>
        <FadeIn>
          <Label className="mb-3">Juridisch</Label>
          <h1 className="font-display text-[clamp(32px,4.2vw,54px)] font-black leading-[0.97] tracking-[-0.03em] mb-10">
            Privacybeleid
          </h1>

          <div className="prose-kk max-w-[720px] space-y-8">
            <p className="text-[15px] text-ink/70 leading-[1.8]">
              Laatst bijgewerkt: maart 2026
            </p>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                1. Wie zijn wij
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Klaas Kroezen, gevestigd aan Oude Parklaan 111, 1901 ZL Castricum, is
                verantwoordelijk voor de verwerking van persoonsgegevens zoals
                weergegeven in dit privacybeleid.
              </p>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                <strong className="text-ink">Contactgegevens:</strong>
                <br />
                E-mail: klaas@klaaskroezen.com
                <br />
                Telefoon: +31 6 1809 8906
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                2. Persoonsgegevens die wij verwerken
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Wij verwerken je persoonsgegevens doordat je gebruik maakt van onze
                diensten en/of omdat je deze zelf aan ons verstrekt. Hieronder vind je
                een overzicht:
              </p>
              <ul className="space-y-2 text-[15px] text-ink/70 leading-[1.8] list-none">
                {[
                  "Voor- en achternaam",
                  "E-mailadres",
                  "Telefoonnummer",
                  "Bedrijfsnaam en functie",
                  "Betalingsgegevens (via Mollie)",
                  "IP-adres en browsergegevens",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-copper text-[11px] mt-[3px] shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                3. Doel van gegevensverwerking
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Wij verwerken jouw persoonsgegevens voor de volgende doelen:
              </p>
              <ul className="space-y-2 text-[15px] text-ink/70 leading-[1.8] list-none">
                {[
                  "Het afhandelen van je betaling",
                  "Je te kunnen bellen of e-mailen indien dit nodig is",
                  "Het leveren van trainingen, coaching en digitale producten",
                  "Het verzenden van transactionele e-mails (bevestigingen, facturen)",
                  "Analyse van websitebezoek ter verbetering van onze dienstverlening",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-copper text-[11px] mt-[3px] shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                4. Bewaartermijn
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Wij bewaren je persoonsgegevens niet langer dan strikt nodig is om de
                doelen te realiseren waarvoor je gegevens worden verzameld. Wij
                hanteren een bewaartermijn van maximaal 7 jaar voor financiële
                gegevens (wettelijke verplichting) en 2 jaar voor overige gegevens na
                laatste contact.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                5. Delen met derden
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Wij delen jouw persoonsgegevens alleen met derden als dit noodzakelijk
                is voor de uitvoering van onze overeenkomst of om te voldoen aan een
                wettelijke verplichting. Met bedrijven die je gegevens verwerken in
                onze opdracht sluiten wij een verwerkersovereenkomst.
              </p>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Wij maken gebruik van de volgende diensten:
              </p>
              <ul className="space-y-2 text-[15px] text-ink/70 leading-[1.8] list-none">
                {[
                  "Mollie — betalingsverwerking",
                  "Vercel — hosting",
                  "Resend — transactionele e-mail",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-copper text-[11px] mt-[3px] shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                6. Cookies
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Deze website maakt gebruik van alleen technisch noodzakelijke cookies.
                Wij plaatsen geen tracking- of marketingcookies. Voor
                spambescherming gebruiken wij Cloudflare Turnstile, dat geen cookies
                plaatst.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                7. Jouw rechten
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Je hebt het recht om je persoonsgegevens in te zien, te corrigeren of
                te verwijderen. Daarnaast heb je het recht om je eventuele toestemming
                voor de gegevensverwerking in te trekken of bezwaar te maken. Stuur
                je verzoek naar klaas@klaaskroezen.com. We reageren zo snel mogelijk,
                maar uiterlijk binnen vier weken.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">
                8. Klacht indienen
              </h2>
              <p className="text-[15px] text-ink/70 leading-[1.8]">
                Als je het idee hebt dat wij je gegevens niet goed beschermen, neem
                dan contact met ons op. Je hebt daarnaast altijd het recht een klacht
                in te dienen bij de Autoriteit Persoonsgegevens.
              </p>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
