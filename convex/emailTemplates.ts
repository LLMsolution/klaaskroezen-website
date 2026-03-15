/**
 * HTML email templates — white theme, Klaas Kroezen brand style.
 * All emails use inline CSS for maximum email client compatibility.
 */

const COPPER = "#B5622A";
const INK = "#0E0C0A";
const WARM = "#EDE9E2";
const LOGO_URL = "https://www.klaaskroezen.com/images/logo/klaas-kroezen-logo.png";
const BOOK_COVER_URL = "https://www.klaaskroezen.com/images/book/sales-oprecht-ontspannen-cover.png";
const SITE_URL = "https://www.klaaskroezen.com";

function layout(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Klaas Kroezen</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f2ed; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${INK}; -webkit-font-smoothing: antialiased;">
${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f2ed;">
<tr><td align="center" style="padding: 40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 2px; overflow: hidden; max-width: 600px; width: 100%;">

<!-- Header -->
<tr><td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid ${WARM};">
  <a href="${SITE_URL}" style="font-family: Georgia, 'Times New Roman', serif; font-size: 18px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; color: ${INK}; text-decoration: none;">KLAAS KROEZEN</a>
</td></tr>

<!-- Content -->
<tr><td style="padding: 40px 40px 32px;">
${content}
</td></tr>

<!-- Footer -->
<tr><td style="padding: 24px 40px 32px; border-top: 1px solid ${WARM}; text-align: center;">
  <p style="margin: 0 0 8px; font-size: 13px; color: #999;">
    <a href="${SITE_URL}/sales-excellence-training" style="color: #999; text-decoration: none;">Trainingen</a> &nbsp;·&nbsp;
    <a href="${SITE_URL}/boek" style="color: #999; text-decoration: none;">Boek</a> &nbsp;·&nbsp;
    <a href="${SITE_URL}/spreker" style="color: #999; text-decoration: none;">Spreker</a> &nbsp;·&nbsp;
    <a href="${SITE_URL}/contact" style="color: #999; text-decoration: none;">Contact</a>
  </p>
  <p style="margin: 0 0 12px; font-size: 12px; color: #bbb;">
    Klaas Kroezen · Oude Parklaan 111 · 1901 ZL Castricum
  </p>
  <p style="margin: 0; font-size: 12px; color: #bbb;">
    <a href="https://www.instagram.com/klaaskroezen" style="color: #bbb; text-decoration: none;">Instagram</a> &nbsp;·&nbsp;
    <a href="https://www.linkedin.com/in/klaaskroezen/" style="color: #bbb; text-decoration: none;">LinkedIn</a> &nbsp;·&nbsp;
    <a href="https://www.youtube.com/@klaaskroezen" style="color: #bbb; text-decoration: none;">YouTube</a>
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin: 0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 900; line-height: 1.1; color: ${INK};">${text}</h1>`;
}

function subheading(text: string): string {
  return `<h2 style="margin: 24px 0 12px; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; line-height: 1.2; color: ${INK};">${text}</h2>`;
}

function paragraph(text: string): string {
  return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.75; color: #444;">${text}</p>`;
}

function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
<tr><td style="background-color: ${COPPER}; border-radius: 2px;">
  <a href="${href}" style="display: inline-block; padding: 14px 28px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #ffffff; text-decoration: none;">${text}</a>
</td></tr>
</table>`;
}

function divider(): string {
  return `<hr style="border: none; border-top: 1px solid ${WARM}; margin: 24px 0;" />`;
}

function signature(): string {
  return `<p style="margin: 24px 0 0; font-size: 15px; line-height: 1.75; color: #444;">
Met vriendelijke groet,<br />
<strong style="color: ${INK};">Klaas Kroezen</strong>
</p>`;
}

function signatureEn(): string {
  return `<p style="margin: 24px 0 0; font-size: 15px; line-height: 1.75; color: #444;">
Best regards,<br />
<strong style="color: ${INK};">Klaas Kroezen</strong>
</p>`;
}

function quote(text: string): string {
  return `<blockquote style="margin: 16px 0; padding: 16px 20px; border-left: 3px solid ${COPPER}; background-color: #faf8f5; font-size: 15px; line-height: 1.75; color: #555; font-style: italic;">${text}</blockquote>`;
}

function featureList(items: string[]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
${items.map((item) => `<tr>
  <td style="padding: 4px 12px 4px 0; vertical-align: top; color: ${COPPER}; font-size: 14px;">✓</td>
  <td style="padding: 4px 0; font-size: 14px; line-height: 1.6; color: #555;">${item}</td>
</tr>`).join("")}
</table>`;
}

// ─── TRANSACTIONAL EMAILS ───

export function contactConfirmationNl(name: string, subject: string, message: string): string {
  return layout(`
${heading("Bedankt voor je bericht.")}
${paragraph(`Hoi ${name},`)}
${paragraph("We hebben je bericht ontvangen en nemen zo snel mogelijk contact met je op — meestal binnen 1 werkdag.")}
${subheading("Je bericht")}
${paragraph(`<strong>Onderwerp:</strong> ${subject}`)}
${quote(message.replace(/\n/g, "<br />"))}
${paragraph("Heb je in de tussentijd een vraag? Bel gerust naar <a href='tel:+31618098906' style='color: ${COPPER};'>+31 6 1809 8906</a> of reply op deze mail.")}
${signature()}
`, "Bedankt — we nemen snel contact op.");
}

export function contactConfirmationEn(name: string, subject: string, message: string): string {
  return layout(`
${heading("Thank you for your message.")}
${paragraph(`Hi ${name},`)}
${paragraph("We've received your message and will get back to you as soon as possible — usually within 1 business day.")}
${subheading("Your message")}
${paragraph(`<strong>Subject:</strong> ${subject}`)}
${quote(message.replace(/\n/g, "<br />"))}
${paragraph("In the meantime, feel free to call <a href='tel:+31618098906' style='color: ${COPPER};'>+31 6 1809 8906</a> or reply to this email.")}
${signatureEn()}
`, "Thank you — we'll get back to you soon.");
}

export function contactNotification(name: string, email: string, phone: string | undefined, company: string | undefined, subject: string, message: string): string {
  return layout(`
${heading("Nieuw contactformulier")}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 16px 0; width: 100%;">
  <tr><td style="padding: 8px 0; font-size: 14px; color: #999; width: 100px;">Naam</td><td style="padding: 8px 0; font-size: 15px; color: ${INK};">${name}</td></tr>
  <tr><td style="padding: 8px 0; font-size: 14px; color: #999;">E-mail</td><td style="padding: 8px 0; font-size: 15px;"><a href="mailto:${email}" style="color: ${COPPER};">${email}</a></td></tr>
  ${phone ? `<tr><td style="padding: 8px 0; font-size: 14px; color: #999;">Telefoon</td><td style="padding: 8px 0; font-size: 15px;"><a href="tel:${phone}" style="color: ${COPPER};">${phone}</a></td></tr>` : ""}
  ${company ? `<tr><td style="padding: 8px 0; font-size: 14px; color: #999;">Bedrijf</td><td style="padding: 8px 0; font-size: 15px; color: ${INK};">${company}</td></tr>` : ""}
  <tr><td style="padding: 8px 0; font-size: 14px; color: #999;">Onderwerp</td><td style="padding: 8px 0; font-size: 15px; color: ${INK};">${subject}</td></tr>
</table>
${divider()}
${quote(message.replace(/\n/g, "<br />"))}
${ctaButton("Beantwoord via mail", `mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`)}
`);
}

export function purchaseConfirmationNl(name: string, product: string, invoiceNumber: string): string {
  return layout(`
${heading("Bedankt voor je bestelling!")}
${paragraph(`Hoi ${name},`)}
${paragraph(`Je bestelling van <strong>${product}</strong> is succesvol ontvangen. Hieronder vind je de details.`)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 20px 0; padding: 20px; background-color: #faf8f5; border-radius: 2px; width: 100%;">
  <tr><td style="padding: 6px 0; font-size: 14px; color: #999;">Factuurnummer</td><td style="padding: 6px 0; font-size: 15px; color: ${INK}; text-align: right;">${invoiceNumber}</td></tr>
  <tr><td style="padding: 6px 0; font-size: 14px; color: #999;">Product</td><td style="padding: 6px 0; font-size: 15px; color: ${INK}; text-align: right;">${product}</td></tr>
</table>
${paragraph("Je factuur is als bijlage toegevoegd aan deze e-mail. Bij trainingen ontvang je binnen enkele minuten een aparte e-mail met je toegangsgegevens.")}
${ctaButton("Ga naar je dashboard", `${SITE_URL}/dashboard`)}
${paragraph("Vragen? Reply gerust op deze mail.")}
${signature()}
`, `Bedankt voor je bestelling van ${product}`);
}

export function purchaseConfirmationEn(name: string, product: string, invoiceNumber: string): string {
  return layout(`
${heading("Thank you for your order!")}
${paragraph(`Hi ${name},`)}
${paragraph(`Your order for <strong>${product}</strong> has been successfully received. Here are the details.`)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 20px 0; padding: 20px; background-color: #faf8f5; border-radius: 2px; width: 100%;">
  <tr><td style="padding: 6px 0; font-size: 14px; color: #999;">Invoice number</td><td style="padding: 6px 0; font-size: 15px; color: ${INK}; text-align: right;">${invoiceNumber}</td></tr>
  <tr><td style="padding: 6px 0; font-size: 14px; color: #999;">Product</td><td style="padding: 6px 0; font-size: 15px; color: ${INK}; text-align: right;">${product}</td></tr>
</table>
${paragraph("Your invoice is attached to this email. For trainings, you'll receive a separate email with your access details within a few minutes.")}
${ctaButton("Go to your dashboard", `${SITE_URL}/dashboard`)}
${paragraph("Questions? Feel free to reply to this email.")}
${signatureEn()}
`, `Thank you for your order of ${product}`);
}

export function abandonedCartNl(firstName: string, product: string): string {
  return layout(`
${heading("Je bestelling staat klaar.")}
${paragraph(`Hoi ${firstName},`)}
${paragraph(`Je was bezig met het bestellen van <strong>${product}</strong>, maar hebt de betaling niet afgerond. Geen probleem — je bestelling staat nog klaar.`)}
${quote("Sales Excellence gaat niet over 'verkopen aan' iemand, maar over het 'helpen van' iemand. — Klaas Kroezen")}
${paragraph("Heb je vragen of twijfel je? Neem gerust contact op — ik help je graag persoonlijk.")}
${ctaButton("Bestelling afronden", `${SITE_URL}/contact`)}
${signature()}
`, `Je bestelling van ${product} staat nog klaar`);
}

export function abandonedCartEn(firstName: string, product: string): string {
  return layout(`
${heading("Your order is waiting.")}
${paragraph(`Hi ${firstName},`)}
${paragraph(`You started ordering <strong>${product}</strong> but didn't complete the payment. No problem — your order is still waiting for you.`)}
${quote("Sales Excellence is not about 'selling to' someone, but about 'helping' someone. — Klaas Kroezen")}
${paragraph("Have questions or doubts? Feel free to reach out — I'm happy to help personally.")}
${ctaButton("Complete your order", `${SITE_URL}/contact`)}
${signatureEn()}
`, `Your order for ${product} is still waiting`);
}

// ─── DRIP SEQUENCE: TRAINING ───

export function trainingWelcomeNl(name: string, training: string): string {
  return layout(`
${heading(`Welkom bij de ${training}!`)}
${paragraph(`Hoi ${name},`)}
${paragraph("Wat gaaf dat je deze stap hebt gezet. Je hebt gekozen voor een aanpak die écht werkt — niet gebaseerd op trucjes, maar op oprechte verbinding.")}
${subheading("Wat kun je verwachten?")}
${featureList([
  "6 modules die je in je eigen tempo doorloopt",
  "Praktijkoefeningen bij elk hoofdstuk",
  "Direct toepasbaar in je dagelijkse werk",
  "Toegang tot je dashboard met al je materialen",
])}
${paragraph("Mijn advies: begin vandaag met Module 1. Neem de tijd, maak de oefeningen, en je zult merken dat het verschil al na het eerste gesprek voelbaar is.")}
${ctaButton("Start met Module 1", `${SITE_URL}/dashboard`)}
${paragraph("Ik ben benieuwd naar je eerste ervaringen. Reply gerust op deze mail — ik lees alles persoonlijk.")}
${signature()}
`, `Welkom! Je ${training} staat klaar`);
}

export function trainingTip1Nl(name: string): string {
  return layout(`
${heading("De kracht van je eerste indruk.")}
${paragraph(`Hoi ${name},`)}
${paragraph("Hoe is het met je training? Vandaag wil ik een tip delen die het verschil kan maken in je eerstvolgende klantgesprek.")}
${quote("De eerste 30 seconden van een gesprek bepalen 80% van het vertrouwen. Niet door wat je zegt, maar door hoe je aanwezig bent.")}
${paragraph("Probeer dit eens: ga je volgende gesprek in met maar één doel — <strong>begrijpen</strong>. Niet overtuigen, niet presenteren, gewoon luisteren. Stel je eerste vraag en wacht. Écht wacht.")}
${paragraph("Je zult merken dat de ander zich opent, meer vertelt, en dat het gesprek een heel andere dynamiek krijgt.")}
${subheading("Oefening")}
${paragraph("Schrijf na je volgende gesprek op: <em>Wat heb ik geleerd over deze persoon dat ik van tevoren niet wist?</em> Als je antwoord langer is dan twee zinnen, ben je op de goede weg.")}
${ctaButton("Ga verder met je training", `${SITE_URL}/dashboard`)}
${signature()}
`, "Tip: de kracht van je eerste indruk");
}

export function trainingTip2Nl(name: string): string {
  return layout(`
${heading("Bezwaren zijn geen afwijzing.")}
${paragraph(`Hoi ${name},`)}
${paragraph("Veel mensen zijn bang voor bezwaren in een gesprek. 'Het is te duur', 'we moeten er nog over nadenken', 'we hebben al een leverancier'. Herkenbaar?")}
${paragraph("Hier is het geheim: <strong>een bezwaar is een koopsignaal.</strong> De ander is geïnteresseerd genoeg om erover na te denken. Dat is goed nieuws.")}
${quote("Een 'nee' is geen persoonlijke afwijzing. Het is simpelweg informatie — dat de behoefte er niet is, of dat de timing verkeerd is.")}
${subheading("De 3-stappen methode")}
${featureList([
  "<strong>Erken het.</strong> 'Dat begrijp ik helemaal.'",
  "<strong>Vraag door.</strong> 'Wat maakt dat je dat zo ervaart?'",
  "<strong>Help.</strong> Bied een perspectief dat past bij hun situatie.",
])}
${paragraph("Niet verdedigen. Niet overtuigen. Gewoon begrijpen en helpen.")}
${ctaButton("Bekijk Module 5: Bezwaren", `${SITE_URL}/dashboard`)}
${signature()}
`, "Bezwaren zijn geen afwijzing — ze zijn een uitnodiging");
}

export function trainingCompletionNl(name: string, training: string): string {
  return layout(`
${heading("Gefeliciteerd — je hebt het gedaan!")}
${paragraph(`Hoi ${name},`)}
${paragraph(`Je hebt de <strong>${training}</strong> volledig afgerond. Dat is een prestatie waar je trots op mag zijn.`)}
${paragraph("Je hebt nu een fundament dat je de rest van je carrière zal dragen. Niet een setje trucjes, maar een manier van werken die past bij wie je bent.")}
${subheading("Wat nu?")}
${featureList([
  "Download je certificaat via je dashboard",
  "Pas de principes toe en deel je resultaten",
  "Overweeg de training voor je team",
])}
${paragraph("Ik zou het heel fijn vinden als je me laat weten hoe de training je heeft geholpen. Een korte reply op deze mail is genoeg — het motiveert me enorm.")}
${ctaButton("Download je certificaat", `${SITE_URL}/dashboard`)}
${quote("Het creëren van fans is de snelste weg naar duurzaam succes.")}
${signature()}
`, `Gefeliciteerd met het afronden van de ${training}!`);
}

// ─── DRIP SEQUENCE: BOOK ───

export function bookWelcomeNl(name: string, format: string): string {
  return layout(`
${heading("Je boek is onderweg!")}
${paragraph(`Hoi ${name},`)}
${paragraph(`Bedankt voor het bestellen van <strong>Sales, Oprecht en Ontspannen</strong> (${format}). ${format === "Hard Copy" ? "Je boek wordt binnen 1-2 werkdagen bezorgd met gratis verzending." : "Je download staat klaar in je dashboard."}`)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto; text-align: center;">
<tr><td>
  <img src="${BOOK_COVER_URL}" alt="Sales, Oprecht en Ontspannen" width="160" style="display: block; margin: 0 auto; border-radius: 2px;" />
</td></tr>
</table>
${paragraph("Ik heb dit boek geschreven omdat ik geloof dat sales een van de mooiste beroepen ter wereld is — mits je het doet op een manier die goed voelt.")}
${subheading("Leestip")}
${paragraph("Begin bij het Voorwoord en de Introductie. Ik leg daar uit waarom deze aanpak werkt en wat je kunt verwachten. Daarna kun je de hoofdstukken op volgorde doorlopen, of direct naar het onderwerp springen dat je het meest aanspreekt.")}
${ctaButton("Ga naar je dashboard", `${SITE_URL}/dashboard`)}
${signature()}
`, "Je boek is onderweg! 📖");
}

export function bookFollowUpNl(name: string): string {
  return layout(`
${heading("Hoe bevalt het boek?")}
${paragraph(`Hoi ${name},`)}
${paragraph("Je hebt nu een paar dagen met <strong>Sales, Oprecht en Ontspannen</strong>. Ik ben benieuwd: heb je al een inzicht gehad dat je direct kon toepassen?")}
${quote("Verkopen hoort niet ongemakkelijk te voelen. Het zou iets moeten zijn dat je met plezier en trots doet. Omdat het helpt. Omdat het klopt.")}
${paragraph("Twee dingen die ik je wil meegeven:")}
${featureList([
  "<strong>Deel het.</strong> Ken je iemand die dit ook zou moeten lezen? Het boek werkt het beste als je team dezelfde taal spreekt.",
  "<strong>Pas toe.</strong> Kies één principe uit het boek en pas het deze week toe in een gesprek. Eén ding. Meer hoeft niet.",
])}
${paragraph("En als het boek je bevalt — een korte review op <a href='https://www.managementboek.nl/boek/9789090409740' style='color: ${COPPER};'>Managementboek.nl</a> helpt enorm om anderen te bereiken.")}
${ctaButton("Bekijk de training", `${SITE_URL}/sales-excellence-training`)}
${paragraph("Van boek naar praktijk — de Sales Excellence Training bouwt verder op dezelfde methode, met persoonlijke begeleiding.")}
${signature()}
`, "Hoe bevalt het boek?");
}

// ─── MARKETING EMAILS ───

export function marketingBestsellerNl(): string {
  return layout(`
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px; text-align: center; width: 100%;">
<tr><td>
  <img src="${BOOK_COVER_URL}" alt="Sales, Oprecht en Ontspannen" width="180" style="display: block; margin: 0 auto; border-radius: 2px;" />
</td></tr>
</table>
${heading("#1 Bestseller bij Managementboek")}
${paragraph("Het is zover: <strong>Sales, Oprecht en Ontspannen</strong> staat op #1 bij Managementboek.nl. 2.500+ exemplaren verkocht in de eerste maanden.")}
${quote("Dit boek laat zien dat echte sales begint bij wie je bént. Mindset, rust en oprechte intentie leiden tot verbinding. — Michael Pilarczyk")}
${paragraph("Waarom lezen mensen dit boek?")}
${featureList([
  "Praktische aanpak die je morgen al kunt toepassen",
  "Geen trucjes — gebaseerd op 25+ jaar ervaring",
  "Voor iedereen met klantcontact, niet alleen verkopers",
])}
${ctaButton("Bestel het boek", `${SITE_URL}/boek#bestellen`)}
${paragraph("Gratis verzending binnen Nederland. Ook beschikbaar als e-book en luisterboek (ingesproken door Klaas zelf).")}
${signature()}
`, "#1 Bestseller — Sales, Oprecht en Ontspannen");
}

export function marketingTrainingLaunchNl(): string {
  return layout(`
${heading("Meer omzet. Minder stress.")}
${paragraph("Herken je dit? Sales loopt achter op target, gesprekken voelen als duwen in plaats van verbinden, en korting geven is de standaard geworden.")}
${paragraph("<strong>Dat kan anders.</strong>")}
${paragraph("De Sales Excellence Training is een bewezen programma voor verkopers en salesteams die weten dat er meer in zit. Geen trucjes, geen NLP, geen scripts. Maar een aanpak die past bij wie je bent.")}
${subheading("Wat deelnemers zeggen")}
${quote("Van 10 leads werden 1 tot 2 klant. Nu zijn dat er 7 tot 8. Niet door harder te pushen, maar door oprecht geïnteresseerd te zijn. — Max de Weijer")}
${subheading("Wat je krijgt")}
${featureList([
  "6 modules online training met werkboek",
  "Persoonlijke kick-off sessie met Klaas",
  "10% resultaatgarantie of geld terug",
  "Gemiddelde beoordeling: 9.1",
])}
${ctaButton("Bekijk de training", `${SITE_URL}/sales-excellence-training`)}
${paragraph("Vanaf € 2.250 excl. BTW. Ook beschikbaar als teamtraining op maat.")}
${signature()}
`, "Meer omzet, minder stress — Sales Excellence Training");
}

export function marketingNewYearNl(): string {
  return layout(`
${heading("2026 wordt jouw jaar.")}
${paragraph("Het nieuwe jaar is het perfecte moment om stil te staan bij hoe je commercieel werkt. Niet meer, niet harder — maar <strong>slimmer en oprechter</strong>.")}
${paragraph("In de afgelopen maanden heb ik honderden professionals begeleid naar een aanpak die werkt. Niet gebaseerd op druk, maar op verbinding. Het resultaat? Meer omzet, meer werkplezier, en klanten die fans worden.")}
${subheading("3 voornemens die echt werken")}
${featureList([
  "<strong>Luister meer, praat minder.</strong> 80% luisteren, 20% praten. Probeer het een week.",
  "<strong>Vraag 'waarom', niet 'wat'.</strong> De vraag achter de vraag is waar de echte waarde zit.",
  "<strong>Wees een adviseur, geen verkoper.</strong> Help mensen beslissen, niet overtuig ze.",
])}
${quote("Je missie helpt je om altijd gefocust te blijven op het creëren van waarde. En dat is de snelste weg naar trouwe fans.")}
${ctaButton("Start het jaar goed", `${SITE_URL}/sales-excellence-training`)}
${paragraph("Nieuwsgierig maar nog niet klaar om te starten? <a href='" + SITE_URL + "/boek' style='color: " + COPPER + ";'>Begin met het boek</a> — het perfecte startpunt.")}
${signature()}
`, "2026 wordt jouw jaar — 3 voornemens die echt werken");
}

export function marketingCustomerSuccessNl(): string {
  return layout(`
${heading("Jij verkoopt niet. Maar jij maakt het verschil.")}
${paragraph("Je hebt geen salesfunctie. Maar jij bepaalt wél of een klant blijft, groeit en anderen aanbeveelt. Dat is commercieel goud.")}
${paragraph("De <strong>Customer Success Training</strong> is speciaal ontwikkeld voor professionals in klantcontact, service en delivery. Geen verkooptechnieken — maar verbindingsvaardigheden.")}
${subheading("Herken je dit?")}
${featureList([
  "Klanten vertrekken zonder dat je weet waarom",
  "Onbenut potentieel in bestaand klantcontact",
  "Moeite met het bespreekbaar maken van meerwaarde",
])}
${paragraph("Na deze training weet je hoe je vanuit elk klantgesprek bijdraagt aan groei, retentie en ambassadeurschap. Ontspannen en oprecht.")}
${quote("Direct meer resultaat. Klaas maakt helder dat iedereen met klantcontact essentieel is voor commercieel succes. — Simon Kornblum, Directeur Visma YouServe")}
${ctaButton("Bekijk de training", `${SITE_URL}/customer-success-training`)}
${paragraph("10% beter in klanttevredenheid of geld terug.")}
${signature()}
`, "Jij verkoopt niet. Maar jij maakt het verschil.");
}

export function marketingTeamTrainingNl(): string {
  return layout(`
${heading("Eén taal. Eén aanpak. Heel je team.")}
${paragraph("Wanneer sales achterblijft en klanttevredenheid daalt, is versnippering funest. Iedereen doet het op zijn eigen manier — en het resultaat is chaos.")}
${paragraph("Met een <strong>teamtraining op maat</strong> zorg je dat iedereen die klantcontact heeft dezelfde taal spreekt. Van sales tot customer success, van management tot service.")}
${subheading("Wat maakt een teamtraining anders?")}
${featureList([
  "Gezamenlijke kick-off op jullie locatie",
  "Oefeningen met casussen uit jullie praktijk",
  "Persoonlijke begeleiding per deelnemer",
  "Meetbare resultaten en managementrapportage",
])}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0; padding: 20px; background-color: #faf8f5; border-radius: 2px; width: 100%;">
<tr><td style="text-align: center;">
  <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 32px; font-weight: 900; color: ${INK};">9.1</p>
  <p style="margin: 0; font-size: 13px; color: #999;">Gemiddelde beoordeling</p>
</td></tr>
</table>
${ctaButton("Plan een gesprek", `${SITE_URL}/contact`)}
${paragraph("Neem contact op voor een vrijblijvend voorstel op maat.")}
${signature()}
`, "Eén taal voor je hele team — teamtraining op maat");
}
