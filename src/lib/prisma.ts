import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/config/env";

const globalForPrisma = globalThis as typeof globalThis & { oiBonitaPrisma?: PrismaClient };

export function getPrisma() {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");

  globalForPrisma.oiBonitaPrisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });

  return globalForPrisma.oiBonitaPrisma;
}
