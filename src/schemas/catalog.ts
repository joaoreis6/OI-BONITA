import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  image: z.string().optional(),
  active: z.boolean().default(true),
});

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  compareAtPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  badge: z.string().trim().min(1).optional(),
  createdAt: z.string().datetime().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().optional(),
  categoryId: z.string().min(1),
  images: z.array(z.string()).default([]),
  categoryName: z.string().optional(),
  categorySlug: z.string().optional(),
  availability: z.enum(["AVAILABLE", "OUT_OF_STOCK", "MADE_TO_ORDER"]).optional(),
});

export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
