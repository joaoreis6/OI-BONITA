"use client";

import { HeartIcon } from "@/components/icons";
import { useFavorites } from "@/hooks/use-favorites";

export function FavoriteButton({ productId, productName, compact = false }: { productId: string; productName: string; compact?: boolean }) {
  const { isFavorite, toggleFavorite, isHydrated } = useFavorites();
  const active = isFavorite(productId);
  const label = active ? `Remover ${productName} dos favoritos` : `Adicionar ${productName} aos favoritos`;

  return (
    <button
      className={`favorite-button${compact ? " favorite-button-compact" : ""}${active ? " is-favorite" : ""}`}
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={!isHydrated}
      onClick={() => toggleFavorite(productId)}
    >
      <HeartIcon width={19} height={19} filled={active} />
      {!compact && <span>{active ? "Salvo nos favoritos" : "Adicionar aos favoritos"}</span>}
      <span className="sr-only" aria-live="polite">{active ? `${productName} está nos favoritos.` : `${productName} não está nos favoritos.`}</span>
    </button>
  );
}
