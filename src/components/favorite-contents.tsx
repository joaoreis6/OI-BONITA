"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/product-grid";
import { FlowerIcon, HeartIcon } from "@/components/icons";
import { useFavorites } from "@/hooks/use-favorites";

export function FavoriteContents() {
  const { favoriteIds, publicProducts, isHydrated, persistenceError, catalogError, catalogLoaded } = useFavorites();
  if (!isHydrated) return <div className="cart-loading" role="status" aria-live="polite">Carregando seus favoritos…</div>;
  if (favoriteIds.length > 0 && !catalogLoaded && !catalogError) return <div className="cart-loading" role="status" aria-live="polite">Carregando seus favoritos…</div>;
  if (favoriteIds.length > 0 && catalogError) return <section className="empty-state" role="alert"><h2>Não foi possível carregar os favoritos.</h2><p>Seus itens continuam salvos neste navegador. Tente novamente mais tarde.</p><Link className="button button-primary" href="/catalogo">Voltar ao catálogo</Link></section>;

  const favoriteProducts = publicProducts.filter((product) => favoriteIds.includes(product.id) && product.active);
  if (favoriteProducts.length === 0) {
    return (
      <section className="empty-state" aria-live="polite">
        <span className="empty-state-mark"><FlowerIcon width={24} height={24} /></span>
        <h2>{favoriteIds.length > 0 ? "Seus favoritos não estão mais disponíveis." : "Você ainda não salvou nenhum favorito."}</h2>
        <p>{favoriteIds.length > 0 ? "Os produtos salvos não estão publicados no catálogo neste momento." : "Toque no coração de um produto para encontrá-lo aqui depois."}</p>
        <Link className="button button-primary" href="/catalogo">Explorar catálogo <HeartIcon width={17} height={17} /></Link>
        {persistenceError && <p className="storage-warning" role="status">{persistenceError}</p>}
        {catalogError && <p className="storage-warning" role="alert">Não foi possível carregar os favoritos agora. Tente novamente.</p>}
      </section>
    );
  }

  return <><ProductGrid products={favoriteProducts} />{persistenceError && <p className="storage-warning" role="status">{persistenceError}</p>}{catalogError && <p className="storage-warning" role="alert">Não foi possível atualizar os favoritos agora. Tente novamente.</p>}</>;
}
