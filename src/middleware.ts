import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
]);

// Routes that authenticated users should be redirected away from
const isAuthRoute = createRouteMatcher(["/login"]);

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
    // Match all paths except static files and Next.js internals
    "/((?!_next|images|favicon|.*\\..*).*)",
  ],
};
