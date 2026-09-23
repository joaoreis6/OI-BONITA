import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listAdminProducts } from "@/services/admin-catalog-service";
import { AdminPageHeading, Notice } from "@/app/admin/admin-ui";
import { ConfirmArchiveForm } from "@/app/admin/confirm-archive-form";

export const metadata: Metadata = { title: "Produtos", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ arquivado?: string; falha?: string }> }) {
  await requireAdmin();
  const query = await searchParams;
  let products: Awaited<ReturnType<typeof listAdminProducts>> | null = null;
  try { products = await listAdminProducts(); } catch { /* Error state is rendered below without exposing database details. */ }
  if (!products) return <><AdminPageHeading eyebrow="Catálogo" title="Produtos" description="Gerencie informações, estoque e publicação." action={{ href: "/admin/produtos/novo", label: "Adicionar produto" }} /><Notice tone="error">Não foi possível carregar os produtos. Verifique a conexão do banco de dados.</Notice></>;
  return <>
    <AdminPageHeading eyebrow="Catálogo" title="Produtos" description="Gerencie informações, estoque e publicação." action={{ href: "/admin/produtos/novo", label: "Adicionar produto" }} />
    {query.arquivado && <Notice>Produto arquivado.</Notice>}
    {query.falha && <Notice tone="error">Não foi possível arquivar o produto. Atualize a página e tente novamente.</Notice>}
    {products.length === 0 ? <section className="admin-empty"><h2>Você ainda não cadastrou produtos.</h2><p>Quando adicionar um produto, ele aparecerá nesta lista.</p><Link className="button button-primary" href="/admin/produtos/novo">Adicionar produto</Link></section> :
      <div className="admin-product-list">{products.map((product) => <article className="admin-product-card" key={product.id}>
        {product.images[0] ? <div className="admin-product-thumb"><Image src={product.images[0].url} alt={product.images[0].altText || product.name} fill sizes="(max-width: 700px) 80px, 96px" unoptimized /></div> : <div className="admin-product-thumb admin-thumb-empty" aria-label="Sem imagem">Sem imagem</div>}
        <div className="admin-product-info"><h2>{product.name}</h2><p>{product.category.name} · {product.price ? formatPrice(product.price.toString()) : "Preço não informado"}</p><div className="admin-badges"><span>{product.stock} em estoque</span><span>{availabilityLabel(product.availability)}</span><span>{product.status === "PUBLISHED" ? "Publicado" : "Rascunho"}</span></div></div>
        <div className="admin-product-actions"><Link className="button button-outline" href={`/admin/produtos/${product.id}`}>Editar</Link><ConfirmArchiveForm id={product.id} /></div>
      </article>)}</div>}
  </>;
}

function formatPrice(value: string) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value)); }
function availabilityLabel(value: string) { return value === "OUT_OF_STOCK" ? "Sem estoque" : value === "MADE_TO_ORDER" ? "Sob encomenda" : "Disponível"; }
