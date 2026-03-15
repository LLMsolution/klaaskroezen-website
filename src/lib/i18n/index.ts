import { nl } from "./nl";
import { en } from "./en";

export type Lang = "nl" | "en";
export type Translations = typeof nl;

const translations: Record<Lang, Translations> = { nl, en };

export function t(lang: Lang): Translations {
  return translations[lang];
}

// getLocale() lives in @/lib/i18n/server to avoid bundling next/headers in client components
