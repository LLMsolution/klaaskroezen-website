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
  targetLang: string,
  html: boolean,
): Promise<string> {
  if (!text || !text.trim()) return text;
  const result = await ctx.runAction(internal.aiTranslate.translate, {
    text,
    sourceLang: "nl",
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
  targetLang: string,
): Promise<unknown> {
  if (field.type in TRANSLATABLE) {
    if (typeof value !== "string") return value;
    const html = field.type === "richtext";
    return await translateText(ctx, value, targetLang, html);
  }

  if (field.type === "object" && field.fields) {
    const obj = (value as Record<string, unknown>) ?? {};
    const out: Record<string, unknown> = { ...obj };
    for (const sub of field.fields) {
      out[sub.key] = await translateValueByField(ctx, sub, obj[sub.key], targetLang);
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
        // Simple string array OR legacy {value:string}
        if (typeof item === "string") {
          result.push(await translateValueByField(ctx, itemFields[0], item, targetLang));
        } else if (item && typeof item === "object" && "value" in (item as object)) {
          const v = (item as { value?: unknown }).value;
          const translated = await translateValueByField(ctx, itemFields[0], v, targetLang);
          result.push({ ...(item as object), value: translated });
        } else {
          result.push(item);
        }
        continue;
      }
      const obj = (item as Record<string, unknown>) ?? {};
      const out: Record<string, unknown> = { ...obj };
      for (const sub of itemFields) {
        out[sub.key] = await translateValueByField(ctx, sub, obj[sub.key], targetLang);
      }
      result.push(out);
    }
    return result;
  }

  // image-path, number, unknown — preserve as-is
  return value;
}

async function translateSectionContent(
  ctx: ActionCtx,
  sectionType: string,
  nlContent: Record<string, unknown>,
  targetLang: string,
): Promise<Record<string, unknown>> {
  const schema = SECTION_SCHEMAS[sectionType];
  if (!schema) return nlContent;
  const out: Record<string, unknown> = { ...nlContent };
  for (const field of schema.fields) {
    out[field.key] = await translateValueByField(ctx, field, nlContent[field.key], targetLang);
  }
  return out;
}

/**
 * Translate one section's NL content into target lang via AI (using the
 * translation glossary) and save it. Returns the translated content.
 */
export const translateSection = action({
  args: {
    pageSlug: v.string(),
    sectionId: v.string(),
    targetLang: langValidator,
  },
  handler: async (ctx, { pageSlug, sectionId, targetLang }) => {
    if (targetLang === "nl") throw new Error("NL is the source language.");
    await ctx.runMutation(api.aiTranslateAuth.verifyAndConsumeLimit);

    const entries = await ctx.runQuery(api.siteContent.getPageContentAdmin, { slug: pageSlug });
    const nlEntry = entries.find((e) => e.sectionId === sectionId && e.lang === "nl");
    if (!nlEntry) throw new Error("NL content niet gevonden voor deze sectie.");

    const sectionType = (nlEntry.parsedSchema as { type?: string }).type;
    if (!sectionType) throw new Error("Section type onbekend — kan niet vertalen.");

    const nlContent = nlEntry.parsedContent as Record<string, unknown>;
    const translated = await translateSectionContent(ctx, sectionType, nlContent, targetLang);

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
 * Translate every section on a page from NL into target lang. Skips sections
 * without NL content. Continues on per-section errors so one failure does
 * not abort the whole batch.
 */
export const translatePage = action({
  args: {
    pageSlug: v.string(),
    targetLang: langValidator,
  },
  handler: async (
    ctx,
    { pageSlug, targetLang },
  ): Promise<{ translated: number; failed: number; errors: string[] }> => {
    if (targetLang === "nl") throw new Error("NL is the source language.");
    await ctx.runMutation(api.aiTranslateAuth.verifyAndConsumeLimit);

    const entries = await ctx.runQuery(api.siteContent.getPageContentAdmin, { slug: pageSlug });
    const nlEntries = entries.filter((e) => e.lang === "nl");

    let translated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const nlEntry of nlEntries) {
      const sectionType = (nlEntry.parsedSchema as { type?: string }).type;
      if (!sectionType) {
        failed++;
        errors.push(`${nlEntry.sectionId}: section type unknown`);
        continue;
      }
      try {
        const nlContent = nlEntry.parsedContent as Record<string, unknown>;
        const out = await translateSectionContent(ctx, sectionType, nlContent, targetLang);
        await ctx.runMutation(api.siteContent.updateSection, {
          pageSlug,
          sectionId: nlEntry.sectionId,
          lang: targetLang,
          content: JSON.stringify(out),
        });
        translated++;
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${nlEntry.sectionId}: ${msg}`);
      }
    }

    return { translated, failed, errors };
  },
});
