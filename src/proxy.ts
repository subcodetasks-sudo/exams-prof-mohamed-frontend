import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_STATIC_EXT =
  /\.(?:avif|gif|ico|jpe?g|png|svg|webp|woff2?)(?:\?|$)/i;

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // `public/*` is served at `/<filename>`; must not redirect to /signin or images break
  if (pathname !== "/" && PUBLIC_STATIC_EXT.test(pathname)) {
    return NextResponse.next();
  }

  // Auth pages (sign in / up)
  const isAuthRoute = pathname === "/signin" || pathname === "/signup";
  // Public pages that do not require a session
  const isPublicPage =
    isAuthRoute ||
    pathname === "/ikhtibar" ||
    pathname.startsWith("/ikhtibar/");

  // 1. If authenticated but on auth route -> redirect to App Home
  if (token && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/"; // Next.js adds basePath automatically here
    return NextResponse.redirect(url);
  }

  // 2. If NOT authenticated and not on a public route -> redirect to /signin
  if (!token && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin"; // Next.js adds basePath automatically here
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // This is the fix for the root path issue
    { source: "/" },
    // Standard exclusion for assets/APIs
    "/((?!api|_next/static|_next/image|favicon.ico|public|images).*)",
  ],
};
