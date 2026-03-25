import { internalMutation } from "./_generated/server";

/**
 * Migration: restructure flat modules into hierarchical chapters + lessons.
 *
 * Parses titles like "1.1 Introductie" → becomes child of auto-created "Module 1".
 * Items without a number prefix (e.g. "Welkom – Start met het intakeformulier")
 * stay as standalone top-level items.
 *
 * Run once via Convex dashboard: npx convex run trainingMigration:restructure
 */
export const restructure = internalMutation({
  args: {},
  handler: async (ctx) => {
    const trainings = await ctx.db.query("trainings").collect();

    for (const training of trainings) {
      const modules = await ctx.db
        .query("trainingModules")
        .withIndex("by_training", (q) => q.eq("trainingId", training._id))
        .collect();

      // Skip if already has hierarchy
      if (modules.some((m) => m.parentModuleId)) {
        console.log(`${training.title.nl}: al hiërarchisch, overgeslagen.`);
        continue;
      }

      // Parse: group by leading number (e.g. "1.3 Titel" → group 1, lesson 3)
      const groups = new Map<number, typeof modules>();
      const standalone: typeof modules = [];

      for (const mod of modules) {
        const match = mod.title.nl.match(/^(\d+)\.(\d+)\s+(.+)/);
        if (match) {
          const groupNum = parseInt(match[1]);
          const list = groups.get(groupNum) ?? [];
          list.push(mod);
          groups.set(groupNum, list);
        } else {
          standalone.push(mod);
        }
      }

      if (groups.size === 0) {
        console.log(`${training.title.nl}: geen genummerde items gevonden, overgeslagen.`);
        continue;
      }

      // Sort standalone items first, then chapters
      let sortOrder = 0;

      // Keep standalone items as top-level
      for (const mod of standalone.sort((a, b) => a.sortOrder - b.sortOrder)) {
        await ctx.db.patch(mod._id, { sortOrder });
        sortOrder++;
      }

      // Create chapter for each group and reparent lessons
      const sortedGroups = [...groups.entries()].sort((a, b) => a[0] - b[0]);

      for (const [groupNum, lessons] of sortedGroups) {
        // Create the chapter
        const chapterId = await ctx.db.insert("trainingModules", {
          trainingId: training._id,
          slug: `module-${groupNum}`,
          title: { nl: `Module ${groupNum}`, en: `Module ${groupNum}` },
          description: { nl: "", en: "" },
          sortOrder,
          discussionEnabled: false,
          quizRequired: false,
          active: true,
          createdAt: Date.now(),
        });
        sortOrder++;

        // Sort lessons by their sub-number and set parentModuleId
        const sortedLessons = lessons.sort((a, b) => {
          const aMatch = a.title.nl.match(/^(\d+)\.(\d+)/);
          const bMatch = b.title.nl.match(/^(\d+)\.(\d+)/);
          const aNum = aMatch ? parseInt(aMatch[2]) : 0;
          const bNum = bMatch ? parseInt(bMatch[2]) : 0;
          return aNum - bNum;
        });

        for (let i = 0; i < sortedLessons.length; i++) {
          const lesson = sortedLessons[i];
          // Clean up title: remove "1.3 " prefix, keep the rest
          const cleanTitle = lesson.title.nl.replace(/^\d+\.\d+\s+/, "");
          const cleanTitleEn = lesson.title.en.replace(/^\d+\.\d+\s+/, "");

          await ctx.db.patch(lesson._id, {
            parentModuleId: chapterId,
            sortOrder: i,
            title: {
              nl: cleanTitle,
              en: cleanTitleEn || cleanTitle,
            },
          });
        }

        console.log(`  Module ${groupNum}: ${sortedLessons.length} trainingen`);
      }

      console.log(`${training.title.nl}: ${standalone.length} standalone + ${groups.size} modules aangemaakt.`);
    }

    console.log("Migratie voltooid.");
  },
});
