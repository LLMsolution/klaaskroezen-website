/**
 * Email sequences: automated follow-up email chains triggered after purchases.
 * Supports dynamic DB-driven templates with A/B testing, falling back to hardcoded sequences.
 */

import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { langValidator } from "./schema";
import {
  layout, heading, paragraph, ctaButton as sharedCtaButton,
  COPPER, SITE_URL,
} from "./emailHelpers";

/* ═══════════════════════════════════════════
   SEQUENCE DEFINITIONS
   ═══════════════════════════════════════════ */

const TRAINING_SEQUENCE = [
  { delayDays: 2, template: "training-welcome", subjectNl: "Welkom bij je training — begin hier", subjectEn: "Welcome to your training — start here" },
  { delayDays: 5, template: "training-tip", subjectNl: "Tip: zo haal je het meeste uit de training", subjectEn: "Tip: how to get the most from your training" },
  { delayDays: 10, template: "training-progress", subjectNl: "Hoe gaat het met je training?", subjectEn: "How is your training going?" },
  { delayDays: 14, template: "training-community", subjectNl: "Ken je de community al?", subjectEn: "Have you joined the community?" },
];

const BOOK_SEQUENCE = [
  { delayDays: 2, template: "book-started", subjectNl: "Heb je al een kijkje genomen?", subjectEn: "Have you had a look yet?" },
  { delayDays: 5, template: "book-tip", subjectNl: "Tip uit het boek: De eerste 3 minuten", subjectEn: "Tip from the book: The first 3 minutes" },
  { delayDays: 10, template: "book-training-invite", subjectNl: "Klaar voor de volgende stap? Ontdek de training", subjectEn: "Ready for the next step? Discover the training" },
  { delayDays: 14, template: "book-reminder", subjectNl: "Nog even dit — reserveer je plek", subjectEn: "Just a reminder — reserve your spot" },
];

/* ═══════════════════════════════════════════
   START SEQUENCE
   ═══════════════════════════════════════════ */

/** Start an email sequence after a purchase */
export const startSequence = internalMutation({
  args: {
    purchaseId: v.id("purchases"),
    userId: v.id("users"),
    email: v.string(),
    product: v.string(),
    productType: v.string(),
    lang: langValidator,
  },
  handler: async (ctx, args) => {
    // Dynamic: read active templates from DB, fall back to hardcoded
    const dbTemplates = await ctx.db
      .query("emailTemplates")
      .withIndex("by_sequence", (q) => q.eq("sequenceType", args.productType))
      .collect();
    const activeDbTemplates = dbTemplates.filter((t) => t.active).sort((a, b) => a.stepIndex - b.stepIndex);
    const fallbackSteps = args.productType === "book" ? BOOK_SEQUENCE : TRAINING_SEQUENCE;
    const totalSteps = activeDbTemplates.length > 0 ? activeDbTemplates.length : fallbackSteps.length;
    const firstDelay = activeDbTemplates.length > 0 ? activeDbTemplates[0].delayDays : fallbackSteps[0].delayDays;

    const seqId = await ctx.db.insert("emailSequences", {
      purchaseId: args.purchaseId,
      userId: args.userId,
      email: args.email,
      product: args.product,
      productType: args.productType,
      lang: args.lang,
      stepsSent: 0,
      totalSteps: totalSteps,
      createdAt: Date.now(),
    });

    // Schedule first step
    await ctx.scheduler.runAfter(
      firstDelay * 24 * 60 * 60 * 1000,
      internal.emailSequences.processSequenceStep,
      { sequenceId: seqId },
    );

    return seqId;
  },
});

/* ═══════════════════════════════════════════
   PROCESS SEQUENCE STEP
   ═══════════════════════════════════════════ */

/** Process the next step in an email sequence */
export const processSequenceStep = internalAction({
  args: { sequenceId: v.id("emailSequences") },
  handler: async (ctx, { sequenceId }) => {
    const seq = await ctx.runQuery(internal.emailSequences.getSequence, { sequenceId });
    if (!seq || seq.completedAt || seq.cancelledAt) return;

    const stepIndex = seq.stepsSent;
    const isNl = seq.lang === "nl";

    // Dynamic: load templates from DB, fall back to hardcoded
    const dbTemplates = await ctx.runQuery(internal.emailSequences.getSequenceTemplates, {
      sequenceType: seq.productType,
    });
    const fallbackSteps = seq.productType === "book" ? BOOK_SEQUENCE : TRAINING_SEQUENCE;
    const useDb = dbTemplates.length > 0;
    const totalSteps = useDb ? dbTemplates.length : fallbackSteps.length;

    if (stepIndex >= totalSteps) {
      await ctx.runMutation(internal.emailSequences.completeSequence, { sequenceId });
      return;
    }

    // Check unsubscribe
    const unsub = await ctx.runQuery(internal.emailSequences.isUnsubscribed, { email: seq.email });
    if (unsub) {
      await ctx.runMutation(internal.emailSequences.completeSequence, { sequenceId });
      return;
    }

    let subject: string;
    let html: string;
    let templateName: string;
    let currentDelay: number;
    let nextDelay: number | null = null;
    let variant: string | undefined;

    if (useDb) {
      const tpl = dbTemplates[stepIndex];
      // A/B test: randomly pick variant B if active and B content exists
      const useB = tpl.abTestActive && tpl.htmlNlB && tpl.htmlEnB && Math.random() < 0.5;
      variant = tpl.abTestActive ? (useB ? "B" : "A") : undefined;

      subject = useB
        ? (isNl ? (tpl.subjectNlB ?? tpl.subjectNl) : (tpl.subjectEnB ?? tpl.subjectEn))
        : (isNl ? tpl.subjectNl : tpl.subjectEn);
      const body = useB
        ? (isNl ? (tpl.htmlNlB ?? tpl.htmlNl) : (tpl.htmlEnB ?? tpl.htmlEn))
        : (isNl ? tpl.htmlNl : tpl.htmlEn);
      html = buildSequenceEmailHtml(seq, { ...tpl, template: tpl.templateKey }, isNl, body);
      templateName = tpl.templateKey;
      currentDelay = tpl.delayDays;
      if (stepIndex + 1 < dbTemplates.length) nextDelay = dbTemplates[stepIndex + 1].delayDays;
    } else {
      const step = fallbackSteps[stepIndex];

      // Check for admin-edited override
      const customTemplate = await ctx.runQuery(internal.emailSequences.getTemplateByKey, {
        templateKey: step.template,
      });

      if (customTemplate && customTemplate.active) {
        // A/B test on custom template
        const useB = customTemplate.abTestActive && customTemplate.htmlNlB && customTemplate.htmlEnB && Math.random() < 0.5;
        variant = customTemplate.abTestActive ? (useB ? "B" : "A") : undefined;

        subject = useB
          ? (isNl ? (customTemplate.subjectNlB ?? customTemplate.subjectNl) : (customTemplate.subjectEnB ?? customTemplate.subjectEn))
          : (isNl ? customTemplate.subjectNl : customTemplate.subjectEn);
        const body = useB
          ? (isNl ? (customTemplate.htmlNlB ?? customTemplate.htmlNl) : (customTemplate.htmlEnB ?? customTemplate.htmlEn))
          : (isNl ? customTemplate.htmlNl : customTemplate.htmlEn);
        html = buildSequenceEmailHtml(seq, { ...step, subjectNl: customTemplate.subjectNl, subjectEn: customTemplate.subjectEn }, isNl, body);
      } else {
        subject = isNl ? step.subjectNl : step.subjectEn;
        html = buildSequenceEmailHtml(seq, step, isNl);
      }
      templateName = step.template;
      currentDelay = step.delayDays;
      if (stepIndex + 1 < fallbackSteps.length) nextDelay = fallbackSteps[stepIndex + 1].delayDays;
    }

    // Resolve template variables ({{name}}, {{firstName}}, {{product}}, {{training}})
    const purchase = await ctx.runQuery(internal.emailSequences.getPurchase, { purchaseId: seq.purchaseId });
    const buyerName = purchase?.buyerEmail
      ? (await ctx.runQuery(internal.emailSequences.getContactName, { email: purchase.buyerEmail }))
      : null;
    const name = buyerName?.firstName
      ? [buyerName.firstName, buyerName.lastName].filter(Boolean).join(" ")
      : (purchase?.buyerEmail?.split("@")[0] ?? "");
    const firstName = buyerName?.firstName ?? name.split(" ")[0] ?? "";

    html = html
      .replaceAll("{{name}}", name)
      .replaceAll("{{firstName}}", firstName)
      .replaceAll("{{product}}", seq.product)
      .replaceAll("{{training}}", seq.product);
    subject = subject
      .replaceAll("{{name}}", name)
      .replaceAll("{{firstName}}", firstName)
      .replaceAll("{{product}}", seq.product);

    // Send via core sendEmail in emails.ts
    await ctx.runAction(internal.emails.sendEmail, {
      to: seq.email,
      subject,
      html,
      template: templateName,
      variant,
    });

    await ctx.runMutation(internal.emailSequences.advanceSequence, { sequenceId });

    // Schedule next step
    if (nextDelay !== null) {
      const diffDays = nextDelay - currentDelay;
      await ctx.runMutation(internal.emailSequences.scheduleNextStep, {
        sequenceId,
        delayMs: diffDays * 24 * 60 * 60 * 1000,
      });
    } else {
      await ctx.runMutation(internal.emailSequences.completeSequence, { sequenceId });
    }
  },
});

/* ═══════════════════════════════════════════
   SEQUENCE QUERIES & MUTATIONS
   ═══════════════════════════════════════════ */

export const getTemplateByKey = internalQuery({
  args: { templateKey: v.string() },
  handler: async (ctx, { templateKey }) => {
    return await ctx.db
      .query("emailTemplates")
      .withIndex("by_key", (q) => q.eq("templateKey", templateKey))
      .first();
  },
});

export const getSequenceTemplates = internalQuery({
  args: { sequenceType: v.string() },
  handler: async (ctx, { sequenceType }) => {
    const templates = await ctx.db
      .query("emailTemplates")
      .withIndex("by_sequence", (q) => q.eq("sequenceType", sequenceType))
      .collect();
    return templates
      .filter((t) => t.active)
      .sort((a, b) => a.stepIndex - b.stepIndex);
  },
});

export const getUnsubscribeList = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("unsubscribes").collect();
  },
});

export const isUnsubscribed = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const entry = await ctx.db
      .query("unsubscribes")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();
    return !!entry;
  },
});

export const getSequence = internalQuery({
  args: { sequenceId: v.id("emailSequences") },
  handler: async (ctx, { sequenceId }) => {
    return await ctx.db.get(sequenceId);
  },
});

export const getPurchase = internalQuery({
  args: { purchaseId: v.id("purchases") },
  handler: async (ctx, { purchaseId }) => {
    return await ctx.db.get(purchaseId);
  },
});

export const getContactName = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();
    if (contact) return { firstName: contact.firstName, lastName: contact.lastName };
    return null;
  },
});

export const advanceSequence = internalMutation({
  args: { sequenceId: v.id("emailSequences") },
  handler: async (ctx, { sequenceId }) => {
    const seq = await ctx.db.get(sequenceId);
    if (!seq) return;
    await ctx.db.patch(sequenceId, {
      stepsSent: seq.stepsSent + 1,
      lastSentAt: Date.now(),
    });
  },
});

export const completeSequence = internalMutation({
  args: { sequenceId: v.id("emailSequences") },
  handler: async (ctx, { sequenceId }) => {
    await ctx.db.patch(sequenceId, { completedAt: Date.now() });
  },
});

export const scheduleNextStep = internalMutation({
  args: { sequenceId: v.id("emailSequences"), delayMs: v.number() },
  handler: async (ctx, { sequenceId, delayMs }) => {
    await ctx.scheduler.runAfter(
      delayMs,
      internal.emailSequences.processSequenceStep,
      { sequenceId },
    );
  },
});

/* ═══════════════════════════════════════════
   HTML BUILDERS
   ═══════════════════════════════════════════ */

function buildSequenceEmailHtml(
  seq: { email: string; product: string; productType: string; lang: string },
  step: { template: string; subjectNl: string; subjectEn: string },
  isNl: boolean,
  customBody?: string,
): string {
  const crossSell = seq.productType === "book" ? "training" as const : "book" as const;

  if (customBody) {
    return layout(customBody, { crossSell, lang: isNl ? "nl" : "en" });
  }

  const content = getSequenceContent(step.template, isNl);
  return layout(`
${heading(isNl ? step.subjectNl : step.subjectEn)}
<div style="font-size:15px;color:#444;line-height:1.8;">
  ${content}
</div>
${sharedCtaButton(isNl ? "Ga naar mijn dashboard" : "Go to my dashboard", `${SITE_URL}/dashboard`)}
${paragraph(isNl ? "— Klaas" : "— Klaas")}
`, { crossSell, lang: isNl ? "nl" : "en" });
}

function getSequenceContent(template: string, isNl: boolean): string {
  const content: Record<string, { nl: string; en: string }> = {
    "training-welcome": {
      nl: `<p>Welkom bij je training! Je kunt nu inloggen en direct beginnen.</p>
<p>Ik raad je aan om met Module 1 te starten en deze eerst helemaal af te ronden voordat je verder gaat. Elk onderdeel bouwt voort op het vorige.</p>
<p>Mijn tip: maak aantekeningen in het werkboek terwijl je de modules doorwerkt. De mensen die dat doen halen het meeste resultaat.</p>`,
      en: `<p>Welcome to your training! You can log in and start right away.</p>
<p>I recommend starting with Module 1 and completing it fully before moving on. Each part builds on the previous one.</p>
<p>My tip: take notes in the workbook as you go through the modules. The people who do this get the best results.</p>`,
    },
    "training-tip": {
      nl: `<p>Een tip die ik bijna iedereen geef na een paar dagen training:</p>
<p style="border-left:3px solid ${COPPER};padding-left:16px;margin:16px 0;font-style:italic;">Oefen niet alles tegelijk. Pak een techniek per week en pas die bewust toe in je gesprekken. Pas als het natuurlijk voelt, ga je naar de volgende.</p>
<p>De deelnemers die dit doen zien gemiddeld 40% meer resultaat dan mensen die alles in een keer proberen.</p>`,
      en: `<p>A tip I give almost everyone after a few days of training:</p>
<p style="border-left:3px solid ${COPPER};padding-left:16px;margin:16px 0;font-style:italic;">Don't practice everything at once. Pick one technique per week and consciously apply it in your conversations. Only move to the next one when it feels natural.</p>
<p>Participants who do this see an average of 40% better results than those who try everything at once.</p>`,
    },
    "training-progress": {
      nl: `<p>Het is nu zo'n 10 dagen geleden dat je bent begonnen. Hoe gaat het?</p>
<p>Als je vastloopt of vragen hebt, mail me gerust op info@klaaskroezen.com. Ik beantwoord elke mail persoonlijk.</p>
<p>En vergeet niet: je hebt 12 maanden toegang. Er is geen haast — neem de tijd die je nodig hebt.</p>`,
      en: `<p>It's been about 10 days since you started. How's it going?</p>
<p>If you're stuck or have questions, feel free to email me at info@klaaskroezen.com. I answer every email personally.</p>
<p>And remember: you have 12 months of access. There's no rush — take the time you need.</p>`,
    },
    "training-community": {
      nl: `<p>Wist je dat er een community is voor deelnemers van de training?</p>
<p>Hier kun je vragen stellen, ervaringen delen en van andere professionals leren. De meeste vragen worden binnen een dag beantwoord — vaak door mij persoonlijk.</p>`,
      en: `<p>Did you know there's a community for training participants?</p>
<p>Here you can ask questions, share experiences, and learn from other professionals. Most questions are answered within a day — often by me personally.</p>`,
    },
    "book-started": {
      nl: `<p>Je hebt het boek nu een paar dagen. Ben je al begonnen met lezen?</p>
<p>Mijn tip: begin met hoofdstuk 3 — "De eerste drie minuten". Dat is het hoofdstuk waar de meeste lezers een directe aha-ervaring hebben.</p>
<p>En als je het luisterboek hebt: perfect voor onderweg of tijdens het sporten.</p>`,
      en: `<p>You've had the book for a few days now. Have you started reading yet?</p>
<p>My tip: start with chapter 3 — "The first three minutes". That's the chapter where most readers have their first aha moment.</p>
<p>And if you have the audiobook: perfect for commuting or exercising.</p>`,
    },
    "book-tip": {
      nl: `<p>Een van de krachtigste inzichten uit het boek:</p>
<p style="border-left:3px solid ${COPPER};padding-left:16px;margin:16px 0;font-style:italic;">De eerste 3 minuten van een gesprek bepalen 80% van het resultaat. Niet door te pitchen, maar door oprecht geinteresseerd te zijn in de ander.</p>
<p>Probeer het vandaag eens: begin je volgende gesprek met een vraag in plaats van een verhaal.</p>`,
      en: `<p>One of the most powerful insights from the book:</p>
<p style="border-left:3px solid ${COPPER};padding-left:16px;margin:16px 0;font-style:italic;">The first 3 minutes of a conversation determine 80% of the outcome. Not by pitching, but by being genuinely interested in the other person.</p>
<p>Try it today: start your next conversation with a question instead of a story.</p>`,
    },
    "book-training-invite": {
      nl: `<p>Nu je het boek hebt gelezen (of althans een stuk), vraag ik me af: wil je er meer mee doen?</p>
<p>De Sales Excellence Training gaat dieper in op alles uit het boek — met video's, oefeningen en persoonlijke feedback. En als boeklezer heb je al een voorsprong.</p>`,
      en: `<p>Now that you've read the book (or at least part of it), I'm wondering: would you like to take it further?</p>
<p>The Sales Excellence Training goes deeper into everything from the book — with videos, exercises, and personal feedback. And as a book reader, you already have a head start.</p>`,
    },
    "book-reminder": {
      nl: `<p>Nog even dit: ik geef regelmatig trainingen en de plekken zijn beperkt. Als je overweegt om je aan te melden, doe het niet te laat.</p>
<p>En vergeet niet: je hebt 30 dagen bedenktijd op elke training. Geen risico.</p>`,
      en: `<p>Just a reminder: I regularly give trainings and spots are limited. If you're considering signing up, don't wait too long.</p>
<p>And remember: you have a 30-day money-back guarantee on every training. No risk.</p>`,
    },
  };

  const c = content[template];
  return c ? (isNl ? c.nl : c.en) : "<p>—</p>";
}
