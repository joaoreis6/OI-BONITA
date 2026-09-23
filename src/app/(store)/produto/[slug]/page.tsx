import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ProductGallery } from "@/components/product-gallery";
import type { Product } from "@/schemas/catalog";
import { getPublicProductBySlug } from "@/services/public-catalog-service";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
type ProductPageProps = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getPublicProductBySlug(slug);
    if (!product) return { title: "Produto não encontrado" };
    const image = product.images[0];
    return {
      title: product.name,
      ...(product.description ? { description: product.description } : {}),
      alternates: { canonical: `/produto/${product.slug}` },
      openGraph: { title: `${product.name} | Oi, Bonita!`, ...(product.description ? { description: product.description } : {}), images: image ? [image] : undefined },
    };
  } catch { return { title: "Produto" }; }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product: Product | null;
  try { product = await getPublicProductBySlug(slug); }
  catch { return <main id="main-content" className="container catalog-section"><p role="alert">Não foi possível carregar este produto agora. Tente novamente em instantes.</p></main>; }
  if (!product) notFound();
  const stock = product.stock ?? 0;
  const outOfStock = stock === 0 || product.availability === "OUT_OF_STOCK";
  const availabilityText = outOfStock ? "Esgotado" : product.availability === "MADE_TO_ORDER" ? "Feito sob encomenda" : "Disponível";
  return (
    <main id="main-content" className="container">
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Catálogo", href: "/catalogo" }, ...(product.categoryName && product.categorySlug ? [{ label: product.categoryName, href: `/categoria/${product.categorySlug}` }] : []), { label: product.name }]} />
      <article className="product-detail">
        <ProductGallery name={product.name} images={product.images} />
        <div className="product-detail-copy">
          {product.categoryName && <p className="eyebrow">{product.categoryName}</p>}
          <h1>{product.name}</h1>
          <p className="product-detail-price">{product.price === undefined ? "Consulte o valor pelo WhatsApp" : currency.format(product.price)}</p>
          {product.description && <p className="product-detail-description">{product.description}</p>}
          <p className="product-availability">{availabilityText}{!outOfStock && stock > 0 ? ` · ${stock} ${stock === 1 ? "unidade disponível" : "unidades disponíveis"}` : ""}</p>
          <ProductPurchasePanel product={product} />
        </div>
      </article>
    </main>
  );
}
