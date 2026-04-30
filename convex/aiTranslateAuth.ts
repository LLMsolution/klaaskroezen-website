import { mutation } from "./_generated/server";
import { rateLimiter } from "./rateLimits";
import { requireAdmin } from "./adminAuth";

/**
 * Admin auth + rate-limit gate for AI translation. Lives in a regular
 * (non-Node) Convex module so it can access ctx.db, then is called from
 * the Node action wrappers via runMutation.
 */
export const verifyAndConsumeLimit = mutation({
  args: {},
  handler: async (ctx) => {
    const { email } = await requireAdmin(ctx);
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "aiTranslate", {
      key: email,
    });
    if (!ok) {
      throw new Error(
        `Te veel vertalingen. Probeer het over ${Math.ceil(
          (retryAfter ?? 60000) / 60000,
        )} minuten opnieuw.`,
      );
    }
  },
});
