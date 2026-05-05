import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";
import { loadPageContent, sectionOr } from "@/lib/site-content-loader";

type FooterContent = {
  description?: string;
  pagesLabel?: string;
  contactLabel?: string;
  footerNavAriaLabel?: string;
  email?: string;
  phoneDisplay?: string;
  phoneHref?: string;
  addressLine1?: string;
  addressLine2?: string;
  kvk?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  copyright?: string;
  privacyLabel?: string;
  termsLabel?: string;
};

export async function Footer({ lang }: { lang: Lang }) {
  const s = t(lang).footer;
  const n = t(lang).nav;

  const db = await loadPageContent("site-shared", lang);
  const f = sectionOr<FooterContent>(db, "footer", {});

  const description = f.description?.trim() || s.description;
  const pagesLabel = f.pagesLabel?.trim() || s.pages;
  const contactLabel = f.contactLabel?.trim() || s.contact;
  const footerNavAria = f.footerNavAriaLabel?.trim() || s.footerNav;
  const email = f.email?.trim() || "klaas@klaaskroezen.com";
  const phoneDisplay = f.phoneDisplay?.trim() || "+31 6 1809 8906";
  const phoneHref = f.phoneHref?.trim() || "+31618098906";
  const addressLine1 = f.addressLine1?.trim() || "Oude Parklaan 111";
  const addressLine2 = f.addressLine2?.trim() || "1901 ZL Castricum";
  const kvk = f.kvk?.trim() || "KvK 30204462";
  const instagramUrl = f.instagramUrl?.trim() || "https://www.instagram.com/klaaskroezen/";
  const youtubeUrl = f.youtubeUrl?.trim() || "https://www.youtube.com/@klaaskroezen";
  const linkedinUrl = f.linkedinUrl?.trim() || "https://www.linkedin.com/in/klaaskroezen/";
  const copyrightLabel = f.copyright?.trim() || s.copyright;
  const privacyLabel = f.privacyLabel?.trim() || s.privacy;
  const termsLabel = f.termsLabel?.trim() || s.terms;

  const navLinks = [
    { href: "/sales-excellence-training", label: n.setTitle },
    { href: "/customer-success-training", label: n.cstTitle },
    { href: "/spreker", label: n.spreker },
    { href: "/boek", label: n.boek },
    { href: "/over-ons", label: n.overOns },
    { href: "/contact", label: n.contact },
  ];

  const legalLinks = [
    { href: "/privacy", label: privacyLabel },
    { href: "/algemene-voorwaarden", label: termsLabel },
  ];

  return (
    <footer className="bg-ink border-t border-paper/[0.06]" role="contentinfo">
      <div className="max-w-[1180px] mx-auto px-7 sm:px-14 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="font-display text-[17px] font-black tracking-[0.06em] text-paper uppercase inline-block outline-none focus-visible:ring-2 focus-visible:ring-copper"
            >
              Klaas Kroezen
            </Link>
            <p className="text-[14px] text-paper/55 leading-[1.75] mt-4 max-w-[320px]">
              {description}
            </p>

            {/* Social icons */}
            <div className="flex gap-4 mt-5">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-paper/45 hover:text-paper transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-paper/45 hover:text-paper transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-paper/45 hover:text-paper transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label={footerNavAria}>
            <h3 className="text-[11px] font-medium tracking-[0.18em] uppercase text-paper/45 mb-4">
              {pagesLabel}
            </h3>
            <ul className="flex flex-col gap-2.5 list-none">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-paper/60 hover:text-paper transition-colors duration-150 outline-none focus-visible:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-medium tracking-[0.18em] uppercase text-paper/45 mb-4">
              {contactLabel}
            </h3>
            <ul className="flex flex-col gap-2.5 list-none text-[14px] text-paper/60">
              <li>
                <a
                  href={`mailto:${email}`}
                  className="hover:text-paper transition-colors duration-150 outline-none focus-visible:text-paper"
                >
                  {email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${phoneHref}`}
                  className="hover:text-paper transition-colors duration-150 outline-none focus-visible:text-paper"
                >
                  {phoneDisplay}
                </a>
              </li>
              <li className="text-paper/50 leading-[1.6]">
                {addressLine1}
                <br />
                {addressLine2}
              </li>
              <li className="text-paper/40 text-[12px] leading-[1.6] pt-1">
                {kvk}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 sm:mt-14 pt-6 border-t border-paper/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[12px] text-paper/40">
            &copy; {new Date().getFullYear()} Klaas Kroezen. {copyrightLabel}
          </p>
          <div className="flex gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12px] text-paper/40 hover:text-paper/60 transition-colors duration-150 outline-none focus-visible:text-paper/60"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
