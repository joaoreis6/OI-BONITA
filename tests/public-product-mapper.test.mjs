import test from "node:test";
import assert from "node:assert/strict";
import { toPublicProduct } from "../src/services/public-product-mapper.ts";

test("maps only public product fields, exact decimal value, category and ordered image URLs", () => {
  const product = toPublicProduct({
    id: "product-1", name: "Produto confirmado", slug: "produto-confirmado", description: "Descrição real",
    price: { toNumber: () => 129.9 }, availability: "AVAILABLE", stock: 4,
    createdAt: new Date("2026-01-01T00:00:00.000Z"), categoryId: "category-1",
    category: { name: "Prata 925", slug: "prata-925" }, images: [{ url: "/image-1.jpg" }, { url: "/image-2.jpg" }],
  });
  assert.equal(product.price, 129.9);
  assert.equal(product.categorySlug, "prata-925");
  assert.deepEqual(product.images, ["/image-1.jpg", "/image-2.jpg"]);
  assert.equal(product.active, true);
  assert.equal("status" in product, false);
  assert.equal("passwordHash" in product, false);
});

test("handles missing price, description and images without inventing values", () => {
  const product = toPublicProduct({
    id: "product-2", name: "Produto", slug: "produto", description: null, price: null,
    availability: "OUT_OF_STOCK", stock: 0, createdAt: new Date(0), categoryId: "category-1",
    category: { name: "Categoria", slug: "categoria" }, images: [],
  });
  assert.equal(product.price, undefined);
  assert.equal(product.description, undefined);
  assert.deepEqual(product.images, []);
});
