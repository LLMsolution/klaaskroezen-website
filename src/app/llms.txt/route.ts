import { SITE, SITE_URL, PAGES, PRODUCTS } from "@/lib/site-config";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const activeProducts = PRODUCTS.filter((p) => p.active);
  const llmsPages = PAGES.filter((p) => p.llms);

  const trainings = activeProducts.filter((p) => p.type === "training");
  const books = activeProducts.filter((p) => p.type === "book");
  const services = activeProducts.filter((p) => p.type === "service");

  // Fetch dynamic content from Convex
  let blogPosts: Array<{ slug: string; title: string; excerpt: string }> = [];
  let trainingList: Array<{ slug: string; title: { nl: string }; description: { nl: string } }> = [];
  try {
    const result = await fetchQuery(api.blog.listPublished, { lang: "nl", limit: 20 });
    blogPosts = (result?.posts ?? [])
      .filter((p: Record<string, unknown>) => !(p.sourcePostId))
      .slice(0, 20)
      .map((p: Record<string, unknown>) => ({
        slug: p.slug as string,
        title: p.title as string,
        excerpt: p.excerpt as string,
      }));
    const tAll = await fetchQuery(api.trainings.listActive, {});
    trainingList = (tAll ?? []).map((t: Record<string, unknown>) => ({
      slug: t.slug as string,
      title: t.title as { nl: string },
      description: t.description as { nl: string },
    }));
  } catch {
    // Convex not available — continue with static content only
  }

  const lines: string[] = [
    `# ${SITE.name}`,
    `> ${SITE.description}`,
    "",
    `- Website: ${SITE_URL}`,
    `- Taal: Nederlands, Engels, Duits`,
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

  // Dynamic training modules
  if (trainingList.length > 0) {
    lines.push("## Trainingsplatform", "");
    for (const t of trainingList) {
      lines.push(`- [${t.title.nl}](${SITE_URL}/training/${t.slug}): ${t.description.nl}`);
    }
    lines.push("");
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

  // Dynamic blog posts
  if (blogPosts.length > 0) {
    lines.push("## Recente artikelen", "");
    for (const p of blogPosts) {
      lines.push(`- [${p.title}](${SITE_URL}/nieuws/${p.slug}): ${p.excerpt}`);
    }
    lines.push("");
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
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
