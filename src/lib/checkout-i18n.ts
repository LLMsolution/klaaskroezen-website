export type Lang = "nl" | "en";

const translations = {
  nl: {
    // Steps
    step1: "Stap 1",
    step2: "Stap 2",
    yourDetails: "Jouw gegevens",
    payment: "Betaling",
    almostThere: "Je bent er bijna",

    // Form fields
    firstName: "Voornaam",
    lastName: "Achternaam",
    email: "E-mailadres",
    country: "Land",
    companyName: "Bedrijfsnaam",
    vatNumber: "BTW-nummer",
    kvkNumber: "KVK-nummer",
    phone: "Telefoonnummer",

    // Placeholders
    firstNamePlaceholder: "Je voornaam",
    lastNamePlaceholder: "Je achternaam",
    emailPlaceholder: "naam@bedrijf.nl",
    companyPlaceholder: "Bedrijfsnaam",
    vatPlaceholder: "NL123456789B01",
    kvkPlaceholder: "12345678",
    phonePlaceholder: "+31 6 12345678",
    selectCountry: "Selecteer een land",

    // Toggles
    businessPurchase: "Zakelijke aankoop",
    payInInstallments: "Betaal in termijnen",
    installmentsOf: "termijnen van",

    // Auth
    orLoginWith: "Log snel in met",
    loggedInAs: "Ingelogd als",
    continueAsGuest: "Ga verder zonder account",

    // Order summary
    orderSummary: "Samenvatting",
    subtotal: "Subtotaal",
    btw: "BTW",
    btwReversed: "BTW verlegd",
    noBtw: "Geen BTW",
    total: "Totaal",
    exBtw: "Excl. BTW",
    inclBtw: "Incl. BTW",

    // Bumps
    addToOrder: "Voeg toe aan je bestelling",
    bumpCta: "JA! Voeg toe voor slechts",
    normalPrice: "Normaal",
    onlyHere: "Alleen beschikbaar op deze pagina",

    // Payment
    paymentMethod: "Betaalmethode",
    ideal: "iDEAL",
    creditCard: "Creditcard",
    applePay: "Apple Pay",
    moreOptions: "Meer betaalopties",

    // CTA
    payNow: "Afrekenen",
    enrollNow: "Schrijf je nu in",
    orderNow: "Bestel nu",
    processing: "Verwerken...",

    // Trust
    guarantee: "30 dagen niet-goed-geld-terug garantie",
    guaranteeSub: "Niet tevreden? Binnen 30 dagen je geld terug — geen vragen, geen gedoe.",
    securePayment: "Beveiligde betaling via Mollie",
    secureSsl: "256-bit SSL beveiligd",

    // Social proof
    peopleViewing: "mensen bekijken deze pagina nu",
    recentPurchase: "kocht dit",
    minutesAgo: "minuten geleden",
    hoursAgo: "uur geleden",
    totalTrained: "sales professionals getraind",
    totalSold: "exemplaren verkocht",

    // Exit intent
    exitTitle: "Wacht — ga je weg?",
    exitBody: "Wist je dat je 30 dagen bedenktijd hebt? Geen risico.",
    exitCta: "Toch bestellen",
    exitDismiss: "Nee bedankt",

    // Thank you
    thankYouTitle: "Bedankt voor je bestelling!",
    thankYouSub: "We hebben een bevestigingsmail gestuurd naar",
    checkInbox: "Check je inbox voor de details.",

    // Errors
    required: "Dit veld is verplicht",
    invalidEmail: "Voer een geldig e-mailadres in",
    invalidVat: "Voer een geldig BTW-nummer in",
    paymentFailed: "Betaling mislukt. Probeer het opnieuw.",
    genericError: "Er ging iets mis. Probeer het opnieuw.",

    // Countries (subset)
    countries: {
      NL: "Nederland",
      BE: "België",
      DE: "Duitsland",
      FR: "Frankrijk",
      GB: "Verenigd Koninkrijk",
      US: "Verenigde Staten",
      AT: "Oostenrijk",
      CH: "Zwitserland",
      ES: "Spanje",
      IT: "Italië",
      SE: "Zweden",
      DK: "Denemarken",
      NO: "Noorwegen",
      FI: "Finland",
      PL: "Polen",
      CZ: "Tsjechië",
      IE: "Ierland",
      PT: "Portugal",
      LU: "Luxemburg",
      OTHER: "Ander land",
    },
  },
  en: {
    step1: "Step 1",
    step2: "Step 2",
    yourDetails: "Your details",
    payment: "Payment",
    almostThere: "You're almost there",

    firstName: "First name",
    lastName: "Last name",
    email: "Email address",
    country: "Country",
    companyName: "Company name",
    vatNumber: "VAT number",
    kvkNumber: "Registration number",
    phone: "Phone number",

    firstNamePlaceholder: "Your first name",
    lastNamePlaceholder: "Your last name",
    emailPlaceholder: "name@company.com",
    companyPlaceholder: "Company name",
    vatPlaceholder: "NL123456789B01",
    kvkPlaceholder: "12345678",
    phonePlaceholder: "+31 6 12345678",
    selectCountry: "Select a country",

    businessPurchase: "Business purchase",
    payInInstallments: "Pay in installments",
    installmentsOf: "installments of",

    orLoginWith: "Quickly log in with",
    loggedInAs: "Logged in as",
    continueAsGuest: "Continue without account",

    orderSummary: "Summary",
    subtotal: "Subtotal",
    btw: "VAT",
    btwReversed: "VAT reverse charged",
    noBtw: "No VAT",
    total: "Total",
    exBtw: "Excl. VAT",
    inclBtw: "Incl. VAT",

    addToOrder: "Add to your order",
    bumpCta: "YES! Add for just",
    normalPrice: "Normally",
    onlyHere: "Only available on this page",

    paymentMethod: "Payment method",
    ideal: "iDEAL",
    creditCard: "Credit card",
    applePay: "Apple Pay",
    moreOptions: "More payment options",

    payNow: "Pay now",
    enrollNow: "Enroll now",
    orderNow: "Order now",
    processing: "Processing...",

    guarantee: "30-day money-back guarantee",
    guaranteeSub: "Not satisfied? Get your money back within 30 days — no questions asked.",
    securePayment: "Secure payment via Mollie",
    secureSsl: "256-bit SSL secured",

    peopleViewing: "people are viewing this page right now",
    recentPurchase: "purchased this",
    minutesAgo: "minutes ago",
    hoursAgo: "hours ago",
    totalTrained: "sales professionals trained",
    totalSold: "copies sold",

    exitTitle: "Wait — leaving already?",
    exitBody: "Did you know you have a 30-day money-back guarantee? Zero risk.",
    exitCta: "Complete my order",
    exitDismiss: "No thanks",

    thankYouTitle: "Thank you for your order!",
    thankYouSub: "We've sent a confirmation email to",
    checkInbox: "Check your inbox for the details.",

    required: "This field is required",
    invalidEmail: "Please enter a valid email address",
    invalidVat: "Please enter a valid VAT number",
    paymentFailed: "Payment failed. Please try again.",
    genericError: "Something went wrong. Please try again.",

    countries: {
      NL: "Netherlands",
      BE: "Belgium",
      DE: "Germany",
      FR: "France",
      GB: "United Kingdom",
      US: "United States",
      AT: "Austria",
      CH: "Switzerland",
      ES: "Spain",
      IT: "Italy",
      SE: "Sweden",
      DK: "Denmark",
      NO: "Norway",
      FI: "Finland",
      PL: "Poland",
      CZ: "Czech Republic",
      IE: "Ireland",
      PT: "Portugal",
      LU: "Luxembourg",
      OTHER: "Other country",
    },
  },
} as const;

export type TranslationKey = keyof (typeof translations)["nl"];

export function t(lang: Lang) {
  return translations[lang];
}

export function detectLang(searchParams: { lang?: string }): Lang {
  if (searchParams.lang === "en") return "en";
  return "nl";
}
