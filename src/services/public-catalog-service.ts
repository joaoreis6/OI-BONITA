import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import type { Category } from "@/schemas/catalog";
import { getPrisma } from "@/lib/prisma";
import { toPublicProduct } from "@/services/public-product-mapper";

const publicProductSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  availability: true,
  stock: true,
  createdAt: true,
  categoryId: true,
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: [{ position: "asc" as const }, { createdAt: "asc" as const }, { id: "asc" as const }],
    select: { url: true },
  },
} satisfies Prisma.ProductSelect;

const publicWhere = {
  status: "PUBLISHED" as const,
  category: { isActive: true },
};

export const listPublicCategories = cache(async (): Promise<Category[]> => {
  const rows = await getPrisma().category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, isActive: true },
  });
  return rows.map((category) => ({ id: category.id, name: category.name, slug: category.slug, active: true }));
});

export const getPublicCategoryBySlug = cache(async (slug: string) => {
  const category = await getPrisma().category.findFirst({
    where: { slug, isActive: true },
    select: { id: true, name: true, slug: true, isActive: true },
  });
  return category ? { id: category.id, name: category.name, slug: category.slug, active: true } satisfies Category : null;
});

export const listPublicProducts = cache(async () => {
  const rows = await getPrisma().product.findMany({
    where: publicWhere,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: publicProductSelect,
  });
  return rows.map(toPublicProduct);
});

export const listPublicFeaturedProducts = cache(async () => {
  const rows = await getPrisma().product.findMany({
    where: publicWhere,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: 4,
    select: publicProductSelect,
  });
  return rows.map(toPublicProduct);
});

export const listPublicProductsForCategory = cache(async (categoryId: string) => {
  const rows = await getPrisma().product.findMany({
    where: { ...publicWhere, categoryId },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: publicProductSelect,
  });
  return rows.map(toPublicProduct);
});

export const getPublicProductBySlug = cache(async (slug: string) => {
  const row = await getPrisma().product.findFirst({
    where: { ...publicWhere, slug },
    select: publicProductSelect,
  });
  return row ? toPublicProduct(row) : null;
});

export async function listPublicProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await getPrisma().product.findMany({
    where: { ...publicWhere, id: { in: ids } },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: publicProductSelect,
  });
  return rows.map(toPublicProduct);
}

export async function listPublicSitemapEntries() {
  const [categories, products] = await Promise.all([
    getPrisma().category.findMany({ where: { isActive: true }, select: { slug: true } }),
    getPrisma().product.findMany({ where: publicWhere, select: { slug: true } }),
  ]);
  return { categories, products };
}
