"use client";

import { useContext } from "react";
import { StoreContext } from "@/features/store/store-context";

export function useCart() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useCart precisa estar dentro de StoreProvider.");
  return {
    cartItems: store.cartItems,
    publicProducts: store.publicProducts,
    cartSummary: store.cartSummary,
    isHydrated: store.isHydrated,
    persistenceError: store.persistenceError,
    catalogError: store.catalogError,
    catalogLoaded: store.catalogLoaded,
    actionFeedback: store.actionFeedback,
    addToCart: store.addToCart,
    refreshProduct: store.refreshProduct,
    refreshCart: store.refreshCart,
    reportActionError: store.reportActionError,
    setQuantity: store.setQuantity,
    removeFromCart: store.removeFromCart,
    clearCart: store.clearCart,
    clearActionFeedback: store.clearActionFeedback,
  };
}
