import "dotenv/config";
import { defineConfig } from "prisma/config";

const toolingDatabaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/oi_bonita?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: toolingDatabaseUrl },
});
