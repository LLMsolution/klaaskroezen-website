import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { formatInitials, parseQuantity, splitHouseNumber } from "@/lib/order-formatting";

type OrderRow = {
  company?: string;
  firstName: string;
  lastName: string;
  street?: string;
  houseNumber?: string;
  houseNumberSuffix?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  email: string;
  quantity: number;
};

const HEADERS: { label: string; width: number }[] = [
  { label: "Bedrijfsnaam", width: 25 },
  { label: "Bedrijfsnaam2", width: 15 },
  { label: "Afdeling", width: 15 },
  { label: "Geslacht", width: 10 },
  { label: "Voorletters", width: 12 },
  { label: "Achternaam", width: 20 },
  { label: "Postadres", width: 30 },
  { label: "Huisnummer", width: 12 },
  { label: "Huisnummertoevoeging", width: 18 },
  { label: "Postcode", width: 10 },
  { label: "Plaats", width: 20 },
  { label: "Landcode", width: 10 },
  { label: "Emailadres", width: 30 },
];

export async function POST(request: Request) {
  const { orders } = (await request.json()) as { orders: OrderRow[] };
  if (!orders?.length) {
    return NextResponse.json({ error: "Geen orders" }, { status: 400 });
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Verzendadressen");

  ws.columns = HEADERS.map((h) => ({ header: h.label, width: h.width }));
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };
    cell.border = { bottom: { style: "thin", color: { argb: "FFB5622A" } } };
  });

  for (const order of orders) {
    const split = splitHouseNumber(order.houseNumber);
    const suffix = (order.houseNumberSuffix?.trim() || split.suffix).trim();
    const number = split.number;
    const initials = formatInitials(order.firstName);
    const country = order.countryCode || "NL";
    const rowCount = Math.max(1, parseQuantity(order.quantity));

    for (let i = 0; i < rowCount; i++) {
      ws.addRow([
        order.company || "",
        "", // Bedrijfsnaam2
        "", // Afdeling
        "", // Geslacht
        initials,
        order.lastName,
        order.street || "",
        number,
        suffix,
        order.postalCode || "",
        order.city || "",
        country,
        order.email,
      ]);
    }
  }

  const buffer = await wb.xlsx.writeBuffer();
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="verzendadressen_${today}.xlsx"`,
    },
  });
}
