import test from "node:test";
import assert from "node:assert/strict";
import { createCartWhatsAppMessage, createProductWhatsAppMessage, createWhatsAppUrl } from "../src/services/whatsapp-service.ts";

// Development-only fixture; never exported into the public storefront catalog.
const product = { id: "fixture-item", slug: "fixture-item", name: "Fixture item", categoryId: "fixture", active: true, featured: false, stock: 2, price: 12.5, images: [] };

test("builds product inquiry and safely encoded WhatsApp URL", () => {
  const message = createProductWhatsAppMessage(product, 2, "https://example.test/produto/fixture-item?a=1&b=2");
  assert.match(message, /Fixture item/);
  assert.match(message, /Quantidade: 2/);
  assert.match(message, /R\$\s?12,50/);
  const url = createWhatsAppUrl(message, "+55 (43) 99999-0000");
  assert.match(url, /^https:\/\/wa\.me\/5543999990000\?text=/);
  assert.equal(decodeURIComponent(new URL(url).searchParams.get("text")), message);
});

test("creates cart order text and flags unknown prices", () => {
  const lines = [{ product, quantity: 2, lineSubtotal: 25 }];
  assert.match(createCartWhatsAppMessage(lines, 25), /Subtotal: R\$\s?25,00/);
  const unknown = { ...product, price: undefined };
  const message = createCartWhatsAppMessage([{ product: unknown, quantity: 1 }]);
  assert.match(message, /preço a confirmar/);
  assert.match(message, /confirme os valores/);
});
