import { NextResponse } from "next/server";

type LabelData = {
  name: string;
  company: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  countryCode: string;
};

// A4: 210mm x 297mm, 3 columns x 8 rows of labels
const PAGE_W = 595.28; // A4 width in points
const PAGE_H = 841.89; // A4 height in points
const COLS = 3;
const ROWS = 8;
const MARGIN_X = 15;
const MARGIN_Y = 36;
const LABEL_W = (PAGE_W - MARGIN_X * 2) / COLS;
const LABEL_H = (PAGE_H - MARGIN_Y * 2) / ROWS;
const LABELS_PER_PAGE = COLS * ROWS;

function escPdf(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export async function POST(request: Request) {
  const { labels } = (await request.json()) as { labels: LabelData[] };
  if (!labels?.length) {
    return NextResponse.json({ error: "Geen labels" }, { status: 400 });
  }

  const pages = Math.ceil(labels.length / LABELS_PER_PAGE);
  const objects: string[] = [];
  let objCount = 0;

  function addObj(content: string): number {
    objCount++;
    objects.push(`${objCount} 0 obj\n${content}\nendobj`);
    return objCount;
  }

  // Font
  const fontId = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  // Pages content
  const pageIds: number[] = [];
  const contentIds: number[] = [];

  for (let p = 0; p < pages; p++) {
    let stream = "";
    stream += "BT\n";

    for (let i = 0; i < LABELS_PER_PAGE; i++) {
      const idx = p * LABELS_PER_PAGE + i;
      if (idx >= labels.length) break;
      const label = labels[idx];
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = MARGIN_X + col * LABEL_W + 8;
      const y = PAGE_H - MARGIN_Y - row * LABEL_H - 16;

      const lines = [
        label.company,
        label.name,
        `${label.street} ${label.houseNumber}`,
        `${label.postalCode} ${label.city}`,
        label.countryCode !== "NL" ? label.countryCode : "",
      ].filter(Boolean);

      for (let l = 0; l < lines.length; l++) {
        stream += `/F1 ${l === 0 && label.company ? 7 : 8} Tf\n`;
        stream += `${x} ${y - l * 11} Td\n`;
        stream += `(${escPdf(lines[l])}) Tj\n`;
        stream += `${-x} ${-(y - l * 11)} Td\n`;
      }
    }

    stream += "ET\n";
    const contentId = addObj(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
    contentIds.push(contentId);
  }

  // Page objects
  const pagesObjId = objCount + pages + 1;
  for (let p = 0; p < pages; p++) {
    const pageId = addObj(
      `<< /Type /Page /Parent ${pagesObjId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentIds[p]} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`,
    );
    pageIds.push(pageId);
  }

  // Pages
  addObj(
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages} >>`,
  );

  // Catalog
  const catalogId = addObj(`<< /Type /Catalog /Pages ${pagesObjId} 0 R >>`);

  // Build PDF
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + "\n";
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objCount + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objCount + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="verzendlabels-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
