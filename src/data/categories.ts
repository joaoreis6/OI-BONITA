import type { Category } from "@/schemas/catalog";

export const categories = [
  { id: "prata-925", name: "Prata 925", slug: "prata-925", active: true },
  { id: "semijoias", name: "Semijoias", slug: "semijoias", active: true },
  { id: "perfumes", name: "Perfumes", slug: "perfumes", active: true },
  { id: "cosmeticos", name: "Cosméticos", slug: "cosmeticos", active: true },
  { id: "oculos", name: "Óculos", slug: "oculos", active: true },
  { id: "acessorios", name: "Acessórios", slug: "acessorios", active: true },
] satisfies Category[];

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug && category.active);
}
