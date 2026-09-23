import NextAuth from "next-auth";
import { env } from "@/config/env";
import { authOptions } from "@/lib/auth/options";

const authHandler = NextAuth(authOptions);

async function guardedAuthHandler(...args: Parameters<typeof authHandler>) {
  if (!env.NEXTAUTH_SECRET || !env.DATABASE_URL) {
    return Response.json({ error: "Authentication is not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  return authHandler(...args);
}

export { guardedAuthHandler as GET, guardedAuthHandler as POST };
