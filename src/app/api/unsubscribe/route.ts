import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Unsubscribe handler.
 * GET /api/unsubscribe?email=xxx → shows confirmation page
 * POST /api/unsubscribe → processes unsubscribe
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = escapeHtml(searchParams.get("email") || "");

  if (!email) {
    return new NextResponse("Ongeldig verzoek.", { status: 400 });
  }

  // Return a simple confirmation page
  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Uitschrijven — Klaas Kroezen</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 420px; margin: 80px auto; padding: 0 20px; color: #0E0C0A; }
    h1 { font-size: 24px; margin-bottom: 12px; }
    p { color: #0E0C0A99; line-height: 1.7; }
    form { margin-top: 24px; }
    button { background: #B5622A; color: #F7F4EF; border: none; padding: 14px 28px; font-size: 14px; font-weight: 500; cursor: pointer; letter-spacing: 0.05em; }
    button:hover { background: #D4794A; }
    .done { color: #16a34a; font-weight: 500; }
  </style>
</head>
<body>
  <h1>Uitschrijven</h1>
  <p>Wil je geen e-mails meer ontvangen van Klaas Kroezen?</p>
  <p>E-mailadres: <strong>${email}</strong></p>
  <form method="POST" action="/api/unsubscribe">
    <input type="hidden" name="email" value="${email}" />
    <button type="submit">Ja, schrijf mij uit</button>
  </form>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email) {
      return new NextResponse("Ongeldig verzoek.", { status: 400 });
    }

    await fetchMutation(api.emailAdmin.unsubscribe, { email });

    const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Uitgeschreven — Klaas Kroezen</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 420px; margin: 80px auto; padding: 0 20px; color: #0E0C0A; }
    h1 { font-size: 24px; margin-bottom: 12px; }
    p { color: #0E0C0A99; line-height: 1.7; }
    .done { color: #16a34a; }
  </style>
</head>
<body>
  <h1 class="done">Uitgeschreven</h1>
  <p>Je ontvangt geen e-mails meer van ons.</p>
  <p>Mocht je je bedenken, neem dan contact op via <a href="mailto:info@klaaskroezen.com">info@klaaskroezen.com</a>.</p>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse("Er ging iets mis.", { status: 500 });
  }
}
