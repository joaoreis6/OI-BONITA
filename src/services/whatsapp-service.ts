import { siteConfig } from "../config/site.ts";
import type { Product } from "../schemas/catalog.ts";
import type { CartLine } from "./cart-service.ts";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function createProductWhatsAppMessage(product: Product, quantity: number, productUrl: string) {
  const lines = [
    `Olá! Tenho interesse neste produto da ${siteConfig.name}`,
    "",
    `Produto: ${product.name}`,
    `Quantidade: ${quantity}`,
  ];
  if (product.price !== undefined) lines.push(`Preço unitário: ${currency.format(product.price)}`);
  if (productUrl) lines.push(`Página do produto: ${productUrl}`);
  lines.push("", "Gostaria de confirmar a disponibilidade e finalizar meu pedido.");
  return lines.join("\n");
}

export function createCartWhatsAppMessage(lines: CartLine[], subtotal?: number) {
  const message = [`Olá! Gostaria de fazer um pedido na ${siteConfig.name}:`, ""];
  for (const line of lines) {
    const name = line.product.name;
    const count = `${line.quantity} ${line.quantity === 1 ? "unidade" : "unidades"}`;
    if (line.product.price !== undefined && line.lineSubtotal !== undefined) {
      message.push(`• ${name} — ${count} × ${currency.format(line.product.price)} = ${currency.format(line.lineSubtotal)}`);
    } else {
      message.push(`• ${name} — ${count} · preço a confirmar`);
    }
  }
  if (subtotal !== undefined) message.push("", `Subtotal: ${currency.format(subtotal)}`);
  else if (lines.some((line) => line.product.price === undefined)) message.push("", "Há itens sem preço informado; por favor, confirme os valores.");
  message.push("", "Gostaria de confirmar a disponibilidade e finalizar meu pedido.");
  return message.join("\n");
}

export function createWhatsAppUrl(message: string, phone = siteConfig.whatsapp) {
  const normalizedPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
