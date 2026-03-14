import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const caseSensitiveRedirects: Record<string, string> = {
  "/Sales-Excellence-Training": "/sales-excellence-training",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const destination = caseSensitiveRedirects[pathname];
  if (destination) {
    const url = request.nextUrl.clone();
    url.pathname = destination;
    return NextResponse.redirect(url, 301);
  }
}

export const config = {
  matcher: ["/Sales-Excellence-Training"],
};
