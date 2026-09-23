import { createContext } from "react";
import type { Product } from "@/schemas/catalog";
import type { CartItem } from "@/schemas/store";
import type { CartSummary } from "@/services/cart-service";

export type StoreContextValue = {
  cartItems: CartItem[];
  favoriteIds: string[];
  publicProducts: Product[];
  cartSummary: CartSummary;
  isHydrated: boolean;
  persistenceError: string | null;
  catalogError: boolean;
  catalogLoaded: boolean;
  actionFeedback: { kind: "success" | "error"; message: string } | null;
  addToCart: (product: Product, quantity?: number) => boolean;
  refreshProduct: (productId: string) => Promise<Product | null>;
  refreshCart: () => Promise<CartSummary | null>;
  reportActionError: (message: string) => void;
  setQuantity: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearActionFeedback: () => void;
};

export const StoreContext = createContext<StoreContextValue | null>(null);
