export type Lang = "nl" | "en" | "de";

const translations = {
  nl: {
    // Steps
    step1: "Stap 1",
    step2: "Stap 2",
    yourDetails: "Jouw gegevens",
    payment: "Betaling",
    almostThere: "Verder naar betaling",

    // Form fields
    firstName: "Voornaam",
    lastName: "Achternaam",
    email: "E-mailadres",
    country: "Land",
    companyName: "Bedrijfsnaam",
    companyWebsite: "Website",
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
    phoneOptional: "Optioneel",
    selectCountry: "Selecteer een land",
    street: "Straat",
    streetPlaceholder: "Straatnaam",
    houseNumber: "Huisnr.",
    houseNumberPlaceholder: "Nr.",
    postalCode: "Postcode",
    postalCodePlaceholder: "1234 AB",
    city: "Plaats",
    cityPlaceholder: "Amsterdam",
    shippingAddress: "Bezorgadres",

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
    bumpCta: "Voeg toe voor slechts",
    normalPrice: "Normaal",
    onlyHere: "Alleen beschikbaar op deze pagina",

    // Payment
    paymentMethod: "Betaalmethode",
    ideal: "iDEAL",
    creditCard: "Creditcard / Apple Pay",
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
    exitTitle: "Wacht, ga je weg?",
    exitBody: "Wist je dat je 30 dagen bedenktijd hebt? Geen risico.",
    exitCta: "Toch bestellen",
    exitDismiss: "Nee bedankt",

    // Thank you
    thankYouTitle: "Bedankt voor je bestelling!",
    thankYouSub: "We hebben een bevestigingsmail gestuurd naar",
    checkInbox: "Check je inbox voor de details.",

    // Discount
    discountToggle: "Ik heb een kortingscode",
    discountPlaceholder: "Voer code in",
    discountApply: "Toepassen",
    discountApplied: "Korting toegepast",
    discountInvalid: "Ongeldige code",
    discountExpired: "Code verlopen",
    discountMaxed: "Code is maximaal gebruikt",
    discountWrongProduct: "Code geldt niet voor dit product",

    // Urgency
    directAccess: "Direct toegang na betaling",
    secureCheckout: "Beveiligde checkout",

    // Legal
    agreeTerms: "Ik ga akkoord met de",
    termsLink: "algemene voorwaarden",
    agreeTermsRequired: "Je moet akkoord gaan met de algemene voorwaarden",
    mailingOptIn: "Ja, houd me op de hoogte van tips en aanbiedingen",
    digitalWaiver: "Ik bevestig dat ik per direct toegang wil tot dit digitale product en ga ermee akkoord dat mijn herroepingsrecht hiermee vervalt.",
    digitalWaiverRequired: "Bevestig dat je per direct toegang wilt",
    nlOnlyShipping: "Verzending alleen binnen Nederland — neem contact op voor andere landen.",
    invalidPostalCode: "Voer een geldige Nederlandse postcode in (bijv. 1234 AB).",

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
    almostThere: "Proceed to payment",

    firstName: "First name",
    lastName: "Last name",
    email: "Email address",
    country: "Country",
    companyName: "Company name",
    companyWebsite: "Website",
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
    phoneOptional: "Optional",
    selectCountry: "Select a country",
    street: "Street",
    streetPlaceholder: "Street name",
    houseNumber: "No.",
    houseNumberPlaceholder: "No.",
    postalCode: "Postal code",
    postalCodePlaceholder: "1234 AB",
    city: "City",
    cityPlaceholder: "Amsterdam",
    shippingAddress: "Shipping address",

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
    bumpCta: "Add for just",
    normalPrice: "Normally",
    onlyHere: "Only available on this page",

    paymentMethod: "Payment method",
    ideal: "iDEAL",
    creditCard: "Credit card / Apple Pay",
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

    exitTitle: "Wait, leaving already?",
    exitBody: "Did you know you have a 30-day money-back guarantee? Zero risk.",
    exitCta: "Complete my order",
    exitDismiss: "No thanks",

    thankYouTitle: "Thank you for your order!",
    thankYouSub: "We've sent a confirmation email to",
    checkInbox: "Check your inbox for the details.",

    discountToggle: "I have a discount code",
    discountPlaceholder: "Enter code",
    discountApply: "Apply",
    discountApplied: "Discount applied",
    discountInvalid: "Invalid code",
    discountExpired: "Code expired",
    discountMaxed: "Code has reached its maximum uses",
    discountWrongProduct: "Code is not valid for this product",

    directAccess: "Instant access after payment",
    secureCheckout: "Secure checkout",

    agreeTerms: "I agree to the",
    termsLink: "terms and conditions",
    agreeTermsRequired: "You must agree to the terms and conditions",
    mailingOptIn: "Yes, keep me updated with tips and offers",
    digitalWaiver: "I confirm that I want immediate access to this digital product and agree that my right of withdrawal expires.",
    digitalWaiverRequired: "Confirm that you want immediate access",
    nlOnlyShipping: "Shipping is only available within the Netherlands — please contact us for other countries.",
    invalidPostalCode: "Please enter a valid Dutch postal code (e.g. 1234 AB).",

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
  de: {
    step1: "Schritt 1",
    step2: "Schritt 2",
    yourDetails: "Ihre Daten",
    payment: "Zahlung",
    almostThere: "Weiter zur Zahlung",

    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail-Adresse",
    country: "Land",
    companyName: "Firmenname",
    companyWebsite: "Webseite",
    vatNumber: "USt-IdNr.",
    kvkNumber: "Handelsregisternr.",
    phone: "Telefonnummer",

    firstNamePlaceholder: "Ihr Vorname",
    lastNamePlaceholder: "Ihr Nachname",
    emailPlaceholder: "name@unternehmen.de",
    companyPlaceholder: "Firmenname",
    vatPlaceholder: "DE123456789",
    kvkPlaceholder: "HRB 12345",
    phonePlaceholder: "+49 170 1234567",
    phoneOptional: "Optional",
    selectCountry: "Land ausw\u00e4hlen",
    street: "Stra\u00dfe",
    streetPlaceholder: "Stra\u00dfenname",
    houseNumber: "Nr.",
    houseNumberPlaceholder: "Nr.",
    postalCode: "Postleitzahl",
    postalCodePlaceholder: "12345",
    city: "Ort",
    cityPlaceholder: "Berlin",
    shippingAddress: "Lieferadresse",

    businessPurchase: "Gesch\u00e4ftlicher Kauf",
    payInInstallments: "In Raten zahlen",
    installmentsOf: "Raten von",

    orLoginWith: "Schnell anmelden mit",
    loggedInAs: "Angemeldet als",
    continueAsGuest: "Ohne Konto fortfahren",

    orderSummary: "Zusammenfassung",
    subtotal: "Zwischensumme",
    btw: "MwSt.",
    btwReversed: "MwSt. verlagert",
    noBtw: "Keine MwSt.",
    total: "Gesamt",
    exBtw: "Zzgl. MwSt.",
    inclBtw: "Inkl. MwSt.",

    addToOrder: "Zu Ihrer Bestellung hinzuf\u00fcgen",
    bumpCta: "Hinzuf\u00fcgen f\u00fcr nur",
    normalPrice: "Normalerweise",
    onlyHere: "Nur auf dieser Seite verf\u00fcgbar",

    paymentMethod: "Zahlungsmethode",
    ideal: "iDEAL",
    creditCard: "Kreditkarte / Apple Pay",
    applePay: "Apple Pay",
    moreOptions: "Weitere Zahlungsoptionen",

    payNow: "Jetzt bezahlen",
    enrollNow: "Jetzt anmelden",
    orderNow: "Jetzt bestellen",
    processing: "Wird verarbeitet...",

    guarantee: "30-Tage-Geld-zur\u00fcck-Garantie",
    guaranteeSub: "Nicht zufrieden? Innerhalb von 30 Tagen Ihr Geld zur\u00fcck \u2014 ohne Wenn und Aber.",
    securePayment: "Sichere Zahlung \u00fcber Mollie",
    secureSsl: "256-Bit-SSL-gesichert",

    peopleViewing: "Personen sehen sich diese Seite gerade an",
    recentPurchase: "hat dies gekauft",
    minutesAgo: "Minuten her",
    hoursAgo: "Stunden her",
    totalTrained: "Vertriebsprofis geschult",
    totalSold: "Exemplare verkauft",

    exitTitle: "Warten, gehen Sie schon?",
    exitBody: "Wussten Sie, dass Sie eine 30-Tage-Geld-zur\u00fcck-Garantie haben? Null Risiko.",
    exitCta: "Bestellung abschlie\u00dfen",
    exitDismiss: "Nein danke",

    thankYouTitle: "Vielen Dank f\u00fcr Ihre Bestellung!",
    thankYouSub: "Wir haben eine Best\u00e4tigungs-E-Mail gesendet an",
    checkInbox: "Pr\u00fcfen Sie Ihren Posteingang f\u00fcr die Details.",

    discountToggle: "Ich habe einen Rabattcode",
    discountPlaceholder: "Code eingeben",
    discountApply: "Anwenden",
    discountApplied: "Rabatt angewendet",
    discountInvalid: "Ung\u00fcltiger Code",
    discountExpired: "Code abgelaufen",
    discountMaxed: "Code wurde bereits maximal verwendet",
    discountWrongProduct: "Code gilt nicht f\u00fcr dieses Produkt",

    directAccess: "Sofortiger Zugang nach Zahlung",
    secureCheckout: "Sichere Kaufabwicklung",

    agreeTerms: "Ich stimme den",
    termsLink: "Allgemeinen Gesch\u00e4ftsbedingungen zu",
    agreeTermsRequired: "Sie m\u00fcssen den Allgemeinen Gesch\u00e4ftsbedingungen zustimmen",
    mailingOptIn: "Ja, halten Sie mich mit Tipps und Angeboten auf dem Laufenden",
    digitalWaiver: "Ich best\u00e4tige, dass ich sofortigen Zugang zu diesem digitalen Produkt m\u00f6chte, und stimme zu, dass mein Widerrufsrecht damit erlischt.",
    digitalWaiverRequired: "Best\u00e4tigen Sie, dass Sie sofortigen Zugang w\u00fcnschen",
    nlOnlyShipping: "Versand nur innerhalb der Niederlande \u2014 bitte kontaktieren Sie uns f\u00fcr andere L\u00e4nder.",
    invalidPostalCode: "Bitte geben Sie eine g\u00fcltige niederl\u00e4ndische Postleitzahl ein (z.B. 1234 AB).",

    required: "Dieses Feld ist erforderlich",
    invalidEmail: "Bitte geben Sie eine g\u00fcltige E-Mail-Adresse ein",
    invalidVat: "Bitte geben Sie eine g\u00fcltige USt-IdNr. ein",
    paymentFailed: "Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    genericError: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",

    countries: {
      NL: "Niederlande",
      BE: "Belgien",
      DE: "Deutschland",
      FR: "Frankreich",
      GB: "Vereinigtes K\u00f6nigreich",
      US: "Vereinigte Staaten",
      AT: "\u00d6sterreich",
      CH: "Schweiz",
      ES: "Spanien",
      IT: "Italien",
      SE: "Schweden",
      DK: "D\u00e4nemark",
      NO: "Norwegen",
      FI: "Finnland",
      PL: "Polen",
      CZ: "Tschechien",
      IE: "Irland",
      PT: "Portugal",
      LU: "Luxemburg",
      OTHER: "Anderes Land",
    },
  },
} as const;

export type TranslationKey = keyof (typeof translations)["nl"];

export function t(lang: Lang) {
  return translations[lang];
}

export function detectLang(searchParams: { lang?: string }): Lang {
  if (searchParams.lang === "en") return "en";
  if (searchParams.lang === "de") return "de";
  return "nl";
}
