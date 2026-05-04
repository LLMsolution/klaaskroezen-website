import { v } from "convex/values";
import { action, type ActionCtx } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { langValidator } from "./schema";
import { SECTION_SCHEMAS, type FieldSchema } from "./siteSchemas";

type TranslatableField = "text" | "textarea" | "richtext";
const TRANSLATABLE: Record<TranslatableField, true> = {
  text: true,
  textarea: true,
  richtext: true,
};

async function translateText(
  ctx: ActionCtx,
  text: string,
  sourceLang: string,
  targetLang: string,
  html: boolean,
): Promise<string> {
  if (!text || !text.trim()) return text;
  const result = await ctx.runAction(internal.aiTranslate.translate, {
    text,
    sourceLang,
    targetLang,
    html,
  });
  if (!result.ok) throw new Error(result.error);
  return result.text;
}

async function translateValueByField(
  ctx: ActionCtx,
  field: FieldSchema,
  value: unknown,
  sourceLang: string,
  targetLang: string,
): Promise<unknown> {
  if (field.type in TRANSLATABLE) {
    if (typeof value !== "string") return value;
    const html = field.type === "richtext";
    return await translateText(ctx, value, sourceLang, targetLang, html);
  }

  if (field.type === "object" && field.fields) {
    const obj = (value as Record<string, unknown>) ?? {};
    const out: Record<string, unknown> = { ...obj };
    for (const sub of field.fields) {
      out[sub.key] = await translateValueByField(ctx, sub, obj[sub.key], sourceLang, targetLang);
    }
    return out;
  }

  if (field.type === "array" && field.itemFields) {
    const arr = Array.isArray(value) ? value : [];
    const itemFields = field.itemFields;
    const isSimple = itemFields.length === 1 && itemFields[0].key === "value";

    const result: unknown[] = [];
    for (const item of arr) {
      if (isSimple) {
        if (typeof item === "string") {
          result.push(await translateValueByField(ctx, itemFields[0], item, sourceLang, targetLang));
        } else if (item && typeof item === "object" && "value" in (item as object)) {
          const v = (item as { value?: unknown }).value;
          const translated = await translateValueByField(ctx, itemFields[0], v, sourceLang, targetLang);
          result.push({ ...(item as object), value: translated });
        } else {
          result.push(item);
        }
        continue;
      }
      const obj = (item as Record<string, unknown>) ?? {};
      const out: Record<string, unknown> = { ...obj };
      for (const sub of itemFields) {
        out[sub.key] = await translateValueByField(ctx, sub, obj[sub.key], sourceLang, targetLang);
      }
      result.push(out);
    }
    return result;
  }

  return value;
}

async function translateSectionContent(
  ctx: ActionCtx,
  sectionType: string,
  sourceContent: Record<string, unknown>,
  sourceLang: string,
  targetLang: string,
): Promise<Record<string, unknown>> {
  const schema = SECTION_SCHEMAS[sectionType];
  if (!schema) return sourceContent;
  const out: Record<string, unknown> = { ...sourceContent };
  for (const field of schema.fields) {
    out[field.key] = await translateValueByField(
      ctx,
      field,
      sourceContent[field.key],
      sourceLang,
      targetLang,
    );
  }
  return out;
}

/**
 * Translate one section from sourceLang into targetLang via AI (using the
 * translation glossary) and save it. Falls back to NL source if the chosen
 * source has no content for this section.
 */
export const translateSection = action({
  args: {
    pageSlug: v.string(),
    sectionId: v.string(),
    sourceLang: v.optional(langValidator),
    targetLang: langValidator,
  },
  handler: async (ctx, { pageSlug, sectionId, sourceLang, targetLang }) => {
    const source = sourceLang ?? "nl";
    if (source === targetLang) {
      throw new Error("Source en target taal mogen niet gelijk zijn.");
    }
    await ctx.runMutation(api.aiTranslateAuth.verifyAndConsumeLimit);

    const entries = await ctx.runQuery(api.siteContent.getPageContentAdmin, { slug: pageSlug });
    let sourceEntry = entries.find((e) => e.sectionId === sectionId && e.lang === source);
    if (!sourceEntry) {
      sourceEntry = entries.find((e) => e.sectionId === sectionId && e.lang === "nl");
    }
    if (!sourceEntry) throw new Error("Geen broncontent gevonden voor deze sectie.");

    const sectionType = (sourceEntry.parsedSchema as { type?: string }).type;
    if (!sectionType) throw new Error("Section type onbekend — kan niet vertalen.");

    const content = sourceEntry.parsedContent as Record<string, unknown>;
    const translated = await translateSectionContent(ctx, sectionType, content, source, targetLang);

    await ctx.runMutation(api.siteContent.updateSection, {
      pageSlug,
      sectionId,
      lang: targetLang,
      content: JSON.stringify(translated),
    });

    return { ok: true as const };
  },
});

/**
 * Translate every section on a page from sourceLang into targetLang.
 * Sections that have no content in sourceLang fall back to NL.
 */
export const translatePage = action({
  args: {
    pageSlug: v.string(),
    sourceLang: v.optional(langValidator),
    targetLang: langValidator,
  },
  handler: async (
    ctx,
    { pageSlug, sourceLang, targetLang },
  ): Promise<{ translated: number; failed: number; errors: string[] }> => {
    const source = sourceLang ?? "nl";
    if (source === targetLang) {
      throw new Error("Source en target taal mogen niet gelijk zijn.");
    }
    await ctx.runMutation(api.aiTranslateAuth.verifyAndConsumeLimit);

    const entries = await ctx.runQuery(api.siteContent.getPageContentAdmin, { slug: pageSlug });
    const sourceEntries = entries.filter((e) => e.lang === source);
    const nlEntries = entries.filter((e) => e.lang === "nl");

    // Use source where available, otherwise fall back to NL per section.
    const bySectionId = new Map<string, (typeof entries)[number]>();
    for (const e of nlEntries) bySectionId.set(e.sectionId, e);
    for (const e of sourceEntries) bySectionId.set(e.sectionId, e);

    let translated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const entry of bySectionId.values()) {
      const sectionType = (entry.parsedSchema as { type?: string }).type;
      if (!sectionType) {
        failed++;
        errors.push(`${entry.sectionId}: section type unknown`);
        continue;
      }
      const effectiveSource = entry.lang;
      try {
        const content = entry.parsedContent as Record<string, unknown>;
        const out = await translateSectionContent(
          ctx,
          sectionType,
          content,
          effectiveSource,
          targetLang,
        );
        await ctx.runMutation(api.siteContent.updateSection, {
          pageSlug,
          sectionId: entry.sectionId,
          lang: targetLang,
          content: JSON.stringify(out),
        });
        translated++;
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${entry.sectionId}: ${msg}`);
      }
    }

    return { translated, failed, errors };
  },
});
