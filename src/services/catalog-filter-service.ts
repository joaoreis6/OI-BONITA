import type { Category, Product } from "../schemas/catalog.ts";

export type CatalogOrder = "recentes" | "menor-preco" | "maior-preco" | "nome-az" | "nome-za";

export function filterPublicProducts(products: Product[], categories: Category[], query: string, categorySlug: string, order: CatalogOrder) {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const filtered = products.filter((product) => {
    const category = categoriesById.get(product.categoryId);
    if (!product.active || !category?.active || (categorySlug && category.slug !== categorySlug)) return false;
    const searchable = `${product.name} ${product.description ?? ""} ${category.name}`.toLocaleLowerCase("pt-BR");
    return !normalizedQuery || searchable.includes(normalizedQuery);
  });

  return filtered.sort((left, right) => {
    if (order === "menor-preco" || order === "maior-preco") {
      if (left.price === undefined) return right.price === undefined ? 0 : 1;
      if (right.price === undefined) return -1;
      return order === "menor-preco" ? left.price - right.price : right.price - left.price;
    }
    if (order === "nome-az") return left.name.localeCompare(right.name, "pt-BR");
    if (order === "nome-za") return right.name.localeCompare(left.name, "pt-BR");
    return (right.createdAt ?? "").localeCompare(left.createdAt ?? "");
  });
}
