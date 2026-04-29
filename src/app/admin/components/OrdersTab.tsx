"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { ExportButtons } from "./ExportButtons";
import { OrdersFilterPanel, type OrdersFilterState } from "./OrdersFilterPanel";
import {
  PRODUCT_NAMES,
  formatPrice,
  formatDateTime,
  Th,
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

const PAGE_SIZE = 25;

type SortField =
  | "paidAt"
  | "quantity"
  | "amount"
  | "product"
  | "company"
  | "userName"
  | "userEmail"
  | "city";

const DEFAULT_FILTERS: OrdersFilterState = {
  product: [],
  productLogic: "or",
  startDate: "",
  endDate: "",
  nameQuery: "",
  minQuantity: "",
  maxQuantity: "",
};

function OrdersList() {
  const orders = useQuery(api.admin.getOrders, { limit: 500 });
  const [filters, setFilters] = useState<OrdersFilterState>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>("paidAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const { product, startDate, endDate, nameQuery, minQuantity, maxQuantity } = filters;
    const minQty = minQuantity ? parseInt(minQuantity, 10) : null;
    const maxQty = maxQuantity ? parseInt(maxQuantity, 10) : null;
    const start = startDate ? new Date(startDate).getTime() : null;
    const end = endDate ? new Date(endDate + "T23:59:59").getTime() : null;
    const q = nameQuery.trim().toLowerCase();

    return orders.filter((o) => {
      const ts = o.paidAt ?? o.createdAt;
      if (start !== null && ts < start) return false;
      if (end !== null && ts > end) return false;
      if (product.length > 0 && !product.includes(o.product)) return false;
      if (minQty !== null && o.quantity < minQty) return false;
      if (maxQty !== null && o.quantity > maxQty) return false;
      if (q) {
        const haystack = `${o.userName ?? ""} ${o.userEmail ?? ""} ${o.company ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [orders, filters]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const av = sortValue(a, sortField);
      const bv = sortValue(b, sortField);
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = av < bv ? -1 : 1;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  }

  if (!orders) return <Loading />;

  const productOptions = Array.from(new Set(orders.map((o) => o.product))).sort();

  const exportData = sorted.map((o) => ({
    paidAt: o.paidAt ? new Date(o.paidAt).toISOString() : "",
    product: PRODUCT_NAMES[o.product] || o.product,
    quantity: o.quantity,
    amount: o.amount,
    company: o.company,
    firstName: o.firstName || (o.userName?.split(" ")[0] ?? ""),
    lastName: o.lastName || (o.userName?.split(" ").slice(1).join(" ") ?? ""),
    email: o.userEmail ?? "",
    street: o.street,
    houseNumber: o.houseNumber,
    houseNumberSuffix: o.houseNumberSuffix,
    postalCode: o.postalCode,
    city: o.city,
    countryCode: o.country || "NL",
    source: "mollie",
  }));

  if (orders.length === 0) return <EmptyState text="Nog geen bestellingen." />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
      <OrdersFilterPanel
        value={filters}
        onChange={(v) => { setFilters(v); setPage(1); }}
        productOptions={productOptions}
        productLabels={PRODUCT_NAMES}
        totalCount={orders.length}
        filteredCount={sorted.length}
      />

      <div className="space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-ink/50">
            {sorted.length} {sorted.length === 1 ? "bestelling" : "bestellingen"}
          </p>
          <ExportButtons orders={exportData} />
        </div>

        <div className="border border-rule rounded-[2px] overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-rule bg-warm/30">
                <SortableTh field="paidAt" current={sortField} dir={sortDir} onClick={handleSort}>Datum</SortableTh>
                <SortableTh field="quantity" current={sortField} dir={sortDir} onClick={handleSort}>Aantal</SortableTh>
                <SortableTh field="amount" current={sortField} dir={sortDir} onClick={handleSort}>Bedrag</SortableTh>
                <SortableTh field="product" current={sortField} dir={sortDir} onClick={handleSort}>Product</SortableTh>
                <SortableTh field="company" current={sortField} dir={sortDir} onClick={handleSort}>Bedrijf</SortableTh>
                <Th>Betaalpagina</Th>
                <SortableTh field="userName" current={sortField} dir={sortDir} onClick={handleSort}>Naam</SortableTh>
                <SortableTh field="userEmail" current={sortField} dir={sortDir} onClick={handleSort}>Email</SortableTh>
                <SortableTh field="city" current={sortField} dir={sortDir} onClick={handleSort}>Plaats</SortableTh>
                <Th>Factuur</Th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-[13px] text-ink/40">
                    Geen bestellingen met deze filters.
                  </td>
                </tr>
              ) : paginated.map((order) => (
                <tr key={order._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors align-top">
                  <td className="px-4 py-3 text-[12px] text-ink/60 whitespace-nowrap">
                    {formatDateTime(order.paidAt ?? order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-ink tabular-nums">{order.quantity}</td>
                  <td className="px-4 py-3 text-[13px] text-ink tabular-nums">{formatPrice(order.amount)}</td>
                  <td className="px-4 py-3 text-[13px] text-ink">{PRODUCT_NAMES[order.product] || order.product}</td>
                  <td className="px-4 py-3 text-[13px] text-ink/70">{order.company || "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-ink/40 font-mono">/{order.product}</td>
                  <td className="px-4 py-3 text-[13px] text-ink">{`${order.firstName || ""} ${order.lastName || ""}`.trim() || order.userName || "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-ink/60">{order.userEmail || "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-ink/50">{order.city || "—"}</td>
                  <td className="px-4 py-3">
                    {order.invoiceNumber ? (
                      <Link
                        href={`/api/invoice/${order._id}`}
                        target="_blank"
                        className="text-[11px] text-copper font-medium hover:text-copper-light transition-colors whitespace-nowrap"
                      >
                        {order.invoiceNumber}
                      </Link>
                    ) : (
                      <span className="text-[11px] text-ink/30">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-[12px] text-ink/50 px-1">
            <p>
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)} van {sorted.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 border border-rule rounded-[2px] hover:border-ink/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Vorige
              </button>
              <span>Pagina {safePage} / {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 border border-rule rounded-[2px] hover:border-ink/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Volgende
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function sortValue(o: Record<string, unknown>, field: SortField): string | number | null {
  switch (field) {
    case "paidAt": return (o.paidAt as number | undefined) ?? (o.createdAt as number);
    case "quantity": return (o.quantity as number | undefined) ?? 0;
    case "amount": return (o.amount as number | undefined) ?? 0;
    case "product": return String(o.product ?? "");
    case "company": return String(o.company ?? "");
    case "userName": return String(o.userName ?? "");
    case "userEmail": return String(o.userEmail ?? "");
    case "city": return String(o.city ?? "");
  }
}

function SortableTh({
  field, current, dir, onClick, children,
}: {
  field: SortField;
  current: SortField;
  dir: "asc" | "desc";
  onClick: (f: SortField) => void;
  children: React.ReactNode;
}) {
  const isActive = field === current;
  return (
    <th
      onClick={() => onClick(field)}
      className="text-left px-4 py-3 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 cursor-pointer hover:text-ink select-none"
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <span className={isActive ? "text-copper" : "text-ink/20"}>
          {isActive ? (dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </span>
    </th>
  );
}

function BolcomOrdersList() {
  const orders = useQuery(api.bolOrders.list, { limit: 100 });
  const stats = useQuery(api.bolOrders.getStats);
  if (!orders || !stats) return <Loading />;

  const exportData = orders.map((o) => ({
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
  }));

  return (
    <div className="space-y-4">
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
          <ExportButtons orders={exportData} />
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
