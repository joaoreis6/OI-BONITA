import Image from "next/image";
import Link from "next/link";
import { CategoryCard } from "@/components/category-card";
import { ProductGrid } from "@/components/product-grid";
import { ArrowRightIcon, ChatIcon, InstagramIcon, SparkleIcon, TruckIcon } from "@/components/icons";
import { brandAssets } from "@/config/brand";
import { siteConfig } from "@/config/site";
import { listPublicCategories, listPublicFeaturedProducts } from "@/services/public-catalog-service";
import type { Category, Product } from "@/schemas/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories: Category[] = [];
  let featuredProducts: Product[] = [];
  let catalogError = false;
  try { [categories, featuredProducts] = await Promise.all([listPublicCategories(), listPublicFeaturedProducts()]); }
  catch { catalogError = true; }

  return (
    <main id="main-content">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Detalhes que fazem você brilhar</p>
            <h1 className="display-title">Seu estilo,<br /><em>seu brilho.</em></h1>
            <p className="hero-description">Joias, semijoias, cosméticos e acessórios escolhidos para deixar cada momento ainda mais especial.</p>
            <div className="hero-buttons">
              <Link className="button button-primary" href="/catalogo">Ver catálogo <ArrowRightIcon width={17} height={17} /></Link>
              <a className="button button-outline" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">Falar pelo WhatsApp</a>
            </div>
          </div>
          <figure className="hero-visual" aria-label="Retrato editorial com acessórios da Oi, Bonita!">
            <Image className="hero-photo" src={brandAssets.editorialPortrait} alt="Modelo usando joias douradas da Oi, Bonita!" width={1091} height={1442} priority sizes="(max-width: 760px) 100vw, 52vw" />
            <figcaption className="hero-note">Um toque<br />especial<br />em você</figcaption>
          </figure>
        </div>
      </section>

      <section className="benefits" aria-label="Informações da loja">
        <div className="container benefit-row">
          <div className="benefit"><TruckIcon className="benefit-icon" width={24} height={24} /><span>{siteConfig.shippingText}</span></div>
          <div className="benefit"><ChatIcon className="benefit-icon" width={23} height={23} /><span>Atendimento pelo WhatsApp</span></div>
          <div className="benefit"><SparkleIcon className="benefit-icon" width={23} height={23} /><span>Seleção especial de produtos</span></div>
        </div>
      </section>

      <section className="section" id="categorias">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Encontre o seu estilo</p>
              <h2 className="section-title">Pequenos detalhes,<br />grandes momentos.</h2>
              <p className="section-intro">Explore nossas categorias e descubra o que combina com você.</p>
            </div>
            <Link className="text-link" href="/catalogo">Ver catálogo completo <ArrowRightIcon width={17} height={17} /></Link>
          </div>
          {categories.length > 0 ? <div className="category-grid">{categories.map((category, index) => <CategoryCard key={category.id} category={category} index={index} />)}</div> : <p role={catalogError ? "alert" : undefined}>{catalogError ? "Não foi possível carregar as categorias agora. Tente novamente em instantes." : "Novas categorias estarão disponíveis em breve."}</p>}
        </div>
      </section>

      {(featuredProducts.length > 0 || catalogError) && (
        <section className="section" aria-labelledby="featured-heading">
          <div className="container">
            <div className="section-heading">
              <div><p className="eyebrow">Recém-cadastrados</p><h2 className="section-title" id="featured-heading">Novidades no catálogo</h2></div>
              <Link className="text-link" href="/catalogo">Ver todos <ArrowRightIcon width={17} height={17} /></Link>
            </div>
            {catalogError ? <p role="alert">Não foi possível carregar os produtos agora. Tente novamente em instantes.</p> : <ProductGrid products={featuredProducts} />}
          </div>
        </section>
      )}

      <section className="editorial">
        <div className="container editorial-panel">
          <figure className="editorial-visual" aria-label="Retrato editorial com óculos e acessórios">
            <Image className="editorial-photo" src={brandAssets.editorialEyewear} alt="Modelo usando óculos e acessórios delicados" width={1098} height={1432} loading="lazy" sizes="(max-width: 760px) 90vw, 44vw" />
          </figure>
          <div className="editorial-copy">
            <p className="eyebrow">Oi, Bonita!</p>
            <h2 className="section-title">Seu estilo começa nos detalhes.</h2>
            <p>Descubra peças, acessórios e produtos escolhidos para acompanhar a sua personalidade.</p>
            <Link className="button button-primary" href="/catalogo">Conhecer catálogo <ArrowRightIcon width={17} height={17} /></Link>
          </div>
        </div>
      </section>

      <section className="section instagram-section">
        <div className="container instagram-layout">
          <div className="instagram-copy">
            <p className="eyebrow">Inspiração para o seu dia</p>
            <h2 className="section-title">Vem conhecer a Oi, Bonita! no Instagram</h2>
            <p>Acompanhe a marca e fique por dentro das novidades.</p>
            <a className="text-link" href={siteConfig.instagram} target="_blank" rel="noreferrer"><InstagramIcon width={19} height={19} /> Seguir {siteConfig.instagramHandle} <ArrowRightIcon width={17} height={17} /></a>
          </div>
          <div className="image-composition" aria-label="Fotografias editoriais da Oi, Bonita!">
            <div className="composition-image"><Image src={brandAssets.editorialPortraitAlternate} alt="Retrato editorial com acessórios dourados" width={1089} height={1444} loading="lazy" sizes="(max-width: 760px) 55vw, 35vw" /></div>
            <div className="composition-image"><Image src={brandAssets.editorialEyewear} alt="Retrato editorial com óculos" width={1098} height={1432} loading="lazy" sizes="(max-width: 760px) 40vw, 26vw" /></div>
          </div>
        </div>
      </section>

      <section className="whatsapp-banner">
        <div className="container whatsapp-banner-inner">
          <div><p className="eyebrow">Estamos por aqui</p><h2>Tem alguma dúvida? Vamos conversar.</h2></div>
          <a className="button button-light" href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">Chamar no WhatsApp <ArrowRightIcon width={17} height={17} /></a>
        </div>
      </section>
    </main>
  );
}
