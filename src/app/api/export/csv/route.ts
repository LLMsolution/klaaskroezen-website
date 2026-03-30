import { NextResponse } from "next/server";

type OrderRow = {
  paidAt: string;
  product: string;
  quantity: number;
  amount: number;
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  source: string;
};

export async function POST(request: Request) {
  const { orders } = (await request.json()) as { orders: OrderRow[] };
  if (!orders?.length) {
    return NextResponse.json({ error: "Geen orders" }, { status: 400 });
  }

  const headers = ["Datum", "Product", "Aantal", "Bedrag", "Bedrijf", "Voornaam", "Achternaam", "Email", "Plaats", "Bron"];

  const rows = orders.map((o) => [
    o.paidAt?.slice(0, 10) ?? "",
    `"${(o.product || "").replace(/"/g, '""')}"`,
    String(o.quantity),
    (o.amount / 100).toFixed(2).replace(".", ","),
    `"${(o.company || "").replace(/"/g, '""')}"`,
    `"${o.firstName}"`,
    `"${o.lastName}"`,
    o.email,
    `"${(o.city || "").replace(/"/g, '""')}"`,
    o.source,
  ].join(";"));

  // UTF-8 BOM for Excel compatibility
  const bom = "\uFEFF";
  const csv = bom + headers.join(";") + "\n" + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
