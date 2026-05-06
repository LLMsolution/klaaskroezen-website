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
 * Recursively unwrap `{value: "..."}` objects that the content editor
 * stores for string fields. Without this, React throws error #31
 * ("objects are not valid as a React child").
 */
function unwrapValues(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(unwrapValues);
  if (typeof obj === "object") {
    const o = obj as Record<string, unknown>;
    // If the object has ONLY a `value` key, unwrap it
    const keys = Object.keys(o);
    if (keys.length === 1 && keys[0] === "value") {
      return unwrapValues(o.value);
    }
    // Otherwise recurse into all keys
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      result[key] = unwrapValues(o[key]);
    }
    return result;
  }
  return obj;
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
  if (data && Object.keys(data).length > 0) return unwrapValues(data) as T;
  return fallback;
}

/**
 * Helper for `generateMetadata()`. Loads the `page-meta` section of a page
 * and returns title + description with hardcoded fallbacks so SEO never
 * breaks if the DB is empty or unreachable.
 */
export async function loadPageMeta(
  slug: string,
  lang: Lang,
  fallback: { title: string; description: string },
): Promise<{ title: string; description: string }> {
  try {
    const db = await loadPageContent(slug, lang);
    const meta = sectionOr<{ title?: string; description?: string }>(db, "page-meta", {});
    return {
      title: meta.title?.trim() || fallback.title,
      description: meta.description?.trim() || fallback.description,
    };
  } catch {
    return fallback;
  }
}
