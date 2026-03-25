"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import createMollieClient, { Locale, PaymentMethod, type Payment } from "@mollie/api-client";

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

    // Get main product price from DB
    const mainProduct = await ctx.runQuery(
      internal.checkoutProducts.getProductPriceData,
      { slug: order.product },
    );
    if (!mainProduct) throw new Error(`Product "${order.product}" niet gevonden.`);

    // Calculate main product charge, respecting quantity tiers and installments
    let chargeAmountCents = mainProduct.priceCents;

    // Apply quantity tier pricing
    if (order.quantity && order.quantity > 1 && mainProduct.quantityTiers) {
      const tier = mainProduct.quantityTiers.find(
        (t: { quantity: number }) => t.quantity === order.quantity,
      );
      if (tier) chargeAmountCents = tier.unitPriceCents * order.quantity;
      else chargeAmountCents = mainProduct.priceCents * order.quantity;
    } else if (order.quantity && order.quantity > 1) {
      chargeAmountCents = mainProduct.priceCents * order.quantity;
    }

    // Apply installment pricing (charge per term, not full price)
    if (order.installments && mainProduct.installments) {
      chargeAmountCents = mainProduct.installments.amountPerTermCents;
    }

    let totalCents = chargeAmountCents;
    const overridesMap = new Map(
      mainProduct.bumpPriceOverrides.map(
        (o: { bumpSlug: string; priceCents: number }) => [o.bumpSlug, o.priceCents],
      ),
    );

    let bumpTotal = 0;
    for (const bumpSlug of order.bumps) {
      const overridePrice = overridesMap.get(bumpSlug);
      if (overridePrice !== undefined) {
        bumpTotal += overridePrice;
      } else {
        const bumpData = await ctx.runQuery(
          internal.checkoutProducts.getProductPriceData,
          { slug: bumpSlug },
        );
        bumpTotal += bumpData?.priceCents ?? 0;
      }
    }
    // Apply bundle discount: 15% off bumps when 2+ selected
    if (order.bumps.length >= 2) {
      bumpTotal = Math.round(bumpTotal * 0.85);
    }
    totalCents += bumpTotal;

    const siteUrl = process.env.SITE_URL!;
    const webhookBaseUrl = process.env.MOLLIE_WEBHOOK_URL || siteUrl;

    const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });
    const payment = await (mollieClient.payments.create({
      amount: { currency: "EUR", value: (totalCents / 100).toFixed(2) },
      description: `Klaas Kroezen — ${order.product}`,
      redirectUrl: `${siteUrl}/checkout/bedankt?email=${encodeURIComponent(order.email)}&product=${order.product}&lang=${order.lang}&orderId=${pendingOrderId}`,
      webhookUrl: `${webhookBaseUrl}/api/webhooks/mollie`,
      method: method as PaymentMethod,
      metadata: { pendingOrderId, product: order.product },
      locale: order.lang === "nl" ? Locale.nl_NL : order.lang === "de" ? Locale.de_DE : Locale.en_US,
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
