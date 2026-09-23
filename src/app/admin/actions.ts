"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ProductStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getPrisma } from "@/lib/prisma";
import { categoryInputSchema, productInputSchema } from "@/schemas/admin-catalog";
import { isCompleteProductImageOrder, MAX_PRODUCT_IMAGES, ProductImageValidationError, productImagePositions, removeStoredProductImage, restoreStoredProductImage, storeValidatedProductImage, validateProductImageFile } from "@/services/product-image-storage";

export type AdminActionState = { error?: string; fieldErrors?: Record<string, string[]>; success?: string };
const productPaths = ["/admin", "/admin/produtos"];
const categoryPaths = ["/admin", "/admin/categorias", "/admin/produtos/novo"];
function revalidatePublicCatalog() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/categoria/[slug]", "page");
  revalidatePath("/produto/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  return Object.fromEntries(issues.map(({ path, message }) => [String(path[0] ?? "_form"), [message]]));
}

function isUniqueConstraint(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function invalid(message: string): AdminActionState { return { error: message }; }

export async function createCategoryAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = categoryInputSchema.safeParse({ name: formData.get("name"), slug: formData.get("slug"), isActive: formData.get("isActive") === "on" });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  try {
    const duplicate = await getPrisma().category.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
    if (duplicate) return invalid("Já existe uma categoria com esse slug.");
    await getPrisma().category.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueConstraint(error)) return invalid("Já existe uma categoria com esse slug.");
    return invalid("Não foi possível salvar a categoria. Verifique a conexão com o banco e tente novamente.");
  }
  for (const path of categoryPaths) revalidatePath(path);
  revalidatePublicCatalog();
  redirect("/admin/categorias?salvo=1");
}

export async function updateCategoryAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return invalid("Categoria inválida.");
  const parsed = categoryInputSchema.safeParse({ name: formData.get("name"), slug: formData.get("slug"), isActive: formData.get("isActive") === "on" });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  try {
    const duplicate = await getPrisma().category.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
    if (duplicate && duplicate.id !== id) return invalid("Já existe uma categoria com esse slug.");
    await getPrisma().category.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isUniqueConstraint(error)) return invalid("Já existe uma categoria com esse slug.");
    return invalid("Não foi possível atualizar a categoria. Verifique a conexão com o banco e tente novamente.");
  }
  for (const path of categoryPaths) revalidatePath(path);
  revalidatePublicCatalog();
  redirect("/admin/categorias?salvo=1");
}

export async function createProductAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = productInputSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  try {
    const db = getPrisma();
    if (await db.product.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } })) return invalid("Já existe um produto com esse slug.");
    const category = await db.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true, isActive: true } });
    if (!category?.isActive) return invalid("Selecione uma categoria ativa.");
    const product = await db.product.create({ data: {
      name: parsed.data.name, slug: parsed.data.slug, description: parsed.data.description, price: parsed.data.price,
      stock: parsed.data.stock, availability: parsed.data.availability,
      status: parsed.data.isPublished ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
      categoryId: parsed.data.categoryId,
    }, select: { id: true } });
    for (const path of productPaths) revalidatePath(path);
    revalidatePublicCatalog();
    revalidatePath("/admin/produtos/novo");
    redirect(`/admin/produtos/${product.id}?salvo=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (isUniqueConstraint(error)) return invalid("Já existe um produto com esse slug.");
    return invalid("Não foi possível criar o produto. Verifique os dados e a conexão com o banco.");
  }
  return {};
}

export async function updateProductAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return invalid("Produto inválido.");
  const parsed = productInputSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  try {
    const db = getPrisma();
    const duplicate = await db.product.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
    if (duplicate && duplicate.id !== id) return invalid("Já existe um produto com esse slug.");
    const category = await db.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true, isActive: true } });
    if (!category || (!category.isActive && category.id !== (await db.product.findUnique({ where: { id }, select: { categoryId: true } }))?.categoryId)) {
      return invalid("Selecione uma categoria ativa.");
    }
    await db.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: {
        name: parsed.data.name, slug: parsed.data.slug, description: parsed.data.description, price: parsed.data.price,
        stock: parsed.data.stock, availability: parsed.data.availability,
        status: parsed.data.isPublished ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
        categoryId: parsed.data.categoryId,
      } });
    });
  } catch (error) {
    if (isUniqueConstraint(error)) return invalid("Já existe um produto com esse slug.");
    return invalid("Não foi possível atualizar o produto. Verifique os dados e a conexão com o banco.");
  }
  for (const path of productPaths) revalidatePath(path);
  revalidatePublicCatalog();
  revalidatePath(`/admin/produtos/${id}`);
  redirect(`/admin/produtos/${id}?salvo=1`);
}

export async function archiveProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  try { await getPrisma().product.update({ where: { id }, data: { status: ProductStatus.ARCHIVED } }); }
  catch { redirect("/admin/produtos?falha=1"); }
  for (const path of productPaths) revalidatePath(path);
  revalidatePublicCatalog();
  redirect("/admin/produtos?arquivado=1");
}

export async function uploadProductImageAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const file = formData.get("image");
  if (!productId || typeof File === "undefined" || !(file instanceof File)) return invalid("Selecione uma imagem para enviar.");
  const validation = await validateProductImageFile(file);
  if (!validation.ok) return invalid(validation.error);
  const altText = String(formData.get("altText") ?? "").trim();
  if (altText.length > 180) return invalid("O texto alternativo deve ter até 180 caracteres.");

  const db = getPrisma();
  let product;
  try { product = await db.product.findUnique({ where: { id: productId }, select: { id: true, status: true, images: { select: { position: true } } } }); }
  catch { return invalid("Não foi possível acessar o produto no banco de dados."); }
  if (!product || product.status === ProductStatus.ARCHIVED) return invalid("Produto não encontrado.");
  if (product.images.length >= MAX_PRODUCT_IMAGES) return invalid(`Cada produto pode ter até ${MAX_PRODUCT_IMAGES} imagens.`);

  let stored;
  try { stored = await storeValidatedProductImage(validation.image); }
  catch (error) {
    if (error instanceof ProductImageValidationError) return invalid(error.message);
    return invalid("Não foi possível armazenar a imagem. O armazenamento local só funciona em desenvolvimento.");
  }
  try {
    await db.productImage.create({ data: { productId, url: stored.url, altText: altText || null, position: nextPosition(product.images.map((image) => image.position)) } });
  } catch {
    try { await removeStoredProductImage(stored.url); }
    catch { return invalid("O cadastro falhou e o arquivo temporário não pôde ser removido. Será necessária uma limpeza manual do armazenamento local."); }
    return invalid("Não foi possível associar a imagem ao produto. Verifique o banco e tente novamente.");
  }
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/admin/produtos");
  revalidatePublicCatalog();
  redirect(`/admin/produtos/${productId}?imagem=adicionada`);
}

export async function reorderProductImagesAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const imageIds = formData.getAll("imageId").map(String);
  if (!productId || imageIds.some((id) => !id)) return invalid("A ordem das imagens é inválida.");
  const db = getPrisma();
  const images = await db.productImage.findMany({ where: { productId }, select: { id: true } });
  if (!isCompleteProductImageOrder(images.map((image) => image.id), imageIds)) return invalid("Atualize a página antes de salvar a ordem das imagens.");
  await db.$transaction(async (tx) => {
    for (const { id, position } of productImagePositions(imageIds)) await tx.productImage.update({ where: { id }, data: { position } });
  });
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/admin/produtos");
  revalidatePublicCatalog();
  redirect(`/admin/produtos/${productId}?imagem=ordem-salva`);
}

export async function removeProductImageAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const imageId = String(formData.get("imageId") ?? "");
  if (!productId || !imageId) return invalid("Imagem inválida.");
  const db = getPrisma();
  const image = await db.productImage.findFirst({ where: { id: imageId, productId }, select: { id: true, url: true } });
  if (!image) return invalid("Esta imagem já foi removida. Atualize a página.");

  let removedFile;
  try { removedFile = await removeStoredProductImage(image.url); }
  catch { return invalid("Não foi possível remover o arquivo armazenado. A imagem continua associada ao produto."); }
  try {
    await db.$transaction(async (tx) => {
      await tx.productImage.delete({ where: { id: image.id } });
      const remaining = await tx.productImage.findMany({ where: { productId }, orderBy: [{ position: "asc" }, { createdAt: "asc" }, { id: "asc" }], select: { id: true } });
      for (const [position, item] of remaining.entries()) await tx.productImage.update({ where: { id: item.id }, data: { position } });
    });
  } catch {
    if (removedFile.backup) {
      try { await restoreStoredProductImage(image.url, removedFile.backup); }
      catch { return invalid("A remoção do banco falhou e a restauração do arquivo também. Será necessária uma verificação manual do armazenamento."); }
    }
    return invalid("Não foi possível remover a imagem do produto. Tente novamente.");
  }
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/admin/produtos");
  revalidatePublicCatalog();
  redirect(`/admin/produtos/${productId}?imagem=removida`);
}

function parseProductForm(formData: FormData) {
  return {
    name: formData.get("name"), slug: formData.get("slug"), description: formData.get("description"), price: formData.get("price"),
    categoryId: formData.get("categoryId"), stock: formData.get("stock"), availability: formData.get("availability"),
    isPublished: formData.get("isPublished") === "on",
  };
}

function isRedirectError(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");
}

function nextPosition(positions: number[]) { return positions.length ? Math.max(...positions) + 1 : 0; }
