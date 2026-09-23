import { z } from "zod";

const environmentSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXTAUTH_URL: z.url().optional(),
  DATABASE_URL: z.url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  PRODUCT_IMAGE_STORAGE_DIR: z.string().min(1).default("uploads/products"),
});

const parsedEnvironment = environmentSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  PRODUCT_IMAGE_STORAGE_DIR: process.env.PRODUCT_IMAGE_STORAGE_DIR,
});

if (!parsedEnvironment.success) {
  const invalidKeys = [...new Set(parsedEnvironment.error.issues.map((issue) => issue.path.join(".")))];
  throw new Error(`Invalid environment configuration: ${invalidKeys.join(", ")}`);
}

export const env = parsedEnvironment.data;
