/**
 * Shared email layout, HTML helpers, and cross-sell components.
 * Used by emailTemplates.ts (branded templates) and emails.ts (transactional builders).
 */

export const COPPER = "#B5622A";
export const INK = "#0E0C0A";
export const WARM = "#EDE9E2";
export const SITE_URL = process.env.SITE_URL ?? "https://www.klaaskroezen.nl";
export const BOOK_COVER_URL = `${SITE_URL}/images/book/sales-oprecht-ontspannen-cover.png`;

export type CrossSellContext = "book" | "training" | "cst" | "general" | "none";

type LayoutOptions = {
  preheader?: string;
  crossSell?: CrossSellContext;
  lang?: "nl" | "en" | "de";
};

/**
 * Responsive email layout.
 * Desktop: white card on beige background with generous padding.
 * Mobile (<620px): full-width, no card effect, compact padding.
 * Accepts string (preheader only) or options object for backward compat.
 */
export function layout(content: string, options?: string | LayoutOptions): string {
  const opts: LayoutOptions = typeof options === "string"
    ? { preheader: options }
    : (options ?? {});
  const { preheader, crossSell = "general", lang = "nl" } = opts;
  const crossSellHtml = crossSell !== "none" ? crossSellBlock(crossSell, lang) : "";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Klaas Kroezen</title>
<style>
  @media only screen and (max-width: 620px) {
    .eo { padding: 0 !important; background-color: #ffffff !important; }
    .ec { border-radius: 0 !important; }
    .eh { padding: 20px 20px 16px !important; }
    .em { padding: 24px 20px !important; }
    .ef { padding: 16px 20px 24px !important; }
    .ex { padding: 20px !important; }
    .eb { padding: 14px 28px !important; font-size: 13px !important; }
  }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f2ed; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${INK}; -webkit-font-smoothing: antialiased;">
${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #f5f2ed;">${preheader}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f2ed;">
<tr><td class="eo" align="center" style="padding: 40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" class="ec" style="background-color: #ffffff; border-radius: 2px; overflow: hidden; max-width: 600px; width: 100%;">

<!-- Header -->
<tr><td class="eh" style="padding: 28px 40px 20px; text-align: center; border-bottom: 1px solid ${WARM};">
  <a href="${SITE_URL}" style="font-family: Georgia, 'Times New Roman', serif; font-size: 18px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; color: ${INK}; text-decoration: none;">KLAAS KROEZEN</a>
</td></tr>

<!-- Content -->
<tr><td class="em" style="padding: 40px 40px 32px;">
${content}
</td></tr>
${crossSellHtml ? `
<!-- Cross-sell -->
<tr><td class="ex" style="padding: 24px 40px 20px; border-top: 1px solid ${WARM}; background-color: #faf8f5;">
${crossSellHtml}
</td></tr>` : ""}

<!-- Footer -->
<tr><td class="ef" style="padding: 24px 40px 32px; border-top: 1px solid ${WARM}; text-align: center;">
  <p style="margin: 0 0 8px; font-size: 13px; color: #999;">
    <a href="${SITE_URL}/sales-excellence-training" style="color: #999; text-decoration: none;">Trainingen</a> &nbsp;&middot;&nbsp;
    <a href="${SITE_URL}/boek" style="color: #999; text-decoration: none;">Boek</a> &nbsp;&middot;&nbsp;
    <a href="${SITE_URL}/spreker" style="color: #999; text-decoration: none;">Spreker</a> &nbsp;&middot;&nbsp;
    <a href="${SITE_URL}/contact" style="color: #999; text-decoration: none;">Contact</a>
  </p>
  <p style="margin: 0 0 8px; font-size: 12px; color: #bbb;">
    Klaas Kroezen B.V. &middot; Oude Parklaan 111 &middot; 1901 ZL Castricum &middot; KVK 92622909
  </p>
  <p style="margin: 0; font-size: 12px; color: #bbb;">
    <a href="https://www.instagram.com/klaaskroezen" style="color: #bbb; text-decoration: none;">Instagram</a> &nbsp;&middot;&nbsp;
    <a href="https://www.linkedin.com/in/klaaskroezen/" style="color: #bbb; text-decoration: none;">LinkedIn</a> &nbsp;&middot;&nbsp;
    <a href="https://www.youtube.com/@klaaskroezen" style="color: #bbb; text-decoration: none;">YouTube</a>
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── HTML HELPERS ───

export function heading(text: string): string {
  return `<h1 style="margin: 0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 900; line-height: 1.1; color: ${INK};">${text}</h1>`;
}

export function subheading(text: string): string {
  return `<h2 style="margin: 24px 0 12px; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; line-height: 1.2; color: ${INK};">${text}</h2>`;
}

export function paragraph(text: string): string {
  return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.75; color: #444;">${text}</p>`;
}

export function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
<tr><td class="eb" style="background-color: ${COPPER}; border-radius: 2px;">
  <a href="${href}" style="display: inline-block; padding: 14px 28px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #ffffff; text-decoration: none;">${text}</a>
</td></tr>
</table>`;
}

export function divider(): string {
  return `<hr style="border: none; border-top: 1px solid ${WARM}; margin: 24px 0;" />`;
}

export function signature(): string {
  return `<p style="margin: 24px 0 0; font-size: 15px; line-height: 1.75; color: #444;">
Met vriendelijke groet,<br />
<strong style="color: ${INK};">Klaas Kroezen</strong>
</p>`;
}

export function signatureEn(): string {
  return `<p style="margin: 24px 0 0; font-size: 15px; line-height: 1.75; color: #444;">
Best regards,<br />
<strong style="color: ${INK};">Klaas Kroezen</strong>
</p>`;
}

export function signatureDe(): string {
  return `<p style="margin: 24px 0 0; font-size: 15px; line-height: 1.75; color: #444;">
Mit freundlichen Grüßen,<br />
<strong style="color: ${INK};">Klaas Kroezen</strong>
</p>`;
}

export function quote(text: string): string {
  return `<blockquote style="margin: 16px 0; padding: 16px 20px; border-left: 3px solid ${COPPER}; background-color: #faf8f5; font-size: 15px; line-height: 1.75; color: #555; font-style: italic;">${text}</blockquote>`;
}

export function featureList(items: string[]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
${items.map((item) => `<tr>
  <td style="padding: 4px 12px 4px 0; vertical-align: top; color: ${COPPER}; font-size: 14px;">&check;</td>
  <td style="padding: 4px 0; font-size: 14px; line-height: 1.6; color: #555;">${item}</td>
</tr>`).join("")}
</table>`;
}

export function formatEuro(cents: number): string {
  return `&euro; ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

// ─── CROSS-SELL BLOCK ───

function crossSellBlock(context: CrossSellContext, lang: "nl" | "en" | "de"): string {
  const t = {
    nl: { title: "ONTDEK OOK", book: "Het boek", bookLabel: "Bekijk het boek &rarr;", setDesc: "Meer omzet, minder stress", setLabel: "Bekijk de training &rarr;", cstDesc: "Voor iedereen met klantcontact", cstLabel: "Meer info &rarr;" },
    en: { title: "DISCOVER MORE", book: "The book", bookLabel: "View the book &rarr;", setDesc: "More revenue, less stress", setLabel: "View the training &rarr;", cstDesc: "For everyone with client contact", cstLabel: "Learn more &rarr;" },
    de: { title: "ENTDECKEN SIE MEHR", book: "Das Buch", bookLabel: "Buch ansehen &rarr;", setDesc: "Mehr Umsatz, weniger Stress", setLabel: "Training ansehen &rarr;", cstDesc: "F\u00fcr alle mit Kundenkontakt", cstLabel: "Mehr erfahren &rarr;" },
  }[lang];

  type Item = { name: string; desc: string; href: string; label: string };
  const items: Item[] = [];

  if (context !== "book") {
    items.push({
      name: t.book,
      desc: "Sales, Oprecht en Ontspannen",
      href: `${SITE_URL}/boek`,
      label: t.bookLabel,
    });
  }

  if (context !== "training") {
    items.push({
      name: "Sales Excellence Training",
      desc: t.setDesc,
      href: `${SITE_URL}/sales-excellence-training`,
      label: t.setLabel,
    });
  }

  if (items.length < 2 && context !== "cst") {
    items.push({
      name: "Customer Success Training",
      desc: t.cstDesc,
      href: `${SITE_URL}/customer-success-training`,
      label: t.cstLabel,
    });
  }

  const display = items.slice(0, 2);

  return `<p style="margin: 0 0 14px; font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: ${COPPER};">${t.title}</p>
${display.map((item) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 10px; width: 100%;">
<tr><td style="padding: 12px 16px; background-color: #ffffff; border-radius: 2px;">
  <p style="margin: 0 0 2px; font-family: Georgia, serif; font-size: 15px; font-weight: 700; color: ${INK};">${item.name}</p>
  <p style="margin: 0 0 6px; font-size: 13px; color: #888; line-height: 1.4;">${item.desc}</p>
  <a href="${item.href}" style="font-size: 12px; font-weight: 600; letter-spacing: 0.05em; color: ${COPPER}; text-decoration: none;">${item.label}</a>
</td></tr>
</table>`).join("")}`;
}
