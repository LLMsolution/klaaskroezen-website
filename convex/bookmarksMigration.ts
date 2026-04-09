import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * One-time migration: prepend existing `bookmarks` rows into the matching
 * `userNotes.contentJson` as inline TimestampNode entries, then mark each
 * bookmark with `migratedAt`.
 *
 * - Groups bookmarks by (userId, moduleId)
 * - Sorts each group by videoTimestamp ascending
 * - Creates a `userNotes` row if none exists for the pair
 * - Prepends a single paragraph containing [ts][ts][ts] nodes at the top of the doc
 * - Idempotent: skips bookmarks where `migratedAt` is already set
 *
 * Run manually from the Convex dashboard (or `npx convex run ...`) once the
 * editor is live. Use `dryRun: true` first to inspect the plan without writing.
 */
export const migrateBookmarksToNotes = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, { dryRun }) => {
    const bookmarks = await ctx.db.query("bookmarks").collect();
    const pending = bookmarks.filter((b) => !b.migratedAt);

    // Group by userId × moduleId
    const groups = new Map<string, typeof pending>();
    for (const bm of pending) {
      const key = `${bm.userId}:${bm.moduleId}`;
      const list = groups.get(key) ?? [];
      list.push(bm);
      groups.set(key, list);
    }

    let notesTouched = 0;
    let notesCreated = 0;
    let bookmarksMarked = 0;

    for (const [, group] of groups) {
      const sorted = [...group].sort(
        (a, b) => a.videoTimestamp - b.videoTimestamp,
      );
      const first = sorted[0];
      if (!first) continue;

      const mod = await ctx.db.get(first.moduleId);
      if (!mod) continue;

      // Build the timestamp paragraph
      const timestampNodes = sorted.flatMap((bm) => [
        {
          type: "timestamp",
          attrs: { seconds: Math.round(bm.videoTimestamp) },
        },
        ...(bm.note ? [{ type: "text", text: ` ${bm.note}` }] : []),
        { type: "text", text: " " },
      ]);
      const prependParagraph = { type: "paragraph", content: timestampNodes };

      const existing = await ctx.db
        .query("userNotes")
        .withIndex("by_user_module", (q) =>
          q.eq("userId", first.userId).eq("moduleId", first.moduleId),
        )
        .first();

      if (existing) {
        const currentJson =
          (existing.contentJson as {
            type?: string;
            content?: unknown[];
          } | null) ?? null;
        const currentContent = Array.isArray(currentJson?.content)
          ? currentJson!.content
          : existing.content
            ? [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: existing.content }],
                },
              ]
            : [];
        const newJson = {
          type: "doc",
          content: [prependParagraph, ...currentContent],
        };
        if (!dryRun) {
          await ctx.db.patch(existing._id, {
            contentJson: newJson,
            updatedAt: Date.now(),
          });
        }
        notesTouched++;
      } else {
        const newJson = {
          type: "doc",
          content: [prependParagraph],
        };
        if (!dryRun) {
          await ctx.db.insert("userNotes", {
            userId: first.userId,
            moduleId: first.moduleId,
            trainingId: mod.trainingId,
            content: "",
            contentJson: newJson,
            updatedAt: Date.now(),
          });
        }
        notesCreated++;
      }

      if (!dryRun) {
        for (const bm of sorted) {
          await ctx.db.patch(bm._id, { migratedAt: Date.now() });
          bookmarksMarked++;
        }
      } else {
        bookmarksMarked += sorted.length;
      }
    }

    return {
      dryRun: !!dryRun,
      totalBookmarks: bookmarks.length,
      pendingBeforeRun: pending.length,
      groupsProcessed: groups.size,
      notesCreated,
      notesTouched,
      bookmarksMarked,
    };
  },
});
