import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/config/env";
import { adminAuthRepository } from "@/repositories/admin-auth-repository";
import { authenticateAdmin } from "@/services/admin-auth-service";

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [
    CredentialsProvider({
      name: "Administrador",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!env.DATABASE_URL || !credentials) return null;
        return authenticateAdmin(credentials, adminAuthRepository);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role === "admin" ? "admin" : "unauthenticated";
      }
      return session;
    },
  },
};
