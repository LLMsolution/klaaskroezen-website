import { cookies } from "next/headers";
import type { Lang } from "./index";

export async function getLocale(): Promise<Lang> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value;
  return locale === "en" ? "en" : locale === "de" ? "de" : "nl";
}
