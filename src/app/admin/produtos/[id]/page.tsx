import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminProduct, listActiveCategories } from "@/services/admin-catalog-service";
import { AdminPageHeading, Notice } from "@/app/admin/admin-ui";
import { ProductForm } from "@/app/admin/product-form";
import { ProductImageManager } from "@/app/admin/product-image-manager";

export const metadata: Metadata = { title: "Editar produto", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string; imagem?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  let product: Awaited<ReturnType<typeof getAdminProduct>> | null = null;
  let categories: Awaited<ReturnType<typeof listActiveCategories>> | null = null;
  try { [product, categories] = await Promise.all([getAdminProduct(id), listActiveCategories()]); } catch { /* Error state is rendered below. */ }
  if (!categories) return <><AdminPageHeading eyebrow="Catálogo" title="Editar produto" description="Atualize as informações do produto." /><Notice tone="error">Não foi possível carregar o produto. Verifique a conexão do banco.</Notice></>;
  if (!product || product.status === "ARCHIVED") notFound();
  const categoryOptions = categories.some((item) => item.id === product.categoryId)
    ? categories
    : [...categories, { id: product.categoryId, name: product.category.name }];
  return <><AdminPageHeading eyebrow="Catálogo" title="Editar produto" description="Atualize as informações do produto." />
    {query.salvo && <Notice>Produto salvo com sucesso.</Notice>}
    {query.imagem === "adicionada" && <Notice>Imagem enviada e adicionada à galeria.</Notice>}
    {query.imagem === "ordem-salva" && <Notice>Ordem salva. A primeira foto está definida como imagem principal.</Notice>}
    {query.imagem === "removida" && <Notice>Imagem removida da galeria.</Notice>}
    {query.imagem === "restauracao-necessaria" && <Notice tone="error">A operação encontrou um erro. Verifique manualmente os arquivos de imagem.</Notice>}
    <ProductForm categories={categoryOptions} product={{ id: product.id, name: product.name, slug: product.slug, description: product.description ?? "", price: product.price?.toString() ?? "", categoryId: product.categoryId, stock: product.stock, availability: product.availability, isPublished: product.status === "PUBLISHED" }} />
    <ProductImageManager productId={product.id} images={product.images} />
  </>;
}
