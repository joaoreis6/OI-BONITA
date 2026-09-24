import type { Metadata } from "next";
import Link from "next/link";
import { CategoryCard } from "@/components/category-card";
import { ArrowRightIcon } from "@/components/icons";
import { catalogErrorMessage, resolveCatalogFailure } from "@/lib/catalog-error";
import { listPublicCategories } from "@/services/public-catalog-service";
import type { Category } from "@/schemas/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categorias",
  description: "Explore as categorias da Oi, Bonita!: Prata 925, Semijoias, Perfumes, Cosméticos, Óculos e Acessórios.",
  alternates: { canonical: "/categorias" },
};

export default async function CategoriesPage() {
  let categories: Category[] = [];
  let failure: ReturnType<typeof resolveCatalogFailure> | null = null;
  try {
    categories = await listPublicCategories();
  } catch (error) {
    failure = resolveCatalogFailure(error);
  }

  return (
    <main id="main-content">
      <section className="page-hero">
        <p className="eyebrow">Encontre o seu estilo</p>
        <h1>Categorias</h1>
        <p>Explore nossas categorias e descubra o que combina com você.</p>
      </section>
      <section className="container catalog-section" aria-label="Categorias da loja">
        {failure ? (
          <p role="alert">{catalogErrorMessage(failure)}</p>
        ) : categories.length > 0 ? (
          <div className="category-grid">{categories.map((category, index) => <CategoryCard key={category.id} category={category} index={index} />)}</div>
        ) : (
          <p className="empty-state" role="status">As categorias estarão disponíveis em breve.</p>
        )}
        <div className="category-page-links">
          <Link className="text-link" href="/catalogo">Ver catálogo completo <ArrowRightIcon width={17} height={17} /></Link>
        </div>
      </section>
    </main>
  );
}
