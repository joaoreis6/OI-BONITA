import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const cartItemsSchema = z.array(cartItemSchema);
export const favoriteIdsSchema = z.array(z.string().min(1));

export type CartItem = z.infer<typeof cartItemSchema>;
