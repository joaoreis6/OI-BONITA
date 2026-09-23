import { ProductAvailability, ProductStatus } from "@/generated/prisma/enums";
import { getPrisma } from "@/lib/prisma";

export async function getAdminDashboard() {
  const db = getPrisma();
  const [products, publishedProducts, unavailableProducts, categories, lowStockProducts] = await Promise.all([
    db.product.count({ where: { status: { not: ProductStatus.ARCHIVED } } }),
    db.product.count({ where: { status: ProductStatus.PUBLISHED } }),
    db.product.count({ where: { status: { not: ProductStatus.ARCHIVED }, availability: ProductAvailability.OUT_OF_STOCK } }),
    db.category.count(),
    db.product.findMany({ where: { status: { not: ProductStatus.ARCHIVED }, stock: { gt: 0, lte: 5 } },
      select: { id: true, name: true, slug: true, stock: true }, orderBy: { stock: "asc" }, take: 8 }),
  ]);
  return { products, publishedProducts, unavailableProducts, categories, lowStockProducts };
}

export async function listAdminProducts() {
  return getPrisma().product.findMany({
    where: { status: { not: ProductStatus.ARCHIVED } }, orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, slug: true, price: true, stock: true, status: true, availability: true,
      category: { select: { name: true } }, images: { select: { url: true, altText: true }, orderBy: { position: "asc" }, take: 1 } },
  });
}

export async function listAdminCategories() {
  return getPrisma().category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
}

export async function listActiveCategories() {
  return getPrisma().category.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } });
}

export async function getAdminProduct(id: string) {
  return getPrisma().product.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } }, category: { select: { id: true, name: true } } } });
}
