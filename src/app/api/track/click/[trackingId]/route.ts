import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> },
) {
  const { trackingId } = await params;
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Record the click event
  try {
    await fetchMutation(api.emails.trackEvent, {
      trackingId,
      type: "click",
      url,
      ip: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
  } catch {
    // Silently fail — tracking should never block the redirect
  }

  return NextResponse.redirect(url);
}
