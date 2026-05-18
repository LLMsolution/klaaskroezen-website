"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { t, type Lang } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

type NavOverrides = Partial<{
  trainingen: string; spreker: string; boek: string; overOns: string; contact: string;
  inloggen: string; mijnAccount: string; trainingKopen: string;
  setLabel: string; setTitle: string; setDesc: string; setCta: string;
  cstLabel: string; cstTitle: string; cstDesc: string; cstCta: string;
}>;

function MegaDropdown({ lang, n }: { lang: Lang; n: NavOverrides & { setLabel: string; setTitle: string; setDesc: string; setCta: string; cstLabel: string; cstTitle: string; cstDesc: string; cstCta: string } }) {
  void lang;
  const s = n;

  return (
    <div
      role="menu"
      className="absolute top-[63px] left-1/2 -translate-x-1/2 translate-y-[-8px] bg-ink border border-paper/[0.09] border-t-2 border-t-copper min-w-[540px] opacity-0 invisible pointer-events-none transition-[opacity,transform] duration-[180ms] group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0 max-lg:hidden"
    >
      <div className="grid grid-cols-2 gap-px bg-paper/[0.07]">
        <Link
          href="/sales-excellence-training"
          role="menuitem"
          className="bg-ink p-[26px] pb-7 flex flex-col gap-1.5 transition-colors duration-150 hover:bg-[#1c1208] outline-none focus-visible:bg-[#1c1208] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-copper"
        >
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
            {s.setLabel}
          </span>
          <span className="font-display text-[16px] font-bold text-paper leading-tight">
            {s.setTitle}
          </span>
          <span className="text-[13px] text-paper/60 leading-[1.6] mt-0.5">
            {s.setDesc}
          </span>
          <span className="mt-2.5 text-[10px] font-medium tracking-[0.1em] uppercase text-copper">
            {s.setCta}
          </span>
        </Link>
        <Link
          href="/customer-success-training"
          role="menuitem"
          className="bg-ink p-[26px] pb-7 flex flex-col gap-1.5 transition-colors duration-150 hover:bg-[#1c1208] outline-none focus-visible:bg-[#1c1208] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-copper"
        >
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
            {s.cstLabel}
          </span>
          <span className="font-display text-[16px] font-bold text-paper leading-tight">
            {s.cstTitle}
          </span>
          <span className="text-[13px] text-paper/60 leading-[1.6] mt-0.5">
            {s.cstDesc}
          </span>
          <span className="mt-2.5 text-[10px] font-medium tracking-[0.1em] uppercase text-copper">
            {s.cstCta}
          </span>
        </Link>
      </div>
    </div>
  );
}

export function Navbar({ lang }: { lang: Lang }) {
  const base = t(lang).nav;
  const navDb = useQuery(api.siteContent.getSection, { pageSlug: "site-shared", sectionId: "navigation", lang });
  const navOverrides = (navDb?.parsedContent as NavOverrides | undefined) ?? {};
  const s = { ...base, ...navOverrides };
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const user = useQuery(api.users.getCurrentUser);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  // Prevent scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-[200]">
      <nav
        aria-label={s.mainNav}
        className="bg-ink border-b border-paper/[0.07] px-14 max-lg:px-7 h-16 flex items-center justify-between"
      >
        <Link
          href="/"
          className="font-display text-[17px] font-black tracking-[0.06em] text-paper uppercase shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          aria-label={s.home}
        >
          Klaas Kroezen
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-stretch h-16" role="menubar">
          <div className="group relative flex items-center" role="none">
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded="false"
              className={`text-[13px] font-normal tracking-[0.06em] uppercase hover:text-paper transition-colors duration-150 px-4 h-16 flex items-center gap-[5px] cursor-pointer whitespace-nowrap outline-none focus-visible:text-paper ${
                pathname.includes("-training")
                  ? "text-copper-light"
                  : "text-paper/70"
              }`}
            >
              {s.trainingen}{" "}
              <span
                className="text-[8px] opacity-60 transition-transform duration-200 group-hover:rotate-180 group-hover:opacity-90"
                aria-hidden="true"
              >
                &#9662;
              </span>
            </button>
            <MegaDropdown lang={lang} n={s} />
          </div>
          <NavLink href="/spreker" active={pathname === "/spreker"}>
            {s.spreker}
          </NavLink>
          <NavLink href="/boek" active={pathname === "/boek"}>
            {s.boek}
          </NavLink>
          <NavLink href="/over-ons" active={pathname === "/over-ons"}>
            {s.overOns}
          </NavLink>
          <NavLink href="/nieuws" active={pathname.startsWith("/nieuws")}>
            {{ nl: "Nieuws", en: "News", de: "Neuigkeiten" }[lang]}
          </NavLink>
          <NavLink href="/contact" active={pathname === "/contact"}>
            {s.contact}
          </NavLink>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher lang={lang} />
          <Link
            href={user ? "/dashboard" : "/login"}
            className="hidden lg:block text-[12px] font-normal tracking-[0.07em] uppercase text-paper/70 hover:text-paper transition-colors duration-150 px-3 py-2 outline-none focus-visible:text-paper focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            {user ? s.mijnAccount : s.inloggen}
          </Link>
          <Link
            href="/checkout/set-online"
            className="hidden lg:block bg-copper text-paper px-[18px] py-[9px] text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors duration-200 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            {s.trainingKopen}
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            className="lg:hidden relative w-11 h-11 outline-none focus-visible:ring-2 focus-visible:ring-copper"
            aria-label={mobileOpen ? s.menuClose : s.menuOpen}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span
              className={`absolute left-[10px] w-[22px] h-px bg-paper transition-all duration-200 origin-center ${
                mobileOpen ? "top-1/2 rotate-45" : "top-[16px]"
              }`}
            />
            <span
              className={`absolute left-[10px] top-1/2 w-[22px] h-px bg-paper transition-all duration-200 ${
                mobileOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`absolute left-[10px] w-[22px] h-px bg-paper transition-all duration-200 origin-center ${
                mobileOpen ? "top-1/2 -rotate-45" : "top-[28px]"
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-label={s.mobileMenu}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen ? true : undefined}
        className={`lg:hidden fixed inset-x-0 top-16 bottom-0 bg-ink/95 backdrop-blur-sm z-[199] transition-opacity duration-200 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav aria-label={s.mobileMenu} className="flex flex-col p-7 gap-1 overflow-y-auto overscroll-contain">
          <MobileNavLink href="/sales-excellence-training" onClick={closeMobile}>
            {s.setTitle}
          </MobileNavLink>
          <MobileNavLink href="/customer-success-training" onClick={closeMobile}>
            {s.cstTitle}
          </MobileNavLink>
          <MobileNavLink href="/spreker" onClick={closeMobile}>
            {s.spreker}
          </MobileNavLink>
          <MobileNavLink href="/boek" onClick={closeMobile}>
            {s.boek}
          </MobileNavLink>
          <MobileNavLink href="/over-ons" onClick={closeMobile}>
            {s.overOns}
          </MobileNavLink>
          <MobileNavLink href="/nieuws" onClick={closeMobile}>
            {{ nl: "Nieuws", en: "News", de: "Neuigkeiten" }[lang]}
          </MobileNavLink>
          <MobileNavLink href="/contact" onClick={closeMobile}>
            {s.contact}
          </MobileNavLink>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="text-[13px] font-normal tracking-[0.07em] uppercase text-paper/50 hover:text-paper/80 transition-colors duration-150 py-2 outline-none focus-visible:text-paper"
              onClick={closeMobile}
            >
              {user ? s.mijnAccount : s.inloggen}
            </Link>
            <Link
              href="/checkout/set-online"
              className="bg-copper text-paper px-[18px] py-3 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors duration-200 text-center outline-none focus-visible:ring-2 focus-visible:ring-paper"
              onClick={closeMobile}
            >
              {s.trainingKopen}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <div className="flex items-center" role="none">
      <Link
        href={href}
        role="menuitem"
        aria-current={active ? "page" : undefined}
        className={`text-[13px] font-normal tracking-[0.06em] uppercase transition-colors duration-150 px-4 h-16 flex items-center whitespace-nowrap outline-none focus-visible:text-paper ${
          active ? "text-copper-light" : "text-paper/70 hover:text-paper"
        }`}
      >
        {children}
      </Link>
    </div>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className="text-[17px] text-paper/80 hover:text-paper transition-colors duration-150 py-4 border-b border-paper/[0.07] outline-none focus-visible:text-paper"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
