"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import {
  PRODUCT_NAMES,
  formatPrice,
  formatDateTime,
  Th,
  StatusBadge,
  Loading,
  EmptyState,
} from "./shared";

type SubTab = "orders" | "carts";

export function OrdersTab() {
  const [subTab, setSubTab] = useState<SubTab>("orders");

  return (
    <div className="space-y-4">
      {/* Subtab toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setSubTab("orders")}
          className={`text-[12px] px-3 py-1.5 rounded-[2px] cursor-pointer ${
            subTab === "orders"
              ? "bg-copper text-paper"
              : "border border-rule text-ink/50 hover:text-ink"
          }`}
        >
          Bestellingen
        </button>
        <button
          onClick={() => setSubTab("carts")}
          className={`text-[12px] px-3 py-1.5 rounded-[2px] cursor-pointer ${
            subTab === "carts"
              ? "bg-copper text-paper"
              : "border border-rule text-ink/50 hover:text-ink"
          }`}
        >
          Winkelmandjes
        </button>
      </div>

      {subTab === "orders" && <OrdersList />}
      {subTab === "carts" && <CartsList />}
    </div>
  );
}

function OrdersList() {
  const orders = useQuery(api.admin.getOrders, { limit: 100 });
  if (!orders) return <Loading />;
  if (orders.length === 0) return <EmptyState text="Nog geen bestellingen." />;

  return (
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
