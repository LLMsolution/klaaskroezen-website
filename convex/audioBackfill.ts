"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { parseBuffer } from "music-metadata";

/**
 * Server-side backfill of `audioDurationSeconds` for every training module
 * that has an `audioStorageId` but no duration yet. Fetches the MP3 stream
 * from Convex storage, parses the metadata with `music-metadata`, and
 * persists the result. Idempotent — safe to re-run.
 *
 * Run via: `npx convex run --prod audioBackfill:backfillAllAudioDurations`
 */
export const backfillAllAudioDurations = internalAction({
  args: {},
  handler: async (ctx): Promise<{ updated: number; failed: number; skipped: number }> => {
    const targets = await ctx.runQuery(internal.audioBackfillHelpers.listModulesNeedingDuration, {});
    let updated = 0;
    let failed = 0;
    let skipped = 0;

    for (const t of targets) {
      const url = await ctx.storage.getUrl(t.audioStorageId);
      if (!url) {
        skipped++;
        continue;
      }
      try {
        const res = await fetch(url);
        if (!res.ok) {
          failed++;
          continue;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        const meta = await parseBuffer(buf, { mimeType: "audio/mpeg" }, { duration: true });
        const seconds = meta.format.duration;
        if (!seconds || !Number.isFinite(seconds)) {
          failed++;
          continue;
        }
        await ctx.runMutation(internal.audioBackfillHelpers.saveDuration, {
          moduleId: t._id,
          durationSeconds: Math.round(seconds),
        });
        updated++;
      } catch (err) {
        console.error("[audioBackfill] failed for", t._id, err);
        failed++;
      }
    }

    return { updated, failed, skipped };
  },
});
