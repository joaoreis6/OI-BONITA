import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { listPublicSitemapEntries } from "@/services/public-catalog-service";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const routes: MetadataRoute.Sitemap = [
    { url: new URL("/", base).toString(), changeFrequency: "weekly", priority: 1 },
    { url: new URL("/catalogo", base).toString(), changeFrequency: "daily", priority: 0.9 },
  ];
  try {
    const { categories, products } = await listPublicSitemapEntries();
    routes.push(
      ...categories.map((category) => ({ url: new URL(`/categoria/${category.slug}`, base).toString(), changeFrequency: "weekly" as const, priority: 0.7 })),
      ...products.map((product) => ({ url: new URL(`/produto/${product.slug}`, base).toString(), changeFrequency: "weekly" as const, priority: 0.6 })),
    );
  } catch { /* Keep the static entry points available if PostgreSQL is offline. */ }
  return routes;
}
