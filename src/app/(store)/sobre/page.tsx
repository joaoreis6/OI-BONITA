import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ChatIcon, InstagramIcon, TruckIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Conheça a Oi, Bonita! — boutique em Quatiguá, Paraná, com joias, semijoias, cosméticos e acessórios.",
  alternates: { canonical: "/sobre" },
};

export default function AboutPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <p className="eyebrow">Nossa história</p>
        <h1>Sobre a {siteConfig.name}</h1>
        <p>Uma boutique em {siteConfig.location}, com uma seleção especial de joias, semijoias, cosméticos e acessórios.</p>
      </section>
      <section className="container catalog-section">
        <div className="editorial-copy">
          <p className="eyebrow">Oi, Bonita!</p>
          <h2 className="section-title">Pequenos detalhes, grandes momentos.</h2>
          <p>
            A {siteConfig.name} nasceu para celebrar o brilho de cada pessoa — com peças escolhidas com carinho,
            atendimento próximo e a sensibilidade de uma boutique premium.
          </p>
          <p>
            Por trás da marca está {siteConfig.owner}, em {siteConfig.location}, reunindo Prata 925, semijoias,
            perfumes, cosméticos, óculos e acessórios para acompanhar o seu estilo no dia a dia.
          </p>
        </div>
        <div className="benefit-row" aria-label="Diferenciais da loja">
          <div className="benefit"><TruckIcon className="benefit-icon" width={24} height={24} /><span>{siteConfig.shippingText}</span></div>
          <div className="benefit"><ChatIcon className="benefit-icon" width={23} height={23} /><span>Atendimento pelo WhatsApp</span></div>
          <div className="benefit"><InstagramIcon className="benefit-icon" width={23} height={23} /><span>Novidades no Instagram</span></div>
        </div>
        <div className="category-page-links">
          <Link className="button button-primary" href="/catalogo">Ver catálogo <ArrowRightIcon width={17} height={17} /></Link>
          <Link className="text-link" href="/contato">Fale conosco <ArrowRightIcon width={17} height={17} /></Link>
        </div>
      </section>
    </main>
  );
}
