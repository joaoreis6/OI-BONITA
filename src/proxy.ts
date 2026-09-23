import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { env } from "@/config/env";
import { hasAdminAccess } from "@/lib/auth/authorization";

const authenticatedAdminProxy = withAuth(
  function adminProxy() {},
  {
    secret: env.NEXTAUTH_SECRET,
    pages: { signIn: "/admin/login" },
    callbacks: {
      authorized({ token, req }) {
        if (req.nextUrl.pathname === "/admin/login") return true;
        return hasAdminAccess(token ? { id: token.sub, role: token.role } : null);
      },
    },
  },
);

export default function adminProxy(request: NextRequest, event: NextFetchEvent) {
  if (!env.NEXTAUTH_SECRET) {
    if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login?configuration=missing", request.url));
  }
  return authenticatedAdminProxy(request as NextRequestWithAuth, event);
}

export const config = {
  matcher: ["/admin/:path*"],
};
