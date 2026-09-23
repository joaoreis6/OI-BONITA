import Link from "next/link";
import type { Product } from "@/schemas/catalog";
import { FlowerIcon } from "@/components/icons";
import { FavoriteButton } from "@/components/favorite-button";
import { ResilientProductImage } from "@/components/resilient-product-image";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ProductCard({ product }: { product: Product }) {
  const categoryName = product.categoryName;
  const image = product.images[0];

  return (
    <article className="product-card">
      <div className="product-card-visual">
      <Link className="product-card-image" href={`/produto/${product.slug}`} aria-label={`Ver ${product.name}`}>
        {image ? <ResilientProductImage src={image} alt={`${product.name}${categoryName ? ` — ${categoryName}` : ""}`} sizes="(max-width: 760px) 46vw, (max-width: 1000px) 30vw, 24vw" /> : <span className="product-image-fallback"><FlowerIcon width={32} height={32} /></span>}
        {product.badge && <span className="product-badge">{product.badge}</span>}
        {(product.stock === 0 || product.availability === "OUT_OF_STOCK") && <span className="product-stock-badge">Esgotado</span>}
      </Link>
      <FavoriteButton compact productId={product.id} productName={product.name} />
      </div>
      <div className="product-card-info">
        {categoryName && <p className="product-card-category">{categoryName}</p>}
        <h2 className="product-card-name"><Link href={`/produto/${product.slug}`}>{product.name}</Link></h2>
        <p className="product-card-price">
          {product.price !== undefined && product.compareAtPrice !== undefined && product.compareAtPrice > product.price && <del>{currency.format(product.compareAtPrice)}</del>}
          <span>{product.price === undefined ? "Consulte o valor" : currency.format(product.price)}</span>
        </p>
      </div>
    </article>
  );
}
