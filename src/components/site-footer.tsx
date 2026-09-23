import Image from "next/image";
import Link from "next/link";
import { brandAssets } from "@/config/brand";
import type { Category } from "@/schemas/catalog";
import { siteConfig } from "@/config/site";

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Link href="/" aria-label={`${siteConfig.name} — página inicial`}>
              <Image className="footer-brand" src={brandAssets.logo} alt="" width={1254} height={1254} />
            </Link>
            <p className="footer-about">Uma boutique em Quatiguá, Paraná, com uma seleção especial de joias, semijoias, cosméticos e acessórios.</p>
          </div>
          <div>
            <h2 className="footer-heading">Explore</h2>
            <nav className="footer-links" aria-label="Links do rodapé">
              <Link href="/">Início</Link>
              <Link href="/catalogo">Catálogo</Link>
              <Link href="/#categorias">Categorias</Link>
            </nav>
          </div>
          <div>
            <h2 className="footer-heading">Categorias</h2>
            <nav className="footer-links" aria-label="Categorias no rodapé">
              {categories.map((category) => <Link key={category.id} href={`/categoria/${category.slug}`}>{category.name}</Link>)}
            </nav>
          </div>
          <div>
            <h2 className="footer-heading">Fale com a gente</h2>
            <div className="footer-links">
              <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
              <a href={siteConfig.instagram} target="_blank" rel="noreferrer">Instagram {siteConfig.instagramHandle}</a>
              <span>{siteConfig.location}</span>
              <span>{siteConfig.shippingText}</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {siteConfig.name} Todos os direitos reservados.</span>
          <span>{siteConfig.location} · {siteConfig.shippingText}</span>
        </div>
      </div>
    </footer>
  );
}
