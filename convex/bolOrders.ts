import { v } from "convex/values";
import { query, internalQuery, internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";

// ── Bol.com API helpers (pure functions for use in actions) ──

const TOKEN_URL = "https://login.bol.com/token";
const BASE_URL = "https://api.bol.com";

async function getBolToken(clientId: string, clientSecret: string): Promise<string> {
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${credentials}` },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Bol.com OAuth fout (${res.status})`);
  const data = await res.json();
  return data.access_token;
}

async function bolRequest<T>(token: string, endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/vnd.retailer.v10+json", Authorization: `Bearer ${token}` },
  });
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 5000));
    return bolRequest(token, endpoint, params);
  }
  if (!res.ok) throw new Error(`Bol.com API fout (${res.status})`);
  return res.json();
}

type BolOrderItem = { orderItemId: string; product?: { ean?: string; title?: string }; quantity?: number; unitPrice?: number };
type BolOrder = {
  orderId: string;
  orderPlacedDateTime?: string;
  shipmentDetails?: { firstName?: string; surname?: string; streetName?: string; houseNumber?: string; houseNumberExtension?: string; zipCode?: string; city?: string; countryCode?: string; email?: string; company?: string; deliveryPhoneNumber?: string };
  billingDetails?: { firstName?: string; surname?: string; email?: string; company?: string };
  orderItems: BolOrderItem[];
};

// ── Sync action (called by cron) ──

export const syncOrders = internalAction({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.BOL_COM_CLIENT_ID;
    const clientSecret = process.env.BOL_COM_CLIENT_SECRET;
    if (!clientId || !clientSecret) return;

    const token = await getBolToken(clientId, clientSecret);

    // Get existing order IDs to skip
    const existing = await ctx.runQuery(internal.bolOrders.getAllOrderIds);
    const knownIds = new Set(existing);

    // Fetch order list (status=ALL, recent)
    const listRes = await bolRequest<{ orders?: { orderId: string }[] }>(token, "/retailer/orders", { status: "ALL" });
    const allIds = (listRes.orders ?? []).map((o) => o.orderId);
    const newIds = allIds.filter((id) => !knownIds.has(id));

    if (newIds.length === 0) return;

    // Fetch details for new orders (batched)
    for (let i = 0; i < newIds.length; i += 5) {
      if (i > 0) await new Promise((r) => setTimeout(r, 500));
      const batch = newIds.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map((id) => bolRequest<BolOrder>(token, `/retailer/orders/${id}`)),
      );

      for (const result of results) {
        if (result.status !== "fulfilled") continue;
        const order = result.value;
        const ship = order.shipmentDetails ?? {};
        const bill = order.billingDetails ?? {};
        const firstItem = order.orderItems?.[0];
        const totalCents = Math.round(
          (order.orderItems ?? []).reduce((sum, item) => sum + (item.unitPrice ?? 0) * (item.quantity ?? 1), 0) * 100,
        );

        await ctx.runMutation(internal.bolOrders.insertOrder, {
          orderId: order.orderId,
          product: firstItem?.product?.title ?? "Onbekend",
          sku: firstItem?.product?.ean ?? "",
          quantity: firstItem?.quantity ?? 1,
          company: ship.company || bill.company || undefined,
          firstName: ship.firstName || bill.firstName || "Onbekend",
          lastName: ship.surname || bill.surname || "",
          email: (ship.email || bill.email || "").toLowerCase(),
          phone: ship.deliveryPhoneNumber || undefined,
          street: ship.streetName ?? "",
          houseNumber: ship.houseNumber ?? "",
          postalCode: ship.zipCode ?? "",
          city: ship.city ?? "",
          countryCode: ship.countryCode ?? "NL",
          amountCents: totalCents,
          amountWithTaxCents: totalCents, // Bol.com prices include VAT
          vatRate: 9, // Books = 9% BTW
          shippingCostsCents: 0,
          paidAt: order.orderPlacedDateTime ?? new Date().toISOString(),
        });
      }
    }
  },
});

// ── Internal mutations ──

export const insertOrder = internalMutation({
  args: {
    orderId: v.string(), product: v.string(), sku: v.string(), quantity: v.number(),
    company: v.optional(v.string()), firstName: v.string(), lastName: v.string(),
    email: v.string(), phone: v.optional(v.string()),
    street: v.string(), houseNumber: v.string(), postalCode: v.string(), city: v.string(), countryCode: v.string(),
    amountCents: v.number(), amountWithTaxCents: v.number(), vatRate: v.number(), shippingCostsCents: v.number(),
    paidAt: v.string(),
  },
  handler: async (ctx, args) => {
    // Deduplicate
    const exists = await ctx.db.query("bolOrders").withIndex("by_orderId", (q) => q.eq("orderId", args.orderId)).first();
    if (exists) return;

    await ctx.db.insert("bolOrders", {
      ...args,
      crmNotified: false,
      importedAt: Date.now(),
    });

    // CRM: create contact with all available info
    if (args.email.includes("@")) {
      await ctx.scheduler.runAfter(0, internal.crmHooks.bolOrderCompleted, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        company: args.company,
        product: args.product,
        amountCents: args.amountCents,
        street: args.street,
        houseNumber: args.houseNumber,
        postalCode: args.postalCode,
        city: args.city,
        countryCode: args.countryCode,
      });
    }
  },
});

export const getAllOrderIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("bolOrders").collect();
    return orders.map((o) => o.orderId);
  },
});

// ── Admin queries ──

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("bolOrders")
      .order("desc")
      .take(limit ?? 100);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const orders = await ctx.db.query("bolOrders").collect();
    const totalRevenue = orders.reduce((sum, o) => sum + o.amountWithTaxCents, 0);
    const totalOrders = orders.length;
    const totalBooks = orders.reduce((sum, o) => sum + o.quantity, 0);

    // This month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thisMonth = orders.filter((o) => o.paidAt >= monthStart);
    const monthRevenue = thisMonth.reduce((sum, o) => sum + o.amountWithTaxCents, 0);

    return { totalRevenue, totalOrders, totalBooks, monthRevenue, monthOrders: thisMonth.length };
  },
});
