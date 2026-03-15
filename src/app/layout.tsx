import type { Metadata, Viewport } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { playfair, dmSans } from "@/lib/fonts";
import { Navbar } from "@/components/layout/Navbar";
import { BookPopup } from "@/components/ui/BookPopup";
import { Footer } from "@/components/layout/Footer";
import { JsonLd, organizationJsonLd } from "@/components/seo/JsonLd";
import { ConvexProvider } from "@/components/providers/ConvexProvider";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

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
  metadataBase: new URL("https://www.klaaskroezen.com"),
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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLocale();

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang={lang} className={`${playfair.variable} ${dmSans.variable}`}>
        <body>
          <ConvexProvider>
            <JsonLd data={organizationJsonLd} />
            <a href="#main-content" className="skip-link">
              {lang === "nl" ? "Ga naar inhoud" : "Skip to content"}
            </a>
            <Navbar lang={lang} />
            <BookPopup lang={lang} />
            <main id="main-content">{children}</main>
            <Footer lang={lang} />
            <SpeedInsights />
            <Analytics />
          </ConvexProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
