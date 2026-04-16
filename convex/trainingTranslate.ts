import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./adminAuth";
import {
  TRAINING_TITLE_MAP,
  TRAINING_DESC_MAP,
  MODULE_TITLE_MAP,
  MODULE_DESC_MAP,
} from "./trainingDeTranslations";

/** Translate text via DeepL REST API */
async function translateText(
  authKey: string,
  text: string,
  targetLang: string,
): Promise<string> {
  if (!text || !text.trim()) return text;
  const isFree = authKey.endsWith(":fx");
  const baseUrl = isFree
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${authKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      target_lang: targetLang,
      source_lang: "NL",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepL API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.translations[0].text as string;
}

// ── Internal queries (no auth, called by the action) ──

export const listAllTrainingsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("trainings").collect();
  },
});

/** Dumps all NL/EN/DE content for trainings + modules. For inspection / translation seeding. */
export const dumpAllNlContent = internalQuery({
  args: {},
  handler: async (ctx) => {
    const trainings = await ctx.db.query("trainings").collect();
    type ModOut = {
      slug: string;
      titleNl: string; titleEn: string; titleDe: string | undefined;
      descNl: string; descEn: string; descDe: string | undefined;
    };
    const out: Array<{
      trainingSlug: string;
      trainingTitleNl: string; trainingTitleEn: string; trainingTitleDe: string | undefined;
      trainingDescNl: string; trainingDescEn: string; trainingDescDe: string | undefined;
      modules: ModOut[];
    }> = [];
    for (const t of trainings) {
      const modules = await ctx.db
        .query("trainingModules")
        .withIndex("by_training", (q) => q.eq("trainingId", t._id))
        .collect();
      out.push({
        trainingSlug: t.slug,
        trainingTitleNl: t.title.nl,
        trainingTitleEn: t.title.en,
        trainingTitleDe: t.title.de,
        trainingDescNl: t.description.nl,
        trainingDescEn: t.description.en,
        trainingDescDe: t.description.de,
        modules: modules
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((m) => ({
            slug: m.slug,
            titleNl: m.title.nl,
            titleEn: m.title.en,
            titleDe: m.title.de,
            descNl: m.description.nl,
            descEn: m.description.en,
            descDe: m.description.de,
          })),
      });
    }
    return out;
  },
});

export const listModulesForTrainingInternal = internalQuery({
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    return await ctx.db
      .query("trainingModules")
      .withIndex("by_training", (q) => q.eq("trainingId", trainingId))
      .collect();
  },
});

// ── Internal mutations (no auth) ──

export const patchTrainingDe = internalMutation({
  args: {
    id: v.id("trainings"),
    titleDe: v.optional(v.string()),
    descDe: v.optional(v.string()),
  },
  handler: async (ctx, { id, titleDe, descDe }) => {
    const t = await ctx.db.get(id);
    if (!t) return;
    const patch: Record<string, unknown> = {};
    if (titleDe !== undefined) {
      patch.title = { ...t.title, de: titleDe };
    }
    if (descDe !== undefined) {
      patch.description = { ...t.description, de: descDe };
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }
  },
});

export const patchModuleDe = internalMutation({
  args: {
    id: v.id("trainingModules"),
    titleDe: v.optional(v.string()),
    descDe: v.optional(v.string()),
  },
  handler: async (ctx, { id, titleDe, descDe }) => {
    const m = await ctx.db.get(id);
    if (!m) return;
    const patch: Record<string, unknown> = {};
    if (titleDe !== undefined) {
      patch.title = { ...m.title, de: titleDe };
    }
    if (descDe !== undefined) {
      patch.description = { ...m.description, de: descDe };
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }
  },
});

// ── Public mutation: seed EN + DE from the hand-curated map ──

/**
 * Seeds EN and DE content for all trainings + modules using the hand-curated
 * translations in `trainingDeTranslations.ts`. Matches by the current NL text.
 * Returns counts of updates and any NL strings that had no translation mapping.
 */
export const seedTrainingTranslations = mutation({
  args: { overwrite: v.optional(v.boolean()) },
  handler: async (ctx, { overwrite = false }) => {
    await requireAdmin(ctx);

    const result = {
      trainingsUpdated: 0,
      modulesUpdated: 0,
      missingTitleMappings: [] as string[],
      missingDescMappings: [] as string[],
    };

    // Trainings
    const trainings = await ctx.db.query("trainings").collect();
    for (const t of trainings) {
      const titleMap = TRAINING_TITLE_MAP[t.title.nl];
      const descMap = TRAINING_DESC_MAP[t.description.nl];
      const newTitle = { ...t.title };
      const newDesc = { ...t.description };
      let changed = false;

      if (titleMap) {
        if (overwrite || !newTitle.en) {
          if (newTitle.en !== titleMap.en) { newTitle.en = titleMap.en; changed = true; }
        }
        if (overwrite || !newTitle.de) {
          if (newTitle.de !== titleMap.de) { newTitle.de = titleMap.de; changed = true; }
        }
      } else if (t.title.nl) {
        result.missingTitleMappings.push(`training:${t.slug}: ${t.title.nl}`);
      }
      if (descMap) {
        if (overwrite || !newDesc.en) {
          if (newDesc.en !== descMap.en) { newDesc.en = descMap.en; changed = true; }
        }
        if (overwrite || !newDesc.de) {
          if (newDesc.de !== descMap.de) { newDesc.de = descMap.de; changed = true; }
        }
      } else if (t.description.nl) {
        result.missingDescMappings.push(`training:${t.slug}: ${t.description.nl}`);
      }

      if (changed) {
        await ctx.db.patch(t._id, { title: newTitle, description: newDesc });
        result.trainingsUpdated++;
      }
    }

    // Modules
    const modules = await ctx.db.query("trainingModules").collect();
    for (const m of modules) {
      const titleMap = MODULE_TITLE_MAP[m.title.nl];
      const descMap = m.description.nl ? MODULE_DESC_MAP[m.description.nl] : undefined;
      const newTitle = { ...m.title };
      const newDesc = { ...m.description };
      let changed = false;

      if (titleMap) {
        if (overwrite || !newTitle.en) {
          if (newTitle.en !== titleMap.en) { newTitle.en = titleMap.en; changed = true; }
        }
        if (overwrite || !newTitle.de) {
          if (newTitle.de !== titleMap.de) { newTitle.de = titleMap.de; changed = true; }
        }
      } else if (m.title.nl) {
        result.missingTitleMappings.push(`module:${m.slug}: ${m.title.nl}`);
      }
      if (m.description.nl) {
        if (descMap) {
          if (overwrite || !newDesc.en) {
            if (newDesc.en !== descMap.en) { newDesc.en = descMap.en; changed = true; }
          }
          if (overwrite || !newDesc.de) {
            if (newDesc.de !== descMap.de) { newDesc.de = descMap.de; changed = true; }
          }
        } else {
          result.missingDescMappings.push(`module:${m.slug}: ${m.description.nl}`);
        }
      }

      if (changed) {
        await ctx.db.patch(m._id, { title: newTitle, description: newDesc });
        result.modulesUpdated++;
      }
    }

    return result;
  },
});

/** Same as seedTrainingTranslations but callable from the CLI without admin auth. */
export const seedTrainingTranslationsInternal = internalMutation({
  args: { overwrite: v.optional(v.boolean()) },
  handler: async (ctx, { overwrite = false }) => {
    const result = {
      trainingsUpdated: 0,
      modulesUpdated: 0,
      missingTitleMappings: [] as string[],
      missingDescMappings: [] as string[],
    };

    const trainings = await ctx.db.query("trainings").collect();
    for (const t of trainings) {
      const titleMap = TRAINING_TITLE_MAP[t.title.nl];
      const descMap = TRAINING_DESC_MAP[t.description.nl];
      const newTitle = { ...t.title };
      const newDesc = { ...t.description };
      let changed = false;
      if (titleMap) {
        if ((overwrite || !newTitle.en) && newTitle.en !== titleMap.en) { newTitle.en = titleMap.en; changed = true; }
        if ((overwrite || !newTitle.de) && newTitle.de !== titleMap.de) { newTitle.de = titleMap.de; changed = true; }
      } else if (t.title.nl) {
        result.missingTitleMappings.push(`training:${t.slug}: ${t.title.nl}`);
      }
      if (descMap) {
        if ((overwrite || !newDesc.en) && newDesc.en !== descMap.en) { newDesc.en = descMap.en; changed = true; }
        if ((overwrite || !newDesc.de) && newDesc.de !== descMap.de) { newDesc.de = descMap.de; changed = true; }
      } else if (t.description.nl) {
        result.missingDescMappings.push(`training:${t.slug}: ${t.description.nl}`);
      }
      if (changed) { await ctx.db.patch(t._id, { title: newTitle, description: newDesc }); result.trainingsUpdated++; }
    }

    const modules = await ctx.db.query("trainingModules").collect();
    for (const m of modules) {
      const titleMap = MODULE_TITLE_MAP[m.title.nl];
      const descMap = m.description.nl ? MODULE_DESC_MAP[m.description.nl] : undefined;
      const newTitle = { ...m.title };
      const newDesc = { ...m.description };
      let changed = false;
      if (titleMap) {
        if ((overwrite || !newTitle.en) && newTitle.en !== titleMap.en) { newTitle.en = titleMap.en; changed = true; }
        if ((overwrite || !newTitle.de) && newTitle.de !== titleMap.de) { newTitle.de = titleMap.de; changed = true; }
      } else if (m.title.nl) {
        result.missingTitleMappings.push(`module:${m.slug}: ${m.title.nl}`);
      }
      if (m.description.nl) {
        if (descMap) {
          if ((overwrite || !newDesc.en) && newDesc.en !== descMap.en) { newDesc.en = descMap.en; changed = true; }
          if ((overwrite || !newDesc.de) && newDesc.de !== descMap.de) { newDesc.de = descMap.de; changed = true; }
        } else {
          result.missingDescMappings.push(`module:${m.slug}: ${m.description.nl}`);
        }
      }
      if (changed) { await ctx.db.patch(m._id, { title: newTitle, description: newDesc }); result.modulesUpdated++; }
    }

    return result;
  },
});

// ── Action: translate all trainings + modules NL → DE ──

type Training = {
  _id: Id<"trainings">;
  title: { nl: string; en: string; de?: string };
  description: { nl: string; en: string; de?: string };
};

type TrainingModule = {
  _id: Id<"trainingModules">;
  title: { nl: string; en: string; de?: string };
  description: { nl: string; en: string; de?: string };
};

export const translateAllTrainingsToDe = action({
  args: { overwrite: v.optional(v.boolean()) },
  handler: async (
    ctx,
    { overwrite = false },
  ): Promise<{ trainingsUpdated: number; modulesUpdated: number; skipped: number }> => {
    const authKey = process.env.DEEPL_AUTH_KEY;
    if (!authKey) throw new Error("DEEPL_AUTH_KEY not configured");

    const trainings: Training[] = await ctx.runQuery(internal.trainingTranslate.listAllTrainingsInternal);

    let trainingsUpdated = 0;
    let modulesUpdated = 0;
    let skipped = 0;

    for (const t of trainings) {
      // Training title/description
      const needTitle = overwrite || !t.title.de || !t.title.de.trim();
      const needDesc = overwrite || !t.description.de || !t.description.de.trim();

      const trainingPatch: { titleDe?: string; descDe?: string } = {};
      if (needTitle && t.title.nl) {
        trainingPatch.titleDe = await translateText(authKey, t.title.nl, "DE");
      }
      if (needDesc && t.description.nl) {
        trainingPatch.descDe = await translateText(authKey, t.description.nl, "DE");
      }
      if (Object.keys(trainingPatch).length > 0) {
        await ctx.runMutation(internal.trainingTranslate.patchTrainingDe, {
          id: t._id,
          ...trainingPatch,
        });
        trainingsUpdated++;
      } else {
        skipped++;
      }

      // Modules
      const modules: TrainingModule[] = await ctx.runQuery(
        internal.trainingTranslate.listModulesForTrainingInternal,
        { trainingId: t._id },
      );

      for (const m of modules) {
        const needModTitle = overwrite || !m.title.de || !m.title.de.trim();
        const needModDesc = overwrite || !m.description.de || !m.description.de.trim();

        const modPatch: { titleDe?: string; descDe?: string } = {};
        if (needModTitle && m.title.nl) {
          modPatch.titleDe = await translateText(authKey, m.title.nl, "DE");
        }
        if (needModDesc && m.description.nl) {
          modPatch.descDe = await translateText(authKey, m.description.nl, "DE");
        }
        if (Object.keys(modPatch).length > 0) {
          await ctx.runMutation(internal.trainingTranslate.patchModuleDe, {
            id: m._id,
            ...modPatch,
          });
          modulesUpdated++;
        } else {
          skipped++;
        }
      }
    }

    return { trainingsUpdated, modulesUpdated, skipped };
  },
});
