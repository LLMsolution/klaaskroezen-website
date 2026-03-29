import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";
import { ACTIVE_EXPERIMENTS, assignVariant } from "./lib/ab-experiments";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/training(.*)",
]);

// Routes that authenticated users should be redirected away from
const isAuthRoute = createRouteMatcher(["/login", "/registreren"]);

// Case-sensitive redirects (Kajabi legacy URLs)
const caseSensitiveRedirects: Record<string, string> = {
  "/Sales-Excellence-Training": "/sales-excellence-training",
};

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const { pathname } = request.nextUrl;

    // Handle case-sensitive redirects first
    const destination = caseSensitiveRedirects[pathname];
    if (destination) {
      const url = request.nextUrl.clone();
      url.pathname = destination;
      return NextResponse.redirect(url, 301);
    }

    // A/B test variant assignment for checkout pages
    if (pathname.startsWith("/checkout/") && !pathname.includes("/bedankt")) {
      const productSlug = pathname.split("/checkout/")[1]?.split("?")[0];
      if (productSlug) {
        let response: NextResponse | undefined;
        for (const exp of ACTIVE_EXPERIMENTS) {
          if (exp.product !== "*" && exp.product !== productSlug) continue;
          const cookieName = `ab-${exp.slug}`;
          if (!request.cookies.get(cookieName)) {
            if (!response) response = NextResponse.next();
            response.cookies.set(cookieName, assignVariant(exp.weightB), {
              maxAge: 30 * 24 * 60 * 60,
              path: "/",
              sameSite: "lax",
            });
          }
        }
        if (response) return response;
      }
    }

    // Redirect authenticated users away from login
    if (isAuthRoute(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/dashboard");
    }

    // Redirect unauthenticated users to login
    if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/login");
    }
  },
  {
    cookieConfig: {
      maxAge: 60 * 60 * 24 * 30, // 30 days persistent session
    },
  },
);

export const config = {
  matcher: [
    // Match all paths except static files, Next.js internals, and tracking/webhook endpoints
    "/((?!_next|images|favicon|api/track|api/webhooks|.*\\..*).*)",
  ],
};
