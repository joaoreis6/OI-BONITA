"use client";

import { useContext } from "react";
import { StoreContext } from "@/features/store/store-context";

export function useFavorites() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useFavorites precisa estar dentro de StoreProvider.");
  return {
    favoriteIds: store.favoriteIds,
    publicProducts: store.publicProducts,
    isHydrated: store.isHydrated,
    persistenceError: store.persistenceError,
    catalogError: store.catalogError,
    catalogLoaded: store.catalogLoaded,
    toggleFavorite: store.toggleFavorite,
    isFavorite: store.isFavorite,
  };
}
