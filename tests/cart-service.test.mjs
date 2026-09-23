import test from "node:test";
import assert from "node:assert/strict";
import { addCartItem, parseCartStorage, parseStoredCartItems, removeCartItem, restoreCart, serializeCart, setCartItemQuantity, summarizeCart } from "../src/services/cart-service.ts";

// Development-only fixture; never exported into the public storefront catalog.
const product = { id: "fixture-ring", slug: "fixture-ring", name: "Fixture ring", categoryId: "fixture", active: true, featured: false, stock: 3, price: 25.5, images: [] };

test("adds, increments and clamps quantities to stock", () => {
  const first = addCartItem([], product, 2);
  assert.deepEqual(first.items, [{ productId: product.id, quantity: 2 }]);
  const next = addCartItem(first.items, product, 5);
  assert.equal(next.items[0].quantity, 3);
  assert.match(next.message, /estoque/);
});

test("rejects invalid quantities and removes items", () => {
  assert.ok(addCartItem([], product, 0).error);
  assert.ok(setCartItemQuantity([{ productId: product.id, quantity: 2 }], product, 0).error);
  assert.deepEqual(removeCartItem([{ productId: product.id, quantity: 2 }], product.id), []);
});

test("restores only active products and summarizes totals from current product data", () => {
  const items = restoreCart([{ productId: product.id, quantity: 8 }, { productId: "removed", quantity: 1 }], [product]);
  assert.deepEqual(items, [{ productId: product.id, quantity: 3 }]);
  assert.deepEqual(summarizeCart(items, [product]), { lines: [{ product, quantity: 3, lineSubtotal: 76.5 }], itemCount: 3, subtotal: 76.5 });
  assert.deepEqual(parseCartStorage(serializeCart(items), [product]), items);
  assert.deepEqual(parseCartStorage("bad json", [product]), []);
});

test("omits subtotal when any product has no known price", () => {
  const withoutPrice = { ...product, price: undefined };
  const summary = summarizeCart([{ productId: product.id, quantity: 1 }], [withoutPrice]);
  assert.equal(summary.subtotal, undefined);
});

test("blocks products explicitly marked unavailable and clamps restored cart quantity", () => {
  const unavailable = { ...product, availability: "OUT_OF_STOCK" };
  assert.ok(addCartItem([], unavailable, 1).error);
  assert.ok(setCartItemQuantity([{ productId: product.id, quantity: 1 }], unavailable, 1).error);
  assert.deepEqual(restoreCart([{ productId: unavailable.id, quantity: 1 }], [unavailable]), []);
  assert.deepEqual(parseStoredCartItems('[{"productId":"p","quantity":4}]'), [{ productId: "p", quantity: 4 }]);
});
