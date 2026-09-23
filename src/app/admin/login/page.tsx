import type { Metadata } from "next";
import { AdminLoginForm } from "@/app/admin/login/login-form";
import { env } from "@/config/env";

export const metadata: Metadata = {
  title: "Acesso administrativo",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  const authConfigured = Boolean(env.NEXTAUTH_SECRET && env.DATABASE_URL);
  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card" aria-labelledby="admin-login-heading">
        <p className="eyebrow">Oi, Bonita!</p>
        <h1 id="admin-login-heading">Acesso administrativo</h1>
        <p>Entre com as credenciais do administrador.</p>
        {authConfigured ? <AdminLoginForm /> : <p className="admin-login-error" role="status">O acesso administrativo não está configurado neste ambiente. A equipe responsável precisa revisar as configurações do servidor.</p>}
      </section>
    </main>
  );
}
