import "dotenv/config";
import { spawnSync } from "node:child_process";
import { stdout } from "node:process";
import { getPrisma } from "@/lib/prisma";

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function verifyDatabase() {
  const prisma = getPrisma();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `;
    stdout.write(`PostgreSQL conectado. Tabelas: ${tables.map((row) => row.tablename).join(", ") || "nenhuma"}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    stdout.write("DATABASE_URL não está definida. Exporte a URL real do PostgreSQL antes de continuar.\n");
    process.exitCode = 1;
    return;
  }

  stdout.write("1/3 — Aplicando migrations (pnpm db:deploy)...\n");
  run("pnpm", ["db:deploy"]);

  stdout.write("2/3 — Sincronizando categorias oficiais (pnpm db:seed-categories)...\n");
  run("pnpm", ["db:seed-categories"]);

  stdout.write("3/3 — Verificando conexão e tabelas...\n");
  await verifyDatabase();

  stdout.write("\nPróximo passo manual: pnpm admin:create\n");
  stdout.write("Depois, configure NEXTAUTH_SECRET e NEXTAUTH_URL no Netlify e faça redeploy.\n");
}

main().catch((error: unknown) => {
  stdout.write(`${error instanceof Error ? error.message : "Falha na preparação de produção."}\n`);
  process.exitCode = 1;
});
