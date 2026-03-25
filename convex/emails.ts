/**
 * Core email sending, transactional email builders, and template initialization.
 *
 * Sub-modules:
 * - emailTracking.ts  — logging & open/click tracking
 * - emailSequences.ts — automated follow-up sequences
 * - emailBroadcasts.ts — broadcast / bulk sends
 *
 * Re-exports below keep `internal.emails.*` and `api.emails.*` paths working
 * for existing callers (callers may also import directly from sub-modules).
 */

import { Resend } from "resend";
import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import * as tpl from "./emailTemplates";
import {
  layout, heading, paragraph, ctaButton as sharedCtaButton,
  formatEuro, COPPER, SITE_URL,
} from "./emailHelpers";

/* ── Re-exports (backward compat for internal.emails.* / api.emails.*) ── */

export {
  logEmail,
  recordEmailEvent,
  trackEvent,
  getEmailByTrackingId,
} from "./emailTracking";

export {
  startSequence,
  processSequenceStep,
  getTemplateByKey,
  getSequenceTemplates,
  getUnsubscribeList,
  isUnsubscribed,
  getSequence,
  advanceSequence,
  completeSequence,
  scheduleNextStep,
} from "./emailSequences";

export {
  createBroadcast,
  sendBroadcast,
  getBroadcast,
  getBroadcastRecipients,
  updateBroadcastStatus,
} from "./emailBroadcasts";

/* ═══════════════════════════════════════════
   PRIVATE HELPERS
   ═══════════════════════════════════════════ */

const FROM = "Klaas Kroezen <info@llmsolution.nl>";

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
    variant: v.optional(v.string()),
  },
  handler: async (ctx, { to, subject, html, template, replyTo, variant }) => {
    const trackingId = generateTrackingId();

    // Inject tracking pixel before </body>
    const trackingPixel = `<img src="${SITE_URL}/api/track/open/${trackingId}" width="1" height="1" style="display:none;" alt="" />`;
    let trackedHtml = html.replace("</body>", `${trackingPixel}</body>`);

    // Wrap links for click tracking (skip mailto: and unsubscribe links)
    trackedHtml = trackedHtml.replace(
      /href="(https?:\/\/[^"]+)"/g,
      (_match, url) => {
        if (url.includes("/api/unsubscribe") || url.includes("/api/track/")) {
          return `href="${url}"`;
        }
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
        await ctx.runMutation(internal.emailTracking.logEmail, {
          to, subject, template, status: "failed", error: error.message,
          trackingId, htmlBody: html, variant,
        });
        return;
      }

      await ctx.runMutation(internal.emailTracking.logEmail, {
        to, subject, template, status: "sent", resendId: data?.id,
        trackingId, htmlBody: html, variant,
      });
    } catch (err) {
      await ctx.runMutation(internal.emailTracking.logEmail, {
        to, subject, template, status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
        trackingId, htmlBody: html, variant,
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

/** Escalating abandoned cart reminder with magic link */
export const sendAbandonedCartReminder = internalAction({
  args: {
    orderId: v.id("pendingOrders"),
    step: v.optional(v.number()),
    discountCode: v.optional(v.string()),
  },
  handler: async (ctx, { orderId, step = 0, discountCode }) => {
    const order = await ctx.runQuery(internal.emails.getPendingOrder, { orderId });
    if (!order || order.convertedAt) return;

    const isNl = order.lang === "nl";
    const magicLink = `${SITE_URL}/checkout/${order.product}?recover=${orderId}`;

    // Escalating subjects
    const subjects = isNl
      ? [
          "Je bestelling staat nog klaar",
          "Nog steeds beschikbaar — rond je bestelling af",
          "Speciaal voor jou: gratis e-book erbij",
          "Laatste kans: 10% korting op je bestelling",
        ]
      : [
          "Your order is still waiting",
          "Still available — complete your order",
          "Special for you: free e-book included",
          "Last chance: 10% off your order",
        ];

    const subject = subjects[step] ?? subjects[0];

    // Build escalating email body
    let extraContent = "";
    if (step === 2) {
      extraContent = isNl
        ? "<p style='color:#B5622A;font-weight:600;'>Bonus: bestel nu en ontvang het e-book er gratis bij!</p>"
        : "<p style='color:#B5622A;font-weight:600;'>Bonus: order now and get the e-book for free!</p>";
    }
    if (step === 3 && discountCode) {
      extraContent = isNl
        ? `<p style='color:#B5622A;font-weight:600;'>Gebruik code <strong>${discountCode}</strong> voor 10% korting. Geldig voor 14 dagen.</p>`
        : `<p style='color:#B5622A;font-weight:600;'>Use code <strong>${discountCode}</strong> for 10% off. Valid for 14 days.</p>`;
    }

    const html = buildAbandonedCartHtml(order, isNl, magicLink, extraContent);

    await ctx.runAction(internal.emails.sendEmail, {
      to: order.email,
      subject,
      html,
      template: `abandoned-cart-step-${step}`,
    });
  },
});

/* ═══════════════════════════════════════════
   3. HELPERS & QUERIES
   ═══════════════════════════════════════════ */

export const getPendingOrder = internalQuery({
  args: { orderId: v.id("pendingOrders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db.get(orderId);
  },
});

/* ═══════════════════════════════════════════
   4. TEMPLATE INITIALIZATION
   ═══════════════════════════════════════════ */

/** Initialize default templates (run once from admin) */
export const initializeTemplates = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing templates for a fresh seed
    const existing = await ctx.db.query("emailTemplates").collect();
    for (const t of existing) {
      await ctx.db.delete(t._id);
    }

    const now = Date.now();

    const allTemplates = [
      // -- Transactional --
      { key: "contact-confirmation", type: "transactional", step: 0, delay: 0, subNl: "Bedankt voor je bericht — Klaas Kroezen", subEn: "Thank you for your message — Klaas Kroezen", nl: tpl.contactConfirmationNl("{{name}}", "{{subject}}", "{{message}}"), en: tpl.contactConfirmationEn("{{name}}", "{{subject}}", "{{message}}") },
      { key: "contact-notification", type: "transactional", step: 0, delay: 0, subNl: "Contactformulier: {{subject}}", subEn: "Contact form: {{subject}}", nl: tpl.contactNotification("{{name}}", "{{email}}", undefined, undefined, "{{subject}}", "{{message}}"), en: tpl.contactNotification("{{name}}", "{{email}}", undefined, undefined, "{{subject}}", "{{message}}") },
      { key: "purchase-confirmation", type: "transactional", step: 0, delay: 0, subNl: "Bedankt voor je bestelling — Klaas Kroezen", subEn: "Thank you for your order — Klaas Kroezen", nl: tpl.purchaseConfirmationNl("{{name}}", "{{product}}", "{{invoiceNumber}}"), en: tpl.purchaseConfirmationEn("{{name}}", "{{product}}", "{{invoiceNumber}}") },
      { key: "abandoned-cart", type: "transactional", step: 0, delay: 0, subNl: "Je bestelling staat nog klaar", subEn: "Your order is still waiting", nl: tpl.abandonedCartNl("{{firstName}}", "{{product}}"), en: tpl.abandonedCartEn("{{firstName}}", "{{product}}") },

      // -- Training sequence --
      { key: "training-welcome", type: "training", step: 0, delay: 0, subNl: "Welkom bij je training — begin hier", subEn: "Welcome to your training — start here", nl: tpl.trainingWelcomeNl("{{name}}", "{{training}}"), en: tpl.trainingWelcomeNl("{{name}}", "{{training}}") },
      { key: "training-tip-1", type: "training", step: 1, delay: 3, subNl: "De kracht van je eerste indruk", subEn: "The power of your first impression", nl: tpl.trainingTip1Nl("{{name}}"), en: tpl.trainingTip1Nl("{{name}}") },
      { key: "training-tip-2", type: "training", step: 2, delay: 7, subNl: "Bezwaren zijn geen afwijzing", subEn: "Objections are not rejection", nl: tpl.trainingTip2Nl("{{name}}"), en: tpl.trainingTip2Nl("{{name}}") },
      { key: "training-completion", type: "training", step: 3, delay: 30, subNl: "Gefeliciteerd — je hebt het gedaan!", subEn: "Congratulations — you did it!", nl: tpl.trainingCompletionNl("{{name}}", "{{training}}"), en: tpl.trainingCompletionNl("{{name}}", "{{training}}") },

      // -- Book sequence --
      { key: "book-welcome", type: "book", step: 0, delay: 0, subNl: "Je boek is onderweg!", subEn: "Your book is on its way!", nl: tpl.bookWelcomeNl("{{name}}", "{{format}}"), en: tpl.bookWelcomeNl("{{name}}", "{{format}}") },
      { key: "book-followup", type: "book", step: 1, delay: 5, subNl: "Hoe bevalt het boek?", subEn: "How are you enjoying the book?", nl: tpl.bookFollowUpNl("{{name}}"), en: tpl.bookFollowUpNl("{{name}}") },

      // -- Marketing --
      { key: "marketing-bestseller", type: "marketing", step: 0, delay: 0, subNl: "#1 Bestseller — Sales, Oprecht en Ontspannen", subEn: "#1 Bestseller — Sales, Honest & Relaxed", nl: tpl.marketingBestsellerNl(), en: tpl.marketingBestsellerNl() },
      { key: "marketing-training-launch", type: "marketing", step: 0, delay: 0, subNl: "Meer omzet, minder stress — Sales Excellence Training", subEn: "More revenue, less stress — Sales Excellence Training", nl: tpl.marketingTrainingLaunchNl(), en: tpl.marketingTrainingLaunchNl() },
      { key: "marketing-new-year", type: "marketing", step: 0, delay: 0, subNl: "2026 wordt jouw jaar — 3 voornemens die echt werken", subEn: "2026 is your year — 3 resolutions that actually work", nl: tpl.marketingNewYearNl(), en: tpl.marketingNewYearNl() },
      { key: "marketing-customer-success", type: "marketing", step: 0, delay: 0, subNl: "Jij verkoopt niet. Maar jij maakt het verschil.", subEn: "You don't sell. But you make the difference.", nl: tpl.marketingCustomerSuccessNl(), en: tpl.marketingCustomerSuccessNl() },
      { key: "marketing-team-training", type: "marketing", step: 0, delay: 0, subNl: "Eén taal voor je hele team — teamtraining op maat", subEn: "One language for your entire team — custom team training", nl: tpl.marketingTeamTrainingNl(), en: tpl.marketingTeamTrainingNl() },
    ];

    for (const t of allTemplates) {
      await ctx.db.insert("emailTemplates", {
        templateKey: t.key,
        sequenceType: t.type,
        stepIndex: t.step,
        subjectNl: t.subNl,
        subjectEn: t.subEn,
        htmlNl: t.nl,
        htmlEn: t.en,
        delayDays: t.delay,
        active: true,
        updatedAt: now,
      });
    }
  },
});

/* ═══════════════════════════════════════════
   5. DISCUSSION NOTIFICATION
   ═══════════════════════════════════════════ */

export const sendDiscussionNotification = internalAction({
  args: {
    moduleId: v.id("trainingModules"),
    postId: v.id("discussions"),
    userName: v.string(),
    text: v.string(),
  },
  handler: async (ctx, { moduleId, userName, text }) => {
    const mod = await ctx.runQuery(internal.emails.getModuleTitle, { moduleId });
    const moduleTitle = mod ?? "Module";

    const html = `
      <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <p style="font-size:10px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#B5622A;margin:0 0 16px;">Nieuwe discussievraag</p>
        <h1 style="font-size:22px;font-weight:700;color:#0E0C0A;margin:0 0 12px;">${moduleTitle}</h1>
        <p style="font-size:15px;color:rgba(14,12,10,0.6);margin:0 0 8px;"><strong>${userName}</strong> heeft een vraag gesteld:</p>
        <blockquote style="border-left:3px solid #B5622A;padding:12px 16px;margin:16px 0;background:#F7F4EF;">
          <p style="font-size:15px;color:#0E0C0A;margin:0;line-height:1.7;">${text}</p>
        </blockquote>
        <a href="${SITE_URL}/admin" style="display:inline-block;background:#B5622A;color:#F7F4EF;padding:14px 28px;font-size:13px;font-weight:500;text-decoration:none;letter-spacing:0.1em;text-transform:uppercase;border-radius:2px;">Bekijk in admin</a>
      </div>
    `;

    await ctx.runAction(internal.emails.sendEmail, {
      to: "klaas@klaaskroezen.com",
      subject: `Nieuwe vraag in ${moduleTitle} — ${userName}`,
      html,
      template: "discussion-notification",
    });
  },
});

export const getModuleTitle = internalQuery({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, { moduleId }) => {
    const mod = await ctx.db.get(moduleId);
    return mod?.title.nl ?? null;
  },
});

/* ═══════════════════════════════════════════
   6. HTML EMAIL BUILDERS (private)
   ═══════════════════════════════════════════ */

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
    purchaseId: string;
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
    ? `<span style="color:${COPPER};">${isNl ? "BTW verlegd" : "VAT reverse charged"}</span>`
    : invoice.noBtw
      ? `<span style="color:rgba(14,12,10,0.4);">${isNl ? "N.v.t." : "N/A"}</span>`
      : formatEuro(invoice.totalBtwCents);

  const firstName = invoice.buyerName.split(" ")[0];

  return layout(`
${heading(isNl ? "Bedankt voor je bestelling!" : "Thank you for your order!")}
${paragraph(isNl
  ? `Hoi ${firstName}, hieronder vind je je bestelling en factuurgegevens.`
  : `Hi ${firstName}, below you'll find your order and invoice details.`)}

<p style="font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:rgba(14,12,10,0.4);margin:0 0 12px;">
  ${isNl ? "Factuurnummer" : "Invoice number"}: ${invoice.invoiceNumber}
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
  ${lineItemsHtml}
</table>
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
${sharedCtaButton(isNl ? "Ga naar mijn dashboard" : "Go to my dashboard", `${SITE_URL}/dashboard`)}
${paragraph(isNl
  ? "Vragen? Mail naar info@klaaskroezen.com — we helpen je graag."
  : "Questions? Email info@klaaskroezen.com — we're happy to help.")}
`, { crossSell: "general", lang: isNl ? "nl" : "en" });
}

function buildAbandonedCartHtml(
  order: { firstName: string; product: string; lang: string },
  isNl: boolean,
  magicLink?: string,
  extraContent?: string,
): string {
  const checkoutUrl = magicLink || `${SITE_URL}/checkout/${order.product}`;

  return layout(`
${heading(isNl ? "Je bestelling staat nog klaar" : "Your order is still waiting")}
${paragraph(isNl
  ? `Hoi ${order.firstName}, je was bijna klaar met je bestelling. Je hebt 30 dagen bedenktijd — dus geen risico.`
  : `Hi ${order.firstName}, you were almost done with your order. You have a 30-day money-back guarantee — so there's no risk.`)}
${extraContent ? `<div style="margin:16px 0;padding:16px;background:#FDF8F4;border-left:3px solid ${COPPER};">${extraContent}</div>` : ""}
${sharedCtaButton(isNl ? "Bestelling afronden" : "Complete my order", checkoutUrl)}
${paragraph(isNl
  ? "Klik op de knop hierboven — je gegevens zijn al ingevuld."
  : "Click the button above — your details are already filled in.")}
`, { crossSell: "none", lang: isNl ? "nl" : "en" });
}
