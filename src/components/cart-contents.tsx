"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { QuantityControl } from "@/components/quantity-control";
import { FlowerIcon, ShoppingBagIcon } from "@/components/icons";
import { ResilientProductImage } from "@/components/resilient-product-image";
import { createCartWhatsAppMessage, createWhatsAppUrl } from "@/services/whatsapp-service";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CartContents() {
  const { cartItems, cartSummary, publicProducts, setQuantity, removeFromCart, clearCart, refreshCart, reportActionError, isHydrated, persistenceError, catalogError, catalogLoaded, actionFeedback } = useCart();

  useEffect(() => {
    if (isHydrated && cartItems.length > 0) void refreshCart();
  }, [isHydrated, cartItems.length, refreshCart]);

  if (!isHydrated || (cartItems.length > 0 && !catalogLoaded && !catalogError)) {
    return <div className="cart-loading" role="status" aria-live="polite">Carregando seu carrinho…</div>;
  }

  if (cartSummary.lines.length === 0) {
    if (cartItems.length > 0 && catalogError) return <section className="empty-state" role="alert"><h2>Não foi possível atualizar seu carrinho.</h2><p>Seus itens continuam salvos neste navegador. Tente novamente mais tarde.</p><Link className="button button-primary" href="/catalogo">Voltar ao catálogo</Link></section>;
    return (
      <section className="cart-empty empty-state" aria-live="polite">
        {actionFeedback && <p className={`cart-feedback ${actionFeedback.kind}`} role={actionFeedback.kind === "error" ? "alert" : "status"}>{actionFeedback.message}</p>}
        <span className="empty-state-mark"><ShoppingBagIcon width={24} height={24} /></span>
        <h2>Seu carrinho está vazio</h2>
        <p>Explore o catálogo e encontre algo especial para você.</p>
        <Link className="button button-primary" href="/catalogo">Continuar comprando</Link>
        {persistenceError && <p className="storage-warning" role="status">{persistenceError}</p>}
      </section>
    );
  }

  async function finishOnWhatsApp() {
    const destination = window.open("about:blank", "_blank");
    if (!destination) {
      reportActionError("Permita a abertura de uma nova aba para continuar pelo WhatsApp.");
      return;
    }
    destination.opener = null;
    const currentCart = await refreshCart();
    if (!currentCart) { destination.close(); return; }
    const message = createCartWhatsAppMessage(currentCart.lines, currentCart.subtotal);
    destination.location.href = createWhatsAppUrl(message);
  }

  return (
    <div className="cart-layout">
      <section className="cart-lines" aria-label="Produtos no carrinho" aria-live="polite">
        {cartSummary.lines.map((line) => {
          const image = line.product.images[0];
          const product = publicProducts.find((item) => item.id === line.product.id);
          return (
            <article className="cart-line" key={line.product.id}>
              <Link className="cart-line-image" href={`/produto/${line.product.slug}`} aria-label={`Ver ${line.product.name}`}>
                {image ? <ResilientProductImage src={image} alt={line.product.name} sizes="100px" /> : <FlowerIcon width={30} height={30} />}
              </Link>
              <div className="cart-line-details">
                <h2><Link href={`/produto/${line.product.slug}`}>{line.product.name}</Link></h2>
                <p className="cart-line-unit-price">{line.product.price === undefined ? "Preço a confirmar" : currency.format(line.product.price)}</p>
                {product && <QuantityControl compact label={line.product.name} quantity={line.quantity} maximum={product.stock} onChange={(quantity) => setQuantity(product, quantity)} />}
              </div>
              <div className="cart-line-total">
                <strong>{line.lineSubtotal === undefined ? "A confirmar" : currency.format(line.lineSubtotal)}</strong>
                <button className="remove-item-button" type="button" aria-label={`Remover ${line.product.name} do carrinho`} onClick={() => removeFromCart(line.product.id)}>Remover</button>
              </div>
            </article>
          );
        })}
        {actionFeedback && <p className={`cart-feedback ${actionFeedback.kind}`} role={actionFeedback.kind === "error" ? "alert" : "status"} aria-live="polite">{actionFeedback.message}</p>}
        {persistenceError && <p className="storage-warning" role="status">{persistenceError}</p>}
      </section>

      <aside className="cart-summary" aria-label="Resumo do pedido">
        {catalogError && <p className="storage-warning" role="alert">Não foi possível atualizar os produtos do carrinho. Tente novamente mais tarde.</p>}
        <h2>Resumo</h2>
        <div className="cart-summary-row"><span>Itens</span><span>{cartSummary.itemCount}</span></div>
        <div className="cart-summary-row cart-summary-total"><span>Subtotal</span><strong>{cartSummary.subtotal === undefined ? "A confirmar" : currency.format(cartSummary.subtotal)}</strong></div>
        {cartSummary.subtotal === undefined && <p className="price-pending-note">Um ou mais produtos não têm preço informado. A loja confirma os valores pelo WhatsApp.</p>}
        <button className="button button-primary cart-whatsapp-button" type="button" onClick={finishOnWhatsApp}>Enviar pedido pelo WhatsApp</button>
        <Link className="button button-outline cart-continue-button" href="/catalogo">Continuar comprando</Link>
        <button className="clear-cart-button" type="button" onClick={clearCart}>Limpar carrinho</button>
      </aside>
    </div>
  );
}
