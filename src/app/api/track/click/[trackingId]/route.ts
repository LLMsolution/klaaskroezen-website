import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";

const ALLOWED_HOSTS = ["klaaskroezen.com", "www.klaaskroezen.com"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> },
) {
  const { trackingId } = await params;
  const rawUrl = request.nextUrl.searchParams.get("url");
  const fallback = new URL("/", request.url);

  if (!rawUrl) {
    return NextResponse.redirect(fallback);
  }

  // Validate redirect target to prevent open redirect
  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
    if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
      return NextResponse.redirect(fallback);
    }
  } catch {
    return NextResponse.redirect(fallback);
  }

  try {
    await fetchMutation(api.emails.trackEvent, {
      trackingId,
      type: "click",
      url: rawUrl,
      ip: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
  } catch (err) {
    console.error("[track/click] Failed to record click event:", err);
  }

  return NextResponse.redirect(targetUrl);
}
