import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  ).toLowerCase();

  const { pathname } = request.nextUrl;

  // Protect all /admin routes and /api/admin endpoints
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isAdminRoute) {
    // If request comes from the public client domain (mediareachdigital.com), hide completely
    const isPublicDomain = host.includes("mediareachdigital.com");

    if (isPublicDomain) {
      // Return 404 Not Found rewrite
      const notFoundUrl = new URL("/not-found", request.url);
      return NextResponse.rewrite(notFoundUrl, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};

