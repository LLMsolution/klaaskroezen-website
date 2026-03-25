import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import type { Lang } from "@/lib/i18n";

/**
 * Fetch all section content for a page from the database.
 * Returns a Record<sectionId, parsedContent>.
 * Falls back to empty objects if DB has no data.
 */
export async function loadPageContent(
  slug: string,
  lang: Lang,
): Promise<Record<string, Record<string, unknown>>> {
  try {
    const result = await fetchQuery(api.siteContent.getPageContent, {
      slug,
      lang,
    });
    return (result ?? {}) as Record<string, Record<string, unknown>>;
  } catch {
    return {};
  }
}

/**
 * Get a section's content with a typed fallback.
 * If the DB has content, parse and return it.
 * Otherwise return the fallback value.
 */
export function sectionOr<T>(
  content: Record<string, Record<string, unknown>>,
  sectionId: string,
  fallback: T,
): T {
  const data = content[sectionId];
  if (data && Object.keys(data).length > 0) return data as T;
  return fallback;
}
