"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import createMollieClient, { Locale, PaymentMethod, type Payment } from "@mollie/api-client";

// Product prices in cents (must match payments.ts)
const PRODUCT_PRICES: Record<string, number> = {
  "set-online": 225000,
  "set-coaching": 375000,
  "cst-online": 225000,
  "cst-coaching": 375000,
  "boek-ebook": 2250,
  "boek-hardcopy": 3250,
  "boek-luisterboek": 2250,
};

export const createMolliePayment = action({
  args: {
    pendingOrderId: v.id("pendingOrders"),
    method: v.string(),
  },
  handler: async (ctx, { pendingOrderId, method }) => {
    const order = await ctx.runQuery(internal.payments.getPendingOrder, {
      orderId: pendingOrderId,
    });
    if (!order) throw new Error("Bestelling niet gevonden.");

    const allSlugs = [order.product, ...order.bumps];
    let totalCents = 0;
    for (const slug of allSlugs) {
      const p = PRODUCT_PRICES[slug];
      if (p) totalCents += p;
    }

    const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });
    const payment = await (mollieClient.payments.create({
      amount: { currency: "EUR", value: (totalCents / 100).toFixed(2) },
      description: `Klaas Kroezen — ${order.product}`,
      redirectUrl: `${process.env.SITE_URL}/checkout/bedankt?email=${encodeURIComponent(order.email)}&product=${order.product}&lang=${order.lang}`,
      webhookUrl: `${process.env.SITE_URL}/api/webhooks/mollie`,
      method: method as PaymentMethod,
      metadata: { pendingOrderId, product: order.product },
      locale: order.lang === "nl" ? Locale.nl_NL : Locale.en_US,
    }) as Promise<Payment>);

    await ctx.runMutation(internal.payments.linkMolliePayment, {
      orderId: pendingOrderId,
      molliePaymentId: payment.id,
    });

    const checkoutUrl = payment.getCheckoutUrl();
    if (!checkoutUrl) throw new Error("Geen checkout URL ontvangen van Mollie.");

    return { checkoutUrl };
  },
});

export const handleMollieWebhook = action({
  args: { molliePaymentId: v.string() },
  handler: async (ctx, { molliePaymentId }) => {
    const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });
    const payment = await (mollieClient.payments.get(molliePaymentId) as Promise<Payment>);

    if (payment.status === "paid") {
      const metadata = payment.metadata as { pendingOrderId: string };
      const amountCents = Math.round(parseFloat(payment.amount.value) * 100);

      await ctx.runMutation(internal.payments.processSuccessfulPayment, {
        molliePaymentId,
        amountCents,
        pendingOrderId: metadata.pendingOrderId as Id<"pendingOrders">,
      });
    }

    return { processed: true };
  },
});
