import type { Product } from "@/schemas/catalog";
import { ProductCard } from "@/components/product-card";
import { EmptyProducts } from "@/components/empty-products";

export function ProductGrid({ products, filtered = false }: { products: Product[]; filtered?: boolean }) {
  if (products.length === 0) return <EmptyProducts filtered={filtered} />;

  return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
