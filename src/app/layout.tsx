import type { Metadata, Viewport } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { playfair, dmSans } from "@/lib/fonts";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { JsonLd, organizationJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site-config";
import { ConvexProvider } from "@/components/providers/ConvexProvider";
import { AnalyticsConsent } from "@/components/providers/AnalyticsConsent";
import { BookPopup } from "@/components/ui/BookPopup";
import { getLocale } from "@/lib/i18n/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { parseTrackingScripts, type TrackingBlock } from "@/lib/tracking-scripts-parser";
import "./globals.css";

function renderTrackingBlocks(blocks: TrackingBlock[], prefix: string) {
  return blocks.map((block, i) => {
    const key = `${prefix}-${i}`;
    if (block.kind === "script-inline") {
      return (
        <script
          key={key}
          {...block.attrs}
          dangerouslySetInnerHTML={{ __html: block.body }}
        />
      );
    }
    if (block.kind === "script-src") {
      // Parser preserves the admin-pasted async/defer attrs; no need to force a strategy here.
      // eslint-disable-next-line @next/next/no-sync-scripts
      return <script key={key} src={block.src} {...block.attrs} />;
    }
    return <noscript key={key} dangerouslySetInnerHTML={{ __html: block.html }} />;
  });
}

export const viewport: Viewport = {
  themeColor: "#0E0C0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Klaas Kroezen — Meer omzet, minder stress",
    template: "%s | Klaas Kroezen",
  },
  description:
    "Sales- en Customer Success trainingen van Klaas Kroezen. Oprecht en ontspannen verkopen. 25+ jaar ervaring, 21 landen, 9.1 beoordeling.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Klaas Kroezen",
    images: [{ url: "/images/hero/og-image.jpeg", width: 1200, height: 630 }],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    languages: {
      "nl": SITE_URL,
      "en": SITE_URL,
      "de": SITE_URL,
      "x-default": SITE_URL,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLocale();
  const tracking = await fetchQuery(api.settings.getTrackingScripts, {}).catch(
    () => ({ trackingScriptsHead: "", trackingScriptsBody: "" }),
  );
  const headBlocks = parseTrackingScripts(tracking.trackingScriptsHead);
  const bodyBlocks = parseTrackingScripts(tracking.trackingScriptsBody);

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang={lang} className={`${playfair.variable} ${dmSans.variable}`}>
        <head>{renderTrackingBlocks(headBlocks, "head")}</head>
        <body className="flex flex-col min-h-screen">
          {renderTrackingBlocks(bodyBlocks, "body")}
          <ConvexProvider>
            <JsonLd data={organizationJsonLd} />
            <a href="#main-content" className="skip-link">
              {{ nl: "Ga naar inhoud", en: "Skip to content", de: "Zum Inhalt springen" }[lang]}
            </a>
            <Navbar lang={lang} />
            <BookPopup lang={lang} />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer lang={lang} />
            <CookieConsent lang={lang} />
            <AnalyticsConsent />
          </ConvexProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
