"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { ExportButtons } from "./ExportButtons";
import {
  PRODUCT_NAMES,
  formatPrice,
  formatDateTime,
  Th,
  StatusBadge,
  Loading,
  EmptyState,
} from "./shared";

type SubTab = "orders" | "bolcom" | "carts";

export function OrdersTab() {
  const [subTab, setSubTab] = useState<SubTab>("orders");

  const tabs: { key: SubTab; label: string }[] = [
    { key: "orders", label: "Bestellingen" },
    { key: "bolcom", label: "Bol.com" },
    { key: "carts", label: "Winkelmandjes" },
  ];

  return (
    <div className="space-y-4">
      {/* Subtab toggle */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`text-[12px] px-3 py-1.5 rounded-[2px] cursor-pointer ${
              subTab === tab.key
                ? "bg-copper text-paper"
                : "border border-rule text-ink/50 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === "orders" && <OrdersList />}
      {subTab === "bolcom" && <BolcomOrdersList />}
      {subTab === "carts" && <CartsList />}
    </div>
  );
}

function OrdersList() {
  const orders = useQuery(api.admin.getOrders, { limit: 100 });
  if (!orders) return <Loading />;
  if (orders.length === 0) return <EmptyState text="Nog geen bestellingen." />;

  const exportData = orders.map((o) => ({
    paidAt: o.paidAt ? new Date(o.paidAt).toISOString() : "",
    product: PRODUCT_NAMES[o.product] || o.product,
    quantity: 1,
    amount: o.amount,
    firstName: o.userName?.split(" ")[0] ?? "",
    lastName: o.userName?.split(" ").slice(1).join(" ") ?? "",
    email: o.userEmail ?? "",
    source: "mollie",
  }));

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ExportButtons orders={exportData} />
      </div>
      <div className="border border-rule rounded-[2px] overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-rule bg-warm/30">
            <Th>Klant</Th>
            <Th>Product</Th>
            <Th>Bedrag</Th>
            <Th>Status</Th>
            <Th>Factuur</Th>
            <Th>Datum</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
              <td className="px-4 py-3">
                <p className="text-[13px] font-medium text-ink">{order.userName}</p>
                <p className="text-[11px] text-ink/40">{order.userEmail}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[13px] text-ink">{PRODUCT_NAMES[order.product] || order.product}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[13px] text-ink tabular-nums">{formatPrice(order.amount)}</p>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3">
                {order.invoiceNumber ? (
                  <Link
                    href={`/api/invoice/${order._id}`}
                    target="_blank"
                    className="text-[11px] text-copper font-medium hover:text-copper-light transition-colors"
                  >
                    {order.invoiceNumber}
                  </Link>
                ) : (
                  <span className="text-[11px] text-ink/30">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <p className="text-[12px] text-ink/50">{order.paidAt ? formatDateTime(order.paidAt) : formatDateTime(order.createdAt)}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

function BolcomOrdersList() {
  const orders = useQuery(api.bolOrders.list, { limit: 100 });
  const stats = useQuery(api.bolOrders.getStats);
  if (!orders || !stats) return <Loading />;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-rule rounded-[2px] p-4">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">Totaal orders</p>
          <p className="text-[20px] font-bold text-ink tabular-nums">{stats.totalOrders}</p>
        </div>
        <div className="border border-rule rounded-[2px] p-4">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">Omzet (incl. BTW)</p>
          <p className="text-[20px] font-bold text-ink tabular-nums">{formatPrice(stats.totalRevenue)}</p>
        </div>
        <div className="border border-rule rounded-[2px] p-4">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">Deze maand</p>
          <p className="text-[20px] font-bold text-ink tabular-nums">{formatPrice(stats.monthRevenue)}</p>
          <p className="text-[11px] text-ink/40">{stats.monthOrders} orders</p>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="flex justify-end">
          <ExportButtons orders={orders.map((o) => ({
            paidAt: o.paidAt,
            product: o.product,
            quantity: o.quantity,
            amount: o.amountWithTaxCents,
            company: o.company,
            firstName: o.firstName,
            lastName: o.lastName,
            email: o.email,
            street: o.street,
            houseNumber: o.houseNumber,
            postalCode: o.postalCode,
            city: o.city,
            countryCode: o.countryCode,
            source: "bolcom",
          }))} />
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState text="Nog geen Bol.com orders. De sync draait elke 5 minuten." />
      ) : (
        <div className="border border-rule rounded-[2px] overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-rule bg-warm/30">
                <Th>Klant</Th>
                <Th>Product</Th>
                <Th>Aantal</Th>
                <Th>Bedrag</Th>
                <Th>Stad</Th>
                <Th>Datum</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-ink">{order.firstName} {order.lastName}</p>
                    <p className="text-[11px] text-ink/40">{order.email}</p>
                    {order.company && <p className="text-[11px] text-ink/30">{order.company}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] text-ink">{order.product}</p>
                    <p className="text-[11px] text-ink/30 font-mono">{order.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-ink tabular-nums">{order.quantity}</td>
                  <td className="px-4 py-3 text-[13px] text-ink tabular-nums">{formatPrice(order.amountWithTaxCents)}</td>
                  <td className="px-4 py-3 text-[12px] text-ink/50">{order.city}</td>
                  <td className="px-4 py-3 text-[12px] text-ink/50">{new Date(order.paidAt).toLocaleDateString("nl-NL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CartsList() {
  const carts = useQuery(api.admin.getPendingCarts, { limit: 100 });
  if (!carts) return <Loading />;
  if (carts.length === 0) return <EmptyState text="Geen open winkelmandjes." />;

  return (
    <div className="border border-rule rounded-[2px] overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-rule bg-warm/30">
            <Th>Klant</Th>
            <Th>Product</Th>
            <Th>Reminders</Th>
            <Th>Aangemaakt</Th>
          </tr>
        </thead>
        <tbody>
          {carts.map((cart) => (
            <tr key={cart._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
              <td className="px-4 py-3">
                <p className="text-[13px] font-medium text-ink">{cart.firstName} {cart.lastName}</p>
                <p className="text-[11px] text-ink/40">{cart.email}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[13px] text-ink">{PRODUCT_NAMES[cart.product] || cart.product}</p>
                {cart.bumps.length > 0 && (
                  <p className="text-[11px] text-ink/40">+ {cart.bumps.map((b) => PRODUCT_NAMES[b] || b).join(", ")}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <p className="text-[12px] text-ink/50">{cart.remindersSent} / 3</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[12px] text-ink/50">{formatDateTime(cart.createdAt)}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
