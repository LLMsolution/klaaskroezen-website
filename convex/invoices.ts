import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Create an invoice after successful payment.
 * Called internally after Mollie webhook confirms payment.
 */
export const createInvoice = internalMutation({
  args: {
    purchaseId: v.id("purchases"),
    pendingOrderId: v.optional(v.id("pendingOrders")),
    molliePaymentId: v.string(),
    paidAt: v.number(),

    // Buyer info
    buyerEmail: v.string(),
    buyerName: v.string(),
    buyerCountry: v.string(),
    buyerIsBusiness: v.boolean(),
    buyerCompany: v.optional(v.string()),
    buyerVatNumber: v.optional(v.string()),

    // Line items
    lineItems: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPriceCents: v.number(),
        btwRate: v.number(),
        btwCents: v.number(),
        totalCents: v.number(),
      }),
    ),

    // Totals
    subtotalCents: v.number(),
    totalBtwCents: v.number(),
    totalCents: v.number(),

    btwReversed: v.boolean(),
    noBtw: v.boolean(),
    lang: v.union(v.literal("nl"), v.literal("en")),
  },
  handler: async (ctx, args) => {
    // Generate sequential invoice number
    const invoiceNumber = await getNextInvoiceNumberInternal(ctx);

    const invoiceId = await ctx.db.insert("invoices", {
      invoiceNumber,
      purchaseId: args.purchaseId,
      pendingOrderId: args.pendingOrderId,
      buyerEmail: args.buyerEmail,
      buyerName: args.buyerName,
      buyerCountry: args.buyerCountry,
      buyerIsBusiness: args.buyerIsBusiness,
      buyerCompany: args.buyerCompany,
      buyerVatNumber: args.buyerVatNumber,
      lineItems: args.lineItems,
      subtotalCents: args.subtotalCents,
      totalBtwCents: args.totalBtwCents,
      totalCents: args.totalCents,
      currency: "EUR",
      btwReversed: args.btwReversed,
      noBtw: args.noBtw,
      lang: args.lang,
      molliePaymentId: args.molliePaymentId,
      paidAt: args.paidAt,
      createdAt: Date.now(),
      emailSent: false,
    });

    // Schedule confirmation email
    await ctx.scheduler.runAfter(
      0,
      internal.emails.sendPurchaseConfirmation,
      { invoiceId },
    );

    return { invoiceId, invoiceNumber };
  },
});

/**
 * Internal helper for sequential invoice number generation within a mutation.
 */
async function getNextInvoiceNumberInternal(ctx: { db: any }) {
  const year = new Date().getFullYear();

  const counter = await ctx.db
    .query("invoiceCounters")
    .withIndex("by_year", (q: any) => q.eq("year", year))
    .first();

  let nextNumber: number;

  if (counter) {
    nextNumber = counter.lastNumber + 1;
    await ctx.db.patch(counter._id, { lastNumber: nextNumber });
  } else {
    nextNumber = 1;
    await ctx.db.insert("invoiceCounters", {
      year,
      lastNumber: 1,
    });
  }

  return `KK-${year}-${String(nextNumber).padStart(4, "0")}`;
}

/**
 * Get invoice by ID (for rendering PDF or display).
 */
export const getInvoice = internalQuery({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, { invoiceId }) => {
    return await ctx.db.get(invoiceId);
  },
});

/**
 * Get invoice by purchase ID.
 */
export const getInvoiceByPurchase = query({
  args: { purchaseId: v.id("purchases") },
  handler: async (ctx, { purchaseId }) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_purchase", (q) => q.eq("purchaseId", purchaseId))
      .first();
  },
});

/**
 * Get all invoices for a user by email (for customer dashboard).
 */
export const getInvoicesByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_email", (q) => q.eq("buyerEmail", email))
      .collect();
  },
});

/**
 * Get all invoices (admin dashboard).
 */
export const listInvoices = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit }) => {
    const invoices = await ctx.db
      .query("invoices")
      .order("desc")
      .take(limit ?? 50);

    return invoices;
  },
});

/**
 * Mark invoice email as sent.
 */
export const markEmailSent = internalMutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, { invoiceId }) => {
    await ctx.db.patch(invoiceId, { emailSent: true });
  },
});

/**
 * Store PDF reference on invoice.
 */
export const attachPdf = internalMutation({
  args: {
    invoiceId: v.id("invoices"),
    pdfStorageId: v.id("_storage"),
  },
  handler: async (ctx, { invoiceId, pdfStorageId }) => {
    await ctx.db.patch(invoiceId, { pdfStorageId });
  },
});
