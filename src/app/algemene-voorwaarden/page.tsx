import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Algemene Voorwaarden",
  description: "Algemene voorwaarden van Klaas Kroezen — trainingen, coaching, boek (digitaal en fysiek) en keynotes.",
};

const H2 = "font-display text-[22px] font-bold tracking-[-0.02em] mt-10 first:mt-0";
const H3 = "font-display text-[16px] font-semibold tracking-[-0.01em] mt-6 mb-2";
const P = "text-[15px] text-ink/70 leading-[1.8]";
const ULIST = "space-y-2 text-[15px] text-ink/70 leading-[1.8] list-none";
const LI = "flex items-start gap-2.5";
const Bullet = () => <span className="text-copper text-[11px] mt-[7px] shrink-0">—</span>;

export default function AlgemeneVoorwaardenPage() {
  return (
    <section className="py-16 sm:py-[110px] border-b border-rule">
      <Container>
        <FadeIn>
          <Label className="mb-3">Juridisch</Label>
          <h1 className="font-display text-[clamp(32px,4.2vw,54px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
            Algemene Voorwaarden
          </h1>

          <div className="mb-10 inline-block bg-copper/10 border border-copper/30 rounded-[2px] px-4 py-2">
            <p className="text-[12px] text-copper font-medium tracking-[0.05em] uppercase">
              Concept &mdash; in afwachting van juridische review
            </p>
          </div>

          <div className="prose-kk max-w-[760px] space-y-2">
            <p className={P}>
              Versie: april 2026 (concept). Deze voorwaarden zijn een door Klaas
              Kroezen opgestelde concept&shy;tekst en worden vóór go-live geverifi&euml;erd
              door een Nederlandse jurist. De Nederlandse versie is leidend.
            </p>

            <h2 className={H2} id="art-1">Artikel 1 — Definities</h2>
            <p className={P}>
              In deze algemene voorwaarden gelden de volgende definities:
            </p>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span><strong className="text-ink">Klaas Kroezen:</strong> eenmanszaak gevestigd te Castricum, ingeschreven bij de Kamer van Koophandel te Amsterdam, hierna ook &ldquo;dienstverlener&rdquo; of &ldquo;wij&rdquo;.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Klant:</strong> de natuurlijke persoon (consument) of rechtspersoon (zakelijk) die een overeenkomst aangaat met Klaas Kroezen.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Consument:</strong> klant die handelt voor doeleinden buiten zijn bedrijfs- of beroepsactiviteit.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Diensten:</strong> trainingen (online en in-company), coaching, keynotes, workshops en overige vormen van dienstverlening.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Digitale producten:</strong> e-book, luisterboek en online trainingen die digitaal worden geleverd.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Fysieke producten:</strong> het hardcopy-boek &ldquo;Sales, Oprecht en Ontspannen&rdquo; dat per post wordt verzonden.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Website:</strong> klaaskroezen.nl en alle subdomeinen.</span></li>
              <li className={LI}><Bullet /><span><strong className="text-ink">Overeenkomst:</strong> elke afspraak tussen Klaas Kroezen en de klant tot levering van diensten of producten.</span></li>
            </ul>

            <h2 className={H2} id="art-2">Artikel 2 — Toepasselijkheid</h2>
            <p className={P}>
              Deze voorwaarden zijn van toepassing op elk aanbod van Klaas Kroezen,
              op elke bestelling via de website en op elke tot stand gekomen
              overeenkomst. Door een bestelling te plaatsen of een dienst af te
              nemen verklaart de klant deze voorwaarden te hebben gelezen en
              aanvaard. Afwijkingen gelden uitsluitend wanneer schriftelijk
              overeengekomen.
            </p>
            <p className={P}>
              Voorwaarden van de klant worden uitdrukkelijk van de hand gewezen,
              tenzij Klaas Kroezen deze schriftelijk heeft aanvaard.
            </p>

            <h2 className={H2} id="art-3">Artikel 3 — Aanbod en totstandkoming overeenkomst</h2>
            <p className={P}>
              Het aanbod op de website bevat een nauwkeurige omschrijving van het
              product of de dienst, de prijs (incl. of excl. BTW), eventuele
              verzendkosten en de wijze van levering. Kennelijke vergissingen of
              schrijffouten binden Klaas Kroezen niet.
            </p>
            <p className={P}>
              De overeenkomst komt tot stand op het moment dat de klant het aanbod
              heeft aanvaard én aan de betalingsverplichting heeft voldaan. Klaas
              Kroezen bevestigt de ontvangst van de bestelling per e-mail.
            </p>

            <h2 className={H2} id="art-4">Artikel 4 — Prijzen en betaling</h2>
            <h3 className={H3}>4.1 Prijzen</h3>
            <p className={P}>
              Prijzen op de website zijn voor consumenten incl. 9% of 21% BTW
              (afhankelijk van het product) en voor zakelijke klanten excl. BTW.
              Voor het boek (hardcopy, e-book en luisterboek) geldt het verlaagde
              BTW-tarief van 9%. Voor trainingen geldt 21% BTW. Verzendkosten
              binnen Nederland zijn gratis voor het hardcopy-boek.
            </p>
            <h3 className={H3}>4.2 Betaling</h3>
            <p className={P}>
              Betaling vindt plaats via de op de website aangeboden methoden: iDEAL,
              creditcard en Apple Pay. Betalingen worden verwerkt door Mollie B.V.
              (KvK 30204462). Voor zakelijke klanten kan in voorkomende gevallen
              betaling op factuur worden overeengekomen, met een betaaltermijn van
              14 dagen.
            </p>
            <h3 className={H3}>4.3 Niet-tijdige betaling</h3>
            <p className={P}>
              Bij niet-tijdige betaling is de klant van rechtswege in verzuim
              zonder dat ingebrekestelling vereist is. Klaas Kroezen kan vanaf de
              vervaldatum de wettelijke (handels)rente in rekening brengen, alsmede
              redelijke incassokosten conform de Wet incassokosten.
            </p>

            <h2 className={H2} id="art-5">Artikel 5 — Levering</h2>
            <h3 className={H3}>5.1 Digitale producten</h3>
            <p className={P}>
              Direct na succesvolle betaling ontvangt de klant via e-mail toegang
              tot het digitale product. E-book en luisterboek zijn beschikbaar in
              het persoonlijke dashboard op klaaskroezen.nl. Online trainingen zijn
              vanaf het moment van betaling 12 maanden toegankelijk, tenzij anders
              vermeld op de productpagina.
            </p>
            <h3 className={H3}>5.2 Persoonlijk account</h3>
            <p className={P}>
              Bij het plaatsen van een bestelling wordt automatisch een persoonlijk
              account aangemaakt op basis van het opgegeven e-mailadres. Na
              afronding van de betaling ontvangt de klant een e-mail waarmee hij of
              zij direct kan inloggen en aankopen kan inzien via het persoonlijke
              dashboard op klaaskroezen.nl.
            </p>
            <h3 className={H3}>5.3 Fysieke producten</h3>
            <p className={P}>
              Het hardcopy-boek wordt uitsluitend verzonden binnen Nederland. De
              levertijd bedraagt doorgaans 1&ndash;2 werkdagen na ontvangst van de
              betaling. Voor zendingen naar andere landen kan de klant contact met
              ons opnemen voor een offerte op maat.
            </p>
            <h3 className={H3}>5.4 Risico-overgang</h3>
            <p className={P}>
              Het risico van verlies, beschadiging of vermissing van fysieke
              producten gaat over op de klant op het moment van bezorging.
            </p>

            <h2 className={H2} id="art-6">Artikel 6 — Herroepingsrecht</h2>
            <h3 className={H3}>6.1 Fysieke producten</h3>
            <p className={P}>
              Bij de aankoop van het hardcopy-boek heeft de consument een
              herroepingstermijn van 14 kalenderdagen vanaf de dag van ontvangst.
              De klant kan binnen deze termijn de overeenkomst zonder opgaaf van
              redenen ontbinden door een melding te sturen naar
              info@klaaskroezen.com (bij voorkeur met gebruik van het{" "}
              <a href="/herroepingsformulier" className="text-copper hover:text-copper-light underline">
                modelformulier voor herroeping
              </a>
              ). Het boek dient ongebruikt en in de oorspronkelijke
              staat te worden teruggestuurd. Retourkosten komen voor rekening van
              de klant. Het reeds betaalde bedrag wordt binnen 14 dagen na
              ontvangst van de retour terugbetaald.
            </p>
            <h3 className={H3}>6.2 Digitale producten — vervallen herroepingsrecht</h3>
            <p className={P}>
              Bij digitale producten zoals het e-book, luisterboek en online
              trainingen vervalt het herroepingsrecht zodra de levering met
              uitdrukkelijke voorafgaande toestemming van de consument is gestart
              (artikel 6:230o lid 3 BW). Tijdens het bestelproces wordt om deze
              uitdrukkelijke toestemming gevraagd via een aparte aanvinkbox.
              Zonder deze toestemming kan de bestelling niet worden geplaatst.
            </p>
            <h3 className={H3}>6.3 Diensten — annulering trainingen en coaching</h3>
            <p className={P}>
              Annulering van in-company trainingen, coaching en keynotes door de
              klant is mogelijk volgens de volgende staffel:
            </p>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span>Tot 14 kalenderdagen vóór de afgesproken datum: kosteloos.</span></li>
              <li className={LI}><Bullet /><span>Tussen 14 en 7 kalenderdagen vóór de afgesproken datum: 50% van het overeengekomen bedrag.</span></li>
              <li className={LI}><Bullet /><span>Binnen 7 kalenderdagen vóór de afgesproken datum of bij no-show: 100% van het overeengekomen bedrag.</span></li>
            </ul>

            <h2 className={H2} id="art-7">Artikel 7 — Resultaatgarantie online trainingen</h2>
            <p className={P}>
              Voor de online trainingen Sales Excellence Training en Customer
              Success Training geldt de zogenaamde 10%-resultaatgarantie. Indien de
              klant na het volledig en aantoonbaar doorlopen van alle modules
              binnen 12 maanden geen 10% verbetering ervaart in zijn of haar
              relevante commerci&euml;le resultaten, kan de klant aanspraak maken op
              terugbetaling van het aankoopbedrag minus eventuele
              transactiekosten.
            </p>
            <p className={P}>
              Aanspraak op deze garantie is slechts mogelijk indien:
            </p>
            <ul className={ULIST}>
              <li className={LI}><Bullet /><span>alle modules en bijbehorende werkboeken volledig zijn afgerond;</span></li>
              <li className={LI}><Bullet /><span>de klant binnen 14 dagen na afronding van de laatste module een schriftelijk verzoek indient;</span></li>
              <li className={LI}><Bullet /><span>de klant ondersteunend bewijs aanlevert van de toepassing van de geleerde principes in de praktijk.</span></li>
            </ul>

            <h2 className={H2} id="art-8">Artikel 8 — Verplichtingen van de klant</h2>
            <p className={P}>
              De klant is verplicht juiste en volledige gegevens te verstrekken bij
              het aangaan van de overeenkomst. Inloggegevens voor de online
              omgeving zijn strikt persoonlijk en mogen niet worden gedeeld met
              derden. Bij vermoeden van misbruik kan Klaas Kroezen de toegang
              opschorten of be&euml;indigen.
            </p>

            <h2 className={H2} id="art-9">Artikel 9 — Intellectueel eigendom</h2>
            <p className={P}>
              Alle intellectuele eigendomsrechten op het boek &ldquo;Sales, Oprecht en
              Ontspannen&rdquo; (in alle uitvoeringen), op de online trainings&shy;materialen,
              werkboeken, video&apos;s, audio&shy;opnames, modellen en overige door Klaas
              Kroezen verstrekte materialen berusten uitsluitend bij Klaas Kroezen.
            </p>
            <p className={P}>
              De klant ontvangt een persoonlijk, niet-overdraagbaar gebruiksrecht
              voor eigen gebruik. Het is uitdrukkelijk niet toegestaan om
              materialen geheel of gedeeltelijk te verveelvoudigen, te delen, te
              verspreiden, te uploaden naar andere platforms, te gebruiken voor
              commerci&euml;le doeleinden of openbaar te maken zonder voorafgaande
              schriftelijke toestemming.
            </p>
            <p className={P}>
              Schending van deze bepaling geeft Klaas Kroezen het recht op
              onmiddellijke be&euml;indiging van de toegang en op vergoeding van de
              daardoor veroorzaakte schade, onverlet overige rechtsmiddelen.
            </p>

            <h2 className={H2} id="art-10">Artikel 10 — Klachten en geschillencommissie</h2>
            <p className={P}>
              Klachten over de uitvoering van de overeenkomst dienen binnen
              redelijke termijn, doch uiterlijk binnen twee maanden nadat de klant
              de gebreken heeft geconstateerd, te worden gemeld via
              info@klaaskroezen.com. Klaas Kroezen reageert uiterlijk binnen 14
              dagen op de klacht.
            </p>
            <p className={P}>
              Indien klachten niet in onderling overleg kunnen worden opgelost,
              kan de consument het geschil voorleggen aan de Geschillencommissie
              Thuiswinkel (Postbus 90600, 2509 LP Den Haag,{" "}
              <a href="https://www.sgc.nl" target="_blank" rel="noopener noreferrer" className="text-copper hover:text-copper-light transition-colors">
                www.sgc.nl
              </a>) of aan de Europese ODR-procedure via{" "}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-copper hover:text-copper-light transition-colors">
                ec.europa.eu/consumers/odr
              </a>.
            </p>

            <h2 className={H2} id="art-11">Artikel 11 — Aansprakelijkheid</h2>
            <p className={P}>
              Klaas Kroezen is uitsluitend aansprakelijk voor directe schade die
              het gevolg is van opzet of bewuste roekeloosheid van Klaas Kroezen
              of haar medewerkers. Aansprakelijkheid voor indirecte schade
              (waaronder gevolg&shy;schade, gederfde omzet, gemiste besparingen en
              schade door bedrijfsstagnatie) is uitgesloten.
            </p>
            <p className={P}>
              Voor zover Klaas Kroezen aansprakelijk is, is de aansprakelijkheid
              per gebeurtenis beperkt tot het bedrag dat voor de betreffende
              dienst of het betreffende product door de klant is betaald, met een
              maximum van &euro; 5.000 per kalenderjaar.
            </p>
            <p className={P}>
              De in dit artikel opgenomen beperkingen gelden niet indien de schade
              is te wijten aan opzet of bewuste roekeloosheid van Klaas Kroezen.
            </p>

            <h2 className={H2} id="art-12">Artikel 12 — Overmacht</h2>
            <p className={P}>
              Klaas Kroezen is niet gehouden tot het nakomen van een verplichting
              jegens de klant indien hij daartoe gehinderd wordt als gevolg van
              overmacht. Onder overmacht wordt onder meer verstaan: ziekte,
              uitval van internetverbindingen, storingen bij hostingpartijen of
              betaaldiensten, alsmede iedere andere omstandigheid die buiten de
              redelijke invloedssfeer van Klaas Kroezen ligt.
            </p>

            <h2 className={H2} id="art-13">Artikel 13 — Persoonsgegevens en privacy</h2>
            <p className={P}>
              Klaas Kroezen verwerkt persoonsgegevens conform de Algemene
              Verordening Gegevens&shy;bescherming (AVG) en de Uitvoeringswet AVG. De
              wijze waarop persoonsgegevens worden verwerkt is uitgewerkt in het{" "}
              <a href="/privacy" className="text-copper hover:text-copper-light transition-colors">
                privacy&shy;statement
              </a>.
            </p>

            <h2 className={H2} id="art-14">Artikel 14 — Wijzigingen voorwaarden</h2>
            <p className={P}>
              Klaas Kroezen behoudt zich het recht voor deze voorwaarden te
              wijzigen. Wijzigingen worden tijdig op de website gepubliceerd. Voor
              reeds gesloten overeenkomsten blijven de op dat moment geldende
              voorwaarden van toepassing, tenzij dwingend recht anders bepaalt.
            </p>

            <h2 className={H2} id="art-15">Artikel 15 — Toepasselijk recht en bevoegde rechter</h2>
            <p className={P}>
              Op deze voorwaarden en op alle overeenkomsten is uitsluitend
              Nederlands recht van toepassing. De toepasselijkheid van het
              Weens Koopverdrag (CISG) is uitdrukkelijk uitgesloten.
            </p>
            <p className={P}>
              Geschillen die voortvloeien uit of verband houden met de
              overeenkomst worden bij uitsluiting voorgelegd aan de bevoegde
              rechter in het arrondissement Noord-Holland, tenzij dwingend recht
              een andere rechter aanwijst.
            </p>

            <h2 className={H2} id="contact">Vragen of opmerkingen</h2>
            <p className={P}>
              Voor vragen over deze voorwaarden of over een specifieke bestelling
              kun je terecht bij Klaas Kroezen via{" "}
              <a href="mailto:info@klaaskroezen.com" className="text-copper hover:text-copper-light transition-colors">
                info@klaaskroezen.com
              </a>{" "}
              of telefonisch op +31 6 1809 8906.
            </p>
            <p className={`${P} text-ink/45 italic mt-8`}>
              Concept &mdash; deze tekst is opgesteld door Klaas Kroezen en wordt vóór
              definitieve publicatie ge&shy;reviewd door een Nederlandse jurist.
              De definitieve, juridisch goed&shy;gekeurde versie zal deze tekst
              vervangen.
            </p>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
