"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brandAssets } from "@/config/brand";
import { siteConfig } from "@/config/site";
import { ChatIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, ShoppingBagIcon } from "@/components/icons";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";

const navigation = [
  { label: "Início", href: "/" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Categorias", href: "/#categorias" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartSummary } = useCart();
  const { favoriteIds } = useFavorites();

  function renderLinks(className: string) {
    return navigation.map((item) => (
      <Link
        key={item.label}
        className={className}
        href={item.href}
        aria-current={pathname === item.href ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
      >
        {item.label}
      </Link>
    ));
  }

  return (
    <>
      <div className="announcement">✦ &nbsp; {siteConfig.shippingText} &nbsp; ✦</div>
      <header className="site-header">
        <div className="container header-inner">
          <nav className="desktop-nav" aria-label="Navegação principal">
            {renderLinks("nav-link")}
          </nav>
          <div className="header-menu-wrap">
            <button
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="mobile-menu-button"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <CloseIcon width={20} height={20} /> : <MenuIcon width={21} height={21} />}
            </button>
            {menuOpen && (
              <nav id="mobile-navigation" className="mobile-nav" aria-label="Navegação móvel">
                {renderLinks("nav-link")}
              </nav>
            )}
          </div>
          <Link className="brand-link" href="/" aria-label={`${siteConfig.name} — página inicial`}>
            <Image className="brand-logo" src={brandAssets.logo} alt="" width={1254} height={1254} priority />
          </Link>
          <div className="header-actions">
            <Link className="header-icon" href="/catalogo" aria-label="Pesquisar no catálogo">
              <SearchIcon width={17} height={17} />
              <span>Pesquisar</span>
            </Link>
            <Link className="header-icon" href="/favoritos" aria-label={`Favoritos${favoriteIds.length ? `, ${favoriteIds.length} produtos` : ""}`}>
              <HeartIcon width={18} height={18} />
              <span>Favoritos</span>
              {favoriteIds.length > 0 && <span className="header-count">{favoriteIds.length}</span>}
            </Link>
            <Link className="header-icon" href="/carrinho" aria-label={`Carrinho${cartSummary.itemCount ? `, ${cartSummary.itemCount} itens` : ""}`}>
              <ShoppingBagIcon width={18} height={18} />
              <span>Carrinho</span>
              {cartSummary.itemCount > 0 && <span className="header-count">{cartSummary.itemCount}</span>}
            </Link>
            <a className="button button-primary header-whatsapp" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer" aria-label="Falar com a Oi, Bonita! pelo WhatsApp">
              <ChatIcon width={17} height={17} />
              <span>Fale com a gente</span>
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
