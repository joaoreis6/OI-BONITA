import test from "node:test";
import assert from "node:assert/strict";
import { parseFavoritesStorage, serializeFavorites, toggleFavorite } from "../src/services/favorites-service.ts";

test("toggles favorite IDs and avoids duplicates in persistence", () => {
  const ids = toggleFavorite([], "fixture-product");
  assert.deepEqual(ids, ["fixture-product"]);
  assert.deepEqual(toggleFavorite(ids, "fixture-product"), []);
  assert.equal(serializeFavorites(["a", "a"]), '["a"]');
  assert.deepEqual(parseFavoritesStorage('["a","a",4]'), []);
  assert.deepEqual(parseFavoritesStorage('["a","a"]'), ["a"]);
});
