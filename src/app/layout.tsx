import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
  alternates: {
    languages: {
      "nl": "https://www.klaaskroezen.com",
      "en": "https://www.klaaskroezen.com",
      "de": "https://www.klaaskroezen.com",
      "x-default": "https://www.klaaskroezen.com",
    },
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
        <body className="flex flex-col min-h-screen">
          <ConvexProvider>
            <JsonLd data={organizationJsonLd} />
            <a href="#main-content" className="skip-link">
              {{ nl: "Ga naar inhoud", en: "Skip to content", de: "Zum Inhalt springen" }[lang]}
            </a>
            <Navbar lang={lang} />
            <BookPopup lang={lang} />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer lang={lang} />
            <SpeedInsights />
            <Analytics />

            {/* Google Analytics 4 — replace G-XXXXXXXXXX with your Measurement ID */}
            {process.env.NEXT_PUBLIC_GA4_ID && (
              <>
                <Script
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`}
                  strategy="afterInteractive"
                />
                <Script id="ga4" strategy="afterInteractive">
                  {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA4_ID}',{send_page_view:true});`}
                </Script>
              </>
            )}

            {/* Microsoft Clarity — replace CLARITY_ID with your Project ID */}
            {process.env.NEXT_PUBLIC_CLARITY_ID && (
              <Script id="clarity" strategy="afterInteractive">
                {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_ID}");`}
              </Script>
            )}
          </ConvexProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
