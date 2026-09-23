import "dotenv/config";
import { createInterface, emitKeypressEvents } from "node:readline";
import { stdin, stdout } from "node:process";
import { adminLoginSchema, hashAdminPassword } from "@/services/admin-auth-service";
import { getPrisma } from "@/lib/prisma";

function ask(question: string) {
  const readline = createInterface({ input: stdin, output: stdout });
  return new Promise<string>((resolve) => readline.question(question, (answer) => {
    readline.close();
    resolve(answer);
  }));
}

function askHidden(question: string) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    return Promise.reject(new Error("Execute este comando em um terminal interativo para ocultar a senha digitada."));
  }

  emitKeypressEvents(stdin);
  stdin.setEncoding("utf8");
  stdout.write(question);
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise<string>((resolve, reject) => {
    let value = "";
    const finish = (error?: Error) => {
      stdin.off("keypress", onKeypress);
      stdin.setRawMode(false);
      stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };
    const onKeypress = (character: string, key: { name?: string; ctrl?: boolean }) => {
      if (key.ctrl && key.name === "c") return finish(new Error("Operação cancelada."));
      if (key.name === "return" || key.name === "enter") return finish();
      if (key.name === "backspace") {
        value = Array.from(value).slice(0, -1).join("");
        stdout.write("\b \b");
        return;
      }
      if (!key.ctrl && character) {
        value += character;
        stdout.write("•");
      }
    };
    stdin.on("keypress", onKeypress);
  });
}

async function main() {
  const emailInput = await ask("E-mail do administrador: ");
  const password = await askHidden("Senha (mínimo de 12 caracteres, entrada oculta): ");
  const confirmation = await askHidden("Confirme a senha: ");
  const parsed = adminLoginSchema.safeParse({ email: emailInput, password });
  if (!parsed.success) throw new Error("E-mail ou senha não atende aos requisitos mínimos.");
  if (password !== confirmation) throw new Error("As senhas não coincidem.");

  const prisma = getPrisma();
  try {
    if (await prisma.admin.count() > 0) throw new Error("Já existe um administrador. A criação inicial foi bloqueada.");
    await prisma.admin.create({
      data: { email: parsed.data.email, passwordHash: await hashAdminPassword(parsed.data.password) },
      select: { id: true },
    });
    stdout.write("Administrador criado. A senha foi armazenada somente em formato scrypt.\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error && error.name.startsWith("Prisma")
    ? "Não foi possível acessar o PostgreSQL. Confira DATABASE_URL e as migrações."
    : error instanceof Error ? error.message : "Não foi possível criar o administrador.";
  stdout.write(`${message}\n`);
  process.exitCode = 1;
});
