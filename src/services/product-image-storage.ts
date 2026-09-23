import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_IMAGES = 12;
export const PRODUCT_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type ValidatedProductImage = { bytes: Uint8Array; extension: "jpg" | "png" | "webp"; mimeType: typeof PRODUCT_IMAGE_MIME_TYPES[number] };
export type ImageValidationResult = { ok: true; image: ValidatedProductImage } | { ok: false; error: string };
export type StoredProductImage = { url: string; filename: string };

export function isCompleteProductImageOrder(existingIds: string[], requestedIds: string[]) {
  return requestedIds.length <= MAX_PRODUCT_IMAGES
    && requestedIds.length === existingIds.length
    && new Set(requestedIds).size === requestedIds.length
    && requestedIds.every((id) => existingIds.includes(id));
}

export function productImagePositions(ids: string[]) {
  return ids.map((id, position) => ({ id, position }));
}

const extensionTypes: Record<string, ValidatedProductImage["mimeType"]> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
};

export async function validateProductImageFile(file: Pick<File, "name" | "size" | "type" | "arrayBuffer">): Promise<ImageValidationResult> {
  if (!Number.isFinite(file.size) || file.size <= 0) return { ok: false, error: "O arquivo está vazio." };
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) return { ok: false, error: "Cada imagem pode ter no máximo 5 MB." };
  const name = file.name;
  if (name.length > 150 || name.startsWith(".") || name.includes("..") || /[\\/\u0000-\u001f\u007f]/.test(name)) {
    return { ok: false, error: "O nome do arquivo contém caracteres inválidos." };
  }
  const extension = name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (!extension || !Object.hasOwn(extensionTypes, extension)) return { ok: false, error: "Use uma imagem JPEG, PNG ou WebP." };
  const expectedMime = extensionTypes[extension];
  if (file.type.toLowerCase() !== expectedMime) return { ok: false, error: "O formato informado pelo arquivo não corresponde à extensão." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length !== file.size || !matchesImageSignature(bytes, expectedMime)) {
    return { ok: false, error: "O conteúdo do arquivo não corresponde a uma imagem válida desse formato." };
  }
  return { ok: true, image: { bytes, extension: expectedMime === "image/jpeg" ? "jpg" : expectedMime === "image/png" ? "png" : "webp", mimeType: expectedMime } };
}

function matchesImageSignature(bytes: Uint8Array, mimeType: ValidatedProductImage["mimeType"]) {
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte);
  return bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP";
}

function ascii(bytes: Uint8Array, from: number, to: number) { return String.fromCharCode(...bytes.slice(from, to)); }

export function resolveProductImageStorage(cwd = process.cwd(), relativeDirectory = process.env.PRODUCT_IMAGE_STORAGE_DIR || "product-images") {
  const segments = relativeDirectory.split(/[\\/]/);
  if (path.isAbsolute(relativeDirectory) || segments.some((segment) => segment === ".." || segment === ".") || segments.some((segment) => !segment)) {
    throw new Error("PRODUCT_IMAGE_STORAGE_DIR must be a safe relative directory under data.");
  }
  const dataRoot = path.resolve(cwd, "data");
  const directory = path.resolve(dataRoot, relativeDirectory);
  const relative = path.relative(dataRoot, directory);
  if (!relative || relative === "." || relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
    throw new Error("PRODUCT_IMAGE_STORAGE_DIR must be a subdirectory of data.");
  }
  return { dataRoot, directory, urlPrefix: "/api/product-images" };
}

export async function storeProductImage(file: Pick<File, "name" | "size" | "type" | "arrayBuffer">, cwd = process.cwd(), relativeDirectory = process.env.PRODUCT_IMAGE_STORAGE_DIR || "product-images"): Promise<StoredProductImage> {
  const result = await validateProductImageFile(file);
  if (!result.ok) throw new ProductImageValidationError(result.error);
  return storeValidatedProductImage(result.image, cwd, relativeDirectory);
}

export async function storeValidatedProductImage(image: ValidatedProductImage, cwd = process.cwd(), relativeDirectory = process.env.PRODUCT_IMAGE_STORAGE_DIR || "product-images"): Promise<StoredProductImage> {
  if (process.env.NODE_ENV === "production") throw new Error("Local image storage is disabled in production. Configure persistent object storage first.");
  const location = resolveProductImageStorage(cwd, relativeDirectory);
  await mkdir(location.directory, { recursive: true });
  const filename = `${randomUUID()}.${image.extension}`;
  const filePath = imageFilePath(location.directory, filename);
  try { await writeFile(filePath, image.bytes, { flag: "wx", mode: 0o644 }); }
  catch (error) { await rm(filePath, { force: true }).catch(() => undefined); throw error; }
  return { url: `${location.urlPrefix}/${filename}`, filename };
}

export async function removeStoredProductImage(url: string, cwd = process.cwd(), relativeDirectory = process.env.PRODUCT_IMAGE_STORAGE_DIR || "product-images"): Promise<{ managed: boolean; backup?: Uint8Array }> {
  const location = resolveProductImageStorage(cwd, relativeDirectory);
  const prefix = `${location.urlPrefix}/`;
  if (!url.startsWith(prefix)) return { managed: false };
  const filename = url.slice(prefix.length);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/.test(filename)) return { managed: false };
  await mkdir(location.directory, { recursive: true });
  const filePath = imageFilePath(location.directory, filename);
  let backup: Uint8Array;
  try { backup = await readFile(filePath); }
  catch (error) {
    if (isMissingFile(error)) return { managed: true };
    throw error;
  }
  await rm(filePath);
  return { managed: true, backup };
}

export async function restoreStoredProductImage(url: string, backup: Uint8Array, cwd = process.cwd(), relativeDirectory = process.env.PRODUCT_IMAGE_STORAGE_DIR || "product-images") {
  const location = resolveProductImageStorage(cwd, relativeDirectory);
  const prefix = `${location.urlPrefix}/`;
  const filename = url.startsWith(prefix) ? url.slice(prefix.length) : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/.test(filename)) throw new Error("Image does not belong to local product storage.");
  await mkdir(location.directory, { recursive: true });
  await writeFile(imageFilePath(location.directory, filename), backup, { flag: "wx", mode: 0o644 });
}

export async function readStoredProductImage(filename: string, cwd = process.cwd(), relativeDirectory = process.env.PRODUCT_IMAGE_STORAGE_DIR || "product-images") {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/.test(filename)) return null;
  const location = resolveProductImageStorage(cwd, relativeDirectory);
  try { return await readFile(imageFilePath(location.directory, filename)); }
  catch (error) { if (isMissingFile(error)) return null; throw error; }
}

function isMissingFile(error: unknown) { return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT"; }
function imageFilePath(directory: string, filename: string) { return path.join(/*turbopackIgnore: true*/ directory, filename); }

export class ProductImageValidationError extends Error {
  constructor(message: string) { super(message); this.name = "ProductImageValidationError"; }
}
