import { internalMutation } from "./_generated/server";

/**
 * One-time cleanup: remove all test email data.
 * Run via: npx convex run cleanup:clearTestData
 */
export const clearTestData = internalMutation({
  args: {},
  handler: async (ctx) => {
    let deleted = { emailLog: 0, emailEvents: 0, pendingOrders: 0 };

    // Clear emailEvents
    const events = await ctx.db.query("emailEvents").collect();
    for (const e of events) {
      await ctx.db.delete(e._id);
      deleted.emailEvents++;
    }

    // Clear emailLog
    const logs = await ctx.db.query("emailLog").collect();
    for (const l of logs) {
      await ctx.db.delete(l._id);
      deleted.emailLog++;
    }

    // Clear test pendingOrders (unconverted only)
    const orders = await ctx.db.query("pendingOrders").collect();
    for (const o of orders) {
      if (!o.convertedAt) {
        await ctx.db.delete(o._id);
        deleted.pendingOrders++;
      }
    }

    return deleted;
  },
});
