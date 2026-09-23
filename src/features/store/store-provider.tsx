"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { StoreContext } from "@/features/store/store-context";
import {
  addCartItem,
  CART_STORAGE_KEY,
  parseStoredCartItems,
  restoreCart,
  removeCartItem,
  serializeCart,
  setCartItemQuantity,
  summarizeCart,
} from "@/services/cart-service";
import {
  FAVORITES_STORAGE_KEY,
  parseFavoritesStorage,
  serializeFavorites,
  toggleFavorite as toggleFavoriteId,
} from "@/services/favorites-service";
import type { Product } from "@/schemas/catalog";
import type { CartItem } from "@/schemas/store";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [publicProducts, setPublicProducts] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        setCartItems(parseStoredCartItems(window.localStorage.getItem(CART_STORAGE_KEY)));
        setFavoriteIds(parseFavoritesStorage(window.localStorage.getItem(FAVORITES_STORAGE_KEY)));
      } catch {
        setPersistenceError("Não foi possível acessar o armazenamento deste navegador.");
      } finally {
        setIsHydrated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const ids = Array.from(new Set([...cartItems.map((item) => item.productId), ...favoriteIds])).slice(0, 100);
    if (ids.length === 0) {
      queueMicrotask(() => {
        setPublicProducts([]);
        setCatalogError(false);
        setCatalogLoaded(true);
      });
      return;
    }
    let cancelled = false;
    Promise.all(Array.from({ length: Math.ceil(ids.length / 100) }, async (_, index) => {
      const query = new URLSearchParams();
      ids.slice(index * 100, (index + 1) * 100).forEach((id) => query.append("id", id));
      const response = await fetch(`/api/catalog/products?${query.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("catalog unavailable");
      return (await response.json() as { products: Product[] }).products;
    })).then((batches) => batches.flat())
      .then((currentProducts) => {
        if (cancelled) return;
        const restoredCart = restoreCart(cartItems, currentProducts);
        if (JSON.stringify(restoredCart) !== JSON.stringify(cartItems)) {
          const activeIds = new Set(currentProducts.map((product) => product.id));
          setActionFeedback({
            kind: "error",
            message: cartItems.some((item) => !activeIds.has(item.productId))
              ? "Um ou mais produtos saíram do catálogo e foram removidos do carrinho."
              : "O estoque mudou e a quantidade foi ajustada no carrinho.",
          });
        }
        setPublicProducts(currentProducts);
        setCartItems((current) => {
          const currentRestored = restoreCart(current, currentProducts);
          return JSON.stringify(current) === JSON.stringify(currentRestored) ? current : currentRestored;
        });
        setCatalogError(false);
        setCatalogLoaded(true);
      })
      .catch(() => { if (!cancelled) { setCatalogError(true); setCatalogLoaded(true); } });
    return () => { cancelled = true; };
  }, [cartItems, favoriteIds, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(cartItems));
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavorites(favoriteIds));
    } catch {
      queueMicrotask(() => setPersistenceError("Não foi possível salvar suas preferências neste navegador."));
    }
  }, [cartItems, favoriteIds, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    function syncFromOtherTab(event: StorageEvent) {
      if (event.key === CART_STORAGE_KEY) setCartItems(parseStoredCartItems(event.newValue));
      if (event.key === FAVORITES_STORAGE_KEY) setFavoriteIds(parseFavoritesStorage(event.newValue));
    }
    window.addEventListener("storage", syncFromOtherTab);
    return () => window.removeEventListener("storage", syncFromOtherTab);
  }, [isHydrated]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const result = addCartItem(cartItems, product, quantity);
    if (result.error) {
      setActionFeedback({ kind: "error", message: result.error });
      return false;
    }
    setCartItems(result.items);
    setActionFeedback({ kind: "success", message: result.message ?? "Produto adicionado ao carrinho." });
    return true;
  }, [cartItems]);

  const refreshProduct = useCallback(async (productId: string) => {
    try {
      const query = new URLSearchParams({ id: productId });
      const response = await fetch(`/api/catalog/products?${query}`, { cache: "no-store" });
      if (!response.ok) throw new Error("catalog unavailable");
      const payload = await response.json() as { products: Product[] };
      const fresh = payload.products.find((product) => product.id === productId) ?? null;
      setPublicProducts((current) => [...current.filter((product) => product.id !== productId), ...(fresh ? [fresh] : [])]);
      setCatalogError(false);
      return fresh;
    } catch {
      setCatalogError(true);
      return null;
    }
  }, []);

  const refreshCart = useCallback(async () => {
    const ids = Array.from(new Set(cartItems.map((item) => item.productId)));
    if (!ids.length) return null;
    try {
      const products: Product[] = [];
      for (let offset = 0; offset < ids.length; offset += 100) {
        const query = new URLSearchParams();
        ids.slice(offset, offset + 100).forEach((id) => query.append("id", id));
        const response = await fetch(`/api/catalog/products?${query}`, { cache: "no-store" });
        if (!response.ok) throw new Error("catalog unavailable");
        const payload = await response.json() as { products: Product[] };
        products.push(...payload.products);
      }
      const reconciled = restoreCart(cartItems, products);
      const changed = JSON.stringify(reconciled) !== JSON.stringify(cartItems);
      const availableIds = new Set(products.map((product) => product.id));
      const hasUnavailableItems = cartItems.some((item) => !availableIds.has(item.productId));
      setPublicProducts(products);
      setCartItems((current) => JSON.stringify(current) === JSON.stringify(reconciled) ? current : reconciled);
      setCatalogError(false);
      if (changed) {
        setActionFeedback({ kind: "error", message: hasUnavailableItems ? "Um ou mais produtos saíram do catálogo e foram removidos. Revise seu carrinho antes de enviar." : "O estoque mudou e a quantidade foi ajustada. Revise seu carrinho antes de enviar." });
        return null;
      }
      return summarizeCart(reconciled, products);
    } catch {
      setCatalogError(true);
      setActionFeedback({ kind: "error", message: "Não foi possível confirmar o estoque agora. O pedido não foi enviado." });
      return null;
    }
  }, [cartItems]);

  const reportActionError = useCallback((message: string) => {
    setActionFeedback({ kind: "error", message });
  }, []);

  const setQuantity = useCallback((product: Product, quantity: number) => {
    const result = setCartItemQuantity(cartItems, product, quantity);
    if (result.error) {
      setActionFeedback({ kind: "error", message: result.error });
      return;
    }
    setCartItems(result.items);
    if (result.message) setActionFeedback({ kind: "success", message: result.message });
    else setActionFeedback(null);
  }, [cartItems]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((current) => removeCartItem(current, productId));
    setActionFeedback({ kind: "success", message: "Produto removido do carrinho." });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setActionFeedback(null);
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((current) => toggleFavoriteId(current, productId));
    setActionFeedback(() => ({
      kind: "success",
      message: favoriteIds.includes(productId) ? "Removido dos favoritos." : "Adicionado aos favoritos.",
    }));
  }, [favoriteIds]);

  const isFavorite = useCallback((productId: string) => favoriteIds.includes(productId), [favoriteIds]);
  const clearActionFeedback = useCallback(() => setActionFeedback(null), []);
  const cartSummary = useMemo(() => summarizeCart(cartItems, publicProducts), [cartItems, publicProducts]);

  const contextValue = useMemo(() => ({
    cartItems,
    favoriteIds,
    publicProducts,
    cartSummary,
    isHydrated,
    persistenceError,
    catalogError,
    catalogLoaded,
    actionFeedback,
    addToCart,
    refreshProduct,
    refreshCart,
    reportActionError,
    setQuantity,
    removeFromCart,
    clearCart,
    toggleFavorite,
    isFavorite,
    clearActionFeedback,
  }), [cartItems, favoriteIds, publicProducts, cartSummary, isHydrated, persistenceError, catalogError, catalogLoaded, actionFeedback, addToCart, refreshProduct, refreshCart, reportActionError, setQuantity, removeFromCart, clearCart, toggleFavorite, isFavorite, clearActionFeedback]);

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
}
