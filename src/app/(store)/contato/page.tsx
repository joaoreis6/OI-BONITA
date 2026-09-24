import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ChatIcon, InstagramIcon, TruckIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Oi, Bonita! pelo WhatsApp ou Instagram. Envios para todo o Brasil.",
  alternates: { canonical: "/contato" },
};

export default function ContactPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <p className="eyebrow">Estamos por aqui</p>
        <h1>Contato</h1>
        <p>Tire dúvidas, faça seu pedido ou acompanhe as novidades da loja.</p>
      </section>
      <section className="container catalog-section">
        <div className="hero-buttons">
          <a className="button button-primary" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
            <ChatIcon width={18} height={18} /> WhatsApp
          </a>
          <a className="button button-outline" href={siteConfig.instagram} target="_blank" rel="noreferrer">
            <InstagramIcon width={18} height={18} /> Instagram {siteConfig.instagramHandle}
          </a>
        </div>
        <div className="benefit-row" aria-label="Informações de contato">
          <div className="benefit"><span>Local: {siteConfig.location}</span></div>
          <div className="benefit"><TruckIcon className="benefit-icon" width={24} height={24} /><span>{siteConfig.shippingText}</span></div>
          <div className="benefit"><span>Responsável: {siteConfig.owner}</span></div>
        </div>
        <p className="section-intro">
          Pedidos são finalizados pelo WhatsApp. Não há checkout online neste site — você revisa os itens no carrinho e envia a mensagem pronta para a loja.
        </p>
        <div className="category-page-links">
          <Link className="text-link" href="/catalogo">Explorar catálogo <ArrowRightIcon width={17} height={17} /></Link>
          <Link className="text-link" href="/sobre">Sobre a loja <ArrowRightIcon width={17} height={17} /></Link>
        </div>
      </section>
    </main>
  );
}
