import type { Product } from "../schemas/catalog.ts";

export type PublicProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: { toNumber(): number } | null;
  availability: Product["availability"];
  stock: number;
  createdAt: Date;
  categoryId: string;
  category: { name: string; slug: string };
  images: { url: string }[];
};

export function toPublicProduct(product: PublicProductRecord): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    ...(product.description ? { description: product.description } : {}),
    ...(product.price !== null ? { price: product.price.toNumber() } : {}),
    stock: product.stock,
    createdAt: product.createdAt.toISOString(),
    active: true,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    availability: product.availability,
    images: product.images.map((image) => image.url),
  };
}
