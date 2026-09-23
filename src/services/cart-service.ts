import type { Product } from "../schemas/catalog.ts";
import { cartItemsSchema, type CartItem } from "../schemas/store.ts";

export const CART_STORAGE_KEY = "oi-bonita-cart";

export type CartLine = {
  product: Product;
  quantity: number;
  lineSubtotal?: number;
};

export type CartSummary = {
  lines: CartLine[];
  itemCount: number;
  subtotal?: number;
};

export type CartMutation = {
  items: CartItem[];
  message?: string;
  error?: string;
};

function productFor(id: string, products: Product[]) {
  return products.find((product) => product.id === id && product.active);
}

function limitQuantity(quantity: number, stock?: number) {
  return stock === undefined ? quantity : Math.min(quantity, stock);
}

export function restoreCart(value: unknown, products: Product[]): CartItem[] {
  const parsed = cartItemsSchema.safeParse(value);
  if (!parsed.success) return [];

  const quantities = new Map<string, number>();
  for (const item of parsed.data) {
    const product = productFor(item.productId, products);
    if (!product || product.stock === 0 || product.availability === "OUT_OF_STOCK") continue;
    const nextQuantity = (quantities.get(item.productId) ?? 0) + item.quantity;
    quantities.set(item.productId, limitQuantity(nextQuantity, product.stock));
  }

  return Array.from(quantities, ([productId, quantity]) => ({ productId, quantity }));
}

export function parseCartStorage(value: string | null, products: Product[]): CartItem[] {
  if (!value) return [];
  try {
    return restoreCart(JSON.parse(value) as unknown, products);
  } catch {
    return [];
  }
}

export function parseStoredCartItems(value: string | null): CartItem[] {
  if (!value) return [];
  try {
    const parsed = cartItemsSchema.safeParse(JSON.parse(value) as unknown);
    if (!parsed.success) return [];
    const quantities = new Map<string, number>();
    for (const item of parsed.data) quantities.set(item.productId, Math.min(99, (quantities.get(item.productId) ?? 0) + item.quantity));
    return Array.from(quantities, ([productId, quantity]) => ({ productId, quantity }));
  } catch {
    return [];
  }
}

export function serializeCart(items: CartItem[]) {
  return JSON.stringify(items);
}

export function addCartItem(items: CartItem[], product: Product, quantity = 1): CartMutation {
  if (!product.active || product.stock === 0 || product.availability === "OUT_OF_STOCK") return { items, error: "Este produto está indisponível." };
  if (!Number.isInteger(quantity) || quantity < 1) return { items, error: "Escolha uma quantidade válida." };

  const existingQuantity = items.find((item) => item.productId === product.id)?.quantity ?? 0;
  const desiredQuantity = existingQuantity + quantity;
  const nextQuantity = limitQuantity(desiredQuantity, product.stock);
  const nextItems = items.filter((item) => item.productId !== product.id);
  nextItems.push({ productId: product.id, quantity: nextQuantity });

  return {
    items: nextItems,
    message: nextQuantity < desiredQuantity ? "A quantidade foi ajustada ao estoque disponível." : "Produto adicionado ao carrinho.",
  };
}

export function setCartItemQuantity(items: CartItem[], product: Product, quantity: number): CartMutation {
  if (!Number.isInteger(quantity) || quantity < 1) return { items, error: "A quantidade mínima é 1." };
  if (!product.active || product.stock === 0 || product.availability === "OUT_OF_STOCK") return { items, error: "Este produto está indisponível." };
  const nextQuantity = limitQuantity(quantity, product.stock);
  const nextItems = items.map((item) => item.productId === product.id ? { ...item, quantity: nextQuantity } : item);
  return {
    items: nextItems,
    message: nextQuantity < quantity ? "A quantidade foi ajustada ao estoque disponível." : undefined,
  };
}

export function removeCartItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

export function summarizeCart(items: CartItem[], products: Product[]): CartSummary {
  const lines = items.flatMap((item) => {
    const product = productFor(item.productId, products);
    if (!product || product.stock === 0 || product.availability === "OUT_OF_STOCK") return [];
    return [{
      product,
      quantity: item.quantity,
      ...(product.price !== undefined ? { lineSubtotal: Math.round(product.price * 100) * item.quantity / 100 } : {}),
    }];
  });
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);
  const hasAllPrices = lines.every((line) => line.product.price !== undefined);
  const subtotal = hasAllPrices
    ? lines.reduce((total, line) => total + Math.round((line.product.price ?? 0) * 100) * line.quantity, 0) / 100
    : undefined;

  return { lines, itemCount, ...(subtotal !== undefined ? { subtotal } : {}) };
}
