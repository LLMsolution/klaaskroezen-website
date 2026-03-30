import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

type OrderRow = {
  company: string;
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  countryCode: string;
  email: string;
  quantity: number;
};

export async function POST(request: Request) {
  const { orders } = (await request.json()) as { orders: OrderRow[] };
  if (!orders?.length) {
    return NextResponse.json({ error: "Geen orders" }, { status: 400 });
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Verzendadressen");

  // Header row
  const headers = ["Bedrijfsnaam", "Voorletters", "Achternaam", "Postadres", "Huisnummer", "Postcode", "Plaats", "Landcode", "Emailadres"];
  const headerRow = ws.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8E4DF" } };
    cell.border = { bottom: { style: "thin", color: { argb: "FFB5622A" } } };
  });

  // Expand rows by quantity (1 row per book to ship)
  for (const order of orders) {
    const initials = order.firstName
      .split(/[\s-]+/)
      .map((w) => w.charAt(0).toUpperCase() + ".")
      .join("");

    const rowCount = Math.max(1, order.quantity);
    for (let i = 0; i < rowCount; i++) {
      ws.addRow([
        order.company || "",
        initials,
        order.lastName,
        order.street,
        order.houseNumber,
        order.postalCode,
        order.city,
        order.countryCode,
        order.email,
      ]);
    }
  }

  // Auto-width columns
  ws.columns.forEach((col) => {
    let maxLen = 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.value).length;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(maxLen + 2, 40);
  });

  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="verzendadressen-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
