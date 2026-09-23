import type { Product } from "@/schemas/catalog";

// Nenhum produto real foi fornecido; o catálogo permanece vazio até que dados confirmados existam.
export const products: Product[] = [];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug && product.active);
}
