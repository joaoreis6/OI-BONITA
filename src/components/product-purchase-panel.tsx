"use client";

import { useState } from "react";
import type { Product } from "@/schemas/catalog";
import { ArrowRightIcon, ChatIcon } from "@/components/icons";
import { FavoriteButton } from "@/components/favorite-button";
import { QuantityControl } from "@/components/quantity-control";
import { useCart } from "@/hooks/use-cart";
import { createProductWhatsAppMessage, createWhatsAppUrl } from "@/services/whatsapp-service";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, refreshProduct, reportActionError, actionFeedback, persistenceError } = useCart();
  const [isChecking, setIsChecking] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const unavailable = !product.active || product.stock === 0 || product.availability === "OUT_OF_STOCK";

  async function addCurrentProduct() {
    setIsChecking(true);
    setPurchaseError("");
    const current = await refreshProduct(product.id);
    setIsChecking(false);
    if (!current) {
      const message = "Não foi possível confirmar o estoque. Tente novamente antes de adicionar.";
      setPurchaseError(message);
      reportActionError(message);
      return;
    }
    if (!current.stock || current.availability === "OUT_OF_STOCK") {
      setPurchaseError("Produto esgotado. O estoque foi atualizado agora.");
      return;
    }
    addToCart(current, quantity);
  }

  async function buyOnWhatsApp() {
    if (unavailable) return;
    const destination = window.open("about:blank", "_blank");
    if (!destination) {
      const message = "Permita a abertura de uma nova aba para continuar pelo WhatsApp.";
      setPurchaseError(message);
      reportActionError(message);
      return;
    }
    destination.opener = null;
    setIsChecking(true);
    setPurchaseError("");
    const current = await refreshProduct(product.id);
    setIsChecking(false);
    if (!current || !current.stock || current.availability === "OUT_OF_STOCK") {
      destination.close();
      const message = current ? "Produto esgotado. O estoque foi atualizado agora." : "Não foi possível confirmar o estoque. Tente novamente.";
      setPurchaseError(message);
      reportActionError(message);
      return;
    }
    if (quantity > current.stock) {
      destination.close();
      setQuantity(current.stock);
      const message = "O estoque foi atualizado. Confira a quantidade antes de continuar.";
      setPurchaseError(message);
      reportActionError(message);
      return;
    }
    const message = createProductWhatsAppMessage(current, quantity, window.location.href);
    destination.location.href = createWhatsAppUrl(message);
  }

  return (
    <div className="product-purchase-panel">
      {!unavailable && <QuantityControl label={product.name} quantity={quantity} onChange={setQuantity} maximum={product.stock} />}
      {product.stock !== undefined && product.stock > 0 && <p className="stock-hint">Disponibilidade limitada a {product.stock} {product.stock === 1 ? "unidade" : "unidades"}.</p>}
      {unavailable ? (
        <p className="unavailable-notice" role="status">Produto indisponível no momento.</p>
      ) : (
        <div className="purchase-actions">
          <button className="button button-primary purchase-add" type="button" disabled={isChecking} onClick={addCurrentProduct}>
            Adicionar ao carrinho <ArrowRightIcon width={17} height={17} />
          </button>
          <button className="button button-whatsapp" type="button" disabled={isChecking} onClick={buyOnWhatsApp}>
            <ChatIcon width={18} height={18} /> Comprar pelo WhatsApp
          </button>
        </div>
      )}
      <FavoriteButton productId={product.id} productName={product.name} />
      <p className="action-feedback" aria-live="polite" role={purchaseError || actionFeedback?.kind === "error" ? "alert" : "status"}>{purchaseError || actionFeedback?.message || persistenceError || (isChecking ? "Confirmando estoque…" : "")}</p>
      <p className="purchase-note">Finalize seu pedido diretamente com a loja pelo WhatsApp. Nenhum pagamento é processado neste site.</p>
    </div>
  );
}
