import type { Metadata } from "next";
import { FavoriteContents } from "@/components/favorite-contents";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Produtos que você salvou nos favoritos da Oi, Bonita!.",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <main id="main-content" className="container utility-page">
      <header className="utility-page-heading"><p className="eyebrow">Seus escolhidos</p><h1 className="section-title">Favoritos</h1></header>
      <FavoriteContents />
    </main>
  );
}
