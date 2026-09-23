import { favoriteIdsSchema } from "../schemas/store.ts";

export const FAVORITES_STORAGE_KEY = "oi-bonita-favorites";

export function parseFavoritesStorage(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = favoriteIdsSchema.safeParse(JSON.parse(value) as unknown);
    return parsed.success ? Array.from(new Set(parsed.data)) : [];
  } catch {
    return [];
  }
}

export function serializeFavorites(ids: string[]) {
  return JSON.stringify(Array.from(new Set(ids)));
}

export function toggleFavorite(ids: string[], productId: string): string[] {
  return ids.includes(productId)
    ? ids.filter((id) => id !== productId)
    : [...ids, productId];
}
