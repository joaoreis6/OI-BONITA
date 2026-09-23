import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminDashboard } from "@/services/admin-catalog-service";
import { AdminPageHeading, Notice } from "@/app/admin/admin-ui";

export const metadata: Metadata = { title: "Dashboard administrativo", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  let data: Awaited<ReturnType<typeof getAdminDashboard>> | null = null;
  let failed = false;
  try {
    data = await getAdminDashboard();
  } catch { failed = true; }
  if (failed || !data) return <><AdminPageHeading eyebrow="Oi, Bonita!" title="Dashboard" description="Acompanhe o catálogo da sua loja." /><Notice tone="error">Não foi possível carregar os dados. Verifique a configuração e a conexão do banco de dados e tente novamente.</Notice></>;
  return <>
      <AdminPageHeading eyebrow="Oi, Bonita!" title="Dashboard" description="Acompanhe o catálogo da sua loja." action={{ href: "/admin/produtos/novo", label: "Adicionar produto" }} />
      <section className="admin-stat-grid" aria-label="Resumo do catálogo">
        <Stat label="Produtos cadastrados" value={data.products} />
        <Stat label="Produtos publicados" value={data.publishedProducts} />
        <Stat label="Sem estoque" value={data.unavailableProducts} />
        <Stat label="Categorias" value={data.categories} />
      </section>
      {data.products === 0 && <section className="admin-empty"><h2>Seu catálogo está pronto para começar</h2><p>Você ainda não cadastrou produtos.</p><Link className="button button-primary" href="/admin/produtos/novo">Adicionar produto</Link></section>}
      {data.products > 0 && <section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Acompanhar</p><h2>Estoque baixo</h2></div><Link href="/admin/produtos">Ver produtos</Link></div>
        {data.lowStockProducts.length === 0 ? <p className="admin-muted">Nenhum produto com estoque baixo.</p> : <ul className="admin-low-stock">{data.lowStockProducts.map((product) => <li key={product.id}><Link href={`/admin/produtos/${product.id}`}>{product.name}</Link><span>{product.stock} unidade{product.stock === 1 ? "" : "s"}</span></li>)}</ul>}
      </section>}
  </>;
}

function Stat({ label, value }: { label: string; value: number }) { return <article className="admin-stat"><span>{label}</span><strong>{value.toLocaleString("pt-BR")}</strong></article>; }
