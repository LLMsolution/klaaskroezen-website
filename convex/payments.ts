import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Internal query to get pending order details for payment creation.
 */
export const getPendingOrder = internalQuery({
  args: { orderId: v.id("pendingOrders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db.get(orderId);
  },
});

/**
 * Link Mollie payment ID to pending order.
 */
export const linkMolliePayment = internalMutation({
  args: {
    orderId: v.id("pendingOrders"),
    molliePaymentId: v.string(),
  },
  handler: async (ctx, { orderId, molliePaymentId }) => {
    await ctx.db.patch(orderId, { molliePaymentId });
  },
});

/**
 * Process a successful payment (called from Mollie webhook handler).
 * Creates the purchase record, generates invoice, triggers confirmation email,
 * and grants access rights.
 */
export const processSuccessfulPayment = internalMutation({
  args: {
    molliePaymentId: v.string(),
    amountCents: v.number(),
    pendingOrderId: v.id("pendingOrders"),
  },
  handler: async (ctx, { molliePaymentId, amountCents, pendingOrderId }) => {
    const order = await ctx.db.get(pendingOrderId);
    if (!order) throw new Error("Pending order not found");
    if (order.convertedAt) return; // Already processed

    const now = Date.now();

    // 1. Create purchase record
    const purchaseId = await ctx.db.insert("purchases", {
      userId: order.userId!,
      product: order.product,
      productType: getProductType(order.product),
      amount: amountCents,
      currency: "EUR",
      molliePaymentId,
      status: "paid",
      createdAt: now,
      paidAt: now,
    });

    // 2. Mark pending order as converted
    await ctx.db.patch(pendingOrderId, {
      convertedAt: now,
      molliePaymentId,
    });

    // 3. Build invoice line items
    const lineItems = buildLineItems(order);

    // 4. Calculate totals
    const subtotalCents = lineItems.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
    const totalBtwCents = lineItems.reduce((sum, item) => sum + item.btwCents, 0);
    const totalCents = lineItems.reduce((sum, item) => sum + item.totalCents, 0);

    // Determine BTW status
    const btwReversed = order.isBusiness && !!order.vatNumber && isEuNotNl(order.country);
    const noBtw = !isEuCountry(order.country);

    // 5. Create invoice (this also schedules the confirmation email)
    await ctx.scheduler.runAfter(0, internal.invoices.createInvoice, {
      purchaseId,
      pendingOrderId,
      molliePaymentId,
      paidAt: now,
      buyerEmail: order.email,
      buyerName: `${order.firstName} ${order.lastName}`,
      buyerCountry: order.country,
      buyerIsBusiness: order.isBusiness,
      buyerCompany: order.company,
      buyerVatNumber: order.vatNumber,
      lineItems,
      subtotalCents,
      totalBtwCents,
      totalCents,
      btwReversed,
      noBtw,
      lang: order.lang,
    });

    // 6. Grant access rights for digital products
    if (order.userId) {
      await ctx.db.insert("accessRights", {
        userId: order.userId,
        purchaseId,
        resource: order.product,
        grantedAt: now,
      });

      // Also grant access for bumps
      for (const bump of order.bumps) {
        await ctx.db.insert("accessRights", {
          userId: order.userId,
          purchaseId,
          resource: bump,
          grantedAt: now,
        });
      }
    }

    // 7. Start automated email sequence
    if (order.userId) {
      await ctx.scheduler.runAfter(0, internal.emails.startSequence, {
        purchaseId,
        userId: order.userId,
        email: order.email,
        product: order.product,
        productType: getProductType(order.product),
        lang: order.lang,
      });
    }

    return { purchaseId };
  },
});

/* ─── Helpers ─── */

function getProductType(slug: string): "training" | "book" | "event" {
  if (slug.startsWith("boek-")) return "book";
  return "training";
}

const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
];

function isEuCountry(code: string): boolean {
  return EU_COUNTRIES.includes(code);
}

function isEuNotNl(code: string): boolean {
  return isEuCountry(code) && code !== "NL";
}

// Product prices in cents (same as checkout-config but server-side)
const PRODUCT_PRICES: Record<string, { price: number; btwRate: number; inclBtw: boolean; name: { nl: string; en: string } }> = {
  "set-online": { price: 225000, btwRate: 21, inclBtw: false, name: { nl: "Sales Excellence Training — Online", en: "Sales Excellence Training — Online" } },
  "set-coaching": { price: 375000, btwRate: 21, inclBtw: false, name: { nl: "Sales Excellence Training — Training + Coaching", en: "Sales Excellence Training — Training + Coaching" } },
  "cst-online": { price: 225000, btwRate: 21, inclBtw: false, name: { nl: "Customer Success Training — Online", en: "Customer Success Training — Online" } },
  "cst-coaching": { price: 375000, btwRate: 21, inclBtw: false, name: { nl: "Customer Success Training — Training + Coaching", en: "Customer Success Training — Training + Coaching" } },
  "boek-ebook": { price: 2250, btwRate: 9, inclBtw: true, name: { nl: "Sales, Oprecht & Ontspannen — E-book", en: "Sales, Honest & Relaxed — E-book" } },
  "boek-hardcopy": { price: 3250, btwRate: 9, inclBtw: true, name: { nl: "Sales, Oprecht & Ontspannen — Hard Copy", en: "Sales, Honest & Relaxed — Hard Copy" } },
  "boek-luisterboek": { price: 2250, btwRate: 9, inclBtw: true, name: { nl: "Sales, Oprecht & Ontspannen — Luisterboek", en: "Sales, Honest & Relaxed — Audiobook" } },
};

interface PendingOrder {
  product: string;
  bumps: string[];
  isBusiness: boolean;
  vatNumber?: string;
  country: string;
  lang: "nl" | "en";
}

function buildLineItems(order: PendingOrder) {
  const items: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
    btwRate: number;
    btwCents: number;
    totalCents: number;
  }> = [];

  const applyBtw = shouldApplyBtw(order);

  // Main product
  const main = PRODUCT_PRICES[order.product];
  if (main) {
    const calculated = calcBtw(main.price, applyBtw ? main.btwRate : 0, main.inclBtw);
    items.push({
      description: main.name[order.lang],
      quantity: 1,
      unitPriceCents: calculated.net,
      btwRate: applyBtw ? main.btwRate : 0,
      btwCents: calculated.btw,
      totalCents: calculated.gross,
    });
  }

  // Bump products
  for (const bumpSlug of order.bumps) {
    const bump = PRODUCT_PRICES[bumpSlug];
    if (bump) {
      const calculated = calcBtw(bump.price, applyBtw ? bump.btwRate : 0, bump.inclBtw);
      items.push({
        description: bump.name[order.lang],
        quantity: 1,
        unitPriceCents: calculated.net,
        btwRate: applyBtw ? bump.btwRate : 0,
        btwCents: calculated.btw,
        totalCents: calculated.gross,
      });
    }
  }

  return items;
}

function shouldApplyBtw(order: PendingOrder): boolean {
  // Non-EU: no BTW
  if (!isEuCountry(order.country)) return false;
  // EU business with VAT number (not NL): reverse charge
  if (order.isBusiness && order.vatNumber && order.country !== "NL") return false;
  // NL or EU consumer: apply BTW
  return true;
}

function calcBtw(
  priceCents: number,
  btwRate: number,
  priceInclBtw: boolean,
): { net: number; btw: number; gross: number } {
  if (priceInclBtw) {
    const net = Math.round(priceCents / (1 + btwRate / 100));
    const btw = priceCents - net;
    return { net, btw, gross: priceCents };
  }
  const btw = Math.round(priceCents * (btwRate / 100));
  return { net: priceCents, btw, gross: priceCents + btw };
}
