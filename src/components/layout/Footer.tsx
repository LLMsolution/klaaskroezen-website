import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";
import { FooterAccountActions } from "./FooterAccountActions";

export function Footer({ lang }: { lang: Lang }) {
  const s = t(lang).footer;
  const n = t(lang).nav;

  const navLinks = [
    { href: "/sales-excellence-training", label: n.setTitle },
    { href: "/customer-success-training", label: n.cstTitle },
    { href: "/spreker", label: n.spreker },
    { href: "/boek", label: n.boek },
    { href: "/over-ons", label: n.overOns },
    { href: "/contact", label: n.contact },
  ];

  const legalLinks = [
    { href: "/privacy", label: s.privacy },
    { href: "/algemene-voorwaarden", label: s.terms },
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
              {s.description}
            </p>

            {/* Social icons */}
            <div className="flex gap-4 mt-5">
              <a
                href="https://www.instagram.com/klaaskroezen/"
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
                href="https://www.youtube.com/@klaaskroezen"
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
                href="https://www.linkedin.com/in/klaaskroezen/"
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
          <nav aria-label={s.footerNav}>
            <h3 className="text-[11px] font-medium tracking-[0.18em] uppercase text-paper/45 mb-4">
              {s.pages}
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
              {s.contact}
            </h3>
            <ul className="flex flex-col gap-2.5 list-none text-[14px] text-paper/60">
              <li>
                <a
                  href="mailto:klaas@klaaskroezen.com"
                  className="hover:text-paper transition-colors duration-150 outline-none focus-visible:text-paper"
                >
                  klaas@klaaskroezen.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+31618098906"
                  className="hover:text-paper transition-colors duration-150 outline-none focus-visible:text-paper"
                >
                  +31&nbsp;6&nbsp;1809&nbsp;8906
                </a>
              </li>
              <li className="text-paper/50 leading-[1.6]">
                Oude Parklaan&nbsp;111
                <br />
                1901&nbsp;ZL Castricum
              </li>
              <li className="text-paper/40 text-[12px] leading-[1.6] pt-1">
                KvK&nbsp;30204462
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 sm:mt-14 pt-6 border-t border-paper/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[12px] text-paper/40">
            &copy; {new Date().getFullYear()} Klaas Kroezen. {s.copyright}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12px] text-paper/40 hover:text-paper/60 transition-colors duration-150 outline-none focus-visible:text-paper/60"
              >
                {link.label}
              </Link>
            ))}
            <FooterAccountActions lang={lang} />
          </div>
        </div>
      </div>
    </footer>
  );
}
