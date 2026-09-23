import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminPageHeading } from "@/app/admin/admin-ui";

export const metadata: Metadata = { title: "Configurações", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  return <><AdminPageHeading eyebrow="Painel" title="Configurações" description="Informações básicas do painel administrativo." /><section className="admin-panel"><h2>Oi, Bonita!</h2><p className="admin-muted">As configurações da loja serão disponibilizadas em um bloco posterior. Não há dados comerciais configuráveis nesta tela.</p></section></>;
}
