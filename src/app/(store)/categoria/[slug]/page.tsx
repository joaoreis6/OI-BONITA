import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryLinks } from "@/components/category-links";
import { ProductGrid } from "@/components/product-grid";
import type { Category, Product } from "@/schemas/catalog";
import { listPublicCategories, listPublicProductsForCategory, getPublicCategoryBySlug } from "@/services/public-catalog-service";

export const dynamic = "force-dynamic";
type CategoryPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getPublicCategoryBySlug(slug);
    if (!category) return { title: "Categoria não encontrada" };
    return { title: category.name, description: `Explore a categoria ${category.name} no catálogo da Oi, Bonita!.`, alternates: { canonical: `/categoria/${category.slug}` } };
  } catch { return { title: "Categorias" }; }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  let category: Category | null;
  try { category = await getPublicCategoryBySlug(slug); }
  catch { return <main id="main-content"><section className="page-hero"><p className="eyebrow">Oi, Bonita!</p><h1>Categoria</h1><p>Não foi possível carregar esta categoria agora.</p></section><section className="container catalog-section"><p role="alert">Tente novamente em instantes.</p></section></main>; }
  if (!category) notFound();
  let categoryProducts: Product[] = [];
  let categories: Category[] = [];
  let catalogError = false;
  try { [categoryProducts, categories] = await Promise.all([listPublicProductsForCategory(category.id), listPublicCategories()]); }
  catch { catalogError = true; }
  if (catalogError) {
    return <main id="main-content"><section className="page-hero"><p className="eyebrow">Oi, Bonita!</p><h1>Categoria</h1><p>Não foi possível carregar esta categoria agora.</p></section><section className="container catalog-section"><p role="alert">Tente novamente em instantes.</p></section></main>;
  }
  return (
    <main id="main-content">
      <section className="page-hero"><p className="eyebrow">Encontre o seu estilo</p><h1>{category.name}</h1><p>Veja a categoria {category.name} no catálogo da Oi, Bonita!</p></section>
      <section className="container catalog-section">
        {categoryProducts.length === 0 ? <p className="empty-state" role="status">Ainda não há produtos publicados nesta categoria.</p> : <ProductGrid products={categoryProducts} />}
        <CategoryLinks categories={categories} activeSlug={category.slug} />
      </section>
    </main>
  );
}
