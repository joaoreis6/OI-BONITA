import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "admin" | "unauthenticated";
  }

  interface Session {
    user: DefaultSession["user"] & { id: string; role: "admin" | "unauthenticated" };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "unauthenticated";
  }
}
