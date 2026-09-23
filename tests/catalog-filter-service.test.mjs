import test from "node:test";
import assert from "node:assert/strict";
import { filterPublicProducts } from "../src/services/catalog-filter-service.ts";

const categories = [
  { id: "cat-1", name: "Prata 925", slug: "prata-925", active: true },
  { id: "cat-2", name: "Oculta", slug: "oculta", active: false },
];
const products = [
  { id: "a", name: "Anel Dourado", slug: "anel-dourado", description: "Pedra natural", categoryId: "cat-1", active: true, stock: 4, price: 129.9, images: [], createdAt: "2026-02-01T00:00:00.000Z" },
  { id: "b", name: "Brinco", slug: "brinco", description: "Prata delicada", categoryId: "cat-1", active: true, stock: 2, price: 75, images: [], createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "c", name: "Item sem preço", slug: "sem-preco", categoryId: "cat-1", active: true, stock: 1, images: [], createdAt: "2026-03-01T00:00:00.000Z" },
  { id: "hidden", name: "Produto oculto", slug: "oculto", categoryId: "cat-2", active: true, stock: 1, price: 10, images: [] },
];

test("search ignores capitalization and combines text with active category filter", () => {
  assert.deepEqual(filterPublicProducts(products, categories, "PEDRA", "prata-925", "recentes").map((item) => item.id), ["a"]);
  assert.deepEqual(filterPublicProducts(products, categories, "", "oculta", "recentes"), []);
  assert.deepEqual(filterPublicProducts(products, categories, "", "categoria-removida", "recentes"), []);
});

test("unknown prices sort last in both directions; empty search preserves all public results", () => {
  assert.deepEqual(filterPublicProducts(products, categories, "  ", "", "menor-preco").map((item) => item.id), ["b", "a", "c"]);
  assert.deepEqual(filterPublicProducts(products, categories, "", "", "maior-preco").map((item) => item.id), ["a", "b", "c"]);
});
