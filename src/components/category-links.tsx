import Link from "next/link";
import type { Category } from "@/schemas/catalog";

export function CategoryLinks({ categories, activeSlug }: { categories: Category[]; activeSlug?: string }) {
  return (
    <nav className="category-page-links" aria-label="Filtrar por categoria">
      {categories.map((category) => (
        <Link key={category.id} className="category-chip" href={`/categoria/${category.slug}`} aria-current={activeSlug === category.slug ? "page" : undefined}>
          {category.name}
        </Link>
      ))}
      <Link className="category-chip" href="/catalogo">Ver tudo</Link>
    </nav>
  );
}
