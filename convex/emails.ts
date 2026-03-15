import { Resend } from "resend";
import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, action, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

const FROM = "Klaas Kroezen <noreply@klaaskroezen.com>";
const SITE_URL = "https://www.klaaskroezen.com";

function generateTrackingId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY niet geconfigureerd");
  return new Resend(key);
}

/* ═══════════════════════════════════════════
   1. SEND EMAIL (core helper)
   ═══════════════════════════════════════════ */

export const sendEmail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    template: v.string(),
    replyTo: v.optional(v.string()),
  },
  handler: async (ctx, { to, subject, html, template, replyTo }) => {
    const trackingId = generateTrackingId();

    // Inject tracking pixel before </body>
    const trackingPixel = `<img src="${SITE_URL}/api/track/open/${trackingId}/pixel.gif" width="1" height="1" style="display:none;" alt="" />`;
    let trackedHtml = html.replace("</body>", `${trackingPixel}</body>`);

    // Wrap links for click tracking (skip mailto: and unsubscribe links)
    trackedHtml = trackedHtml.replace(
      /href="(https?:\/\/[^"]+)"/g,
      (_match, url) => {
        const encoded = encodeURIComponent(url);
        return `href="${SITE_URL}/api/track/click/${trackingId}?url=${encoded}"`;
      },
    );

    try {
      const resend = getResend();
      const { data, error } = await resend.emails.send({
        from: FROM,
        to,
        subject,
        html: trackedHtml,
        replyTo: replyTo ?? "info@klaaskroezen.com",
      });

      if (error) {
        await ctx.runMutation(internal.emails.logEmail, {
          to, subject, template, status: "failed", error: error.message,
          trackingId, htmlBody: html,
        });
        return;
      }

      await ctx.runMutation(internal.emails.logEmail, {
        to, subject, template, status: "sent", resendId: data?.id,
        trackingId, htmlBody: html,
      });
    } catch (err) {
      await ctx.runMutation(internal.emails.logEmail, {
        to, subject, template, status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
        trackingId, htmlBody: html,
      });
    }
  },
});

/* ═══════════════════════════════════════════
   2. TRANSACTIONAL EMAILS
   ═══════════════════════════════════════════ */

/** Purchase confirmation with invoice details */
export const sendPurchaseConfirmation = internalAction({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, { invoiceId }) => {
    const invoice = await ctx.runQuery(internal.invoices.getInvoice, { invoiceId });
    if (!invoice) return;

    const isNl = invoice.lang === "nl";
    const subject = isNl
      ? `Bevestiging & Factuur ${invoice.invoiceNumber}`
      : `Confirmation & Invoice ${invoice.invoiceNumber}`;

    const html = buildPurchaseConfirmationHtml(invoice, isNl);

    await ctx.runAction(internal.emails.sendEmail, {
      to: invoice.buyerEmail,
      subject,
      html,
      template: "purchase-confirmation",
    });

    await ctx.runMutation(internal.invoices.markEmailSent, { invoiceId });
  },
});

/** Abandoned cart reminder */
export const sendAbandonedCartReminder = internalAction({
  args: { orderId: v.id("pendingOrders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.runQuery(internal.emails.getPendingOrder, { orderId });
    if (!order || order.convertedAt) return;

    const isNl = order.lang === "nl";
    const subject = isNl
      ? "Je bestelling staat nog voor je klaar"
      : "Your order is still waiting";

    const html = buildAbandonedCartHtml(order, isNl);

    await ctx.runAction(internal.emails.sendEmail, {
      to: order.email,
      subject,
      html,
      template: "abandoned-cart",
    });
  },
});

/* ═══════════════════════════════════════════
   3. EMAIL SEQUENCES (automated follow-ups)
   ═══════════════════════════════════════════ */

// Sequence definitions per product type
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

/** Start an email sequence after a purchase */
export const startSequence = internalMutation({
  args: {
    purchaseId: v.id("purchases"),
    userId: v.id("users"),
    email: v.string(),
    product: v.string(),
    productType: v.string(),
    lang: v.union(v.literal("nl"), v.literal("en")),
  },
  handler: async (ctx, args) => {
    const steps = args.productType === "book" ? BOOK_SEQUENCE : TRAINING_SEQUENCE;

    const seqId = await ctx.db.insert("emailSequences", {
      purchaseId: args.purchaseId,
      userId: args.userId,
      email: args.email,
      product: args.product,
      productType: args.productType,
      lang: args.lang,
      stepsSent: 0,
      totalSteps: steps.length,
      createdAt: Date.now(),
    });

    // Schedule first step
    await ctx.scheduler.runAfter(
      steps[0].delayDays * 24 * 60 * 60 * 1000,
      internal.emails.processSequenceStep,
      { sequenceId: seqId },
    );

    return seqId;
  },
});

/** Process the next step in an email sequence */
export const processSequenceStep = internalAction({
  args: { sequenceId: v.id("emailSequences") },
  handler: async (ctx, { sequenceId }) => {
    const seq = await ctx.runQuery(internal.emails.getSequence, { sequenceId });
    if (!seq || seq.completedAt || seq.cancelledAt) return;

    const steps = seq.productType === "book" ? BOOK_SEQUENCE : TRAINING_SEQUENCE;
    const stepIndex = seq.stepsSent;

    if (stepIndex >= steps.length) {
      await ctx.runMutation(internal.emails.completeSequence, { sequenceId });
      return;
    }

    const step = steps[stepIndex];
    const isNl = seq.lang === "nl";

    // Check for custom template in DB (admin-edited)
    const customTemplate = await ctx.runQuery(internal.emails.getTemplateByKey, {
      templateKey: step.template,
    });

    let subject: string;
    let html: string;

    if (customTemplate && customTemplate.active) {
      subject = isNl ? customTemplate.subjectNl : customTemplate.subjectEn;
      const body = isNl ? customTemplate.htmlNl : customTemplate.htmlEn;
      html = buildSequenceEmailHtml(seq, { ...step, subjectNl: customTemplate.subjectNl, subjectEn: customTemplate.subjectEn }, isNl, body);
    } else {
      subject = isNl ? step.subjectNl : step.subjectEn;
      html = buildSequenceEmailHtml(seq, step, isNl);
    }

    // Send the email
    await ctx.runAction(internal.emails.sendEmail, {
      to: seq.email,
      subject,
      html,
      template: step.template,
    });

    // Advance sequence
    await ctx.runMutation(internal.emails.advanceSequence, { sequenceId });

    // Schedule next step if available
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) {
      const nextStep = steps[nextIndex];
      const currentDelay = step.delayDays;
      const nextDelay = nextStep.delayDays;
      const diffDays = nextDelay - currentDelay;

      await ctx.runMutation(internal.emails.scheduleNextStep, {
        sequenceId,
        delayMs: diffDays * 24 * 60 * 60 * 1000,
      });
    } else {
      await ctx.runMutation(internal.emails.completeSequence, { sequenceId });
    }
  },
});

export const getTemplateByKey = internalQuery({
  args: { templateKey: v.string() },
  handler: async (ctx, { templateKey }) => {
    return await ctx.db
      .query("emailTemplates")
      .withIndex("by_key", (q) => q.eq("templateKey", templateKey))
      .first();
  },
});

export const getSequence = internalQuery({
  args: { sequenceId: v.id("emailSequences") },
  handler: async (ctx, { sequenceId }) => {
    return await ctx.db.get(sequenceId);
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
      internal.emails.processSequenceStep,
      { sequenceId },
    );
  },
});

/* ═══════════════════════════════════════════
   4. BROADCASTS
   ═══════════════════════════════════════════ */

/** Create a broadcast draft */
export const createBroadcast = internalMutation({
  args: {
    subject: v.string(),
    htmlBody: v.string(),
    segment: v.union(
      v.literal("all"),
      v.literal("training-buyers"),
      v.literal("book-buyers"),
      v.literal("set-buyers"),
      v.literal("cst-buyers"),
    ),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("broadcasts", {
      subject: args.subject,
      htmlBody: args.htmlBody,
      segment: args.segment,
      status: "draft",
      recipientCount: 0,
      sentCount: 0,
      failedCount: 0,
      scheduledFor: args.scheduledFor,
      createdAt: Date.now(),
    });
  },
});

/** Send a broadcast to all matching recipients */
export const sendBroadcast = internalAction({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, { broadcastId }) => {
    const broadcast = await ctx.runQuery(internal.emails.getBroadcast, { broadcastId });
    if (!broadcast || broadcast.status === "sent") return;

    // Get recipients based on segment
    const recipients = await ctx.runQuery(internal.emails.getBroadcastRecipients, {
      segment: broadcast.segment,
    });

    // Mark as sending
    await ctx.runMutation(internal.emails.updateBroadcastStatus, {
      broadcastId,
      status: "sending",
      recipientCount: recipients.length,
    });

    let sentCount = 0;
    let failedCount = 0;

    // Send in batches (Resend rate limit is 10/sec on free plan)
    for (const recipient of recipients) {
      try {
        await ctx.runAction(internal.emails.sendEmail, {
          to: recipient.email,
          subject: broadcast.subject,
          html: broadcast.htmlBody,
          template: "broadcast",
        });
        sentCount++;
      } catch {
        failedCount++;
      }

      // Small delay between sends
      await new Promise((r) => setTimeout(r, 150));
    }

    // Mark as sent
    await ctx.runMutation(internal.emails.updateBroadcastStatus, {
      broadcastId,
      status: sentCount > 0 ? "sent" : "failed",
      sentCount,
      failedCount,
    });
  },
});

export const getBroadcast = internalQuery({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, { broadcastId }) => {
    return await ctx.db.get(broadcastId);
  },
});

/** Get unique email addresses for a broadcast segment */
export const getBroadcastRecipients = internalQuery({
  args: {
    segment: v.union(
      v.literal("all"),
      v.literal("training-buyers"),
      v.literal("book-buyers"),
      v.literal("set-buyers"),
      v.literal("cst-buyers"),
    ),
  },
  handler: async (ctx, { segment }) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();

    // Filter by segment
    const filtered = purchases.filter((p) => {
      if (segment === "all") return true;
      if (segment === "training-buyers") return p.productType === "training";
      if (segment === "book-buyers") return p.productType === "book";
      if (segment === "set-buyers") return p.product.startsWith("set-");
      if (segment === "cst-buyers") return p.product.startsWith("cst-");
      return true;
    });

    // Get unique emails
    const seen = new Set<string>();
    const recipients: { email: string; userId: string }[] = [];

    for (const purchase of filtered) {
      const userId = purchase.userId;
      if (seen.has(userId)) continue;
      seen.add(userId);

      const accounts = await ctx.db
        .query("authAccounts")
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect();

      const emailAccount = accounts.find((a) => a.providerAccountId?.includes("@"));
      const user = await ctx.db.get(userId);
      const email = emailAccount?.providerAccountId ?? (user as any)?.email;

      if (email) {
        recipients.push({ email, userId });
      }
    }

    return recipients;
  },
});

export const updateBroadcastStatus = internalMutation({
  args: {
    broadcastId: v.id("broadcasts"),
    status: v.union(v.literal("draft"), v.literal("sending"), v.literal("sent"), v.literal("failed")),
    recipientCount: v.optional(v.number()),
    sentCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
  },
  handler: async (ctx, { broadcastId, status, recipientCount, sentCount, failedCount }) => {
    const patch: Record<string, unknown> = { status };
    if (recipientCount !== undefined) patch.recipientCount = recipientCount;
    if (sentCount !== undefined) patch.sentCount = sentCount;
    if (failedCount !== undefined) patch.failedCount = failedCount;
    if (status === "sent") patch.sentAt = Date.now();
    await ctx.db.patch(broadcastId, patch);
  },
});

/* ═══════════════════════════════════════════
   5. HELPERS & QUERIES
   ═══════════════════════════════════════════ */

export const getPendingOrder = internalQuery({
  args: { orderId: v.id("pendingOrders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db.get(orderId);
  },
});

export const logEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    template: v.string(),
    status: v.optional(v.union(v.literal("sent"), v.literal("failed"), v.literal("queued"))),
    resendId: v.optional(v.string()),
    error: v.optional(v.string()),
    trackingId: v.optional(v.string()),
    htmlBody: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLog", {
      to: args.to,
      subject: args.subject,
      template: args.template,
      status: args.status ?? "queued",
      resendId: args.resendId,
      error: args.error,
      trackingId: args.trackingId,
      htmlBody: args.htmlBody,
      openCount: 0,
      clickCount: 0,
      createdAt: Date.now(),
    });
  },
});

/* ═══════════════════════════════════════════
   6. EMAIL TRACKING
   ═══════════════════════════════════════════ */

/** Record an open or click event (called from API route) */
export const recordEmailEvent = internalMutation({
  args: {
    trackingId: v.string(),
    type: v.union(v.literal("open"), v.literal("click")),
    url: v.optional(v.string()),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, { trackingId, type, url, ip, userAgent }) => {
    // Find the email log entry
    const email = await ctx.db
      .query("emailLog")
      .withIndex("by_tracking", (q) => q.eq("trackingId", trackingId))
      .first();
    if (!email) return;

    // Record event
    await ctx.db.insert("emailEvents", {
      emailLogId: email._id,
      type,
      url,
      ip,
      userAgent,
      createdAt: Date.now(),
    });

    // Update counters on emailLog
    const now = Date.now();
    if (type === "open") {
      await ctx.db.patch(email._id, {
        openCount: (email.openCount ?? 0) + 1,
        lastOpenedAt: now,
      });
    } else {
      await ctx.db.patch(email._id, {
        clickCount: (email.clickCount ?? 0) + 1,
        lastClickedAt: now,
      });
    }
  },
});

/** Public mutation for tracking (called from API routes) */
export const trackEvent = mutation({
  args: {
    trackingId: v.string(),
    type: v.union(v.literal("open"), v.literal("click")),
    url: v.optional(v.string()),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, { trackingId, type, url, ip, userAgent }) => {
    const email = await ctx.db
      .query("emailLog")
      .withIndex("by_tracking", (q) => q.eq("trackingId", trackingId))
      .first();
    if (!email) return;

    await ctx.db.insert("emailEvents", {
      emailLogId: email._id,
      type,
      url,
      ip,
      userAgent,
      createdAt: Date.now(),
    });

    const now = Date.now();
    if (type === "open") {
      await ctx.db.patch(email._id, {
        openCount: (email.openCount ?? 0) + 1,
        lastOpenedAt: now,
      });
    } else {
      await ctx.db.patch(email._id, {
        clickCount: (email.clickCount ?? 0) + 1,
        lastClickedAt: now,
      });
    }
  },
});

/** Get email by tracking ID (for API routes) */
export const getEmailByTrackingId = internalQuery({
  args: { trackingId: v.string() },
  handler: async (ctx, { trackingId }) => {
    return await ctx.db
      .query("emailLog")
      .withIndex("by_tracking", (q) => q.eq("trackingId", trackingId))
      .first();
  },
});

/* ═══════════════════════════════════════════
   7. EMAIL TEMPLATE MANAGEMENT
   ═══════════════════════════════════════════ */

/** Initialize default templates (run once from admin) */
export const initializeTemplates = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("emailTemplates").collect();
    if (existing.length > 0) return; // Already initialized

    const now = Date.now();

    const trainingSteps = [
      { key: "training-welcome", delayDays: 2, subjectNl: "Welkom bij je training — begin hier", subjectEn: "Welcome to your training — start here" },
      { key: "training-tip", delayDays: 5, subjectNl: "Tip: zo haal je het meeste uit de training", subjectEn: "Tip: how to get the most from your training" },
      { key: "training-progress", delayDays: 10, subjectNl: "Hoe gaat het met je training?", subjectEn: "How is your training going?" },
      { key: "training-community", delayDays: 14, subjectNl: "Ken je de community al?", subjectEn: "Have you joined the community?" },
    ];

    const bookSteps = [
      { key: "book-started", delayDays: 2, subjectNl: "Heb je al een kijkje genomen?", subjectEn: "Have you had a look yet?" },
      { key: "book-tip", delayDays: 5, subjectNl: "Tip uit het boek: De eerste 3 minuten", subjectEn: "Tip from the book: The first 3 minutes" },
      { key: "book-training-invite", delayDays: 10, subjectNl: "Klaar voor de volgende stap? Ontdek de training", subjectEn: "Ready for the next step? Discover the training" },
      { key: "book-reminder", delayDays: 14, subjectNl: "Nog even dit — reserveer je plek", subjectEn: "Just a reminder — reserve your spot" },
    ];

    for (let i = 0; i < trainingSteps.length; i++) {
      const s = trainingSteps[i];
      const content = DEFAULT_CONTENT[s.key];
      await ctx.db.insert("emailTemplates", {
        templateKey: s.key,
        sequenceType: "training",
        stepIndex: i,
        subjectNl: s.subjectNl,
        subjectEn: s.subjectEn,
        htmlNl: content?.nl ?? "",
        htmlEn: content?.en ?? "",
        delayDays: s.delayDays,
        active: true,
        updatedAt: now,
      });
    }

    for (let i = 0; i < bookSteps.length; i++) {
      const s = bookSteps[i];
      const content = DEFAULT_CONTENT[s.key];
      await ctx.db.insert("emailTemplates", {
        templateKey: s.key,
        sequenceType: "book",
        stepIndex: i,
        subjectNl: s.subjectNl,
        subjectEn: s.subjectEn,
        htmlNl: content?.nl ?? "",
        htmlEn: content?.en ?? "",
        delayDays: s.delayDays,
        active: true,
        updatedAt: now,
      });
    }
  },
});

// Default content used during initialization
const DEFAULT_CONTENT: Record<string, { nl: string; en: string }> = {
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
<p style="border-left:3px solid #A05824;padding-left:16px;margin:16px 0;font-style:italic;">Oefen niet alles tegelijk. Pak één techniek per week en pas die bewust toe in je gesprekken. Pas als het natuurlijk voelt, ga je naar de volgende.</p>
<p>De deelnemers die dit doen zien gemiddeld 40% meer resultaat dan mensen die alles in één keer proberen.</p>`,
    en: `<p>A tip I give almost everyone after a few days of training:</p>
<p style="border-left:3px solid #A05824;padding-left:16px;margin:16px 0;font-style:italic;">Don't practice everything at once. Pick one technique per week and consciously apply it in your conversations. Only move to the next one when it feels natural.</p>
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
<p style="border-left:3px solid #A05824;padding-left:16px;margin:16px 0;font-style:italic;">De eerste 3 minuten van een gesprek bepalen 80% van het resultaat. Niet door te pitchen, maar door oprecht geïnteresseerd te zijn in de ander.</p>
<p>Probeer het vandaag eens: begin je volgende gesprek met een vraag in plaats van een verhaal.</p>`,
    en: `<p>One of the most powerful insights from the book:</p>
<p style="border-left:3px solid #A05824;padding-left:16px;margin:16px 0;font-style:italic;">The first 3 minutes of a conversation determine 80% of the outcome. Not by pitching, but by being genuinely interested in the other person.</p>
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

/* ═══════════════════════════════════════════
   8. HTML EMAIL TEMPLATES
   ═══════════════════════════════════════════ */

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F4EF;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0E0C0A;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4EF;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
<!-- Logo -->
<tr><td style="padding-bottom:32px;">
  <span style="font-size:18px;font-weight:700;color:#0E0C0A;letter-spacing:-0.02em;">Klaas Kroezen</span>
</td></tr>
<!-- Content -->
<tr><td style="background:#ffffff;border:1px solid rgba(14,12,10,0.08);padding:40px 36px;">
${content}
</td></tr>
<!-- Footer -->
<tr><td style="padding-top:24px;text-align:center;">
  <p style="font-size:12px;color:rgba(14,12,10,0.35);margin:0;">Klaas Kroezen B.V. · KVK 92622909</p>
  <p style="font-size:12px;color:rgba(14,12,10,0.35);margin:4px 0 0;">
    <a href="${SITE_URL}" style="color:rgba(14,12,10,0.35);">klaaskroezen.com</a> · <a href="mailto:info@klaaskroezen.com" style="color:rgba(14,12,10,0.35);">info@klaaskroezen.com</a>
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(url: string, text: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr><td>
<a href="${url}" style="display:inline-block;background:#A05824;color:#F7F4EF;text-decoration:none;padding:14px 32px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">${text}</a>
</td></tr></table>`;
}

function formatEuro(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function buildPurchaseConfirmationHtml(
  invoice: {
    buyerName: string;
    invoiceNumber: string;
    lineItems: Array<{ description: string; totalCents: number }>;
    subtotalCents: number;
    totalBtwCents: number;
    totalCents: number;
    btwReversed: boolean;
    noBtw: boolean;
    purchaseId: any;
  },
  isNl: boolean,
): string {
  const lineItemsHtml = invoice.lineItems
    .map((item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #EDE9E2;font-size:14px;">${item.description}</td>
        <td style="padding:8px 0;border-bottom:1px solid #EDE9E2;font-size:14px;text-align:right;">${formatEuro(item.totalCents)}</td>
      </tr>`)
    .join("");

  const btwLine = invoice.btwReversed
    ? `<span style="color:#A05824;">${isNl ? "BTW verlegd" : "VAT reverse charged"}</span>`
    : invoice.noBtw
      ? `<span style="color:rgba(14,12,10,0.4);">${isNl ? "N.v.t." : "N/A"}</span>`
      : formatEuro(invoice.totalBtwCents);

  return emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;margin:0 0 8px;color:#0E0C0A;">
      ${isNl ? "Bedankt voor je bestelling!" : "Thank you for your order!"}
    </h1>
    <p style="font-size:15px;color:rgba(14,12,10,0.6);margin:0 0 28px;line-height:1.7;">
      ${isNl
        ? `Hoi ${invoice.buyerName.split(" ")[0]}, hieronder vind je je bestelling en factuurgegevens.`
        : `Hi ${invoice.buyerName.split(" ")[0]}, below you'll find your order and invoice details.`}
    </p>

    <!-- Invoice number -->
    <p style="font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:rgba(14,12,10,0.4);margin:0 0 12px;">
      ${isNl ? "Factuurnummer" : "Invoice number"}: ${invoice.invoiceNumber}
    </p>

    <!-- Line items -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      ${lineItemsHtml}
    </table>

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:13px;color:rgba(14,12,10,0.5);padding:6px 0;">${isNl ? "Subtotaal" : "Subtotal"}</td>
        <td style="font-size:13px;text-align:right;padding:6px 0;">${formatEuro(invoice.subtotalCents)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:rgba(14,12,10,0.5);padding:6px 0;">${isNl ? "BTW" : "VAT"}</td>
        <td style="font-size:13px;text-align:right;padding:6px 0;">${btwLine}</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:600;padding:12px 0;border-top:2px solid #0E0C0A;">${isNl ? "Totaal" : "Total"}</td>
        <td style="font-size:16px;font-weight:600;text-align:right;padding:12px 0;border-top:2px solid #0E0C0A;">${formatEuro(invoice.totalCents)}</td>
      </tr>
    </table>

    ${ctaButton(`${SITE_URL}/dashboard`, isNl ? "Ga naar mijn dashboard" : "Go to my dashboard")}

    <p style="font-size:13px;color:rgba(14,12,10,0.4);margin:0;line-height:1.6;">
      ${isNl
        ? "Vragen? Mail naar info@klaaskroezen.com — we helpen je graag."
        : "Questions? Email info@klaaskroezen.com — we're happy to help."}
    </p>
  `);
}

function buildAbandonedCartHtml(
  order: { firstName: string; product: string; lang: string },
  isNl: boolean,
): string {
  return emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;margin:0 0 8px;color:#0E0C0A;">
      ${isNl ? "Je bestelling staat nog klaar" : "Your order is still waiting"}
    </h1>
    <p style="font-size:15px;color:rgba(14,12,10,0.6);margin:0 0 8px;line-height:1.7;">
      ${isNl
        ? `Hoi ${order.firstName}, je was bijna klaar met je bestelling. Je hebt 30 dagen bedenktijd — dus geen risico.`
        : `Hi ${order.firstName}, you were almost done with your order. You have a 30-day money-back guarantee — so there's no risk.`}
    </p>

    ${ctaButton(`${SITE_URL}/checkout/${order.product}`, isNl ? "Bestelling afronden" : "Complete my order")}

    <p style="font-size:13px;color:rgba(14,12,10,0.4);margin:0;line-height:1.6;">
      ${isNl
        ? "Vragen? Mail naar info@klaaskroezen.com."
        : "Questions? Email info@klaaskroezen.com."}
    </p>
  `);
}

function buildSequenceEmailHtml(
  seq: { email: string; product: string; productType: string; lang: string },
  step: { template: string; subjectNl: string; subjectEn: string },
  isNl: boolean,
  customBody?: string,
): string {
  const content = customBody ?? getSequenceContent(step.template, isNl);
  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;color:#0E0C0A;">
      ${isNl ? step.subjectNl : step.subjectEn}
    </h1>
    <div style="font-size:15px;color:rgba(14,12,10,0.7);line-height:1.8;">
      ${content}
    </div>
    ${ctaButton(`${SITE_URL}/dashboard`, isNl ? "Ga naar mijn dashboard" : "Go to my dashboard")}
    <p style="font-size:13px;color:rgba(14,12,10,0.4);margin:0;line-height:1.6;">
      ${isNl ? "— Klaas" : "— Klaas"}
    </p>
  `);
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
<p style="border-left:3px solid #A05824;padding-left:16px;margin:16px 0;font-style:italic;">Oefen niet alles tegelijk. Pak één techniek per week en pas die bewust toe in je gesprekken. Pas als het natuurlijk voelt, ga je naar de volgende.</p>
<p>De deelnemers die dit doen zien gemiddeld 40% meer resultaat dan mensen die alles in één keer proberen.</p>`,
      en: `<p>A tip I give almost everyone after a few days of training:</p>
<p style="border-left:3px solid #A05824;padding-left:16px;margin:16px 0;font-style:italic;">Don't practice everything at once. Pick one technique per week and consciously apply it in your conversations. Only move to the next one when it feels natural.</p>
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
<p style="border-left:3px solid #A05824;padding-left:16px;margin:16px 0;font-style:italic;">De eerste 3 minuten van een gesprek bepalen 80% van het resultaat. Niet door te pitchen, maar door oprecht geïnteresseerd te zijn in de ander.</p>
<p>Probeer het vandaag eens: begin je volgende gesprek met een vraag in plaats van een verhaal.</p>`,
      en: `<p>One of the most powerful insights from the book:</p>
<p style="border-left:3px solid #A05824;padding-left:16px;margin:16px 0;font-style:italic;">The first 3 minutes of a conversation determine 80% of the outcome. Not by pitching, but by being genuinely interested in the other person.</p>
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
