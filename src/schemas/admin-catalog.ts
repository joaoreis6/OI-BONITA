import { z } from "zod";

const nameSchema = z.string().trim().min(1, "Informe o nome.").max(120, "Use até 120 caracteres.");
const slugSchema = z.string().trim().max(140).optional().transform((value) => value ?? "");

export function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 140);
}

export const categoryInputSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  isActive: z.boolean().default(true),
}).transform((value) => ({ ...value, slug: slugify(value.slug || value.name) }))
  .refine((value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug), { path: ["slug"], message: "Informe um slug válido." });

const moneySchema = z.string().trim().min(1, "Informe o preço.")
  .transform((value) => value.replace(",", "."))
  .refine((value) => /^\d{1,8}(?:\.\d{1,2})?$/.test(value), "Informe um preço válido, com até duas casas decimais.");

export const productInputSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  description: z.string().trim().max(5000, "Use até 5.000 caracteres.").optional().transform((value) => value || null),
  price: moneySchema,
  categoryId: z.string().trim().min(1, "Selecione uma categoria."),
  stock: z.string().trim().regex(/^\d{1,9}$/, "O estoque deve ser um inteiro não negativo.").transform(Number)
    .refine(Number.isSafeInteger, "Informe uma quantidade válida."),
  availability: z.enum(["AVAILABLE", "OUT_OF_STOCK", "MADE_TO_ORDER"]),
  isPublished: z.boolean(),
}).transform((value) => ({ ...value, slug: slugify(value.slug || value.name) }))
  .refine((value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug), { path: ["slug"], message: "Informe um slug válido." });

export function checkSlugAvailable<T extends { id?: string; slug: string }>(
  existing: T | null,
  slug: string,
  currentId?: string,
) {
  return !existing || existing.slug !== slug || existing.id === currentId;
}
