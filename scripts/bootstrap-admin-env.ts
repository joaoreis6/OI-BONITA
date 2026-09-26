import "dotenv/config";
import { writeFileSync } from "node:fs";
import { stdout } from "node:process";
import { getPrisma } from "@/lib/prisma";
import { adminLoginSchema, hashAdminPassword } from "@/services/admin-auth-service";

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "";
  if (!email || !password) {
    stdout.write("Defina ADMIN_BOOTSTRAP_EMAIL e ADMIN_BOOTSTRAP_PASSWORD no ambiente.\n");
    process.exitCode = 1;
    return;
  }
  const parsed = adminLoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    stdout.write("E-mail ou senha não atende aos requisitos mínimos.\n");
    process.exitCode = 1;
    return;
  }

  const prisma = getPrisma();
  try {
    if (await prisma.admin.count() > 0) {
      stdout.write("Administrador já existe. Bootstrap ignorado.\n");
      return;
    }
    await prisma.admin.create({
      data: { email: parsed.data.email, passwordHash: await hashAdminPassword(parsed.data.password) },
      select: { id: true },
    });
    writeFileSync(".admin-credentials.local", `email=${parsed.data.email}\npassword=${parsed.data.password}\n`, { encoding: "utf8", mode: 0o600 });
    stdout.write("Administrador criado. Credenciais em .admin-credentials.local (gitignored).\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  stdout.write(`${error instanceof Error ? error.message : "Falha no bootstrap do administrador."}\n`);
  process.exitCode = 1;
});
