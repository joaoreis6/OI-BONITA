import "dotenv/config";
import { stdout } from "node:process";
import { getPrisma } from "@/lib/prisma";

/** Categorias oficiais da Oi, Bonita! — cadastro idempotente no PostgreSQL. */
const OFFICIAL_CATEGORIES = [
  { name: "Prata 925", slug: "prata-925" },
  { name: "Semijoias", slug: "semijoias" },
  { name: "Perfumes", slug: "perfumes" },
  { name: "Cosméticos", slug: "cosmeticos" },
  { name: "Óculos", slug: "oculos" },
  { name: "Acessórios", slug: "acessorios" },
] as const;

async function main() {
  const prisma = getPrisma();
  try {
    for (const category of OFFICIAL_CATEGORIES) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        create: { name: category.name, slug: category.slug, isActive: true },
        update: { name: category.name, isActive: true },
      });
    }
    const count = await prisma.category.count({ where: { isActive: true } });
    stdout.write(`Categorias oficiais sincronizadas. Total ativo: ${count}.\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error && error.name.startsWith("Prisma")
    ? "Não foi possível acessar o PostgreSQL. Confira DATABASE_URL e execute pnpm db:deploy antes."
    : error instanceof Error ? error.message : "Falha ao sincronizar categorias.";
  stdout.write(`${message}\n`);
  process.exitCode = 1;
});
