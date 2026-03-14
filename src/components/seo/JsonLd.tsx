interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Klaas Kroezen",
  url: "https://www.klaaskroezen.com",
  logo: "https://www.klaaskroezen.com/images/hero/og-image.jpeg",
  description:
    "Sales- en Customer Success trainingen. Oprecht en ontspannen verkopen — geen trucjes, geen scripts.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Oude Parklaan 111",
    addressLocality: "Castricum",
    postalCode: "1901 ZL",
    addressCountry: "NL",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+31618098906",
    contactType: "customer service",
    availableLanguage: ["Dutch", "English"],
  },
  sameAs: [
    "https://www.linkedin.com/in/klaaskroezen/",
    "https://www.instagram.com/klaaskroezen/",
    "https://www.youtube.com/@klaaskroezen",
  ],
};

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Klaas Kroezen",
  jobTitle: "Sales & Customer Success Trainer",
  url: "https://www.klaaskroezen.com",
  image: "https://www.klaaskroezen.com/images/about/klaas-kroezen-portrait.jpeg",
  description:
    "Trainer, spreker en auteur. 25+ jaar internationale ervaring in sales en klantgerichtheid bij Google, Samsung, Microsoft, ING en Vodafone.",
  worksFor: {
    "@type": "Organization",
    name: "Klaas Kroezen",
  },
  sameAs: [
    "https://www.linkedin.com/in/klaaskroezen/",
    "https://www.instagram.com/klaaskroezen/",
    "https://www.youtube.com/@klaaskroezen",
  ],
};

export function courseJsonLd(options: {
  name: string;
  description: string;
  url: string;
  price?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: options.name,
    description: options.description,
    url: options.url,
    provider: {
      "@type": "Organization",
      name: "Klaas Kroezen",
      url: "https://www.klaaskroezen.com",
    },
    instructor: {
      "@type": "Person",
      name: "Klaas Kroezen",
    },
    inLanguage: "nl",
    ...(options.price && {
      offers: {
        "@type": "Offer",
        price: options.price,
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
      },
    }),
  };
}

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Klaas Kroezen",
  url: "https://www.klaaskroezen.com",
  description:
    "Sales- en Customer Success trainingen. Oprecht en ontspannen verkopen — geen trucjes, geen scripts.",
  inLanguage: "nl",
  publisher: {
    "@type": "Organization",
    name: "Klaas Kroezen",
    url: "https://www.klaaskroezen.com",
  },
};

export const speakerServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Spreker & Keynote — Klaas Kroezen",
  description:
    "Inspirerende keynotes en workshops over sales, klantgerichtheid en commerciële groei. Van 30 minuten tot een volledige dag.",
  url: "https://www.klaaskroezen.com/spreker",
  provider: {
    "@type": "Person",
    name: "Klaas Kroezen",
    url: "https://www.klaaskroezen.com",
  },
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: 52.3676,
      longitude: 4.9041,
    },
    geoRadius: "500",
  },
  serviceType: "Keynote spreker / Workshop facilitator",
};

export const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact — Klaas Kroezen",
  description:
    "Neem contact op met Klaas Kroezen voor trainingen, coaching of een keynote.",
  url: "https://www.klaaskroezen.com/contact",
  mainEntity: {
    "@type": "Organization",
    name: "Klaas Kroezen",
    email: "info@klaaskroezen.com",
    telephone: "+31618098906",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Oude Parklaan 111",
      addressLocality: "Castricum",
      postalCode: "1901 ZL",
      addressCountry: "NL",
    },
  },
};

export const bookJsonLd = {
  "@context": "https://schema.org",
  "@type": "Book",
  name: "Sales, Oprecht en Ontspannen",
  author: {
    "@type": "Person",
    name: "Klaas Kroezen",
  },
  description:
    "Het boek over verkopen vanuit verbinding. Meer omzet, minder stress.",
  url: "https://www.klaaskroezen.com/boek",
  inLanguage: "nl",
  bookFormat: "https://schema.org/Hardcover",
  offers: [
    {
      "@type": "Offer",
      price: "32.50",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    {
      "@type": "Offer",
      price: "22.50",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      description: "E-book",
    },
    {
      "@type": "Offer",
      price: "22.50",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      description: "Luisterboek",
    },
  ],
};
