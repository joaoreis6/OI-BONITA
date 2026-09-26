import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listActiveCategories } from "@/services/admin-catalog-service";
import { AdminPageHeading, Notice } from "@/app/admin/admin-ui";
import { ProductForm } from "@/app/admin/product-form";

export const metadata: Metadata = { title: "Novo produto", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  let categories: Awaited<ReturnType<typeof listActiveCategories>> | null = null;
  try { categories = await listActiveCategories(); } catch { /* Error state is rendered below. */ }
  if (!categories) return <><AdminPageHeading eyebrow="Catálogo" title="Novo produto" description="Cadastre as informações do produto." /><Notice tone="error">Não foi possível carregar as categorias. Verifique a conexão do banco.</Notice></>;
  return <><AdminPageHeading eyebrow="Catálogo" title="Novo produto" description="Cadastre as informações do produto e, em seguida, adicione as fotos." />
    {categories.length === 0 ? <section className="admin-empty"><h2>Cadastre uma categoria primeiro</h2><p>Um produto precisa pertencer a uma categoria ativa.</p><Link className="button button-primary" href="/admin/categorias">Adicionar categoria</Link></section> : <>
      <ProductForm categories={categories} />
      <section className="admin-panel admin-image-hint" aria-labelledby="new-product-photo-hint">
        <p className="eyebrow">Fotos</p>
        <h2 id="new-product-photo-hint">Foto do produto</h2>
        <p className="admin-muted">Salve o produto primeiro. Na próxima tela você poderá cadastrar fotos em JPEG, PNG ou WebP (até 5 MB cada).</p>
      </section>
    </>}
  </>;
}
