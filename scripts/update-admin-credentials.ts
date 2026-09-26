import "dotenv/config";
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
    const admin = await prisma.admin.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
    if (!admin) {
      stdout.write("Nenhum administrador encontrado. Use pnpm admin:create ou bootstrap-admin-env.\n");
      process.exitCode = 1;
      return;
    }
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        email: parsed.data.email,
        passwordHash: await hashAdminPassword(parsed.data.password),
        failedLoginAttempts: 0,
        lockedUntil: null,
        isActive: true,
      },
    });
    stdout.write(`Credenciais do administrador atualizadas para ${parsed.data.email}.\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  stdout.write(`${error instanceof Error ? error.message : "Falha ao atualizar credenciais."}\n`);
  process.exitCode = 1;
});
