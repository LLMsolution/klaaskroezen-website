import { makeContent, type PageSeed } from "./siteSeed";

const SLUG = "customer-success-training";

export function seedCstContent(): PageSeed {
  const sections = [
    { id: "hero", type: "hero", active: true, sortOrder: 0 },
    { id: "pain-points", type: "pain-points", active: true, sortOrder: 1 },
    { id: "transformation", type: "transformation", active: true, sortOrder: 2 },
    { id: "audiences", type: "audiences", active: true, sortOrder: 3 },
    { id: "program", type: "program", active: true, sortOrder: 4 },
    { id: "radar", type: "radar", active: true, sortOrder: 5 },
    { id: "reviews", type: "reviews", active: true, sortOrder: 6 },
    { id: "pricing", type: "pricing", active: true, sortOrder: 7 },
    { id: "cross-link", type: "cross-link", active: true, sortOrder: 8 },
    { id: "faq", type: "faq", active: true, sortOrder: 9 },
    { id: "cta", type: "cta", active: true, sortOrder: 10 },
  ];

  const content = [
    // ── Hero ──
    makeContent(SLUG, "hero", "hero", "nl", {
      eyebrow: "Customer Success Training",
      titleLine1: "Van klant",
      titleLine2: "naar fan.",
      description: "Je hebt geen salesfunctie — maar jij bepaalt wél of een klant blijft, groeit en anderen aanbeveelt. Dat is commercieel goud.",
      image: "/images/hero/customer-success-group.jpg",
      imageAlt: "Deelnemers van de Customer Success Training",
      imagePosition: "center center",
      glassItems: [
        { label: "Geen salestraining", text: "Specifiek voor professionals in klantcontact, service en delivery. Geen verkooptechnieken maar verbindingsvaardigheden." },
        { label: "Direct toepasbaar", text: "Praktische tools en frameworks die je morgen al kunt inzetten in elk klantgesprek." },
        { label: "Resultaatgarantie", text: "10% beter in klanttevredenheid of geld terug. Gemeten via het Customer Experience Model." },
      ],
    }),
    makeContent(SLUG, "hero", "hero", "en", {
      eyebrow: "Customer Success Training",
      titleLine1: "From customer",
      titleLine2: "to fan.",
      description: "You're not in a sales role — but you do determine whether a customer stays, grows and recommends others. That's commercial gold.",
      image: "/images/hero/customer-success-group.jpg",
      imageAlt: "Participants of the Customer Success Training",
      imagePosition: "center center",
      glassItems: [
        { label: "Not a sales training", text: "Specifically for professionals in customer contact, service and delivery. Not sales techniques but connection skills." },
        { label: "Immediately applicable", text: "Practical tools and frameworks you can use in every customer conversation starting tomorrow." },
        { label: "Results guarantee", text: "10% better in customer satisfaction or your money back. Measured via the Customer Experience Model." },
      ],
    }),
    // ── Pain Points ──
    makeContent(SLUG, "pain-points", "pain-points", "nl", {
      eyebrow: "Je doet geen sales. Maar je bent commercieel cruciaal.",
      title: "Je herkent dit.",
      titleAccent: "En je wilt het anders.",
      points: ["Klanten vertrekken zonder dat je weet waarom", "Onbenut potentieel in bestaand klantcontact", "Geen structuur in opvolging en relatiebeheer", "Continu brandjes blussen in plaats van proactief werken", "Moeite met het bespreekbaar maken van meerwaarde", "Je team is betrokken, maar mist de commerciële vaardigheden"],
    }),
    makeContent(SLUG, "pain-points", "pain-points", "en", {
      eyebrow: "You're not in sales. But you're commercially crucial.",
      title: "You recognise this.",
      titleAccent: "And you want it to change.",
      points: ["Customers leave without you knowing why", "Untapped potential in existing customer interactions", "No structure in follow-up and relationship management", "Constantly firefighting instead of working proactively", "Difficulty discussing added value", "Your team is engaged, but lacks the commercial skills"],
    }),
    // ── Transformation ──
    makeContent(SLUG, "transformation", "transformation", "nl", {
      eyebrow: "De transformatie",
      title: "Klaar voor?",
      titleAccent: "Schuif en ontdek het verschil.",
      beforeLabel: "Voor de training",
      afterLabel: "Na de training",
      items: [
        { label: "Retentie", before: "Klanten vertrekken zonder dat je weet waarom", after: "Je ziet signalen vroeg en handelt proactief" },
        { label: "Klantcontact", before: "Onbenut potentieel in bestaand klantcontact", after: "Elk gesprek draagt bij aan groei en retentie" },
        { label: "Proces", before: "Geen structuur in opvolging en relatiebeheer", after: "Een helder proces van onboarding tot ambassadeur" },
        { label: "Werkwijze", before: "Continu brandjes blussen in plaats van proactief werken", after: "Rust en overzicht — je werkt vooruit, niet achteruit" },
        { label: "Waarde", before: "Moeite met het bespreekbaar maken van meerwaarde", after: "Je bespreekt waarde op een natuurlijke, ontspannen manier" },
        { label: "Team", before: "Je team is betrokken, maar mist de commerciële vaardigheden", after: "Iedereen weet hoe klantcontact bijdraagt aan commercieel succes" },
      ],
    }),
    makeContent(SLUG, "transformation", "transformation", "en", {
      eyebrow: "The transformation",
      title: "Ready?",
      titleAccent: "Slide and discover the difference.",
      beforeLabel: "Before training",
      afterLabel: "After training",
      items: [
        { label: "Retention", before: "Customers leave without you knowing why", after: "You spot signals early and act proactively" },
        { label: "Customer contact", before: "Untapped potential in existing customer interactions", after: "Every conversation contributes to growth and retention" },
        { label: "Process", before: "No structure in follow-up and relationship management", after: "A clear process from onboarding to ambassador" },
        { label: "Way of working", before: "Constantly firefighting instead of working proactively", after: "Calm and overview — you work ahead, not behind" },
        { label: "Value", before: "Difficulty discussing added value", after: "You discuss value in a natural, relaxed way" },
        { label: "Team", before: "Your team is engaged, but lacks the commercial skills", after: "Everyone knows how customer contact contributes to commercial success" },
      ],
    }),
    // ── Radar (Customer Experience Model) ──
    makeContent(SLUG, "radar", "radar", "nl", {
      eyebrow: "Customer Experience Model",
      title: "Van onzeker",
      titleAccent: "naar inzicht.",
      description: "Vooraf weet je niet precies waar je staat. Na de training heb je een helder beeld — met scores op zes gebieden en een persoonlijk actieplan.",
    }),
    makeContent(SLUG, "radar", "radar", "en", {
      eyebrow: "Customer Experience Model",
      title: "From uncertain",
      titleAccent: "to insight.",
      description: "Before the training you don't know exactly where you stand. Afterwards you have a clear picture — with scores on six areas and a personal action plan.",
    }),
    // ── Audiences ──
    makeContent(SLUG, "audiences", "audiences", "nl", {
      items: ["Customer Success Managers", "Supportteams", "Consultants", "Accountteams", "Delivery & service", "Projectmanagers"],
    }),
    makeContent(SLUG, "audiences", "audiences", "en", {
      items: ["Customer Success Managers", "Support teams", "Consultants", "Account teams", "Delivery & service", "Project managers"],
    }),
    // ── Program ──
    makeContent(SLUG, "program", "program", "nl", {
      price: "€ 2.250",
      modules: [
        { number: "01", title: "Jouw Rol in het Commerciële Geheel", description: "Begrijp hoe jouw klantcontact direct invloed heeft op omzet, retentie en ambassadeurschap. Je bent geen verkoper — maar wél onmisbaar." },
        { number: "02", title: "Oprechte Klantfocus", description: "Leer luisteren voorbij het oppervlak. Begrijp wat je klant écht nodig heeft en bouw relaties die verder gaan dan het project." },
        { number: "03", title: "Signalen Herkennen", description: "Klanten geven continu signalen — over tevredenheid, kansen en risico's. Leer ze herkennen en er ontspannen op acteren." },
        { number: "04", title: "Moeilijke Gesprekken Ontspannen Voeren", description: "Prijsverhogingen, verwachtingsmanagement, teleurstelling — leer hoe je lastige onderwerpen bespreekt zonder de relatie te beschadigen." },
        { number: "05", title: "Kansen Zien Zonder \"Te Verkopen\"", description: "Herken natuurlijke momenten om meerwaarde te bieden. Geen upsell-trucjes, maar oprechte suggesties die je klant verder helpen." },
        { number: "06", title: "Van Klant naar Ambassadeur", description: "Tevreden klanten zijn goed. Ambassadeurs zijn beter. Leer hoe je van klantcontact een groeimachine maakt voor je organisatie." },
      ],
    }),
    makeContent(SLUG, "program", "program", "en", {
      price: "€ 2,250",
      modules: [
        { number: "01", title: "Your Role in the Commercial Whole", description: "Understand how your customer interactions directly impact revenue, retention and advocacy. You're not a salesperson — but you are indispensable." },
        { number: "02", title: "Genuine Customer Focus", description: "Learn to listen beyond the surface. Understand what your customer truly needs and build relationships that go beyond the project." },
        { number: "03", title: "Recognising Signals", description: "Customers continuously give signals — about satisfaction, opportunities and risks. Learn to recognise them and act on them with ease." },
        { number: "04", title: "Handling Difficult Conversations with Ease", description: "Price increases, expectation management, disappointment — learn how to discuss difficult topics without damaging the relationship." },
        { number: "05", title: "Spotting Opportunities Without 'Selling'", description: "Recognise natural moments to offer added value. No upsell tricks, but genuine suggestions that help your customer move forward." },
        { number: "06", title: "From Customer to Ambassador", description: "Satisfied customers are good. Ambassadors are better. Learn how to turn customer contact into a growth engine for your organisation." },
      ],
    }),
    // ── Reviews ──
    makeContent(SLUG, "reviews", "reviews", "nl", {
      items: [
        { text: "Direct meer resultaat. Klaas maakt helder dat iedereen met klantcontact essentieel is voor commercieel succes — en geeft je de tools om dat waar te maken.", name: "Simon Kornblum", role: "Directeur Visma YouServe", avatar: "/images/reviews/simon-kornblum.jpg" },
        { text: "Echte sales begint bij wie je bént. Mindset, rust en oprechte intentie leiden tot verbinding. Een must voor wie klanten wil veranderen in fans.", name: "Michael Pilarczyk", role: "Oprichter MasterMind Academy", avatar: "/images/reviews/michael-pilarczyk.jpeg" },
        { text: "Dit boek gaat helemaal niet over sales. Het gaat over gedrag. Over hoe je oprechte verbinding maakt.", name: "Roderick Göttgens", role: "Oprichter Behavior Boost" },
      ],
    }),
    makeContent(SLUG, "reviews", "reviews", "en", {
      items: [
        { text: "Immediate results. Klaas makes clear that everyone with customer contact is essential for commercial success — and gives you the tools to make it happen.", name: "Simon Kornblum", role: "Director Visma YouServe", avatar: "/images/reviews/simon-kornblum.jpg" },
        { text: "Real sales starts with who you are. Mindset, calm and genuine intention lead to connection. A must for anyone who wants to turn customers into fans.", name: "Michael Pilarczyk", role: "Founder MasterMind Academy", avatar: "/images/reviews/michael-pilarczyk.jpeg" },
        { text: "This book isn't about sales at all. It's about behaviour. About how you create genuine connection.", name: "Roderick Göttgens", role: "Founder Behavior Boost" },
      ],
    }),
    // ── Pricing ──
    makeContent(SLUG, "pricing", "pricing", "nl", {
      guarantee: "10% beter in klanttevredenheid of geld terug — gemeten via het Customer Experience Model.",
      individual: {
        tiers: [
          { label: "Zelf studeren", title: "Online", price: "€ 2.250", priceNote: "Excl. BTW", description: "Flexibel en in eigen tempo. Start direct met de volledige online training.", features: ["6 modules online training", "Digitaal werkboek met opdrachten", "1 jaar toegang", "Inclusief bestseller boek", "Certificaat na afronding"], cta: "Direct starten", href: "/checkout/cst-online" },
          { label: "Meest gekozen", title: "Training + Coaching", price: "€ 3.750", priceNote: "Excl. BTW", description: "Alles van Online plus persoonlijke begeleiding van kick-off tot afronding.", features: ["Alles van Online", "Fysiek werkboek met opdrachten", "Persoonlijke kick-off sessie", "Presentatie met feedback van Klaas", "Actieplan op maat"], cta: "Training kopen", href: "/checkout/cst-coaching", featured: true },
        ],
      },
      team: {
        tiers: [
          { label: "Kleine teams", title: "Team Training", price: "€ 2.250", priceNote: "Per deelnemer · Excl. BTW · Vanaf 3 personen", description: "Dezelfde training, maar samen met je team. Inclusief gezamenlijke kick-off en teamgerichte oefeningen.", features: ["Alles van Training + Coaching", "Fysiek werkboek per deelnemer", "Gezamenlijke kick-off op locatie", "Groepspresentaties met live feedback", "Certificaat per deelnemer"], cta: "Neem contact op", href: "/contact", featured: true },
          { label: "Maatwerk", title: "Enterprise", price: "Op aanvraag", description: "Voor grotere organisaties. Volledig op maat, inclusief team-implementatie en persoonlijke coaching.", features: ["Alles van Team Training", "Op locatie of hybride", "Volledige team-implementatie", "Op maat voor jouw organisatie", "Persoonlijke coaching per deelnemer", "Managementrapportage"], cta: "Plan een gesprek", href: "/contact" },
        ],
      },
    }),
    makeContent(SLUG, "pricing", "pricing", "en", {
      guarantee: "10% better in customer satisfaction or your money back — measured via the Customer Experience Model.",
      individual: {
        tiers: [
          { label: "Self-study", title: "Online", price: "€ 2,250", priceNote: "Excl. VAT", description: "Flexible and at your own pace. Start immediately with the full online training.", features: ["6 modules online training", "Digital workbook with exercises", "1 year access", "Includes bestselling book", "Certificate upon completion"], cta: "Start now", href: "/checkout/cst-online" },
          { label: "Most popular", title: "Training + Coaching", price: "€ 3,750", priceNote: "Excl. VAT", description: "Everything from Online plus personal guidance from kick-off to completion.", features: ["Everything from Online", "Physical workbook with exercises", "Personal kick-off session", "Presentation with feedback from Klaas", "Custom action plan"], cta: "Buy training", href: "/checkout/cst-coaching", featured: true },
        ],
      },
      team: {
        tiers: [
          { label: "Small teams", title: "Team Training", price: "€ 2,250", priceNote: "Per participant · Excl. VAT · From 3 people", description: "The same training, but together with your team. Including joint kick-off and team-focused exercises.", features: ["Everything from Training + Coaching", "Physical workbook per participant", "Joint kick-off on location", "Group presentations with live feedback", "Certificate per participant"], cta: "Get in touch", href: "/contact", featured: true },
          { label: "Custom", title: "Enterprise", price: "On request", description: "For larger organisations. Fully customised, including team implementation and personal coaching.", features: ["Everything from Team Training", "On location or hybrid", "Full team implementation", "Tailored to your organisation", "Personal coaching per participant", "Management reporting"], cta: "Schedule a call", href: "/contact" },
        ],
      },
    }),
    // ── Cross-link ──
    makeContent(SLUG, "cross-link", "cross-link", "nl", {
      eyebrow: "Ook interessant",
      title: "Sales Excellence Training.",
      titleAccent: "Meer omzet, minder stress.",
      description: "Voor verkopers en salesteams die weten dat er meer in zit. Leer hoe je met oprechtheid en ontspanning structureel beter verkoopt.",
      image: "/images/hero/sales-excellence-group.jpeg",
      imageAlt: "Deelnemers van de Sales Excellence Training met certificaten",
      href: "/sales-excellence-training",
      ctaLabel: "Bekijk training",
      dark: "true",
    }),
    makeContent(SLUG, "cross-link", "cross-link", "en", {
      eyebrow: "Also interesting",
      title: "Sales Excellence Training.",
      titleAccent: "More revenue, less stress.",
      description: "For sales professionals and teams who know there is more potential. Learn how to sell structurally better with authenticity and ease.",
      image: "/images/hero/sales-excellence-group.jpeg",
      imageAlt: "Participants of the Sales Excellence Training with certificates",
      href: "/sales-excellence-training",
      ctaLabel: "View training",
      dark: "true",
    }),
    // ── FAQ ──
    makeContent(SLUG, "faq", "faq", "nl", {
      title: "Nog vragen?",
      titleAccent: "We helpen je graag.",
      items: [
        { question: "Moet ik een salesachtergrond hebben?", answer: "Nee, juist niet. Deze training is specifiek ontworpen voor mensen zónder salesfunctie die wél klantcontact hebben: customer success managers, servicedesks, accountmanagers en consultants." },
        { question: "Hoe lang duurt de training?", answer: "De online training bestaat uit 6 modules die je in je eigen tempo doorloopt. Gemiddeld ben je 6 tot 8 weken bezig. Bij de variant met coaching krijg je daarnaast persoonlijke begeleiding." },
        { question: "Wat als het niet werkt voor mij?", answer: "We bieden een 10% resultaatgarantie. Als je na het volledig doorlopen van de training niet minimaal 10% verbetering ervaart in klanttevredenheid of retentie, krijg je je geld terug." },
        { question: "Kan ik de training ook voor mijn team inkopen?", answer: "Ja, we bieden een incompany variant aan op maat. Met teamgerichte oefeningen, klantcasussen uit jullie praktijk en begeleiding tijdens implementatie. Neem contact op voor een voorstel." },
        { question: "Krijg ik direct toegang na aankoop?", answer: "Ja, je ontvangt direct na betaling een e-mail met je inloggegevens. Je kunt meteen beginnen met de eerste module." },
        { question: "Wat is het verschil met de Sales Excellence Training?", answer: "Sales Excellence is gericht op het binnenhalen van nieuwe klanten. Customer Success draait om het behouden en laten groeien van bestaande klanten. Samen vormen ze één methode voor commerciële groei." },
      ],
    }),
    makeContent(SLUG, "faq", "faq", "en", {
      title: "Questions?",
      titleAccent: "We're happy to help.",
      items: [
        { question: "Do I need a sales background?", answer: "No, quite the opposite. This training is specifically designed for people without a sales role who do have customer contact: customer success managers, service desks, account managers and consultants." },
        { question: "How long does the training take?", answer: "The online training consists of 6 modules you complete at your own pace. On average it takes 6 to 8 weeks. The coaching variant includes personal guidance alongside." },
        { question: "What if it doesn't work for me?", answer: "We offer a 10% results guarantee. If after completing the full training you don't experience at least 10% improvement in customer satisfaction or retention, you get your money back." },
        { question: "Can I purchase the training for my team?", answer: "Yes, we offer a customised in-company variant. With team-focused exercises, customer cases from your own practice and guidance during implementation. Get in touch for a proposal." },
        { question: "Do I get immediate access after purchase?", answer: "Yes, you receive an email with your login details immediately after payment. You can start with the first module right away." },
        { question: "What is the difference with the Sales Excellence Training?", answer: "Sales Excellence focuses on winning new customers. Customer Success is about retaining and growing existing customers. Together they form one method for commercial growth." },
      ],
    }),
    // ── CTA ──
    makeContent(SLUG, "cta", "cta", "nl", {
      title: "Start vandaag.",
      titleAccent: "Oprecht & ontspannen.",
      description: "Hogere klanttevredenheid, meer retentie en klanten die ambassadeur worden. Zonder verkoopdruk.",
      href: "#pricing",
    }),
    makeContent(SLUG, "cta", "cta", "en", {
      title: "Start today.",
      titleAccent: "Genuine & relaxed.",
      description: "Higher customer satisfaction, more retention and customers who become ambassadors. Without sales pressure.",
      href: "#pricing",
    }),
  ];

  return {
    slug: SLUG,
    title: { nl: "Customer Success Training", en: "Customer Success Training" },
    sections,
    content,
  };
}
