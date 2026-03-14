import { SITE, SITE_URL, PAGES, PRODUCTS } from "@/lib/site-config";

export const dynamic = "force-static";

export function GET() {
  const activeProducts = PRODUCTS.filter((p) => p.active);
  const llmsPages = PAGES.filter((p) => p.llms);

  const trainings = activeProducts.filter((p) => p.type === "training");
  const books = activeProducts.filter((p) => p.type === "book");
  const services = activeProducts.filter((p) => p.type === "service");

  const lines: string[] = [
    `# ${SITE.name}`,
    `> ${SITE.description}`,
    "",
    `- Website: ${SITE_URL}`,
    `- Taal: Nederlands`,
    `- Contact: ${SITE.email}`,
    "",
    "## Over",
    "",
    `${SITE.name} helpt sales professionals, teams en organisaties om beter te verkopen — oprecht en ontspannen. Geen trucjes, geen scripts, maar een bewezen aanpak gebaseerd op 25+ jaar internationale ervaring bij bedrijven als Google, Samsung, Microsoft, ING en Vodafone.`,
    "",
    "## Pagina's",
    "",
    ...llmsPages.map(
      (p) => `- [${p.title}](${SITE_URL}${p.path}): ${p.description}`
    ),
    "",
  ];

  if (trainings.length > 0) {
    lines.push("## Trainingen", "");
    for (const t of trainings) {
      const price = t.price
        ? `${t.price}${t.priceNote ? ` (${t.priceNote})` : ""}`
        : "";
      lines.push(`### ${t.name}`);
      lines.push(t.description);
      if (price) lines.push(`Prijs: ${price}`);
      lines.push(`Meer info: ${SITE_URL}${t.path}`);
      lines.push("");
    }
  }

  if (books.length > 0) {
    lines.push("## Boeken", "");
    for (const b of books) {
      lines.push(`### ${b.name}`);
      lines.push(b.description);
      if (b.price) lines.push(`Prijs: ${b.price}`);
      lines.push(`Meer info: ${SITE_URL}${b.path}`);
      lines.push("");
    }
  }

  if (services.length > 0) {
    lines.push("## Diensten", "");
    for (const s of services) {
      lines.push(`### ${s.name}`);
      lines.push(s.description);
      if (s.price) lines.push(`Prijs: ${s.price}`);
      lines.push(`Meer info: ${SITE_URL}${s.path}`);
      lines.push("");
    }
  }

  lines.push(
    "## Doelgroepen",
    "",
    "- Sales professionals en accountmanagers",
    "- Customer success managers en servicedesks",
    "- Salesteams en directeuren",
    "- Ondernemers en consultants",
    "- Conferentie-organisatoren (spreker/keynote)",
    "",
    "## Kernwaarden",
    "",
    "- Oprecht: geen trucjes, geen scripts, authentiek contact",
    "- Ontspannen: verkopen zonder druk, vanuit vertrouwen",
    "- Bewezen: 9.1 gemiddelde beoordeling, 25+ jaar ervaring",
    "- Resultaatgarantie: 10% beter of geld terug",
    ""
  );

  const body = lines.join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
