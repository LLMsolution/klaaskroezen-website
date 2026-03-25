import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

/**
 * Backfill contacts from existing data (purchases, pending orders, contact submissions).
 * Run once to populate the contacts table from historical data.
 */
export const backfillFromExistingData = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const now = Date.now();
    let created = 0;
    let updated = 0;

    // 1. Import from purchases (these are customers)
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();

    for (const purchase of purchases) {
      const user = await ctx.db.get(purchase.userId);
      if (!user) continue;

      // Get email from auth accounts
      const accounts = await ctx.db
        .query("authAccounts")
        .filter((q) => q.eq(q.field("userId"), purchase.userId))
        .collect();
      const emailAccount = accounts.find((a: any) => a.providerAccountId?.includes("@"));
      const email = emailAccount?.providerAccountId ?? (user as any).email;
      if (!email) continue;

      const normalizedEmail = email.toLowerCase().trim();
      const existing = await ctx.db
        .query("contacts")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .first();

      if (existing) {
        // Update with userId if missing
        if (!existing.userId) {
          await ctx.db.patch(existing._id, { userId: purchase.userId });
          updated++;
        }
        // Ensure intent score reflects purchase
        if (existing.intentScore < 50) {
          await ctx.db.patch(existing._id, { intentScore: 50 });
        }
      } else {
        // Get name from pending order if available
        const pendingOrder = await ctx.db
          .query("pendingOrders")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first();

        const firstName = pendingOrder?.firstName ?? (user as any).name?.split(" ")[0] ?? "Onbekend";
        const lastName = pendingOrder?.lastName ?? (user as any).name?.split(" ").slice(1).join(" ");

        await ctx.db.insert("contacts", {
          email: normalizedEmail,
          firstName,
          lastName: lastName || undefined,
          phone: pendingOrder?.phone,
          company: pendingOrder?.company,
          userId: purchase.userId,
          engagementScore: 0,
          intentScore: 50,
          lastActivityAt: purchase.paidAt ?? purchase.createdAt,
          source: "purchase",
          sourceDetail: purchase.product,
          tags: ["klant", purchase.productType],
          unsubscribed: false,
          lang: pendingOrder?.lang ?? "nl",
          createdAt: purchase.createdAt,
        });
        created++;
      }
    }

    // 2. Import from contact submissions
    const submissions = await ctx.db.query("contactSubmissions").collect();

    for (const sub of submissions) {
      const normalizedEmail = sub.email.toLowerCase().trim();
      const existing = await ctx.db
        .query("contacts")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .first();

      if (existing) {
        // Update with info if missing
        const patch: Record<string, unknown> = {};
        if (!existing.phone && sub.phone) patch.phone = sub.phone;
        if (!existing.company && sub.company) patch.company = sub.company;
        if (Object.keys(patch).length > 0) {
          await ctx.db.patch(existing._id, patch);
          updated++;
        }
      } else {
        const nameParts = sub.name.split(" ");
        await ctx.db.insert("contacts", {
          email: normalizedEmail,
          firstName: nameParts[0] ?? sub.name,
          lastName: nameParts.slice(1).join(" ") || undefined,
          phone: sub.phone,
          company: sub.company,
          engagementScore: 0,
          intentScore: 10,
          lastActivityAt: sub.createdAt,
          source: "contact_form",
          sourceDetail: sub.subject,
          tags: sub.company ? ["bedrijf"] : [],
          unsubscribed: false,
          lang: "nl",
          createdAt: sub.createdAt,
        });
        created++;
      }
    }

    // 3. Import from unconverted pending orders (abandoned carts)
    const pendingOrders = await ctx.db
      .query("pendingOrders")
      .filter((q) => q.eq(q.field("convertedAt"), undefined))
      .collect();

    for (const order of pendingOrders) {
      const normalizedEmail = order.email.toLowerCase().trim();
      const existing = await ctx.db
        .query("contacts")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .first();

      if (!existing) {
        await ctx.db.insert("contacts", {
          email: normalizedEmail,
          firstName: order.firstName,
          lastName: order.lastName,
          phone: order.phone,
          company: order.company,
          engagementScore: 0,
          intentScore: 15,
          lastActivityAt: order.createdAt,
          source: "checkout",
          sourceDetail: order.product,
          tags: ["abandoned-cart"],
          unsubscribed: false,
          lang: order.lang,
          createdAt: order.createdAt,
        });
        created++;
      }
    }

    return { created, updated, total: created + updated };
  },
});

/**
 * Import contacts from CSV data (for ActiveCampaign export).
 * Accepts array of contact objects.
 */
export const importContacts = mutation({
  args: {
    contacts: v.array(
      v.object({
        email: v.string(),
        firstName: v.string(),
        lastName: v.optional(v.string()),
        phone: v.optional(v.string()),
        company: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, { contacts }) => {
    await requireAdmin(ctx);
    const now = Date.now();
    let created = 0;
    let skipped = 0;

    for (const c of contacts) {
      const normalizedEmail = c.email.toLowerCase().trim();
      const existing = await ctx.db
        .query("contacts")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .first();

      if (existing) {
        // Merge tags
        if (c.tags && c.tags.length > 0) {
          const merged = [...new Set([...existing.tags, ...c.tags])];
          await ctx.db.patch(existing._id, { tags: merged });
        }
        skipped++;
      } else {
        await ctx.db.insert("contacts", {
          email: normalizedEmail,
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone,
          company: c.company,
          engagementScore: 0,
          intentScore: 0,
          lastActivityAt: now,
          source: "import",
          sourceDetail: "ActiveCampaign",
          tags: c.tags ?? [],
          unsubscribed: false,
          lang: "nl",
          createdAt: now,
        });
        created++;
      }
    }

    return { created, skipped };
  },
});

/**
 * Get migration status — shows how much data has been imported.
 */
export const getMigrationStatus = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const contacts = await ctx.db.query("contacts").collect();
    const leads = await ctx.db.query("leads").collect();
    const stages = await ctx.db.query("pipelineStages").collect();
    const activities = await ctx.db.query("leadActivities").collect();
    const rules = await ctx.db.query("automationRules").collect();
    const sequences = await ctx.db.query("nurturingSequences").collect();

    return {
      contacts: contacts.length,
      leads: leads.length,
      stages: stages.length,
      activities: activities.length,
      automationRules: rules.length,
      nurturingSequences: sequences.length,
      contactsBySource: {
        purchase: contacts.filter((c) => c.source === "purchase").length,
        checkout: contacts.filter((c) => c.source === "checkout").length,
        contact_form: contacts.filter((c) => c.source === "contact_form").length,
        manual: contacts.filter((c) => c.source === "manual").length,
        import: contacts.filter((c) => c.source === "import").length,
      },
    };
  },
});
