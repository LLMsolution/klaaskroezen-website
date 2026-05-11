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

const FROM = "Klaas Kroezen <klaas@klaaskroezen.nl>";

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
    pdfStorageId: v.optional(v.id("_storage")),
    pdfFileName: v.optional(v.string()),
  },
  handler: async (ctx, { to, subject, html, template, replyTo, variant, pdfStorageId, pdfFileName }) => {
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

    // Build PDF attachment if storageId provided
    let attachments: Array<{ filename: string; content: string }> | undefined;
    if (pdfStorageId) {
      const url = await ctx.storage.getUrl(pdfStorageId);
      if (url) {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        attachments = [{ filename: pdfFileName ?? "factuur.pdf", content: btoa(binary) }];
      }
    }

    try {
      const resend = getResend();
      const { data, error } = await resend.emails.send({
        from: FROM,
        to,
        subject,
        html: trackedHtml,
        replyTo: replyTo ?? "klaas@klaaskroezen.nl",
        attachments,
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

    const lang: "nl" | "en" | "de" =
      invoice.lang === "nl" || invoice.lang === "de" ? invoice.lang : "en";
    const subject = lang === "nl"
      ? `Bevestiging & Factuur ${invoice.invoiceNumber}`
      : lang === "de"
        ? `Bestätigung & Rechnung ${invoice.invoiceNumber}`
        : `Confirmation & Invoice ${invoice.invoiceNumber}`;

    const [purchase, pdfResult, bumpSlugs] = await Promise.all([
      ctx.runQuery(internal.emails.getPurchaseById, { purchaseId: invoice.purchaseId }),
      ctx.runAction(internal.invoicePdf.generateAndAttachInvoicePdf, { invoiceId }).catch((err) => {
        console.error("[sendPurchaseConfirmation] PDF generation failed for invoice", invoiceId, err);
        return null;
      }),
      ctx.runQuery(internal.emails.getBumpsByMolliePaymentId, { molliePaymentId: invoice.molliePaymentId }),
    ]);
    const productVariant = purchase?.product
      ? await ctx.runQuery(internal.emails.getProductVariantBySlug, { slug: purchase.product })
      : undefined;
    const bumpVariants = bumpSlugs.length
      ? await Promise.all(bumpSlugs.map((slug) =>
          ctx.runQuery(internal.emails.getProductVariantBySlug, { slug })
        ))
      : [];
    const html = buildPurchaseConfirmationHtml(
      invoice, lang, purchase?.product, productVariant ?? undefined,
      bumpVariants.filter((v): v is ProductVariant => !!v),
    );

    const fileName = `factuur-${invoice.invoiceNumber}.pdf`;
    await ctx.runAction(internal.emails.sendEmail, {
      to: invoice.buyerEmail,
      subject,
      html,
      template: "purchase-confirmation",
      pdfStorageId: pdfResult?.storageId as any ?? undefined,
      pdfFileName: fileName,
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

/** Celebration email fired once when a cursist passes the final required quiz. */
export const sendTrainingCompletionEmail = internalAction({
  args: {
    userId: v.id("users"),
    trainingId: v.id("trainings"),
  },
  handler: async (ctx, { userId, trainingId }) => {
    const data = await ctx.runQuery(internal.emails.getCompletionRecipient, {
      userId,
      trainingId,
    });
    if (!data) return;
    if (!data.email) return;

    const isNl = data.lang === "nl";
    const trainingTitle = isNl ? data.titleNl : data.titleEn;
    const firstName = data.name?.split(" ")[0] || (isNl ? "daar" : "there");

    const body = tpl.trainingCompletionNl(firstName, trainingTitle);
    const html = layout(body, {
      preheader: isNl
        ? "Gefeliciteerd met het afronden van je training"
        : "Congratulations on completing your training",
      crossSell: "training",
      lang: isNl ? "nl" : "en",
    });

    await ctx.runAction(internal.emails.sendEmail, {
      to: data.email,
      subject: isNl
        ? "Gefeliciteerd — je hebt het gedaan!"
        : "Congratulations — you did it!",
      html,
      template: "training-completion-celebration",
    });

    await ctx.runMutation(internal.emails.markCompletionEmailSent, {
      userId,
      trainingId,
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

export const getPurchaseById = internalQuery({
  args: { purchaseId: v.id("purchases") },
  handler: async (ctx, { purchaseId }) => {
    return await ctx.db.get(purchaseId);
  },
});

/** Look up a product's variant by slug — used by transactional email branching. */
export const getProductVariantBySlug = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query("checkoutProducts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    return product?.productVariant;
  },
});

/** Get bump slugs from a pending order by Mollie payment ID. */
export const getBumpsByMolliePaymentId = internalQuery({
  args: { molliePaymentId: v.string() },
  handler: async (ctx, { molliePaymentId }) => {
    const order = await ctx.db
      .query("pendingOrders")
      .withIndex("by_mollie", (q) => q.eq("molliePaymentId", molliePaymentId))
      .first();
    return order?.bumps ?? [];
  },
});

/** Gather everything the completion email needs in one query. */
export const getCompletionRecipient = internalQuery({
  args: { userId: v.id("users"), trainingId: v.id("trainings") },
  handler: async (ctx, { userId, trainingId }) => {
    const user = await ctx.db.get(userId);
    const training = await ctx.db.get(trainingId);
    if (!user || !training) return null;

    // Resolve email via authAccounts (email-based providers store it there)
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    const emailAccount = accounts.find((a) =>
      a.providerAccountId?.includes("@"),
    );
    const userRec = user as unknown as { email?: string; name?: string };
    const email = emailAccount?.providerAccountId ?? userRec.email ?? "";

    return {
      email,
      name: userRec.name ?? "",
      lang: "nl" as const,
      titleNl: training.title.nl,
      titleEn: training.title.en,
    };
  },
});

/** Stamp trainingCompletions row with emailSentAt to prevent duplicate sends. */
export const markCompletionEmailSent = internalMutation({
  args: { userId: v.id("users"), trainingId: v.id("trainings") },
  handler: async (ctx, { userId, trainingId }) => {
    const row = await ctx.db
      .query("trainingCompletions")
      .withIndex("by_user_training", (q) =>
        q.eq("userId", userId).eq("trainingId", trainingId),
      )
      .first();
    if (row) {
      await ctx.db.patch(row._id, { emailSentAt: Date.now() });
    }
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
      { key: "book-welcome", type: "book", step: 0, delay: 0, subNl: "Bedankt voor je bestelling!", subEn: "Thank you for your order!", subDe: "Vielen Dank für Ihre Bestellung!", nl: tpl.bookWelcomeNl("{{name}}", "{{format}}"), en: tpl.bookWelcomeEn("{{name}}", "{{format}}"), de: tpl.bookWelcomeDe("{{name}}", "{{format}}") },
      { key: "book-followup", type: "book", step: 1, delay: 5, subNl: "Hoe bevalt het boek?", subEn: "How are you enjoying the book?", subDe: "Wie gefällt Ihnen das Buch?", nl: tpl.bookFollowUpNl("{{name}}"), en: tpl.bookFollowUpEn("{{name}}"), de: tpl.bookFollowUpDe("{{name}}") },

      // -- Marketing --
      { key: "marketing-bestseller", type: "marketing", step: 0, delay: 0, subNl: "#1 Bestseller — Sales, Oprecht en Ontspannen", subEn: "#1 Bestseller — Sales, Honest & Relaxed", nl: tpl.marketingBestsellerNl(), en: tpl.marketingBestsellerNl() },
      { key: "marketing-training-launch", type: "marketing", step: 0, delay: 0, subNl: "Meer omzet, minder stress — Sales Excellence Training", subEn: "More revenue, less stress — Sales Excellence Training", nl: tpl.marketingTrainingLaunchNl(), en: tpl.marketingTrainingLaunchNl() },
      { key: "marketing-new-year", type: "marketing", step: 0, delay: 0, subNl: "2026 wordt jouw jaar — 3 voornemens die echt werken", subEn: "2026 is your year — 3 resolutions that actually work", nl: tpl.marketingNewYearNl(), en: tpl.marketingNewYearNl() },
      { key: "marketing-customer-success", type: "marketing", step: 0, delay: 0, subNl: "Jij verkoopt niet. Maar jij maakt het verschil.", subEn: "You don't sell. But you make the difference.", nl: tpl.marketingCustomerSuccessNl(), en: tpl.marketingCustomerSuccessNl() },
      { key: "marketing-team-training", type: "marketing", step: 0, delay: 0, subNl: "Eén taal voor je hele team — teamtraining op maat", subEn: "One language for your entire team — custom team training", nl: tpl.marketingTeamTrainingNl(), en: tpl.marketingTeamTrainingNl() },
    ];

    for (const t of allTemplates) {
      const tt = t as typeof t & { subDe?: string; de?: string };
      await ctx.db.insert("emailTemplates", {
        templateKey: t.key,
        sequenceType: t.type,
        stepIndex: t.step,
        subjectNl: t.subNl,
        subjectEn: t.subEn,
        subjectDe: tt.subDe,
        htmlNl: t.nl,
        htmlEn: t.en,
        htmlDe: tt.de,
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
      to: "klaas@klaaskroezen.nl",
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

type ProductVariant = "ebook" | "audiobook" | "hardcopy" | "online-course" | "coaching" | "event";

function buildPurchaseConfirmationHtml(
  invoice: {
    buyerName: string;
    buyerEmail: string;
    invoiceNumber: string;
    lineItems: Array<{ description: string; totalCents: number }>;
    subtotalCents: number;
    totalBtwCents: number;
    totalCents: number;
    btwReversed: boolean;
    noBtw: boolean;
    purchaseId: string;
  },
  lang: "nl" | "en" | "de",
  productSlug?: string,
  productVariant?: ProductVariant,
  bumpVariants?: ProductVariant[],
): string {
  const t = (s: { nl: string; en: string; de: string }) => s[lang];
  const layoutLang: "nl" | "en" = lang === "nl" ? "nl" : "en";

  const lineItemsHtml = invoice.lineItems
    .map((item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #EDE9E2;font-size:14px;">${item.description}</td>
        <td style="padding:8px 0;border-bottom:1px solid #EDE9E2;font-size:14px;text-align:right;">${formatEuro(item.totalCents)}</td>
      </tr>`)
    .join("");

  const btwLine = invoice.btwReversed
    ? `<span style="color:${COPPER};">${t({ nl: "BTW verlegd", en: "VAT reverse charged", de: "Umkehrung der Steuerschuldnerschaft" })}</span>`
    : invoice.noBtw
      ? `<span style="color:rgba(14,12,10,0.4);">${t({ nl: "N.v.t.", en: "N/A", de: "Entfällt" })}</span>`
      : formatEuro(invoice.totalBtwCents);

  const firstName = invoice.buyerName.split(" ")[0];

  const emailParam = encodeURIComponent(invoice.buyerEmail);
  const loginBase = `${SITE_URL}/login/kopen?email=${emailParam}&next=`;
  const dashboardUrl = `${loginBase}${encodeURIComponent("/dashboard")}`;
  const downloadsUrl = `${loginBase}${encodeURIComponent("/dashboard#downloads")}`;
  let bookSection = "";
  let primaryCta: { label: string; href: string } = {
    label: t({ nl: "Ga naar mijn dashboard", en: "Go to my dashboard", de: "Zu meinem Dashboard" }),
    href: dashboardUrl,
  };

  // Resolve effective variant — prefer DB value, fall back to legacy slug check.
  const effectiveVariant: ProductVariant | undefined =
    productVariant ??
    (productSlug === "boek-ebook"
      ? "ebook"
      : productSlug === "boek-luisterboek"
        ? "audiobook"
        : productSlug === "boek-hardcopy"
          ? "hardcopy"
          : undefined);

  if (effectiveVariant === "ebook") {
    bookSection = paragraph(t({
      nl: "Je <strong>e-book</strong> staat klaar in je dashboard onder Downloads — direct te lezen op computer, tablet of telefoon.",
      en: "Your <strong>e-book</strong> is ready in your dashboard under Downloads — read it right away on your computer, tablet, or phone.",
      de: "Ihr <strong>E-Book</strong> steht in Ihrem Dashboard unter Downloads bereit — sofort lesbar auf Computer, Tablet oder Smartphone.",
    }));
    primaryCta = {
      label: t({ nl: "Download je e-book", en: "Download your e-book", de: "E-Book herunterladen" }),
      href: downloadsUrl,
    };
  } else if (effectiveVariant === "audiobook") {
    bookSection = paragraph(t({
      nl: "Je <strong>luisterboek</strong> vind je in je dashboard onder Trainingen — luister onderweg, tijdens het sporten of thuis op de bank.",
      en: "Your <strong>audiobook</strong> is in your dashboard under Trainings — listen on the go, while exercising, or at home.",
      de: "Ihr <strong>Hörbuch</strong> finden Sie in Ihrem Dashboard unter Trainings — hören Sie unterwegs, beim Sport oder zu Hause.",
    }));
    primaryCta = {
      label: t({ nl: "Naar je luisterboek", en: "Go to your audiobook", de: "Zu Ihrem Hörbuch" }),
      href: dashboardUrl,
    };
  } else if (effectiveVariant === "hardcopy") {
    bookSection = paragraph(t({
      nl: "Je <strong>fysieke boek</strong> wordt binnen 2 werkdagen verzonden naar het adres dat je hebt opgegeven. Je ontvangt een aparte mail zodra het pakket onderweg is.",
      en: "Your <strong>physical book</strong> ships within 2 business days to the address you provided. You'll receive a separate email once it's on its way.",
      de: "Ihr <strong>physisches Buch</strong> wird innerhalb von 2 Werktagen an die angegebene Adresse versandt. Sie erhalten eine separate E-Mail, sobald das Paket unterwegs ist.",
    }));
  }

  // Add bump-specific sections for variants not already covered by the main product.
  const coveredVariants = new Set<ProductVariant>(effectiveVariant ? [effectiveVariant] : []);
  for (const bumpVariant of bumpVariants ?? []) {
    if (coveredVariants.has(bumpVariant)) continue;
    coveredVariants.add(bumpVariant);
    if (bumpVariant === "ebook") {
      bookSection += paragraph(t({
        nl: "Je <strong>e-book</strong> staat klaar in je dashboard onder Downloads — direct te lezen op computer, tablet of telefoon.",
        en: "Your <strong>e-book</strong> is ready in your dashboard under Downloads — read it right away on your computer, tablet, or phone.",
        de: "Ihr <strong>E-Book</strong> steht in Ihrem Dashboard unter Downloads bereit — sofort lesbar auf Computer, Tablet oder Smartphone.",
      }));
    } else if (bumpVariant === "audiobook") {
      bookSection += paragraph(t({
        nl: "Je <strong>luisterboek</strong> vind je in je dashboard onder Trainingen — luister onderweg, tijdens het sporten of thuis op de bank.",
        en: "Your <strong>audiobook</strong> is in your dashboard under Trainings — listen on the go, while exercising, or at home.",
        de: "Ihr <strong>Hörbuch</strong> finden Sie in Ihrem Dashboard unter Trainings — hören Sie unterwegs, beim Sport oder zu Hause.",
      }));
    } else if (bumpVariant === "hardcopy") {
      bookSection += paragraph(t({
        nl: "Je <strong>fysieke boek</strong> wordt binnen 2 werkdagen verzonden naar het adres dat je hebt opgegeven. Je ontvangt een aparte mail zodra het pakket onderweg is.",
        en: "Your <strong>physical book</strong> ships within 2 business days to the address you provided. You'll receive a separate email once it's on its way.",
        de: "Ihr <strong>physisches Buch</strong> wird innerhalb von 2 Werktagen an die angegebene Adresse versandt. Sie erhalten eine separate E-Mail, sobald das Paket unterwegs ist.",
      }));
    }
  }

  return layout(`
${heading(t({ nl: "Bedankt voor je bestelling!", en: "Thank you for your order!", de: "Vielen Dank für Ihre Bestellung!" }))}
${paragraph(t({
  nl: `Hoi ${firstName}, hieronder vind je je bestelling en factuurgegevens.`,
  en: `Hi ${firstName}, below you'll find your order and invoice details.`,
  de: `Hallo ${firstName}, unten finden Sie Ihre Bestellung und Rechnungsdaten.`,
}))}
${bookSection}

<p style="font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:rgba(14,12,10,0.4);margin:0 0 12px;">
  ${t({ nl: "Factuurnummer", en: "Invoice number", de: "Rechnungsnummer" })}: ${invoice.invoiceNumber}
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
  ${lineItemsHtml}
</table>
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="font-size:13px;color:rgba(14,12,10,0.5);padding:6px 0;">${t({ nl: "Subtotaal", en: "Subtotal", de: "Zwischensumme" })}</td>
    <td style="font-size:13px;text-align:right;padding:6px 0;">${formatEuro(invoice.subtotalCents)}</td>
  </tr>
  <tr>
    <td style="font-size:13px;color:rgba(14,12,10,0.5);padding:6px 0;">${t({ nl: "BTW", en: "VAT", de: "MwSt." })}</td>
    <td style="font-size:13px;text-align:right;padding:6px 0;">${btwLine}</td>
  </tr>
  <tr>
    <td style="font-size:16px;font-weight:600;padding:12px 0;border-top:2px solid #0E0C0A;">${t({ nl: "Totaal", en: "Total", de: "Gesamt" })}</td>
    <td style="font-size:16px;font-weight:600;text-align:right;padding:12px 0;border-top:2px solid #0E0C0A;">${formatEuro(invoice.totalCents)}</td>
  </tr>
</table>
${sharedCtaButton(primaryCta.label, primaryCta.href)}
${paragraph(t({
  nl: "Vragen? Mail naar klaas@klaaskroezen.nl — we helpen je graag.",
  en: "Questions? Email klaas@klaaskroezen.nl — we're happy to help.",
  de: "Fragen? Schreiben Sie an klaas@klaaskroezen.nl — wir helfen Ihnen gerne.",
}))}
`, { crossSell: "general", lang: layoutLang });
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
