import { internalMutation } from "./_generated/server";

/**
 * Seed default automation rules and nurturing sequences.
 * Idempotent: only runs if automationRules table is empty.
 * Run via: npx convex run automationSeed:seed
 */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existingRules = await ctx.db.query("automationRules").first();
    if (existingRules) return { seeded: false };

    const now = Date.now();

    // ── Automation Rules ──
    const rules = [
      {
        name: "Hoge koopintentie → Team notificeren",
        trigger: "score_threshold" as const,
        action: "notify_team" as const,
        triggerConfig: JSON.stringify({ scoreType: "intent", threshold: 40 }),
        actionConfig: JSON.stringify({ notifyEmail: "klaas@klaaskroezen.com" }),
      },
      {
        name: "Checkout verlaten → Lead aanmaken",
        trigger: "checkout_abandoned" as const,
        action: "create_lead" as const,
        triggerConfig: JSON.stringify({}),
        actionConfig: JSON.stringify({ titlePrefix: "Abandoned checkout" }),
      },
      {
        name: "Contactformulier → Lead aanmaken",
        trigger: "contact_form" as const,
        action: "create_lead" as const,
        triggerConfig: JSON.stringify({}),
        actionConfig: JSON.stringify({ titlePrefix: "Contactformulier" }),
      },
      {
        name: "Aankoop → Team notificeren",
        trigger: "purchase" as const,
        action: "notify_team" as const,
        triggerConfig: JSON.stringify({}),
        actionConfig: JSON.stringify({ notifyEmail: "klaas@klaaskroezen.com" }),
      },
      {
        name: "14 dagen inactief → Lead opvolgen",
        trigger: "inactivity" as const,
        action: "notify_team" as const,
        triggerConfig: JSON.stringify({ inactiveDays: 14 }),
        actionConfig: JSON.stringify({ notifyEmail: "klaas@klaaskroezen.com" }),
      },
    ];

    for (const rule of rules) {
      await ctx.db.insert("automationRules", {
        ...rule,
        active: true,
        executionCount: 0,
        createdAt: now,
      });
    }

    // ── Nurturing Sequences ──

    // 1. Na contactformulier — warm houden
    const contactSeqId = await ctx.db.insert("nurturingSequences", {
      name: "Na contactformulier",
      description: "Automatische follow-up na contactformulier. Bouwt vertrouwen op en leidt naar training.",
      active: true,
      totalSteps: 3,
      enrolledCount: 0,
      completedCount: 0,
      createdAt: now,
    });

    const contactSteps = [
      { templateKey: "training-welcome", delayDays: 3, order: 0 },
      { templateKey: "training-tips", delayDays: 7, order: 1 },
      { templateKey: "training-results", delayDays: 14, order: 2 },
    ];
    for (const step of contactSteps) {
      await ctx.db.insert("nurturingSteps", {
        sequenceId: contactSeqId,
        ...step,
        createdAt: now,
      });
    }

    // 2. Na event/spreker — opvolging
    const eventSeqId = await ctx.db.insert("nurturingSequences", {
      name: "Na event of keynote",
      description: "Follow-up na een spreker sessie of event. Deelt waardevolle content en leidt naar training.",
      active: true,
      totalSteps: 3,
      enrolledCount: 0,
      completedCount: 0,
      createdAt: now,
    });

    const eventSteps = [
      { templateKey: "training-welcome", delayDays: 1, order: 0 },
      { templateKey: "book-started", delayDays: 5, order: 1 },
      { templateKey: "training-results", delayDays: 12, order: 2 },
    ];
    for (const step of eventSteps) {
      await ctx.db.insert("nurturingSteps", {
        sequenceId: eventSeqId,
        ...step,
        createdAt: now,
      });
    }

    return {
      seeded: true,
      rules: rules.length,
      sequences: 2,
    };
  },
});
