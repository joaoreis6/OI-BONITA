import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminCredentialsForm } from "@/app/admin/admin-credentials-form";
import { AdminPageHeading } from "@/app/admin/admin-ui";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Configurações", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const profile = await getPrisma().admin.findUnique({ where: { id: admin.id }, select: { email: true } });
  if (!profile) redirect("/admin/login");

  return (
    <>
      <AdminPageHeading
        eyebrow="Painel"
        title="Configurações"
        description="Atualize o e-mail e a senha de acesso ao painel administrativo."
      />
      <section className="admin-panel">
        <h2>Acesso ao painel</h2>
        <p className="admin-muted">
          Para entrar, use o e-mail completo (ex.: analu@oibonita.com). A senha precisa ter pelo menos 8 caracteres.
        </p>
        <AdminCredentialsForm currentEmail={profile.email} />
      </section>
    </>
  );
}
