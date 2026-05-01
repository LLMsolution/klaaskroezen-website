import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";
import { CookieResetButton } from "@/components/ui/CookieResetButton";

export const metadata: Metadata = {
  title: "Privacystatement",
  description: "Privacystatement van Klaas Kroezen — hoe wij persoonsgegevens verwerken volgens de AVG.",
};

const H2 = "font-display text-[22px] font-bold tracking-[-0.02em] mt-10 first:mt-0";
const H3 = "font-display text-[16px] font-semibold tracking-[-0.01em] mt-6 mb-2";
const P = "text-[15px] text-ink/70 leading-[1.8]";
const ULIST = "space-y-2 text-[15px] text-ink/70 leading-[1.8] list-none";
const LI = "flex items-start gap-2.5";
const Bullet = () => <span className="text-copper text-[11px] mt-[7px] shrink-0">—</span>;

export default function PrivacyPage() {
  return (
    <section className="py-16 sm:py-[110px] border-b border-rule">
      <Container>
        <FadeIn>
          <Label className="mb-3">Juridisch</Label>
          <h1 className="font-display text-[clamp(32px,4.2vw,54px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
            Privacystatement
          </h1>

          <div className="mb-10 inline-block bg-copper/10 border border-copper/30 rounded-[2px] px-4 py-2">
            <p className="text-[12px] text-copper font-medium tracking-[0.05em] uppercase">
              Concept &mdash; in afwachting van juridische review
            </p>
          </div>

          <div className="prose-kk max-w-[760px] space-y-2">
            <p className={P}>
              Versie: april 2026 (concept). Klaas Kroezen vindt jouw privacy
              belangrijk. Dit statement legt uit welke persoonsgegevens wij
              verwerken, waarom, op welke grondslag, hoe lang en met wie we ze
              delen. Ook lees je hier hoe je je rechten onder de Algemene
              Verordening Gegevens&shy;bescherming (AVG) kunt uitoefenen.
            </p>

            <h2 className={H2} id="verwerker">1. Verantwoordelijke</h2>
            <p className={P}>
              Klaas Kroezen, gevestigd aan Oude Parklaan 111, 1901 ZL Castricum,
              is de verwerkings&shy;verantwoordelijke voor de in dit statement
              beschreven verwerkingen. Klaas Kroezen is ingeschreven bij de Kamer
              van Koophandel te Amsterdam.
            </p>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span>E-mail: info@klaaskroezen.com</span></li>
              <li className={LI}><Bullet /><span>Telefoon: +31 6 1809 8906</span></li>
              <li className={LI}><Bullet /><span>Bezoekadres: Oude Parklaan 111, 1901 ZL Castricum</span></li>
            </ul>

            <h2 className={H2} id="gegevens">2. Welke persoonsgegevens verwerken wij?</h2>
            <p className={P}>
              Afhankelijk van welke dienst of product je afneemt, verwerken wij
              de volgende categorieën persoons&shy;gegevens:
            </p>
            <h3 className={H3}>2.1 Identificatie- en contactgegevens</h3>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span>Voor- en achternaam</span></li>
              <li className={LI}><Bullet /><span>E-mailadres</span></li>
              <li className={LI}><Bullet /><span>Telefoonnummer</span></li>
              <li className={LI}><Bullet /><span>Bedrijfsnaam, functie en website (zakelijke klanten)</span></li>
            </ul>
            <h3 className={H3}>2.2 Bestel- en factuurgegevens</h3>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span>Bezorgadres (alleen bij fysieke producten)</span></li>
              <li className={LI}><Bullet /><span>BTW-nummer (zakelijke klanten)</span></li>
              <li className={LI}><Bullet /><span>Bestel- en factuur&shy;gegevens (productselectie, prijs, betalingsstatus)</span></li>
              <li className={LI}><Bullet /><span>Betaalreferenties van Mollie (geen creditcard&shy;nummers; wij ontvangen alleen een paymentId van Mollie)</span></li>
            </ul>
            <h3 className={H3}>2.3 Account- en gebruiksgegevens</h3>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span>Inloggegevens (e-mailadres en wachtwoord-hash, of Google account-id bij login via Google)</span></li>
              <li className={LI}><Bullet /><span>Voortgang in trainingen en quizzes</span></li>
              <li className={LI}><Bullet /><span>Aankoopgeschiedenis en toegangsrechten</span></li>
            </ul>
            <h3 className={H3}>2.4 Communicatiegegevens</h3>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span>Inhoud van contactformulieren of e-mailcorrespondentie</span></li>
              <li className={LI}><Bullet /><span>E-mail engagement (verstuurd, geopend, geklikt) ten behoeve van leveringskwaliteit</span></li>
              <li className={LI}><Bullet /><span>Tags en interesses (bijv. of de klant zich heeft aangemeld voor de nieuwsbrief)</span></li>
            </ul>
            <h3 className={H3}>2.5 Technische gegevens</h3>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span>IP-adres (versleuteld in logs en alleen tijdelijk bewaard)</span></li>
              <li className={LI}><Bullet /><span>Browser- en apparaatgegevens (uitsluitend bij analytics, en alleen na cookie-toestemming)</span></li>
            </ul>

            <h2 className={H2} id="doelen">3. Doelen en grondslagen</h2>
            <p className={P}>
              Wij verwerken persoons&shy;gegevens uitsluitend voor concrete doelen,
              steeds op basis van een grondslag uit artikel 6 AVG:
            </p>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span><strong className="text-ink">Uitvoering overeenkomst:</strong> het leveren van producten en diensten, het beheren van je account, het verwerken van betalingen en het versturen van transactionele e-mails (orderbevestiging, factuur, verzendupdates).</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Wettelijke verplichting:</strong> het bewaren van factuur&shy;gegevens (7 jaar fiscale bewaarplicht, art. 52 AWR) en het voldoen aan informatieverzoeken van bevoegde autoriteiten.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Gerechtvaardigd belang:</strong> het verbeteren van onze diensten, fraudepreventie, beveiliging van het systeem en het versturen van service-mails (bijv. herstel van een afgebroken bestelling).</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Toestemming:</strong> het versturen van nieuwsbriefmail (alleen na expliciete opt-in), het inzetten van analytics-cookies en het inzetten van marketing-cookies.</span></li>
            </ul>

            <h2 className={H2} id="bewaartermijnen">4. Bewaartermijnen</h2>
            <p className={P}>
              Wij bewaren persoons&shy;gegevens niet langer dan noodzakelijk voor de
              doelen waarvoor ze zijn verzameld:
            </p>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span><strong className="text-ink">Facturen en bestellingen:</strong> 7 jaar (fiscale bewaarplicht).</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Account- en trainingsvoortgang:</strong> tot 24 maanden na de laatste activiteit, of zolang het account actief is.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Marketingdata:</strong> tot het moment van afmelding voor de nieuwsbrief, of bij volledige inactiviteit gedurende 24 maanden.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Contactformulier-berichten:</strong> 24 maanden na de laatste correspondentie.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Logs en technische gegevens:</strong> maximaal 6 maanden, tenzij langer bewaren noodzakelijk is voor beveiligings&shy;onderzoek.</span></li>
            </ul>

            <h2 className={H2} id="ontvangers">5. Met welke partijen delen wij gegevens?</h2>
            <p className={P}>
              Wij verstrekken persoons&shy;gegevens uitsluitend aan derden voor zover
              dit nodig is voor de uitvoering van de overeenkomst, op basis van
              een wettelijke verplichting of met je toestemming. Met onze
              verwerkers hebben wij verwerkers&shy;overeenkomsten gesloten:
            </p>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span><strong className="text-ink">Mollie B.V. (NL)</strong> &mdash; verwerking van betalingen.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Resend, Inc. (EU/US)</strong> &mdash; verzending van transactionele en marketing-e-mails.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Vercel Inc. (EU/US)</strong> &mdash; hosting van de website.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Convex (US)</strong> &mdash; database- en backend-hosting van klantdata.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Google Ireland Ltd.</strong> &mdash; alleen wanneer de klant ervoor kiest in te loggen via Google OAuth (uitsluitend naam en e-mailadres).</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Cloudflare</strong> &mdash; spambescherming via Turnstile (geen cookies, geen profiling).</span></li>
            </ul>
            <p className={P}>
              Doorgifte naar verwerkers buiten de EER (zoals VS) gebeurt op basis
              van de Standaard Contractuele Bepalingen van de Europese Commissie
              en met de juiste aanvullende waarborgen. Voor specifieke
              verwerkings&shy;overeenkomsten kun je contact opnemen via
              info@klaaskroezen.com.
            </p>

            <h2 className={H2} id="cookies">6. Cookies en vergelijkbare technieken</h2>
            <h3 className={H3}>6.1 Functionele cookies</h3>
            <p className={P}>
              Onze website gebruikt functionele cookies die noodzakelijk zijn voor
              de werking, zoals het onthouden van je inlogsessie en het
              vasthouden van je taalvoorkeur. Voor deze cookies is geen
              toestemming vereist.
            </p>
            <h3 className={H3}>6.2 Analytische cookies</h3>
            <p className={P}>
              Voor analytics gebruiken we Vercel Analytics en Vercel Speed
              Insights. Deze laden uitsluitend wanneer je via de cookie-banner
              expliciete toestemming hebt gegeven. Vercel verwerkt geanonimiseerde
              gebruiksgegevens; er worden geen tracking-ID&apos;s of
              third-party-cookies geplaatst.
            </p>
            <h3 className={H3}>6.3 Geen marketingcookies</h3>
            <p className={P}>
              Wij plaatsen geen marketing- of advertentiecookies en delen geen
              gegevens met advertentienetwerken zonder dat je daar uitdrukkelijk
              toestemming voor hebt gegeven.
            </p>
            <h3 className={H3}>6.4 Toestemming intrekken</h3>
            <p className={P}>
              Je kunt je toestemming voor analytische cookies op elk moment
              intrekken. Klik op onderstaande knop om je opgeslagen voorkeur
              te wissen — de cookie-banner verschijnt dan opnieuw, waarna je
              een nieuwe keuze kunt maken.
            </p>
            <CookieResetButton />

            <h2 className={H2} id="rechten">7. Jouw rechten</h2>
            <p className={P}>
              Onder de AVG heb je de volgende rechten met betrekking tot de
              persoons&shy;gegevens die wij over je verwerken:
            </p>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span><strong className="text-ink">Recht op inzage</strong> in de gegevens die wij over je verwerken.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Recht op rectificatie</strong> indien gegevens onjuist of onvolledig zijn.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Recht op verwijdering</strong> (&ldquo;recht om vergeten te worden&rdquo;), voor zover dit niet in strijd is met onze fiscale bewaarplicht.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Recht op beperking</strong> van de verwerking.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Recht op dataportabiliteit:</strong> je gegevens in een gangbaar machine-leesbaar formaat ontvangen.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Recht van bezwaar</strong> tegen verwerking op basis van gerechtvaardigd belang of direct marketing.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Recht om je toestemming in te trekken</strong> voor verwerkingen waarvoor je toestemming hebt gegeven.</span></li>
            </ul>
            <p className={P}>
              Je kunt deze rechten uitoefenen door een verzoek te sturen naar{" "}
              <a href="mailto:info@klaaskroezen.com" className="text-copper hover:text-copper-light transition-colors">
                info@klaaskroezen.com
              </a>. Wij reageren binnen vier weken. Voor verificatie van je
              identiteit kunnen we aanvullende informatie vragen.
            </p>

            <h2 className={H2} id="afmelden">8. Afmelden voor nieuwsbrief</h2>
            <p className={P}>
              Iedere marketing-e-mail bevat onderaan een link waarmee je je in
              één klik kunt afmelden. Na afmelding ontvang je geen marketing-mail
              meer; transactionele e-mails (zoals factuur en verzendbevestiging)
              blijven we wel sturen omdat ze nodig zijn voor de uitvoering van de
              overeenkomst.
            </p>

            <h2 className={H2} id="beveiliging">9. Beveiliging</h2>
            <p className={P}>
              Wij nemen passende technische en organisatorische maatregelen om
              persoons&shy;gegevens te beveiligen tegen verlies, misbruik en
              ongeautoriseerde toegang. Onder meer:
            </p>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span>HTTPS-encryptie op de gehele website</span></li>
              <li className={LI}><Bullet /><span>Rolgebaseerde toegang tot het admin-paneel</span></li>
              <li className={LI}><Bullet /><span>Wachtwoorden opgeslagen als one-way hash (geen plain text)</span></li>
              <li className={LI}><Bullet /><span>Regelmatige software-updates en security-patches</span></li>
            </ul>

            <h2 className={H2} id="datalekken">10. Datalekken</h2>
            <p className={P}>
              Wij hanteren een datalek&shy;procedure conform de Algemene
              Verordening Gegevens&shy;bescherming (AVG art. 33 en 34):
            </p>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span>Bij een geconstateerd datalek beoordelen we direct de aard, omvang en mogelijke gevolgen.</span></li>
              <li className={LI}><Bullet /><span>Indien het datalek waarschijnlijk een risico met zich meebrengt voor de rechten en vrijheden van betrokkenen, melden wij dit zonder onredelijke vertraging — en in elk geval binnen <strong className="text-ink">72 uur</strong> na ontdekking — bij de Autoriteit Persoonsgegevens.</span></li>
              <li className={LI}><Bullet /><span>Wanneer het datalek waarschijnlijk een <strong className="text-ink">hoog risico</strong> oplevert voor betrokkenen, informeren wij hen onverwijld in begrijpelijke taal, inclusief de aard van het lek, getroffen maatregelen en contactgegevens.</span></li>
              <li className={LI}><Bullet /><span>Alle datalekken worden geregistreerd in een intern register, ongeacht of zij gemeld zijn aan de AP.</span></li>
              <li className={LI}><Bullet /><span>Vermoed je een datalek? Neem direct contact op via <a href="mailto:info@klaaskroezen.com" className="text-copper hover:text-copper-light transition-colors">info@klaaskroezen.com</a>.</span></li>
            </ul>

            <h2 className={H2} id="klacht">11. Klacht indienen bij de Autoriteit Persoonsgegevens</h2>
            <p className={P}>
              Als je vindt dat wij niet zorgvuldig met je persoonsgegevens omgaan,
              vragen we je eerst contact met ons op te nemen zodat we kunnen
              proberen het samen op te lossen. Daarnaast heb je altijd het recht
              een klacht in te dienen bij de Autoriteit Persoonsgegevens via{" "}
              <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="text-copper hover:text-copper-light transition-colors">
                autoriteitpersoonsgegevens.nl
              </a>.
            </p>

            <h2 className={H2} id="wijzigingen">12. Wijzigingen in dit privacystatement</h2>
            <p className={P}>
              We behouden ons het recht voor dit privacystatement te wijzigen,
              bijvoorbeeld omdat wet- en regelgeving wijzigt of omdat we nieuwe
              diensten introduceren. Wijzigingen worden op deze pagina
              gepubliceerd; de datum bovenaan deze pagina geeft de laatste versie
              aan. Bij ingrijpende wijzigingen informeren we actieve klanten per
              e-mail.
            </p>

            <p className={`${P} text-ink/45 italic mt-8`}>
              Concept &mdash; deze tekst is opgesteld door Klaas Kroezen en wordt vóór
              definitieve publicatie gereviewd door een Nederlandse jurist. De
              definitieve, juridisch goed&shy;gekeurde versie zal deze tekst
              vervangen.
            </p>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
