import type { Metadata } from "next";
import { CatalogFilter } from "@/components/catalog-filter";
import { ProductGrid } from "@/components/product-grid";
import { listPublicCategories, listPublicProducts } from "@/services/public-catalog-service";
import { filterPublicProducts, type CatalogOrder } from "@/services/catalog-filter-service";
import type { Category, Product } from "@/schemas/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Encontre joias, semijoias, cosméticos e acessórios da Oi, Bonita!",
  alternates: { canonical: "/catalogo" },
};

type CatalogPageProps = { searchParams: Promise<{ q?: string; categoria?: string; ordem?: string }> };

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  let products: Product[];
  let categories: Category[];
  try { [products, categories] = await Promise.all([listPublicProducts(), listPublicCategories()]); }
  catch {
    return <main id="main-content"><section className="page-hero"><p className="eyebrow">Oi, Bonita!</p><h1>Catálogo</h1><p>Não foi possível carregar o catálogo neste momento.</p></section><section className="container catalog-section"><p role="alert">Tente novamente em instantes.</p></section></main>;
  }
  const query = params.q?.trim() ?? "";
  const category = params.categoria?.trim() ?? "";
  const allowedOrders = ["recentes", "menor-preco", "maior-preco", "nome-az", "nome-za"];
  const order = allowedOrders.includes(params.ordem ?? "") ? params.ordem! : "recentes";
  const visibleProducts = filterPublicProducts(products, categories, query, category, order as CatalogOrder);
  const hasFilters = Boolean(query || category);

  return (
    <main id="main-content">
      <section className="page-hero">
        <p className="eyebrow">Oi, Bonita!</p>
        <h1>Catálogo</h1>
        <p>Encontre aquela peça que combina com você.</p>
      </section>
      <section className="container catalog-section" aria-label="Produtos do catálogo">
        <div className="catalog-toolbar">
          <p className="catalog-count" aria-live="polite">{visibleProducts.length} {visibleProducts.length === 1 ? "produto" : "produtos"}</p>
          <CatalogFilter categories={categories} query={query} category={category} sort={order} />
        </div>
        <ProductGrid products={visibleProducts} filtered={hasFilters} />
      </section>
    </main>
  );
}
