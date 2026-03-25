import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { text, targetLang, html } = await request.json();

  if (!text || !targetLang) {
    return NextResponse.json({ error: "Missing text or targetLang" }, { status: 400 });
  }

  // DEEPL_AUTH_KEY must be set in Vercel env vars
  const authKey = process.env.DEEPL_AUTH_KEY;
  if (!authKey) {
    return NextResponse.json({ error: "DeepL not configured. Set DEEPL_AUTH_KEY in Vercel env vars." }, { status: 503 });
  }

  const isFree = authKey.endsWith(":fx");
  const baseUrl = isFree
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const params: Record<string, string> = { text, target_lang: targetLang };
  if (html) params.tag_handling = "html";

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${authKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `DeepL error: ${err}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ text: data.translations[0].text });
}
