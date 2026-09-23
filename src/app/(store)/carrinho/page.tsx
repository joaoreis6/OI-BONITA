import type { Metadata } from "next";
import { CartContents } from "@/components/cart-contents";

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Revise os itens do seu carrinho e envie seu pedido para a Oi, Bonita! pelo WhatsApp.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <main id="main-content" className="container utility-page">
      <header className="utility-page-heading"><p className="eyebrow">Seu pedido</p><h1 className="section-title">Carrinho</h1></header>
      <CartContents />
    </main>
  );
}
