import test from "node:test";
import assert from "node:assert/strict";
import { categoryInputSchema, checkSlugAvailable, productInputSchema, slugify } from "../src/schemas/admin-catalog.ts";

test("normalizes category slugs with accents, spaces and punctuation", () => {
  assert.equal(slugify(" Prata 925! "), "prata-925");
  assert.equal(categoryInputSchema.parse({ name: "Óculos de Sol", isActive: true }).slug, "oculos-de-sol");
  assert.equal(categoryInputSchema.parse({ name: "Óculos", slug: "  NOVA categoria! ", isActive: true }).slug, "nova-categoria");
});

test("detects conflicting slugs while allowing an unchanged record slug", () => {
  const existing = { id: "cat-1", slug: "prata-925" };
  assert.equal(checkSlugAvailable(null, "prata-925"), true);
  assert.equal(checkSlugAvailable(existing, "prata-925"), false);
  assert.equal(checkSlugAvailable(existing, "prata-925", "cat-1"), true);
  assert.equal(checkSlugAvailable(existing, "semijoias"), true);
});

test("validates product money, stock, status, category and image ordering inputs", () => {
  const valid = productInputSchema.safeParse({ name: "Produto", slug: "produto", description: "Descrição", price: "129,90", categoryId: "category-1", stock: "2", availability: "AVAILABLE", isPublished: true });
  assert.equal(valid.success, true);
  if (valid.success) assert.equal(valid.data.price, "129.90");
  for (const stock of ["-1", "1.2", "abc"]) {
    assert.equal(productInputSchema.safeParse({ name: "Produto", slug: "produto", price: "10,00", categoryId: "cat", stock, availability: "AVAILABLE", isPublished: false }).success, false);
  }
  for (const price of ["", "1.234,50", "abc", "10.999"]) {
    assert.equal(productInputSchema.safeParse({ name: "Produto", slug: "produto", price, categoryId: "cat", stock: "0", availability: "AVAILABLE", isPublished: false }).success, false);
  }
});
